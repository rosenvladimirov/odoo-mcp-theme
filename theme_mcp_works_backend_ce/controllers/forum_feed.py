# Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
"""
Backend proxy for the Odoo help forum.

The empty-desktop client action calls /mcp/forum_feed every ~15 minutes
to refresh its post stream. www.odoo.com has no RSS endpoint
(/forum/help-1.rss → 404), so we scrape the listing page HTML and
return a normalized JSON list. Server-side cache for 14 minutes keeps
traffic to odoo.com sane.
"""

import logging
import re
import time
from html import unescape

import requests
from lxml import html as lxml_html

from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)

FORUM_BASE_URL = "https://www.odoo.com"
FORUM_LISTING_URL = "https://www.odoo.com/forum/help-1?o=newest"
CACHE_TTL_SECONDS = 14 * 60       # 14 min — slightly under the 15-min poll
CACHE_KEY = "_mcp_forum_feed_cache"
HTTP_TIMEOUT = 10
MAX_POSTS = 20          # listing rows we keep
DETAIL_FETCH_LIMIT = 20 # how many of those we go fetch the full thread for
EXCERPT_MAX_CHARS = 320
REPLY_MAX_CHARS = 600   # per-reply cap inside the thread


def _clean(text):
    if not text:
        return ""
    return re.sub(r"\s+", " ", unescape(text)).strip()


def _parse_listing(html_text):
    """Parse the forum listing HTML into a list of post dicts."""
    posts = []
    seen_urls = set()
    try:
        tree = lxml_html.fromstring(html_text)
    except Exception as e:
        _logger.warning("[mcp forum_feed] HTML parse failed: %s", e)
        return posts

    # Each post row carries an anchor like:
    #   <a class="stretched-link text-body text-decoration-none"
    #      href="/forum/help-1/<slug-id>"
    #      title="Read: <Title>">
    for a in tree.cssselect("a.stretched-link[href*='/forum/help-1/']"):
        href = a.get("href") or ""
        title_attr = a.get("title") or ""
        if not href or "/forum/help-1/" not in href:
            continue
        if href in seen_urls:
            continue
        seen_urls.add(href)

        title = title_attr
        if title.lower().startswith("read:"):
            title = title[len("read:"):].strip()
        if not title:
            title = _clean(a.text_content())
        if not title:
            continue

        # Walk up to the row container to pick up author / excerpt / date
        row = a
        for _ in range(6):
            if row is None:
                break
            row = row.getparent()
            if row is not None and row.tag in ("article", "li", "div") and len(row) > 1:
                # Found a reasonable container
                break

        excerpt = ""
        author = ""
        pub_date = ""
        if row is not None:
            # Excerpt — first non-empty muted/text-body block beyond the title link
            for el in row.cssselect(".text-muted, p, .o_wforum_excerpt"):
                txt = _clean(el.text_content())
                if txt and txt != title and len(txt) > 30:
                    excerpt = txt[:280] + ("…" if len(txt) > 280 else "")
                    break
            # Author — links to /odoo/contactus or /forum/.../user/...
            for el in row.cssselect("a[href*='/forum/'][href*='/user/'], .o_wforum_post_author"):
                author = _clean(el.text_content())
                if author:
                    break
            # Date — typically inside a <time> or .text-muted small
            for el in row.cssselect("time, .o_wforum_post_date"):
                pub_date = el.get("datetime") or _clean(el.text_content())
                if pub_date:
                    break

        posts.append({
            "title": title,
            "url": FORUM_BASE_URL + href if href.startswith("/") else href,
            "excerpt": excerpt,
            "author": author,
            "pub_date": pub_date,
        })
        if len(posts) >= MAX_POSTS:
            break

    return posts


def _truncate(txt, limit):
    if not txt:
        return ""
    if len(txt) <= limit:
        return txt
    return txt[:limit].rsplit(" ", 1)[0] + "…"


def _fetch_post_thread(session, url):
    """
    Visit a post page and pull the full thread:
      - excerpt (first .o_wforum_post_content = the question)
      - replies (every .o_wforum_post_content, with author + content)

    Walks each .o_wforum_post_content block, climbs back up to the
    surrounding row to grab the author name when available. Falls back
    to anonymous if the structure isn't what we expect.
    """
    excerpt = ""
    replies = []
    try:
        resp = session.get(url, timeout=HTTP_TIMEOUT)
        resp.raise_for_status()
        tree = lxml_html.fromstring(resp.text)
        blocks = tree.cssselect(".o_wforum_post_content")

        for idx, block in enumerate(blocks):
            content = _clean(block.text_content())
            if not content:
                continue

            # Walk up to find the author. Author lives in
            # .o_wforum_author_box anchor → text(); fall back to "—".
            author = ""
            row = block
            for _ in range(6):
                row = row.getparent()
                if row is None:
                    break
                author_el = row.cssselect(".o_wforum_author_box a, .o_wforum_post_author")
                if author_el:
                    author = _clean(author_el[0].text_content())
                    if author:
                        break

            kind = "question" if idx == 0 else "reply"
            replies.append({
                "kind": kind,
                "author": author,
                "content": _truncate(content, REPLY_MAX_CHARS),
            })

            if idx == 0:
                excerpt = _truncate(content, EXCERPT_MAX_CHARS)

    except Exception as e:
        _logger.debug("[mcp forum_feed] thread fetch failed for %s: %s", url, e)

    return excerpt, replies


class McpForumFeed(http.Controller):

    @http.route("/mcp/forum_feed", type="json", auth="user")
    def forum_feed(self):
        """
        Returns the latest Odoo help-forum posts as JSON, including the
        opening paragraph from each post page. Cached server-side for
        ~14 minutes so heavy click-spamming doesn't hammer odoo.com.
        First fetch pays N+1 round-trips; subsequent ones (within TTL)
        are instant.
        """
        now = time.time()
        cache = getattr(request.env.registry, CACHE_KEY, None)
        if cache and (now - cache.get("ts", 0) < CACHE_TTL_SECONDS):
            return cache["data"]

        posts = []
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (MCP-Works-Theme/1.0; +desktop-feed)",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9",
        })

        try:
            resp = session.get(FORUM_LISTING_URL, timeout=HTTP_TIMEOUT)
            resp.raise_for_status()
            posts = _parse_listing(resp.text)
        except Exception as e:
            _logger.warning("[mcp forum_feed] listing fetch failed: %s", e)

        # Pull each post's full thread (question + replies) for the top
        # N posts, so the accordion has something to expand into.
        for i, post in enumerate(posts[:DETAIL_FETCH_LIMIT]):
            try:
                excerpt, thread = _fetch_post_thread(session, post["url"])
                if excerpt:
                    posts[i]["excerpt"] = excerpt
                if thread:
                    posts[i]["thread"] = thread
            except Exception as e:
                _logger.debug("[mcp forum_feed] thread fail %s: %s", post.get("url"), e)

        result = {
            "ok": bool(posts),
            "fetched_at": int(now),
            "posts": posts,
        }
        try:
            request.env.registry._mcp_forum_feed_cache = {
                "ts": now,
                "data": result,
            }
        except Exception:
            pass
        return result

/** @odoo-module **/

import { Component, useState, onWillStart, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { rpc } from "@web/core/network/rpc";

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;     // 15 minutes
const FEED_URL = "/mcp/forum_feed";

/**
 * MCP Works — Empty Desktop client action.
 *
 * Renders the Odoo help-forum stream as a stagger-revealed feed inside
 * .o_action_manager. Triggered by the "Show Desktop" systray button.
 *
 * Posts fetched server-side via /mcp/forum_feed (Python controller in
 * controllers/forum_feed.py — proxies + parses the RSS, caches 14 min).
 * Refreshes every 15 minutes via setInterval.
 */
export class McpEmptyDesktop extends Component {
    static template = "theme_mcp_works_backend.McpEmptyDesktop";
    static props = ["*"];

    setup() {
        this.state = useState({
            posts: [],
            loading: true,
            error: null,
            fetchedAt: 0,
            expanded: {},   // url → bool (which threads are open)
        });

        onWillStart(async () => {
            await this._loadFeed();
        });

        /* Poll every 15 minutes while the empty desktop is mounted */
        this._timer = setInterval(() => this._loadFeed(), REFRESH_INTERVAL_MS);

        onWillUnmount(() => {
            if (this._timer) clearInterval(this._timer);
            this._timer = null;
        });
    }

    toggleExpand(post, ev) {
        if (ev) ev.preventDefault();
        this.state.expanded[post.url] = !this.state.expanded[post.url];
    }

    isExpanded(post) {
        return !!this.state.expanded[post.url];
    }

    async _loadFeed() {
        try {
            const data = await rpc(FEED_URL, {});
            this.state.posts = (data && data.posts) || [];
            this.state.fetchedAt = (data && data.fetched_at) || Math.floor(Date.now() / 1000);
            this.state.error = null;
        } catch (e) {
            console.warn("[McpEmptyDesktop] forum feed fetch failed", e);
            this.state.error = String(e && e.message || e);
        } finally {
            this.state.loading = false;
        }
    }

    onPostClick(post, ev) {
        /* Let the browser open it in a new tab — target=_blank in template */
        if (!post || !post.url) {
            ev.preventDefault();
        }
    }

    formatDate(rawDate) {
        if (!rawDate) return "";
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return rawDate;
        return d.toLocaleDateString(undefined, {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        });
    }
}

registry.category("actions").add("mcp_empty_desktop", McpEmptyDesktop);

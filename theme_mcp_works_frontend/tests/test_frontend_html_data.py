# Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
"""Доставката на пресета до <html> на сайта (PLAN §2.2–2.4, §5.4)."""

import ast
import os
from unittest.mock import patch

from odoo.tests import HttpCase, TransactionCase, tagged

MODE_KEY = "theme_mcp_works_frontend.site_mode"
EVIL = {
    "--mcp-bg": "red;background:url(x)",
    "--mcp-ink": "</style><script>alert(1)</script>",
    "--mcp-rule": '"><script>alert(1)</script>',
    "--mcp-surface": "expression(alert(1))",
    "--mcp-surface-2": "#fff /* x */",
    "--mcp-ink-2": "image-set(x)",
    "--evil": "#fff",
    "--mcp-accent": "#5D8DA8",
}


@tagged("post_install", "-at_install")
class TestFrontendHtmlData(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.icp = cls.env["ir.config_parameter"].sudo()
        cls.http = cls.env["ir.http"]
        cls.icp.set_param(MODE_KEY, "follow")

    def _patched_theme(self, theme):
        # имитира трети модул, който е наследил hook-а без валидация
        return patch.object(
            type(self.http), "_mcp_frontend_theme", lambda self_: theme)

    # ── валидаторът (CORE) ──────────────────────────────────────────────
    def test_validator_accepts(self):
        check = self.http._mcp_css_value_check
        for key, value in [
            ("--mcp-accent", "#5D8DA8"),
            ("--mcp-accent", "#abc"),
            ("--mcp-rule", "rgba(17,24,39,0.10)"),
            ("--mcp-rule", "rgb(17 24 39 / 10%)"),
            ("--mcp-ink", "hsl(210, 20%, 10%)"),
            ("--mcp-x", "color-mix(in srgb, var(--mcp-accent) 25%, transparent)"),
            ("--mcp-x", "var(--mcp-accent)"),
            ("--mcp-x", "12px"),
            ("--mcp-x", "-1.5rem"),
            ("--mcp-x", "calc(16px * var(--mcp-font-scale))"),
            ("--mcp-x", "0 1px 3px rgba(0, 0, 0, .1), 0 0 0 4px #fff"),
            ("--mcp-x", "transparent"),
            ("--mcp-x", "currentColor"),
            ("--mcp-radius-scale", "2"),
            ("--mcp-radius-scale", 0),
            ("--mcp-font-scale", "1.25"),
        ]:
            self.assertTrue(check(key, value), "%s: %s" % (key, value))

    def test_validator_rejects(self):
        check = self.http._mcp_css_value_check
        for key, value in [
            ("--mcp-bg", "red;background:url(x)"),
            ("--mcp-bg", "</style>"),
            ("--mcp-bg", '"><script>'),
            ("--mcp-bg", "url(x)"),
            ("--mcp-bg", "expression(alert(1))"),
            ("--mcp-bg", "#fff /* x */"),
            ("--mcp-bg", "image-set(a)"),
            ("--mcp-bg", "@media"),
            ("--mcp-bg", "a\\62"),
            ("--mcp-bg", "red"),
            ("--mcp-bg", "#" + "f" * 300),
            ("--mcp-bg", ""),
            ("--mcp-bg", True),
            ("--mcp-bg", None),
            ("--mcp-bg", "rgba(0,0,0"),
            ("--mcp-bg", "var(--other)"),
            ("--other", "#fff"),
            ("--mcp-BG", "#fff"),
            ("--mcp-" + "a" * 49, "#fff"),
            ("--mcp-radius-scale", "5"),
            ("--mcp-radius-scale", "x"),
            ("--mcp-font-scale", "0.5"),
        ]:
            self.assertFalse(check(key, value), "%s: %r" % (key, value))

    # ── html_data ───────────────────────────────────────────────────────
    def test_injection_is_dropped(self):
        theme = {"attrs": {"data-mcp-font": "inter", "onload": "x"}, "vars": EVIL}
        with self._patched_theme(theme), self.assertLogs(
                "odoo.addons.theme_mcp_works_backend.models.ir_http",
                level="WARNING") as logs:
            data = self.http._mcp_frontend_html_data({"lang": "en-US"})
        self.assertEqual(data["style"], "--mcp-accent: #5D8DA8;")
        self.assertNotIn("onload", data)
        self.assertEqual(data["data-mcp-font"], "inter")
        # в лога е ключът, но не и стойността
        joined = "\n".join(logs.output)
        self.assertIn("--mcp-bg", joined)
        self.assertNotIn("script", joined)
        self.assertNotIn("url(", joined)

    def test_style_is_merged(self):
        theme = {"attrs": {}, "vars": {"--mcp-accent": "#5D8DA8", "--mcp-radius-scale": "2"}}
        with self._patched_theme(theme):
            data = self.http._mcp_frontend_html_data({"style": "height: 100%"})
        self.assertEqual(
            data["style"], "height: 100%; --mcp-accent: #5D8DA8; --mcp-radius-scale: 2;")
        self.assertEqual(data["data-mcp-site"], "follow")

    def test_original_is_not_mutated(self):
        original = {"lang": "en-US", "data-website-id": 1}
        snapshot = dict(original)
        data = self.http._mcp_frontend_html_data(original)
        self.assertEqual(original, snapshot)
        self.assertIsNot(data, original)
        self.assertEqual(data["lang"], "en-US")
        self.assertEqual(data["data-website-id"], 1)

    def test_none_html_data(self):
        data = self.http._mcp_frontend_html_data(None)
        self.assertEqual(data["data-mcp-site"], "follow")
        self.assertIn(data["data-mcp-font"],
                      {"system", "inter", "plex", "golos", "grotesk"})

    def test_off_returns_identical_dict(self):
        self.icp.set_param(MODE_KEY, "off")
        original = {"lang": "en-US", "style": "height: 100%;"}
        self.assertIs(self.http._mcp_frontend_html_data(original), original)
        self.assertIsNone(self.http._mcp_frontend_html_data(None))

    def test_default_and_unknown_mode_follow(self):
        self.icp.search([("key", "=", MODE_KEY)]).unlink()
        self.assertEqual(self.http._mcp_frontend_site_mode(), "follow")
        self.icp.set_param(MODE_KEY, "bogus")
        self.assertEqual(self.http._mcp_frontend_site_mode(), "follow")

    def test_core_font_is_whitelisted(self):
        self.icp.set_param("theme_mcp_works_backend.ui_font", "evil\" onload=\"x")
        if "mcp.theme.config" in self.env:
            # конфигураторът чете същия ключ и също го отхвърля
            self.assertNotIn(
                "data-mcp-font",
                self.env["mcp.theme.config"]._mcp_frontend_config()["attrs"])
        theme = self.env["ir.http"]._mcp_frontend_theme()
        self.assertEqual(theme["attrs"]["data-mcp-font"], "system")

    # ── конфигураторът (ако е инсталиран): фирмени стойности + производни ──
    def test_config_company_values_and_derived(self):
        if "mcp.theme.config" not in self.env:
            self.skipTest("theme_mcp_works_backend_config is not installed")
        prefix = "theme_mcp_works_backend."
        self.icp.set_param(prefix + "cfg.accent", "#5D8DA8")
        self.icp.set_param(prefix + "cfg.mode", "dark")
        self.icp.set_param(prefix + "cfg.radius_scale", "9")       # извън обхвата
        self.icp.set_param(prefix + "ui_font", "inter")
        self.icp.set_param(
            prefix + "cfg.advanced",
            '{"--mcp-bg": "red;x:url(y)", "--mcp-ink": "#111827", "--x": "#fff", "--mcp-ok": true}')
        data = self.http._mcp_frontend_html_data({})
        self.assertEqual(data["data-mcp-mode"], "dark")
        self.assertEqual(data["data-mcp-font"], "inter")
        style = data["style"]
        self.assertIn("--mcp-accent: #5D8DA8;", style)
        self.assertIn("--mcp-accent-rgb: 93, 141, 168;", style)
        self.assertIn("--mcp-accent-dark: #44677b;", style)
        self.assertIn("--mcp-accent-dark-rgb: 68, 103, 123;", style)
        self.assertIn("--mcp-link-rgb: 93, 141, 168;", style)
        # D4: в тъмен режим светлото мастило от advanced не стига до сайта
        self.assertNotIn("--mcp-ink:", style)
        # #5D8DA8 с бяло е под 4.5 → текстът върху акцента е мастилото по
        # подразбиране (#0a1628), защото advanced не го подава
        self.assertIn("--mcp-on-accent: #0a1628;", style)
        # D2: hover фонът #44677b носи бяло (6.05:1)
        self.assertIn("--mcp-on-accent-dark: #ffffff;", style)
        self.assertNotIn("--mcp-radius-scale", style)
        self.assertNotIn("--mcp-bg", style)
        self.assertNotIn("--mcp-ok", style)
        self.assertNotIn("--x:", style)

    def test_config_light_keeps_advanced_neutrals(self):
        if "mcp.theme.config" not in self.env:
            self.skipTest("theme_mcp_works_backend_config is not installed")
        prefix = "theme_mcp_works_backend."
        self.icp.set_param(prefix + "cfg.accent", "#5D8DA8")
        self.icp.set_param(prefix + "cfg.mode", "light")
        self.icp.set_param(
            prefix + "cfg.advanced",
            '{"--mcp-bg": "#f8f9fa", "--mcp-ink": "#111827", "--mcp-link": "#336699"}')
        style = self.http._mcp_frontend_html_data({})["style"]
        self.assertIn("--mcp-bg: #f8f9fa;", style)
        self.assertIn("--mcp-ink: #111827;", style)
        self.assertIn("--mcp-on-accent: #111827;", style)
        self.assertIn("--mcp-on-accent-dark: #ffffff;", style)
        self.assertIn("--mcp-link-rgb: 51, 102, 153;", style)
        # D4 пропуска само неутралите: --mcp-link стига и в тъмен режим
        self.icp.set_param(prefix + "cfg.mode", "dark")
        style = self.http._mcp_frontend_html_data({})["style"]
        self.assertIn("--mcp-link: #336699;", style)
        self.assertNotIn("--mcp-bg:", style)

    def test_config_light_link_contrast(self):
        if "mcp.theme.config" not in self.env:
            self.skipTest("theme_mcp_works_backend_config is not installed")
        prefix = "theme_mcp_works_backend."
        self.icp.set_param(prefix + "cfg.accent", "#5D8DA8")
        self.icp.set_param(prefix + "cfg.mode", "light")
        self.icp.set_param(prefix + "cfg.advanced", '{"--mcp-bg": "#f8f9fa"}')
        style = self.http._mcp_frontend_html_data({})["style"]
        # #5D8DA8 върху #f8f9fa е 3.41:1 → линкът е accent-dark (5.8:1)
        self.assertIn("--mcp-link: #44677b;", style)
        self.assertIn("--mcp-link-rgb: 68, 103, 123;", style)
        self.assertIn("--mcp-link-hover: #334e5c;", style)
        # тъмен акцент стига контраста сам → линкът остава акцентът
        self.icp.set_param(prefix + "cfg.accent", "#1F4E79")
        style = self.http._mcp_frontend_html_data({})["style"]
        self.assertNotIn("--mcp-link:", style)
        self.assertIn("--mcp-link-rgb: 31, 78, 121;", style)
        # в тъмен режим правилото не важи
        self.icp.set_param(prefix + "cfg.accent", "#5D8DA8")
        self.icp.set_param(prefix + "cfg.mode", "dark")
        style = self.http._mcp_frontend_html_data({})["style"]
        self.assertNotIn("--mcp-link:", style)

    def test_config_is_company_only(self):
        if "mcp.theme.config" not in self.env:
            self.skipTest("theme_mcp_works_backend_config is not installed")
        self.icp.set_param("theme_mcp_works_backend.cfg.accent", "#5D8DA8")
        user = self.env["res.users"].create({
            "name": "MCP FE user", "login": "mcp_fe_user",
            "group_ids": [(6, 0, [self.env.ref("base.group_user").id])],
        })
        settings = self.env["res.users.settings"].sudo()._find_or_create_for_user(user)
        settings.write({"mcp_cfg_follow_company": False, "mcp_cfg_accent": "#ff0000"})
        data = self.http.with_user(user)._mcp_frontend_html_data({})
        self.assertIn("--mcp-accent: #5D8DA8;", data["style"])

    # ── манифестът: нищо в бекенда (PLAN §5.4) ──────────────────────────
    def test_manifest_assets_keys(self):
        path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "__manifest__.py")
        with open(path, encoding="utf-8") as f:
            manifest = ast.literal_eval(f.read())
        self.assertEqual(
            set(manifest["assets"]), {"web.assets_frontend", "portal.assets_chatter_style"})
        self.assertEqual(manifest["category"], "Website/Website")
        self.assertEqual(manifest["excludes"], ["theme_mcp_works"])
        frontend = manifest["assets"]["web.assets_frontend"]
        self.assertTrue(frontend[-1].endswith("/dark.scss"))
        self.assertLess(frontend.index(next(a for a in frontend if a.endswith("/tokens.scss"))),
                        frontend.index(next(a for a in frontend if a.endswith("/fe_tokens.scss"))))


@tagged("post_install", "-at_install")
class TestFrontendRender(HttpCase):

    def test_pages_carry_preset(self):
        icp = self.env["ir.config_parameter"].sudo()
        icp.set_param(MODE_KEY, "follow")
        icp.set_param("theme_mcp_works_backend.ui_font", "inter")
        for url in ("/", "/web/login"):
            html = self.url_open(url).text
            head = html[html.index("<html"):html.index(">", html.index("<html")) + 1]
            self.assertIn('data-mcp-site="follow"', head, url)
            self.assertIn('data-mcp-font="inter"', head, url)
            # website.layout е приложен преди нас: езикът и уебсайтът са там
            self.assertIn("lang=", head, url)
            self.assertIn("data-website-id=", head, url)
        icp.set_param(MODE_KEY, "off")
        html = self.url_open("/").text
        head = html[html.index("<html"):html.index(">", html.index("<html")) + 1]
        self.assertNotIn("data-mcp-", head)

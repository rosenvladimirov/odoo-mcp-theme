# Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Theme MCP Works",
    "description": "Editorial 'paper' theme for the MCP Works platform — OKLCH paper/ink palette, Geist + Instrument Serif + JetBrains Mono fonts, snippets for ticker, hero+terminal, tool catalog.",
    "version": "19.0.1.0.0",
    "category": "Theme/Specialized",
    "summary": "MCP Works editorial theme — paper palette, Geist/Instrument Serif/JetBrains Mono",
    "author": "Rosen Vladimirov, BL Consulting",
    "maintainers": ["rosen-vladimirov"],
    "website": "https://www.mcpworks.net",
    "license": "AGPL-3",
    "depends": ["website"],
    "data": [
        "views/assets.xml",
        "views/snippets/s_mcp_ticker.xml",
        "views/snippets/s_mcp_hero.xml",
        "views/snippets/s_mcp_lang_switcher.xml",
        "views/header_lang_switcher.xml",
    ],
    "assets": {
        # NOTE: primary_variables.scss intentionally NOT loaded — it set
        # $o-color-palettes-name globally which leaked our paper palette into
        # Odoo's Website Builder chrome and made snippet panels invisible.
        # We use CSS custom properties (--mcp-paper, --mcp-ink, ...) instead.
        "web.assets_frontend": [
            "theme_mcp_works/static/src/scss/theme.scss",
            "theme_mcp_works/static/src/scss/snippets.scss",
        ],
    },
    "images": [
        "static/description/theme.png",
    ],
    "installable": True,
    "application": False,
    "auto_install": False,
}

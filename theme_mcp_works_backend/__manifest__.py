# Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Theme MCP Works — Backend (Robot style)",
    "summary": "Independent hi-tech minimalist Odoo CE backend — robot "
               "theme, electric sapphire accents, sharp corners, "
               "light/dark mode, vertical Dash dock",
    "version": "19.0.1.38.0",
    "category": "Themes/Backend",
    "author": "Rosen Vladimirov, BL Consulting",
    "maintainers": ["rosen-vladimirov"],
    "website": "https://www.mcpworks.net",
    "license": "AGPL-3",
    "depends": ["web"],
    "excludes": ["web_enterprise"],
    "data": [],
    "assets": {
        # SCSS build-time variables
        "web._assets_primary_variables": [
            (
                "after",
                "web/static/src/scss/primary_variables.scss",
                "theme_mcp_works_backend/static/src/scss/variables.scss",
            ),
        ],
        "web.assets_backend": [
            # ── 0. Self-hosted webfonts (must precede token refs) ──────
            "theme_mcp_works_backend/static/src/scss/fonts.scss",

            # ── 1. Runtime design tokens ───────────────────────────────
            "theme_mcp_works_backend/static/src/scss/tokens.scss",

            # ── 2. Layout foundation ───────────────────────────────────
            "theme_mcp_works_backend/static/src/scss/layout.scss",
            "theme_mcp_works_backend/static/src/scss/navbar.scss",
            "theme_mcp_works_backend/static/src/scss/control_panel.scss",
            "theme_mcp_works_backend/static/src/scss/modals.scss",

            # ── 3. Core components ─────────────────────────────────────
            "theme_mcp_works_backend/static/src/scss/core/notifications.scss",
            "theme_mcp_works_backend/static/src/scss/core/popover.scss",
            "theme_mcp_works_backend/static/src/scss/core/search_panel.scss",

            # ── 4. Base widgets (first level — no view scope) ──────────
            "theme_mcp_works_backend/static/src/scss/widgets/buttons.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/inputs.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/avatar.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/statusbar.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/state_selection.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/many2one.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/tags.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/badge.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/boolean.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/boolean_favorite.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/date.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/monetary.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/priority.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/color_picker.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/email_phone.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/progress_bar.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/image.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/html.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/translation.scss",

            # ── 5. View-specific overrides ─────────────────────────────
            "theme_mcp_works_backend/static/src/scss/views/form.scss",
            "theme_mcp_works_backend/static/src/scss/views/list.scss",
            "theme_mcp_works_backend/static/src/scss/views/kanban.scss",
            "theme_mcp_works_backend/static/src/scss/views/calendar.scss",
            "theme_mcp_works_backend/static/src/scss/views/pivot.scss",
            "theme_mcp_works_backend/static/src/scss/views/graph.scss",
            "theme_mcp_works_backend/static/src/scss/views/activity.scss",
            "theme_mcp_works_backend/static/src/scss/views/discuss.scss",
            "theme_mcp_works_backend/static/src/scss/views/settings.scss",

            # ── 6. Component panels ────────────────────────────────────
            "theme_mcp_works_backend/static/src/scss/dash.scss",
            "theme_mcp_works_backend/static/src/scss/apps_trigger.scss",
            "theme_mcp_works_backend/static/src/scss/actions_panel.scss",
            "theme_mcp_works_backend/static/src/scss/show_desktop.scss",
            "theme_mcp_works_backend/static/src/scss/form_splitter.scss",

            # ── 7. JS utilities ────────────────────────────────────────
            "theme_mcp_works_backend/static/src/js/sizing.js",
            "theme_mcp_works_backend/static/src/js/resizer.js",

            # ── 8. OWL components ──────────────────────────────────────
            "theme_mcp_works_backend/static/src/webclient/dash/dash.js",
            "theme_mcp_works_backend/static/src/webclient/dash/dash.xml",
            "theme_mcp_works_backend/static/src/webclient/actions_panel/actions_panel.js",
            "theme_mcp_works_backend/static/src/webclient/actions_panel/actions_panel.xml",
            "theme_mcp_works_backend/static/src/webclient/breadcrumb_strip/breadcrumb_strip.js",
            "theme_mcp_works_backend/static/src/webclient/hud_corners/hud_corners.js",
            "theme_mcp_works_backend/static/src/webclient/control_panel/control_panel.xml",
            "theme_mcp_works_backend/static/src/webclient/show_desktop/show_desktop.js",
            "theme_mcp_works_backend/static/src/webclient/show_desktop/show_desktop.xml",
            "theme_mcp_works_backend/static/src/webclient/show_desktop/empty_desktop.js",
            "theme_mcp_works_backend/static/src/webclient/show_desktop/empty_desktop.xml",
            "theme_mcp_works_backend/static/src/webclient/form_splitter/form_splitter.js",
            "theme_mcp_works_backend/static/src/webclient/statusbar_unhide/statusbar_unhide.js",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}

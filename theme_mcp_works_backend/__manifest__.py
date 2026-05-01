# Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Theme MCP Works — Backend (GNOME Shell style)",
    "summary": "Independent GNOME Shell-styled Odoo CE backend — paper bg, "
               "indigo accents, Activities pill, bottom Dash, paper buttons",
    "description": """
        Standalone backend (ERP UI) theme. NOT a website theme — does not
        depend on theme_mcp_works frontend. Targets Odoo Community Edition
        only (excludes web_enterprise). Compatible with default Odoo CE web
        client.

        Visual identity (self-contained):
          • Top bar — paper bg + indigo border-bottom + round Activities pill
          • Workspace — paper-cream + 56px indigo grid mesh
          • Bottom Dash — floating pill with favorite apps + Show all button
          • Apps overview — translucent cards with indigo border + hover lift
          • Form view — white card sheets, indigo focus rings on inputs
          • List view — indigo header, hover row highlight
          • Kanban — paper cards with hover lift
          • Buttons — white bg with ink borders + indigo focus glow
          • Modals + dropdowns — indigo border, paper bg
          • Pager + breadcrumbs + search bar — themed

        Pairs visually with theme_mcp_works (frontend) but they are now
        completely independent — install/upgrade/uninstall on their own.
    """,
    "version": "19.0.1.11.0",
    "category": "Themes/Backend",
    "author": "Rosen Vladimirov, BL Consulting",
    "maintainers": ["rosen-vladimirov"],
    "website": "https://www.mcpworks.net",
    "license": "AGPL-3",
    "depends": [
        "web",
    ],
    "excludes": [
        "web_enterprise",
    ],
    "data": [],
    "assets": {
        # SCSS build-time variables (loaded before web primary variables)
        "web._assets_primary_variables": [
            (
                "after",
                "web/static/src/scss/primary_variables.scss",
                "theme_mcp_works_backend/static/src/scss/variables.scss",
            ),
        ],
        "web.assets_backend": [
            # ── 1. Runtime design tokens (CSS custom properties) ───────
            "theme_mcp_works_backend/static/src/scss/tokens.scss",

            # ── 2. Layout foundation ───────────────────────────────────
            "theme_mcp_works_backend/static/src/scss/layout.scss",
            "theme_mcp_works_backend/static/src/scss/navbar.scss",
            "theme_mcp_works_backend/static/src/scss/control_panel.scss",
            "theme_mcp_works_backend/static/src/scss/modals.scss",

            # ── 3. Base widgets (first level — no view scope) ──────────
            "theme_mcp_works_backend/static/src/scss/widgets/buttons.scss",
            "theme_mcp_works_backend/static/src/scss/widgets/inputs.scss",

            # ── 4. View-specific overrides ─────────────────────────────
            "theme_mcp_works_backend/static/src/scss/views/form.scss",
            "theme_mcp_works_backend/static/src/scss/views/list.scss",
            "theme_mcp_works_backend/static/src/scss/views/kanban.scss",

            # ── 5. Component panels ────────────────────────────────────
            "theme_mcp_works_backend/static/src/scss/dash.scss",
            "theme_mcp_works_backend/static/src/scss/apps_trigger.scss",
            "theme_mcp_works_backend/static/src/scss/actions_panel.scss",

            # ── 6. JS utilities ────────────────────────────────────────
            "theme_mcp_works_backend/static/src/js/sizing.js",

            # ── 7. OWL components ──────────────────────────────────────
            "theme_mcp_works_backend/static/src/webclient/dash/dash.js",
            "theme_mcp_works_backend/static/src/webclient/dash/dash.xml",
            "theme_mcp_works_backend/static/src/webclient/actions_panel/actions_panel.js",
            "theme_mcp_works_backend/static/src/webclient/actions_panel/actions_panel.xml",
            "theme_mcp_works_backend/static/src/webclient/breadcrumb_strip/breadcrumb_strip.js",
            "theme_mcp_works_backend/static/src/webclient/control_panel/control_panel.xml",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}

# Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Theme MCP Works — Backend CE shell (Robot style)",
    "summary": "Community-edition navigation shell for the MCP Works backend "
               "theme — vertical Dash dock, apps trigger, breadcrumb strip, "
               "actions panel, desktop",
    "version": "19.0.1.236.0",
    "category": "Themes/Backend",
    "author": "Rosen Vladimirov, BL Consulting",
    "maintainers": ["rosen-vladimirov"],
    "website": "https://www.mcpworks.net",
    "license": "LGPL-3",
    # Цялата неутрална стилизация (токени, изгледи, уиджети) е в ядрото.
    "depends": ["theme_mcp_works_backend"],
    # Черупката пренаписва навигацията на CE; несъвместима е с Enterprise,
    # чиято навигация се обслужва от theme_mcp_works_backend_ee.
    "excludes": ["web_enterprise"],
    "assets": {
        "web.assets_backend": [
            # ── Анкери: възпроизвеждат ТОЧНИЯ ред отпреди разделянето ──
            # (layout → navbar → control_panel_strip → control_panel_core)
            (
                "after",
                "theme_mcp_works_backend/static/src/scss/layout.scss",
                "theme_mcp_works_backend_ce/static/src/scss/navbar.scss",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/scss/navbar.scss",
                "theme_mcp_works_backend_ce/static/src/scss/control_panel_strip.scss",
            ),

            # ── Панели ────────────────────────────────────────────────
            # Закотвени, НЕ добавени накрая: обикновеният append ги слага в
            # края на целия бъндъл (след CSS-а на другите модули), докато
            # преди разделянето те стояха веднага след views/* на темата.
            # Гейтът го хвана — съдържанието беше същото, но редът различен.
            (
                "after",
                "theme_mcp_works_backend/static/src/scss/views/settings.scss",
                "theme_mcp_works_backend_ce/static/src/scss/dash.scss",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/scss/dash.scss",
                "theme_mcp_works_backend_ce/static/src/scss/apps_trigger.scss",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/scss/apps_trigger.scss",
                "theme_mcp_works_backend_ce/static/src/scss/actions_panel.scss",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/scss/actions_panel.scss",
                "theme_mcp_works_backend_ce/static/src/scss/show_desktop.scss",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/scss/show_desktop.scss",
                "theme_mcp_works_backend_ce/static/src/scss/form_splitter.scss",
            ),

            # ── OWL компоненти на черупката ────────────────────────────
            # Пак закотвени: вмъкват се между button_sizing.js и
            # statusbar_unhide.js на ядрото — точно както стояха преди
            # разделянето. (Редът на JS модулите в Odoo не влияе на
            # изпълнението — то върви по зависимости — но щом може да е
            # едно към едно, нека е.)
            # NB: манифестът се чете с ast.literal_eval — само литерали,
            # никакви comprehension-и или разпаковане.
            (
                "after",
                "theme_mcp_works_backend/static/src/js/button_sizing.js",
                "theme_mcp_works_backend_ce/static/src/webclient/dash/dash.js",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/webclient/dash/dash.js",
                "theme_mcp_works_backend_ce/static/src/webclient/dash/dash.xml",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/webclient/dash/dash.xml",
                "theme_mcp_works_backend_ce/static/src/webclient/actions_panel/actions_panel.js",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/webclient/actions_panel/actions_panel.js",
                "theme_mcp_works_backend_ce/static/src/webclient/actions_panel/actions_panel.xml",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/webclient/actions_panel/actions_panel.xml",
                "theme_mcp_works_backend_ce/static/src/webclient/breadcrumb_strip/breadcrumb_strip.js",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/webclient/breadcrumb_strip/breadcrumb_strip.js",
                "theme_mcp_works_backend_ce/static/src/webclient/control_panel/control_panel.xml",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/webclient/control_panel/control_panel.xml",
                "theme_mcp_works_backend_ce/static/src/webclient/show_desktop/show_desktop.js",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/webclient/show_desktop/show_desktop.js",
                "theme_mcp_works_backend_ce/static/src/webclient/show_desktop/show_desktop.xml",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/webclient/show_desktop/show_desktop.xml",
                "theme_mcp_works_backend_ce/static/src/webclient/show_desktop/empty_desktop.js",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/webclient/show_desktop/empty_desktop.js",
                "theme_mcp_works_backend_ce/static/src/webclient/show_desktop/empty_desktop.xml",
            ),
            (
                "after",
                "theme_mcp_works_backend_ce/static/src/webclient/show_desktop/empty_desktop.xml",
                "theme_mcp_works_backend_ce/static/src/webclient/form_splitter/form_splitter.js",
            ),
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}

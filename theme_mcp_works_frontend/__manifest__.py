# Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Theme MCP Works — Website follows the backend preset",
    "summary": "Applies the MCP Works backend preset (accent, light/dark, "
               "radius, font) to the public website, portal, shop, blog "
               "and login — server-rendered, no flash, no new classes",
    "version": "19.0.1.0.1",
    # НЕ Theme/*: website/models/ir_asset.py изрязва assets на всяка тема,
    # която не е website.theme_id (PLAN §1.1, ADR theme-mcp-frontend/0001).
    "category": "Website/Website",
    "author": "Rosen Vladimirov, BL Consulting",
    "maintainers": ["rosen-vladimirov"],
    "website": "https://www.mcpworks.net",
    "license": "LGPL-3",
    "depends": ["website", "theme_mcp_works_backend"],
    # старият AGPL модул дефинира същите --mcp-* с други стойности
    "excludes": ["theme_mcp_works"],
    "data": [
        "views/frontend_layout.xml",
        "views/res_config_settings_views.xml",
    ],
    "assets": {
        # Редът е договорен в PLAN §1.4; dark е последен, за да печели при
        # равенство. Само web.assets_frontend + чатът — нищо в бекенда и в
        # бъндълите на Website Builder (PLAN §5.4).
        "web.assets_frontend": [
            # токените и шрифтовете на ядрото — по път, не копие.
            # tokens.scss е ПРЕДИ fonts_selectable.scss (отклонение от реда в
            # PLAN §1.4): „:root[data-mcp-mode=light]“ в tokens.scss и
            # „:root[data-mcp-font=…]“ са с еднаква специфичност 0,2,0, затова
            # при data-mcp-mode="light" на <html> печели по-късното правило —
            # иначе шрифтът на пресета пада обратно към Roboto.
            "theme_mcp_works_backend/static/src/scss/fonts.scss",
            "theme_mcp_works_backend/static/src/scss/tokens.scss",
            "theme_mcp_works_backend/static/src/scss/fonts_selectable.scss",
            # основа (B0)
            "theme_mcp_works_frontend/static/src/scss/fe_tokens.scss",
            "theme_mcp_works_frontend/static/src/scss/_mixins.scss",
            "theme_mcp_works_frontend/static/src/scss/bridge_root.scss",
            # примитиви (B1–B7)
            "theme_mcp_works_frontend/static/src/scss/palette.scss",
            "theme_mcp_works_frontend/static/src/scss/typography.scss",
            "theme_mcp_works_frontend/static/src/scss/buttons.scss",
            "theme_mcp_works_frontend/static/src/scss/links.scss",
            "theme_mcp_works_frontend/static/src/scss/forms.scss",
            "theme_mcp_works_frontend/static/src/scss/components.scss",
            "theme_mcp_works_frontend/static/src/scss/floats.scss",
            "theme_mcp_works_frontend/static/src/scss/header.scss",
            "theme_mcp_works_frontend/static/src/scss/footer.scss",
            # екрани (B8–B13)
            "theme_mcp_works_frontend/static/src/scss/shop.scss",
            "theme_mcp_works_frontend/static/src/scss/product.scss",
            "theme_mcp_works_frontend/static/src/scss/checkout.scss",
            "theme_mcp_works_frontend/static/src/scss/portal.scss",
            "theme_mcp_works_frontend/static/src/scss/blog.scss",
            "theme_mcp_works_frontend/static/src/scss/login.scss",
            # мобилен и тъмен режим (B15, B14)
            "theme_mcp_works_frontend/static/src/scss/mobile.scss",
            "theme_mcp_works_frontend/static/src/scss/dark.scss",
        ],
        "portal.assets_chatter_style": [
            "theme_mcp_works_frontend/static/src/scss/portal_chatter.scss",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}

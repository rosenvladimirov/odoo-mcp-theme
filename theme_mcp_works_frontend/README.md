# MCP Works — Website follows the backend preset

Applies the MCP Works backend preset (accent, light/dark mode, radius scale,
UI font) to the public website, portal (`/my`), shop, blog and login of
Odoo 19 Community.

## How it works

- `web.frontend_layout` is extended (priority 99) and the preset is written
  on `<html>` as `data-mcp-site`, `data-mcp-mode`, `data-mcp-font` and an
  inline `style="--mcp-…"`, server-side: no JavaScript, no flash, works for
  anonymous visitors and with the website page cache.
- Values come from the `ir.http._mcp_frontend_theme()` hook of
  `theme_mcp_works_backend` (UI font only). With the configurator
  (`theme_mcp_works_backend_config`) installed, the company preset is applied.
  Only company-wide values are used, never per-user ones. Every value is
  validated against a CSS whitelist before it reaches the page.
- All CSS lives in `web.assets_frontend` and is scoped under
  `html:where([data-mcp-site="follow"])`. Nothing is added to the backend or
  Website Builder bundles, and the module defines no new classes.

## Settings

*Settings → Website → General → Website follows MCP theme*:

- **Follow the MCP preset** (default): the preset overrides the colours,
  fonts and button shapes chosen in the Website Builder *Theme* tab.
- **Off**: the website renders exactly as without this module.

## Compatibility

Excludes the legacy `theme_mcp_works` module (AGPL); nothing is taken from it.

## License

LGPL-3.0-or-later.

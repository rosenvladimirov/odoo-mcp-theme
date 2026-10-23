/** @odoo-module **/

/* Apply the icon set chosen in Settings → MCP Theme.
 *
 * ir_http.session_info injects `mcp_icon_set` and `mcp_icon_weight`; we
 * reflect them as data attributes on <html> so the
 * :root[data-mcp-icons="…"] rules in scss/icons/ take over the fa-* / oi-*
 * glyphs. Set at module-eval time (before the webclient paints) → no flash
 * of the old icons. "fa" = Odoo's own icons, nothing is overridden. */
import { session } from "@web/session";

const root = document.documentElement;
root.dataset.mcpIcons = (session && session.mcp_icon_set) || "fa";
root.dataset.mcpIconWeight = (session && session.mcp_icon_weight) || "regular";

/** @odoo-module **/

/* Apply the backend UI font chosen in Settings → MCP Theme.
 *
 * ir_http.session_info injects `mcp_ui_font`; we reflect it as a data
 * attribute on <html> so the :root[data-mcp-font="…"] overrides in
 * fonts_selectable.scss switch --mcp-font-family. Set at module-eval time
 * (before the webclient paints) → no flash of the wrong font. */
import { session } from "@web/session";

const font = (session && session.mcp_ui_font) || "system";
document.documentElement.dataset.mcpFont = font;

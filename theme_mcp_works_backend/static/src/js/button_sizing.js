/** @odoo-module **/

/* MCP Works backend — Robot Theme · uniform button sizing.
 *
 * Every backend button is sized through the shared size calculator
 * (sizing.js → computeButtonWidth): measure its rendered height,
 * classify square (icon-only) vs rectangular (labelled), then
 *   - rectangular → min-width = calc(height) so short buttons share a
 *     consistent proportion (labels longer than that still grow — a
 *     min-width never clips);
 *   - square      → width = height = a perfect HUD square.
 *
 * Idempotent (each button stamped with its current h:type — unchanged
 * buttons are skipped), rAF-throttled, re-runs on Odoo action swaps.
 * Mirrors the resizer.js / hud_corners.js MutationObserver pattern.
 */

import { computeButtonWidth, classifyButton } from "@theme_mcp_works_backend/js/sizing";

/* Buttons we must NOT manage:
 *   - stat buttons          → owned by resizer.js equalizeStatButtons()
 *   - KPI dashboard cards    → own bespoke tile sizing
 *   - split-dropdown carets / optional-columns toggle → intrinsic width
 *   - anything opted out with [data-mcp-no-size] */
const EXCLUDE =
    ".oe_stat_button, .o-form-buttonbox .btn," +
    ".purchase-dashboard-card, .o_sale_dashboard .btn, .o_dashboard_card," +
    ".dropdown-toggle-split, .o_optional_columns_dropdown_toggle," +
    "[data-mcp-no-size]";

function sizeOne(btn) {
    if (btn.matches(EXCLUDE) || btn.closest("[data-mcp-no-size]")) return;
    if (!btn.offsetParent) return;                       // hidden — skip
    const h = Math.round(btn.getBoundingClientRect().height);
    if (h <= 0) return;
    const type = classifyButton(btn);
    const stamp = h + ":" + type;
    if (btn.dataset.mcpBtnSized === stamp) return;        // already current
    const w = computeButtonWidth(h, type);
    if (w <= 0) return;
    if (type === "square") {
        btn.style.setProperty("width", w + "px", "important");
        btn.style.setProperty("min-width", w + "px", "important");
        btn.style.setProperty("height", h + "px", "important");
        btn.style.setProperty("padding-left", "0", "important");
        btn.style.setProperty("padding-right", "0", "important");
    } else {
        btn.style.setProperty("min-width", w + "px", "important");
    }
    btn.dataset.mcpBtnSized = stamp;
}

function processAll() {
    document.querySelectorAll(".btn").forEach(sizeOne);
}

let pending = false;
function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; processAll(); });
}

const docObserver = new MutationObserver(schedule);
docObserver.observe(document.documentElement, { childList: true, subtree: true });

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
} else {
    schedule();
}

export { sizeOne, processAll };

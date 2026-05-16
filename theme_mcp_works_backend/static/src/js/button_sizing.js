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

import { computeButtonWidth, classifyButton, getCSSVar } from "@theme_mcp_works_backend/js/sizing";

/* Canonical button height: every managed button is normalised to ONE
 * height so the toolbar reads as a single row of equal chips.  The
 * reference is the control-panel "New" button (.o_list_button_add);
 * fall back to a primary CP button, then the --mcp-btn-h token, then
 * 26 (Rosen: "височината е същата като o_list_button_add, останалите
 * бутони също имат тази височина"). */
function baseButtonHeight() {
    const ref =
        document.querySelector(".o_list_button_add") ||
        document.querySelector(".o_control_panel .btn-primary");
    if (ref && ref.offsetParent) {
        const h = Math.round(ref.getBoundingClientRect().height);
        if (h > 0) return h;
    }
    const tok = parseFloat(getCSSVar("--mcp-btn-h"));
    return Number.isFinite(tok) && tok > 0 ? tok : 26;
}

/* Always-square buttons (icon togglers) regardless of classifyButton. */
const FORCE_SQUARE = ".o_searchview_dropdown_toggler";

/* Search toggler is not a .btn — pick it up explicitly too. */
const MANAGED = ".btn, .o_searchview_dropdown_toggler";

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

function sizeOne(btn, H) {
    if (btn.matches(EXCLUDE) || btn.closest("[data-mcp-no-size]")) return;
    if (!btn.offsetParent) return;                       // hidden — skip
    if (H <= 0) return;
    const type = btn.matches(FORCE_SQUARE) ? "square" : classifyButton(btn);
    const stamp = H + ":" + type;
    if (btn.dataset.mcpBtnSized === stamp) return;        // already current
    const w = computeButtonWidth(H, type);
    if (w <= 0) return;
    /* Uniform height for every managed button so the row is even. */
    btn.style.setProperty("height", H + "px", "important");
    btn.style.setProperty("min-height", H + "px", "important");
    if (type === "square") {
        btn.style.setProperty("width", w + "px", "important");
        btn.style.setProperty("min-width", w + "px", "important");
        btn.style.setProperty("padding-left", "0", "important");
        btn.style.setProperty("padding-right", "0", "important");
        btn.style.setProperty("display", "inline-flex", "important");
        btn.style.setProperty("align-items", "center", "important");
        btn.style.setProperty("justify-content", "center", "important");
    } else {
        btn.style.setProperty("min-width", w + "px", "important");
    }
    btn.dataset.mcpBtnSized = stamp;
}

function processAll() {
    const H = baseButtonHeight();
    document.querySelectorAll(MANAGED).forEach((b) => sizeOne(b, H));
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

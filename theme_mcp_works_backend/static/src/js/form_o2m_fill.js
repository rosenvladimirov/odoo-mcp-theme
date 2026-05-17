/** @odoo-module **/

/* MCP Works backend — Robot Theme · form o2m list width resizer.
 *
 * The embedded order-line list table is FROZEN (Rosen's rule: never
 * restyle its internals). Its columns are a fixed ~1379px; inside the
 * full-bleed form container that leaves "air on the right". Per the
 * rule the form-list OUTER size is the resizer's job — Rosen chose
 * "резайзер мащабира колоните": when the container is WIDER than the
 * table's natural width we set the table width to the container so
 * table-layout:fixed scales the columns up to fill (no air); when the
 * container is NARROWER we leave the natural width so the
 * .table-responsive renderer scrolls it (no overflow).
 *
 * Scope is strictly .o_form_view .o_field_x2many — the standalone
 * (frozen) list screen is never touched. rAF-throttled, re-runs on
 * DOM swaps / resize. Mirrors resizer.js / button_sizing.js.
 */

const SEL = ".o_form_view .o_field_x2many .o_list_renderer table.o_list_table";

function fitOne(table) {
    const rend = table.closest(".o_list_renderer");
    if (!rend || !table.offsetParent) return;
    const avail = Math.round(rend.clientWidth);
    if (avail <= 0) return;
    /* Rosen: "резайзер мащабира колоните" — ALWAYS pin the table width
       to the renderer so table-layout:fixed scales every column to
       exactly fill the box: wider container → columns grow (no air),
       narrower → columns shrink (no horizontal scroll). */
    if (table.dataset.mcpO2mFit === String(avail)) return;
    table.style.setProperty("width", avail + "px", "important");
    table.style.setProperty("min-width", avail + "px", "important");
    table.style.setProperty("max-width", avail + "px", "important");
    table.dataset.mcpO2mFit = String(avail);
}

function processAll() {
    document.querySelectorAll(SEL).forEach(fitOne);
}

let pending = false;
function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; processAll(); });
}

const docObserver = new MutationObserver(schedule);
docObserver.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("resize", schedule, { passive: true });

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
} else {
    schedule();
}

export { fitOne, processAll };

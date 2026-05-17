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
    /* measure the table's natural (column-sum) width with our
       override cleared */
    table.style.removeProperty("width");
    const natural = Math.round(table.scrollWidth || table.getBoundingClientRect().width);
    const stamp = avail + ":" + natural;
    if (table.dataset.mcpO2mFit === stamp) {
        if (avail > natural) table.style.setProperty("width", avail + "px", "important");
        return;
    }
    if (avail > natural) {
        /* container wider → scale the fixed columns to fill it */
        table.style.setProperty("width", avail + "px", "important");
    } else {
        /* container narrower → keep natural width, renderer scrolls */
        table.style.removeProperty("width");
    }
    table.dataset.mcpO2mFit = stamp;
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

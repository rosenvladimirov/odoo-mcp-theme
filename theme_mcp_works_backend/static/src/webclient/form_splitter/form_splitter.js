/** @odoo-module **/

/**
 * MCP Works — Form-view splitter between .o_form_sheet_bg and .o-mail-ChatterContainer.
 *
 * Injects a vertical drag handle between the two panels. Hovering it
 * reveals a left+right arrow hint. Dragging resizes both panels via
 * flex-basis. Saved ratio persists in localStorage so the user's split
 * sticks across reloads.
 *
 * Only applies when BOTH siblings exist (i.e. form view + side chatter).
 * Other layouts (xxl forms with chatter at bottom, forms without
 * chatter, list/kanban views) are untouched.
 */

const STORAGE_KEY = "mcp_form_split_ratio";
const MIN_SHEET_PX   = 320;     // sheet keeps at least this — long field rows readable
const MIN_CHATTER_PX = 585;     // chatter keeps at least this — matches the natural readable size of message bubbles + actions
const SPLITTER_CLASS = "mcp_form_splitter";

function readSavedRatio() {
    try {
        const v = parseFloat(localStorage.getItem(STORAGE_KEY));
        if (v > 0.1 && v < 0.95) return v;
    } catch (e) {}
    return null;
}

function writeSavedRatio(ratio) {
    try { localStorage.setItem(STORAGE_KEY, ratio.toFixed(3)); } catch (e) {}
}

/**
 * Apply a sheet/chatter split using proportional flex. We never use
 * absolute pixel basis — that overflows the viewport when the window
 * shrinks. Instead each panel gets `flex: <portion> 1 0` so the ratio
 * stays correct no matter the parent width, with both still able to
 * shrink (flex-shrink: 1) when needed. min-width caps prevent either
 * side from collapsing past readability.
 */
function applyRatio(sheet, chatter, ratio) {
    /* Clamp ratio between hard limits derived from the parent width */
    const parent = sheet.parentElement;
    if (!parent) return;
    const total = parent.getBoundingClientRect().width;
    if (total < MIN_SHEET_PX + MIN_CHATTER_PX) return;
    const minRatio = MIN_SHEET_PX / total;
    const maxRatio = 1 - MIN_CHATTER_PX / total;
    ratio = Math.max(minRatio, Math.min(maxRatio, ratio));

    /* Proportional flex — values map directly to relative widths */
    sheet.style.flex   = `${ratio} 1 0`;
    chatter.style.flex = `${1 - ratio} 1 0`;
    sheet.style.minWidth   = `${MIN_SHEET_PX}px`;
    chatter.style.minWidth = `${MIN_CHATTER_PX}px`;
    /* Override the core's `width: calc(...)` on chatter so flex wins */
    chatter.style.width = "auto";
}

function buildSplitter() {
    const el = document.createElement("div");
    el.className = SPLITTER_CLASS;
    el.setAttribute("role", "separator");
    el.setAttribute("aria-orientation", "vertical");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", "Преоразмери");
    el.innerHTML = `
        <div class="mcp_form_splitter_arrows" aria-hidden="true">
            <i class="fa fa-chevron-left"></i>
            <i class="fa fa-chevron-right"></i>
        </div>
    `;
    return el;
}

function attachDrag(splitter, sheet, chatter) {
    let dragging = false;
    let startX = 0;
    let startSheetW = 0;
    let totalW = 0;

    const onMove = (ev) => {
        if (!dragging) return;
        const dx = ev.clientX - startX;
        let newSheetW = startSheetW + dx;
        newSheetW = Math.max(MIN_SHEET_PX, Math.min(totalW - MIN_CHATTER_PX, newSheetW));
        applyRatio(sheet, chatter, newSheetW / totalW);
        writeSavedRatio(newSheetW / totalW);
    };
    const onUp = () => {
        if (!dragging) return;
        dragging = false;
        splitter.classList.remove("is-dragging");
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
    };
    splitter.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        dragging = true;
        startX = ev.clientX;
        startSheetW = sheet.getBoundingClientRect().width;
        const chatterW = chatter.getBoundingClientRect().width;
        totalW = startSheetW + chatterW;
        splitter.classList.add("is-dragging");
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    });

    /* Keyboard accessibility — left/right arrow keys nudge by 24px */
    splitter.addEventListener("keydown", (ev) => {
        if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
        const sheetW = sheet.getBoundingClientRect().width;
        const chatterW = chatter.getBoundingClientRect().width;
        const total = sheetW + chatterW;
        const step = ev.shiftKey ? 60 : 24;
        const dir = ev.key === "ArrowRight" ? 1 : -1;
        let newSheetW = sheetW + dir * step;
        newSheetW = Math.max(MIN_SHEET_PX, Math.min(total - MIN_CHATTER_PX, newSheetW));
        applyRatio(sheet, chatter, newSheetW / total);
        writeSavedRatio(newSheetW / total);
        ev.preventDefault();
    });
}

function injectSplitters() {
    const renderers = document.querySelectorAll(".o_form_renderer");
    renderers.forEach((renderer) => {
        if (renderer.dataset.mcpSplitter === "ready") return;
        const sheet   = renderer.querySelector(":scope > .o_form_sheet_bg");
        const chatter = renderer.querySelector(":scope > .o-mail-ChatterContainer");
        if (!sheet || !chatter) return;
        /* Both panels found AND they are direct flex siblings — proceed. */
        const splitter = buildSplitter();
        sheet.after(splitter);
        attachDrag(splitter, sheet, chatter);

        /* Restore saved ratio on first paint */
        const ratio = readSavedRatio();
        if (ratio !== null) {
            requestAnimationFrame(() => applyRatio(sheet, chatter, ratio));
        }
        renderer.dataset.mcpSplitter = "ready";
    });
}

function boot() {
    injectSplitters();
    if ("MutationObserver" in window) {
        const mo = new MutationObserver(() => injectSplitters());
        mo.observe(document.body, { childList: true, subtree: true });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
    boot();
}

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

/* 🚨 КЛЮЧЪТ Е СМЕНЕН НАРОЧНО. Старите стойности са мерени срещу дял, който
   включваше и прегледа в общата сметка; върху поправения модел същото число
   значи друго и изкривява подредбата (измерено 09.09.2026 на фактура с PDF:
   форма 590 срещу 1110 преглед и 1680 празно вдясно). Без запазена стойност
   сплитерът НЕ пипа flex-овете — остава ядреното разпределение, което е и
   еталонът на Enterprise: sheet 2 : преглед 1 : чатър 1. */
const STORAGE_KEY = "mcp_form_split_ratio_v2";
const MIN_SHEET_PX   = 420;     // формата не пада под четимото — при по-малко
                                // полетата се чупят на срички (Росен, 09.09.2026)
const MIN_CHATTER_PX = 585;     // chatter keeps at least this — matches the natural readable size of message bubbles + actions
const MIN_PREVIEW_PX = 360;     // прегледът пази толкова — под това страницата на PDF-а не се чете
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

    /* 🚨 ТРЕТИЯТ ПАНЕЛ. Когато документът има прикачен файл, ядрото вмъква
       `.o_attachment_preview` МЕЖДУ формата и чатъра — тоест точно там, където
       седи дръжката. Панелът идва с `flex: auto` + `width: 530px`, тъй че
       расте наравно с двата дяла на съотношението и ги изяжда: измерено на
       фактура с PDF — форма ~470px срещу преглед ~1210px, при което адресът на
       клиента се чупи на срички (Росен, 09.09.2026). Дръжката физически дели
       ФОРМАТА и ПРЕГЛЕДА, тъй че съотношението важи за тях; чатърът излиза от
       сметката и пази своята естествена ширина. */
    const preview = parent.querySelector(":scope > .o_attachment_preview");
    const neighbour = preview || chatter;
    const minNeighbour = preview ? MIN_PREVIEW_PX : MIN_CHATTER_PX;

    /* Ширината, която дръжката реално разпределя. При отворен преглед от нея
       се вади запазеното за чатъра — не измерваме чатъра, защото сме на път да
       му сменим flex-а и стойността би била от предишния кадър. */
    const reserved = preview ? Math.min(MIN_CHATTER_PX, total * 0.32) : 0;
    const span = total - reserved;
    if (span < MIN_SHEET_PX + minNeighbour) return;

    const minRatio = MIN_SHEET_PX / span;
    const maxRatio = 1 - minNeighbour / span;
    ratio = Math.max(minRatio, Math.min(maxRatio, ratio));

    /* Proportional flex — values map directly to relative widths */
    sheet.style.flex = `${ratio} 1 0`;
    sheet.style.minWidth = `${MIN_SHEET_PX}px`;
    neighbour.style.flex = `${1 - ratio} 1 0`;
    neighbour.style.minWidth = `${minNeighbour}px`;
    /* Override the core's `width: calc(...)` on chatter so flex wins */
    neighbour.style.width = "auto";

    if (preview) {
        /* Чатърът е извън съотношението: без grow, на своята ширина. */
        chatter.style.flex = "0 0 auto";
        chatter.style.width = `${reserved}px`;
        chatter.style.minWidth = "";
    }
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
        const minNb = sheet.parentElement?.querySelector(":scope > .o_attachment_preview")
            ? MIN_PREVIEW_PX : MIN_CHATTER_PX;
        newSheetW = Math.max(MIN_SHEET_PX, Math.min(totalW - minNb, newSheetW));
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
        /* Съседът вдясно от дръжката е прегледът, ако има такъв — чатърът
           стои по-надясно и не участва в съотношението. */
        const nb = sheet.parentElement?.querySelector(":scope > .o_attachment_preview") || chatter;
        totalW = startSheetW + nb.getBoundingClientRect().width;
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
        const nb = sheet.parentElement?.querySelector(":scope > .o_attachment_preview") || chatter;
        const total = sheetW + nb.getBoundingClientRect().width;
        const step = ev.shiftKey ? 60 : 24;
        const dir = ev.key === "ArrowRight" ? 1 : -1;
        let newSheetW = sheetW + dir * step;
        const minNb = nb === chatter ? MIN_CHATTER_PX : MIN_PREVIEW_PX;
        newSheetW = Math.max(MIN_SHEET_PX, Math.min(total - minNb, newSheetW));
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

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
const STORAGE_KEY = "mcp_form_split_ratio_v3";
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
 * Ширината на формата се задава като ПРОЦЕНТ ОТ КОНТЕЙНЕРА, а съседът вдясно
 * от дръжката взима остатъка.
 *
 * 🚨 Защо не дял по `flex-grow` (както беше): grow има смисъл само срещу
 * ДРУГИТЕ grow стойности в същия ред. Прегледът идва от ядрото с `flex: auto`,
 * тоест grow 1; когато формата получеше `flex: 0.249 1 0`, прегледът печелеше
 * четворно и формата падаше на 320px при контейнер 1695 — измерено в браузъра
 * на Росен на 09.09.2026, при това `min-width` не я спасяваше. Процентът не
 * зависи от чуждите grow стойности, тъй че подредбата е предвидима.
 *
 * Съседът се чете ДИНАМИЧНО при всяко прилагане: прегледът се появява в DOM
 * след първото рисуване, а чатърът в тази подредба изобщо не е дете на
 * renderer-а (децата са три: форма, дръжка, преглед). Отпратка, взета при
 * закачането, сочеше към откачен елемент и стиловете отиваха в нищото.
 */
function neighbourOf(sheet) {
    let el = sheet.nextElementSibling;
    while (el && el.classList.contains(SPLITTER_CLASS)) {
        el = el.nextElementSibling;
    }
    return el;
}

function minWidthFor(el) {
    if (!el) return MIN_CHATTER_PX;
    return el.classList.contains("o_attachment_preview") ? MIN_PREVIEW_PX : MIN_CHATTER_PX;
}

function applyRatio(sheet, _chatter, ratio) {
    const parent = sheet.parentElement;
    if (!parent) return;
    const neighbour = neighbourOf(sheet);
    if (!neighbour) return;

    const splitter = parent.querySelector(":scope > ." + SPLITTER_CLASS);
    const handleW = splitter ? splitter.getBoundingClientRect().width : 0;
    const span = parent.getBoundingClientRect().width - handleW;
    const minNeighbour = minWidthFor(neighbour);
    if (span < MIN_SHEET_PX + minNeighbour) return;

    ratio = Math.max(MIN_SHEET_PX / span, Math.min(1 - minNeighbour / span, ratio));

    /* 🚨 СЪС `important`. Собственият SCSS на дръжката слага
       `min-width … !important` на панелите, а inline стил БЕЗ `!important`
       губи от CSS с `!important` — тъй че всичко, което този код пишеше за
       минимума, беше мъртво (измерено: формата на 320px с inline 420px).
       `setProperty(..., "important")` прави JS-а последната дума. */
    setImportant(sheet, {
        flex: "0 0 auto",
        width: (ratio * 100).toFixed(2) + "%",
        "min-width": MIN_SHEET_PX + "px",
    });
    setImportant(neighbour, {
        flex: "1 1 auto",
        width: "auto",
        "min-width": minNeighbour + "px",
    });
}

function setImportant(el, props) {
    for (const [name, value] of Object.entries(props)) {
        el.style.setProperty(name, value, "important");
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
        const minNb = minWidthFor(neighbourOf(sheet));
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
        /* Базата е контейнерът минус дръжката — същата, срещу която applyRatio
           смята процента. Различни бази значеха отскок при първото движение. */
        const parent = sheet.parentElement;
        const handle = parent.querySelector(":scope > ." + SPLITTER_CLASS);
        totalW = parent.getBoundingClientRect().width
            - (handle ? handle.getBoundingClientRect().width : 0);
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
        const parent = sheet.parentElement;
        const handle = parent.querySelector(":scope > ." + SPLITTER_CLASS);
        const total = parent.getBoundingClientRect().width
            - (handle ? handle.getBoundingClientRect().width : 0);
        const step = ev.shiftKey ? 60 : 24;
        const dir = ev.key === "ArrowRight" ? 1 : -1;
        let newSheetW = sheetW + dir * step;
        const minNb = minWidthFor(neighbourOf(sheet));
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
        /* Съседът може да е чатърът ИЛИ прегледът — в подредбата с прикачен
           документ чатърът изобщо не е дете на renderer-а. */
        const chatter = renderer.querySelector(
            ":scope > .o-mail-ChatterContainer, :scope > .o-mail-Form-chatter, :scope > .o_attachment_preview");
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

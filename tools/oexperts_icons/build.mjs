// Сглобява от glyphs.mjs: tile() — плочката като SVG с CSS променливи,
// sheet.html — листа с целия набор (node build.mjs sheet),
// sprite.svg — символите за темата (node build.mjs sprite <изход>).
import { writeFileSync, readFileSync } from "node:fs";
import { GLYPHS, APPS, GROUPS } from "./glyphs.mjs";

// маркерът: копие на акцентните елементи под знака
function highlight(g) {
    let out = "";
    for (const m of g.matchAll(/<(path|circle) class="a" ([^>]*)\/>/g)) {
        const closed = m[1] === "circle" || /z"/.test(m[2]);
        out += closed
            ? `<${m[1]} ${m[2]} style="fill:var(--oxi-hl);stroke:var(--oxi-hl)" stroke-width="3.5"/>`
            : `<${m[1]} ${m[2]} style="fill:none;stroke:var(--oxi-hl)" stroke-width="9" stroke-linecap="butt"/>`;
    }
    return out;
}

// вътрешността на плочката (без <svg>) — еднаква за светло и тъмно
export function tileBody(fa) {
    const g = GLYPHS[fa];
    if (!g) {
        throw new Error(`няма рисунка за ${fa}`);
    }
    const body = g.replaceAll('class="a"', 'style="stroke:var(--oxi-acc)"');
    // ред: пълнеж → печатът (дъгите) → рамката отгоре, за да не я пресича печатът
    return `<rect width="64" height="64" style="fill:var(--oxi-tile)"/>`
        + `<path d="M64 38A26 26 0 0 0 38 64M64 50A14 14 0 0 0 50 64" style="fill:none;stroke:var(--oxi-relief)" stroke-width="1.5"/>`
        + `<rect x="0.75" y="0.75" width="62.5" height="62.5" style="fill:none;stroke:var(--oxi-edge)" stroke-width="1.5"/>`
        + highlight(g)
        + `<g style="fill:none;stroke:var(--oxi-ink)" stroke-width="3.5" stroke-linecap="square" stroke-linejoin="miter">${body}</g>`;
}

const mode = process.argv[2];

// спрайтът за темата + списъкът на наличните рисунки за app_icon.js
// node build.mjs sprite <спрайт.svg> <oxi_glyphs.js>
if (mode === "sprite") {
    const used = [...new Set(APPS.map((a) => a[1]))];
    const symbols = used.map((fa) => `<symbol id="oxi-${fa.slice(3)}" viewBox="0 0 64 64">${tileBody(fa)}</symbol>`).join("\n");
    writeFileSync(process.argv[3], `<svg xmlns="http://www.w3.org/2000/svg">\n<!-- Иконите o-experts. Генериран от tools/oexperts_icons/glyphs.mjs (node build.mjs sprite) — не се редактира на ръка. -->\n${symbols}\n</svg>\n`);
    writeFileSync(process.argv[4], `/** @odoo-module **/
// Генериран от tools/oexperts_icons/glyphs.mjs (node build.mjs sprite) —
// не се редактира на ръка. Глифите, за които наборът o-experts има рисунка.
export const OXI_GLYPHS = new Set(${JSON.stringify(used.sort(), null, 4).replace(/\n\]$/, ",\n]")});
`);
    console.log("sprite", used.length, "символа");
}

// цветовете на двата вида — същите като в листа и в темата
const PALETTES = {
    light: { tile: "#E8EFF5", edge: "#721C32", relief: "#C6D6E3", ink: "#181A1D", acc: "#721C32", hl: "none", bg: "#F3F6F9", label: "#181A1D" },
    dark: { tile: "#181A1D", edge: "#303439", relief: "#303439", ink: "#F5F3EE", acc: "#B6F500", hl: "none", bg: "#141A20", label: "#E6EDF3" },
};

// плочката с вписани цветове (без CSS променливи) — за самостоятелния файл
export function tileFixedFor(fa, kind) {
    return tileFixed(fa, PALETTES[kind]);
}

function tileFixed(fa, pal) {
    return tileBody(fa)
        .replaceAll("var(--oxi-tile)", pal.tile).replaceAll("var(--oxi-edge)", pal.edge)
        .replaceAll("var(--oxi-relief)", pal.relief).replaceAll("var(--oxi-ink)", pal.ink)
        .replaceAll("var(--oxi-acc)", pal.acc).replaceAll("var(--oxi-hl)", pal.hl);
}

// името под иконата; над 16 знака — на два реда, при интервала най-близо до средата
function label(name, cx, y, fill) {
    const attrs = `text-anchor="middle" font-family="Golos Text, Segoe UI, sans-serif" font-size="10.5" font-weight="500" fill="${fill}"`;
    if (name.length <= 16 || !name.includes(" ")) {
        return `<text x="${cx}" y="${y}" ${attrs}>${name}</text>`;
    }
    const mid = name.length / 2;
    let cut = -1;
    for (let i = 0; i < name.length; i++) {
        if (name[i] === " " && (cut < 0 || Math.abs(i - mid) < Math.abs(cut - mid))) cut = i;
    }
    return `<text ${attrs}><tspan x="${cx}" y="${y}">${name.slice(0, cut)}</tspan><tspan x="${cx}" y="${y + 13}">${name.slice(cut + 1)}</tspan></text>`;
}

// един векторен файл: двата вида като слоеве, всяка икона — група с име (Inkscape/Illustrator/Figma)
if (mode === "svgset") {
    const COLS = 10, CELL = 96, TOP = 56, PAD = 32;
    const order = Object.keys(GROUPS).flatMap((g) => APPS.filter((a) => a[2] === g));
    const rows = Math.ceil(order.length / COLS);
    const blockH = TOP + rows * (CELL + 24) + PAD;
    const W = PAD * 2 + COLS * CELL;
    let layers = "";
    let y0 = 0;
    for (const [key, pal] of Object.entries(PALETTES)) {
        const title = key === "light" ? "Светъл пресет" : "Тъмен пресет";
        let icons = "";
        order.forEach(([xmlid, fa, , name], i) => {
            const x = PAD + (i % COLS) * CELL + (CELL - 64) / 2;
            const y = y0 + TOP + Math.floor(i / COLS) * (CELL + 24);
            const id = `${key}-${xmlid.replace(/[^a-z0-9]+/gi, "-")}`;
            icons += `<g id="${id}" inkscape:label="${name}" transform="translate(${x} ${y})"><title>${name} · ${xmlid}</title>${tileFixed(fa, pal)}</g>`
                + label(name, x + 32, y + 80, pal.label) + "\n";
        });
        layers += `<g id="layer-${key}" inkscape:groupmode="layer" inkscape:label="${title}">`
            + `<rect x="0" y="${y0}" width="${W}" height="${blockH}" fill="${pal.bg}"/>`
            + `<text x="${PAD}" y="${y0 + 34}" font-family="Golos Text, Segoe UI, sans-serif" font-size="16" font-weight="700" fill="${pal.label}">o-experts · ${title.toLowerCase()} · ${order.length} приложения</text>\n`
            + icons + `</g>\n`;
        y0 += blockH;
    }
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Иконите на приложенията o-experts — мрежа 64×64, линия 3,5, остри ъгли.
     Светлият пресет: плочка #E8EFF5, рамка и детайл бордо #721C32; тъмният: плочка #181A1D, детайл лайм #B6F500.
     Източник: glyphs.mjs (node build.mjs svgset). -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${W}" height="${y0}" viewBox="0 0 ${W} ${y0}">
${layers}</svg>
`;
    writeFileSync(process.argv[3], svg);
    console.log("svgset", order.length, "икони ×", Object.keys(PALETTES).length, "вида →", process.argv[3]);
}

if (mode === "sheet") {
    const tpl = readFileSync(new URL("./sheet.tpl.html", import.meta.url), "utf8");
    const uniq = new Set(APPS.map((a) => a[1])).size;
    let sections = "";
    for (const [key, label] of Object.entries(GROUPS)) {
        const apps = APPS.filter((a) => a[2] === key);
        const cells = apps.map(([xmlid, fa, , name]) =>
            `<div class="app" title="${xmlid}"><svg viewBox="0 0 64 64" aria-hidden="true">${tileBody(fa)}</svg><span>${name}</span></div>`).join("");
        sections += `<section class="grp"><h2>${label}<small>${apps.length}</small></h2>
<div class="screens"><div class="screen light"><div class="grid">${cells}</div></div><div class="screen dark"><div class="grid">${cells}</div></div></div></section>\n`;
    }
    const html = tpl.replace("<!--SECTIONS-->", sections)
        .replaceAll("<!--N_APPS-->", String(APPS.length))
        .replaceAll("<!--N_GLYPHS-->", String(uniq));
    writeFileSync(new URL("./sheet.html", import.meta.url), html);
    console.log("sheet", APPS.length, "приложения,", uniq, "рисунки");
}

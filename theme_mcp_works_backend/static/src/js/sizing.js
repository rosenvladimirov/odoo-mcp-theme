/** @odoo-module **/

/**
 * MCP Works — Global sizing & positioning utilities.
 *
 * Use these instead of hardcoded px values whenever a component or panel
 * needs to position itself relative to runtime layout (navbar, control panel,
 * viewport). Import selectively; no side effects on load.
 */

/** Current navbar height in px (reads DOM; falls back to CSS var, then 32). */
export function getNavbarHeight() {
    const el = document.querySelector(".o_main_navbar");
    if (el) return el.getBoundingClientRect().height;
    const fromVar = getComputedStyle(document.documentElement)
        .getPropertyValue("--mcp-navbar-height").trim();
    return fromVar ? parseFloat(fromVar) : 32;
}

/** Current control panel height in px (0 when no CP visible). */
export function getControlPanelHeight() {
    const el = document.querySelector(".o_control_panel");
    return el ? el.getBoundingClientRect().height : 0;
}

/**
 * Snapshot of the current layout metrics.
 * @returns {{ width, height, navbarHeight, cpHeight, contentTop, contentHeight }}
 */
export function getViewportMetrics() {
    const navbarHeight = getNavbarHeight();
    const cpHeight     = getControlPanelHeight();
    return {
        width:         window.innerWidth,
        height:        window.innerHeight,
        navbarHeight,
        cpHeight,
        contentTop:    navbarHeight + cpHeight,
        contentHeight: window.innerHeight - navbarHeight - cpHeight,
    };
}

/**
 * Top offset (px) for a panel that should appear just below the navbar.
 * @param {number} [gap=8] extra gap below navbar
 */
export function getModalTop(gap = 8) {
    return getNavbarHeight() + gap;
}

/**
 * Reads a CSS custom property value from :root.
 * @param {string} name  e.g. "--mcp-r-md"
 * @returns {string}
 */
export function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Button-size calculator.
 *
 * Give it a button height (px) and a type; get the width (px) back.
 *   - "square"      → width === height                 (icon-only buttons)
 *   - "rectangular" → width === round(height × ratio)   (labelled buttons)
 *
 * The rectangular ratio defaults to the `--mcp-btn-rect-ratio` token
 * (falls back to 2.75) so the proportion stays themeable without code.
 *
 * @param {number|string} height  button height in px
 * @param {"square"|"rectangular"} [type="rectangular"]
 * @param {number} [ratio]  override the rectangular width/height ratio
 * @returns {number} width in px (integer; 0 for a non-positive height)
 */
export function computeButtonWidth(height, type = "rectangular", ratio) {
    const h = parseFloat(height) || 0;
    if (h <= 0) return 0;
    if (type === "square") return Math.round(h);
    if (ratio == null) {
        const tok = parseFloat(getCSSVar("--mcp-btn-rect-ratio"));
        ratio = Number.isFinite(tok) && tok > 0 ? tok : 2.75;
    }
    return Math.round(h * ratio);
}

/**
 * Classify a button element: "square" when it is icon-only (has an
 * icon/glyph and no visible text label), otherwise "rectangular".
 * @param {Element} el
 * @returns {"square"|"rectangular"}
 */
export function classifyButton(el) {
    if (!el) return "rectangular";
    const text = (el.textContent || "").replace(/\s+/g, "");
    /* The glyph may be a CHILD (<i class="fa">) OR a font-icon class
       ON the button itself (<button class="oi oi-close">) — the
       latter is how Odoo renders .o_facet_remove, view switchers,
       etc.  Detect both, else they get mis-classed rectangular and
       pick up the wide min-width (Rosen). */
    const selfIcon = el.matches('.fa, .oi, [class*="fa-"], [class*="oi-"]');
    const childIcon = !!el.querySelector(".fa, .oi, i, svg, img");
    return (selfIcon || childIcon) && text.length === 0 ? "square" : "rectangular";
}

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

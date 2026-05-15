/** @odoo-module **/
/* MCP Works backend — Robot Theme · HUD corner brackets
   theme.css frames the content viewport with 4 sapphire L-brackets
   (.hud-tl/tr/bl/br).  A CSS ::before/::after on .o_action_manager
   only yields 2 corners AND they paint behind the opaque view
   surfaces.  This injector appends 4 real corner spans as the LAST
   children of .o_action_manager (position:relative already) so they
   sit ABOVE the rendered view, and re-adds them after Odoo swaps the
   action.  Mirrors the breadcrumb_strip.js MutationObserver pattern. */

const CORNERS = ["tl", "tr", "bl", "br"];

function ensure(am) {
    if (!am) return;
    // re-create any missing corner (Odoo replaces action children on nav)
    for (const c of CORNERS) {
        if (!am.querySelector(`:scope > .mcp_hud_corner.mcp_hud_${c}`)) {
            const s = document.createElement("span");
            s.className = `mcp_hud_corner mcp_hud_${c}`;
            s.setAttribute("aria-hidden", "true");
            am.appendChild(s);
        }
    }
    // keep them last so they stack above freshly-rendered views
    const corners = am.querySelectorAll(":scope > .mcp_hud_corner");
    corners.forEach((el) => am.appendChild(el));
}

function processAll() {
    document.querySelectorAll(".o_action_manager").forEach(ensure);
}

const docObserver = new MutationObserver(() => requestAnimationFrame(processAll));
docObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
});

requestAnimationFrame(processAll);

/** @odoo-module **/

function setup(strip) {
    if (strip.dataset.mcpStripReady) return;
    strip.dataset.mcpStripReady = "1";

    const scrollEl = strip.querySelector(".mcp_breadcrumb_scroll");
    const leftBtn = strip.querySelector(".mcp_scroll_left");
    const rightBtn = strip.querySelector(".mcp_scroll_right");
    if (!scrollEl || !leftBtn || !rightBtn) {
        return;
    }

    const update = () => {
        const sw = scrollEl.scrollWidth;
        const cw = scrollEl.clientWidth;
        const sl = scrollEl.scrollLeft;
        const overflow = sw > cw + 1;
        leftBtn.hidden = !overflow || sl <= 1;
        rightBtn.hidden = !overflow || sl + cw >= sw - 1;
        strip.classList.toggle("mcp_has_overflow", overflow);
    };

    const scrollByDir = (dir) => {
        scrollEl.scrollBy({
            left: dir * scrollEl.clientWidth * 0.7,
            behavior: "smooth",
        });
    };

    leftBtn.addEventListener("click", () => scrollByDir(-1));
    rightBtn.addEventListener("click", () => scrollByDir(1));
    scrollEl.addEventListener("scroll", update, { passive: true });

    const ro = new ResizeObserver(update);
    ro.observe(scrollEl);
    ro.observe(strip);

    const mo = new MutationObserver(update);
    mo.observe(scrollEl, {
        childList: true,
        subtree: true,
        characterData: true,
    });

    requestAnimationFrame(update);
}

function processAll() {
    document
        .querySelectorAll(".mcp_breadcrumb_strip:not([data-mcp-strip-ready])")
        .forEach(setup);
}

const docObserver = new MutationObserver(processAll);
docObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", processAll);
} else {
    processAll();
}

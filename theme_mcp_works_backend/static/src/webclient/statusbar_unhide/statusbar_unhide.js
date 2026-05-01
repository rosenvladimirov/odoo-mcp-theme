/** @odoo-module **/

/**
 * MCP Works — Statusbar wizard-steps un-hider.
 *
 * Odoo 19's o_field_statusbar normally collapses every non-active step
 * into a "More" dropdown when it thinks the row is narrow. On wider
 * layouts this still kicks in for readonly/disabled forms (the env's
 * isSmall flag isn't always accurate for our paper/indigo theme).
 *
 * We force-show all wizard steps as a chevron strip:
 *   1) strip `.d-none` off every `.o_arrow_button` that isn't itself a
 *      dropdown trigger (the "More" overflow buttons stay hidden);
 *   2) hide the responsive "single-step dropdown" fallback so it doesn't
 *      duplicate the active step;
 *   3) re-run on every DOM mutation, since Odoo's reactive layer adds
 *      `.d-none` back on each render.
 */

function unhideStatusbarSteps(root) {
    const scope = root || document;

    /* 1. Show all step buttons (hide-class scrubbed) */
    scope.querySelectorAll(
        ".o_field_statusbar .o_arrow_button.d-none"
    ).forEach((btn) => {
        if (btn.classList.contains("dropdown-toggle")) return;  // keep "More" overflow buttons hidden
        btn.classList.remove("d-none");
    });

    /* 2. Hide the compact "single-step dropdown" trigger
          (the lone .dropdown-toggle that's NOT an arrow button) */
    scope.querySelectorAll(
        ".o_field_statusbar > .o_statusbar_status > .dropdown-toggle:not(.o_arrow_button)"
    ).forEach((btn) => {
        if (!btn.classList.contains("d-none")) btn.classList.add("d-none");
    });
}

/* Throttled scheduler */
let pending = false;
function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
        pending = false;
        unhideStatusbarSteps();
    });
}

function boot() {
    unhideStatusbarSteps();
    if ("MutationObserver" in window) {
        const mo = new MutationObserver(schedule);
        mo.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"],
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
    boot();
}

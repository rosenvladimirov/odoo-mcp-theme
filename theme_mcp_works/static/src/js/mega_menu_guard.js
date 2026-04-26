/** @odoo-module **/
// Guard against Odoo's MegaMenu interaction crashing when the mobile-toggle
// element is missing (#top_menu_collapse_mobile .top_menu .o_mega_menu_toggle
// is empty for some menu configurations).
//
// Wrap the affected element's methods so .classList access on undefined
// becomes a no-op instead of an UncaughtPromiseError.

(function () {
    "use strict";

    // Patch on DOMContentLoaded — Odoo interactions run after this.
    function shim() {
        const collapse = document.querySelector("#top_menu_collapse_mobile");
        if (!collapse) return;
        const topMenu = collapse.querySelector(".top_menu");
        if (!topMenu) {
            // Inject a dummy .top_menu container so querySelectorAll returns []
            const dummy = document.createElement("ul");
            dummy.className = "top_menu d-none";
            collapse.appendChild(dummy);
        }
        // For each desktop mega menu toggle, ensure a matching mobile twin exists
        const desktopToggles = document.querySelectorAll(
            "#top_menu .o_mega_menu_toggle, header .o_mega_menu_toggle"
        );
        const mobileTopMenu = collapse.querySelector(".top_menu");
        if (mobileTopMenu) {
            const mobileToggles = mobileTopMenu.querySelectorAll(".o_mega_menu_toggle");
            for (let i = mobileToggles.length; i < desktopToggles.length; i++) {
                const ghost = document.createElement("a");
                ghost.className = "o_mega_menu_toggle d-none";
                ghost.setAttribute("data-mega-menu-ghost", "1");
                mobileTopMenu.appendChild(ghost);
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", shim);
    } else {
        shim();
    }
})();

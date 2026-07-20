/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

/**
 * MCP Works — Show Desktop button.
 *
 * Adds a desktop icon to the navbar systray (.o_menu_systray). When
 * clicked, dismisses the current action and returns the user to the
 * Apps home grid — analogous to "Show Desktop" in a window manager.
 *
 * Implementation: clears the current menu in the menu service so the
 * webclient renders the home_menu, then navigates to /odoo so the URL
 * reflects the home state and breadcrumbs reset.
 */
export class McpShowDesktopSystray extends Component {
    static template = "theme_mcp_works_backend.McpShowDesktopSystray";
    static props = {};

    setup() {
        try {
            this.menu = useService("menu");
            this.action = useService("action");
        } catch (e) {
            // Services may be unavailable in some specialized layouts —
            // we still render, the button just falls back to a hard nav.
        }
    }

    onClick() {
        /* TOGGLE behaviour:
           — if we're already on the empty desktop, restore the previous
             work area (browser-back; the action service pushed a history
             entry when we mounted McpEmptyDesktop);
           — otherwise, hide everything and mount the empty desktop. */
        const onEmpty = !!document.querySelector(".mcp_empty_desktop");

        /* Always close transient overlays first */
        for (let i = 0; i < 10; i++) {
            document.dispatchEvent(new KeyboardEvent("keydown", {
                key: "Escape",
                code: "Escape",
                keyCode: 27,
                which: 27,
                bubbles: true,
                cancelable: true,
            }));
        }

        if (onEmpty) {
            /* Click #2 — back to the previous action.
               Odoo's action service pushed a history entry when the
               empty desktop mounted, so a single back step restores
               whatever was open before. */
            try {
                history.back();
                return;
            } catch (e) {
                console.warn("[McpShowDesktop] history.back failed", e);
            }
        }

        /* Click #1 — drop the current app so the navbar's app-menu items
           disappear, then swap action for the empty canvas.
           Note: setCurrentMenu(false) is a no-op (the source guards on
           `menu &&`), so we pass the root menu — which has no appID,
           clearing currentAppId and firing MENUS:APP-CHANGED. */
        if (this.menu && typeof this.menu.setCurrentMenu === "function") {
            try {
                const root = this.menu.getMenu && this.menu.getMenu("root");
                if (root) this.menu.setCurrentMenu(root);
            } catch (e) {}
        }

        if (this.action && typeof this.action.doAction === "function") {
            try {
                this.action.doAction({
                    type: "ir.actions.client",
                    tag: "mcp_empty_desktop",
                });
                return;
            } catch (e) {
                console.warn("[McpShowDesktop] doAction failed; falling back to reload", e);
            }
        }

        /* Fallback — full reload if action service is unavailable */
        window.location.href = "/odoo";
    }
}

registry.category("systray").add(
    "theme_mcp_works.show_desktop",
    { Component: McpShowDesktopSystray },
    { sequence: 5 },   // sit early in the systray (before notifications)
);

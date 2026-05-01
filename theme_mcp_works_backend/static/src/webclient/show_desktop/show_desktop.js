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
        // 1) Clear current menu so the home menu is rendered
        if (this.menu && typeof this.menu.setCurrentMenu === "function") {
            try { this.menu.setCurrentMenu(false); } catch (e) {}
        }
        // 2) Hard navigate to /odoo — resets breadcrumbs, drops modals,
        //    closes any in-progress action. Equivalent to "Show Desktop".
        window.location.href = "/odoo";
    }
}

registry.category("systray").add(
    "theme_mcp_works.show_desktop",
    { Component: McpShowDesktopSystray },
    { sequence: 5 },   // sit early in the systray (before notifications)
);

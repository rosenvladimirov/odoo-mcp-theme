/** @odoo-module **/

import { Component, useState, onWillStart, onMounted, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { browser } from "@web/core/browser/browser";

export class McpDash extends Component {
    static template = "theme_mcp_works_backend.McpDash";
    static props = {};

    setup() {
        this.state = useState({
            apps: [],
            currentAppId: null,
            revealed: false,
            collapsed: false,
        });

        try {
            this.menu = useService("menu");
            this.action = useService("action");
        } catch (e) {
            console.warn("[McpDash] services unavailable", e);
        }

        try {
            this.state.collapsed = browser.localStorage.getItem("mcp_dash_collapsed") === "1";
        } catch (e) {}

        onWillStart(async () => {
            try {
                if (this.menu) {
                    const allApps = this.menu.getApps();
                    this.state.apps = (allApps || []).slice(0, 8);
                }
            } catch (e) {
                console.warn("[McpDash] getApps failed", e);
            }
        });

        this._hideTimer = null;
        this._revealHandler = null;
        this._cleanup = () => {};

        onMounted(() => {
            try {
                if (this.menu && this.menu.bus) {
                    const updateActive = () => {
                        try {
                            const cur = this.menu.getCurrentApp();
                            this.state.currentAppId = cur ? cur.id : null;
                        } catch (e) {}
                    };
                    this.menu.bus.addEventListener("MENUS:APP-CHANGED", updateActive);
                    updateActive();
                    this._cleanup = () => {
                        try {
                            this.menu.bus.removeEventListener("MENUS:APP-CHANGED", updateActive);
                        } catch (e) {}
                    };
                }

                this._revealHandler = (ev) => {
                    const winH = window.innerHeight;
                    const inHotZone = ev.clientY > winH - 28;
                    if (inHotZone) {
                        if (this._hideTimer) {
                            clearTimeout(this._hideTimer);
                            this._hideTimer = null;
                        }
                        this.state.revealed = true;
                    } else if (this.state.revealed && !ev.target.closest(".mcp_dash_dock")) {
                        if (!this._hideTimer) {
                            this._hideTimer = setTimeout(() => {
                                this.state.revealed = false;
                                this._hideTimer = null;
                            }, 600);
                        }
                    }
                };
                document.addEventListener("mousemove", this._revealHandler);
            } catch (e) {
                console.warn("[McpDash] mounted setup failed", e);
            }
        });

        onWillUnmount(() => {
            try { this._cleanup(); } catch (e) {}
            if (this._hideTimer) clearTimeout(this._hideTimer);
            if (this._revealHandler) document.removeEventListener("mousemove", this._revealHandler);
        });
    }

    onToggleCollapse() {
        this.state.collapsed = !this.state.collapsed;
        try {
            browser.localStorage.setItem("mcp_dash_collapsed", this.state.collapsed ? "1" : "0");
        } catch (e) {}
    }

    onAppClick(app) {
        try {
            this.menu.selectMenu(app);
        } catch (e) {
            console.warn("[McpDash] selectMenu failed", e);
        }
    }

    onShowAllClick() {
        const btn = document.querySelector(".o_navbar_apps_menu .dropdown-toggle");
        if (btn) {
            btn.click();
            return;
        }
        window.location.href = "/odoo";
    }

    onShowDesktopClick() {
        const b = document.body;
        if (b.classList.contains("mcp-show-desktop")) {
            b.classList.remove("mcp-show-desktop");
            return;
        }
        b.classList.add("mcp-show-desktop");
        const restore = (ev) => {
            if (ev.target.closest(".mcp_dash_dock") || ev.target.closest(".o_main_navbar")) {
                return;
            }
            b.classList.remove("mcp-show-desktop");
            document.removeEventListener("click", restore, true);
        };
        setTimeout(() => document.addEventListener("click", restore, true), 0);
    }
}

registry.category("main_components").add("McpDash", {
    Component: McpDash,
});

/** @odoo-module **/

import { Component, useState, useRef, onWillStart, onMounted, onWillUnmount, onPatched } from "@odoo/owl";
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
            appsOpen: false,
            viewMode: 0,  /* 0=compact, 1=list+names, 2=grid */
            canScrollUp: false,
            canScrollDown: false,
            hoveredAppName: "",
            hoveredY: 0,
            gridPage: 0,
        });
        this.appsScroll = useRef("appsScroll");
        this.dock = useRef("dock");
        this._prevAppsOpen = false;
        this._scrollHandler = null;

        try {
            this.menu = useService("menu");
            this.action = useService("action");
        } catch (e) {
            console.warn("[McpDash] services unavailable", e);
        }

        try {
            const saved = browser.localStorage.getItem("mcp_view_mode");
            if (saved !== null) this.state.viewMode = parseInt(saved, 10) || 0;
        } catch (e) {}

        onWillStart(async () => {
            try {
                if (this.menu) this.state.apps = this.menu.getApps() || [];
            } catch (e) {
                console.warn("[McpDash] getApps failed", e);
            }
        });

        this._cleanup = () => {};

        onMounted(() => {
            /* Inject trigger button before Odoo's apps menu in the navbar.
               Done via DOM (not XPath) because o_navbar_apps_menu lives
               inside a t-call sub-template, invisible to xpath on web.NavBar. */
            this._injectTrigger();

            /* Track active app */
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
                    try { this.menu.bus.removeEventListener("MENUS:APP-CHANGED", updateActive); } catch (e) {}
                };
            }

            /* Scroll tracking */
            this._updateScrollBtns = () => {
                const el = this.appsScroll.el;
                if (!el) return;
                this.state.canScrollUp = el.scrollTop > 0;
                this.state.canScrollDown = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
            };
            this._scrollHandler = () => this._updateScrollBtns();
            if (this.appsScroll.el) {
                this.appsScroll.el.addEventListener("scroll", this._scrollHandler, { passive: true });
            }
            setTimeout(() => this._updateScrollBtns && this._updateScrollBtns(), 100);

            /*
             * Delegated capture listener on document.
             * Opens/closes dock via the dedicated .mcp_apps_trigger button.
             */
            this._globalClickHandler = (ev) => {
                const trigger = ev.target.closest(".mcp_apps_trigger");
                const inDock  = ev.target.closest(".mcp_dash_modal");

                if (trigger) {
                    ev.stopPropagation();
                    ev.preventDefault();
                    this.state.appsOpen = !this.state.appsOpen;
                    return;
                }

                if (!this.state.appsOpen) return;

                if (!inDock) {
                    this.state.appsOpen = false;
                }
            };
            document.addEventListener("click", this._globalClickHandler, true);
        });

        onPatched(() => {
            if (this._updateScrollBtns) this._updateScrollBtns();

            /* Sync active class on trigger button */
            const trigger = document.querySelector(".mcp_apps_trigger");
            if (trigger) {
                trigger.classList.toggle("is-active", this.state.appsOpen);
            }

            if (this.state.appsOpen && !this._prevAppsOpen) {
                /* Restart modal + item animations on each open */
                const el = this.dock.el;
                if (el) {
                    el.style.animation = "none";
                    el.getBoundingClientRect();
                    el.style.animation = "";
                    const items = el.querySelectorAll(".mcp_dash_item");
                    items.forEach(item => { item.style.animation = "none"; });
                    el.getBoundingClientRect();
                    items.forEach(item => { item.style.animation = ""; });
                }
            }
            this._prevAppsOpen = this.state.appsOpen;
        });

        onWillUnmount(() => {
            try { this._cleanup(); } catch (e) {}
            if (this._globalClickHandler) document.removeEventListener("click", this._globalClickHandler, true);
            if (this._scrollHandler && this.appsScroll.el) {
                this.appsScroll.el.removeEventListener("scroll", this._scrollHandler);
            }
            if (this._triggerEl && this._triggerEl.parentNode) {
                this._triggerEl.parentNode.removeChild(this._triggerEl);
            }
        });
    }

    _injectTrigger() {
        if (document.querySelector(".mcp_apps_trigger")) return;
        const btn = document.createElement("button");
        btn.className = "mcp_apps_trigger d-print-none";
        btn.title = "Приложения";
        btn.setAttribute("aria-label", "Приложения");
        btn.innerHTML = '<i class="oi oi-apps"></i>';
        /* Insert before o_navbar_apps_menu, or as first child of o_main_navbar */
        const anchor = document.querySelector(".o_navbar_apps_menu") ||
                       document.querySelector(".o_main_navbar");
        if (anchor && anchor.classList.contains("o_navbar_apps_menu")) {
            anchor.parentNode.insertBefore(btn, anchor);
        } else if (anchor) {
            anchor.insertBefore(btn, anchor.firstChild);
        }
        this._triggerEl = btn;
    }

    onScrollUp() {
        const el = this.appsScroll.el;
        if (el) el.scrollBy({ top: -50, behavior: "smooth" });
    }

    onScrollDown() {
        const el = this.appsScroll.el;
        if (el) el.scrollBy({ top: 50, behavior: "smooth" });
    }

    get currentApps() {
        if (this.state.viewMode === 2) {
            return this.state.apps.slice(this.state.gridPage * 20, (this.state.gridPage + 1) * 20);
        }
        return this.state.apps;
    }

    get gridPageCount() {
        return Math.ceil(this.state.apps.length / 20);
    }

    onGridPrevPage() {
        this.state.gridPage = Math.max(0, this.state.gridPage - 1);
    }

    onGridNextPage() {
        this.state.gridPage = Math.min(this.gridPageCount - 1, this.state.gridPage + 1);
    }

    onToggleViewMode() {
        this.state.viewMode = (this.state.viewMode + 1) % 3;
        this.state.gridPage = 0;
        try {
            browser.localStorage.setItem("mcp_view_mode", String(this.state.viewMode));
        } catch (e) {}
    }

    onAppClick(app) {
        this.state.appsOpen = false;
        this.state.hoveredAppName = "";
        try {
            this.menu.selectMenu(app);
        } catch (e) {
            console.warn("[McpDash] selectMenu failed", e);
        }
    }

    onAppMouseEnter(app, ev) {
        this.state.hoveredAppName = app.name;
        if (this.state.viewMode === 0 && ev && this.dock.el) {
            const dockRect = this.dock.el.getBoundingClientRect();
            const itemRect = ev.currentTarget.getBoundingClientRect();
            this.state.hoveredY = itemRect.top - dockRect.top + itemRect.height / 2;
        }
    }

    onAppMouseLeave() {
        this.state.hoveredAppName = "";
    }
}

registry.category("main_components").add("McpDash", {
    Component: McpDash,
});

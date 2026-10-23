/** @odoo-module **/

import { Component, useState, useRef, onWillStart, onMounted, onWillUnmount, onPatched } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { browser } from "@web/core/browser/browser";
import { _t } from "@web/core/l10n/translation";
import { McpAppIcon } from "@theme_mcp_works_backend/webclient/app_icon/app_icon";

export class McpDash extends Component {
    static template = "theme_mcp_works_backend.McpDash";
    static props = {};
    static components = { McpAppIcon };

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
            pinned: false,    /* закачен вляво: стои постоянно, съдържанието се измества */
            autoHide: false,  /* само при закачен: прибира се до ръба, показва се при посочване */
            peek: false,      /* автоскрит док, временно показан */
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
            this.state.pinned = browser.localStorage.getItem("mcp_dash_pinned") === "1";
            this.state.autoHide = browser.localStorage.getItem("mcp_dash_autohide") === "1";
        } catch (e) {}
        /* Решетката е центриран модал — закачен док не може да е решетка. */
        if (this.state.pinned && this.state.viewMode === 2) this.state.viewMode = 1;
        this._hideTimer = null;

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
                    if (this.state.pinned) {
                        /* Закачен: бутонът само показва/прибира автоскрития док. */
                        if (this.state.autoHide) this.state.peek = !this.state.peek;
                        return;
                    }
                    this.state.appsOpen = !this.state.appsOpen;
                    return;
                }

                if (this.state.pinned) {
                    if (this.state.peek && !inDock) this.state.peek = false;
                    return;
                }
                if (!this.state.appsOpen) return;

                if (!inDock) {
                    this.state.appsOpen = false;
                }
            };
            document.addEventListener("click", this._globalClickHandler, true);
        });

        onMounted(() => {
            this._syncPinnedLayout();
            /* Ширината се анимира при смяна на режима — измести съдържанието
               отново, когато анимацията свърши, а не по междинната ширина. */
            this._onDockTransition = (ev) => {
                if (ev.target === this.dock.el && ev.propertyName === "width") {
                    this._syncPinnedLayout();
                }
            };
            if (this.dock.el) this.dock.el.addEventListener("transitionend", this._onDockTransition);
        });

        onPatched(() => {
            if (this._updateScrollBtns) this._updateScrollBtns();
            this._syncPinnedLayout();

            /* is-active на бутона се синхронизира в _syncPinnedLayout */

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
            clearTimeout(this._hideTimer);
            if (this._onDockTransition && this.dock.el) {
                this.dock.el.removeEventListener("transitionend", this._onDockTransition);
            }
            this._setPinnedLayout(false, 0);
        });
    }

    /* Закаченият док измества съдържанието наляво с ширината си през клас и
       CSS променлива на .o_web_client. Автоскритият отстъпва само ивицата по
       ръба: показаният док лежи отгоре като панел, за да не скача изгледът. */
    _syncPinnedLayout() {
        let width = 0;
        if (this.state.pinned && this.dock.el) {
            width = this.state.autoHide
                ? parseFloat(getComputedStyle(this.dock.el).getPropertyValue("--mcp-sp-6")) || 6
                : this.dock.el.offsetWidth;
        }
        this._setPinnedLayout(this.state.pinned, width);
        const trigger = document.querySelector(".mcp_apps_trigger");
        if (trigger) {
            trigger.classList.toggle("is-active",
                this.state.pinned ? this.state.peek : this.state.appsOpen);
        }
    }

    _setPinnedLayout(pinned, width) {
        const wc = document.querySelector(".o_web_client");
        if (!wc) return;
        wc.classList.toggle("mcp_dash_pinned", pinned && width > 0);
        if (pinned && width > 0) {
            wc.style.setProperty("--mcp-dash-pinned-w", width + "px");
        } else {
            wc.style.removeProperty("--mcp-dash-pinned-w");
        }
    }

    _store(key, on) {
        try {
            browser.localStorage.setItem(key, on ? "1" : "0");
        } catch (e) {}
    }

    get pinTitle() {
        return this.state.pinned ? _t("Unpin") : _t("Pin to the left");
    }

    get autoHideTitle() {
        return this.state.autoHide ? _t("Auto-hide: on") : _t("Auto-hide: off");
    }

    onTogglePin() {
        this.state.pinned = !this.state.pinned;
        this.state.appsOpen = false;
        this.state.peek = false;
        if (this.state.pinned && this.state.viewMode === 2) {
            this.state.viewMode = 1;
            try { browser.localStorage.setItem("mcp_view_mode", "1"); } catch (e) {}
        }
        this._store("mcp_dash_pinned", this.state.pinned);
    }

    get lockTitle() {
        return _t("Lock screen (screen saver)");
    }

    /* Скрийнсейвърът е в конфигуратора — тук само събитието, без зависимост */
    onLock() {
        this.state.appsOpen = false;
        window.dispatchEvent(new CustomEvent("mcp-screensaver-start"));
    }

    onToggleAutoHide() {
        this.state.autoHide = !this.state.autoHide;
        this.state.peek = false;
        this._store("mcp_dash_autohide", this.state.autoHide);
    }

    /* Автоскриване: показва се при посочване на ръба/дока, прибира се с
       малко закъснение след излизане, за да не трепти при бегло минаване. */
    onDockEnter() {
        if (!this.state.pinned || !this.state.autoHide) return;
        clearTimeout(this._hideTimer);
        this.state.peek = true;
    }

    onDockLeave() {
        if (!this.state.pinned || !this.state.autoHide) return;
        clearTimeout(this._hideTimer);
        this._hideTimer = setTimeout(() => {
            this.state.peek = false;
            this.state.hoveredAppName = "";
        }, 400);
    }

    _injectTrigger() {
        if (document.querySelector(".mcp_apps_trigger")) return;
        const btn = document.createElement("button");
        btn.className = "mcp_apps_trigger d-print-none";
        /* преводимо: „Приложения“ идва от i18n */
        btn.title = _t("Apps");
        btn.setAttribute("aria-label", _t("Apps"));
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
        /* Закачен: само компактен ↔ с имена (решетката е модал). */
        this.state.viewMode = this.state.pinned
            ? (this.state.viewMode === 0 ? 1 : 0)
            : (this.state.viewMode + 1) % 3;
        this.state.gridPage = 0;
        try {
            browser.localStorage.setItem("mcp_view_mode", String(this.state.viewMode));
        } catch (e) {}
    }

    onAppClick(app) {
        this.state.appsOpen = false;
        this.state.peek = false;
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

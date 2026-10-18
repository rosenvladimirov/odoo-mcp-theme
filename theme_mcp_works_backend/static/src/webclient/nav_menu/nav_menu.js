/** @odoo-module **/
// Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import { Component, onMounted, onWillUnmount, useRef, useState } from "@odoo/owl";
import { patch } from "@web/core/utils/patch";
import { NavBar } from "@web/webclient/navbar/navbar";

/* Падащите менюта на секциите в навбара (Отчитане, Конфигурация…).
   При много подменюта списъкът излизаше под ръба на екрана (Rosen 18.10).
   1) Групите (dropdown-header) са акордеон: затворени по подразбиране,
      отварят се с клик; отвореното се помни до презареждане.
   2) Ако списъкът пак е по-висок от екрана, кутията се скролира, а горе и
      долу се показват стрелки като в Dash. */
export class McpScrollBox extends Component {
    static template = "theme_mcp_works_backend.McpScrollBox";
    static props = { slots: Object };

    setup() {
        this.body = useRef("body");
        this.state = useState({ up: false, down: false, maxHeight: 0 });
        onMounted(() => {
            const el = this.body.el;
            this._update = () => this.update();
            el.addEventListener("scroll", this._update, { passive: true });
            window.addEventListener("resize", this._update);
            // акордеонът сменя височината на съдържанието
            this._ro = new ResizeObserver(this._update);
            this._ro.observe(el.firstElementChild || el);
            this.update();
        });
        onWillUnmount(() => {
            this.body.el?.removeEventListener("scroll", this._update);
            window.removeEventListener("resize", this._update);
            this._ro?.disconnect();
        });
    }

    update() {
        const el = this.body.el;
        if (!el) {
            return;
        }
        // наличното място: до долния ръб на екрана, но и не повече от
        // max-height, който popover-ът на Odoo дава на менюто (иначе
        // съдържанието прелива под него — менюто е overflow: visible)
        let avail = window.innerHeight - el.getBoundingClientRect().top - 24;
        const menu = el.closest(".o-dropdown--menu");
        if (menu) {
            const cs = getComputedStyle(menu);
            const menuMax = parseFloat(cs.maxHeight);
            if (Number.isFinite(menuMax)) {
                avail = Math.min(
                    avail,
                    menuMax - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 2
                );
            }
        }
        const content = el.firstElementChild ? el.firstElementChild.offsetHeight : el.scrollHeight;
        // при преливане — място и за двете стрелки (22px + 4px отстъп)
        this.state.maxHeight = Math.max(120, content > avail ? avail - 52 : avail);
        this.state.up = el.scrollTop > 0;
        this.state.down = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
    }

    scrollBy(delta) {
        this.body.el?.scrollBy({ top: delta, behavior: "smooth" });
    }
}

patch(NavBar.prototype, {
    setup() {
        super.setup();
        this.mcpNavGroups = useState({});
    },
    mcpToggleNavGroup(id) {
        this.mcpNavGroups[id] = !this.mcpNavGroups[id];
    },
});
NavBar.components = { ...NavBar.components, McpScrollBox };

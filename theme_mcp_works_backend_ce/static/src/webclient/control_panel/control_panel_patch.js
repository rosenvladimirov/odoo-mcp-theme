/** @odoo-module **/
// Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import { ControlPanel } from "@web/search/control_panel/control_panel";
import { patch } from "@web/core/utils/patch";
import { NavBar } from "@web/webclient/navbar/navbar";
import { McpAppIcon } from "@theme_mcp_works_backend/webclient/app_icon/app_icon";

/* Наследените шаблони (control_panel.xml) ползват <McpAppIcon/> в марката
   на приложението в пътечката и в менюто на приложенията — компонентът
   трябва да е регистриран при самите ControlPanel и NavBar. */
ControlPanel.components = { ...ControlPanel.components, McpAppIcon };
NavBar.components = { ...NavBar.components, McpAppIcon };

/* Вградените действия са само в менюто до „Нов“ (control_panel_cp.xml, (0)):
   отделният ред ги няма (Росен, 25.10.2026). Запазеното „показан“ от преди
   не се взима, а превключването не прави нищо — иначе ядрото отваря менюто
   на скрития ред само (useEffect при един видим елемент) и то виси на екрана. */
patch(ControlPanel.prototype, {
    setup() {
        super.setup(...arguments);
        this.state.embeddedInfos.showEmbedded = false;
    },
    async onClickShowEmbedded() {},
});

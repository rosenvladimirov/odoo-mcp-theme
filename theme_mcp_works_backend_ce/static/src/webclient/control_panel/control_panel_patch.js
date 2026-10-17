/** @odoo-module **/
// Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import { ControlPanel } from "@web/search/control_panel/control_panel";
import { NavBar } from "@web/webclient/navbar/navbar";
import { McpAppIcon } from "@theme_mcp_works_backend/webclient/app_icon/app_icon";

/* Наследените шаблони (control_panel.xml) ползват <McpAppIcon/> в марката
   на приложението в пътечката и в менюто на приложенията — компонентът
   трябва да е регистриран при самите ControlPanel и NavBar. */
ControlPanel.components = { ...ControlPanel.components, McpAppIcon };
NavBar.components = { ...NavBar.components, McpAppIcon };

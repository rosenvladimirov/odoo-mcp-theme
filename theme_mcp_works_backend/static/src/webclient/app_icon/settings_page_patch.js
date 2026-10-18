/** @odoo-module **/
// Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import { SettingsPage } from "@web/webclient/settings_form_view/settings/settings_page";
import { McpModuleIcon } from "./app_icon";

// наследеният шаблон на табовете ползва McpModuleIcon
SettingsPage.components = { ...SettingsPage.components, McpModuleIcon };

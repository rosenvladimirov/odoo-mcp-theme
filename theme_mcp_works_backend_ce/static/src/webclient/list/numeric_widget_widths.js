/** @odoo-module **/
// Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import { registry } from "@web/core/registry";
import { FIELD_WIDTHS } from "@web/views/list/column_width_hook";

/* Ширината на колона в списък идва от FIELD_WIDTHS[widget || тип] или от
   listViewWidth на полето. Часовете в таймшита (widget timesheet_uom на
   hr_timesheet) нямат нито едното: колоната се смята за текст и расте
   наравно с описанието — „Изразходвано време“ ставаше по-широко от
   „Описание“ (Росен, 25.10.2026). Тук им се дава ширината на число (float).
   Без зависимост от hr_timesheet: поправката се прилага, щом полето се
   регистрира (или веднага, ако вече е там). */
const NUMERIC_WIDGETS = ["timesheet_uom", "timesheet_uom_no_toggle"];
const fields = registry.category("fields");

function setNumericWidth(key) {
    if (!NUMERIC_WIDGETS.includes(key) || !fields.contains(key)) {
        return;
    }
    const field = fields.get(key);
    if (!field.listViewWidth) {
        field.listViewWidth = FIELD_WIDTHS.float;
    }
}

NUMERIC_WIDGETS.forEach(setNumericWidth);
fields.addEventListener("UPDATE", ({ detail }) => {
    if (detail.operation === "add") {
        setNumericWidth(detail.key);
    }
});

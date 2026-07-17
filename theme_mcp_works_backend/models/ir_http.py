# Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        # Подаваме избрания UI фонт в session_info, за да го приложи
        # apply_font.js ПРЕДИ webclient-а да се рисува (без FOUT).
        result = super().session_info()
        result["mcp_ui_font"] = self.env["ir.config_parameter"].sudo().get_param(
            "theme_mcp_works_backend.ui_font", "system"
        )
        return result

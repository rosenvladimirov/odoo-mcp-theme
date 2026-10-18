# Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import api, models

SITE_MODE_PARAM = "theme_mcp_works_frontend.site_mode"
SITE_MODES = ("follow", "off")


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    @api.model
    def _mcp_frontend_site_mode(self):
        mode = self.env["ir.config_parameter"].sudo().get_param(
            SITE_MODE_PARAM, "follow")
        return mode if mode in SITE_MODES else "follow"

    @api.model
    def _mcp_frontend_html_data(self, html_data):
        """Връща НОВ речник: заварените html_data + data-mcp-* + style с --mcp-*.

        При site_mode=off връща оригинала непроменен (нулев ефект). Вика се от
        views/frontend_layout.xml след website.layout, т.е. разширява готовия
        речник (lang, data-website-id, data-editable…), без да го подменя.
        """
        if self._mcp_frontend_site_mode() != "follow":
            return html_data
        theme = self._mcp_frontend_theme()
        data = dict(html_data or {})
        for key, value in (theme.get("attrs") or {}).items():
            # атрибутите са само data-mcp-* (QWeb ги екранира като HTML)
            if (isinstance(key, str) and key.startswith("data-mcp-")
                    and isinstance(value, str) and value):
                data[key] = value
        data["data-mcp-site"] = "follow"
        # защита в дълбочина: всяка стойност минава отново през валидатора,
        # ако трети модул е наследил hook-а
        declarations = [
            "%s: %s" % (key, str(value).strip())
            for key, value in (theme.get("vars") or {}).items()
            if self._mcp_css_value_ok(key, value)
        ]
        if declarations:
            own = "; ".join(declarations) + ";"
            existing = (data.get("style") or "").strip()
            if existing and not existing.endswith(";"):
                existing += ";"
            data["style"] = (existing + " " + own).strip() if existing else own
        return data

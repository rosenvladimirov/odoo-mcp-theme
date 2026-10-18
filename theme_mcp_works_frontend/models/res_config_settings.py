# Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    # Глобален ключ (ICP), не по уебсайт — D12. set_param чисти кеша
    # 'stable', а с него и кешираните страници за анонимни (PLAN §2.7).
    mcp_site_mode = fields.Selection(
        selection=[
            ("follow", "Follow the MCP preset"),
            ("off", "Off (Odoo Website Builder styles)"),
        ],
        string="Website follows MCP theme",
        default="follow",
        config_parameter="theme_mcp_works_frontend.site_mode",
        help="Follow: the public website, portal, shop, blog and login use "
             "the accent, light/dark mode, radius and font of the backend "
             "preset; colours, fonts and button shapes chosen in the Website "
             "Builder Theme tab are overridden. Off: the website looks "
             "exactly as without this module.",
    )

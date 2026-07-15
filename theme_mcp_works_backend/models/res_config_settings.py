# Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models, release

# Selectable backend UI fonts. Keys mirror the :root[data-mcp-font="…"]
# overrides in static/src/scss/fonts_selectable.scss.
UI_FONTS = [
    ("system", "System (Roboto / native stack)"),
    ("inter", "Inter — neutral, most legible"),
    ("plex", "IBM Plex Sans — engineered / hi-tech"),
    ("golos", "Golos Text — Cyrillic-first"),
    ("grotesk", "Space Grotesk — Latin only"),
]


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    mcp_ui_font = fields.Selection(
        selection=UI_FONTS,
        string="Backend UI font",
        default="system",
        config_parameter="theme_mcp_works_backend.ui_font",
        help="Typeface used across the whole Odoo backend UI. Every bundled "
             "option ships both Cyrillic and Latin, so multilingual text "
             "renders in one face (Space Grotesk is Latin only). Applied live "
             "after saving and reloading.",
    )

    # ── Installation info (read-only) ──────────────────────────────────
    mcp_db_name = fields.Char(
        string="Database", compute="_compute_mcp_info")
    mcp_odoo_version = fields.Char(
        string="Odoo version", compute="_compute_mcp_info")
    mcp_theme_version = fields.Char(
        string="Theme version", compute="_compute_mcp_info")
    mcp_module_count = fields.Integer(
        string="Installed modules", compute="_compute_mcp_info")
    mcp_font_count = fields.Integer(
        string="Selectable UI fonts", compute="_compute_mcp_info")

    @api.depends_context("uid")
    def _compute_mcp_info(self):
        module = self.env["ir.module.module"].sudo()
        installed = module.search_count([("state", "=", "installed")])
        theme = module.search(
            [("name", "=", "theme_mcp_works_backend")], limit=1)
        # всички стойности са еднакви за трейнзиънт записа — четем веднъж
        db_name = self.env.cr.dbname
        version = release.version
        theme_version = theme.installed_version or theme.latest_version or ""
        # брой избираеми UI фонтове (без "system", което е native)
        font_count = len([k for k, _ in UI_FONTS if k != "system"])
        for rec in self:
            rec.mcp_db_name = db_name
            rec.mcp_odoo_version = version
            rec.mcp_theme_version = theme_version
            rec.mcp_module_count = installed
            rec.mcp_font_count = font_count

# Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import logging
import re

from odoo import api, models

from .res_config_settings import UI_FONTS

_logger = logging.getLogger(__name__)

# ── Валидатор за стойности, които сървърът слага в style="…" ────────────
# QWeb екранира HTML, но не и CSS: всяка стойност, която стига до inline
# стила на <html> на публичния сайт, минава през този whitelist (ADR
# theme-mcp-frontend/0001, PLAN §2.4).
_MCP_CSS_KEY_RE = re.compile(r"^--mcp-[a-z0-9-]{1,48}$")
_MCP_CSS_MAX_LEN = 200
# забранени знаци и конструкции — глобален отказ преди формите
_MCP_CSS_BAD_CHARS = set(';{}<>\\"\'@')
_MCP_CSS_BAD_TOKENS = ("url(", "expression(", "/*", "image(", "image-set(")
# позволените форми на един „атом“
_MCP_CSS_ATOM_RES = tuple(re.compile(p, re.IGNORECASE) for p in (
    r"^#[0-9a-f]{3,8}$",
    r"^rgba?\([\d\s.,%/]+\)$",
    r"^hsla?\([\d\s.,%/a-z]+\)$",
    r"^color-mix\(in (srgb|oklab|oklch),[^;{}<>]*\)$",
    r"^var\(--mcp-[a-z0-9-]+\)$",
    r"^-?\d+(\.\d+)?(px|rem|em|%|ms|s)?$",
    r"^calc\([0-9a-z\s.+\-*/()%,]+\)$",
    r"^(none|transparent|inherit|currentcolor)$",
))
# копчета с числов обхват / избор (ключ → проверка)
_MCP_CSS_RANGES = {
    "--mcp-radius-scale": (0.0, 4.0),
    "--mcp-font-scale": (0.75, 1.5),
}


def _mcp_split_css_list(value):
    """Разделя списък от атоми по интервал/запетая на най-горно ниво
    (запетаите и интервалите в скоби остават в атома — rgba(), calc())."""
    parts, depth, buf = [], 0, []
    for ch in value:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth < 0:
                return None
        if depth == 0 and (ch.isspace() or ch == ","):
            if buf:
                parts.append("".join(buf))
                buf = []
            continue
        buf.append(ch)
    if depth != 0:
        return None
    if buf:
        parts.append("".join(buf))
    return parts


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        # Подаваме избрания UI фонт в session_info, за да го приложи
        # apply_font.js ПРЕДИ webclient-а да се рисува (без FOUT).
        result = super().session_info()
        result["mcp_ui_font"] = self.env["ir.config_parameter"].sudo().get_param(
            "theme_mcp_works_backend.ui_font", "system"
        )
        # иконките на приложенията: "theme" (рисувани от темата) или "odoo"
        result["mcp_app_icons"] = self.env["ir.config_parameter"].sudo().get_param(
            "theme_mcp_works_backend.app_icons", "theme"
        )
        return result

    # ── Hook за публичния сайт (theme_mcp_works_frontend) ──────────────
    @api.model
    def _mcp_frontend_theme(self):
        """Темата за frontend страниците: ``{"attrs": {...}, "vars": {...}}``.

        Ядрото дава само UI шрифта (безплатното ниво); конфигураторът
        наследява метода и добавя фирмените стойности на пресета. Бекенд
        поведението (session_info) не зависи от този метод.
        """
        font = self.env["ir.config_parameter"].sudo().get_param(
            "theme_mcp_works_backend.ui_font", "system")
        if font not in {key for key, _label in UI_FONTS}:
            font = "system"
        return {"attrs": {"data-mcp-font": font}, "vars": {}}

    @api.model
    def _mcp_css_value_ok(self, key, value):
        """True, ако двойката ``key: value`` е безопасна за inline style.

        Ключът е ``--mcp-*``; стойността е цвят, дължина, var(--mcp-*),
        calc(), color-mix() или списък от тях (сенки). Всичко друго се
        отхвърля, а причината се записва в лога без самата стойност.
        """
        ok = self._mcp_css_value_check(key, value)
        if not ok:
            _logger.warning(
                "theme_mcp_works_backend: rejected CSS value for %s", key)
        return ok

    @api.model
    def _mcp_css_value_check(self, key, value):
        # без лог — само решението (ползва се и от тестовете)
        if not isinstance(key, str) or not _MCP_CSS_KEY_RE.match(key):
            return False
        if isinstance(value, bool) or not isinstance(value, (str, int, float)):
            return False
        value = str(value).strip()
        if not value or len(value) > _MCP_CSS_MAX_LEN:
            return False
        if any(ch in _MCP_CSS_BAD_CHARS for ch in value):
            return False
        lowered = value.lower()
        if any(tok in lowered for tok in _MCP_CSS_BAD_TOKENS):
            return False
        if key in _MCP_CSS_RANGES:
            low, high = _MCP_CSS_RANGES[key]
            try:
                number = float(value)
            except ValueError:
                return False
            return low <= number <= high
        atoms = _mcp_split_css_list(value)
        if not atoms:
            return False
        return all(
            any(rx.match(atom) for rx in _MCP_CSS_ATOM_RES) for atom in atoms)

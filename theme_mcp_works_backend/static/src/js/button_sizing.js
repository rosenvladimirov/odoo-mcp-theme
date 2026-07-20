/** @odoo-module **/

/* MCP Works backend — Robot Theme · uniform button sizing.
 *
 * Every backend button is sized through the shared size calculator
 * (sizing.js → computeButtonWidth): measure ONE canonical height,
 * classify square (icon-only) vs rectangular (labelled), then
 *   - rectangular → min-width = a consistent proportion (labels longer
 *     than that still grow — a min-width never clips);
 *   - square      → width = height = a perfect HUD square.
 *
 * The calculator's results are published ONCE as CSS custom
 * properties on :root (--mcp-btn-h-live / --mcp-btn-w-rect /
 * --mcp-btn-w-sq); every button's inline style only ever references
 * var(--mcp-…) — NO raw px is written anywhere (Rosen: "всичко на
 * променливи, нищо в директни пиксели"). Retune via --mcp-btn-h /
 * --mcp-btn-rect-ratio and it propagates.
 *
 * Idempotent (each button stamped with its current h:type — unchanged
 * buttons are skipped), rAF-throttled, re-runs on Odoo action swaps.
 * Mirrors the resizer.js / hud_corners.js MutationObserver pattern.
 */

import { computeButtonWidth, computeButtonHeight, classifyButton, getCSSVar } from "@theme_mcp_works_backend/js/sizing";

const ROOT = document.documentElement;

/* Canonical button height — DERIVED from the typography calculator
 * (line-height·font-size + 2·pad-y + 2·border, em/rem), so every
 * managed button gets the original prototype's bigger, font-scaled
 * box instead of a cramped fixed px (Rosen). Falls back to the
 * resolved --mcp-btn-h token, then 33. */
function baseButtonHeight() {
    const h = computeButtonHeight();
    if (Number.isFinite(h) && h > 0) return h;
    const tok = parseFloat(getCSSVar("--mcp-btn-h"));
    return Number.isFinite(tok) && tok > 0 ? tok : 33;
}

/* Publish the calculator's px results as :root variables (the ONLY
 * place a px number lives — single tunable source). Returns false
 * when nothing usable could be computed. */
let lastH = 0;
function publishVars(H) {
    if (H <= 0) return false;
    if (H !== lastH) {
        ROOT.style.setProperty("--mcp-btn-h-live", H + "px");
        ROOT.style.setProperty("--mcp-btn-w-sq", computeButtonWidth(H, "square") + "px");
        ROOT.style.setProperty("--mcp-btn-w-rect", computeButtonWidth(H, "rectangular") + "px");
        lastH = H;
    }
    return true;
}

/* Always-square buttons (icon togglers) regardless of classifyButton.
 * Odoo's compact icon dropdown-toggles carry the .border-0.p-0
 * signature and render the caret via a CSS ::after (no DOM icon →
 * classifyButton would mis-call them rectangular). (Rosen: "btn ...
 * p-0 border-0 ... dropdown-toggle това е по правилата за квадратните
 * бутони".) */
const FORCE_SQUARE =
    ".o_searchview_dropdown_toggler," +
    ".o_control_panel .btn.dropdown-toggle.border-0.p-0," +
    ".o_control_panel .btn.o-dropdown.dropdown-toggle.border-0," +
    /* Chatter Followers button: a user icon + a tiny count badge
       <sup class="o-mail-Followers-counter">1</sup>. classifyButton
       sees the "1" textContent → mis-calls it rectangular (91px min-
       width) so it isn't square like the sibling search/attach icon
       buttons (Rosen: "този бутон не е квадратен"). The counter is a
       badge, not a label → force square. */
    ".o-mail-Followers-button";

/* Search toggler is not a .btn — pick it up explicitly too. */
const MANAGED = ".btn, .o_searchview_dropdown_toggler";

/* Buttons we must NOT manage:
 *   - stat buttons          → owned by resizer.js equalizeStatButtons()
 *   - KPI dashboard cards    → own bespoke tile sizing
 *   - split-dropdown carets / optional-columns toggle → intrinsic width
 *   - anything opted out with [data-mcp-no-size] */
const EXCLUDE =
    ".oe_stat_button, .o-form-buttonbox .btn," +
    ".purchase-dashboard-card, .o_sale_dashboard .btn, .o_dashboard_card," +
    ".dropdown-toggle-split, .o_optional_columns_dropdown_toggle," +
    /* list-header optional-columns gear: the toggle CLASS sits on the
       inner <i>, the .btn is bare — sizing it to a 33² square
       overflowed the short sticky header cell and clipped it out of
       sight (Rosen: "контролера не е наред, не се вижда бутона"). */
    ".o_optional_columns_dropdown .btn," +
    ".o_optional_columns_dropdown .dropdown-toggle," +
    ".o_list_controller .dropdown-toggle," +
    /* facet ✕ — owned entirely by the CSS square rule; JS must NOT
       inject min-width here (Rosen: "махни го"). */
    ".o_facet_remove," +
    /* In-row object buttons inside a FORM's embedded o2m list (e.g.
       the forecast-report .btn.btn-link with <i class="o_button_icon
       fa">). The original/standard theme leaves these at Odoo's
       intrinsic size; squaring them to 33² mutated the cell and the
       icon went missing (Rosen: "в нашето липсва иконата"). Match the
       original — leave them Odoo-native. FORM-SCOPED so the frozen
       standalone list's button-calc stays 100% untouched. */
    ".o_form_view .o_data_cell .btn," +
    /* "Add a line / Каталог" footer-row buttons — compact mono
       actions styled in form.scss; the 33px rect sizing made the
       add-row too tall (Rosen). */
    ".o_form_view .o_field_x2many_list_row_add .btn," +
    /* Form statusbar buttons — BOTH the STATE chevron segments AND the
       ACTION buttons are CSS-owned in form.scss (chevron strip + the
       .o_statusbar_buttons natural-width/ellipsis/tooltip rules). The rect
       calc's inline min-width (91, !important) broke the chevrons AND padded
       the short action labels with dead air (Rosen: "много въздух") →
       exclude both so CSS controls sizing; truncated action labels get a
       native title tooltip via tagTruncatedTitles(). */
    ".o_form_statusbar .o_statusbar_status .btn," +
    ".o_form_statusbar .o_statusbar_buttons .btn," +
    /* Search-panel fold toggle (.o_toggle_fold): празен е за листните
       категории → classifyButton го брои за rectangular и inline
       min-width/padding/height го напомпват в разпънат бутон (Rosen:
       "този бутон е много разпънат"). Оразмеряването му е изцяло CSS в
       search_panel.scss (гол, border 0, width:auto → 0px за листните,
       каретка за родителските) → JS да НЕ го пипа. */
    ".o_toggle_fold," +
    /* Apps/modules kanban footer actions. Преведените етикети са дълги
       ("Придвижете към по-нова версия") → редът се пренасяше и изпадаше под
       рамката. Размерът им е CSS-owned в kanban.scss (естествена ширина +
       ellipsis), точно като статусбар бутоните → JS да не инжектира inline
       min-width/height. Скъсените получават title tooltip по-долу. */
    ".o_modules_kanban .o_kanban_record footer .btn," +
    "[data-mcp-no-size]";

function sizeOne(btn, H) {
    if (btn.matches(EXCLUDE) || btn.closest("[data-mcp-no-size]")) return;
    if (!btn.offsetParent) return;                       // hidden — skip
    const type = btn.matches(FORCE_SQUARE) ? "square" : classifyButton(btn);
    const stamp = H + ":" + type;
    if (btn.dataset.mcpBtnSized === stamp) return;        // already current
    /* Reference the published :root vars — never a raw px (Rosen). */
    btn.style.setProperty("height", "var(--mcp-btn-h-live)", "important");
    btn.style.setProperty("min-height", "var(--mcp-btn-h-live)", "important");
    if (type === "square") {
        btn.style.setProperty("width", "var(--mcp-btn-w-sq)", "important");
        btn.style.setProperty("min-width", "var(--mcp-btn-w-sq)", "important");
        btn.style.setProperty("padding-left", "0", "important");
        btn.style.setProperty("padding-right", "0", "important");
        btn.style.setProperty("display", "inline-flex", "important");
        btn.style.setProperty("align-items", "center", "important");
        btn.style.setProperty("justify-content", "center", "important");
    } else {
        btn.style.setProperty("min-width", "var(--mcp-btn-w-rect)", "important");
        /* em padding like the original prototype (Rosen: padding е em
           → бутоните по-големи). All-token, scales with font-size. */
        btn.style.setProperty("padding-top", "var(--mcp-btn-pad-y)", "important");
        btn.style.setProperty("padding-bottom", "var(--mcp-btn-pad-y)", "important");
        btn.style.setProperty("padding-left", "var(--mcp-btn-pad-x)", "important");
        btn.style.setProperty("padding-right", "var(--mcp-btn-pad-x)", "important");
    }
    btn.dataset.mcpBtnSized = stamp;
}

/* Buttons whose long labels are truncated with CSS ellipsis and therefore
   need the full text exposed as a native tooltip. */
const TRUNCATABLE =
    ".o_form_statusbar .o_statusbar_buttons .btn," +
    ".o_modules_kanban .o_kanban_record footer .btn";

/* Truncated action buttons expose the full label as a native `title` so the
   browser shows a tooltip (Rosen: тоолтип на скъсените надписи). Only OUR
   titles are managed (dataset flag) so an Odoo help-title is never clobbered.
   The doc observer watches childList only, so setting title/dataset here
   can't loop. */
function tagTruncatedTitles() {
    document.querySelectorAll(TRUNCATABLE).forEach((b) => {
        const truncated = b.scrollWidth > b.clientWidth + 1;
        if (truncated) {
            const full = (b.textContent || "").trim();
            if (full && b.getAttribute("title") !== full) b.setAttribute("title", full);
            b.dataset.mcpTitle = "1";
        } else if (b.dataset.mcpTitle) {
            b.removeAttribute("title");
            delete b.dataset.mcpTitle;
        }
    });
}

function processAll() {
    tagTruncatedTitles();
    const H = baseButtonHeight();
    if (!publishVars(H)) return;
    document.querySelectorAll(MANAGED).forEach((b) => sizeOne(b, H));
}

let pending = false;
function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; processAll(); });
}

const docObserver = new MutationObserver(schedule);
docObserver.observe(document.documentElement, { childList: true, subtree: true });

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
} else {
    schedule();
}

export { sizeOne, processAll };

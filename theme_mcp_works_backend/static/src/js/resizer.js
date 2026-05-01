/** @odoo-module **/

/**
 * MCP Works — Smart layout resizer.
 *
 * Publishes runtime CSS custom properties on :root so that panel-level chrome
 * (control panel, modals, popovers, dash, actions panel, form sheet) can size
 * itself purely through CSS calc() / clamp() without hardcoded `calc(100vh - X)`.
 *
 * Widget-level sizing is intentionally NOT touched — those are owned by
 * per-app overrides on top of this base theme.
 *
 * Emitted vars on :root:
 *   --mcp-vp-w, --mcp-vp-h          viewport size
 *   --mcp-navbar-h                  current navbar height (DOM-measured)
 *   --mcp-cp-h                      current control panel height (0 when hidden)
 *   --mcp-content-top               navbar + cp (top of usable area)
 *   --mcp-content-h                 vp-h - content-top (usable area)
 *   --mcp-panel-max-h               vertical room for floating action panels
 *   --mcp-modal-max-h               vertical room for the dash modal
 *   --mcp-popover-max-w             responsive popover max-width
 *   --mcp-form-max-w                form sheet max-width (clamped to viewport)
 *   --mcp-dash-grid-w               dash grid mode width (clamped)
 *   --mcp-dash-grid-cols            cols count for dash grid
 *   --mcp-actions-cols              cols count for smart actions grid
 *
 * And a data-attribute on <html> for breakpoint-driven SCSS:
 *   data-mcp-bp = "xs" | "sm" | "md" | "lg" | "xl"
 *
 * Per-element vars set by equalizeStatButtons() on each .o-form-buttonbox:
 *   --mcp-stat-btn-w   widest measured stat-button content, clamped to
 *                      [--mcp-stat-btn-min-w, --mcp-stat-btn-max-w]
 *                      Buttons in a group all render at this width →
 *                      content longer than max-w gets ellipsis truncation.
 */

const ROOT = document.documentElement;

/* ── Breakpoints (matches Bootstrap-ish) ─────────────────────── */
function bpFor(width) {
    if (width < 576)  return "xs";
    if (width < 768)  return "sm";
    if (width < 1024) return "md";
    if (width < 1440) return "lg";
    return "xl";
}

/* ── Column counts per breakpoint ────────────────────────────── */
function actionsCols(bp) {
    return ({ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 })[bp];
}
function dashGridCols(bp) {
    return ({ xs: 3, sm: 4, md: 4, lg: 5, xl: 6 })[bp];
}

/* ── DOM measurements ────────────────────────────────────────── */
function measureNavbar() {
    const el = document.querySelector(".o_main_navbar");
    if (el) return Math.round(el.getBoundingClientRect().height);
    const v = getComputedStyle(ROOT).getPropertyValue("--mcp-navbar-height").trim();
    return v ? parseFloat(v) : 32;
}
function measureCP() {
    const el = document.querySelector(".o_control_panel");
    if (!el || !el.offsetParent) return 0;
    return Math.round(el.getBoundingClientRect().height);
}

/* ── Stat-button equal-width measurement ─────────────────────────
 * Per-buttonbox: temporarily release width, measure intrinsic content,
 * pick the widest, clamp to [min,max], publish as --mcp-stat-btn-w on
 * the box itself (CSS reads this via var() with min-w fallback). */
function readPx(cs, prop, fallback) {
    const v = parseInt(cs.getPropertyValue(prop), 10);
    return Number.isFinite(v) ? v : fallback;
}
function equalizeStatButtons() {
    const boxes = document.querySelectorAll(".o-form-buttonbox");
    if (!boxes.length) return;

    /* Read clamps once (token values, identical across all boxes) */
    const rootCS = getComputedStyle(ROOT);
    const minW = readPx(rootCS, "--mcp-stat-btn-min-w", 140);
    const maxW = readPx(rootCS, "--mcp-stat-btn-max-w", 240);

    /* Children (value/text spans) are clipped via overflow:hidden +
       max-width:100% — that wins out over parent max-content during
       measurement and the button reports a too-small scrollWidth. We
       neutralise these on the measured children, then restore. */
    const CHILD_SEL = ".o_stat_value, .o_stat_text, span.o_stat_info";

    boxes.forEach((box) => {
        if (!box.offsetParent) return;       // hidden box — skip
        const buttons = box.querySelectorAll(".oe_stat_button");
        if (!buttons.length) {
            box.style.removeProperty("--mcp-stat-btn-w");
            return;
        }

        const btnStash = [];
        const childStash = [];

        /* Phase 1 — release width caps on buttons and clipping on
           descendants so each segment renders at its intrinsic size. */
        buttons.forEach((btn) => {
            btnStash.push({
                width: btn.style.width,
                minWidth: btn.style.minWidth,
                maxWidth: btn.style.maxWidth,
            });
            btn.style.setProperty("width", "max-content", "important");
            btn.style.setProperty("min-width", "0", "important");
            btn.style.setProperty("max-width", "none", "important");

            btn.querySelectorAll(CHILD_SEL).forEach((c) => {
                childStash.push({
                    el: c,
                    maxWidth: c.style.maxWidth,
                    overflow: c.style.overflow,
                    textOverflow: c.style.textOverflow,
                });
                c.style.setProperty("max-width", "none", "important");
                c.style.setProperty("overflow", "visible", "important");
                c.style.setProperty("text-overflow", "clip", "important");
            });
        });

        /* Phase 2 — measure (browser reflows once before reading) */
        let widest = 0;
        buttons.forEach((btn) => {
            const w = btn.scrollWidth;
            if (w > widest) widest = w;
        });

        /* Phase 3 — restore everything */
        buttons.forEach((btn, i) => {
            const s = btnStash[i];
            btn.style.width = s.width;
            btn.style.minWidth = s.minWidth;
            btn.style.maxWidth = s.maxWidth;
        });
        childStash.forEach((s) => {
            s.el.style.maxWidth = s.maxWidth;
            s.el.style.overflow = s.overflow;
            s.el.style.textOverflow = s.textOverflow;
        });

        const final = Math.min(Math.max(widest + 2, minW), maxW);
        box.style.setProperty("--mcp-stat-btn-w", final + "px");
    });
}

/* ── Single recompute pass ───────────────────────────────────── */
function recompute() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const navbarH = measureNavbar();
    const cpH = measureCP();
    const contentTop = navbarH + cpH;
    const contentH = Math.max(0, vh - contentTop);
    const bp = bpFor(vw);

    /* Floating panel offsets — same magic numbers as the SCSS used to bake. */
    const PANEL_TOP_GAP = 48;       // .mcp_actions_panel uses navbar + 48
    const PANEL_BOTTOM_GAP = 16;
    const MODAL_TOP_GAP = 24;       // .mcp_dash_modal uses navbar + 24
    const MODAL_BOTTOM_GAP = 16;

    const panelMaxH = Math.max(120, vh - navbarH - PANEL_TOP_GAP - PANEL_BOTTOM_GAP);
    const modalMaxH = Math.max(160, vh - navbarH - MODAL_TOP_GAP - MODAL_BOTTOM_GAP);

    /* Dash grid: scale 480 → 880 between md and xl, capped to vp - 32 */
    const dashGridIdeal = Math.min(880, Math.max(480, vw - 64));
    const dashGridW = Math.min(dashGridIdeal, vw - 32);

    /* Form sheet: clamped 720..1200; never wider than vp-32 */
    const formMaxW = Math.min(1200, Math.max(720, vw - 32));

    /* Popover: 220..360 depending on viewport */
    const popMaxW = Math.min(360, Math.max(220, Math.round(vw * 0.32)));

    const set = (k, v) => ROOT.style.setProperty(k, v);
    set("--mcp-vp-w", vw + "px");
    set("--mcp-vp-h", vh + "px");
    set("--mcp-navbar-h", navbarH + "px");
    set("--mcp-cp-h", cpH + "px");
    set("--mcp-content-top", contentTop + "px");
    set("--mcp-content-h", contentH + "px");
    set("--mcp-panel-max-h", panelMaxH + "px");
    set("--mcp-modal-max-h", modalMaxH + "px");
    set("--mcp-popover-max-w", popMaxW + "px");
    set("--mcp-form-max-w", formMaxW + "px");
    set("--mcp-dash-grid-w", dashGridW + "px");
    set("--mcp-dash-grid-cols", dashGridCols(bp));
    set("--mcp-actions-cols", actionsCols(bp));

    if (ROOT.dataset.mcpBp !== bp) ROOT.dataset.mcpBp = bp;

    /* After the layout vars settle, equalise any visible stat-button groups. */
    equalizeStatButtons();
}

/* ── Throttle via rAF ────────────────────────────────────────── */
let pending = false;
function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; recompute(); });
}

/* ── Wire up listeners (idempotent) ──────────────────────────── */
let booted = false;
function boot() {
    if (booted) return;
    booted = true;

    recompute();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });

    /* Re-measure when navbar/CP themselves resize (responsive collapse, etc.) */
    if ("ResizeObserver" in window) {
        const ro = new ResizeObserver(schedule);
        const tryObserve = () => {
            const nav = document.querySelector(".o_main_navbar");
            const cp  = document.querySelector(".o_control_panel");
            if (nav) ro.observe(nav);
            if (cp)  ro.observe(cp);
        };
        tryObserve();

        /* CP appears/disappears as routes change — re-attach observer + recompute */
        if ("MutationObserver" in window) {
            const mo = new MutationObserver(() => { tryObserve(); schedule(); });
            mo.observe(document.body, { childList: true, subtree: true });
        }
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
    boot();
}

export { recompute, bpFor };

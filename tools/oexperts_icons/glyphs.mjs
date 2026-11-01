// Знаците на иконите o-experts — единственият източник за прегледа и за темата.
// Мрежа 64×64, полето 12–52, линия 3,5, квадратни краища, остри чупки.
// class="a" = ключовият детайл: на светло е мастилен с пастелно жълт маркер
// (затворените се пълнят, отворените линии се подчертават), на тъмно е лайм.
// Ключът е глифът от FontAwesome, с който темата вече описва приложението —
// така всяко приложение от картата получава рисунката си без нов ключ.

const f = (n) => +n.toFixed(2);

// зъбно колело с квадратни зъби (многоъгълник, без закръгляне)
function gear(cx, cy, ro, ri, n) {
    const step = (2 * Math.PI) / n;
    const pts = [];
    for (let i = 0; i < n; i++) {
        const a = i * step - Math.PI / 2;
        for (const [da, r] of [[-0.27, ri], [-0.17, ro], [0.17, ro], [0.27, ri]]) {
            pts.push([cx + r * Math.cos(a + da * step * 1.6), cy + r * Math.sin(a + da * step * 1.6)]);
        }
    }
    return "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + "z";
}

// звезда с 5 лъча; half — само лявата половина (затворена)
function star(cx, cy, R, r, half = false) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r : R;
        pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
    if (!half) {
        return "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + "z";
    }
    // лявата половина: от горния връх обратно до долния вътрешен ъгъл
    const left = [pts[0], pts[9], pts[8], pts[7], pts[6], pts[5]];
    return "M" + left.map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + `L${f(cx)} ${f(pts[5][1])}z`;
}

const CAL = `<path d="M12 16h40v36H12z"/><path d="M12 26h40M22 10v10M42 10v10"/>`;

export const GLYPHS = {
    // ── финанси ──────────────────────────────────────────────
    "fa-file-text-o": `<path d="M18 12h20l8 8v32H18z"/><path d="M38 12v8h8"/><path d="M24 30h16M24 37h16"/><path class="a" d="M24 44h10"/>`,
    "fa-calculator": `<path d="M18 12h28v40H18z"/><path class="a" d="M23 18h18v9H23z"/><path d="M24 35h3M31 35h3M38 35h3M24 43h3M31 43h3M38 43h3"/>`,
    "fa-credit-card": `<path d="M12 18h40v28H12z"/><path d="M12 27h40"/><path class="a" d="M18 36h10v4H18z"/>`,
    "fa-pie-chart": `<path d="M30 16a17 17 0 1 0 17 17H30z"/><path class="a" d="M35 11a17 17 0 0 1 17 17H35z"/>`,
    "fa-tachometer": `<path d="M12 46a20 20 0 0 1 40 0"/><path d="M12 46h40"/><path d="M19 33l3 2M32 27v4M45 33l-3 2"/><path class="a" d="M32 46l9-12"/>`,
    "fa-university": `<path class="a" d="M12 24l20-11 20 11z"/><path d="M18 29v15M27 29v15M37 29v15M46 29v15"/><path d="M12 50h40"/>`,
    "fa-btc": `<path d="M12 20h36v32H12z"/><path d="M12 20l26-8v8"/><path class="a" d="M38 30h14v12H38z"/>`,
    "fa-print": `<path d="M12 26h40v16H12z"/><path d="M20 26V14h24v12"/><path class="a" d="M20 38h24v14H20z"/>`,
    "fa-flag": `<path d="M16 52V12"/><path class="a" d="M16 14h32l-6 9 6 9H16z"/>`,
    // ── продажби ─────────────────────────────────────────────
    "fa-handshake-o": `<path d="M12 14h40L36 32v14l-8 6V32z"/><path class="a" d="M20 22h24"/>`,
    "fa-line-chart": `<path d="M12 50h40"/><path d="M16 42l10-10 8 6 13-14"/><path class="a" d="M39 22h9v9"/>`,
    "fa-shopping-cart": `<path d="M12 34h40v16H12z"/><path d="M18 34v-8h16v8"/><path d="M18 42h4M26 42h4M34 42h4"/><path class="a" d="M38 12h10v20H38z"/><path d="M41 18h4M41 24h4"/>`,
    "fa-refresh": `<path d="M47 26a16 16 0 0 0-29-6"/><path d="M17 38a16 16 0 0 0 29 6"/><path d="M16 11v10h10"/><path class="a" d="M48 53V43H38"/>`,
    "fa-key": `<circle class="a" cx="21" cy="32" r="9"/><path d="M30 32h22M44 32v8M51 32v6"/>`,
    "fa-cutlery": `<path d="M20 12v10M26 12v10M32 12v10"/><path d="M20 22a6 6 0 0 0 12 0M26 28v24"/><path class="a" d="M44 52V12c6 6 6 18 0 24"/>`,
    "fa-calendar-check-o": `${CAL}<path class="a" d="M23 39l6 6 12-12"/>`,
    // ── операции ─────────────────────────────────────────────
    "fa-shopping-bag": `<path d="M14 22h36l-3 30H17z"/><path class="a" d="M24 22v-4a8 8 0 0 1 16 0v4"/>`,
    "fa-cubes": `<path d="M12 32h18v18H12zM34 32h18v18H34z"/><path class="a" d="M23 13h18v19H23z"/>`,
    "fa-barcode": `<path d="M13 14v36M18 14v36M25 14v36M32 14v36M37 14v36M44 14v36M51 14v36"/><path class="a" d="M8 32h48"/>`,
    "fa-industry": `<path d="M12 50V30l10 6v-6l10 6v-6l10 6V16h10v34z"/><path class="a" d="M28 50v-8h8v8"/>`,
    "fa-sliders": `<path d="M12 20h40M12 32h40M12 44h40"/><path d="M20 16h6v8h-6zM36 40h6v8h-6z"/><path class="a" d="M40 28h6v8h-6z"/>`,
    "fa-pencil-square-o": `<path d="M30 16H12v36h36V34"/><path class="a" d="M26 38l2-8 18-18 6 6-18 18z"/>`,
    "fa-sitemap": `<path d="M32 26v8M18 42v-8h28v8"/><path d="M11 42h14v10H11zM39 42h14v10H39z"/><path class="a" d="M24 12h16v14H24z"/>`,
    "fa-certificate": `<circle cx="32" cy="27" r="14"/><path d="M24 39l-3 13 6-4 5 4M40 39l3 13-6-4-5 4"/><path class="a" d="M26 27l4 4 8-8"/>`,
    "fa-wrench": `<path d="M47 12a11 11 0 0 0-12 14L13 48l5 5 22-22a11 11 0 0 0 14-12l-7 7-6-1-1-6z"/><path class="a" d="M40 42h12v10H40z"/>`,
    "fa-cogs": `<path d="${gear(25, 37, 15, 11, 8)}"/><circle cx="25" cy="37" r="4.5"/><path class="a" d="${gear(44, 19, 9, 6.5, 6)}"/>`,
    "fa-car": `<path d="M10 42V32l9-12h26l9 12v10h-6M26 42h12M16 42h-6"/><circle cx="21" cy="43" r="5"/><circle cx="43" cy="43" r="5"/><path class="a" d="M22 24h20l5 8H17z"/>`,
    "fa-map-marker": `<path d="M32 52S18 38 18 27a14 14 0 0 1 28 0c0 11-14 25-14 25z"/><circle class="a" cx="32" cy="27" r="5"/>`,
    "fa-microchip": `<path d="M20 20h24v24H20z"/><path d="M26 12v8M32 12v8M38 12v8M26 44v8M32 44v8M38 44v8M12 26h8M12 32h8M12 38h8M44 26h8M44 32h8M44 38h8"/><path class="a" d="M27 27h10v10H27z"/>`,
    "fa-leaf": `<path d="M14 50c0-22 14-36 38-36 0 24-14 36-38 36z"/><path class="a" d="M14 50l22-22"/>`,
    "fa-tablet": `<path d="M16 12h32v40H16z"/><path d="M30 46h4"/><path class="a" d="M22 19h20v12H22z"/><path d="M22 37h20"/>`,
    // ── хора ─────────────────────────────────────────────────
    "fa-users": `<circle cx="25" cy="23" r="7"/><path d="M12 50c0-9 6-14 13-14s13 5 13 14"/><circle class="a" cx="42" cy="24" r="5"/><path class="a" d="M42 35c6 0 10 5 10 13"/>`,
    "fa-user-plus": `<circle cx="25" cy="22" r="8"/><path d="M11 50c0-9 6-15 14-15s14 6 14 15"/><path class="a" d="M46 20v12M40 26h12"/>`,
    "fa-plane": `<path d="M10 46h44"/><path d="M32 22v-8M17 31l-6-5M47 31l6-5"/><path class="a" d="M20 46a12 12 0 0 1 24 0z"/>`,
    "fa-id-badge": `<path d="M18 14h28v38H18z"/><circle cx="32" cy="29" r="5"/><path d="M24 44c0-5 4-8 8-8s8 3 8 8"/><path class="a" d="M27 10h10v8H27z"/>`,
    "fa-money": `<path d="M10 20h44v24H10z"/><path d="M17 26v12M47 26v12"/><circle class="a" cx="32" cy="32" r="6"/>`,
    "fa-star-half-o": `<path d="${star(32, 34, 21, 8.5)}"/><path class="a" d="${star(32, 34, 21, 8.5, true)}"/>`,
    "fa-share-alt": `<circle cx="20" cy="32" r="6"/><circle cx="44" cy="18" r="6"/><path d="M25 29l14-8M25 35l14 8"/><circle class="a" cx="44" cy="46" r="6"/>`,
    "fa-calendar-plus-o": `${CAL}<path class="a" d="M18 33h16v5H18z"/><path d="M26 44h20"/>`,
    "fa-bell-o": `<path d="M14 42a18 18 0 0 1 36 0z"/><path d="M10 48h44"/><path d="M27 18h10M32 18v6"/><path class="a" d="M22 37a11 11 0 0 1 7-8"/>`,
    "fa-building-o": `<path d="M16 12h32v40H16z"/><path d="M22 20h4M30 20h4M38 20h4M22 28h4M30 28h4M38 28h4M22 36h4M38 36h4"/><path class="a" d="M28 42h8v10h-8z"/>`,
    "fa-check-circle-o": `<circle cx="32" cy="32" r="19"/><path class="a" d="M23 32l6 6 12-12"/>`,
    // ── маркетинг ────────────────────────────────────────────
    "fa-envelope-o": `<path d="M12 18h40v28H12z"/><path class="a" d="M12 18l20 16 20-16"/>`,
    "fa-mobile": `<path d="M20 10h24v44H20z"/><path d="M28 48h8"/><path class="a" d="M25 18h14v11h-6l-4 4v-4h-4z"/>`,
    "fa-random": `<path d="M12 20h10l20 24h8M12 44h10l6-7M36 27l6-7h8"/><path class="a" d="M46 14l6 6-6 6M46 38l6 6-6 6"/>`,
    "fa-id-card-o": `<path d="M10 16h44v32H10z"/><circle cx="22" cy="28" r="5"/><path d="M14 42c0-5 4-7 8-7s8 2 8 7"/><path class="a" d="M36 26h12M36 34h8"/>`,
    "fa-bullhorn": `<path d="M12 26h8l24-12v36L20 38h-8z"/><path d="M20 38l4 12h6l-3-12"/><path class="a" d="M50 26v12"/>`,
    "fa-ticket": `<path d="M10 18h44v9a5 5 0 0 0 0 10v9H10v-9a5 5 0 0 0 0-10z"/><path class="a" d="M38 20v4M38 30v4M38 40v4"/>`,
    "fa-list-alt": `<path d="M12 12h40v40H12z"/><path d="M28 22h16M28 32h16M28 42h16"/><path class="a" d="M18 20h4v4h-4zM18 30h4v4h-4zM18 40h4v4h-4z"/>`,
    "fa-link": `<path d="M28 22l6-6a8.5 8.5 0 0 1 12 12l-6 6"/><path d="M36 42l-6 6a8.5 8.5 0 0 1-12-12l6-6"/><path class="a" d="M26 38l12-12"/>`,
    // ── работа и комуникация ─────────────────────────────────
    "fa-comments": `<path d="M12 14h28v20H24l-8 8v-8h-4z"/><path class="a" d="M44 26h8v18h-4v6l-6-6H30v-6"/>`,
    "fa-calendar": `${CAL}<path class="a" d="M36 34h8v8h-8z"/>`,
    "fa-address-book-o": `<path d="M18 10h30v44H18z"/><path d="M13 18h8M13 28h8M13 38h8M13 46h8"/><circle class="a" cx="33" cy="26" r="5"/><path d="M25 42c0-5 4-8 8-8s8 3 8 8"/>`,
    "fa-tasks": `<path d="M12 14h11v14H12zM12 32h11v10H12zM42 14h10v10H42z"/><path class="a" d="M27 14h11v22H27z"/>`,
    "fa-check-square-o": `<path d="M14 14h36v36H14z"/><path class="a" d="M22 32l7 7 14-14"/>`,
    "fa-hourglass-half": `<path d="M18 12h28M18 52h28"/><path d="M21 12c0 12 11 14 11 20s-11 8-11 20M43 12c0 12-11 14-11 20s11 8 11 20"/><path class="a" d="M25 48h14l-7-7z"/>`,
    "fa-folder-open-o": `<path d="M10 16h16l5 6h21v28H10z"/><path class="a" d="M10 50l7-18h37l-2 18z"/>`,
    "fa-book": `<path d="M32 18c-6-4-14-5-22-4v34c8-1 16 0 22 4 6-4 14-5 22-4V14c-8-1-16 0-22 4z"/><path d="M32 18v34"/><path class="a" d="M38 26h10M38 33h10"/>`,
    "fa-pencil": `<path d="M12 50h40"/><path d="M38 34l14-14-4-4-14 14-2 6z"/><path class="a" d="M13 42c6-8 10-12 12-8s-4 8 0 8 9-6 11-8"/>`,
    "fa-life-ring": `<circle cx="32" cy="32" r="19"/><circle cx="32" cy="32" r="8"/><path class="a" d="M18 18l8 8M46 18l-8 8M18 46l8-8M46 46l-8-8"/>`,
    "fa-comments-o": `<path d="M12 14h40v26H30l-10 10V40h-8z"/><path class="a" d="M22 27h4M30 27h4M38 27h4"/>`,
    "fa-phone": `<path d="M18 12h8l4 10-5 4c3 6 7 10 13 13l4-5 10 4v8c0 4-3 6-7 6C26 52 12 38 12 19c0-4 2-7 6-7z"/><path class="a" d="M38 12a14 14 0 0 1 14 14M38 20a6 6 0 0 1 6 6"/>`,
    "fa-whatsapp": `<path d="M32 12a20 20 0 0 0-17 30l-3 10 10-3a20 20 0 1 0 10-37z"/><path class="a" d="M24 25c0 8 7 15 15 15l2-5-5-2-3 2c-2-1-4-3-5-5l2-3-2-5z"/>`,
    "fa-magic": `<path d="M14 50l24-24"/><path d="M34 22l8 8"/><path class="a" d="M46 10v8M42 14h8M50 30v6M47 33h6M26 12v6M23 15h6"/>`,
    "fa-telegram": `<path d="M10 30l42-16-8 36z"/><path class="a" d="M26 36v14l6-10"/><path d="M26 36l18-16"/>`,
    "fa-coffee": `<path d="M14 26h28v14a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12z"/><path d="M42 30h4a5 5 0 0 1 0 10h-4"/><path class="a" d="M22 12v8M30 12v8"/>`,
    // ── уеб ──────────────────────────────────────────────────
    "fa-globe": `<circle cx="32" cy="32" r="19"/><path d="M13 32h38"/><path d="M32 13c-7 6-7 32 0 38 7-6 7-32 0-38z"/><path class="a" d="M17 22h30"/>`,
    "fa-graduation-cap": `<path d="M10 24l22-10 22 10-22 10z"/><path d="M20 30v12c6 6 18 6 24 0V30"/><path class="a" d="M50 26v14"/>`,
    // ── система ──────────────────────────────────────────────
    "fa-cog": `<path d="${gear(32, 32, 20, 15, 8)}"/><circle class="a" cx="32" cy="32" r="6"/>`,
    "fa-th-large": `<path d="M12 12h17v17H12zM35 12h17v17H35zM12 35h17v17H12z"/><path class="a" d="M35 35h17v17H35z"/>`,
    "fa-flask": `<path d="M26 12h12M28 12v14L14 50h36L36 26V12"/><path class="a" d="M19 42h26l4 8H15z"/>`,
    "fa-recycle": `<path d="M12 16h30M12 26h22M12 36h14"/><path class="a" d="M30 46l12-12 10 10-12 12z"/><path d="M28 52h24"/>`,
    "fa-database": `<path d="M14 18c0-4 8-6 18-6s18 2 18 6-8 6-18 6-18-2-18-6z"/><path d="M14 18v28c0 4 8 6 18 6s18-2 18-6V18"/><path class="a" d="M14 32c0 4 8 6 18 6s18-2 18-6"/>`,
    "fa-paint-brush": `<path d="M46 12l6 6-20 20-6-6z"/><path class="a" d="M26 32l6 6c-2 8-8 12-20 12 2-10 6-16 14-18z"/>`,
    "fa-list-ol": `<path d="M26 18h26M26 32h26M26 46h26"/><path d="M13 15h6v6h-6zM13 29h6v6h-6z"/><path class="a" d="M13 43h6v6h-6z"/>`,
    "fa-eye": `<path d="M10 32c6-10 14-15 22-15s16 5 22 15c-6 10-14 15-22 15s-16-5-22-15z"/><circle class="a" cx="32" cy="32" r="7"/>`,
    "fa-gavel": `<path d="M18 22l12-12 12 12-12 12z"/><path d="M36 28l16 16-4 4-16-16"/><path class="a" d="M12 46h22v6H12z"/>`,
    "fa-shield": `<path d="M32 10l18 6v14c0 12-8 20-18 24-10-4-18-12-18-24V16z"/><path class="a" d="M24 32l6 6 10-12"/>`,
    "fa-video-camera": `<path d="M10 20h32v24H10z"/><path class="a" d="M42 28l12-7v22l-12-7z"/>`,
};

// Приложенията: xmlid на коренното меню → [глиф, група, име на български].
// Картата на темата (app_icon.js) плюс петте, които липсваха в нея (01.11.2026).
export const APPS = [
    ["account.menu_finance", "fa-file-text-o", "finance", "Фактуриране"],
    ["accountant.menu_accounting", "fa-calculator", "finance", "Счетоводство"],
    ["hr_expense.menu_hr_expense_root", "fa-credit-card", "finance", "Разходи"],
    ["equity.menu_equity", "fa-pie-chart", "finance", "Капитал"],
    ["spreadsheet_dashboard.spreadsheet_dashboard_menu_root", "fa-tachometer", "finance", "Табла"],
    ["l10n_bg_api_nra.menu_nra_root", "fa-university", "finance", "Декларации НАП"],
    ["l10n_bg_bank_wallet.crypto_wallet_menu_root", "fa-btc", "finance", "Крипто портфейли"],
    ["l10n_bg_erp_net_base.menu_erpnet_base_root", "fa-print", "finance", "ErpNet.FP"],
    ["l10n_bg_ai_billing.menu_ai_billing_root", "fa-magic", "finance", "AI фактуриране"],
    ["crm.crm_menu_root", "fa-handshake-o", "sales", "CRM"],
    ["sale.sale_menu_root", "fa-line-chart", "sales", "Продажби"],
    ["point_of_sale.menu_point_root", "fa-shopping-cart", "sales", "Каса"],
    ["sale_subscription.menu_sale_subscription_root", "fa-refresh", "sales", "Абонаменти"],
    ["sale_renting.rental_menu_root", "fa-key", "sales", "Наем"],
    ["pos_enterprise.menu_point_kitchen_display_root", "fa-cutlery", "sales", "Кухненски дисплей"],
    ["appointment.main_menu_appointments", "fa-calendar-check-o", "sales", "Срещи"],
    ["purchase.menu_purchase_root", "fa-shopping-bag", "ops", "Покупки"],
    ["stock.menu_stock_root", "fa-cubes", "ops", "Склад"],
    ["stock_barcode.stock_barcode_menu", "fa-barcode", "ops", "Баркод"],
    ["mrp.menu_mrp_root", "fa-industry", "ops", "Производство"],
    ["mrp_workorder.menu_mrp_workorder_root", "fa-sliders", "ops", "Цех"],
    ["mrp_plm.menu_mrp_plm_root", "fa-pencil-square-o", "ops", "PLM"],
    ["quality_control.menu_quality_root", "fa-certificate", "ops", "Качество"],
    ["maintenance.menu_maintenance_title", "fa-wrench", "ops", "Поддръжка"],
    ["repair.menu_repair_order", "fa-cogs", "ops", "Ремонти"],
    ["fleet.menu_root", "fa-car", "ops", "Автопарк"],
    ["industry_fsm.fsm_menu_root", "fa-map-marker", "ops", "Работа на място (EE)"],
    ["iot.iot_menu_root", "fa-microchip", "ops", "IoT"],
    ["esg.esg_main_menu", "fa-leaf", "ops", "ESG"],
    ["mgmtsystem.menu_mgmtsystem_root", "fa-sitemap", "ops", "Системи за управление"],
    ["oexperts_fsm.menu_fsm_root", "fa-map-marker", "ops", "Работа на място"],
    ["oexperts_station.menu_station_root", "fa-tablet", "ops", "Станция"],
    ["hr.menu_hr_root", "fa-users", "people", "Служители"],
    ["hr_recruitment.menu_hr_recruitment_root", "fa-user-plus", "people", "Подбор"],
    ["hr_holidays.menu_hr_holidays_root", "fa-plane", "people", "Отпуски"],
    ["hr_attendance.menu_hr_attendance_root", "fa-id-badge", "people", "Присъствия"],
    ["hr_work_entry_enterprise.menu_hr_payroll_root", "fa-money", "people", "Заплати (EE)"],
    ["payroll.payroll_menu_root", "fa-money", "people", "Заплати"],
    ["hr_appraisal.menu_hr_appraisal_root", "fa-star-half-o", "people", "Оценки"],
    ["hr_referral.menu_hr_referral_root", "fa-share-alt", "people", "Препоръки"],
    ["planning.planning_menu_root", "fa-calendar-plus-o", "people", "Планиране"],
    ["frontdesk.frontdesk_menu_root", "fa-bell-o", "people", "Рецепция"],
    ["room.room_menu_root", "fa-building-o", "people", "Зали"],
    ["approvals.approvals_menu_root", "fa-check-circle-o", "people", "Одобрения"],
    ["hr_attendance_access_control.menu_lpr_camera_main", "fa-video-camera", "people", "Контрол на достъпа"],
    ["mass_mailing.mass_mailing_menu_root", "fa-envelope-o", "marketing", "Имейл маркетинг"],
    ["mass_mailing_sms.mass_mailing_sms_menu_root", "fa-mobile", "marketing", "SMS маркетинг"],
    ["marketing_automation.marketing_automation_menu", "fa-random", "marketing", "Автоматизация"],
    ["marketing_card.card_menu", "fa-id-card-o", "marketing", "Маркетинг карти"],
    ["social.menu_social_global", "fa-bullhorn", "marketing", "Социални мрежи"],
    ["event.event_main_menu", "fa-ticket", "marketing", "Събития"],
    ["survey.menu_surveys", "fa-list-alt", "marketing", "Анкети"],
    ["utm.menu_link_tracker_root", "fa-link", "marketing", "Връзки"],
    ["mail.menu_root_discuss", "fa-comments", "work", "Дискусии"],
    ["calendar.mail_menu_calendar", "fa-calendar", "work", "Календар"],
    ["contacts.menu_contacts", "fa-address-book-o", "work", "Контакти"],
    ["project.menu_main_pm", "fa-tasks", "work", "Проекти"],
    ["project_todo.menu_todo_todos", "fa-check-square-o", "work", "Задачи"],
    ["hr_timesheet.timesheet_menu_root", "fa-hourglass-half", "work", "Отчет на времето"],
    ["documents.menu_root", "fa-folder-open-o", "work", "Документи"],
    ["knowledge.knowledge_menu_root", "fa-book", "work", "Знания"],
    ["document_knowledge.menu_document_root", "fa-book", "work", "Знания (OCA)"],
    ["sign.menu_document", "fa-pencil", "work", "Подпис"],
    ["helpdesk.menu_helpdesk_root", "fa-life-ring", "work", "Помощ"],
    ["im_livechat.menu_livechat_root", "fa-comments-o", "work", "Чат на живо"],
    ["voip.menu_voip_root", "fa-phone", "work", "Телефон"],
    ["whatsapp.whatsapp_menu_main", "fa-whatsapp", "work", "WhatsApp"],
    ["ai_app.ai_menu_root", "fa-magic", "work", "AI"],
    ["l10n_bg_telegram_bot.l10n_bg_telegram_menu_root", "fa-telegram", "work", "Telegram бот"],
    ["ai_agent_console.menu_ai_agent_root", "fa-magic", "work", "AI агенти"],
    ["lunch.menu_lunch", "fa-coffee", "work", "Обяд"],
    ["website.menu_website_configuration", "fa-globe", "web", "Сайт"],
    ["website_slides.website_slides_menu_root", "fa-graduation-cap", "web", "Обучение"],
    ["base.menu_administration", "fa-cog", "system", "Настройки"],
    ["base.menu_management", "fa-th-large", "system", "Приложения"],
    ["base.menu_tests", "fa-flask", "system", "Тестове"],
    ["data_recycle.menu_data_cleaning_root", "fa-recycle", "system", "Почистване на данни"],
    ["databases.menu_main_databases", "fa-database", "system", "Бази данни"],
    ["theme_mcp_works_backend_config.menu_mcp_theme_configurator", "fa-paint-brush", "system", "Тема"],
    ["queue_job.menu_queue_job_root", "fa-list-ol", "system", "Опашка"],
    ["odoo_supervisor.menu_supervisor_root", "fa-eye", "system", "Надзор"],
    ["l10n_bg_cla.menu_l10n_bg_cla_root", "fa-gavel", "system", "CLA"],
    ["l10n_bg_license_server.l10n_bg_license_menu_root", "fa-shield", "system", "Лицензи"],
];

export const GROUPS = {
    finance: "Финанси", sales: "Продажби", ops: "Операции", people: "Хора",
    marketing: "Маркетинг", work: "Работа и комуникация", web: "Уеб", system: "Система",
};

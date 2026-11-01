# Наборът икони „o-experts“ (стил „на ръка“) → темата.
#
#   python3 build_pack.py            # дорисува липсващите в pack/ и сглобява темата
#   python3 build_pack.py --sheet F  # + лист за преглед (HTML) във файла F
#
# pack/01..85 са пакетът на дизайнера (01.11.2026) и не се пипат.
# pack/86.. се генерират тук от EXTRA — същата граматика: плочка 48×48, rx 11,
# цвят по групата (k1 мастило, k2 бордо, k3 графит), линия 3 в хартия,
# детайлът в лайм (.a), пълнеж в лайм (.f) или хартия (.w), филтрите „на ръка“.
# Изход в темата: static/src/img/oxi/<име>.svg и webclient/app_icon/oxi_icons.js.
import html
import json
import pathlib
import re
import shutil
import sys

HERE = pathlib.Path(__file__).resolve().parent
PACK = HERE / "pack"
THEME = HERE.parent.parent / "theme_mcp_works_backend"
OUT_IMG = THEME / "static/src/img/oxi"
OUT_JS = THEME / "static/src/webclient/app_icon/oxi_icons.js"

# заглавието (стил + филтри) — взето от пакета, за да е едно към едно
HEAD = re.search(r"(<style>.*?</defs>)", (PACK / "01-discuss.svg").read_text()).group(1)

TILE = {"k1": "#181A1D", "k2": "#721C32", "k3": "#303439"}

# име → (плочка, знак). Мрежа 48, полето ≈ 9–39.
EXTRA = {
    # ── финанси (k1) ────────────────────────────────────────
    "86-equity": ("k1", '<ellipse cx="24" cy="31" rx="12" ry="4"/><path d="M12 31v5c0 2.2 5.4 4 12 4s12-1.8 12-4v-5"/>'
                        '<path d="M12 24v7M36 24v7"/><ellipse class="a" cx="24" cy="24" rx="12" ry="4"/>'
                        '<path d="M16 17V12M24 17V9M32 17v-6"/>'),
    "87-tax-declarations": ("k1", '<path d="M14 9h15l7 7v23H14z"/><path d="M29 9v7h7"/><path d="M19 21h10M19 27h6"/>'
                                  '<circle class="a" cx="30" cy="32" r="5"/><path class="a" d="M28 32l1.5 1.5 3-3"/>'),
    "88-crypto-wallet": ("k1", '<path d="M10 16h26v22H10z"/><path d="M10 16l20-6v6"/><path d="M28 23h11v8H28z"/>'
                               '<circle class="f" cx="32" cy="27" r="2"/>'),
    "89-fiscal-printer": ("k1", '<path d="M10 20h28v12H10z"/><path d="M16 20v-9h16v9"/><path d="M14 26h3"/>'
                                '<path class="a" d="M16 32v8l2.7-2 2.7 2 2.6-2 2.7 2 2.6-2L32 40v-8"/>'),
    "90-ai-billing": ("k1", '<path d="M13 9h15l7 7v23H13z"/><path d="M28 9v7h7"/><path d="M18 22h8M18 28h6"/>'
                            '<path class="a" d="M31 27c.4 3 1.6 4.2 4.6 4.6-3 .4-4.2 1.6-4.6 4.6-.4-3-1.6-4.2-4.6-4.6 3-.4 4.2-1.6 4.6-4.6z"/>'),
    # ── продажби (k2) ───────────────────────────────────────
    "91-kitchen-display": ("k2", '<path d="M9 11h30v20H9z"/><path d="M19 38h10M24 31v7"/>'
                                 '<path class="a" d="M16 22a8 8 0 0 0 16 0z"/><path class="a" d="M20 15v3M24 14v4M28 15v3"/>'),
    # ── операции и услуги (k3) ──────────────────────────────
    "92-shop-floor": ("k3", '<path d="M10 11h28v20H10z"/><path d="M18 38h12M24 31v7"/><path d="M15 17h10M15 22h6"/>'
                            '<path class="a" d="M15 27h18"/><circle class="f" cx="33" cy="17" r="2"/>'),
    "93-esg": ("k3", '<path d="M12 37c0-15 9-25 26-26 0 16-10 26-26 26z"/><path class="a" d="M12 37l15-15"/>'),
    "94-station": ("k3", '<path d="M13 9h22v30H13z"/><path class="a" d="M17 14h14v9H17z"/><path d="M17 28h14"/>'
                         '<path d="M22 34h4"/>'),
    "95-management-systems": ("k3", '<path class="a" d="M18 9h12v9H18z"/><path d="M24 18v6M14 30v-6h20v6"/>'
                                    '<path d="M9 30h10v8H9zM29 30h10v8H29z"/>'),
    # ── хора (k1) ───────────────────────────────────────────
    "96-meeting-rooms": ("k1", '<path d="M12 22h24v6H12z"/><path d="M16 28v9M32 28v9"/>'
                               '<path class="a" d="M17 16h4M27 16h4"/><path class="a" d="M19 12v4M29 12v4"/>'),
    "97-access-control": ("k1", '<path d="M9 16h22v15H9z"/><path class="a" d="M31 21l8-4v14l-8-4"/>'
                                '<circle cx="20" cy="23.5" r="3.5"/><path d="M13 37h14"/>'),
    # ── маркетинг (k2) ──────────────────────────────────────
    "98-marketing-card": ("k2", '<path d="M8 13h32v22H8z"/><circle cx="17" cy="21" r="3.5"/>'
                                '<path d="M11 31c.8-3.4 3.2-5 6-5s5.2 1.6 6 5"/><path class="a" d="M27 20h8M27 26h5"/>'),
    # ── работа и комуникация ────────────────────────────────
    "99-telegram": ("k3", '<path d="M9 23l30-12-6 27z"/><path class="a" d="M20 28v9l5-6"/><path d="M20 28l13-12"/>'),
    "100-ai-agents": ("k1", '<path d="M12 17h24v19H12z"/><path d="M24 17v-6"/><circle class="w" cx="24" cy="10" r="2"/>'
                            '<circle class="f" cx="19" cy="25" r="2.4"/><circle class="f" cx="29" cy="25" r="2.4"/>'
                            '<path d="M19 31h10"/><path d="M8 24v6M40 24v6"/>'),
    # ── система (k3) ────────────────────────────────────────
    "101-tests": ("k3", '<path d="M19 9h10M21 9v10l-10 19h26L27 19V9"/><path class="a" d="M15 31h18"/>'),
    "102-databases": ("k3", '<path d="M10 10h28v9H10zM10 21h28v9H10zM10 32h28v6H10z"/>'
                            '<path d="M15 14.5h8M15 25.5h8"/><circle class="f" cx="32" cy="14.5" r="1.8"/>'
                            '<circle class="f" cx="32" cy="25.5" r="1.8"/>'),
    "103-theme": ("k3", '<path d="M33 9l6 6-14 14-6-6z"/><path class="a" d="M19 23l6 6c-1.5 6-6 9-15 9 1.5-7.5 4.5-12 9-15z"/>'),
    "104-job-queue": ("k3", '<path d="M21 14h17M21 24h17M21 34h17"/><path d="M10 20h6v-6h-6zM10 37h6v-6h-6z"/>'
                            '<path class="a" d="M10 27h6v-6h-6z"/>'),
    "105-supervisor": ("k3", '<path d="M8 24c4-7 9.5-10 16-10s12 3 16 10c-4 7-9.5 10-16 10S12 31 8 24z"/>'
                             '<circle class="a" cx="24" cy="24" r="5" fill="#303439"/>'),
    "106-cla": ("k3", '<path d="M14 15l8-8 9 9-8 8z"/><path d="M27 20l11 11-3 3-11-11"/><path class="a" d="M9 33h16v5H9z"/>'),
    "107-licenses": ("k3", '<path d="M24 8l13 5v10c0 9-6 14.5-13 17-7-2.5-13-8-13-17V13z"/><path class="a" d="M18 24l4.5 4.5 8-8"/>'),
}

# Приложенията от картата на темата (app_icon.js) → иконата.
APPS = {
    "account.menu_finance": "22-invoicing",
    "accountant.menu_accounting": "21-accounting",
    "hr_expense.menu_hr_expense_root": "23-expenses",
    "equity.menu_equity": "86-equity",
    "spreadsheet_dashboard.spreadsheet_dashboard_menu_root": "29-dashboards",
    "l10n_bg_api_nra.menu_nra_root": "87-tax-declarations",
    "l10n_bg_bank_wallet.crypto_wallet_menu_root": "88-crypto-wallet",
    "l10n_bg_erp_net_base.menu_erpnet_base_root": "89-fiscal-printer",
    "l10n_bg_ai_billing.menu_ai_billing_root": "90-ai-billing",
    "crm.crm_menu_root": "11-crm",
    "sale.sale_menu_root": "12-sales",
    "point_of_sale.menu_point_root": "15-point-of-sale",
    "sale_subscription.menu_sale_subscription_root": "13-subscriptions",
    "sale_renting.rental_menu_root": "14-rental",
    "pos_enterprise.menu_point_kitchen_display_root": "91-kitchen-display",
    "appointment.main_menu_appointments": "47-appointments",
    "purchase.menu_purchase_root": "32-purchase",
    "stock.menu_stock_root": "30-inventory",
    "stock_barcode.stock_barcode_menu": "31-barcode",
    "mrp.menu_mrp_root": "33-manufacturing",
    "mrp_workorder.menu_mrp_workorder_root": "92-shop-floor",
    "mrp_plm.menu_mrp_plm_root": "34-plm",
    "quality_control.menu_quality_root": "35-quality",
    "maintenance.menu_maintenance_title": "36-maintenance",
    "repair.menu_repair_order": "37-repairs",
    "fleet.menu_root": "56-fleet",
    "industry_fsm.fsm_menu_root": "45-field-service",
    "iot.iot_menu_root": "78-iot",
    "esg.esg_main_menu": "93-esg",
    "oexperts_fsm.menu_fsm_root": "45-field-service",
    "oexperts_station.menu_station_root": "94-station",
    "mgmtsystem.menu_mgmtsystem_root": "95-management-systems",
    "hr.menu_hr_root": "49-employees",
    "hr_recruitment.menu_hr_recruitment_root": "50-recruitment",
    "hr_holidays.menu_hr_holidays_root": "51-time-off",
    "hr_attendance.menu_hr_attendance_root": "52-attendances",
    "hr_work_entry_enterprise.menu_hr_payroll_root": "53-payroll",
    "payroll.payroll_menu_root": "53-payroll",
    "hr_appraisal.menu_hr_appraisal_root": "54-appraisals",
    "hr_referral.menu_hr_referral_root": "55-referrals",
    "planning.planning_menu_root": "44-planning",
    "frontdesk.frontdesk_menu_root": "58-frontdesk",
    "room.room_menu_root": "96-meeting-rooms",
    "approvals.approvals_menu_root": "06-approvals",
    "hr_attendance_access_control.menu_lpr_camera_main": "97-access-control",
    "mass_mailing.mass_mailing_menu_root": "60-email-marketing",
    "mass_mailing_sms.mass_mailing_sms_menu_root": "61-sms-marketing",
    "marketing_automation.marketing_automation_menu": "63-marketing-automation",
    "marketing_card.card_menu": "98-marketing-card",
    "social.menu_social_global": "62-social-marketing",
    "event.event_main_menu": "64-events",
    "survey.menu_surveys": "65-surveys",
    "utm.menu_link_tracker_root": "67-utm-campaigns",
    "mail.menu_root_discuss": "01-discuss",
    "calendar.mail_menu_calendar": "02-calendar",
    "contacts.menu_contacts": "03-contacts",
    "project.menu_main_pm": "42-project",
    "project_todo.menu_todo_todos": "04-to-do",
    "hr_timesheet.timesheet_menu_root": "43-timesheets",
    "documents.menu_root": "07-documents",
    "knowledge.knowledge_menu_root": "05-knowledge",
    "document_knowledge.menu_document_root": "05-knowledge",
    "sign.menu_document": "08-sign",
    "helpdesk.menu_helpdesk_root": "46-helpdesk",
    "im_livechat.menu_livechat_root": "72-live-chat",
    "voip.menu_voip_root": "79-voip",
    "whatsapp.whatsapp_menu_main": "80-whatsapp",
    "ai_app.ai_menu_root": "10-ai",
    "l10n_bg_telegram_bot.l10n_bg_telegram_menu_root": "99-telegram",
    "ai_agent_console.menu_ai_agent_root": "100-ai-agents",
    "lunch.menu_lunch": "57-lunch",
    "website.menu_website_configuration": "68-website",
    "website_slides.website_slides_menu_root": "71-elearning",
    "base.menu_administration": "82-settings",
    "base.menu_management": "83-apps",
    "base.menu_tests": "101-tests",
    "data_recycle.menu_data_cleaning_root": "81-data-cleaning",
    "databases.menu_main_databases": "102-databases",
    "theme_mcp_works_backend_config.menu_mcp_theme_configurator": "103-theme",
    "queue_job.menu_queue_job_root": "104-job-queue",
    "odoo_supervisor.menu_supervisor_root": "105-supervisor",
    "l10n_bg_cla.menu_l10n_bg_cla_root": "106-cla",
    "l10n_bg_license_server.l10n_bg_license_menu_root": "107-licenses",
}

# табовете в Настройки носят името на модула, без меню
MODULES = {
    "website_sale": "17-ecommerce",
    "loyalty": "18-loyalty",
    "pos_restaurant": "16-restaurant",
    "sale_product_configurator": "19-configurator",
    "portal": "20-customer-portal",
    "account_budget": "25-budgets",
    "payment": "26-payments",
    "account_online_synchronization": "27-bank-sync",
    "analytic": "28-analytic",
    "delivery": "38-shipping",
    "mrp_subcontracting": "39-subcontracting",
    "stock_dropshipping": "40-dropshipping",
    "stock_landed_costs": "41-landed-costs",
    "contract": "48-contracts",
    "hr_skills": "59-skills",
    "mass_mailing_lists": "66-mailing-lists",
    "website_blog": "69-blog",
    "website_forum": "70-forum",
    "rating": "73-reviews",
    "website_hr_recruitment": "74-online-jobs",
    "website_seo": "75-seo",
    "website_multi": "76-multi-website",
    "web_studio": "77-studio",
    "base_setup": "84-developer",
    "web_mobile": "85-mobile-app",
    "account_consolidation": "24-consolidation",
    "spreadsheet": "09-spreadsheet",
    "l10n_bg_config": "87-tax-declarations",
}


def write_extra():
    for name, (tile, glyph) in EXTRA.items():
        svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="128" height="128">'
               f'{HEAD}<g filter="url(#r)"><rect class="{tile}" width="48" height="48" rx="11"/></g>'
               f'<g class="g" filter="url(#rs)">{glyph}</g></svg>')
        # кръгът с пълнеж в цвета на плочката (като в пакета) следва плочката
        svg = svg.replace('fill="#303439"', f'fill="{TILE[tile]}"')
        (PACK / f"{name}.svg").write_text(svg)


def build_theme():
    names = sorted(p.stem for p in PACK.glob("*.svg"))
    missing = sorted({*APPS.values(), *MODULES.values()} - set(names))
    if missing:
        sys.exit(f"липсват икони: {missing}")
    if OUT_IMG.exists():
        shutil.rmtree(OUT_IMG)
    OUT_IMG.mkdir(parents=True)
    for n in names:
        shutil.copy(PACK / f"{n}.svg", OUT_IMG / f"{n}.svg")
    OUT_JS.write_text(
        "/** @odoo-module **/\n"
        "// Генериран от tools/oexperts_icons/build_pack.py — не се редактира на ръка.\n"
        "// Наборът „o-experts“: приложение (xmlid на коренното меню) и модул → икона.\n"
        f"export const OXI_APPS = {json.dumps(APPS, indent=4, ensure_ascii=False)};\n"
        f"export const OXI_MODULES = {json.dumps(MODULES, indent=4, ensure_ascii=False)};\n")
    return names


def sheet(path, names):
    used = set(APPS.values()) | set(MODULES.values())
    cells = "".join(
        f'<figure><img src="{(OUT_IMG / (n + ".svg")).as_uri()}" alt=""><figcaption>{html.escape(n)}'
        f'{"" if n in used else " ·"}</figcaption></figure>' for n in names)
    pathlib.Path(path).write_text(
        "<!doctype html><meta charset=utf-8><style>body{margin:0;padding:16px;background:#F3F6F9;"
        "font:11px system-ui}main{display:grid;grid-template-columns:repeat(12,1fr);gap:10px}"
        "figure{margin:0;text-align:center}img{width:64px;height:64px}</style><main>" + cells + "</main>")


if __name__ == "__main__":
    write_extra()
    names = build_theme()
    print("икони", len(names), "· приложения", len(APPS), "· модули", len(MODULES))
    if "--sheet" in sys.argv:
        sheet(sys.argv[sys.argv.index("--sheet") + 1], names)

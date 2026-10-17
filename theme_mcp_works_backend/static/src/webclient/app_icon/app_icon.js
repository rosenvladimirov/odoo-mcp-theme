/** @odoo-module **/
// Copyright 2026 Rosen Vladimirov <vladimirov.rosen@gmail.com>
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import { Component } from "@odoo/owl";
import { session } from "@web/session";

/* Иконките на приложенията, рисувани от темата.
   Ключът е xmlid-ът на коренното меню (app.xmlid от menu service) — така
   картата не зависи от езика и от id-тата в конкретната база. Стойността:
   глиф от FontAwesome 4.7 (идва с Odoo) + цветова група. Групата сочи към
   един от --mcp-color-* токените, затова плочката следва пресета и тъмния
   режим. Приложение, което не е в картата, пази собствената си иконка. */
const HUE = {
    finance: 8, // синьо
    sales: 10, // зелено
    ops: 2, // оранжево
    people: 5, // лилаво
    marketing: 9, // малиново
    work: 7, // тюркоаз
    web: 4, // циан
    system: 0, // сиво
};

export const APP_ICONS = {
    // ── финанси ──────────────────────────────────────────────────
    "account.menu_finance": ["fa-file-text-o", "finance"],
    "accountant.menu_accounting": ["fa-calculator", "finance"],
    "hr_expense.menu_hr_expense_root": ["fa-credit-card", "finance"],
    "equity.menu_equity": ["fa-pie-chart", "finance"],
    "spreadsheet_dashboard.spreadsheet_dashboard_menu_root": ["fa-tachometer", "finance"],
    "l10n_bg_api_nra.menu_nra_root": ["fa-university", "finance"],
    // ── продажби ─────────────────────────────────────────────────
    "crm.crm_menu_root": ["fa-handshake-o", "sales"],
    "sale.sale_menu_root": ["fa-line-chart", "sales"],
    "point_of_sale.menu_point_root": ["fa-shopping-cart", "sales"],
    "sale_subscription.menu_sale_subscription_root": ["fa-refresh", "sales"],
    "sale_renting.rental_menu_root": ["fa-key", "sales"],
    "pos_enterprise.menu_point_kitchen_display_root": ["fa-cutlery", "sales"],
    "appointment.main_menu_appointments": ["fa-calendar-check-o", "sales"],
    // ── операции ─────────────────────────────────────────────────
    "purchase.menu_purchase_root": ["fa-shopping-bag", "ops"],
    "stock.menu_stock_root": ["fa-cubes", "ops"],
    "stock_barcode.stock_barcode_menu": ["fa-barcode", "ops"],
    "mrp.menu_mrp_root": ["fa-industry", "ops"],
    "mrp_workorder.menu_mrp_workorder_root": ["fa-sliders", "ops"],
    "mrp_plm.menu_mrp_plm_root": ["fa-pencil-square-o", "ops"],
    "quality_control.menu_quality_root": ["fa-certificate", "ops"],
    "maintenance.menu_maintenance_title": ["fa-wrench", "ops"],
    "repair.menu_repair_order": ["fa-cogs", "ops"],
    "fleet.menu_root": ["fa-car", "ops"],
    "industry_fsm.fsm_menu_root": ["fa-map-marker", "ops"],
    "iot.iot_menu_root": ["fa-microchip", "ops"],
    "esg.esg_main_menu": ["fa-leaf", "ops"],
    // ── хора ─────────────────────────────────────────────────────
    "hr.menu_hr_root": ["fa-users", "people"],
    "hr_recruitment.menu_hr_recruitment_root": ["fa-user-plus", "people"],
    "hr_holidays.menu_hr_holidays_root": ["fa-plane", "people"],
    "hr_attendance.menu_hr_attendance_root": ["fa-id-badge", "people"],
    "hr_work_entry_enterprise.menu_hr_payroll_root": ["fa-money", "people"],
    "hr_appraisal.menu_hr_appraisal_root": ["fa-star-half-o", "people"],
    "hr_referral.menu_hr_referral_root": ["fa-share-alt", "people"],
    "planning.planning_menu_root": ["fa-calendar-plus-o", "people"],
    "frontdesk.frontdesk_menu_root": ["fa-bell-o", "people"],
    "room.room_menu_root": ["fa-building-o", "people"],
    "approvals.approvals_menu_root": ["fa-check-circle-o", "people"],
    // ── маркетинг ────────────────────────────────────────────────
    "mass_mailing.mass_mailing_menu_root": ["fa-envelope-o", "marketing"],
    "mass_mailing_sms.mass_mailing_sms_menu_root": ["fa-mobile", "marketing"],
    "marketing_automation.marketing_automation_menu": ["fa-random", "marketing"],
    "marketing_card.card_menu": ["fa-id-card-o", "marketing"],
    "social.menu_social_global": ["fa-bullhorn", "marketing"],
    "event.event_main_menu": ["fa-ticket", "marketing"],
    "survey.menu_surveys": ["fa-list-alt", "marketing"],
    "utm.menu_link_tracker_root": ["fa-link", "marketing"],
    // ── работа и комуникация ─────────────────────────────────────
    "mail.menu_root_discuss": ["fa-comments", "work"],
    "calendar.mail_menu_calendar": ["fa-calendar", "work"],
    "contacts.menu_contacts": ["fa-address-book-o", "work"],
    "project.menu_main_pm": ["fa-tasks", "work"],
    "project_todo.menu_todo_todos": ["fa-check-square-o", "work"],
    "hr_timesheet.timesheet_menu_root": ["fa-hourglass-half", "work"],
    "documents.menu_root": ["fa-folder-open-o", "work"],
    "knowledge.knowledge_menu_root": ["fa-book", "work"],
    "sign.menu_document": ["fa-pencil", "work"],
    "helpdesk.menu_helpdesk_root": ["fa-life-ring", "work"],
    "im_livechat.menu_livechat_root": ["fa-comments-o", "work"],
    "voip.menu_voip_root": ["fa-phone", "work"],
    "whatsapp.whatsapp_menu_main": ["fa-whatsapp", "work"],
    "ai_app.ai_menu_root": ["fa-magic", "work"],
    // ── уеб ──────────────────────────────────────────────────────
    "website.menu_website_configuration": ["fa-globe", "web"],
    "website_slides.website_slides_menu_root": ["fa-graduation-cap", "web"],
    // ── система ──────────────────────────────────────────────────
    "base.menu_administration": ["fa-cog", "system"],
    "base.menu_management": ["fa-th-large", "system"],
    "base.menu_tests": ["fa-flask", "system"],
    "data_recycle.menu_data_cleaning_root": ["fa-recycle", "system"],
    "databases.menu_main_databases": ["fa-database", "system"],
    "theme_mcp_works_backend_config.menu_mcp_theme_configurator": ["fa-paint-brush", "system"],
    "queue_job.menu_queue_job_root": ["fa-list-ol", "system"],
    "odoo_supervisor.menu_supervisor_root": ["fa-eye", "system"],
    // ── OCA и нашите модули (български слой, Terraros) ───────────
    "payroll.payroll_menu_root": ["fa-money", "people"],
    "l10n_bg_bank_wallet.crypto_wallet_menu_root": ["fa-btc", "finance"],
    "l10n_bg_cla.menu_l10n_bg_cla_root": ["fa-gavel", "system"],
    "l10n_bg_license_server.l10n_bg_license_menu_root": ["fa-shield", "system"],
    "l10n_bg_telegram_bot.l10n_bg_telegram_menu_root": ["fa-telegram", "work"],
    "ai_agent_console.menu_ai_agent_root": ["fa-magic", "work"],
};

export class McpAppIcon extends Component {
    static template = "theme_mcp_works_backend.McpAppIcon";
    // imgClass — класът на родната <img>, когато приложението не е в картата
    static props = { app: Object, imgClass: { type: String, optional: true } };

    get entry() {
        // изключено от Настройки → иконките на Odoo
        if (session.mcp_app_icons === "odoo") {
            return null;
        }
        return APP_ICONS[this.props.app.xmlid] || null;
    }

    get glyph() {
        return this.entry && this.entry[0];
    }

    get hueStyle() {
        const hue = HUE[this.entry[1]] ?? 0;
        return `--mcp-app-hue: var(--mcp-color-${hue});`;
    }

    get letter() {
        return (this.props.app.name || "?").charAt(0).toUpperCase();
    }
}

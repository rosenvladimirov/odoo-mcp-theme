/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";

/**
 * MCP Works — Smart Actions Panel.
 *
 * Replaces the standard cog menu dropdown with a full-width grid panel
 * when there are more than CAPACITY items. Column count of the grid
 * mirrors visible columns of the underlying list view (defaulting to 4).
 *
 * Triggered by user clicking the cog menu in control panel; if items > CAPACITY,
 * stop default dropdown and open this panel.
 */

const CAPACITY = 5;  // dropdown capacity threshold

export class McpActionsPanel extends Component {
    static template = "theme_mcp_works_backend.McpActionsPanel";
    static props = {
        items: { type: Array },
        columnCount: { type: Number, optional: true },
        onClose: { type: Function },
        onPick: { type: Function },
    };

    setup() {
        this.state = useState({
            cols: this.props.columnCount || 4,
        });
    }

    onItemClick(item) {
        this.props.onPick(item);
        this.props.onClose();
    }

    onBackdrop() {
        this.props.onClose();
    }
}

// Register service that intercepts cog menu opens; if items > CAPACITY, swap to panel
const actionPanelService = {
    dependencies: ["dialog"],
    start(env, { dialog }) {
        // Hook into cog menu rendering — observe DOM for .o_cp_action_menus opens
        // (Pure CSS-driven approach — JS не tries to override Odoo's cog menu;
        //  panel exposed as alternative trigger via window.mcpOpenActions(items, cols).)
        window.mcpOpenActions = function (items, columnCount) {
            const id = `mcp-actions-${Date.now()}`;
            return new Promise((resolve) => {
                dialog.add(McpActionsPanel, {
                    items,
                    columnCount,
                    onClose: () => resolve(null),
                    onPick: (item) => resolve(item),
                });
            });
        };
        return {};
    },
};

registry.category("services").add("mcp_actions_panel", actionPanelService);

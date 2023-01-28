odoo.define('web_enterprise.kanban_column_quick_create', function (require) {
"use strict";

const config = require('web.config');
if (!config.device.isMobile) {
    return;
}

const KanbanRenderer = require('web.kanban_column_quick_create');

KanbanRenderer.include({
    init() {
        this._super(...arguments);
        this.isMobile = true;
    },
    _cancel() {
        if (!this.folded) {
            this.$input.val('');
        }
    },
});
});

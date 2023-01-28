odoo.define('web.KanbanColumnMobile', function (require) {
"use strict";

const config = require('web.config');
if (!config.device.isMobile) {
    return;
}

const KanbanColumn = require('web.KanbanColumn');

KanbanColumn.include({
    init() {
        this._super(...arguments);

        this.recordsDraggable = false;
        // deactivate sortable in mobile mode.  It does not work anyway,
        // and it breaks horizontal scrolling in kanban views.  Someday, we
        // should find a way to use the touch events to make sortable work.
        this.canBeFolded = false;
    },
});
});

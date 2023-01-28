odoo.define('web.KanbanViewMobile', function (require) {
"use strict";

const config = require('web.config');
if (!config.device.isMobile) {
    return;
}

const KanbanView = require('web.KanbanView');

KanbanView.include({
    init() {
        this._super(...arguments);
        this.jsLibs.push('/web/static/lib/jquery.touchSwipe/jquery.touchSwipe.js');
    },
});
});

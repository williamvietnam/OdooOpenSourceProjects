odoo.define('nbgsoftware_application.app_kanban_view', function (require) {
    "use strict";

var KanbanView = require('web.KanbanView');
var KanbanRenderer = require('web.KanbanRenderer');
var viewRegistry = require('web.view_registry');


var HideKanbanRenderer = KanbanRenderer.extend({
    on_attach_callback() {
        // hide search and filter, group panel in kanban view
        $('div.o_search_options').hide();
        // override translate button "Create"
        const listButton = document.getElementsByClassName('o-kanban-button-new')[0];
        if (listButton && listButton.textContent.toString().trim() === '作成') {
            listButton.textContent = '追加'
        }
    },
});

var KanbanViewWithoutControlPanel = KanbanView.extend({
    config: _.extend({}, KanbanView.prototype.config, {
        Renderer: HideKanbanRenderer,
        }),
});

viewRegistry.add('app_kanban_view', KanbanViewWithoutControlPanel);

return KanbanViewWithoutControlPanel;
});
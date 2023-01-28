odoo.define('nbgsoftware_document.DocumentKanbanView', function (require) {
"use strict";

const KanbanView = require('web.KanbanView');
const DocumentKanbanRenderer = require('nbgsoftware_document.DocumentKanbanRenderer');
const viewRegistry = require('web.view_registry');

const DocumentKanbanView = KanbanView.extend({
    config: Object.assign({}, KanbanView.prototype.config, {
        Renderer: DocumentKanbanRenderer,
    }),
});

viewRegistry.add('nbgsoftware_document_kanban', DocumentKanbanView);

return DocumentKanbanView;

});
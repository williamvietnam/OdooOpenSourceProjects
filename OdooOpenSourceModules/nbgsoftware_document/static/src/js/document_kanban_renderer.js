odoo.define('usmh_document.DocumentKanbanRenderer', function (require) {
"use strict";

const KanbanRenderer = require('web.KanbanRenderer');
const DocumentKanbanRecord = require('usmh_document.DocumentKanbanRecord');

const DocumentKanbanRenderer = KanbanRenderer.extend({
    config: Object.assign({}, KanbanRenderer.prototype.config, {
        KanbanRecord: DocumentKanbanRecord,
    }),

    async start() {
        this.$el.addClass('o_mrp_documents_kanban_view');
        await this._super(...arguments);
    },
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

return DocumentKanbanRenderer;

});
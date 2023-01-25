odoo.define('usmh_document.DocumentKanbanRecord', function (require) {
"use strict";

    var KanbanRecord = require('web.KanbanRecord');
    var DocumentViewer = require('mail.DocumentViewer');
    var core = require('web.core');
    var ajax = require('web.ajax');
    var ks_file_data = undefined;
    var _t = core._t;
const DocumentKanbanRecord = KanbanRecord.extend({
    events: Object.assign({}, KanbanRecord.prototype.events, {
        'click .ks_kanban_preview': '_onImageClicked',
    }),

    _onImageClicked(ev) {
         var self = this;
            try {
                ev.preventDefault();
                ev.stopPropagation();
                var ks_mimetype = self.recordData.mimetype;
                var document_app = self.recordData.down_document;
                var document_id = self.recordData.app_document_id;
                var name_file;
                function ks_docView(ks_file_data) {
                    if (ks_file_data) {
                        var match = ks_file_data.type.match("(image|video|application/pdf|text)");
                        var attachment = self.recordData.attachment_id
                        if(match){
                            var ks_attachment = [{
                                filename: ks_file_data.name,
                                id: attachment.ref,
                                is_main: false,
                                mimetype: ks_file_data.type,
                                name: ks_file_data.name,
                                type: ks_file_data.type,
                                url: "/web/content/" + attachment.ref + "?download=true",
                            }]
                            var ks_activeAttachmentID = attachment.ref;
                            var ks_attachmentViewer = new DocumentViewer(self,ks_attachment,ks_activeAttachmentID);
                            ks_attachmentViewer.appendTo($('body'));
                        }
                        else{
                            alert(_t('This file type can not be previewed.'))
                        }
                    }
                }
                if(document_app === true && document_id === false ){
                    alert(_t('This document has been deleted.'))
                }
                else{
                    if(document_app === false ){
                    alert(_t('This application is not a document.'))
                    }
                    else{
                        if (ks_mimetype) {
                            if(document_app){
                                name_file = document_id.data.display_name;
                            }
                            else{
                                name_file = self.recordData.name || self.recordData.display_name || "";
                            }
                            ks_file_data = {
                                'id': self.recordData.id,
                                'type': self.recordData.mimetype || 'application/octet-stream',
                                'name': name_file,
                            }
                            ks_docView(ks_file_data);
                        } else {
                            var def = ajax.jsonRpc("/get/record/details", 'call', {
                            'res_id': self.res_id,
                            'model': self.model,
                            'size': self.value,
                            'res_field': self.name || self.field.string,
                            });
                            return $.when(def).then(function(vals) {
                                if (vals && vals.id) {
                                    ks_docView(vals);
                                } else {
                                    alert(_t('This file type can not be previewed.'))
                                }
                            });
                        }
                    }
                }

            } catch (err) {
                alert(err);
            }
        },
});

return DocumentKanbanRecord;

});

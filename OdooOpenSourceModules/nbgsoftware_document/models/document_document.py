# -*- coding: utf-8 -*-

from odoo import models, fields, api, _


class DocumentDocument(models.Model):
    _name = 'document.document'
    _description = 'Document'
    _inherits = {'document.document.public': 'document_public_id'}

    document_public_id = fields.Many2one('document.document.public', required=True, ondelete='cascade', auto_join=True,
                                         index=True, string='Related Document',
                                         help='Document-related data of the public document')

    @api.depends('attachment_id.type')
    def _compute_type(self):
        for record in self:
            record.type = 'empty'
            if record.attachment_id:
                record.type = 'binary'

    @api.onchange('is_public')
    def _onchange_is_public(self):
        all_portals = self.env['res.users'].search([])
        if self.is_public:
            self.portal_ids = [(6, 0, all_portals.ids)]
        else:
            self.portal_ids = [(6, 0, [])]

    def save_to_file(self):
        return {
            'type': 'ir.actions.act_url',
            'url': '/web/content/?model=document.document&id={}&field=file_data&filename_field=name&download=true'.format(
                self.id
            ),
            'target': 'self',
        }

    def unlink(self):
        unlink_documents = self.env['document.document']
        unlink_public_documents = self.env['document.document.public']
        for document in self:
            other_documents = self.search(
                [('document_public_id', '=', document.document_public_id.id), ('id', '!=', document.id)])
            if not other_documents:
                unlink_public_documents |= document.document_public_id
            unlink_documents |= document
        res = super(DocumentDocument, unlink_documents).unlink()
        unlink_public_documents.unlink()
        self.clear_caches()
        return res

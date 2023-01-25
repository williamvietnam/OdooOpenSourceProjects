from odoo import models, fields, api, _


class ResUser(models.Model):
    _inherit = 'res.users'

    def append_portal_document_public(self, res):
        portal_documents = self.env['document.document'].search([('is_public', '=', True)])
        portal_documents.write({
            'portal_ids': [(4, res.id)]
        })

    @api.model
    def create(self, vals):
        res = super().create(vals)
        if res.share:
            self.append_portal_document_public(res)
        return res

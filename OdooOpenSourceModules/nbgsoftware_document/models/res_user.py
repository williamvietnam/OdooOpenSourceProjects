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
        self.append_portal_document_public(res)
        return res

    def _default_user_rule_document(self):
        admin_users = self.env.ref('base.group_system').users
        internal_users = self.env.ref('base.group_user').users - admin_users
        store_admin_document_group_id = self.env['ir.model.data'].xmlid_to_res_id(
            'nbgsoftware_document.group_document_admin', raise_if_not_found=False)
        internal_document_group_id = self.env['ir.model.data'].xmlid_to_res_id(
            'nbgsoftware_document.group_document_internal', raise_if_not_found=False)
        for user in admin_users:
            if store_admin_document_group_id not in user.groups_id.ids:
                user.write({
                    'groups_id': [(4, store_admin_document_group_id)]
                })
        for user in internal_users:
            if internal_document_group_id not in user.groups_id.ids:
                user.write({
                    'groups_id': [(4, internal_document_group_id)]
                })
        return True

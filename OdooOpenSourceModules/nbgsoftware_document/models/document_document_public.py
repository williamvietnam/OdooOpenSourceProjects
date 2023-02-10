from odoo import models, fields, _, api, tools
from odoo.exceptions import ValidationError


class DocumentDocumentPublic(models.Model):
    _name = 'document.document.public'

    def _get_users_domain(self):
        group_user = self.env.ref('base.group_system')
        if group_user:
            admin_ids = group_user.users
            return [('id', 'not in', admin_ids.ids), ('id', '!=', self.env.uid)] if admin_ids else []
        else:
            return []

    name = fields.Char('File Name')
    file_data = fields.Binary('File', attachment=True)
    folder_id = fields.Many2one('document.folder', string="Workspace")
    attachment_id = fields.Many2one('ir.attachment', ondelete='cascade', auto_join=True, copy=False)
    mimetype = fields.Char(related='attachment_id.mimetype', default='application/octet-stream')
    file_size = fields.Integer(related='attachment_id.file_size', store=True, string='File Size (bytes)')
    is_public = fields.Boolean(default=True, string='Is Public')
    portal_ids = fields.Many2many('res.users', 'document_document_users_rel', 'document_id', 'user_id',
                                  domain=_get_users_domain)

    type = fields.Selection([('binary', 'File'), ('empty', 'Request')],
                            string='Type', required=True, store=True, default='empty', change_default=True,
                            compute='_compute_type')

    @api.constrains('file_data')
    def _check_file_data(self):
        for record in self:
            if not record.file_data:
                raise ValidationError(_("Please upload your file."))

    @api.depends('attachment_id.type')
    def _compute_type(self):
        for record in self:
            record.type = 'empty'
            if record.attachment_id:
                record.type = 'binary'

    def save_to_file(self):
        return {
            'type': 'ir.actions.act_url',
            'url': '/web/content/?model=document.document.public&id={}&field=file_data&filename_field=name&download=true'.format(
                self.id
            ),
            'target': 'self',
        }

class IrAttachment(models.Model):
    _inherit = ['ir.attachment']

    @api.model
    def create(self, vals):
        res = super(IrAttachment, self).create(vals)
        if res.res_model == 'document.document.public':
            model = self.env['document.document.public'].search([('id', '=', res.res_id)])
            model.write({
                'attachment_id': res.id
            })
            self.env['ir.attachment'].search([('id', '=', res.id)]).write({
                'name': model.name,
            })
        return res

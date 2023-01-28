from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError


class UiApp(models.Model):
    _inherit = 'ui.app'

    down_document = fields.Boolean(string='Download document')
    app_document_id = fields.Many2one('document.document', string='Document App')
    portal_ids = fields.Many2many(related='app_document_id.portal_ids')
    url_download = fields.Char(compute='_compute_url_download', store=True, readonly=False)
    mimetype = fields.Char(related='app_document_id.mimetype', store=True)
    type = fields.Selection(related='app_document_id.type', store=True)
    attachment_id = fields.Many2one('ir.attachment', related='app_document_id.attachment_id', ondelete='cascade', auto_join=True, copy=False)

    @api.depends('app_document_id')
    def _compute_url_download(self):
        for record in self:
            record.url_download = '/web/content/?model=document.document&id=' + str(
                record.app_document_id.id) + '&field=file_data&filename_field=name&download=true'

    def button_immediate_open(self):
        if self.down_document:
            return {
                'type': 'ir.actions.act_url',
                'target': 'self',
                'url': self.url_download
            }
        elif self.is_custom_app:
            return {
                'type': 'ir.actions.act_url',
                'target': 'new',
                'url': self.url
            }
        return {
            'type': 'ir.actions.act_url',
            'target': 'self',
            'url': self.url
        }

    @api.model
    def get_home_action(self):
        action_id = self.env.ref('nbgsoftware_application.action_all_app', raise_if_not_found=False)
        url = 'web#action=%s&model=ui.app&view_type=kanban&cids=1' % (action_id.id)
        return url

from odoo import models, fields, api


class ResUser(models.Model):
    _inherit = 'res.users'

    @api.model
    def _get_custom_app(self):
        return self.env['ui.app'].search([('is_custom_app', '=', True)]).ids

    custom_app_ids = fields.Many2many('ui.app', default=_get_custom_app)

    @api.model
    def default_get(self, fields):
        result = super(ResUser, self).default_get(fields)
        app_action_id = self.env.ref('nbgsoftware_application.action_all_app', raise_if_not_found=False).id
        if app_action_id:
            result['action_id'] = app_action_id
        return result

    def _redirect_home_action_users(self):
        internal_users = self.search([('share', '=', False)])
        admins = self.env.ref('base.group_system').users
        domain_users = internal_users - admins
        app_action_id = self.env.ref('nbgsoftware_application.action_all_app', raise_if_not_found=False).id
        if app_action_id:
            domain_users.write({
                'action_id': app_action_id
            })
        return True


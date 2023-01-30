from odoo import models, fields, api, _


class ResUser(models.Model):
    _inherit = 'res.users'

    def append_users_notification_public(self, res):
        user_notifications = self.env['notification.notification'].search([('is_public', '=', True)])
        user_notifications.write({
            'user_ids': [(4, res.id)]
        })

    @api.model
    def create(self, vals):
        res = super().create(vals)
        self.append_users_notification_public(res)
        return res

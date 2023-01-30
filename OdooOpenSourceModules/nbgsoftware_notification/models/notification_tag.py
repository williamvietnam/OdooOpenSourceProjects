from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class NotificationTag(models.Model):
    _name = 'notification.tag'
    _description = 'Notification Tag'
    _order = 'sequence'

    name = fields.Char('Tag', required=True)
    sequence = fields.Integer('Sequence', default=10)
    description = fields.Html(string="Description", translate=True)
    notification_ids = fields.Many2many('notification.notification.public', 'tag_notification_rel', 'tag_id', 'notification_id')
    _sql_constraints = [
        ('name_uniq', 'unique(name)', _('Tag name already exists. Type it again.'))
    ]

    def check_has_notification(self):
        if not self.notification_ids and not self.notification_child_ids:
            return False
        all_child_categs = self.search([('id', 'child_of', self.id)])
        user = self.env.user
        notifications = self.env['notification.notification'].search(
            [('tag_ids', 'in', all_child_categs.ids), ('user_ids', 'in', user.id)])
        if notifications:
            return True
        else:
            return False

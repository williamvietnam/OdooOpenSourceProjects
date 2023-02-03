from odoo import models, fields, api


class NotificationNotification(models.Model):
    _name = 'notification.notification'
    _description = 'Notification'
    _inherits = {'notification.notification.public': 'notification_public_id'}
    _order = "id desc"

    notification_public_id = fields.Many2one('notification.notification.public', required=True,
                                             ondelete='cascade', auto_join=True, index=True,
                                             string='Related Notification', help='Notifications')

    @api.onchange('is_public')
    def _onchange_is_public(self):
        all_users = self.env['res.users'].search([])
        if self.is_public:
            self.user_ids = [(6, 0, all_users.ids)]
        else:
            self.user_ids = [(6, 0, [])]

    def unlink(self):
        unlink_notification = self.env['notification.notification']
        unlink_public_notification = self.env['notification.notification.public']
        unlink_is_read_notification = self.env['is.read.notification']
        for notification in self:
            other_notification = self.search(
                [('notification_public_id', '=', notification.notification_public_id.id),
                 ('id', '!=', notification.id)])
            if not other_notification:
                unlink_public_notification |= notification.notification_public_id
            unlink_notification |= notification
        res = super(NotificationNotification, unlink_notification).unlink()
        unlink_is_read_notification.admin_delete_list_unread_notification(self.ids)
        unlink_public_notification.unlink()
        self.clear_caches()
        return res

    def search_read(self, domain=None, fields=None, offset=0, limit=None, order=None):
        new_domain = []
        for d in domain:
            for i in d[-1]:
                new_domain.append(['tag_ids', '=', i])
        return super(NotificationNotification, self).search_read(new_domain, fields, offset, limit, order)

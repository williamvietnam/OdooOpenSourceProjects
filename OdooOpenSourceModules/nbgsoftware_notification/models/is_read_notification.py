from odoo import models, fields, api, _


class IsReadNotification(models.Model):
    _name = "is.read.notification"
    _description = "Is Read Notification"

    user_id = fields.Char(string="user_id")
    notification_id = fields.Char(string="notification_id")

    # get value count unread to show on notification badge for account of internal user and portal user
    @api.model
    def get_notification_count_unread(self):
        user_id = self.env.user.id
        count_notification = self.env['notification.notification.public'].search_count(
            [('user_ids.id', '=', user_id)])
        count_notification_read = self.env['is.read.notification'].search_count([('user_id', '=', user_id)])
        count = count_notification - count_notification_read
        if count < 0:
            count = 0
        return count

    # list all notifications include notifications read & unread
    def list_of_notifications(self):
        user_id = self.env.user.id
        notifications_list = self.env['notification.notification.public'].search([('user_ids.id', '=', user_id)])
        return notifications_list
        # list all notifications read

    # list notifications list read
    def list_of_read_notifications(self):
        user_id = self.env.user.id
        notifications_list_read = self.env['is.read.notification'].search([('user_ids.id', '=', user_id)])
        return notifications_list_read

    @api.model
    def is_read_notification_through_notification_id(self, notification_id):
        user_id = self.env.user.id
        notifications_list_read = self.env['is.read.notification'].sudo().search(
            ['&', ('notification_id', '=', notification_id), ('user_id', '=', user_id)])
        if notifications_list_read:
            return True
        else:
            return False

    @api.model
    def update_list_read_notification(self, notification_list):
        for i in notification_list:
            self.update_is_read_notification(i)

    @api.model
    def delete_list_unread_notification(self, notification_list):
        for i in notification_list:
            self.delete_is_read_notification(i)

    @api.model
    def update_is_read_notification(self, notification_id):
        user_id = self.env.user.id
        if notification_id and not self.check_is_read(notification_id):
            self.env['is.read.notification'].create({'user_id': user_id, 'notification_id': notification_id})
        else:
            return False

    # check notification read or unread with notification_id and user_id conditions
    @api.model
    def check_is_read(self, notification_id):
        user_id = self.env.user.id
        notifications_list_read = self.env['is.read.notification'].sudo().search(
            ['&', ('notification_id', '=', notification_id), ('user_id', '=', user_id)])
        if notifications_list_read:
            return True
        else:
            return False

    # check notification read or unread with notification_id condition
    @api.model
    def check_is_read_notification(self, notification_id):
        notifications_list_read = self.env['is.read.notification'].sudo().search(
            [('notification_id', '=', notification_id)])
        if notifications_list_read:
            return True
        else:
            return False

    # remove notification_id from notifications list read with notification_id and user_id conditions
    @api.model
    def delete_is_read_notification(self, notification_id):
        user_id = self.env.user.id
        if self.check_is_read(notification_id):
            self.env["is.read.notification"].search(
                ['&', ('notification_id', '=', notification_id), ('user_id', '=', user_id)]).unlink()
        else:
            return False

    # get all notifications include notifications read and notifications unread
    @api.model
    def get_notifications_data(self, notification_id):
        dictionary = {}
        notification = self.env['notification.notification.public'].search([('id', '=', notification_id)], limit=1)
        if notification:
            dictionary['id'] = notification.id
            dictionary['name'] = notification.name
            dictionary['content'] = notification.content
            dictionary['create_notification_date_time'] = notification.create_notification_date_time
            return dictionary
        else:
            return False

    # remove a notification_id from notifications list read with notification_id condition
    @api.model
    def admin_delete_is_read_notification(self, notification_id):
        if self.check_is_read_notification(notification_id):
            self.env["is.read.notification"].search(
                [('notification_id', '=', notification_id)]).unlink()
        else:
            return False

    # remove multiple notification_id from notifications list read with notification_id list condition
    @api.model
    def admin_delete_list_unread_notification(self, notification_list):
        for i in notification_list:
            self.admin_delete_is_read_notification(i)

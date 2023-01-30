import base64
import pytz
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from odoo.modules.module import get_resource_path


class NotificationNotificationPublic(models.Model):
    _name = 'notification.notification.public'

    def _get_users_domain(self):
        admin_group = self.env.ref('base.group_system')
        admin_ids = admin_group.users.ids
        return [('id', 'not in', admin_ids)]

    name = fields.Char(string='Title')
    title = fields.Char(string='Title', compute='_compute_display_name_limited', store=True)
    content = fields.Html(string='Content', translate=True)
    create_notification_date_time = fields.Char(string="Created on", compute='_translate_time', store=True)
    tag_ids = fields.Many2many('notification.tag', 'tag_notification_rel', 'notification_id', 'tag_id', string="Tags")
    is_public = fields.Boolean(default=True)
    is_notification_read = fields.Boolean(default=False)
    user_ids = fields.Many2many('res.users', string='Users notified', domain=_get_users_domain)
    is_notification_important = fields.Boolean(string='Mark to important', default=False)
    notification_important = fields.Binary(string="", compute='_compute_notification_important')

    @api.constrains('name', 'content')
    def _constrains_value(self):
        if any(not rec.name for rec in self):
            raise ValidationError(_('Please enter the title name.'))
        if any(rec.content == "<p><br></p>" for rec in self):
            raise ValidationError(_('Please enter the content.'))

    # create url link to navigate when click notification badge
    @api.model
    def get_notification_button_action(self):
        action_id = self.env.ref('nbgsoftware_notification.action_notification_public', raise_if_not_found=False)
        menu = self.env.ref('nbgsoftware_application.menu_nbgsoftware_root')
        url = '/web#action=%s&model=notification.notification.public&view_type=list&cids=1&menu_id=%s' % (
            action_id.id, menu.id)
        return url

    # get value count unread to show on notification badge for account of internal user and portal user
    @api.model
    def get_notification_count_unread(self):
        notification_count_unread = len(self.list_of_notifications())
        notification_count_read = len(self.list_of_read_notifications())
        notification_count_unread = notification_count_unread - notification_count_read
        if notification_count_unread < 0:
            notification_count_unread = 0
        return notification_count_unread

    # check hide/show notification badge between account of admin and internal user
    @api.model
    def is_show_notification_badge(self):
        if not self.env.is_admin():
            return True
        return False

    @api.model
    def get_user_id(self):
        return self.env.user.id

    # list all notifications include notifications read & unread
    def list_of_notifications(self):
        self.init()
        user = self.get_user_id()
        self._cr.execute("""
        SELECT * FROM public.notification_notification_public_res_users_rel WHERE res_users_id = %s
        """ % user)
        notifications_list = self._cr.dictfetchall()
        return notifications_list

    # list all notifications read
    def list_of_read_notifications(self):
        self.init()
        user = self.get_user_id()
        self._cr.execute("""SELECT * FROM public.is_read_notification WHERE user_id = %s""" % user)
        notifications_list_read = self._cr.dictfetchall()
        return notifications_list_read

    @api.model
    def is_read_notification_through_notification_id(self, notification_id):
        self._cr.execute(
            """
            SELECT user_id, notification_id FROM public.is_read_notification
            where user_id = %s and notification_id = %s
            """ % (self.env.user.id, notification_id)
        )
        notification_list_read = self._cr.dictfetchall()
        if notification_list_read:
            return True
        else:
            return False

    @api.model
    def is_read_notification(self, notification_id, user_id):
        self._cr.execute(
            """
            SELECT user_id, notification_id FROM public.is_read_notification
            """
        )
        notification_list_read = self._cr.dictfetchall()
        if {'user_id': user_id, 'notification_id': notification_id} in notification_list_read:
            return True
        else:
            return False

    def init(self):
        self.env.cr.execute("""
                       CREATE TABLE IF NOT EXISTS is_read_notification (
                       id serial primary key,
                        User_Id INT not null,
                        Notification_Id INT not null,
                        create_date timestamp without time zone DEFAULT (now() at time zone 'utc')
                       );
                   """)

    # add notifications into notifications list read
    @api.model
    def update_list_read_notification(self, notification_list):
        user_id = self.env.user.id
        for i in notification_list:
            self.update_is_read_notification(i, user_id)

    # remove notifications from notifications list read
    @api.model
    def delete_list_unread_notification(self, notification_list):
        user_id = self.env.user.id
        for i in notification_list:
            self.delete_is_read_notification(i, user_id)

    @api.model
    def update_is_read_notification_through_notification_id(self, notification_id):
        self.env.cr.execute("""
            insert into is_read_notification (Notification_Id, User_Id) 
               select %s, %s
               where not exists (
                select null from is_read_notification 
                where ( Notification_Id, User_Id) = (%s, %s)
               )
          """ % (notification_id, self.env.user.id, notification_id, self.env.user.id))

    # add a notification into notifications list read
    @api.model
    def update_is_read_notification(self, notification_id, user_id):
        self.env.cr.execute("""
            insert into is_read_notification (Notification_Id, User_Id) 
               select %s, %s
               where not exists (
                select null from is_read_notification 
                where ( Notification_Id, User_Id) = (%s, %s)
               )
          """ % (notification_id, user_id, notification_id, user_id))

    # remove a notification from notifications list read
    @api.model
    def delete_is_read_notification(self, notification_id, user_id):
        self.env.cr.execute("""
             delete from is_read_notification
             where ( Notification_Id, User_Id) = (%s, %s) 
        """ % (notification_id, user_id))

    # limit char number display of title
    @api.depends('name')
    def _compute_display_name_limited(self):
        for record in self:
            if record.name:
                if len(record.name) > 10:
                    record.title = f"{record.name[:10]}..."
                else:
                    record.title = record.name
            else:
                record.title = False

    # show star icon use image
    def _compute_notification_important(self):
        for rec in self:
            if not rec.is_notification_important:
                image_path = get_resource_path('nbgsoftware_notification', 'static/description', 'un_important.png')
                rec.notification_important = base64.b64encode(open(image_path, 'rb').read()) if image_path else False
            else:
                image_path = get_resource_path('nbgsoftware_notification', 'static/description', 'important.png')
                rec.notification_important = base64.b64encode(open(image_path, 'rb').read()) if image_path else False

    @api.depends('create_date')
    def _translate_time(self):
        for rec in self:
            tz_JP = pytz.timezone('Asia/Tokyo')
            date_time_temp = pytz.utc.localize(rec.create_date, is_dst=None).astimezone(tz_JP)
            rec.create_notification_date_time = date_time_temp.strftime("%Y/%m/%d %H:%M")

    def search_read(self, domain=None, fields=None, offset=0, limit=None, order=None):
        new_domain = []
        for d in domain:
            for i in d[-1]:
                new_domain.append(['tag_ids', '=', i])
        return super(NotificationNotificationPublic, self).search_read(new_domain, fields, offset, limit, order)

    @api.model
    def get_notifications_data(self, notification_id):
        self.env.cr.execute("""
                  SELECT * FROM public.notification_notification_public
                   WHERE id = %s
                """ % notification_id)
        return self._cr.dictfetchall()

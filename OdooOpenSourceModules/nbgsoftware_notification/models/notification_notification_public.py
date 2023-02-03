import base64
import pytz
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from odoo.modules.module import get_resource_path


class NotificationNotificationPublic(models.Model):
    _name = 'notification.notification.public'
    _order = "id desc"

    def _get_users_domain(self):
        admin_group = self.env.ref('base.group_system')
        admin_ids = admin_group.users.ids
        return [('id', 'not in', admin_ids)]

    name = fields.Char(string='Title')
    content = fields.Html(string='Content', translate=True)
    create_notification_date_time = fields.Char(string="Created on", compute='_translate_time', store=True)
    tag_ids = fields.Many2many('notification.tag', 'tag_notification_rel', 'notification_id', 'tag_id', string="Tags")
    is_public = fields.Boolean(default=True)
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

    # check hide/show notification badge between account of admin and internal user
    @api.model
    def is_show_notification_badge(self):
        if not self.env.is_admin():
            return True
        return False

    @api.model
    def get_user_id(self):
        return self.env.user.id

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

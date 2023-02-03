from odoo import http
from odoo.addons.portal.controllers.portal import CustomerPortal
from odoo.addons.website.controllers.main import QueryURL
from odoo.http import request


class CustomerNotificationPortal(CustomerPortal):

    def _prepare_portal_layout_values(self):
        values = super(CustomerNotificationPortal, self)._prepare_portal_layout_values()
        return values

    @http.route([
        '/notifications'
    ], type='http', auth="user", website=True)
    def notifications(self, page=0, tag=None, search='', ppg=False, **post):
        values = self._prepare_portal_layout_values()
        is_read_notifications_list = {}
        notification = request.env['notification.notification.public']
        attrib_list = request.httprequest.args.getlist('attrib')
        keep = QueryURL('/notifications', tag=tag and int(tag), search=search, attrib=attrib_list,
                        order=post.get('order'))
        url = "/notifications"
        notifications = notification.search([('user_ids', 'in', request.env.user.ids)])
        for i in notifications:
            if request.env['is.read.notification'].is_read_notification_through_notification_id(i.id):
                is_read_notifications_list[i.id] = True
            else:
                is_read_notifications_list[i.id] = False

        values.update({
            'notifications': notifications,
            'is_read_notifications_list': is_read_notifications_list,
            'base_url': http.request.env["ir.config_parameter"].sudo().get_param("web.base.url"),
        })
        return request.render("nbgsoftware_notification.website_portal_my_notification", values)

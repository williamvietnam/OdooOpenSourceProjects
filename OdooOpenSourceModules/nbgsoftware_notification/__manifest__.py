# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'NBGSoftware Notification',
    'version': '14.0.1.0',
    'category': 'nbgsoftware',
    'summary': 'NBGSoftware Notification',
    'description': """
        * NBGSoftware Notification
    """,
    'website': '',
    'author': '',
    'depends': ['nbgsoftware_application'],
    'data': [
        'security/ir.model.access.csv',
        'views/assets.xml',
        'security/app_security.xml',
        'views/notification_notification_public.xml',
        'views/notification_notification.xml',
        'views/notification_tag.xml',
        'views/menu.xml',
        'views/portal_notification_templates.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'qweb': [
        'static/src/xml/notification_badge.xml',
    ],
}

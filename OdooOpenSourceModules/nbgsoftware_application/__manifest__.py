# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'NBGSoftware Application',
    'version': '14.0.1.0',
    'category': 'NBGSoftware',
    'summary': 'Group apps and create deeplink app',
    'description': """
        * Link to app
    """,
    'website': '',
    'author': '',
    'depends': ['base', 'portal', 'web', 'web_enterprise'],
    'data': [
        'security/ir.model.access.csv',
        'security/app_security.xml',
        'views/assets.xml',
        'views/ui_app.xml',
        'views/home_app.xml',
        'views/ui_app_category.xml',
        'views/menu.xml',
        'views/portal_templates.xml',
        'views/res_users.xml',
        'data/ir_cron_data.xml'
    ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'qweb': [
        'static/src/xml/control_panel.xml',
    ],
}

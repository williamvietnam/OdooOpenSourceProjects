# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'NBGSoftware Document',
    'version': '1.0.0.0',
    'category': 'NBGSoftware',
    'summary': 'NBGSoftware Document',
    'description': """
        * NBGSoftware Document
    """,
    'website': '',
    'author': '',
    'depends': ['nbgsoftware_application'],
    'data': [
        'security/ir.model.access.csv',
        'views/assets.xml',
        'security/document_security.xml',
        'security/app_security.xml',
        'security/ir.model.access.csv',
        'views/assets.xml',
        'views/res_config_settings_views.xml',
        'views/document_document.xml',
        'views/document_document_public.xml',
        'views/document_workspace.xml',
        'views/menu.xml',
        'views/portal_document_templates.xml',
        'views/ui_app_document_view.xml',

    ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'qweb': [
        'static/src/xml/view_home_app.xml',
    ],
}

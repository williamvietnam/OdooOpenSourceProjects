# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Web NBGSoftware',
    'category': 'Hidden',
    'version': '1.0',
    'description':
        """
        """,
    'depends': ['web'],
    'auto_install': True,
    'data': [
        'views/webclient_templates.xml',
    ],
    'qweb': [
        "static/src/xml/*.xml",
    ],
    'license': 'OEEL-1',
}

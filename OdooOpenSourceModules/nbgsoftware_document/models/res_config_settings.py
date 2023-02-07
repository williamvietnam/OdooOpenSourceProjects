from odoo import models, fields, api


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    max_file_upload_size = fields.Char(config_parameter='web.max_file_upload_size')
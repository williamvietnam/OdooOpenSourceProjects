from odoo import models, fields


class ConfigurationTypes(models.Model):
    _name = "configuration.types"
    _description = "Types"

    name = fields.Char("Name")

from odoo import api, models, fields


class ConfigurationHelpdeskTeam(models.Model):
    _name = "configuration.helpdesk.team"
    _description = "Helpdesk Team"

    name = fields.Char("Name")
    alias_email = fields.Char("Alias email")
    company = fields.Char("Company")

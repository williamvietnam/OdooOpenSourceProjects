from odoo import models, api, fields


class ConfigurationStages(models.Model):
    _name = "configuration.stages"
    _description = "Configuration Stages"

    name = fields.Char("Name")
    helpdesk_teams = fields.Char("Helpdesk Teams")

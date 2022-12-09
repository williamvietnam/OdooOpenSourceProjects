from odoo import fields, models


class ConfigurationSlaPolicies(models.Model):
    _name = "configuration.sla.policies"
    _description = "SLA Policies"

    name = fields.Char("Name")
    helpdesk_team = fields.Char("Helpdesk Team")



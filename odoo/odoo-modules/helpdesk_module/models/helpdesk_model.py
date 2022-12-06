from odoo import api, fields, models, _


class HelpdeskModel(models.Model):
    _name = "helpdesk.model"
    _description = "Helpdesk Model"

    tickets = fields.Char('My Tickets')
    performance = fields.Char('My Performance')

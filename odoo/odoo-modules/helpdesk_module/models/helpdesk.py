from odoo import api, fields, models, _


class Helpdesk(models.Model):
    _name = "helpdesk"
    _description = "Helpdesk"

    tickets = fields.Char('My Tickets')
    performance = fields.Char('My Performance')

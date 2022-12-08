from odoo import api, fields, models, _


class TicketsTickets(models.Model):
    _name = "tickets.tickets"
    _description = "Tickets Tickets"

    name = fields.Char("Name", required=True)
    helpdesk_team = fields.Char("Helpdesk Team", required=True)
    assigned_to = fields.Char("Assigned to", required=True)
    customer = fields.Char("Customer", required=True)
    company = fields.Char("Company", required=True)
    next_activity = fields.Date("Next Activity", required=True)
    type = fields.Selection([('question', 'Question'),
                             ('issue', 'Issue'),
                             ('bug', 'Bug'),
                             ('documentation', 'Documentation')], default='issue')


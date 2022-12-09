from odoo import api, fields, models


class ReportingTicketsAnalysis(models.Model):
    _name = "reporting.tickets.analysis"
    _description = "Tickets Analysis"

    new = fields.Char
    in_progress = fields.Char
    solved = fields.Char
    cancelled = fields.Char
    done = fields.Char

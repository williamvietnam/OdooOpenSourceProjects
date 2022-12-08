from odoo import api, fields, models


class ReportingTicketsAnalysis(models.Model):
    _name = "reporting.tickets.analysis"
    _description = "Tickets Analysis"

    new = fields.Float
    in_progress = fields.Float
    solved = fields.Float
    cancelled = fields.Float
    done = fields.Float

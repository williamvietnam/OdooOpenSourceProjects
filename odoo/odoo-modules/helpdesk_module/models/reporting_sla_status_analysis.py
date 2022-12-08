from odoo import models, api, fields


class ReportingSlaStatusAnalysis(models.Model):
    _name = "reporting.sla.status.analysis"
    _description = "SLA Status Analysis"

    total = fields.Char("Total")


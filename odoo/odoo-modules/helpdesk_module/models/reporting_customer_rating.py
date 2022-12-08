from odoo import api, fields, models


class ReportingCustomerRating(models.Model):
    _name = "reporting.customer.rating"
    _description = "Customer Rating"

    name = fields.Char("Name")
    customer = fields.Char("Customer")
    ticket = fields.Char("Ticket")
    comment = fields.Char("Comment from customer")

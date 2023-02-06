from odoo import models, fields


class Demo(models.Model):
    _name = "demo"
    _description = "Demo"

    name = fields.Char("Name")
    detail = fields.Text("Detail")

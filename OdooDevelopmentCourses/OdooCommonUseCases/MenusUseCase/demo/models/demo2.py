from odoo import models, fields


class Demo2(models.Model):
    _name = "demo2"
    _description = "Demo2"

    name = fields.Char("Name2")
    detail = fields.Text("Detail2")

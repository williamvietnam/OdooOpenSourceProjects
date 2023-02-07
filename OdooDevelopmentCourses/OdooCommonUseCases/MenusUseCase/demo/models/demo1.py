from odoo import models, fields


class Demo1(models.Model):
    _name = "demo1"
    _description = "Demo1"

    name = fields.Char("Name1")
    detail = fields.Text("Detail1")

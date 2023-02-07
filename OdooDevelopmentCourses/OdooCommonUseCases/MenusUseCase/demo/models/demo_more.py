from odoo import models, fields


class SubDemo1(models.Model):
    _name = "sub.demo1"
    _description = "Sub Demo 1"

    name = fields.Char("Sub Name 1")
    detail = fields.Text("Sub Detail 1")


class SubDemo2(models.Model):
    _name = "sub.demo2"
    _description = "Sub Demo 2"

    name = fields.Char("Sub Name 2")
    detail = fields.Text("Sub Detail 2")

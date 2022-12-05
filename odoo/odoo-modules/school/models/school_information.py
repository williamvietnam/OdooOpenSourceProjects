from odoo import fields, models


class SchoolInformation(models.Model):
    _name = "school.information"
    _description = "School Information"

    name = fields.Char(string="School name")
    type = fields.Selection([("private", "Dân lập"), ("public", "Công lập")], defalut="public", string="School type")
    email = fields.Text(string="Email")
    address = fields.Text(string="Address")

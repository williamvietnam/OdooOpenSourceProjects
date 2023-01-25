# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class DocumentFolder(models.Model):
    _name = 'document.folder'
    _description = 'Document Workspace'
    _parent_name = 'parent_folder_id'
    _order = 'sequence'

    name = fields.Char('Workspace', required=True)
    sequence = fields.Integer('Sequence', default=10)
    description = fields.Html(string="Description", translate=True)
    parent_folder_id = fields.Many2one('document.folder', string="Parent Workspace", ondelete="cascade",
                                       help="A workspace will inherit the tags of its parent workspace")
    document_child_ids = fields.One2many('document.folder', 'parent_folder_id')
    document_ids = fields.One2many('document.document', 'folder_id')
    _sql_constraints = [
        ('name_uniq', 'unique(name)', _('Workspace name already exists. Type it again.'))
    ]

    @api.constrains('parent_folder_id')
    def _check_parent_category(self):
        if not self._check_recursion():
            raise ValidationError(_('Error! You cannot create recursive workspace.'))

    @api.model
    def create(self, vals):
        if not self.env.is_admin():
            if not vals.get('parent_folder_id'):
                raise ValidationError(_('The parent folder must be required!'))
        return super(DocumentFolder, self).create(vals)

    def write(self, vals):
        if not self.env.is_admin():
            if not vals.get('parent_folder_id'):
                raise ValidationError(_('The parent folder must be required!'))
        return super(DocumentFolder, self).write(vals)

    def check_has_document(self):
        if not self.document_ids and not self.document_child_ids:
            return False
        all_child_categs = self.search([('id', 'child_of', self.id)])
        user = self.env.user
        documents = self.env['document.document'].search(
            [('folder_id', 'in', all_child_categs.ids), ('portal_ids', 'in', user.id)])
        if documents:
            return True
        else:
            return False

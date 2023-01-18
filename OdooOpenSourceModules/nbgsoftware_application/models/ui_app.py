from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError


class UiAppCategory(models.Model):
    _name = 'ui.app.category'

    name = fields.Char()
    ui_app_ids = fields.One2many('ui.app', 'category_id')
    category_type = fields.Selection([
        ('general', _('general')),
        ('system', _('System')),
        ('portal', _('Portal'))
    ], compute='_compute_category_type', default='general', store=True)
    parent_id = fields.Many2one('ui.app.category', string='Parent Category', ondelete='cascade', index=True)
    category_child_ids = fields.One2many('ui.app.category', 'parent_id')
    has_app = fields.Boolean(default=False, compute='_compute_has_app', store=True,
                             help="True if category has app or all child of category has app else False")

    _sql_constraints = [
        ('uniq_name', 'unique(name)', _('The category name must be unique.')),
    ]

    @api.constrains('name')
    def _constrains_value(self):
        if any(not rec.name for rec in self):
            raise ValidationError(_('Please enter the name category.'))

    @api.constrains('parent_id')
    def _check_parent_category(self):
        if not self._check_recursion():
            raise ValidationError(_('Error! You cannot create recursive category.'))

    @api.depends('ui_app_ids')
    def _compute_category_type(self):
        for rec in self:
            if rec.ui_app_ids and any(app.is_custom_app for app in rec.ui_app_ids):
                rec.category_type = 'portal'
            elif rec.ui_app_ids and not any(app.is_custom_app for app in rec.ui_app_ids):
                rec.category_type = 'system'
            else:
                rec.category_type = 'general'

    @api.depends('ui_app_ids')
    def _compute_has_app(self):
        for rec in self:
            parent_categories = self.search([('id', 'parent_of', rec.id)])
            if any(app.is_custom_app for app in rec.ui_app_ids):
                rec.has_app = True
                parent_categories.write({
                    'has_app': True
                })
            else:
                rec.has_app = False
                for parent_category in parent_categories:
                    child_categories = self.search([('id', 'child_of', parent_category.id)])
                    child_apps = child_categories.mapped('ui_app_ids')
                    if child_apps and any(app.is_custom_app for app in child_apps):
                        parent_category.has_app = True
                    else:
                        parent_category.has_app = False

    def write(self, vals):
        old_parent_categories = self.search([('id', 'parent_of', self.ids)])
        res = super(UiAppCategory, self).write(vals)
        if vals.get('parent_id'):
            old_parent_categories._compute_has_app()
        return res


class UiApp(models.Model):
    _name = 'ui.app'
    _rec_name = 'name'

    def _get_menu_domain(self):
        domain = [('web_icon_data', '!=', False), ('has_ui_app', '=', False)]
        menu_root = self.env.ref('nbgsoftware_application.menu_nbgsoftware_root', raise_if_not_found=False)
        if menu_root:
            domain += [('id', '!=', menu_root.id)]
        return domain

    name = fields.Char(compute='_compute_name', store=True, string='App Name')
    parent_id = fields.Many2one('ui.app', ondelete='cascade')
    app_link_name = fields.Char(string='App Name')
    category_id = fields.Many2one('ui.app.category')
    menu_id = fields.Many2one('ir.ui.menu', domain=_get_menu_domain, string='App Name')
    url = fields.Char(string='App Url', compute='_compute_url', store=True, readonly=False)
    web_icon = fields.Binary(related='menu_id.web_icon_data', store=True, readonly=False)
    icon_url = fields.Char(compute='_compute_icon_url', store=True)
    is_custom_app = fields.Boolean(default=False, string='is Customize App')
    groups_id = fields.Many2many('res.groups', compute='_compute_groups_id', store=True)
    user_ids = fields.Many2many('res.users')
    _sql_constraints = [
        ('uniq_name', 'unique(name)', _('The app name must be unique.')),
    ]

    @api.model
    def create(self, vals):
        res = super().create(vals)
        if res.is_custom_app:
            users = self.env['res.users'].search([('share', '=', False)])
            users.write({
                'custom_app_ids': [(4, res.id)]
            })
        return res

    @api.depends('app_link_name', 'menu_id')
    def _compute_name(self):
        for rec in self:
            if rec.app_link_name and not rec.menu_id:
                rec.name = rec.app_link_name
            elif rec.menu_id and not rec.app_link_name:
                rec.name = rec.menu_id.name
            else:
                rec.name = ''

    @api.depends('menu_id')
    def _compute_groups_id(self):
        for rec in self:
            if not rec.menu_id:
                rec.groups_id = None
            rec.groups_id = rec.menu_id.groups_id

    @api.constrains('name', 'menu_id', 'url', 'web_icon', 'down_document', 'app_document_id')
    def _constrains_value(self):
        if any(not rec.name and not rec.menu_id for rec in self):
            raise ValidationError(_('Please enter the name app.'))
        if any(not rec.url and not rec.down_document for rec in self):
            raise ValidationError(_('Please enter the url.'))
        if any(not rec.web_icon for rec in self):
            raise ValidationError(_('Please upload the icon app.'))
        if any(not rec.app_document_id and rec.down_document for rec in self):
            raise ValidationError(_('Please choose the document.'))

    @api.depends('menu_id')
    def _compute_url(self):
        base_url = self.env['ir.config_parameter'].get_param('web.base.url')
        for rec in self:
            if rec.menu_id:
                action_id = rec.menu_id._get_action_id()
                rec.url = '%s/web#menu_id=%s&action=%s' % (base_url, str(rec.menu_id.id), action_id)
            else:
                rec.url = ''

    @api.depends('menu_id.web_icon_data', 'web_icon')
    def _compute_icon_url(self):
        for rec in self:
            if rec.menu_id.web_icon_data:
                rec.icon_url = 'data:image/png;base64,' + rec.menu_id.web_icon_data.decode('utf-8')
            elif rec.web_icon:
                rec.icon_url = 'data:image/png;base64,' + rec.web_icon.decode('utf-8')
            else:
                rec.icon_url = False

    def button_immediate_open(self):
        if self.is_custom_app:
            return {
                'type': 'ir.actions.act_url',
                'target': 'new',
                'url': self.url
            }
        return {
            'type': 'ir.actions.act_url',
            'target': 'self',
            'url': self.url
        }

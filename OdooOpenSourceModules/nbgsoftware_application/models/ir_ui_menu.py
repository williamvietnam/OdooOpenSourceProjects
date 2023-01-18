from odoo import models, fields, api, tools
from odoo.osv import expression


class IrUiMenu(models.Model):
    _inherit = 'ir.ui.menu'

    ui_app_ids = fields.One2many('ui.app', 'menu_id')
    has_ui_app = fields.Boolean(compute='_compute_has_ui_app', store=True)

    @api.depends('ui_app_ids')
    def _compute_has_ui_app(self):
        for rec in self:
            rec.has_ui_app = True if rec.ui_app_ids else False

    def _get_action_id(self):
        fields = ['name', 'sequence', 'parent_id', 'action', 'web_icon', 'web_icon_data']
        all_menus = self.search([('id', 'child_of', self.id)])
        menu_items = all_menus.read(fields)
        menu_items_map = {menu_item["id"]: menu_item for menu_item in menu_items}
        for menu_item in menu_items:
            menu_item.setdefault('children', [])
            parent = menu_item['parent_id'] and menu_item['parent_id'][0]
            if parent in menu_items_map:
                menu_items_map[parent].setdefault(
                    'children', []).append(menu_item['id'])

        # sort by sequence
        for menu_id in menu_items_map:
            menu_items_map[menu_id]['children'].sort(key=lambda id: menu_items_map[id]['sequence'])

        menu_root = menu_items_map[self.id]
        action = menu_root['action']
        child = menu_root
        while child and not action:
            action = child['action']
            child = menu_items_map[child['children'][0]] if child['children'] else False
        action_model, action_id = action.split(',') if action else (False, False)
        return action_id

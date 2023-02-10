### OdooERP navigation icon on header bar of internal user

- Step 1: Tạo model
```python
from odoo import models, fields, api

class Demo(models.Model):
    _name = "demo"
    _description = "Demo"

    name = fields.Char("Name")
    detail = fields.Char("Detail")

    @api.model
    def get_button_action(self):
        action_id = self.env.ref('nbg_notification.action_notification_public', raise_if_not_found=False)
        menu = self.env.ref('demo.menu_root')
        url = '/web#action=%s&model=demo&view_type=list&cids=1&menu_id=%s' % (
            action_id.id, menu.id)
        return url

```
Explain: `def get_button_action()` dùng để tạo url điều hướng khi click vào icon button

- Step 2: Tạo menu, action, views(tree/kanban/form)
- Step 3: Sử dụng XML, JS, CSS để custom vị trí xuất hiện của icon và kích thước, hình dạng icon

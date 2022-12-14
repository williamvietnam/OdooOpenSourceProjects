1. Lý thuyết

2. Đoạn mã bên dưới minh hoạ một số trường hợp thường dùng controller để tạo url link:

```python
import json
import werkzeug
from odoo import http
from odoo.http import request


class DemoControllers(http.Controller):
    @http.route('/demo', auth='public', type='http')
    def demo_1(self):
        return "Hello, World"

    # Nhận value được trả về từ url link
    @http.route('/demo/<int:id>', auth='public', type='http')
    def demo_2(self, id):
        return "Demo %s" % str(id)

    # Muốn điều hướng web tới một url bên ngoài
    @http.route('/demo/nav-to-outer-url-link', auth='public')
    def demo_3(self):
        return werkzeug.utils.redirect('https://www.google.com.vn/')

    # Điều hướng web tới một template trong odoo
    @http.route('/demo/nav-to-odoo-template', auth="public")
    def demo_4(self):
        return request.render("web.login")

    # Điều hướng tới một tệp json tự định nghĩa
    @http.route('/demo/create-json-file', auth='public', type='http')
    def demo_5(self):
        return json.dumps({
            "id": "0",
            "name": "WillVN",
            "version_name": "1.0.0",
            "version_code": "1",
        })

    # Tạo một thuộc tính cho model bằng cách điều hướng tới một url
    @http.route('/demo/create-attribute-for-model', auth='public', type='http')
    def demo_6(self):
        partner = request.env['res.partner'].sudo().create({
            'name': 'WillVN'
        })
        return 'Partner has been created'

```

3. Kế thừa một hàm trong Controllers class

- main.py file (into controllers folder | direct: addons/controllers/main.py)
```python
from odoo import http

class DemoControllers(http.Controller):
    @http.route('/demo', auth='public', type='http')
    def demo_1(self):
        return "Hello, World"
```

- main_inherit.py file (into controllers folder | direct: addons/controllers/main_inherit.py)
```python
from odoo import http
from addons.controllers.main import DemoControllers

class DemoControllerInherits(DemoControllers):
    @http.route('/demo/inherits')
    def demo_inherits(self):
        super(DemoControllers, self).demo_1()
        return "inherited successfully"
```
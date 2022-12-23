## Lý thuyết

[Xem thêm](https://www.odoo.com/documentation/14.0/developer/reference/addons/http.html)

#### 1. **Routing**  [Xem chi tiết](https://www.odoo.com/documentation/14.0/developer/reference/addons/http.html#routing)

@odoo.http.route(route=None, **kw) | **kw: type, auth, methods, cors, csrf

_Parameters_:

- route: string or array. Route sẽ xác định yêu cầu http nào sẽ khớp với the decorated method. Có thể là một chuỗi đơn
  hoặc một mảng các chuỗi
- type: 'http' hoặc 'json' | http: thường dùng để tạo một url giúp điều hướng web tới đó, json: thường dùng để tạo api
- auth: gồm 3 loại xác thực
    + user: Người dùng BẮT BUỘC PHẢI đăng nhập để truy cập vào route
    + public: Người dùng có thể hoặc ko cần đăng nhập để truy cập vào route
    + none: luôn luôn truy cập đc (kể cả ko có database)
- methods: Một chuỗi http methods mà route áp dụng. Nếu ko truyền tham số này, all methods đều được cho phép.
- ...

Decorator marking the decorated method as being a handler for requests. The method must be part of a subclass of
Controller.
(Decorator đánh dấu the decorated method là một trình xử lý các yêu cầu. Phương thức này phải là một phần của lớp con
của Controller.)

#### 2. **Request**  [Xem chi tiết](https://www.odoo.com/documentation/14.0/developer/reference/addons/http.html#request)


#### 3. **Response**  [Xem chi tiết](https://www.odoo.com/documentation/14.0/developer/reference/addons/http.html#response)

odoo.http.Response(*args, **kw) | Parameters:

- template (basestring) – template to render
- qcontext (dict) – Rendering context to use
- uid (int) – User id to use for the ir.ui.view render call, None to use the request’s user (the default)


#### Đối tượng có thể chứa các trường dữ liệu thuộc 3 loại sau: đơn giản, quan hệ, và chức năng
 - Loại đơn giản là các kiểu dữ liệu như: số nguyên, chấm động, boolean, chuỗi.. 
 - Các trường có kiểu dữ liệu quan hệ biểu thị cho các mối quan hệ giữa các đối tượng (one2many, many2one, many2many).
 - Theo mặc định, các trường có kiểu dữ liệu là chức năng sẽ không được lưu trữ trong cơ sở dữ liệu mà được tính toán lại mỗi lần chạy.


#### Các thuộc tính có thể có trong tất cả các trường dữ liệu:
 - string: nhãn của trường (bắt buộc phải có)
 - required: nếu là True thì bắt buộc người dùng phải nhập dữ liệu vào trường này
 - readonly: nếu là True thì người dùng không thể thay đổi dữ liệu trường này.
 - help: giải thích, hướng dẫn cho trường dữ liệu này
 - select: 1 để đưa trường này vào màn hình tìm kiếm và để giúp tối ưu cho việc lọc danh sách (được đánh dấu index trong csdl)
 - context: là một dictionaries chứa các tham số về ngữ cảnh như: ngôn ngữ sử dụng là gì, múi giờ là gì, model nào đang đang được sử dụng, id là bao nhiêu..
   Ví dụ: {‘lang’: ‘en_us’, ‘tz’: ‘UTC’, …}
 - change_default: nếu là True thì trường này có thể sử dụng để làm điều kiện để thay đổi các giá trị mặc định của một đối tượng.
 - states: thay đổi thuộc tính của trường này dựa vào trường state.

#### field đơn giản

#### field quan hệ


#### field chức năng


## Demo Odoo Controllers

1. Đoạn mã bên dưới minh hoạ một số trường hợp thường dùng controller để tạo url link:

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

2. Kế thừa một hàm trong Controllers class

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


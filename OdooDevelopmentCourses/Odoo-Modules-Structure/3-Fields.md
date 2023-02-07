## Theory about Fields in Odoo

[Xem thêm](https://www.odoo.com/documentation/14.0/developer/reference/addons/orm.html#fields)

The field descriptor chứa định nghĩa trường, đồng thời quản lý các truy cập (accesses) và gán (assignments) trường tương
ứng trên records. Các thuộc tính sau có thể được cung cấp khi khởi tạo một trường:

### 1. Basic Fields (like primitive data types in python)

**(1) Kiểu Boolean:** odoo.fields.Boolean

**(2) Kiểu Char:** odoo.fields.Char(string, size, trim, translate)

- string: label của thuộc tính
- size (kiểu số nguyên int): số lượng ký tự tối đa có thể nhập
- trim (kiểu true/false boolean) : cắt bỏ khoảng cách thừa giữa đầu và cuối kỳ sự | mặc định là true
- translate (kiểu true/false boolean):

**(3) Kiểu Float:** odoo.fields.Float

**(4) Kiểu Integer:** odoo.fields.Integer

### 2. Advanced Fields

**(1) Kiểu Binary:** odoo.fields.Binary(attachment)

- attachment

**(2) Kiểu Html:** odoo.fields.Html(sanitize,sanitize_tags,sanitize_attributes,sanitize_style,strip_style,strip_classes)

- sanitize
- sanitize_tags
- sanitize_attributes
- sanitize_style
- strip_style
- strip_classes

**(3) Kiểu Image:** odoo.fields.Image(max_width, max_height, verify_resolution)

**(4) Kiểu Monetary:** odoo.fields.Monetary

**(5) Kiểu Selection:** odoo.fields.Selection

**(6) Kiểu Text:** odoo.fields.Text

#### 3. Computed Fields (*)

Xem đầy đủ tài liệu [here](https://www.odoo.com/documentation/14.0/developer/reference/addons/orm.html#computed-fields)

```python
from odoo import models, fields, api


class Demo(models.Model):
    _name = "demo"
    _description = "Demo"

    name = fields.Char(string='Name')
    year_of_birth = fields.Integer(string='Year of Birth')
    current_year = fields.Integer(string='Current Year')
    age = fields.Integer(string='Age', compute='_compute_age', store=True)

    @api.depends('year_of_birth', 'current_year')
    def _compute_age(self):
        for r in self:
            r.age = r.current_year - r.year_of_birth
```

Giải thích mã nguồn trên:

- Như đã biết, các thuộc tính name/year_of_birth/current_year/age được khai báo bằng các fields Char/Integer/Float dc
  gọi là các fields cơ bản và dc tạo ra tương ứng vs các cột trong bảng DB nhưng khi ta truyền tham số compute vào các
  fields thì odoo sẽ tự động chuyển các fields cơ bản thành compute field
- Compute field: mặc định sẽ ko dc tự động tạo ra cột tương ứng để lưu trữ value trong bảng DB, muốn tạo ra cột phải
  truyền thêm tham số store=True
- @api.depends('year_of_birth', 'current_year'): Khi dòng này được thêm vào, mỗi khi chúng ta tạo hay sửa bản ghi mà các
  giá trị trong depends này được nhập thì sẽ ngay lập tức trigger hàm _compute_age để tạo ra ngay value cho thuộc tính
  age

### 4. Automatic Fields

## Demo about Fields in Odoo

```python

```
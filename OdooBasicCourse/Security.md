# Security

## Data Files (CSV)

## Access right (Quyền truy cập)

- Khi không có quyền truy cập (access right) nào được xác định trên một mô hình, Odoo sẽ xác định rằng không có người
  dùng nào có thể
  truy cập dữ liệu. Nó thậm chí còn được thông báo trong nhật ký:

```
WARNING rd-demo odoo.modules.loading: The models ['___.property'] have no access rules in module estate, consider adding some, like:
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
```

- Quyền truy cập (Access right) được định nghĩa là các bản ghi của mô hình ir.model.access. Mỗi access right được liên
  kết với một mô
  hình, một nhóm (hoặc không có nhóm nào đối với quyền truy cập toàn cầu) và một tập hợp các quyền: tạo, đọc, ghi và hủy
  liên kết 2 . Các quyền truy cập như vậy thường được xác định trong tệp CSV có tên ir.model.access.csv.

# User setup

To get started, navigate to Settings / Users & Companies / Users

1. Smart Buttons
2. Companies
3. User Type: Users must be allocated to one of the three types:
    - Internal users: có thể có toàn quyền truy cập vào các ứng dụng Odoo
    - Portal users: là khách hàng hoặc nhà cung cấp chỉ có quyền truy cập để xem các tài liệu liên quan – khách hàng có
      thể xem đơn đặt hàng của chính họ
    - Public users: chỉ có thể truy cập trang web
4. Applications
5. Technical Settings (được hiển thị trong Developer Mode):

   Mỗi cài đặt trong technical settings list sẽ kích hoạt một tính năng hoặc chức năng trong Odoo. Ví dụ:
    - “Manage Product Variants - Quản lý biến thể sản phẩm” cho phép người dùng tạo và sửa đổi các biến thể (ví dụ. màu
      sắc và kích cỡ)
    - “Manage Multiple Stock Locations - Quản lý nhiều vị trí chứng khoán” được sử dụng trong Hàng tồn kho và các ứng
      dụng liên quan.
    - “Analytic Accounting - Kế toán phân tích” là một tính năng hữu ích cần được kích hoạt trước và sau đó người dùng
      cần được cấp quyền.
    - “Addresses in Sales Orders - Địa chỉ trong Đơn đặt hàng” cho phép người dùng chọn hóa đơn của khách hàng và địa
      chỉ giao hàng trên đơn đặt hàng.
    - More details [here](https://odootricks.tips/about/building-blocks/security/user-access-groups/#examples)
6. Other access
7. Preferences (https://odootricks.tips/about/building-blocks/security/user-setup/)

# User Access Groups

To review Access Groups enable Developer Mode, navigate to Settings and select Users & Companies > Groups

Có các loại nhóm truy cập người dùng khác nhau:


--------------------------------------------------------------------------------------------------------------------

## Phân quyền trong Odoo

Giả sử ta có module_football cần phân quyền cho player_user và player_manager

Odoo cung cấp 3 cấp độ phân quyền:

**1. Phân quyền theo Model (Access rights)**

- Demo example:

###### module_football/security/ir.model.access.csv file:

```
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_player_user,access_player_user,model_player,module_football.group_player_user,1,0,0,0
access_player_manager,access_player_manager,model_player,module_football.group_player_manager,1,1,1,1
```

###### module_football/security/player_security.xml file:

```xml

<odoo>
    <data>
        <record model="ir.module.category" id="module_category_player">
            <field name="name">Player</field>
        </record>

        <record model="res.groups" id="group_player_user">
            <field name="name">User</field>
            <field name="category_id" ref="module_category_player"/>
            <field name="implied_ids" eval="[(4, ref('base.group_user')]"/>
        </record>

        <record model="res.groups" id="group_player_manager">
            <field name="name">Manager</field>
            <field name="category_id" ref="module_category_player"/>
            <field name="implied_ids" eval="[(4, ref('group_player_user')]"/>
        </record>
    </data>

    <data>...</data>
</odoo>

        <!--Ý nghĩa trường implied_ids: Users của group này tự động kế thừa các group đó-->
```

- Explain:

  <br>2 records với id là: group_player_user và group_player_manager trong tệp player_security.xml chính là 2 groups đc
  khai
  báo trong cột group_id:id của tệp ir.model.access.csv< /br>

  <br>Khi khai báo 2 tệp trên trong [data] của manifest thì cần khai báo tệp player_security.xml trc để odoo tạo ra 2
  groups user&manager cho tệp csv sử dụng </br>

  <br>Odoo đã tạo sẵn nhiều phân quyền theo group, những group dc tạo sẵn này nằm trong base, nếu bài toán ko quá phức
  tạp
  thì ko cần tạo group mới mà cứ dùng trực tiếp trong base theo quy tắc: base.group_... --> Như vậy ta ko cần phải khởi
  tạo thêm record group mới vào trong model res.groups của odoo nữa mà cứ dùng trực tiếp luôn các group có sẵn của odoo
  ở trong base vào tệp csv </br>

    + (1) id
    + (2) name
    + (3) model_id:id
    + (4) group_id:id
    + (5) perm_read
    + (6) perm_write
    + (7) perm_create
    + (8) perm_unlink

**2. Phân quyền theo quy luật tự đặt ra (Record rules)**

Sau khi user thoả mãn cấp phân quyền trong tệp csv, ta có thể phân quyền tiếp quy tắc của riêng mình bằng cách tạo ra
record và lưu nó ở trong model ir.rule, vd như đoạn mã demo bên dưới:

- Demo example:

###### module_football/security/player_security.xml file:

```xml

<odoo>
    <data>...</data>

    <data>
        <record model="ir.rule" id="player_comp_rule">
            <filed name="name">Player</filed>
            <filed name="model_id" ref="model_player"/>
            <filed name="domain_force">[('height','!=',2)]</filed>
            <filed name="perm_read" eval="False"/>
            <filed name="perm_write" eval="False"/>
            <filed name="perm_create" eval="False"/>
            <filed name="perm_unlink " eval="True"/>
        </record>
    </data>
</odoo>

        <!--domain_force hoạt động như một bộ lọc cho các bản ghi áp dụng quy tắc-->
```

- Explain:
  field domain_force là quy tắc tự ta tạo ra
  khi phân quyền theo cấp độ đầu tiên trong tệp csv user chỉ có quyền đọc, còn manager có đầy đủ 4 quyền sửa/xoá/đọc/tạo
  Đến cấp độ thứ hai ta phân quyền theo record rule (sẽ dc lưu trong model ir.rule) tại field domain_force, vậy khi đến
  đây nếu là manager gặp phải bản ghi của một player nào có chiều cao bằng 2 thì sẽ chỉ còn quyền đọc thôi

**3. Phân quyền theo fields được khai báo trong model**

- Demo example:

###### module_football/models/player.py

```python
from odoo import models, fields


class Player(models.Model):
    _name = "player"
    _description = "Player"

    name = fields.Char(string='Name', required=True)
    image = fields.Binary(string='Image', attachment=True)
    position = fields.Char(string='Position', groups="module_football.group_player_manager")
    height = fields.Float(string='Height')
    weight = fields.Float(string='Weight')
```

- Explain:
  Đây là cách phân quyền trực tiếp vào field, quan sát vào thuộc tính position, khi phân quyền như trên thì chỉ những
  manager mới có quyền đọc/ghi/sửa/xoá vs position


























# Constraints (Các ràng buộc)

#### Đặt vấn đề

Làm cách nào để user để ngăn user nhập data ko chính xác vào các input

VD: Nhập giá cả cho một mặt hàng thì cần nhập các value không âm. Vậy khi user cố tình nhập một value âm thì cần đưa ra
thông báo yêu cầu nhập lại

SQL constraints được xác định thông qua thuộc tính model _`sql_constraints`.

Thuộc tính này được gán một danh sách các bộ ba string như cú pháp bên dưới:

`_sql_constraints = [
(name, sql_definition, message),
...
]`

Xem thêm về việc ràng buộc trong SQL [tại đây](https://www.postgresql.org/docs/12/ddl-constraints.html)

Câu lệnh trên khi đc sử dụng trong Odoo thì sẽ dc ánh xạ sang SQL như sau:

`CREATE TABLE model_name (
name string,
name text,
price numeric CHECK (price > 0)
);`

VD:

```python
   _sql_constraints = [
    ('uniq_name', 'unique(name)', _('The category name must be unique.')),
]
```

### Python constraints

SQL constraints là một cách hiệu quả để đảm bảo tính nhất quán của data. Tuy nhiên, trong một số trường hợp cần kiểm tra
phức tạp chúng ta sử dụng Python constraints

Một python constraint dc định nghĩa là một phương thức dc thể hiện bằng constrains() và đc gọi trên một record. Các tham
số trong constrains() chỉ định trường nào có liên quan đến constraint. Constraint dc đánh giá tự động khi bất kỳ trường
nào trong số này được sửa đổi.

VD:

```python
from odoo.exceptions import ValidationError

...


@api.constrains('date_end')
def _check_date_end(self):
    for record in self:
        if record.date_end < fields.Date.today():
            raise ValidationError("The end date cannot be set in the past")
    # all records passed the test, don't return anything
```

Giải thích: đoạn mã trên kiểm tra cho ta trường date_end - là một trường để user chọn ngày kết thúc | sau khi method dc
gọi nó sẽ check tất cả các record xem có record nào hiện đang có ngày kết thúc xảy ra trước ngày hôm nay không? Nếu có
nó sẽ hiện một thông báo

#### Lưu ý:

- Các ràng buộc SQL thường hiệu quả hơn các ràng buộc Python.
  Khi vấn đề về hiệu suất, hãy luôn ưu tiên SQL hơn các ràng buộc của Python.
- 
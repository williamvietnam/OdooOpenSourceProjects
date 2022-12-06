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


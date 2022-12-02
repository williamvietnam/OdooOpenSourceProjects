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

- Quyền truy cập (Access right) được định nghĩa là các bản ghi của mô hình ir.model.access. Mỗi access right được liên kết với một mô
  hình, một nhóm (hoặc không có nhóm nào đối với quyền truy cập toàn cầu) và một tập hợp các quyền: tạo, đọc, ghi và hủy
  liên kết 2 . Các quyền truy cập như vậy thường được xác định trong tệp CSV có tên ir.model.access.csv.
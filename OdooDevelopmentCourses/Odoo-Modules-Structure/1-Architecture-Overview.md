## Multitier application (Ứng dụng đa tầng)

- Odoo follows theo kiến trúc đa tầng (multitier architecture)
- Multitier architecture bao gồm 3 tầng: Presentation tier, Logic tier, Data tier
    + The presentation tier là sự kết hợp giữa HTML5, JS, CSS
    + The logic tier được viết bằng python
    + Data tier only supports PostgreSQL dưới dạng RDBMS (cơ sở dữ liệu dạng bảng)
- Yêu cầu kiến thức để tham gia hướng dẫn cơ bản này: basic knowledge of HTML and an intermediate level of Python

## Odoo modules

### 1. Composition of a module (Các thành phần của một module)

- Business objects:
    + A business object (ví dụ: hóa đơn - invoice) được khai báo là một class Python.
    + Các fields được xác định trong các class này được tự động ánh xạ tới các cột cơ sở dữ liệu nhờ class ORM.
- Object views: Define UI display (Định nghĩa ra giao diện người dùng)
- Data files: XML or CSV files declaring the model data (Các tệp XML hoặc CSV khai báo dữ liệu mô hình)
    + views or reports,
    + configuration data (modules parametrization, security rules),
    + demonstration data - dữ liệu hiển thị
    + etc...
- Web controllers: Handle requests from web browsers (Xử lý yêu cầu từ trình duyệt web)
- Static web data: Images, CSS or JavaScript files used by the web interface or website

### 2. Module structure

- An Odoo module is declared by its manifest (Một mô-đun Odoo được khai báo bằng bảng kê khai của nó)
- When an Odoo module includes business objects (i.e. Python files), they are organized as a Python package with a __
  init__.py file.
  (Khi một mô-đun Odoo bao gồm các đối tượng nghiệp vụ (ví dụ: tệp Python), chúng được tổ chức dưới dạng gói Python với
  tệp __init__.py)
- This file contains import instructions for various Python files in the module (Tệp này chứa hướng dẫn nhập cho các tệp
  Python khác nhau trong mô-đun)

Đây là một thư mục mô-đun đơn giản hóa:

```
module
├── models
│   ├── *.py
│   └── __init__.py
├── data
│   └── *.xml
├── __init__.py
└── __manifest__.py
```
Quản lý Assets trong Odoo không đơn giản như trong một số ứng dụng khác.
Bởi vì nhu cầu của ứng dụng web, ứng dụng bán hàng, trang web, ứng dụng di động là khác nhau

Có 3 loại assets khác nhau: code (js files), style (css files), templates (xml files)

- Code
  Odoo hỗ trợ ba loại tệp javascript khác nhau.

- Style

- Template
  Các templates (tệp tĩnh xml) được xử lý theo một cách khác: chúng chỉ được đọc từ hệ thống tệp bất cứ khi nào cần và
  được nối.
  Bất cứ khi nào trình duyệt tải odoo, nó sẽ gọi `/web/webclient/qweb/` controller để tìm nạp các templates (QWeb
  Templates).

Danh sách một số gói quan trọng mà hầu hết các nhà phát triển odoo sẽ cần biết:

- `web.assets_common`: gói này chứa hầu hết các nội dung phổ biến cho ứng dụng khách web, trang web và cả điểm bán hàng.
  Điều này được cho là chứa các khối xây dựng cấp thấp hơn cho khung odoo. Lưu ý rằng nó chứa boot.js tệp xác định hệ
  thống mô-đun odoo.

- `web.assets_backend`: gói này chứa mã dành riêng cho ứng dụng khách web (đặc biệt là ứng dụng web/trình quản lý hành
  động/lượt xem)

- `web.assets_frontend`: gói này là về tất cả những gì dành riêng cho trang web công khai: thương mại điện tử, cổng
  thông tin, diễn đàn, blog, …

- `web.assets_qweb`: tất cả các mẫu XML tĩnh được sử dụng trong môi trường phụ trợ và tại điểm bán hàng.

- `web.qunit_suite_tests`: tất cả mã kiểm tra qunit javascript (kiểm tra, trợ giúp, mô phỏng)

- `web.qunit_mobile_suite_tests`: mã thử nghiệm qunit dành riêng cho thiết bị di động

Operations

- append: Thao tác này thêm một hoặc nhiều tệp.
- prepend: Thêm một hoặc nhiều tệp vào đầu gói (bundle).
- before: Thêm một hoặc nhiều tệp trước một tệp cụ thể.
- after: Thêm một hoặc nhiều tệp sau một tệp cụ thể.
- include: Sử dụng các gói (bundles) lồng nhau.
- remove: Xóa một hoặc nhiều tệp.
- replace: Thay thế tệp nội dung bằng một hoặc nhiều tệp.

Demo

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-extend="Menu">
        <t t-jquery=".o_menu_toggle" t-operation="inner">
            <a class="o_menu_demo menu-demo" style="cursor: pointer"
               autofocus="autofocus" aria-label="Demo"
               accesskey="h">
               Demo
            </a>
        </t>
    </t>
</templates>
```

Giải thích đoạn code trên:
là một template xml, kế thừa gói web.assets_backend 

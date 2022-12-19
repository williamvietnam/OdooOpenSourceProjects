Odoo hỗ trợ ba loại tệp javascript khác nhau:

- plain javascript files (no module system)

- native javascript module.

- Odoo modules (using a custom module system),

### Plain Javascript files

- Có thể chứa nội dung tùy ý. Nên sử dụng kiểu thực thi hàm được gọi ngay lập tức khi viết một tệp như vậy

```javascript
(function () {
    // some code here
    let a = 1;
    console.log(a);
})();
```

- Ưu điểm của các tệp như vậy là tránh làm rò rỉ các biến cục bộ ra global scope.
- Plain Javascript files không mang lại lợi ích của hệ thống mô-đun, vì vậy người ta cần cẩn thận về thứ tự trong gói (
  vì trình duyệt sẽ thực thi chúng chính xác theo thứ tự đó).

### Native Javascript Modules

Hầu hết mã javascript Odoo mới nên sử dụng hệ thống mô-đun javascript gốc. Điều này đơn giản hơn và mang lại những lợi
ích của trải nghiệm nhà phát triển tốt hơn với sự tích hợp tốt hơn với IDE.

### Odoo Module System
Odoo đã xác định một hệ thống mô-đun nhỏ (nằm trong tệp addons/web/static/src/js/boot.js, cần được tải trước).
Hệ thống mô-đun Odoo hoạt động bằng cách xác định chức năng define trên global odoo object.
Sau đó, xác định từng module js bằng cách gọi hàm đó.

```javascript
// in file a.js
odoo.define('module.A', function (require) {
    "use strict";

    var A = ...;

    return A;
});

// in file b.js
odoo.define('module.B', function (require) {
    "use strict";

    var A = require('module.A');

    var B = ...; // một cái gì đó liên quan đến A

    return B;
});
```

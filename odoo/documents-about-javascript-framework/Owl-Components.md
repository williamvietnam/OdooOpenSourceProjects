Owl Components

Javascript framework của Odoo sử dụng khung thành phần tùy chỉnh có tên là Owl(Cú). Nó là một hệ thống thành phần khai
báo, lấy cảm hứng từ Vue và React.
Các thành phần được xác định bằng cách sử dụng các QWeb templates, được làm phong phú thêm với một số chỉ thị cụ thể của
Owl.

Using Owl components

Cách tạo một simple component trong Odoo.
```javascript
const { useState } = owl.hooks;
const { xml } = owl.tags;

class MyComponent extends Component {
    setup() {
        this.state = useState({ value: 1 });
    }

    increment() {
        this.state.value++;
    }
}
MyComponent.template = xml
    `<div t-on-click="increment">
        <t t-esc="state.value">
    </div>`;
```


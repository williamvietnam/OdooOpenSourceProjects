1. name

- đây là trường bắt buộc, chính là tên module hiển thị trên list app odoo

2. category

- để phân loại module chúng ta theo category và được hiển thị bên trái màn hình odoo apps
- khi click vào module info thì category của module chúng ta cũng dc hiển thị tại đây

3. summary

- khi click vào module info thì summary của module chúng ta cũng dc hiển thị tại đây

4. website

- là url để user click vào button learn more sẽ linking tới webpage của module này

5. depends

- vd: 'depends': ['sales_team', 'payment', 'portal', 'utm'],
- các sales_team, payment, portal, utm là các modules mà module của chúng ta sẽ phụ thuộc vào
- khi khai báo depends giúp cho odoo luôn cài đặt các module này trước khi cài đặt module của ta
- đồng thời, nếu một trong các module depends bị gỡ bỏ thì module của ta và bất kỳ module nào liên quan cũng đều bị gỡ
- 
## Giới thiệu về Odoo OWL Framework

Một ứng dụng (đặc biệt là webapp) được gọi là thân thiện vs người dùng khi và chỉ khi người dùng dễ dàng xử lý nó.
JavaScript đảm nhận vai trò chính để làm việc đó. Odoo có giao diện người dùng có cấu trúc tốt và hấp dẫn. Đó là lý do
tại sao Odoo được biết đến như một trong những ERP đơn giản nhất trên thế giới.

Ngay bây giờ (V13.0 trở xuống) Odoo sử dụng Backbone JS để xử lý giao diện người dùng của nó. Xương sống là một thư viện
JavaScript hiện đại dựa trên mô hình thiết kế dạng xem mô hình. Vì vậy, không chắc chắn về giao diện người dùng có cấu
trúc cho một dự án lớn (Bằng cách cung cấp các khối xây dựng như tiện ích con). Mặc dù vậy, Backbone đã ngừng hỗ trợ
người dùng vì nó đã ngừng di chuyển và nâng cấp. Vì vậy, Odoo đã quyết định thay đổi giao diện người dùng từ Backbone JS
sang khung OWL.

### OWL Framework là gì?

Theo định nghĩa của Odoo “Thư viện web Odoo (OWL) là một khung giao diện người dùng nhỏ (~<20kb gzipped) nhằm mục đích
làm cơ sở cho Ứng dụng web Odoo. OWL là một framework hiện đại, được viết bằng Typescript, lấy ý tưởng tốt nhất từ
React và Vue theo một cách đơn giản và nhất quán.”

OWL sử dụng công cụ mẫu mạnh mẽ của Odoo ”Qweb” để xử lý các trang và đoạn HTML giao diện người dùng.


## eval attribute

Thuộc tính eval đánh giá nội dung của nó như thể đó là mã Python. Điều này cho phép bạn xác định các giá trị không phải
là chuỗi.

Thông thường, nội dung bên trong thẻ <field> luôn ở dạng string.

VD:

`<field name="value">2.3</field>` `// 2.3 là kiểu string '2.3' chứ ko phải kiểu float 2.3`

`<field name="value">False</field>` `// False là kiểu string 'False' chứ ko phải kiểu boolean False`

Nếu muốn đánh giá giá trị thành float, boolean hoặc loại khác, ngoại trừ chuỗi, cần sử dụng thuộc tính eval:

`<field name="value" eval="2.3" />`

`<field name="value" eval="False" />`

## ref attribute

Thuộc tính ref cho phép điền vào các quan hệ giữa các bản ghi:

`<field name="company_id" ref="main_company"/>`

Field `company_id` là mối quan hệ many-to-one từ đối tượng user với đối tượng company và main_company là id của liên kết

Trong xml sử dụng thuộc tính eval và ref để gán giá trị cho trường và tạo bản ghi chính mới:
```xml
 <record id="product_uom_categ_vol" model="product.uom.categ">
            <field name="name">Volume</field>
 </record>

 <record id="product_uom_gal" model="product.uom">
            <field name="name">gal(s)</field>
            <field name="category_id" ref="product_uom_categ_vol"/>
            <field name="factor_inv" eval="3.78541"/>
            <field name="uom_type">bigger</field>
 </record>
```
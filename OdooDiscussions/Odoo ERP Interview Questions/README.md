## Most frequently asked Odoo ERP Interview Questions

1. What is Odoo ERP?
2. What are the features of Odoo?
3. What is an Open Source ERP?
4. Explain the architecture of Odoo?
5. What is Odoo Developer Mode?
6. What are the possibility of Developer Mode?
7. What are Odoo ERP Implementation methodology?
8. How can we import .py file from another directory?
9. What are the elemets of Odoo ERP Systems?
10. Which are the available domain operators in Odoo?
11. What are the elements of total cost ownership in Odoo?
12. How can we make field readonly based on group and status?
13. What are the Third Party in Odoo Integration?
14. How do you run OpenERP yaml unit tests?

##### What is Odoo ERP?

Odoo is used as a suite of business management software tools containing CRM, e-commerce, billing, accounting,
manufacturing, warehouse, project management, inventory management.Its version has proprietary features and services,
that provides a source code for the core of all ERP Modules are curated by Odoo.

##### What are the features of Odoo?

Features of Odoo are as follows:

* CRM - Odoo provides the ability for managing leads, opportunities, tasks, issues, etc.It also helps in automating
  communication, identification, prioritization, assignment, case resolution, and notification.
* Warehouse Management - Odoo helps in supporting management of multiple structured stock locations and warehouses.
* Project Management - Odoo has the ability in allowing us in managing our projects and taks with out limitations.
* Point of Sale - With odoo we can manage all point of sales operation containing sales, inventory, cash registry for
  global consolidated view.
* Sales Management - Odoo is used in allowing us in managing and classifying our orders and also gives us the ability
  for creating new orders and reviewing existing orders.
* Manufacturing - It helps in managing our operations with multi level BoM.
* Purchase Management - Odoo is used for tracking developers quotations and used for converting them in purchasing
  orders.

##### What is an Open Source ERP?

Enterprise Resource Planning is a software system which source code is publicly available and we can use it and
customize an open source ERP according to our need and requirements.It is used for modifying the source code of an ERP
system and the user will need deployment skills, in an open source technologies.

##### What is Odoo Developer Mode?

Developer mode in Odoo has access in all technical features of odoo and is meant for users with technical knowledge in
accessing the technical information about the various fields.It also allows the users in setting and modifying defaults
in Odoo, it also gives us more insights into the architecture of the various modules.It is used in customizing the
interface and activate the users having more information anout rhe database they are working on.

##### What are the possibility of Developer Mode?

Developer Mode offers the possibility of:
Developer mode
Developer mode with assets
Developer mode with test assets

##### What are Odoo ERP Implementation methodology?

We can use the following steps for implementing Odoo ERP:

* Installing basic Odoo
* Setting the load balancing we need
* Setting the database
* Installing Odoo applications
* Installing customized apps
* Configuring basic master like company info, user details
* Configuring user wise access levels
* It is ready for use

##### How can we import .py file from another directory?

If we need to import a .py file we need to use the following command:
`model -> py_file.py
report -> other_py_file.py`

##### Which are the available domain operators in Odoo?

Odoo uses operator in openerp domain, all the available domains have its explanation.Here are some of the Domain
Operators used by Odoo:

* Opensource
* opensource
* Open
* open
* Odoo
* odoo
* Odooopenerp
* OdooOpenerp

How can we make field readonly based on group and status?
We can inherit the view by specifying the groups and used for making the customer reference field readonly for group
users.

```xml
<record id="view_order_form_cust_ref_readonly" model="ir.ui.view">
    <field name="name">sale.order.form.readonly.cust</field>
    <field name="model">sale.order</field>
    <field name="inherit_id" ref="sale.view_order_form"/>
    <field name="groups_id" eval="[(6, 0, [ref('base.group_user') ])]"/>
    <field name="arch" type="xml">
        <field name='client_order_ref'" position="attributes">
            <attribute name="attrs">{'readonly':[('state','not in',['draft','sent'])]}</attribute>
        </field>
    </field>
</record>
```
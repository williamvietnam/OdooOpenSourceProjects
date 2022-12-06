# Framework Overview

## Introduction
- The Odoo Javascript Framework là một tập hợp các features/building blocks đc cung cấp bởi web/ addon để giúp xây dựng
các ứng dụng odoo chạy trên trình duyệt. Đồng thời, khung Javascript của Odoo là một SPA, thường được gọi
là ứng dụng khách web (có sẵn tại url /web).

- The web client sử dụng các lớp native javascript và Owl as a component system

## Code structure
Thư mục web/static/src chứa tất cả web/ javascript codebase (và css và templates). 
   - `core/` most of the low level features

   - `fields/` all field components

   - `views/` all javascript views components (form, list, …)

   - `search/` control panel, search bar, search panel, …

   - `webclient/` the web client specific code: navbar, user menu, action service, …

VD sử dụng:
 The web/static/src is the root folder. Everything inside can simply be **IMPORTED** by using the `@web` prefix.

 Ví dụ: đây là cách một người có thể import `memoize` hàm nằm trong web/static/src/core/utils/functions:
  `import { memoize } from "@web/core/utils/functions";`

## WebClient Architecture
 The web client is an owl application.
 
## [Environment](https://www.odoo.com/documentation/15.0/developer/reference/frontend/framework_overview.html#environment)

## Building Blocks
### Most of the web client is built with a few types of abstractions: registries, services, components and hooks.
### Registries
### Services
### Components and Hooks
from odoo import http
from odoo.http import request, content_disposition
from odoo.addons.portal.controllers.portal import CustomerPortal
from odoo.addons.website.models.ir_http import sitemap_qs2dom
from odoo.addons.http_routing.models.ir_http import slug
from werkzeug.exceptions import Forbidden, NotFound
from odoo.addons.website.controllers.main import QueryURL


class CustomerPortal(CustomerPortal):

    def _prepare_portal_layout_values(self):
        values = super(CustomerPortal, self)._prepare_portal_layout_values()

        # Documents count
        Document = request.env['document.document'].sudo()
        document_count = Document.search_count([('portal_ids', 'in', request.env.user.ids)])
        values.update({
            'document_count': document_count,
        })
        return values

    @http.route([
        '/my/document',
        '/my/document/page/<int:page>'], type='http', auth="user", website=True)
    def portal_my_documents(self, page=0, date_begin=None, date_end=None, sortby=None, **kw):
        values = self._prepare_portal_layout_values()
        document_obj = request.env['document.document'].sudo()
        category_obj = request.env['document.folder'].sudo()
        document = document_obj.search([('portal_ids', 'in', request.env.user.ids)])
        category = category_obj.search([])
        values.update({
            'date': date_begin,
            'document': document,
            'category': category,
            'default_url': '/my/document',
            'base_url': http.request.env["ir.config_parameter"].sudo().get_param("web.base.url"),
        })
        return request.render("nbgsoftware_document.website_portal_my_document", values)

    def sitemap_document(env, rule, qs):
        if not qs or qs.lower() in '/document':
            yield {'loc': '/document'}

        Category = env['document.folder']
        dom = sitemap_qs2dom(qs, '/document/category', Category._rec_name)
        dom += env['website'].get_current_website().website_domain()
        for cat in Category.search(dom):
            loc = '/document/category/%s' % slug(cat)
            if not qs or qs.lower() in loc:
                yield {'loc': loc}

    @http.route([
        '''/document''',
        '''/document/page/<int:page>''',
        '''/document/category/<model("document.folder"):category>''',
        '''/document/category/<model("document.folder"):category>/page/<int:page>'''
    ], type='http', auth="public", website=True, sitemap=sitemap_document)
    def document(self, page=0, category=None, search='', ppg=False, **post):
        Category = request.env['document.folder']
        Document = request.env['document.document']
        if category:
            category = Category.search([('id', '=', int(category))], limit=1)
            if not category:
                raise NotFound()
        else:
            category = Category

        attrib_list = request.httprequest.args.getlist('attrib')
        keep = QueryURL('/document', category=category and int(category), search=search, attrib=attrib_list,
                        order=post.get('order'))
        url = "/document"
        if search:
            post["search"] = search
        if attrib_list:
            post['attrib'] = attrib_list
        all_child_categs = Category.search([('id', 'child_of', category.id)])
        search_document = None
        if category.check_has_document():
            search_document = Document.search(
                [('folder_id', 'in', all_child_categs.ids), ('portal_ids', 'in', request.env.user.ids)])

        # get all parent category
        categs_domain = [('parent_folder_id', '=', False)]
        categs = Category.search(categs_domain)
        valid_categs = []
        for cat in categs:
            if cat.check_has_document():
                valid_categs.append(cat)
        if category:
            url = "/document/category/%s" % slug(category)
        if not search_document:
            documents = Document.search([('portal_ids', 'in', request.env.user.ids)])
        else:
            documents = search_document
        values = {
            'category': category,
            'documents': documents,
            'base_url': http.request.env["ir.config_parameter"].sudo().get_param("web.base.url"),
            'categories': valid_categs,
            'keep': keep,
        }
        return request.render("nbgsoftware_document.website_portal_my_document", values)

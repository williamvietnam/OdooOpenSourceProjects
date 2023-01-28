odoo.define('nbgsoftware_document.HomeView', function (require) {
'use strict';
var core = require('web.core');
var ajax = require('web.ajax');
var qweb = core.qweb;
var Widget = require('web.Widget');
var MenuHome = require('web_enterprise.Menu')
var rpc = require('web.rpc');
ajax.loadXML('/web_enterprise/static/src/xml/base.xml', qweb);

MenuHome.include({
    events: _.extend({}, MenuHome.prototype.events, {
        'click .o_menu_home_app': '_onMenuHomeApp',
    }),

    _onMenuHomeApp: function () {
        var self = this;
        return rpc.query({
            model: 'ui.app',
            method: 'get_home_action',
            args: [],
        }).then(function (url) {
            return self.do_action({
                type: 'ir.actions.act_url',
                url: url,
                target: 'self'
            });
        });
    },
    });

});

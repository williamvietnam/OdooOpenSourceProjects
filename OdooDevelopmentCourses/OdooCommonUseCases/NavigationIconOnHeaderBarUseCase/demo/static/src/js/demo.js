odoo.define('demo.Demo', function (require) {
    'use strict';
    var core = require('web.core');
    var ajax = require('web.ajax');
    var qweb = core.qweb;
    var Widget = require('web.Widget');
    var NotificationBadge = require('web_enterprise.Menu')
    var rpc = require('web.rpc');
    ajax.loadXML('/web_enterprise/static/src/xml/base.xml', qweb);

    Demo.include({
        events: _.extend({}, NotificationBadge.prototype.events, {
            'click .o_demo': '_onDemoClicked',
        }),

        _onDemoClicked: function () {
            var self = this;
            return rpc.query({
                model: 'demo',
                method: 'get_button_action',
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
odoo.define('nbgsoftware_notification.NotificationButton', function (require) {
    'use strict';
    var core = require('web.core');
    var ajax = require('web.ajax');
    var qweb = core.qweb;
    var Widget = require('web.Widget');
    var NotificationBadge = require('web_enterprise.Menu')
    var rpc = require('web.rpc');
    ajax.loadXML('/web_enterprise/static/src/xml/base.xml', qweb);

    NotificationBadge.include({
        events: _.extend({}, NotificationBadge.prototype.events, {
            'click .o_notification_badge': '_onNotificationBadgeClicked',
        }),

        _onNotificationBadgeClicked: function () {
            var self = this;
            return rpc.query({
                model: 'notification.notification.public',
                method: 'get_notification_button_action',
                args: [],
            }).then(function (url) {
                return self.do_action({
                    type: 'ir.actions.act_url',
                    url: url,
                    target: 'self'
                });
            });
        },

        willStart: function () {
            var self = this;
            return self._rpc({
                model: 'notification.notification.public',
                method: 'is_show_notification_badge',
                args: [],
            }).then(function (isShow) {
                self._is_show_notification_badge = isShow;
            })
        },

        start: function () {
            this._getNotificationCountUnread();
            return this._super();
        },

        _getNotificationCountUnread: function () {
            var self = this;
            return self._rpc({
                model: 'is.read.notification',
                method: 'get_notification_count_unread',
                args: [],
            }).then(function (data) {
                self.$('.o_NotificationBadge_counter').text(data.toString());
            });
        },
    });
});
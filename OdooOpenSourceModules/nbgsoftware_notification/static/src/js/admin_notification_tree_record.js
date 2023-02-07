odoo.define('nbgsoftware_notification.admin_notification_tree_record', function(require){
'use strict';

var viewRegistry = require('web.view_registry');
var ListView = require('web.ListView');
var ListRenderer = require('web.ListRenderer');

var AdminNotificationTreeRecord = ListRenderer.extend({
    _renderBodyCell: function(record, node, colIndex, options){
         var $td = this._super.apply(this, arguments);
         if($td.hasClass("notification-title")){
             let title = $td.text();
             if(title.length > 20){
                title = title.slice(0,20) + "...";
             }
             $td.html(title);
         }else if($td.hasClass("notification-content")){
             let content = $td.text();
             if(content.length > 0){
                if(content.length > 10){
                   content = content.slice(0,10) + "...";
                }
                $td.html(content);
             }
         }
         return $td;
    },
});

var AdminNotificationTreeView = ListView.extend({
    config: _.extend({}, ListView.prototype.config, {
        Renderer: AdminNotificationTreeRecord,
    }),
});
viewRegistry.add('admin_notification_tree_record', AdminNotificationTreeView);

return AdminNotificationTreeView;
});


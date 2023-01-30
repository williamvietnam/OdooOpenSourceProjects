odoo.define('nbgsoftware_notification.notification_tree_record', function (require) {
'use strict';

var viewRegistry = require('web.view_registry');
var ListView = require('web.ListView');
var ListRenderer = require('web.ListRenderer');
var rpc = require('web.rpc');
var session = require('web.session');

var hash = {};
var isCheckbox = 1;

var NotificationTreeRenderer = ListRenderer.extend({

   _renderRow: function (record) {
       hash[record.id]=record.data;
       var $row = this._super.apply(this, arguments);
       rpc.query({
          model:'notification.notification.public',
          method:'is_read_notification',
          args:[record.data.id, session.uid]
       }).then(function(is_read_notification){
          if(!is_read_notification){
             const styleRow = document.createElement('style');
             styleRow.innerHTML = `#background-row{background: rgba(35,35,35,0.25); color:black}`;
             document.head.appendChild(styleRow);
             $row.attr('id',"background-row");
          }
       });
       return $row;
    },

    _onRowClicked: function(ev){
       var self = this;
       var id = $(ev.currentTarget).data('id');
       let data = hash[id];
       this.notificationDialogPopup(data);
       if(isCheckbox===0){
         rpc.query({
         model:'notification.notification.public',
         method:'update_is_read_notification',
         args:[data.id, session.uid]
         })
       }
    },

    _onCellClick: function (ev) {
        this._super.apply(this, arguments);
        isCheckbox = 0;
    },

    notificationDialogPopup: function(data){
       if(data){
          const container = document.createElement('div');
          container.id = "notification-root";

          let notificationDate =  this.notificationFormatDateTime(data.create_notification_date_time);

          container.innerHTML = `<div class="notification-container" style="position:absolute; background-color:rgba(0,0,0,0.3); height:100vh; width:100vw; display:flex; justify-content: center; align-items: center; top:0;">
             <div class="wrapper" style="background-color:#fff; border-radius:8px; padding:20px 40px; width:888px; max-width:100%">
               <div class="heading-wrapper" style="display:flex; justify-content: space-between; align-items: center;">
                  <h1 class="title" style="margin:auto;">${data.name}</h1>
                  <button class="close-button" onclick="window.location.reload();" style="background-color:#A3B9E2; border:0; border-radius: 5px; box-shadow: 0 2px 4px rgb(0 0 0 / 20%); color:white; padding: 6px 20px; font-size: 14px;">閉じる</button>
               </div>
               <div class="content" style="font-size:16px; margin-top:16px; word-wrap: break-word; overflow-wrap: break-word; overflow-y: scroll; max-height: 512px;">${data.content}</div>
               <div class="footer-wrapper" style="display:flex; justify-content: space-between; align-items: center; margin-top: 40px;">
                  <h6 class="notification-date" style="font-size:14px;">${notificationDate}</h6>
                  <h6 class="notification_author" style="font-size:14px; color: darkgreen;">${data.create_uid.data.display_name}</h6>
               </div>
             </div>
           </div>`;

           if(isCheckbox === 0){
              document.body.appendChild(container);
           }
       }
    },

    notificationFormatDateTime: function(notificationDate){
        let d = new Date(notificationDate);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();

        if(month.length < 2)
           month = '0' + month;
        if(day.length < 2)
           day = '0' + day;

        return [year, month, day].join('/');
    },

});

var NotificationTreeView = ListView.extend({
    config: _.extend({}, ListView.prototype.config, {
        Renderer: NotificationTreeRenderer,
    }),
});
viewRegistry.add('notification_tree_record', NotificationTreeView);

return NotificationTreeView;

});

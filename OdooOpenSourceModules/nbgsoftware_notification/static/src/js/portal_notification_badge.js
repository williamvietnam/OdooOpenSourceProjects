odoo.define('nbgsoftware_notification.PortalNotificationButton', function (require) {
"use strict";

var rpc = require("web.rpc");

(async () => {
    const categories = await rpc.query({
      model: "is.read.notification",
      method: "get_notification_count_unread",
      args:[],
     }).then(function(data){
       if(data != 0){
             let notificationIconHaveBadge = $(`<li class="nav-item" style="list-style-type:none">
                  <a class="o_notification_badge" style="cursor: pointer" aria-label="Notification Badge" accesskey="h" href="/notifications">
                      <i role="img" aria-label="Notifications" class="fa fa-bell" style="font-size: 22px"/>
                      <span class="o_NotificationBadge_counter badge badge-pill"
                           style="background-color: red; font-size: 9px; position: relative; color: white; transform: translate(-16px, -12px);">${data}<span>
                  </a>
               </li>`);
            $('#top_menu').before(notificationIconHaveBadge);
       }else{
             let notificationIconNotHaveBadge = $(`<li class="nav-item" style="list-style-type:none">
                  <a class="o_notification_badge" style="cursor: pointer" aria-label="Notification Badge" accesskey="h" href="/notifications">
                      <i role="img" aria-label="Notifications" class="fa fa-bell" style="font-size: 22px"/>
                  </a>
               </li>`);
            $('#top_menu').before(notificationIconNotHaveBadge);
       }
     });
})();
});
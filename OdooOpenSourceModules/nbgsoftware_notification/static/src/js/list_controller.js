odoo.define('nbgsoftware_notification.ListController', function (require) {
    "use strict";
    var core = require('web.core');
    const ListController = require('web.ListController');
    var _t = core._t;
    var rpc = require('web.rpc');
    var session = require('web.session');

    ListController.include({

        _getActionMenuItems: function(state) {
            let actionMenuItems = this._super(...arguments);
            console.log(actionMenuItems)
            //hide Export in action
            if (state.model === 'notification.notification' || state.model === 'notification.tag') {
                const otherList = actionMenuItems?.items.other
                if (otherList) {
                    const index = otherList.findIndex(item => ["Export", "エクスポート"].includes(item.description))
                    if (index !== -1) otherList.splice(index, 1)
                }
            }else if(state.model === 'notification.notification.public'){
                const otherList = actionMenuItems?.items.other
                if (otherList) {
                    const index = otherList.findIndex(item => ["Export", "エクスポート"].includes(item.description))
                    if (index !== -1) otherList.splice(index, 1)
                }

                actionMenuItems?.items.other.push({
                   description: _t("Read"),
                   callback: () => this._onReadNotifications()
                });

                actionMenuItems?.items.other.push({
                   description: _t("Unread"),
                   callback: () => this._onUnreadNotifications()
                });
            }

            return actionMenuItems
        },

        _onReadNotifications(){
           rpc.query({
              model:'notification.notification.public',
              method:'update_list_read_notification',
              args:[this.getSelectedIds()]
           }).then(function(){
              location.reload();
           });
       },

        _onUnreadNotifications(){
           rpc.query({
              model:'notification.notification.public',
              method:'delete_list_unread_notification',
              args:[this.getSelectedIds()]
           }).then(function(){
              location.reload();
           })
        },

        _updateSelectionBox() {
             this._super(...arguments);
             this._renderHeaderButtons();
             $('.o_list_selection_box').css({'position': 'relative'});
        },
    });
});

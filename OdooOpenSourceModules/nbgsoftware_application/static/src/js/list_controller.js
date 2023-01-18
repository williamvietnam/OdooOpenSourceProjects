odoo.define('nbgsoftware_application.ListController', function (require) {
    "use strict";

    const ListController = require('web.ListController');

    ListController.include({

        _getActionMenuItems: function(state) {
            let actionMenuItems = this._super(...arguments);
            //hide Export in action
            if (state.model === 'ui.app' || state.model === 'ui.app.category') {
                const otherList = actionMenuItems?.items.other
                if (otherList) {
                    const index = otherList.findIndex(item => ["Export", "エクスポート"].includes(item.description))
                    if (index !== -1) otherList.splice(index, 1)
                }
            }
            return actionMenuItems
        },
        _updateSelectionBox() {
             this._super(...arguments);
             this._renderHeaderButtons();
             $('.o_list_selection_box').css({'position': 'relative'});
        },
    });
});

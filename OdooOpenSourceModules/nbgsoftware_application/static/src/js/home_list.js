odoo.define('nbgsoftware_application.app_home_list_view', function (require) {
'use strict';

var viewRegistry = require('web.view_registry');
var ListView = require('web.ListView');
var ListRenderer = require('web.ListRenderer');

var HomeHideTreeRenderer = ListRenderer.extend({

    on_attach_callback: function() {
        this._super.apply(this, arguments);
        // hide checkbox view home
        $('div.custom-checkbox').hide();
    },

    _renderOptionalColumnsDropdown: function () {
        let $optionalColumnsDropdown = this._super(...arguments);
        // hide checkbox view home
        $('div.custom-checkbox').hide();
        return $optionalColumnsDropdown
    }
});

var HomeTreeViewWithoutControlPanel = ListView.extend({
    config: _.extend({}, ListView.prototype.config, {
        Renderer: HomeHideTreeRenderer,
    }),
});
viewRegistry.add('app_home_list_view', HomeTreeViewWithoutControlPanel);

return HomeTreeViewWithoutControlPanel;

});



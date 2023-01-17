odoo.define('nbgsoftware_application.ListRenderer', function (require) {
"use_strict";

const ListRenderer = require('web.ListRenderer');
const session = require('web.session');

ListRenderer.include({
    /**
    * @override
    */
    on_attach_callback: function() {
        this._super.apply(this, arguments);
        // hide search and filter, group panel in list view
        if (this.state.model === 'ui.app' || this.state.model === 'ui.app.category') {
            $('div.o_search_options').hide();
            $('i.o_optional_columns_dropdown_toggle').hide();
            // override translate button "Create"
            const listButton = document.getElementsByClassName('o_list_button_add')[0];
            if (listButton && listButton.textContent.toString().trim() === '作成') {
                listButton.textContent = '追加'
            }
        }
        if (this.state.model === 'ui.app') {
            $('img.img-fluid').css({'width': '50px', 'height': '50px'});
            session.user_has_group('base.group_system').then(function(has_group) {
                if (!has_group) {
                    $('div.custom-checkbox').hide();
                }
            });
        }
        if (this.state.model === 'ui.app.category') {
            $('div.custom-checkbox').hide();
        }
    },

    _renderOptionalColumnsDropdown: function(ev) {
        let $optionalColumnsDropdown = this._super(...arguments);
        if (this.state.model === 'ui.app') {
             //resize image app in list view
            $('img.img-fluid').css({'width': '50px', 'height': '50px'});
            $('i.o_optional_columns_dropdown_toggle').hide();
            session.user_has_group('base.group_system').then(function(has_group) {
                if (!has_group) {
                    $('div.custom-checkbox').hide();
                }
            });
        }
        if (this.state.model === 'ui.app.category') {
            $('i.o_optional_columns_dropdown_toggle').hide();
            $('div.custom-checkbox').hide();
        }
        return $optionalColumnsDropdown
    },
    });

});

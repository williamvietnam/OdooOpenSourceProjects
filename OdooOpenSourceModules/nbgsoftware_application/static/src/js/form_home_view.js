odoo.define('nbgsoftware_application.app_home_form_view', function (require) {
'use strict';

const viewRegistry = require('web.view_registry');
const FormController = require('web.FormController');
const FormView = require('web.FormView');
const FormRenderer = require('web.FormRenderer');

var ExtendFormRenderer = FormRenderer.extend({
    on_attach_callback: function() {
        this._super.apply(this, arguments);
        // hide optimal image size when mode readonly
        if (this.mode === 'readonly') {
            $('div.note_image_app').attr('style','opacity:0;');
        }
        // hide action in form view
        $('.o_cp_action_menus').hide();
    },
});

var HomeUiAppFormView = FormView.extend({
    config: _.extend({}, FormView.prototype.config, {
        Renderer: ExtendFormRenderer,
    }),
});
viewRegistry.add('app_home_form_view', HomeUiAppFormView);

return HomeUiAppFormView;

});

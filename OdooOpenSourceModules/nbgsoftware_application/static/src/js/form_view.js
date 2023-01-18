odoo.define('nbgsoftware_application.app_form_view', function (require) {
'use strict';

const viewRegistry = require('web.view_registry');
const FormView = require('web.FormView');
const FormRenderer = require('web.FormRenderer');

var ExtendFormRenderer = FormRenderer.extend({
    on_attach_callback: function() {
        this._super.apply(this, arguments);
        // hide optimal image size when mode readonly
        if (this.mode === 'readonly') {
            $('div.note_image_app').attr('style','opacity:0;');
        }
    },
});

var UiAppFormView = FormView.extend({
    config: _.extend({}, FormView.prototype.config, {
        Renderer: ExtendFormRenderer,
    }),
});
viewRegistry.add('app_form_view', UiAppFormView);

return UiAppFormView;

});

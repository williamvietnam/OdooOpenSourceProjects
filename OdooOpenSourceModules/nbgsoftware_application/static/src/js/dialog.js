odoo.define('nbgsoftware_application.dialog_custom', function (require) {
    "use strict";

    var Dialog = require('web.Dialog');
    var session = require('web.session');


    Dialog.include({
        renderElement: function () {
            this._super.apply(this, arguments);
            var lang = session.user_context.lang
            if (this.res_model === 'ir.ui.menu') {
                setTimeout(function (){
                    $('i.o_optional_columns_dropdown_toggle, div.position-static').hide();
                }, 0)
            }
            if (lang === 'ja_JP') {
                setTimeout(function (){
                    const title = $('h4.modal-title:contains(New)')
                    if (title) {
                        title.text(title.text().replace('New', '新規'))
                    }
                }, 0)
            }
        },
    });
});

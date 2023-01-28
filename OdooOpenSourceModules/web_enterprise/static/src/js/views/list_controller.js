odoo.define('web_enterprise.ListControllerMobile', function (require) {
    "use strict";

    const config = require('web.config');
    if (!config.device.isMobile) {
        return;
    }

    const ListController = require('web.ListController');

    ListController.include({
        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        /**
         * In mobile, we hide the "export" button.
         *
         * @override
         */
        renderButtons() {
            this._super(...arguments);
            this.$buttons.find('.o_list_export_xlsx').hide();
        },
        /**
         * In mobile, we hide the "export" button.
         *
         * @override
         */
        updateButtons() {
            this._super(...arguments);
            this.$buttons.find('.o_list_export_xlsx').hide();
        },

        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------

        /**
         * In mobile, we let the renderer replace its header with the selection
         * banner. @see web_enterprise.ListRendererMobile
         *
         * @override
         */
        _updateSelectionBox() {
            this._super(...arguments);
            const displayBanner = Boolean(this.$selectionBox);
            if (displayBanner) {
                const banner = this.$selectionBox[0];
                this.renderer.el.prepend(banner);
                banner.style.width = `${document.documentElement.offsetWidth}px`;
            }
            this.renderer.el.classList.toggle('o_renderer_selection_banner', displayBanner);
        },
    });
});

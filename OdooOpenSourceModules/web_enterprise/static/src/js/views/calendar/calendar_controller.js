odoo.define('web_enterprise.CalendarController', function (require) {
"use strict";

const config = require('web.config');
if (!config.device.isMobile) {
    return;
}

/**
 * This file implements some tweaks to improve the UX in mobile.
 */

const CalendarController = require('web.CalendarController');

CalendarController.include({
    custom_events: _.extend({}, CalendarController.prototype.custom_events, {
        today_button_click: '_onTodayButtonClicked',
    }),

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * In mobile, we display a special 'Today' button on the bottom right corner
     * of the control panel. Its click events are handled here.
     */
    _onTodayButtonClicked: function () {
        this._move('today');
    },

    _renderButtonsParameters: function () {
        return _.extend({}, this._super.apply(this, arguments), {
            isMobile: config.device.isMobile,
        });
    },

});

});

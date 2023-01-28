odoo.define('web_enterprise.DisableTour', function (require) {
"use strict";

var config = require('web.config');
if (!config.device.isMobile) {
    return;
}

var TourManager = require('web_tour.TourManager');

TourManager.include({
    /**
     * Disables tours in mobile.
     *
     * @override
     */
    _register: function (do_update, tour, name) {
        // Consuming tours which are not run by test case
        if (!this.running_tour) {
            this.consumed_tours.push(name);
        }
        return this._super.apply(this, arguments);
    },
});

});

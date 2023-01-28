odoo.define('web_enterprise.BasicRenderer', function (require) {
"use strict";

const config = require('web.config');
if (!config.device.isMobile) {
    return;
}

/**
 * This file defines the MobileBasicRenderer, an extension of the BasicRenderer
 * implementing some tweaks to improve the UX in mobile.
 */

const BasicRenderer = require('web.BasicRenderer');

BasicRenderer.include({
    SHOW_AFTER_DELAY: 250,

    /**
     * @override
     */
    init() {
        this._super(...arguments);
        this.showTimer = undefined;
        this.tooltipNodes = [];
        this._onTouchStartBind = this._onTouchStart.bind(this);
        this._onTouchEndBind = this._onTouchEnd.bind(this);
    },
    /**
     * @override
     */
    on_attach_callback() {
        this._super(...arguments);
        this._addListener();
    },
    /**
     * @override
     */
    on_detach_callback() {
        this._removeListeners();
        this._super(...arguments);
    },

    _addListener: function () {
        this.tooltipNodes.forEach((nodeElement) => {
            nodeElement.addEventListener('touchstart', this._onTouchStartBind);
            nodeElement.addEventListener('touchend', this._onTouchEndBind);
            nodeElement.classList.add('o_user_select_none');
        });
    },
    /**
     * Allow to change when the tooltip appears
     *
     * @override
     */
    _addFieldTooltip: function (widget, $node) {
        this._super(...arguments);
        $node = $node.length ? $node : widget.$el;
        const nodeElement = $node[0];
        if (!this.tooltipNodes.some(node => node === nodeElement)) {
            this.tooltipNodes.push(nodeElement);
        }
    },
    /**
     * @override
     */
    _getTooltipOptions: function () {
        return Object.assign({}, this._super(...arguments), {
            trigger: 'manual',
        });
    },
    /**
     * @override
     */
    _render: function () {
        return this._super(...arguments).then(() => {
            this._addListener();
        });
    },
    _removeListeners: function () {
        while (this.tooltipNodes.length) {
            const node = this.tooltipNodes.shift();
            node.removeEventListener('touchstart', this._onTouchStartBind);
            node.removeEventListener('touchend', this._onTouchEndBind);
            node.classList.remove('o_user_select_none');
        }
    },
    /**
     * @private
     * @param {TouchEvent} event
     */
    _onTouchEnd: function (event) {
        clearTimeout(this.showTimer);
        const $node = $(event.target);
        $node.tooltip('hide');
    },
    /**
     * @private
     * @param {TouchEvent} event
     */
    _onTouchStart: function (event) {
        // Exclude children element from this handler
        if (!event.target.classList.contains('o_user_select_none')) {
            return;
        }
        const $node = $(event.target);
        clearTimeout(this.showTimer);
        this.showTimer = setTimeout(() => {
            $node.tooltip('show');
        }, this.SHOW_AFTER_DELAY);
    },
});

});

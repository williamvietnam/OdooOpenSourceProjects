odoo.define('web_enterprise.ControlPanel', function (require) {
    "use strict";

    const ControlPanel = require('web.ControlPanel');
    const { device } = require('web.config');

    const { Portal } = owl.misc;
    const { useState } = owl.hooks;
    const STICKY_CLASS = 'o_mobile_sticky';

    if (!device.isMobile) {
        return;
    }

    /**
     * Control panel: mobile layout
     *
     * This patch handles the scrolling behaviour of the control panel in a mobile
     * environment: the panel sticks to the top of the window when scrolling into
     * the view. It is revealed when scrolling up and hiding when scrolling down.
     * The panel's position is reset to default when at the top of the view.
     */
    ControlPanel.patch('web_enterprise.ControlPanel', T => {
        class ControlPanelPatchEnterprise extends T {

            constructor() {
                super(...arguments);
                this.state = useState({
                    showSearchBar: false,
                    showMobileSearch: false,
                    showViewSwitcher: false,
                });
            }

            mounted() {
                // Bind additional events
                this.onWindowClick = this._onWindowClick.bind(this);
                this.onWindowScroll = this._onScrollThrottled.bind(this);
                window.addEventListener('click', this.onWindowClick);
                document.addEventListener('scroll', this.onWindowScroll);

                this.oldScrollTop = 0;
                this.initialScrollTop = document.documentElement.scrollTop;
                this.el.style.top = '0px';

                super.mounted();
            }

            willUnmount() {
                window.removeEventListener('click', this.onWindowClick);
                document.removeEventListener('scroll', this.onWindowScroll);
            }

            //---------------------------------------------------------------------
            // Private
            //---------------------------------------------------------------------

            /**
             * Get today's date (number).
             * @private
             * @returns {number}
             */
            _getToday() {
                return new Date().getDate();
            }

            //---------------------------------------------------------------------
            // Handlers
            //---------------------------------------------------------------------

            /**
             * Show or hide the control panel on the top screen.
             * The function is throttled to avoid refreshing the scroll position more
             * often than necessary.
             * @private
             */
            _onScrollThrottled() {
                if (this.isScrolling) {
                    return;
                }
                this.isScrolling = true;
                requestAnimationFrame(() => this.isScrolling = false);

                const scrollTop = document.documentElement.scrollTop;
                const delta = Math.round(scrollTop - this.oldScrollTop);

                if (scrollTop > this.initialScrollTop) {
                    // Beneath initial position => sticky display
                    const elRect = this.el.getBoundingClientRect();
                    this.el.classList.add(STICKY_CLASS);
                    this.el.style.top = delta < 0 ?
                        // Going up
                        `${Math.min(0, elRect.top - delta)}px` :
                        // Going down | not moving
                        `${Math.max(-elRect.height, elRect.top - delta)}px`;
                } else {
                    // Above intial position => standard display
                    this.el.classList.remove(STICKY_CLASS);
                }

                this.oldScrollTop = scrollTop;
            }

            /**
             * Reset mobile search state on switch view.
             * @private
             */
            _onSwitchView() {
                Object.assign(this.state, {
                    showSearchBar: false,
                    showMobileSearch: false,
                    showViewSwitcher: false,
                });
            }

            /**
             * @private
             * @param {MouseEvent} ev
             */
            _onWindowClick(ev) {
                if (
                    this.state.showViewSwitcher &&
                    !ev.target.closest('.o_cp_switch_buttons')
                ) {
                    this.state.showViewSwitcher = false;
                }
            }
        }

        ControlPanelPatchEnterprise.components.Portal = Portal;
        ControlPanelPatchEnterprise.template = 'web_enterprise.ControlPanel';

        return ControlPanelPatchEnterprise;
    });
});

odoo.define('web.WebClient', function (require) {
"use strict";

const AbstractWebClient = require('web.AbstractWebClient');
const config = require('web.config');
const core = require('web.core');
const data_manager = require('web.data_manager');
const dom = require('web.dom');
const session = require('web.session');

const HomeMenuWrapper = require('web_enterprise.HomeMenuWrapper');
const Menu = require('web_enterprise.Menu');

return AbstractWebClient.extend({
    // We should review globally the communication with the web client via events
    events: _.extend({}, AbstractWebClient.prototype.events, {
        'app-clicked': 'on_app_clicked',
        'hide-home-menu': '_onHideHomeMenu',
        'menu-clicked': 'on_menu_clicked',
    }),
    // The navbar (and maybe other components) communicates via trigger_up
    // with the web client. We don't change that for now.
    custom_events: _.extend({}, AbstractWebClient.prototype.custom_events, {
        hide_home_menu: '_onHideHomeMenu',
        menu_clicked: 'on_menu_clicked',
        show_home_menu: '_onShowHomeMenu',
    }),
    init: function () {
        this._super(...arguments);
        this.homeMenuManagerDisplayed = false;
    },
    start: function () {
        core.bus.on('change_menu_section', this, function (menu_id) {
            this.do_push_state(Object.assign($.bbq.getState(), { menu_id }));
        });

        return this._super.apply(this, arguments);
    },
    bind_events: function () {
        var self = this;
        this._super.apply(this, arguments);

        /*
            Small patch to allow having a link with a href towards an anchor. Since odoo use hashtag
            to represent the current state of the view, we can't easily distinguish between a link
            towards an anchor and a link towards anoter view/state. If we want to navigate towards an
            anchor, we must not change the hash of the url otherwise we will be redirected to the app
            switcher instead.
            To check if we have an anchor, first check if we have an href attributes starting with #.
            Try to find a element in the DOM using JQuery selector.
            If we have a match, it means that it is probably a link to an anchor, so we jump to that anchor.
        */
        this.$el.on('click', 'a', function(ev) {
            var disable_anchor = ev.target.attributes.disable_anchor;
            if (disable_anchor && disable_anchor.value === "true") {
                return;
            }

            var href = ev.target.attributes.href;
            if (href) {
                if (href.value[0] === '#' && href.value.length > 1) {
                    if (self.$("[id='"+href.value.substr(1)+"']").length) {
                        ev.preventDefault();
                        self.trigger_up('scrollTo', {'selector': href.value});
                    }
                }
            }
        });
    },
    load_menus: async function () {
        const menuData = await (odoo.loadMenusPromise || odoo.reloadMenus());
        // Compute action_id if not defined on a top menu item
        for (let i = 0; i < menuData.children.length; i++) {
            let child = menuData.children[i];
            if (child.action === false) {
                while (child.children && child.children.length) {
                    child = child.children[0];
                    if (child.action) {
                        menuData.children[i].action = child.action;
                        break;
                    }
                }
            }
        }
        odoo.loadMenusPromise = null;
        return menuData;
    },
    show_application: function () {
        this.set_title();

        return this.menu_dp.add(this.instanciate_menu_widgets()).then(async () => {
            $(window).bind('hashchange', this.on_hashchange);
            // If the url's state is empty, we execute the user's home action if there is one (we
            // show the home menu if not)
            // If it is not empty, we trigger a dummy hashchange event so that `this.on_hashchange`
            // will take care of toggling the home menu and loading the action.
            const state = $.bbq.getState(true);
            if (Object.keys(state).length === 1 && Object.keys(state)[0] === "cids") {
                const result = await this.menu_dp.add(this._rpc({
                    model: 'res.users',
                    method: 'read',
                    args: [session.uid, ["action_id"]],
                }));
                const data = result[0];
                if (data.action_id) {
                    await this.do_action(data.action_id[0]);
                    this.menu.change_menu_section(this.menu.action_id_to_primary_menu_id(data.action_id[0]));
                    return this.toggleHomeMenu(false);
                } else {
                    return this.toggleHomeMenu(true);
                }
            } else {
                return this.on_hashchange();
            }
        });
    },
    /**
     * @param {Object} params
     * @param {Object} params.menuData
     * @returns {Promise}
     */
    instanciate_menu_widgets: async function() {
        const menuData = await this.load_menus();
        this.homeMenuManager = this._instanciateHomeMenuWrapper(menuData);
        this.menu = await this._instanciateMenu(menuData);
    },

    // --------------------------------------------------------------
    // URL state handling
    // --------------------------------------------------------------

    on_hashchange: async function(ev) {
        if (this._ignore_hashchange) {
            this._ignore_hashchange = false;
            return Promise.resolve();
        }
        try {
            await this.clear_uncommitted_changes();
        } catch (err) {
            if (ev) {
                this._ignore_hashchange = true;
                window.location = ev.originalEvent.oldURL;
                return;
            }
        }
        const stringstate = $.bbq.getState(false);
        if (!_.isEqual(this._current_state, stringstate)) {
            const state = $.bbq.getState(true);
            if (state.action || (state.model && (state.view_type || state.id))) {
                let menuDpRejected = false;
                const loadStateProm = this.action_manager.loadState(state, !!this._current_state)
                    .guardedCatch(() => {
                        if (!menuDpRejected) {
                            this.toggleHomeMenu(true);
                        }
                    });
                return this.menu_dp.add(loadStateProm).then(() => {
                        if (state.menu_id) {
                            if (state.menu_id !== this.menu.current_primary_menu) {
                                core.bus.trigger('change_menu_section', state.menu_id);
                            }
                        } else {
                            const action = this.action_manager.getCurrentAction();
                            if (action) {
                                const menu_id = this.menu.action_id_to_primary_menu_id(action.id);
                                core.bus.trigger('change_menu_section', menu_id);
                            }
                        }
                        return this.toggleHomeMenu(false);
                    })
                    .guardedCatch(() => {
                        menuDpRejected = true;
                    });
            } else if (state.menu_id) {
                const action_id = this.menu.menu_id_to_action_id(state.menu_id);
                await this.menu_dp.add(this.do_action(action_id, {clear_breadcrumbs: true}));
                core.bus.trigger('change_menu_section', state.menu_id);
                return this.toggleHomeMenu(false);
            } else {
                return this.toggleHomeMenu(true);
            }
        }
        this._current_state = stringstate;
    },

    // --------------------------------------------------------------
    // Menu handling
    // --------------------------------------------------------------

    /**
     * @private
     * @param {OwlEvent} ev
     */
    on_app_clicked: async function (ev) {
        const result = await this.menu_dp.add(data_manager.load_action(ev.detail.action_id));
        return this.action_mutex.exec(() => new Promise((resolve, reject) => {
            const options = Object.assign({}, ev.detail.options, {
                clear_breadcrumbs: true,
                action_menu_id: ev.detail.menu_id,
            });
            Promise.resolve(this._openMenu(result, options))
                .then(() => {
                    this._on_app_clicked_done(ev)
                        .then(resolve)
                        .guardedCatch(reject);
                })
                .guardedCatch(async () => {
                    await this.toggleHomeMenu(true);
                    resolve();
                });
        }));
    },
    _on_app_clicked_done: function(ev) {
        core.bus.trigger('change_menu_section', ev.detail.menu_id);
        this.toggleHomeMenu(false);
        return Promise.resolve();
    },
    on_menu_clicked: async function (ev) {
        // ev.data.action_id is used in case the event is still an odoo event: retrocompatibility
        const action_id = (ev.detail && ev.detail.action_id) || ev.data.action_id;
        const result = await this.menu_dp.add(data_manager.load_action(action_id));
        const options = Object.assign({}, ev.data && ev.data.options, { clear_breadcrumbs: true });
        await this.action_mutex.exec(() => this._openMenu(result, options));
        this.el.classList.remove('o_mobile_menu_opened');
    },
    /**
     * Open the action linked to a menu.
     * This function is mostly used to allow override in other modules.
     *
     * @private
     * @param {Object} action
     * @param {Object} options
     * @returns {Promise}
     */
    _openMenu: function (action, options) {
        return this.do_action(action, options);
    },
    /**
     * @param {boolean} display
     * @returns {Promise}
     */
    toggleHomeMenu: async function (display) {
        // We check that the homeMenuManagerDisplayed variable is different from
        // the display argument to execute a toggle only when needed.
        if (display === this.homeMenuManagerDisplayed) {
            return;
        }

        if (display) {
            await this.clear_uncommitted_changes();
            core.bus.trigger('will_show_home_menu');

            // Potential changes have been discarded -> the home menu will be displayed
            this.homeMenuManagerDisplayed = true;

            // Save the current scroll position
            this.scrollPosition = this.getScrollPosition();

            // Detach the web_client contents
            const $to_detach = this.$el.contents()
                .not(this.menu.$el)
                .not('.o_loading')
                .not('.o_in_home_menu')
                .not('.o_notification_manager');
            this.web_client_content = document.createDocumentFragment();
            dom.detach([{ widget: this.action_manager }], { $to_detach: $to_detach }).appendTo(this.web_client_content);

            // Save and clear the url
            this.url = $.bbq.getState();
            if (location.hash) {
                this._ignore_hashchange = true;
                $.bbq.pushState('#home', 2); // merge_mode 2 to replace the current state
            }
            $.bbq.pushState({ cids: this.url.cids }, 0);

            // Attach the home_menu
            await this.homeMenuManager.mount(this.el);
            this.trigger_up('webclient_started');
            core.bus.trigger('show_home_menu');
        } else {
            this.homeMenuManagerDisplayed = false;

            // Detach the home_menu
            this.homeMenuManager.unmount();
            core.bus.trigger('will_hide_home_menu');

            dom.append(this.$el, [this.web_client_content], {
                in_DOM: true,
                callbacks: [{ widget: this.action_manager }],
            });
            delete this.web_client_content;
            this.trigger_up('scrollTo', this.scrollPosition);
            core.bus.trigger('hide_home_menu');
        }
        this.menu.toggle_mode(display, this.action_manager.getCurrentAction() !== null);
        this.el.classList.toggle("o_home_menu_background", display);
    },
    /**
     * Ensure to toggle off the home menu when an action is executed (for
     * instance from a systray item or from a dialog).
     *
     * @private
     */
    current_action_updated: function() {
        this._super.apply(this, arguments);

        if (this.homeMenuManagerDisplayed) {
            this.toggleHomeMenu(false);
        }
    },
    _onShowHomeMenu: function () {
        this.toggleHomeMenu(true);
    },
    _onHideHomeMenu: function () {
        // Backbutton is displayed only if the current action is not null (checked in toggleHomeMenu)
        if (this.menu.backbutton_displayed) {
            // Restore the url
            $.bbq.pushState(this.url, 2); // merge_mode 2 to replace the current state
            this.toggleHomeMenu(false);
        }
    },

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * Overrides to return the left and top scroll positions of the webclient
     * in mobile (as it is the main scrolling element in that case).
     *
     * @returns {Object} with keys left and top
     */
    getScrollPosition: function () {
        if (config.device.isMobile) {
            return {
                left: $(window).scrollLeft(),
                top: $(window).scrollTop(),
            };
        }
        return this._super.apply(this, arguments);
    },

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * @private
     * @param {Object} menuData
     * @returns {Menu}
     */
    _instanciateMenu: async function (menuData) {
        const menu = new Menu(this, menuData);
        await menu.appendTo(document.createDocumentFragment());
        menu.toggle_mode(this.homeMenuManagerDisplayed, false);
        dom.prepend(this.$el, menu.$el, {
            callbacks: [{ widget: menu }],
            in_DOM: true,
        });
        return menu;
    },
    /**
     * @private
     * @param {Object} menuData
     * @returns {HomeMenuWrapper}
     */
    _instanciateHomeMenuWrapper: function (menuData) {
        return new HomeMenuWrapper(null, { menuData });
    },

    //--------------------------------------------------------------------------
    // Handlers
    //--------------------------------------------------------------------------

    /**
     * @override
     * @private
     */
    _onScrollTo: function (ev) {
        if (config.device.isMobile) {
            var offset = {top: ev.data.top, left: ev.data.left || 0};
            if (!offset.top) {
                offset = dom.getPosition(document.querySelector(ev.data.selector));
            }
            $(window).scrollTop(offset.top);
            $(window).scrollLeft(offset.left);
        }
        this._super.apply(this, arguments);
    },
});

});

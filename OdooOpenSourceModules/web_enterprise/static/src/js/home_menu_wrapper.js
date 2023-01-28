odoo.define("web_enterprise.HomeMenuWrapper", function (require) {
    "use strict";

    const HomeMenu = require('web_enterprise.HomeMenu');
    const utils = require('web.utils');

    const { Component, useState } = owl;

    /**
     * Home menu manager (pseudo-webclient)
     *
     * This component is meant to become the WebClient component in the future. For
     * now, its only purpose is to correctly instanciate the appropriate HomeMenu after
     * processing its given data.
     * @extends Component
     */
    class HomeMenuWrapper extends Component {
        constructor() {
            super(...arguments);
            const { apps, menuItems } = this._processMenuData(this.props.menuData);
            this.state = useState({ apps, menuItems });
        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        /**
         * Used by the web_client to update the state of the HomeMenuWrapper
         * @param {Object} menuData
         */
        updateMenuData(menuData) {
            const { apps, menuItems } = this._processMenuData(menuData);
            this.state.apps = apps;
            this.state.menuItems = menuItems;
        }

        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------

        /**
         * @private
         * @param {Object} menuData                 The considered menu, (initially "Root")
         * @param {string} [menuData.action]
         * @param {number|false} menuData.id
         * @param {number} menuData.menu_id         (When menu not an app) id of the parent app
         * @param {string} menuData.name
         * @param {number} [menuData.parent_id]
         * @param {string} [menuData.web_icon]      Path of the icon
         * @param {string} [menuData.web_icon_data]   Base64 string representation of the web icon
         * @param {string} menuData.xmlid
         * @returns {Object[]}
         */
        _processMenuData(menuData) {
            const apps = [];
            const menuItems = [];
            utils.traversePath(menuData, (menuItem, parents) => {
                if (!menuItem.id || !menuItem.action) {
                    return;
                }
                const isApp = !menuItem.parent_id;
                const item = {
                    parents: parents.slice(1).map(p => p.name).join(' / '),
                    label: menuItem.name,
                    id: menuItem.id,
                    xmlid: menuItem.xmlid,
                    action: menuItem.action ? menuItem.action.split(',')[1] : '',
                    webIcon: menuItem.web_icon,
                };
                if (!menuItem.parent_id) {
                    const [iconClass, color, backgroundColor] = (item.webIcon || '').split(',');
                    if (menuItem.web_icon_data) {
                        item.webIconData = `data:image/png;base64,${menuItem.web_icon_data}`.replace(/\s/g, "");
                    } else if (backgroundColor !== undefined) { // Could split in three parts?
                        item.webIcon = { iconClass, color, backgroundColor };
                    } else {
                        item.webIconData = '/web_enterprise/static/src/img/default_icon_app.png';
                    }
                } else {
                    item.menu_id = parents[1].id;
                }
                if (isApp) {
                    apps.push(item);
                } else {
                    menuItems.push(item);
                }
            });
            return { apps, menuItems };
        }
    }

    HomeMenuWrapper.components = { HomeMenu };
    HomeMenuWrapper.props = {
        menuData: Object,
    };
    HomeMenuWrapper.template = "HomeMenuWrapper";

    return HomeMenuWrapper;
});

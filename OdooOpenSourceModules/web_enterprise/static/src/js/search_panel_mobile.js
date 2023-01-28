odoo.define("web.SearchPanelMobile", function (require) {
    "use strict";

    const SearchPanel = require("web/static/src/js/views/search_panel.js");
    const { device } = require("web.config");

    if (!device.isMobile) {
        return;
    }

    const { Portal } = owl.misc;

    //-------------------------------------------------------------------------
    // Helpers
    //-------------------------------------------------------------------------

    const isFilter = (s) => s.type === "filter";

    /**
     * @param {Map} values
     * @returns {Object[]}
     */
    function nameOfCheckedValues(values) {
        const names = [];
        for (const [_, value] of values) {
            if (value.checked) {
                names.push(value.display_name);
            }
        }
        return names;
    }

    SearchPanel.patch("web_enterprise.SearchPanel.Mobile", (T) => {
        /**
         * Search panel: mobile
         * @extends SearchPanel
         */
        class SearchPanelMobile extends T {

            constructor() {
                super(...arguments);

                this.state.showMobileSearch = false;
            }

            //-----------------------------------------------------------------
            // Private
            //-----------------------------------------------------------------

            /**
             * Returns a formatted version of the active categories to populate
             * the selection banner of the control panel summary.
             * @private
             * @returns {Object[]}
             */
            _getCategorySelection() {
                const activeCategories = this.model.get("sections",
                    (s) => s.type === "category" && s.activeValueId
                );
                const selection = [];
                for (const category of activeCategories) {
                    const parentIds = this._getAncestorValueIds(
                        category,
                        category.activeValueId
                    );
                    const orderedCategoryNames = [
                        category.activeValueId,
                        ...parentIds,
                    ].map(
                        (valueId) => category.values.get(valueId).display_name
                    );
                    selection.push({
                        values: orderedCategoryNames,
                        icon: category.icon,
                        color: category.color,
                    });
                }
                return selection;
            }

            /**
             * Returns a formatted version of the active filters to populate
             * the selection banner of the control panel summary.
             * @private
             * @returns {Object[]}
             */
            _getFilterSelection() {
                const filters = this.model.get("sections", isFilter);
                const selection = [];
                for (const { groups, values, icon, color } of filters) {
                    let filterValues;
                    if (groups) {
                        filterValues = Object.keys(groups)
                            .map((groupId) =>
                                nameOfCheckedValues(groups[groupId].values)
                            )
                            .flat();
                    } else if (values) {
                        filterValues = nameOfCheckedValues(values);
                    }
                    if (filterValues.length) {
                        selection.push({ values: filterValues, icon, color });
                    }
                }
                return selection;
            }
        }

        SearchPanelMobile.components.Portal = Portal;
        SearchPanelMobile.template = "web_enterprise.SearchPanel.Mobile";

        return SearchPanelMobile;
    });
});

odoo.define("web_enterprise.ExpirationPanel", function (require) {
    "use strict";

    const { Component, hooks } = owl;
    const { useState, useRef } = hooks;

    /**
     * Expiration panel
     *
     * Component representing the banner located on top of the home menu. Its purpose
     * is to display the expiration state of the current database and to help the
     * user to buy/renew its subscription.
     * @extends Component
     */
    class ExpirationPanel extends Component {
        constructor() {
            super(...arguments);

            const expirationDate = new moment(
                this.env.session.expiration_date || new moment().add(30, "d")
            );
            const diffDays = this.constructor.computeDiffDays(expirationDate);

            this.state = useState({
                alertType: diffDays <= 6 ? "danger" : (diffDays <= 16 ? "warning" : "info"),
                buttonText: "Register",
                diffDays: diffDays,
                message: 'register',
                validDate: moment(expirationDate).format("LL"),
            });

            this.inputRef = useRef('input');

            // Expiration reason e.g. 'trial','renewal','upsell',...
            this.expirationReason = this.env.session.expiration_reason;
            this.notYetRegistered = ['trial', 'demo', false].includes(this.expirationReason);

            // Check if mail (discuss) is installed
            // (this is a way to check that there is an app different from Apps or Settings installed)
            this.mailInstalled = this.env.session.module_list.some(m => m === "mail");

            // Type of logged-in accounts addressed by message
            this.warning = this.env.session.warning;
        }

        mounted() {
            if (this.state.diffDays <= 0) {
                this.env.services.blockUI({
                    message: this.el,
                    css: { cursor: "auto" },
                    overlayCSS: { cursor: "auto" },
                });
            }
        }

        //--------------------------------------------------------------------------
        // Static methods
        //--------------------------------------------------------------------------

        /**
         * @private
         * @param {number} date
         */
        static computeDiffDays(date) {
            const d = new moment(date);
            const today = new moment();
            const duration = moment.duration(d.diff(today));
            return Math.round(duration.asDays());
        }

        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------

        /**
         * Used to ensure global state consistency.
         * @private
         */
        _clearState() {
            for (const key in this.state) {
                delete this.state[key];
            }
        }

        //--------------------------------------------------------------------------
        // Handlers
        //--------------------------------------------------------------------------

        /**
         * @private
         */
        _onHide() {
            this.trigger("hide-expiration-panel");
        }

        /**
         * @private
         */
        _onClickRegister() {
            this.state.displayRegisterForm = !this.state.displayRegisterForm;
        }

        /**
         * @private
         */
        async _onBuy() {
            const limitDate = new moment()
                .subtract(15, "days")
                .format("YYYY-MM-DD");
            const users = await this.rpc({
                model: "res.users",
                method: "search_count",
                args: [[["share", "=", false], ["login_date", ">=", limitDate]]],
            });
            this.env.services.navigate(
                "https://www.odoo.com/odoo-enterprise/upgrade",
                { num_users: users }
            );
        }

        /**
         * Save the registration code then triggers a ping to submit it.
         * @private
         */
        async _onCodeSubmit() {
            const input = this.inputRef.el;
            const enterpriseCode = input.value;
            if (!enterpriseCode) {
                const inputTitle = input.getAttribute("title");
                input.setAttribute("placeholder", inputTitle);
                return;
            }
            const [oldDate, , linkedSubscriptionUrl, emailLinked] = await Promise.all([
                this.rpc({
                    model: "ir.config_parameter",
                    method: "get_param",
                    args: ["database.expiration_date"],
                }),
                this.rpc({
                    model: "ir.config_parameter",
                    method: "set_param",
                    args: ["database.enterprise_code", enterpriseCode],
                }),
                this.rpc({
                    model: 'ir.config_parameter',
                    method: 'get_param',
                    args: ['database.already_linked_subscription_url'],
                }),
                this.rpc({
                    model: 'ir.config_parameter',
                    method: 'get_param',
                    args: ['database.already_linked_email'],
                })
            ]);

            this.env.services.setCookie("oe_instance_hide_panel", "", -1);

            await this.rpc({
                model: "publisher_warranty.contract",
                method: "update_notification",
                args: [[]],
            });

            const expirationDate = await this.rpc({
                model: "ir.config_parameter",
                method: "get_param",
                args: ["database.expiration_date"],
            });

            this.env.services.unblockUI();

            this._clearState();
            if (expirationDate !== oldDate && !linkedSubscriptionUrl) {
                this.state.message = 'success';
                this.state.displayRegisterForm = false;
                this.state.alertType = "success";
                this.state.validDate = moment(expirationDate).format("LL");
            } else {
                this.state.alertType = "danger";
                this.state.buttonText = "Retry";
                this.state.displayRegisterForm = true;
                if (linkedSubscriptionUrl) {
                    this.state.message = "link";
                    this.state.linkedSubscriptionUrl = linkedSubscriptionUrl;
                    this.state.emailDelivery = null;
                    this.state.emailLinked = emailLinked;
                } else {
                    this.state.message = 'error';
                }
            }
        }

        /**
         * @private
         */
        async _onCheckStatus() {
            const oldDate = await this.rpc({
                model: "ir.config_parameter",
                method: "get_param",
                args: ["database.expiration_date"],
            });

            if (this.constructor.computeDiffDays(oldDate) >= 30) {
                return;
            }

            await this.rpc({
                model: "publisher_warranty.contract",
                method: "update_notification",
                args: [[]],
            });

            const expirationDate = await this.rpc({
                model: "ir.config_parameter",
                method: "get_param",
                args: ["database.expiration_date"],
            });

            if (
                expirationDate !== oldDate &&
                new moment(expirationDate) > new moment()
            ) {
                this.env.services.unblockUI();
                this._clearState();
                this.state.message = 'update';
                this.state.alertType = "success";
                this.state.validDate = moment(expirationDate).format("LL");
                this.state.diffDays = this.constructor.computeDiffDays(expirationDate);
            } else {
                this.env.services.reloadPage();
            }
        }

        /**
         * @private
         */
        async _onSendUnlinkEmail() {
            const unlink_mail_send_url = await this.rpc({
                model: 'ir.config_parameter',
                method: 'get_param',
                args: ['database.already_linked_send_mail_url'],
            });
            this.state.emailDelivery = 'ongoing';
            const { result, reason } = await this.env.services.ajaxJsonRPC(unlink_mail_send_url, 'call', {});
            if (result) {
                this.emailDelivery = 'success';
            } else {
                this.state.emailDelivery = 'fail';
                this.state.failReason = reason;
            }
        }

        /**
         * @private
         */
        async _onRenew() {
            const oldDate = await this.rpc({
                model: "ir.config_parameter",
                method: "get_param",
                args: ["database.expiration_date"],
            });

            this.env.services.setCookie("oe_instance_hide_panel", "", -1);

            await this.rpc({
                model: "publisher_warranty.contract",
                method: "update_notification",
                args: [[]],
            });

            const [expirationDate, enterpriseCode] = await Promise.all([
                this.rpc({
                    model: "ir.config_parameter",
                    method: "get_param",
                    args: ["database.expiration_date"],
                }),
                this.rpc({
                    model: "ir.config_parameter",
                    method: "get_param",
                    args: ["database.enterprise_code"],
                })
            ]);

            if (
                expirationDate !== oldDate &&
                new moment(expirationDate) > new moment()
            ) {
                this.env.services.unblockUI();
                this._clearState();
                this.state.message = 'success';
                this.state.alertType = "success";
                this.state.validDate = moment(expirationDate).format("LL");
                // Same remark as above (we just want to show clear button)
                this.state.diffDays = this.constructor.computeDiffDays(expirationDate);
            } else {
                const params = enterpriseCode ? { contract: enterpriseCode } : {};
                this.env.services.navigate(
                    "https://www.odoo.com/odoo-enterprise/renew",
                    params
                );
            }
        }

        /**
         * @private
         */
        async _onUpsell() {
            const limitDate = new moment()
                .subtract(15, "days")
                .format("YYYY-MM-DD");
            const [enterpriseCode, users] = await Promise.all([
                this.rpc({
                    model: "ir.config_parameter",
                    method: "get_param",
                    args: ["database.enterprise_code"],
                }),
                this.rpc({
                    model: "res.users",
                    method: "search_count",
                    args: [
                        [["share", "=", false], ["login_date", ">=", limitDate]]
                    ],
                })
            ]);
            const params = enterpriseCode ?
                { contract: enterpriseCode, num_users: users } :
                { num_users: users };
            this.env.services.navigate(
                "https://www.odoo.com/odoo-enterprise/upsell",
                params
            );
        }
    }

    ExpirationPanel.template = "DatabaseExpirationPanel";

    return ExpirationPanel;
});

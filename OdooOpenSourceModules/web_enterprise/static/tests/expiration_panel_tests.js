odoo.define("web_enterprise.expiration_panel_tests", function (require) {
    "use strict";

    const ExpirationPanel = require("web_enterprise.ExpirationPanel");
    const makeTestEnvironment = require("web.test_env");
    const testUtils = require("web.test_utils");

    const { Component, tags } = owl;
    const patchDate = testUtils.mock.patchDate;
    const { xml } = tags;

    QUnit.module("web_enterprise", {}, function () {
        QUnit.module("Expiration Panel");

        QUnit.test("Expiration Panel one app installed", async function (assert) {
            assert.expect(4);

            const unpatchDate = patchDate(2019, 9, 10, 0, 0, 0);

            class Parent extends Component {
                _onHideExpirationPanel() {
                    assert.step('hide-expiration-panel');
                }
            }
            Parent.components = { ExpirationPanel };
            Parent.env = makeTestEnvironment({
                session: {
                    expiration_date: '2019-11-09',
                    expiration_reason: '',
                    module_list: ['mail'],
                    warning: 'admin',
                },
            });
            Parent.template = xml`<ExpirationPanel t-on-hide-expiration-panel="_onHideExpirationPanel"/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());

            assert.strictEqual(parent.el.querySelector('.oe_instance_register').innerText,
                "This database will expire in 1 month.");

            // Color should be grey
            assert.hasClass(parent.el, 'alert-info');

            // Close the expiration panel
            await testUtils.dom.click(parent.el.querySelector(".oe_instance_hide_panel"));

            assert.verifySteps(['hide-expiration-panel']);

            parent.destroy();
            unpatchDate();
        });

        QUnit.test("Expiration Panel one app installed, buy subscription", async function (assert) {
            assert.expect(7);

            const unpatchDate = patchDate(2019, 9, 10, 0, 0, 0);

            class Parent extends Component { }
            Parent.components = { ExpirationPanel };
            Parent.env = makeTestEnvironment(
                {
                    services: {
                        navigate: function (url, params) {
                            assert.strictEqual(url, "https://www.odoo.com/odoo-enterprise/upgrade");
                            assert.deepEqual(params, { num_users: 7 });
                        },
                    },
                    session: {
                        expiration_date: '2019-10-24',
                        expiration_reason: 'demo',
                        module_list: ['mail'],
                        warning: 'admin',
                    },
                },
                async function (route) {
                    if (route === "/web/dataset/call_kw/res.users/search_count") {
                        return 7;
                    }
                }
            );
            Parent.template = xml`<ExpirationPanel/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());

            assert.strictEqual(parent.el.querySelector('.oe_instance_register').innerText,
                "This demo database will expire in 14 days. Register your subscription or buy a subscription.");

            assert.hasClass(parent.el, 'alert-warning',
                "Color should be orange");
            assert.containsOnce(parent.el, '.oe_instance_register_show',
                "Part 'Register your subscription'");
            assert.containsOnce(parent.el, '.oe_instance_buy',
                "Part 'buy a subscription'");
            assert.containsNone(parent.el, '.oe_instance_register_form',
                "There should be no registration form");

            // Click on 'buy subscription'
            await testUtils.dom.click(parent.el.querySelector('.oe_instance_buy'));

            parent.destroy();
            unpatchDate();
        });

        QUnit.test("Expiration Panel one app installed, try several times to register subscription", async function (assert) {
            assert.expect(49);

            const unpatchDate = patchDate(2019, 9, 10, 0, 0, 0);

            let callToGetParamCount = 0;

            class Parent extends Component { }
            Parent.components = { ExpirationPanel };
            Parent.env = makeTestEnvironment(
                {
                    services: {
                        setCookie: function () {
                            assert.step('setCookie');
                        },
                        unblockUI: function () {
                            assert.step('unblockUI');
                        },
                    },
                    session: {
                        expiration_date: '2019-10-15',
                        expiration_reason: 'trial',
                        module_list: ['mail'],
                        warning: 'admin',
                    },
                },
                async function (route, args) {
                    if (route === "/web/dataset/call_kw/ir.config_parameter/get_param") {
                        assert.step('get_param');
                        if (args.args[0] === 'database.already_linked_subscription_url') {
                            return;
                        }
                        if (args.args[0] === 'database.already_linked_email') {
                            return "super_company_admin@gmail.com";
                        }
                        assert.strictEqual(args.args[0], "database.expiration_date");
                        callToGetParamCount++;
                        if (callToGetParamCount <= 3) {
                            return '2019-10-15';
                        } else {
                            return '2019-11-15';
                        }
                    }
                    if (route === "/web/dataset/call_kw/ir.config_parameter/set_param") {
                        assert.step('set_param');
                        assert.strictEqual(args.args[0], "database.enterprise_code");
                        if (callToGetParamCount === 1) {
                            assert.strictEqual(args.args[1], "ABCDEF");
                        } else {
                            assert.strictEqual(args.args[1], "ABC");
                        }
                    }
                    if (route === "/web/dataset/call_kw/publisher_warranty.contract/update_notification") {
                        assert.step('update_notification');
                        assert.ok(args.args[0] instanceof Array && args.args[0].length === 0);
                    }
                }
            );
            Parent.template = xml`<ExpirationPanel/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());

            assert.strictEqual(parent.el.querySelector('.oe_instance_register').innerText,
                "This database will expire in 5 days. Register your subscription or buy a subscription.");

            assert.hasClass(parent.el, 'alert-danger',
                "Color should be red");

            assert.containsOnce(parent.el, '.oe_instance_register_show',
                "Part 'Register your subscription'");
            assert.containsOnce(parent.el, '.oe_instance_buy',
                "Part 'buy a subscription'");
            assert.containsNone(parent.el, '.oe_instance_register_form',
                "There should be no registration form");

            // Click on 'register your subscription'
            await testUtils.dom.click(parent.el.querySelector('.oe_instance_register_show'));

            assert.containsOnce(parent.el, '.oe_instance_register_form',
                "there should be a registration form");
            assert.containsOnce(parent.el, '.oe_instance_register_form input[placeholder="Paste code here"]',
                "with an input with place holder 'Paste code here'");
            assert.containsOnce(parent.el, '.oe_instance_register_form button',
                "and a button 'REGISTER'");
            assert.strictEqual(parent.el.querySelector('.oe_instance_register_form button').innerText, 'REGISTER');

            await testUtils.dom.click(parent.el.querySelector('.oe_instance_register_form button'));

            assert.containsOnce(parent.el, '.oe_instance_register_form',
                "there should be a registration form");
            assert.containsOnce(parent.el, '.oe_instance_register_form input[placeholder="Your subscription code"]',
                "with an input with place holder 'Paste code here'");
            assert.containsOnce(parent.el, '.oe_instance_register_form button',
                "and a button 'REGISTER'");

            await testUtils.fields.editInput(parent.el.querySelector('.oe_instance_register_form input'), "ABCDEF");
            await testUtils.dom.click(parent.el.querySelector('.oe_instance_register_form button'));

            assert.strictEqual(parent.el.querySelector('.oe_instance_register').innerText,
                "Something went wrong while registering your database. You can try again or contact Odoo Support.");
            assert.hasClass(parent.el, 'alert-danger',
                "Color should be red");
            assert.containsOnce(parent.el, 'span.oe_instance_error');
            assert.containsOnce(parent.el, '.oe_instance_register_form',
                "there should be a registration form");
            assert.containsOnce(parent.el, '.oe_instance_register_form input[placeholder="Your subscription code"]',
                "with an input with place holder 'Paste code here'");
            assert.containsOnce(parent.el, '.oe_instance_register_form button',
                "and a button 'REGISTER'");
            assert.strictEqual(parent.el.querySelector('.oe_instance_register_form button').innerText, 'RETRY');

            await testUtils.fields.editInput(parent.el.querySelector('.oe_instance_register_form input'), "ABC");
            await testUtils.dom.click(parent.el.querySelector('.oe_instance_register_form button'));

            assert.strictEqual(parent.el.querySelector('.oe_instance_register.oe_instance_success').innerText,
                "Thank you, your registration was successful! Your database is valid until November 15, 2019.");
            assert.hasClass(parent.el, 'alert-success',
                "Color should be green");
            assert.containsNone(parent.el, '.oe_instance_register_form button');

            assert.verifySteps([
                // second try to submit
                'get_param',
                'set_param',
                'get_param',
                'get_param',
                'setCookie',
                'update_notification',
                'get_param',
                'unblockUI',
                // third try
                'get_param',
                'set_param',
                'get_param',
                'get_param',
                'setCookie',
                'update_notification',
                'get_param',
                'unblockUI',
            ]);

            parent.destroy();
            unpatchDate();
        });

        QUnit.test("Expiration Panel one app installed, subscription already linked", async function (assert) {
            assert.expect(14);

            const unpatchDate = patchDate(2019, 9, 10, 0, 0, 0);
            // There are some line breaks mismatches between local and runbot test instances.
            // Since they don't affect the layout and we're only interested in the text itself,
            // we normalize whitespaces and line breaks from both the expected and end result
            const formatWhiteSpaces = text => text.split(/[\n\s]/).filter(w => w !== "").join(" ");

            let getExpirationDateCount = 0;

            class Parent extends Component { }
            Parent.components = { ExpirationPanel };
            Parent.env = makeTestEnvironment(
                {
                    services: {
                        ajaxJsonRPC: async function () {
                            return {
                                result: false,
                                reason: "By design",
                            };
                        },
                        setCookie: function () {
                            assert.step('setCookie');
                        },
                        unblockUI: function () {
                            assert.step('unblockUI');
                        },
                    },
                    session: {
                        expiration_date: '2019-10-15',
                        expiration_reason: 'trial',
                        module_list: ['mail'],
                        warning: 'admin',
                    },
                },
                async function (route, args, options) {
                    assert.step(args.method);
                    if (args.method !== 'get_param') {
                        return;
                    }
                    if (args.args[0] === 'database.expiration_date') {
                        getExpirationDateCount++;
                        if (getExpirationDateCount === 1) {
                            return '2019-10-15';
                        } else {
                            return '2019-11-17';
                        }
                    }
                    if (args.args[0] === 'database.already_linked_subscription_url') {
                        return "www.super_company.com";
                    }
                    if (args.args[0] === 'database.already_linked_send_mail_url') {
                        return "super_company_admin@gmail.com";
                    }
                    if (args.args[0] === 'database.already_linked_email') {
                        return "super_company_admin@gmail.com";
                    }
                }
            );
            Parent.template = xml`<ExpirationPanel/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());

            assert.strictEqual(parent.el.querySelector('.oe_instance_register').innerText,
                "This database will expire in 5 days. Register your subscription or buy a subscription.");

            // Click on 'register your subscription'
            await testUtils.dom.click(parent.el.querySelector('.oe_instance_register_show'));
            await testUtils.fields.editInput(parent.el.querySelector('.oe_instance_register_form input'), "ABC");
            await testUtils.dom.click(parent.el.querySelector('.oe_instance_register_form button'));

            assert.strictEqual(
                formatWhiteSpaces(parent.el.querySelector('.oe_instance_register.oe_database_already_linked').innerText),
                formatWhiteSpaces(
                    `Your subscription is already linked to a database.
                    To unlink it you can either:
                    - Login to your Odoo.com dashboard then unlink your previous database: www.super_company.com
                    - Click here to send an email to the subscription owner (email: super_company_admin@gmail.com) with the instructions to follow`
                )
            );

            await testUtils.dom.click(parent.el.querySelector('a.oe_contract_send_mail'));

            assert.hasClass(parent.el, 'alert-danger',
                "Color should be red");

            assert.strictEqual(
                formatWhiteSpaces(parent.el.querySelector('.oe_instance_register.oe_database_already_linked').innerText),
                formatWhiteSpaces(
                    `Your subscription is already linked to a database.
                    To unlink it you can either:
                    - Login to your Odoo.com dashboard then unlink your previous database: www.super_company.com
                    - Click here to send an email to the subscription owner (email: super_company_admin@gmail.com) with the instructions to follow
                    Unable to send the instructions by email, please contact the Odoo Support
                    Error reason: By design`
                )
            );

            assert.verifySteps([
                'get_param',
                'set_param',
                'get_param',
                'get_param',
                'setCookie',
                'update_notification',
                'get_param',
                'unblockUI',
                'get_param',
            ]);

            parent.destroy();
            unpatchDate();
        });


        QUnit.test("One app installed, database expired", async function (assert) {
            assert.expect(13);

            const unpatchDate = patchDate(2019, 9, 10, 0, 0, 0);

            let callToGetParamCount = 0;

            class Parent extends Component { }
            Parent.components = { ExpirationPanel };
            Parent.env = makeTestEnvironment(
                {
                    services: {
                        blockUI: function () {
                            assert.step('blockUI');
                        },
                        setCookie: function () {
                            assert.step('setCookie');
                            assert.strictEqual(arguments[0], "oe_instance_hide_panel");
                            assert.strictEqual(arguments[1], "");
                            assert.strictEqual(arguments[2], -1);
                        },
                        unblockUI: function () {
                            assert.step('unblockUI');
                        },
                    },
                    session: {
                        expiration_date: '2019-10-08',
                        expiration_reason: 'trial',
                        module_list: ['mail'],
                        warning: 'admin',
                    },
                },
                async function (route, args, options) {
                    if (args.method === 'get_param') {
                        if (args.args[0] === 'database.already_linked_subscription_url') {
                            return;
                        }
                        callToGetParamCount++;
                        if (callToGetParamCount === 1) {
                            return '2019-10-09';
                        } else {
                            return '2019-11-09';
                        }
                    }
                }
            );
            Parent.template = xml`<ExpirationPanel/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());

            assert.strictEqual(parent.el.querySelector('.oe_instance_register').innerText,
                "This database has expired. Register your subscription or buy a subscription.");

            assert.hasClass(parent.el, 'alert-danger',
                "Color should be red");
            assert.containsOnce(parent.el, '.oe_instance_register_show',
                "Part 'Register your subscription'");
            assert.containsOnce(parent.el, '.oe_instance_buy',
                "Part 'buy a subscription'");

            assert.containsNone(parent.el, '.oe_instance_register_form');

            // Click on 'Register your subscription'
            await testUtils.dom.click(parent.el.querySelector('.oe_instance_register_show'));
            await testUtils.fields.editInput(parent.el.querySelector('.oe_instance_register_form input'), "ABC");
            await testUtils.dom.click(parent.el.querySelector('.oe_instance_register_form button'));

            assert.strictEqual(parent.el.querySelector('.oe_instance_register').innerText,
                "Thank you, your registration was successful! Your database is valid until November 9, 2019.");

            assert.verifySteps(['blockUI', 'setCookie', 'unblockUI']);

            parent.destroy();
            unpatchDate();
        });

        QUnit.test("One app installed, renew with success", async function (assert) {
            assert.expect(15);

            const unpatchDate = patchDate(2019, 9, 10, 0, 0, 0);

            let callToGetParamCount = 0;

            class Parent extends Component { }
            Parent.components = { ExpirationPanel };
            Parent.env = makeTestEnvironment(
                {
                    services: {
                        setCookie: function () {
                            assert.step('setCookie');
                        },
                        unblockUI: function () {
                            assert.step('unblockUI');
                        },
                    },
                    session: {
                        expiration_date: '2019-10-20',
                        expiration_reason: 'renewal',
                        module_list: ['mail'],
                        warning: 'admin',
                    },
                },
                async function (route, args, options) {
                    if (args.method === 'get_param') {
                        assert.step('get_param');
                        callToGetParamCount++;
                        if (callToGetParamCount === 1) {
                            return '2019-10-20';
                        } else if (callToGetParamCount === 2) {
                            assert.strictEqual(args.args[0], 'database.expiration_date');
                            return '2019-11-09';
                        } else {
                            assert.strictEqual(args.args[0], 'database.enterprise_code');
                            return 'ABC';
                        }
                    }
                    if (args.method === 'update_notification') {
                        assert.step('update_notification');
                    }
                }
            );
            Parent.template = xml`<ExpirationPanel/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());

            assert.strictEqual(parent.el.querySelector('.oe_instance_register').innerText,
                "This database will expire in 10 days. Renew your subscription");

            assert.hasClass(parent.el, 'alert-warning',
                "Color should be red");
            assert.containsOnce(parent.el, '.oe_instance_renew',
                "Part 'Register your subscription'");
            assert.containsOnce(parent.el, 'a.check_enterprise_status',
                "there should be a button for status checking");

            assert.containsNone(parent.el, '.oe_instance_register_form');

            // Click on 'Renew your subscription'
            await testUtils.dom.click(parent.el.querySelector('.oe_instance_renew'));

            assert.strictEqual(parent.el.querySelector('.oe_instance_register.oe_instance_success').innerText,
                "Thank you, your registration was successful! Your database is valid until November 9, 2019.");

            assert.verifySteps(['get_param', 'setCookie', 'update_notification', 'get_param', 'get_param', 'unblockUI']);

            parent.destroy();
            unpatchDate();
        });

        QUnit.test("One app installed, check status and get success", async function (assert) {
            assert.expect(9);

            const unpatchDate = patchDate(2019, 9, 10, 0, 0, 0);

            let callToGetParamCount = 0;

            class Parent extends Component { }
            Parent.components = { ExpirationPanel };
            Parent.env = makeTestEnvironment(
                {
                    services: {
                        unblockUI: function () {
                            assert.step('unblockUI');
                        },
                    },
                    session: {
                        expiration_date: '2019-10-20',
                        expiration_reason: 'renewal',
                        module_list: ['mail'],
                        warning: 'admin',
                    },
                },
                async function (route, args, options) {
                    if (args.method === 'get_param') {
                        assert.step('get_param');
                        assert.strictEqual(args.args[0], 'database.expiration_date');
                        callToGetParamCount++;
                        if (callToGetParamCount === 1) {
                            return '2019-10-20';
                        } else {
                            return '2019-10-24';
                        }
                    }
                    if (args.method === 'update_notification') {
                        assert.step('update_notification');
                    }
                }
            );
            Parent.template = xml`<ExpirationPanel/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());

            // click on "Refresh subscription status"
            const refreshButton = parent.el.querySelector('a.check_enterprise_status');
            assert.strictEqual(refreshButton.getAttribute('aria-label'), "Refresh subscription status");
            await testUtils.dom.click(refreshButton);

            assert.strictEqual(parent.el.querySelector('.oe_instance_register.oe_subscription_updated').innerText,
                "Your subscription was updated and is valid until October 24, 2019.");

            assert.verifySteps(['get_param', 'update_notification', 'get_param', 'unblockUI']);

            parent.destroy();
            unpatchDate();
        });

        QUnit.test("One app installed, check status and get page reload", async function (assert) {
            assert.expect(5);

            const unpatchDate = patchDate(2019, 9, 10, 0, 0, 0);

            class Parent extends Component { }
            Parent.components = { ExpirationPanel };
            Parent.env = makeTestEnvironment(
                {
                    services: {
                        reloadPage: function () {
                            assert.step('reloadPage');
                        },
                    },
                    session: {
                        expiration_date: '2019-10-20',
                        expiration_reason: 'renewal',
                        module_list: ['mail'],
                        warning: 'admin',
                    },
                },
                async function (route, args, options) {
                    if (args.method === 'get_param') {
                        assert.step('get_param');
                        return '2019-10-20';
                    }
                    if (args.method === 'update_notification') {
                        assert.step('update_notification');
                    }
                }
            );
            Parent.template = xml`<ExpirationPanel/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());

            // click on "Refresh subscription status"
            await testUtils.dom.click(parent.el.querySelector('a.check_enterprise_status'));

            assert.verifySteps(['get_param', 'update_notification', 'get_param', 'reloadPage']);

            parent.destroy();
            unpatchDate();
        });

        QUnit.test("One app installed, upgrade database", async function (assert) {
            assert.expect(8);

            const unpatchDate = patchDate(2019, 9, 10, 0, 0, 0);

            class Parent extends Component { }
            Parent.components = { ExpirationPanel };
            Parent.env = makeTestEnvironment(
                {
                    services: {
                        navigate: function (url, params) {
                            assert.step('navigate');
                            assert.strictEqual(url, "https://www.odoo.com/odoo-enterprise/upsell");
                            assert.deepEqual(params, {
                                contract: "ABC",
                                num_users: 13,
                            });
                        }
                    },
                    session: {
                        expiration_date: '2019-10-20',
                        expiration_reason: 'upsell',
                        module_list: ['mail'],
                        warning: 'admin',
                    },
                },
                async function (route, args) {
                    if (args.method === 'get_param') {
                        assert.step('get_param');
                        assert.strictEqual(args.args[0], "database.enterprise_code");
                        return 'ABC';
                    }
                    if (args.method === 'search_count') {
                        assert.step('search_count');
                        return 13;
                    }
                }
            );
            Parent.template = xml`<ExpirationPanel/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());

            assert.strictEqual(parent.el.querySelector('.oe_instance_register').innerText,
                "This database will expire in 10 days. You have more users or more apps installed than your subscription allows.\n" +
                "Upgrade your subscription");

            // click on "Upgrade your subscription"
            await testUtils.dom.click(parent.el.querySelector('a.oe_instance_upsell'));

            assert.verifySteps(['get_param', 'search_count', 'navigate']);

            parent.destroy();
            unpatchDate();
        });

        QUnit.test("One app installed, message for non admin user", async function (assert) {
            assert.expect(2);

            const unpatchDate = patchDate(2019, 9, 10, 0, 0, 0);

            class Parent extends Component { }
            Parent.components = { ExpirationPanel };
            Parent.env = makeTestEnvironment({
                session: {
                    expiration_date: '2019-11-08',
                    expiration_reason: '',
                    module_list: ['mail'],
                    warning: 'user',
                },
            });
            Parent.template = xml`<ExpirationPanel/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());

            assert.strictEqual(parent.el.querySelector('.oe_instance_register').innerText,
                "This database will expire in 29 days. Log in as an administrator to correct the issue.");

            assert.hasClass(parent.el, 'alert-info',
                "Color should be grey");

            parent.destroy();
            unpatchDate();
        });
    });
});

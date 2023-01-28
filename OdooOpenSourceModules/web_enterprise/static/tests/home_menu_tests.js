odoo.define("web_enterprise.home_menu_tests", function (require) {
    "use strict";

    const HomeMenu = require("web_enterprise.HomeMenu");
    const makeTestEnvironment = require("web.test_env");
    const testUtils = require("web.test_utils");

    const { Component, hooks, tags } = owl;
    const { createComponent } = testUtils;
    const patchDate = testUtils.mock.patchDate;
    const { useRef, useState } = hooks;
    const { xml } = tags;

    async function walkOn(assert, homeMenu, path) {
        for (const step of path) {
            await testUtils.dom.triggerEvent(window, 'keydown', { key: step.key, shiftKey: step.shiftKey });
            assert.hasClass(homeMenu.el.querySelectorAll('.o_menuitem')[step.index], 'o_focused', `step ${step.number}`);
        }
    }

    QUnit.module("web_enterprise", {
        beforeEach: function () {
            this.props = {
                apps: [
                    { action: "121", id: 1, label: "Discuss", parents: "", webIcon: false, xmlid: "app.1" },
                    { action: "122", id: 2, label: "Calendar", parents: "", webIcon: false, xmlid: "app.2" },
                    { action: "123", id: 3, label: "Contacts", parents: "", webIcon: false, xmlid: "app.3" },
                ],
                menuItems: [
                    { action: "124", id: 4, label: "Contacts", menu_id: 4, parents: "Contacts",
                        webIcon: false, xmlid: "menu.4" },
                    { action: "125", id: 5, label: "Configuration", menu_id: 5, parents: "Contacts",
                        webIcon: false, xmlid: "menu.5" },
                    { action: "126", id: 6, label: "Contact Tags", menu_id: 6, parents: "Contacts / Configuration",
                        webIcon: false, xmlid: "menu.6" },
                    { action: "127", id: 7, label: "Contact Titles", menu_id: 7, parents: "Contacts / Configuration",
                        webIcon: false, xmlid: "menu.7" },
                    { action: "128", id: 8, label: "Localization", menu_id: 8, parents: "Contacts / Configuration",
                        webIcon: false, xmlid: "menu.8" },
                    { action: "129", id: 9, label: "Countries", menu_id: 9, parents: "Contacts / Configuration / Localization",
                        webIcon: false, xmlid: "menu.9" },
                    { action: "130", id: 10, label: "Fed. States", menu_id: 10, parents: "Contacts / Configuration / Localization",
                        webIcon: false, xmlid: "menu.10" },
                ],
            };
        }
    }, function () {
        QUnit.module("HomeMenu");

        QUnit.test("ESC Support", async function (assert) {
            assert.expect(12);

            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.state = useState({
                        homeMenuData,
                        homeMenuDisplayed: true,
                    });
                    this.homeMenuRef = useRef('home-menu');
                }
                // Handlers
                _onHideHomeMenu() {
                    this.state.homeMenuDisplayed = false;
                    assert.step('hide-home-menu');
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                session: {
                    warning: false,
                },
            });
            Parent.template = xml`
                <div>
                    <HomeMenu t-if="state.homeMenuDisplayed" t-ref="home-menu"
                        t-props="state.homeMenuData"
                        t-on-hide-home-menu="_onHideHomeMenu"
                    />
                </div>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());
            const homeMenu = parent.homeMenuRef.comp;

            assert.hasClass(homeMenu.el, "o_search_hidden",
                "search bar must be hidden by default");

            await testUtils.fields.editInput(homeMenu.inputRef.el, "dis");

            assert.containsOnce(homeMenu.el, '.o_menuitem.o_focused');
            assert.doesNotHaveClass(homeMenu.el, "o_search_hidden",
                "search must be visible after some input");

            assert.strictEqual(homeMenu.inputRef.el.value, "dis",
                "search bar input must contain the input text");

            await testUtils.dom.triggerEvent(window, 'keydown', { key: 'Escape' });
            assert.containsOnce(homeMenu.el, '.o_menuitem.o_focused');

            assert.strictEqual(homeMenu.inputRef.el.value, "",
                "search must have no text after ESC");

            assert.doesNotHaveClass(homeMenu.el, "o_search_hidden",
                "search must still become visible after clearing some non-empty text");

            await testUtils.dom.triggerEvent(window, 'keydown', { key: 'Escape' });

            assert.strictEqual(homeMenu.state.query, "",
                "");
            assert.strictEqual(homeMenu.state.isSearching, false,
                "");
            assert.containsNone(parent, '.o_home_menu',
                "home menu must be hidden after ESC on empty text");

            assert.verifySteps(['hide-home-menu']);

            parent.destroy();
        });

        QUnit.test("Navigation and search in the home menu", async function (assert) {
            assert.expect(9);

            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.state = useState({ homeMenuData });
                    this.homeMenuRef = useRef('home-menu');
                }
                // Handlers
                _onAppClicked(ev) {
                    assert.step('app-clicked');
                    assert.deepEqual(ev.detail, { action_id: "122", menu_id: 2 });
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                session: {
                    warning: false,
                },
            });
            Parent.template = xml`
                <HomeMenu t-ref="home-menu"
                    t-props="state.homeMenuData"
                    t-on-app-clicked="_onAppClicked"
                />`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());
            const homeMenu = parent.homeMenuRef.comp;

            const input = homeMenu.inputRef.el;
            await testUtils.dom.triggerEvent(input, 'focus');
            await testUtils.fields.editInput(input, "a");

            assert.hasClass(homeMenu.el.querySelectorAll('.o_menuitem')[0], 'o_focused');

            assert.doesNotHaveClass(homeMenu.el, "o_search_hidden",
                "search must be visible after some input");

            assert.strictEqual(input.value, "a",
                "search bar input must contain the input text");

            const path = [
                { number: 1, key: 'ArrowRight', index: 1 },
                { number: 2, key: 'Tab', index: 2 },
                { number: 3, key: 'ArrowUp', index: 0 },
            ];

            await walkOn(assert, homeMenu, path);

            // open first app (Calendar)
            await testUtils.dom.triggerEvent(window, 'keydown', { key: 'Enter' });

            assert.verifySteps(['app-clicked']);
            parent.destroy();
        });

        QUnit.test("Click on an app should trigger a custom event 'app-clicked'", async function (assert) {
            assert.expect(3);

            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.state = useState({ homeMenuData });
                    this.homeMenuRef = useRef('home-menu');
                }
                // Handlers
                _onAppClicked(ev) {
                    assert.step('app-clicked');
                    assert.deepEqual(ev.detail, { action_id: "121", menu_id: 1 });
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                session: {
                    warning: false,
                },
            });
            Parent.template = xml`
                <HomeMenu t-ref="home-menu"
                    t-props="state.homeMenuData"
                    t-on-app-clicked="_onAppClicked"
                />`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());
            const homeMenu = parent.homeMenuRef.comp;

            await testUtils.dom.click(homeMenu.el.querySelectorAll('.o_menuitem')[0]);
            assert.verifySteps(['app-clicked']);

            parent.destroy();
        });

        QUnit.test("Click on a menu item should trigger a custom event 'menu-clicked'", async function (assert) {
            assert.expect(3);

            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.state = useState({ homeMenuData });
                    this.homeMenuRef = useRef('home-menu');
                }
                // Handlers
                _onMenuClicked(ev) {
                    assert.step('menu-clicked');
                    assert.deepEqual(ev.detail, { action_id: "128", menu_id: 8 });
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                session: {
                    warning: false,
                },
            });
            Parent.template = xml`
                <HomeMenu t-ref="home-menu"
                    t-props="state.homeMenuData"
                    t-on-menu-clicked="_onMenuClicked"
                />`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());
            const homeMenu = parent.homeMenuRef.comp;

            const input = homeMenu.inputRef.el;
            input.focus();

            await testUtils.fields.editInput(input, "a");

            await testUtils.dom.click(homeMenu.el.querySelectorAll('.o_menuitem')[2]);
            assert.verifySteps(['menu-clicked']);

            parent.destroy();
        });

        QUnit.test("search displays matches in parents", async function (assert) {
            assert.expect(2);

            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.state = useState({ homeMenuData });
                    this.homeMenuRef = useRef('home-menu');
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                session: {
                    warning: false,
                },
            });
            Parent.template = xml`<HomeMenu t-ref="home-menu" t-props="state.homeMenuData"/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());
            const homeMenu = parent.homeMenuRef.comp;

            const input = homeMenu.inputRef.el;
            input.focus();

            assert.containsN(homeMenu.el, ".o_menuitem", 3);

            await testUtils.fields.editInput(input, "Conf");

            assert.containsN(homeMenu.el, ".o_menuitem", 6);

            parent.destroy();
        });

        QUnit.test("navigate to a non app item and open it", async function (assert) {
            assert.expect(6);
            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.state = useState({ homeMenuData });
                    this.homeMenuRef = useRef('home-menu');
                }
                // Handlers
                _onMenuClicked(ev) {
                    assert.step('menu-clicked');
                    assert.deepEqual(ev.detail, { action_id: "124", menu_id: 4 });
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                session: {
                    warning: false,
                },
            });
            Parent.template = xml`
                <HomeMenu t-ref="home-menu"
                    t-props="state.homeMenuData"
                    t-on-menu-clicked="_onMenuClicked"
                />`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());
            const homeMenu = parent.homeMenuRef.comp;

            const input = homeMenu.inputRef.el;
            input.focus();

            assert.containsN(homeMenu.el, ".o_menuitem", 3);

            await testUtils.fields.editInput(input, "Cont");

            assert.containsN(homeMenu.el, ".o_menuitem", 8);


            // go down
            await testUtils.dom.triggerEvent(window, 'keydown', { key: 'ArrowDown' });

            assert.hasClass(homeMenu.el.querySelectorAll('.o_menuitem')[1], 'o_focused');


            // press ENTER
            await testUtils.dom.triggerEvent(window, 'keydown', { key: 'Enter' });

            assert.verifySteps(['menu-clicked']);

            parent.destroy();
        });

        QUnit.test("Display Expiration Panel (no module installed)", async function (assert) {
            assert.expect(3);

            const unpatchDate = patchDate(2019, 9, 10, 0, 0, 0);

            let cookie = false;

            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.state = useState({ homeMenuData });
                    this.homeMenuRef = useRef('home-menu');
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                services: {
                    getCookie: function () {
                        return cookie;
                    },
                    setCookie: function () {
                        cookie = true;
                    }
                },
                session: {
                    expiration_date: '2019-11-01',
                    expiration_reason: "",
                    module_list: [],
                    warning: 'admin',
                },
            });
            Parent.template = xml`<HomeMenu t-ref="home-menu" t-props="state.homeMenuData"/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());
            const homeMenu = parent.homeMenuRef.comp;

            assert.containsOnce(homeMenu.el, '.database_expiration_panel');
            assert.strictEqual(homeMenu.el.querySelector('.database_expiration_panel .oe_instance_register').innerText,
                "You will be able to register your database once you have installed your first app.",
                "There should be an expiration panel displayed");

            // Close the expiration panel
            await testUtils.dom.click(homeMenu.el.querySelector(".database_expiration_panel .oe_instance_hide_panel"));
            assert.containsNone(homeMenu.el, '.database_expiration_panel');

            parent.destroy();
            unpatchDate();
        });

        QUnit.test("Navigation (only apps, only one line)", async function (assert) {
            assert.expect(9);

            this.props.apps = new Array(3).fill().map((x, i) => {
                return {
                    action: `12${i}`,
                    id: i + 1,
                    label: `0${i}`,
                    parents: "",
                    webIcon: false,
                    xmlid: `app.${i}`,
                };
            });
            this.props.menuItems = [];
            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.state = useState({ homeMenuData });
                    this.homeMenuRef = useRef('home-menu');
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                session: {
                    warning: false,
                },
            });
            Parent.template = xml`<HomeMenu t-ref="home-menu" t-props="state.homeMenuData"/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());
            const homeMenu = parent.homeMenuRef.comp;

            const input = homeMenu.inputRef.el;
            input.focus();
            await testUtils.nextTick();
            // we make possible full navigation (i.e. also TAB management)
            await testUtils.fields.editInput(input, "0");

            // begin with focus on first app
            assert.hasClass(homeMenu.el.querySelectorAll('.o_menuitem')[0], 'o_focused');

            const path = [
                { number: 1, key: 'ArrowRight', index: 1 },
                { number: 2, key: 'Tab', index: 2 },
                { number: 3, key: 'ArrowRight', index: 0 },
                { number: 4, key: 'Tab', shiftKey: true, index: 2 },
                // no movement input.selectionStart value is 1
                { number: 5, key: 'ArrowLeft', index: 2 },
                // stop and modify input.selectionStart
                { number: 6, key: 'ArrowLeft', index: 1 },
                { number: 7, key: 'ArrowDown', index: 1 },
                { number: 8, key: 'ArrowUp', index: 1 },
            ];

            await walkOn(assert, homeMenu, path.slice(0, 5));

            // allow movement to left
            input.setSelectionRange(0, 0);

            await walkOn(assert, homeMenu, path.slice(5));

            parent.destroy();
        });

        QUnit.test("Navigation (only apps, two line one incomplete)", async function (assert) {
            assert.expect(19);

            this.props.apps = new Array(8).fill().map((x, i) => {
                return {
                    action: "121",
                    id: i + 1,
                    label: `0${i}`,
                    parents: "",
                    webIcon: false,
                    xmlid: `app.${i}`,
                };
            });
            this.props.menuItems = [];
            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.state = useState({ homeMenuData });
                    this.homeMenuRef = useRef('home-menu');
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                session: {
                    warning: false,
                },
            });
            Parent.template = xml`<HomeMenu t-ref="home-menu" t-props="state.homeMenuData"/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());
            const homeMenu = parent.homeMenuRef.comp;

            const input = homeMenu.inputRef.el;
            input.focus();
            await testUtils.nextTick();
            // allow navigation (without TAB management)
            await testUtils.fields.editInput(input, "");

            // begin with focus on first app
            assert.hasClass(homeMenu.el.querySelectorAll('.o_menuitem')[0], 'o_focused');

            const path = [
                { number: 1, key: 'ArrowUp', index: 6 },
                { number: 2, key: 'ArrowUp', index: 0 },
                { number: 3, key: 'ArrowDown', index: 6 },
                { number: 4, key: 'ArrowDown', index: 0 },
                { number: 5, key: 'ArrowRight', index: 1 },
                { number: 6, key: 'ArrowRight', index: 2 },
                { number: 7, key: 'ArrowUp', index: 7 },
                { number: 8, key: 'ArrowUp', index: 1 },
                { number: 9, key: 'ArrowRight', index: 2 },
                { number: 10, key: 'ArrowDown', index: 7 },
                { number: 11, key: 'ArrowDown', index: 1 },
                { number: 12, key: 'ArrowUp', index: 7 },
                { number: 13, key: 'ArrowRight', index: 6 },
                { number: 14, key: 'ArrowLeft', index: 7 },
                { number: 15, key: 'ArrowUp', index: 1 },
                { number: 16, key: 'ArrowLeft', index: 0 },
                { number: 17, key: 'ArrowLeft', index: 5 },
                { number: 18, key: 'ArrowRight', index: 0 },
            ];

            await walkOn(assert, homeMenu, path);

            parent.destroy();
        });

        QUnit.test("Navigation (only apps, two line one incomplete, no searchbar)", async function (assert) {
            assert.expect(19);

            this.props.apps = new Array(8).fill().map((x, i) => {
                return {
                    action: "121",
                    id: i + 1,
                    label: `0${i}`,
                    parents: "",
                    webIcon: false,
                    xmlid: `app.${i}`,
                };
            });
            this.props.menuItems = [];
            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.state = useState({ homeMenuData });
                    this.homeMenuRef = useRef('home-menu');
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                session: {
                    warning: false,
                },
            });
            Parent.template = xml`<HomeMenu t-ref="home-menu" t-props="state.homeMenuData"/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());
            const homeMenu = parent.homeMenuRef.comp;

            async function walkOnButCheckFocus(path) {
                for (let i = 0; i < path.length; i++) {
                    const step = path[i];
                    await testUtils.dom.triggerEvent(window, 'keydown', { key: step.key, shiftKey: step.shiftKey });
                    assert.ok(homeMenu.el.querySelectorAll('.o_menuitem')[step.index] === document.activeElement,
                        `step ${i + 1}`);
                }
            }

            const path = [
                { number: 1, key: 'ArrowRight', index: 0 },
                { number: 2, key: 'ArrowUp', index: 6 },
                { number: 3, key: 'ArrowUp', index: 0 },
                { number: 4, key: 'ArrowDown', index: 6 },
                { number: 5, key: 'ArrowDown', index: 0 },
                { number: 6, key: 'ArrowRight', index: 1 },
                { number: 7, key: 'ArrowRight', index: 2 },
                { number: 8, key: 'ArrowUp', index: 7 },
                { number: 9, key: 'ArrowUp', index: 1 },
                { number: 10, key: 'ArrowRight', index: 2 },
                { number: 11, key: 'ArrowDown', index: 7 },
                { number: 12, key: 'ArrowDown', index: 1 },
                { number: 13, key: 'ArrowUp', index: 7 },
                { number: 14, key: 'ArrowRight', index: 6 },
                { number: 15, key: 'ArrowLeft', index: 7 },
                { number: 16, key: 'ArrowUp', index: 1 },
                { number: 17, key: 'ArrowLeft', index: 0 },
                { number: 18, key: 'ArrowLeft', index: 5 },
                { number: 19, key: 'ArrowRight', index: 0 },
            ];

            await walkOnButCheckFocus(path);

            parent.destroy();
        });

        QUnit.test("Navigation (only 3 menuItems)", async function (assert) {
            assert.expect(10);

            this.props.apps = [];
            this.props.menuItems = new Array(3).fill().map((x, i) => {
                return {
                    action: `12${i}`,
                    id: i + 1,
                    label: `0${i}`,
                    menu_id: i,
                    parents: "0",
                    webIcon: false,
                    xmlid: `menu_${i}`,
                };
            });
            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.state = useState({ homeMenuData });
                    this.homeMenuRef = useRef('home-menu');
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                session: {
                    warning: false,
                },
            });
            Parent.template = xml`<HomeMenu t-ref="home-menu" t-props="state.homeMenuData"/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());
            const homeMenu = parent.homeMenuRef.comp;

            const input = homeMenu.inputRef.el;
            input.focus();
            await testUtils.nextTick();
            // allow navigation (without TAB management)
            await testUtils.fields.editInput(input, "0");

            // begin with focus on first app
            assert.hasClass(homeMenu.el.querySelectorAll('.o_menuitem')[0], 'o_focused');

            const path = [
                { number: 1, key: 'ArrowUp', index: 2 },
                { number: 2, key: 'ArrowUp', index: 1 },
                { number: 3, key: 'ArrowUp', index: 0 },
                { number: 4, key: 'ArrowDown', index: 1 },
                { number: 5, key: 'ArrowDown', index: 2 },
                { number: 6, key: 'ArrowDown', index: 0 },
                { number: 7, key: 'ArrowRight', index: 0 },
                // no movement here because of input.selectionStart value
                { number: 8, key: 'ArrowLeft', index: 0 },
                // no movement here because the item is the only one on its line
                { number: 9, key: 'ArrowLeft', index: 0 },
            ];

            await walkOn(assert, homeMenu, path.slice(0, 8));
            // modify position of 'cursor' in query to allow movement to the left
            input.setSelectionRange(0, 0);

            await walkOn(assert, homeMenu, path.slice(8));

            parent.destroy();
        });

        QUnit.test("Navigation (one line of 3 apps and 2 menuItems)", async function (assert) {
            assert.expect(13);

            this.props.apps = new Array(3).fill().map((x, i) => {
                return {
                    action: `12${i}`,
                    id: i + 1,
                    label: `0${i}`,
                    parents: "",
                    webIcon: false,
                    xmlid: `app.${i}`,
                };
            });
            this.props.menuItems = new Array(2).fill().map((x, i) => {
                return {
                    action: `12${i}`,
                    id: i + 3,
                    label: `0${i}`,
                    menu_id: i,
                    parents: "",
                    webIcon: false,
                    xmlid: `menu_${i}`,
                };
            });
            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.state = useState({ homeMenuData });
                    this.homeMenuRef = useRef('home-menu');
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                session: {
                    warning: false,
                },
            });
            Parent.template = xml`<HomeMenu t-ref="home-menu" t-props="state.homeMenuData"/>`;

            const parent = new Parent();
            await parent.mount(testUtils.prepareTarget());
            const homeMenu = parent.homeMenuRef.comp;

            const input = homeMenu.inputRef.el;
            input.focus();
            await testUtils.nextTick();
            // allow navigation (without TAB management)
            await testUtils.fields.editInput(input, "0");

            // begin with focus on first app
            assert.hasClass(homeMenu.el.querySelectorAll('.o_menuitem')[0], 'o_focused');

            const path = [
                { number: 1, key: 'ArrowRight', index: 1 },
                { number: 2, key: 'ArrowRight', index: 2 },
                { number: 3, key: 'ArrowRight', index: 0 },
                { number: 4, key: 'ArrowDown', index: 3 },
                { number: 5, key: 'ArrowDown', index: 4 },
                { number: 6, key: 'ArrowDown', index: 0 },
                { number: 7, key: 'ArrowRight', index: 1 },
                { number: 8, key: 'ArrowUp', index: 4 },
                { number: 9, key: 'ArrowUp', index: 3 },
                { number: 10, key: 'ArrowUp', index: 0 },
                // no movement here because of input.selectionStart value
                { number: 11, key: 'ArrowLeft', index: 0 },
                { number: 12, key: 'ArrowLeft', index: 2 },
            ];

            await walkOn(assert, homeMenu, path.slice(0, 11));
            // modify position of 'cursor' in query to allow movement to the left
            input.setSelectionRange(0, 0);

            await walkOn(assert, homeMenu, path.slice(11));

            parent.destroy();
        });

        QUnit.test("State reset", async function (assert) {
            assert.expect(7);

            const homeMenuData = this.props;
            class Parent extends Component {
                constructor() {
                    super();
                    this.homeMenuData = homeMenuData;
                    this.homeMenuRef = useRef('home-menu');
                }
            }
            Parent.components = { HomeMenu };
            Parent.env = makeTestEnvironment({
                session: {
                    warning: false,
                },
            });
            Parent.template = xml`<HomeMenu t-ref="home-menu" t-props="homeMenuData"/>`;

            const parent = new Parent();
            const target = testUtils.prepareTarget();
            await parent.mount(target);

            assert.hasClass(parent.homeMenuRef.el, "o_search_hidden",
                "search bar must be hidden by default");

            await testUtils.fields.editInput(parent.homeMenuRef.comp.inputRef.el, "dis");

            assert.doesNotHaveClass(parent.homeMenuRef.el, "o_search_hidden",
                "search must be visible after some input");
            assert.strictEqual(parent.homeMenuRef.comp.inputRef.el.value, "dis",
                "search bar input must contain the input text");

            /**
             * Unmount and remount the home menu. Normally we would use conditionnal
             * rendering and let Owl do all the work, but since the webclient is
             * not converted yet we simulate the actual behaviour of the home menu
             * toggling (manually unmount/mount the parent).
             * @see web_enterprise.WebClient.toggleHomeMenu()
             * @todo change assertions when the webclient is converted
             */
            parent.unmount();
            await testUtils.nextTick();

            assert.containsNone(target, 'o_home_menu',
                "home menu should no longer be displayed");

            await parent.mount(target);

            assert.hasClass(parent.homeMenuRef.el, "o_search_hidden",
                "search bar is hidden after remount");
            assert.strictEqual(parent.homeMenuRef.comp.inputRef.el.value, "",
                "search bar input must be empty");

            await testUtils.fields.editInput(parent.homeMenuRef.comp.inputRef.el, "dis");

            assert.strictEqual(parent.homeMenuRef.comp.inputRef.el.value, "dis",
                "search bar input must contain the input text");

            parent.destroy();
        });

        QUnit.test("Scroll bar padding", async function (assert) {
            assert.expect(3);

            const target = testUtils.prepareTarget();
            target.style.height = "300px";

            const homeMenu = await createComponent(HomeMenu, { props: this.props });
            const scrollable = $(".o_home_menu_scrollable")[0];
            const input = $(".o_menu_search_input")[0];

            function getPaddingLeft() {
                return Number(scrollable.style.paddingLeft.split("px")[0]);
            }

            assert.strictEqual(getPaddingLeft(), 0);

            await testUtils.dom.triggerEvent(input, "focus");
            await testUtils.fields.editInput(input, "a");

            assert.ok(getPaddingLeft() > 0); // Browser dependant

            await testUtils.dom.triggerEvent(window, 'keydown', { key: 'Escape' });

            assert.strictEqual(getPaddingLeft(), 0);

            homeMenu.destroy();
        });
    });
});

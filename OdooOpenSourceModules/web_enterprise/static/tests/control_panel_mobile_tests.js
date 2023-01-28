odoo.define('web.control_panel_mobile_tests', function (require) {
    "use strict";

    const FormView = require('web.FormView');
    const testUtils = require('web.test_utils');

    const cpHelpers = testUtils.controlPanel;
    const { createActionManager, createControlPanel, createView } = testUtils;

    QUnit.module('Control Panel', {
        beforeEach: function () {
            this.actions = [{
                id: 1,
                name: "Yes",
                res_model: 'partner',
                type: 'ir.actions.act_window',
                views: [[false, 'list']],
            }];
            this.archs = {
                'partner,false,list': '<tree><field name="foo"/></tree>',
                'partner,false,search': `
                    <search>
                        <filter string="Active" name="my_projects" domain="[('boolean_field', '=', True)]"/>
                        <field name="foo" string="Foo"/>
                    </search>`,
            };
            this.data = {
                partner: {
                    fields: {
                        foo: { string: "Foo", type: "char" },
                        boolean_field: { string: "I am a boolean", type: "boolean" },
                    },
                    records: [
                        { id: 1, display_name: "First record", foo: "yop" },
                    ],
                },
            };
        },
    }, function () {

        QUnit.test('basic rendering', async function (assert) {
            assert.expect(2);

            const actionManager = await createActionManager({
                actions: this.actions,
                archs: this.archs,
                data: this.data,
            });
            await actionManager.doAction(1);

            assert.containsNone(document.body, '.o_control_panel .o_mobile_search',
                "search options are hidden by default");
            assert.containsOnce(actionManager, '.o_control_panel .o_enable_searchview',
                "should display a button to toggle the searchview");

            actionManager.destroy();
        });

        QUnit.test("control panel appears at top on scroll event", async function (assert) {
            assert.expect(12);

            const MAX_HEIGHT = 800;
            const MIDDLE_HEIGHT = 400;
            const DELTA_TEST = 20;
            const viewPort = testUtils.prepareTarget();

            const form = await createView({
                View: FormView,
                arch:
                    '<form>' +
                        '<sheet>' +
                            '<div style="height: 1000px"></div>' +
                        '</sheet>' +
                    '</form>',
                data: this.data,
                model: 'partner',
                res_id: 1,
            });

            const controlPanelEl = document.querySelector('.o_control_panel');
            const controlPanelHeight = controlPanelEl.getBoundingClientRect().height;

            // Force viewport to have a scrollbar
            viewPort.style.position = 'initial';

            async function scrollAndAssert(targetHeight, expectedTopValue, hasStickyClass) {
                if (targetHeight !== null) {
                    window.scrollTo(0, targetHeight);
                    await testUtils.nextTick();
                }
                const expectedPixelValue = `${expectedTopValue}px`;
                assert.strictEqual(controlPanelEl.style.top, expectedPixelValue,
                    `Top must be ${expectedPixelValue} (after scroll to ${targetHeight})`);

                if (hasStickyClass) {
                    assert.hasClass(controlPanelEl, 'o_mobile_sticky');
                } else {
                    assert.doesNotHaveClass(controlPanelEl, 'o_mobile_sticky');
                }
            }

            // Initial position (scrollTop: 0)
            await scrollAndAssert(null, 0, false);

            // Scroll down 400px (scrollTop: 400)
            await scrollAndAssert(MAX_HEIGHT, -controlPanelHeight, true);

            // Scoll up 20px (scrollTop: 380)
            await scrollAndAssert(MAX_HEIGHT - DELTA_TEST, -(controlPanelHeight - DELTA_TEST), true);

            // Scroll up 180px (scrollTop: 200)
            await scrollAndAssert(MIDDLE_HEIGHT, 0, true);

            // Scroll down 200px (scrollTop: 400)
            await scrollAndAssert(MAX_HEIGHT, -controlPanelHeight, true);

            // Scroll up 400px (scrollTop: 0)
            await scrollAndAssert(0, -controlPanelHeight, false);

            form.destroy();
            viewPort.style.position = '';
        });

        QUnit.test("mobile search: basic display", async function (assert) {
            assert.expect(4);

            const fields = {
                birthday: { string: "Birthday", type: "date", store: true, sortable: true },
            };
            const searchMenuTypes = ["filter", "groupBy", "comparison", "favorite"];
            const params = {
                cpModelConfig: {
                    arch: `
                        <search>
                            <filter name="birthday" date="birthday"/>
                        </search>`,
                    fields,
                    searchMenuTypes,
                },
                cpProps: { fields, searchMenuTypes },
            };
            const controlPanel = await createControlPanel(params);

            // Toggle search bar controls
            await testUtils.dom.click(controlPanel.el.querySelector("button.o_enable_searchview"));
            // Open search view
            await testUtils.dom.click(controlPanel.el.querySelector("button.o_toggle_searchview_full"));

            // Toggle filter date
            // Note: 'document.body' is used instead of 'controlPanel' because the
            // search view is directly in the body.
            await cpHelpers.toggleFilterMenu(document);
            await cpHelpers.toggleMenuItem(document, "Birthday");
            await cpHelpers.toggleMenuItemOption(document, "Birthday", 0);

            assert.containsOnce(document.body, ".o_filter_menu");
            assert.containsOnce(document.body, ".o_group_by_menu");
            assert.containsOnce(document.body, ".o_comparison_menu");
            assert.containsOnce(document.body, ".o_favorite_menu");

            controlPanel.destroy();
        });

        QUnit.test('mobile search: activate a filter through quick search', async function (assert) {
            assert.expect(7);

            let searchRPCFlag = false;

            const actionManager = await createActionManager({
                actions: this.actions,
                archs: this.archs,
                data: this.data,
                mockRPC: function (route, args) {
                    if (searchRPCFlag) {
                        assert.deepEqual(args.domain, [['foo', 'ilike', 'A']],
                            "domain should have been properly transferred to list view");
                    }
                    return this._super.apply(this, arguments);
                },
            });

            await actionManager.doAction(1);

            assert.containsOnce(document.body, 'button.o_enable_searchview.fa-search',
                "should display a button to open the searchview");
            assert.containsNone(document.body, '.o_searchview_input_container',
                "Quick search input should be hidden");

            // open the search view
            await testUtils.dom.click(document.querySelector('button.o_enable_searchview'));

            assert.containsOnce(document.body, '.o_toggle_searchview_full',
                "should display a button to expand the searchview");
            assert.containsOnce(document.body, '.o_searchview_input_container',
                "Quick search input should now be visible");

            searchRPCFlag = true;

            // use quick search input (search view is directly put in the body)
            await cpHelpers.editSearch(document.body, "A");
            await cpHelpers.validateSearch(document.body);

            // close quick search
            await testUtils.dom.click(document.querySelector('button.o_enable_searchview.fa-arrow-left'));

            assert.containsNone(document.body, '.o_toggle_searchview_full',
                "Expand icon shoud be hidden");
            assert.containsNone(document.body, '.o_searchview_input_container',
                "Quick search input should be hidden");

            actionManager.destroy();
        });

        QUnit.test('mobile search: activate a filter in full screen search view', async function (assert) {
            assert.expect(3);

            const actionManager = await createActionManager({
                actions: this.actions,
                archs: this.archs,
                data: this.data,
            });

            await actionManager.doAction(1);

            assert.containsNone(document.body, '.o_mobile_search');

            // open the search view
            await testUtils.dom.click(actionManager.el.querySelector('button.o_enable_searchview'));
            // open it in full screen
            await testUtils.dom.click(actionManager.el.querySelector('.o_toggle_searchview_full'));

            assert.containsOnce(document.body, '.o_mobile_search');

            await cpHelpers.toggleFilterMenu(document.body);
            await cpHelpers.toggleMenuItem(document.body, "Active");

            // closing search view
            await testUtils.dom.click(
                [...document.querySelectorAll('.o_mobile_search_button')].find(
                    e => e.innerText.trim() === "FILTER"
                )
            );
            assert.containsNone(document.body, '.o_mobile_search');

            actionManager.destroy();
        });
    });
});

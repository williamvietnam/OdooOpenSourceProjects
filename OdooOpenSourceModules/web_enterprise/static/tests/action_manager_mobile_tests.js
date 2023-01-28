odoo.define('web.action_manager_mobile_tests', function (require) {
    "use strict";

    const ActionManager = require('web.ActionManager');
    const testUtils = require('web.test_utils');

    const createActionManager = testUtils.createActionManager;

    QUnit.module('ActionManager', {
        beforeEach: function () {
            this.actions = [{
                id: 1,
                name: 'Partners Action 1',
                res_model: 'partner',
                type: 'ir.actions.act_window',
                views: [[false, 'list'], [false, 'kanban'], [false, 'form']],
            }, {
                id: 2,
                name: 'Partners Action 2',
                res_model: 'partner',
                type: 'ir.actions.act_window',
                views: [[false, 'list'], [false, 'form']],
            }];
            this.archs = {
                'partner,false,kanban': `
                    <kanban>
                        <templates>
                            <t t-name="kanban-box">
                                <div class="oe_kanban_global_click">
                                    <field name="foo"/>
                                </div>
                            </t>
                        </templates>
                    </kanban>`,
                'partner,false,list': '<tree><field name="foo"/></tree>',
                'partner,false,form':
                    `<form>
                        <group>
                            <field name="display_name"/>
                        </group>
                    </form>`,
                'partner,false,search': '<search><field name="foo" string="Foo"/></search>',
            };
            this.data = {
                partner: {
                    fields: {
                        foo: { string: "Foo", type: "char" },
                    },
                    records: [
                        { id: 1, display_name: "First record", foo: "yop" },
                    ],
                },
            };
        },
    }, function () {
        QUnit.test('uses a mobile-friendly view by default (if possible)', async function (assert) {
            assert.expect(4);

            const actionManager = await createActionManager({
                actions: this.actions,
                archs: this.archs,
                data: this.data,
            });

            // should default on a mobile-friendly view (kanban) for action 1
            await actionManager.doAction(1);

            assert.containsNone(actionManager, '.o_list_view');
            assert.containsOnce(actionManager, '.o_kanban_view');

            // there is no mobile-friendly view for action 2, should use the first one (list)
            await actionManager.doAction(2);

            assert.containsOnce(actionManager, '.o_list_view');
            assert.containsNone(actionManager, '.o_kanban_view');

            actionManager.destroy();
        });

        QUnit.test('lazy load mobile-friendly view', async function (assert) {
            assert.expect(11);

            const actionManager = await createActionManager({
                actions: this.actions,
                archs: this.archs,
                data: this.data,
                mockRPC: function (route, args) {
                    assert.step(args.method || route);
                    return this._super.apply(this, arguments);
                },
            });
            await actionManager.loadState({
                action: 1,
                view_type: 'form',
            });

            assert.containsNone(actionManager, '.o_list_view');
            assert.containsNone(actionManager, '.o_kanban_view');
            assert.containsOnce(actionManager, '.o_form_view');

            // go back to lazy loaded view
            await testUtils.dom.click(actionManager.$('.o_control_panel .breadcrumb .breadcrumb-item:first'));
            assert.containsNone(actionManager, '.o_form_view');
            assert.containsNone(actionManager, '.o_list_view');
            assert.containsOnce(actionManager, '.o_kanban_view');

            assert.verifySteps([
                '/web/action/load',
                'load_views',
                'onchange', // default_get/onchange to open form view
                '/web/dataset/search_read', // search read when coming back to Kanban
            ]);

            actionManager.destroy();
        });

        QUnit.test('view switcher button should be displayed in dropdown on mobile screens', async function (assert) {
            assert.expect(7);

            const actionManager = await createActionManager({
                actions: this.actions,
                archs: this.archs,
                data: this.data,
            });

            await actionManager.doAction(1);

            assert.containsOnce(actionManager.el.querySelector('.o_control_panel'), '.o_cp_switch_buttons > button');
            assert.containsNone(actionManager.el.querySelector('.o_control_panel'), '.o_cp_switch_buttons .o_switch_view.o_kanban');
            assert.containsNone(actionManager.el.querySelector('.o_control_panel'), '.o_cp_switch_buttons button.o_switch_view');

            assert.hasClass(actionManager.el.querySelector('.o_control_panel .o_cp_switch_buttons > button > span'), 'fa-th-large');
            await testUtils.dom.click(actionManager.el.querySelector('.o_control_panel .o_cp_switch_buttons > button'));

            assert.hasClass(actionManager.el.querySelector('.o_cp_switch_buttons button.o_switch_view.o_kanban'), 'active');
            assert.doesNotHaveClass(actionManager.el.querySelector('.o_cp_switch_buttons button.o_switch_view.o_list'), 'active');
            assert.hasClass(actionManager.el.querySelector('.o_cp_switch_buttons button.o_switch_view.o_kanban'), 'fa-th-large');

            actionManager.destroy();
        });

        QUnit.test('data-mobile attribute on action button, in mobile', async function (assert) {
            assert.expect(2);

            testUtils.mock.patch(ActionManager, {
                doAction(action, options) {
                    if (typeof action !== 'number' && action.id === 1) {
                        assert.strictEqual(options.plop, 28);
                    } else {
                        assert.strictEqual(options.plop, undefined);
                    }
                    return this._super(...arguments);
                },
            });

            this.archs['partner,75,kanban'] = `
                <kanban>
                    <templates>
                        <t t-name="kanban-box">
                            <div class="oe_kanban_global_click">
                                <field name="display_name"/>
                                <button
                                    name="1"
                                    string="Execute action"
                                    type="action"
                                    data-mobile='{"plop": 28}'/>
                            </div>
                        </t>
                    </templates>
                </kanban>`;

            this.actions.push({
                id: 100,
                name: 'action 100',
                res_model: 'partner',
                type: 'ir.actions.act_window',
                views: [[75, 'kanban']],
            });

            const actionManager = await createActionManager({
                actions: this.actions,
                archs: this.archs,
                data: this.data
            });

            await actionManager.doAction(100, {});
            await testUtils.dom.click(actionManager.$('button[data-mobile]:first'));

            actionManager.destroy();
            testUtils.mock.unpatch(ActionManager);
        });
    });
});

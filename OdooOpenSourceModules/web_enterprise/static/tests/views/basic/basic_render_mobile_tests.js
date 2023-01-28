odoo.define('web_enterprise.BasicRenderMobileTests', function (require) {
"use strict";

const BasicRenderer = require('web.BasicRenderer');
const FormView = require('web.FormView');
const testUtils = require('web.test_utils');

const createView = testUtils.createView;

QUnit.module('web_enterprise > basic > basic_render_mobile', {
    beforeEach: function () {
        this.data = {
            partner: {
                fields: {
                    display_name: {string: "Displayed name", type: "char", help: 'The name displayed'},
                },
                records: [
                    {
                        id: 1,
                        display_name: "first record",
                    },
                ],
            },
        };
    }
}, function () {
    QUnit.module('Basic Render Mobile');

    QUnit.test(`field tooltip shouldn't remain displayed in mobile`, async function (assert) {
        assert.expect(2);

        testUtils.mock.patch(BasicRenderer, {
            SHOW_AFTER_DELAY: 0,
            _getTooltipOptions: function () {
                return Object.assign({}, this._super(...arguments), {
                    animation: false,
                });
            },
        });

        const form = await createView({
            View: FormView,
            model: 'partner',
            data: this.data,
            arch: `
                <form>
                    <sheet>
                        <group>                    
                            <field name="display_name"/>
                        </group>
                    </sheet>
                </form>
            `,
        });

        const label = form.el.querySelector('label.o_form_label');
        await testUtils.dom.triggerEvent(label, 'touchstart');
        assert.strictEqual(
            document.querySelectorAll('.tooltip .oe_tooltip_string').length,
            1, "should have a tooltip displayed"
        );
        await testUtils.dom.triggerEvent(label, 'touchend');
        assert.strictEqual(
            document.querySelectorAll('.tooltip .oe_tooltip_string').length,
            0, "shouldn't have a tooltip displayed"
        );
        form.destroy();

        testUtils.mock.unpatch(BasicRenderer);
    });

});
});

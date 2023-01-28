odoo.define('web_enterprise.list_mobile_tests', function (require) {
    "use strict";

    const ListView = require('web.ListView');
    const testUtils = require('web.test_utils');

    const { createView } = testUtils;

    QUnit.module("Views", {
        beforeEach() {
            this.data = {
                foo: {
                    fields: {
                        foo: { string: "Foo", type: "char" },
                        bar: { string: "Bar", type: "boolean" },
                    },
                    records: [
                        { id: 1, bar: true, foo: "yop" },
                        { id: 2, bar: true, foo: "blip" },
                        { id: 3, bar: true, foo: "gnap" },
                        { id: 4, bar: false, foo: "blip" },
                    ],
                },
            };
        }
    }, function () {

        QUnit.module("ListView Mobile");

        QUnit.test("selection box is properly displayed (single page)", async function (assert) {
            assert.expect(13);

            const list = await createView({
                arch: `
                    <tree>
                        <field name="foo"/>
                        <field name="bar"/>
                    </tree>`,
                data: this.data,
                model: 'foo',
                View: ListView,
            });

            assert.containsN(list, '.o_data_row', 4);
            assert.containsNone(list, '.o_list_selection_box');
            assert.containsNone(list, '.o_list_view.o_renderer_selection_banner');

            // select a record
            await testUtils.dom.click(list.$('.o_data_row:first .o_list_record_selector input'));

            assert.containsOnce(list, '.o_list_view.o_renderer_selection_banner');
            assert.containsOnce(list, '.o_list_selection_box');
            assert.containsNone(list.$('.o_list_selection_box'), '.o_list_select_domain');
            assert.strictEqual(list.$('.o_list_selection_box').text().trim(),
                "1 selected");

            // select all records of first page
            await testUtils.dom.click(list.$('thead .o_list_record_selector input'));

            assert.containsOnce(list, '.o_list_selection_box');
            assert.containsNone(list.$('.o_list_selection_box'), '.o_list_select_domain');
            assert.strictEqual(list.$('.o_list_selection_box').text().trim(),
                "4 selected");

            // unselect a record
            await testUtils.dom.click(list.$('.o_data_row:nth(1) .o_list_record_selector input'));

            assert.containsOnce(list, '.o_list_selection_box');
            assert.containsNone(list.$('.o_list_selection_box'), '.o_list_select_domain');
            assert.strictEqual(list.$('.o_list_selection_box').text().trim(),
                "3 selected");

            list.destroy();
        });

        QUnit.test("selection box is properly displayed (multi pages)", async function (assert) {
            assert.expect(10);

            const list = await createView({
                arch: `
                    <tree limit="3">
                        <field name="foo"/>
                        <field name="bar"/>
                    </tree>`,
                data: this.data,
                model: 'foo',
                View: ListView,
            });

            assert.containsN(list, '.o_data_row', 3);
            assert.containsNone(list, '.o_list_selection_box');

            // select a record
            await testUtils.dom.click(list.$('.o_data_row:first .o_list_record_selector input'));

            assert.containsOnce(list, '.o_list_selection_box');
            assert.containsNone(list.$('.o_list_selection_box'), '.o_list_select_domain');
            assert.strictEqual(list.$('.o_list_selection_box').text().trim(),
                "1 selected");

            // select all records of first page
            await testUtils.dom.click(list.$('thead .o_list_record_selector input'));

            assert.containsOnce(list, '.o_list_selection_box');
            assert.containsOnce(list.$('.o_list_selection_box'), '.o_list_select_domain');
            assert.strictEqual(list.$('.o_list_selection_box').text().replace(/\s+/g, ' ').trim(),
                "3 selected Select all 4");

            // select all domain
            await testUtils.dom.click(list.$('.o_list_selection_box .o_list_select_domain'));

            assert.containsOnce(list, '.o_list_selection_box');
            assert.strictEqual(list.$('.o_list_selection_box').text().trim(),
                "All 4 selected");

            list.destroy();
        });

        QUnit.test("export button is properly hidden", async function (assert) {
            assert.expect(2);

            const list = await createView({
                arch: `
                    <tree>
                        <field name="foo"/>
                        <field name="bar"/>
                    </tree>`,
                data: this.data,
                model: 'foo',
                View: ListView,
                session: {
                    async user_has_group(group) {
                        if (group === 'base.group_allow_export') {
                            return true;
                        }
                        return this._super(...arguments);
                    },
                },
            });

            assert.containsN(list, '.o_data_row', 4);
            assert.isNotVisible(list.$buttons.find('.o_list_export_xlsx'));

            list.destroy();
        });
    });
});

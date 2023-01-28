odoo.define('web_enterprise.kanban_mobile_tests', function (require) {
"use strict";

const KanbanView = require('web.KanbanView');
const {createActionManager, createView, dom} = require('web.test_utils');
const {_t} = require('web.core');

QUnit.module('Views', {
    beforeEach() {
        this.data = {
            partner: {
                fields: {
                    foo: {string: "Foo", type: "char"},
                    bar: {string: "Bar", type: "boolean"},
                    int_field: {string: "int_field", type: "integer", sortable: true},
                    qux: {string: "my float", type: "float"},
                    product_id: {string: "something_id", type: "many2one", relation: "product"},
                    category_ids: { string: "categories", type: "many2many", relation: 'category'},
                    state: { string: "State", type: "selection", selection: [["abc", "ABC"], ["def", "DEF"], ["ghi", "GHI"]]},
                    date: {string: "Date Field", type: 'date'},
                    datetime: {string: "Datetime Field", type: 'datetime'},
                },
                records: [
                    {id: 1, bar: true, foo: "yop", int_field: 10, qux: 0.4, product_id: 3, state: "abc", category_ids: []},
                    {id: 2, bar: true, foo: "blip", int_field: 9, qux: 13, product_id: 5, state: "def", category_ids: [6]},
                    {id: 3, bar: true, foo: "gnap", int_field: 17, qux: -3, product_id: 3, state: "ghi", category_ids: [7]},
                    {id: 4, bar: false, foo: "blip", int_field: -4, qux: 9, product_id: 5, state: "ghi", category_ids: []},
                    {id: 5, bar: false, foo: "Hello \"World\"! #peace_n'_love", int_field: -9, qux: 10, state: "jkl", category_ids: []},
                ]
            },
            product: {
                fields: {
                    id: {string: "ID", type: "integer"},
                    name: {string: "Display Name", type: "char"},
                },
                records: [
                    {id: 3, name: "hello"},
                    {id: 5, name: "xmo"},
                ]
            },
            category: {
                fields: {
                    name: {string: "Category Name", type: "char"},
                    color: {string: "Color index", type: "integer"},
                },
                records: [
                    {id: 6, name: "gold", color: 2},
                    {id: 7, name: "silver", color: 5},
                ]
            },
        };
    },
}, function () {
    QUnit.test('kanban with searchpanel: rendering in mobile', async function (assert) {
        assert.expect(34);

        const kanban = await createView({
            View: KanbanView,
            model: 'partner',
            data: this.data,
            arch: `
                <kanban>
                    <templates><t t-name="kanban-box">
                        <div>
                            <field name="foo"/>
                        </div>
                    </t></templates>
                </kanban>
            `,
            archs: {
                'partner,false,search': `
                    <search>
                        <searchpanel>
                            <field name="product_id" expand="1" enable_counters="1"/>
                            <field name="state" expand="1" select="multi" enable_counters="1"/>
                        </searchpanel>
                    </search>
                `,
            },
            mockRPC(route, {method}) {
                if (method && method.includes('search_panel_')) {
                    assert.step(method);
                }
                return this._super.apply(this, arguments);
            },
        });

        let $sp = kanban.$(".o_search_panel");

        assert.containsOnce(kanban, "div.o_search_panel.o_search_panel_summary");
        assert.containsNone(document.body, "div.o_search_panel.o_searchview.o_mobile_search");
        assert.verifySteps([
            "search_panel_select_range",
            "search_panel_select_multi_range",
        ]);

        assert.containsOnce($sp, ".fa.fa-filter");
        assert.containsOnce($sp, ".o_search_panel_current_selection:contains(All)");

        // open the search panel
        await dom.click($sp);
        $sp = $(".o_search_panel");

        assert.containsNone(kanban, "div.o_search_panel.o_search_panel_summary");
        assert.containsOnce(document.body, "div.o_search_panel.o_searchview.o_mobile_search");

        assert.containsOnce($sp, ".o_mobile_search_header > button:contains(FILTER)");
        assert.containsOnce($sp, "button.o_mobile_search_footer:contains(SEE RESULT)");
        assert.containsN($sp, ".o_search_panel_section", 2);
        assert.containsOnce($sp, ".o_search_panel_section.o_search_panel_category");
        assert.containsOnce($sp, ".o_search_panel_section.o_search_panel_filter");
        assert.containsN($sp, ".o_search_panel_category_value", 3);
        assert.containsOnce($sp, ".o_search_panel_category_value > header.active", 3);
        assert.containsN($sp, ".o_search_panel_filter_value", 3);

        // select category
        await dom.click($sp.find(".o_search_panel_category_value:contains(hello) header"));

        assert.verifySteps([
            "search_panel_select_range",
            "search_panel_select_multi_range",
        ]);

        // select filter
        await dom.click($sp.find(".o_search_panel_filter_value:contains(DEF) input"));

        assert.verifySteps([
            "search_panel_select_range",
            "search_panel_select_multi_range",
        ]);

        // close with back button
        await dom.click($sp.find(".o_mobile_search_header button"));
        $sp = $(".o_search_panel");

        assert.containsOnce(kanban, "div.o_search_panel.o_search_panel_summary");
        assert.containsNone(document.body, "div.o_search_panel.o_searchview.o_mobile_search");

        // selection is kept when closed

        assert.containsOnce($sp, ".o_search_panel_current_selection");
        assert.containsOnce($sp, ".o_search_panel_category:contains(hello)");
        assert.containsOnce($sp, ".o_search_panel_filter:contains(DEF)");

        // open the search panel
        await dom.click($sp);
        $sp = $(".o_search_panel");

        assert.containsOnce($sp, ".o_search_panel_category_value > header.active:contains(hello)");
        assert.containsOnce($sp, ".o_search_panel_filter_value:contains(DEF) input:checked");

        assert.containsNone(kanban, "div.o_search_panel.o_search_panel_summary");
        assert.containsOnce(document.body, "div.o_search_panel.o_searchview.o_mobile_search");

        // close with bottom button
        await dom.click($sp.find("button.o_mobile_search_footer"));

        assert.containsOnce(kanban, "div.o_search_panel.o_search_panel_summary");
        assert.containsNone(document.body, "div.o_search_panel.o_searchview.o_mobile_search");

        kanban.destroy();
    });


    QUnit.module('KanbanView Mobile');

    QUnit.test('mobile grouped rendering', async function (assert) {
        assert.expect(13);

        var kanban = await createView({
            View: KanbanView,
            model: 'partner',
            data: this.data,
            arch: '<kanban class="o_kanban_test o_kanban_small_column" on_create="quick_create">' +
                '<templates><t t-name="kanban-box">' +
                '<div><field name="foo"/></div>' +
                '</t></templates>' +
                '</kanban>',
            domain: [['product_id', '!=', false]],
            groupBy: ['product_id'],
        });

        // basic rendering tests
        assert.containsN(kanban, '.o_kanban_group', 2, "should have 2 columns");
        assert.hasClass(kanban.$('.o_kanban_mobile_tab:first'), 'o_current',
            "first tab is the active tab with class 'o_current'");
        assert.hasClass(kanban.$('.o_kanban_group:first'),'o_current',
            "first column is the active column with class 'o_current'");
        assert.containsN(kanban, '.o_kanban_group:first > div.o_kanban_record', 2,
            "there are 2 records in active tab");
        assert.strictEqual(kanban.$('.o_kanban_group:nth(1) > div.o_kanban_record').length, 2,
            "there are 2 records in next tab. Records will be loaded when the kanban is opened");

        // quick create in first column
        await dom.click(kanban.$buttons.find('.o-kanban-button-new'));
        assert.hasClass(kanban.$('.o_kanban_group:nth(0) > div:nth(1)'),'o_kanban_quick_create',
            "clicking on create should open the quick_create in the first column");

        // move to second column
        await dom.click(kanban.$('.o_kanban_mobile_tab:nth(1)'));
        assert.hasClass(kanban.$('.o_kanban_mobile_tab:nth(1)'),'o_current',
            "second tab is now active with class 'o_current'");
        assert.hasClass(kanban.$('.o_kanban_group:nth(1)'),'o_current',
            "second column is now active with class 'o_current'");
        assert.strictEqual(kanban.$('.o_kanban_group:nth(1) > div.o_kanban_record').length, 2,
            "the 2 records of the second group have now been loaded");

        // quick create in second column
        await dom.click(kanban.$buttons.find('.o-kanban-button-new'));
        assert.hasClass(kanban.$('.o_kanban_group:nth(1) >  div:nth(1)'),'o_kanban_quick_create',
            "clicking on create should open the quick_create in the second column");

        // kanban column should match kanban mobile tabs
        var column_ids = kanban.$('.o_kanban_group').map(function () {
            return $(this).data('id');
        }).get();
        var tab_ids = kanban.$('.o_kanban_mobile_tab').map(function () {
            return $(this).data('id');
        }).get();
        assert.deepEqual(column_ids, tab_ids, "all columns data-id should match mobile tabs data-id");

        // kanban tabs with tab with lower width then available with have justify-content-between class
        assert.containsN(kanban, '.o_kanban_mobile_tabs.justify-content-between', 1,
            "should have justify-content-between class");
        assert.hasClass(kanban.$('.o_kanban_mobile_tabs'), 'justify-content-between',
            "the mobile tabs have the class 'justify-content-between'");

        kanban.destroy();
    });

    QUnit.test('mobile grouped rendering in rtl direction', async function (assert) {
        assert.expect(2);

        var direction = _t.database.parameters.direction;
        _t.database.parameters.direction = 'rtl';

        var kanban = await createView({
            View: KanbanView,
            model: 'partner',
            data: this.data,
            arch: '<kanban class="o_kanban_test o_kanban_small_column" on_create="quick_create">' +
                '<templates><t t-name="kanban-box">' +
                '<div><field name="foo"/></div>' +
                '</t></templates>' +
                '</kanban>',
            domain: [['product_id', '!=', false]],
            groupBy: ['product_id'],
        });

        assert.strictEqual(kanban.$('.o_kanban_group:first')[0].style.right, '0%',
            "first tab should have 50% right");
        assert.strictEqual(kanban.$('.o_kanban_group:nth(1)')[0].style.right, '100%',
            "second tab should have 100% right");

        kanban.destroy();
        _t.database.parameters.direction = direction;
    });


    QUnit.test('mobile grouped with undefined column', async function (assert) {
        assert.expect(5);

        var kanban = await createView({
            View: KanbanView,
            model: 'partner',
            data: this.data,
            arch: '<kanban class="o_kanban_test o_kanban_small_column">' +
                '<templates><t t-name="kanban-box">' +
                '<div><field name="foo"/></div>' +
                '</t></templates>' +
                '</kanban>',
            groupBy: ['product_id'],
        });

        // first column should be undefined with framework unique identifier
        assert.containsN(kanban, '.o_kanban_group', 3, "should have 3 columns");
        assert.containsOnce(kanban, '.o_kanban_columns_content .o_kanban_group:first-child[data-id^="partner_"]',
            "Undefined column should be first and have unique framework identifier as data-id");

        // kanban column should match kanban mobile tabs
        var column_ids = kanban.$('.o_kanban_group').map(function () {
            return $(this).data('id');
        }).get();
        var tab_ids = kanban.$('.o_kanban_mobile_tab').map(function () {
            return $(this).data('id');
        }).get();
        assert.deepEqual(column_ids, tab_ids, "all columns data-id should match mobile tabs data-id");

        // kanban tabs with tab with lower width then available with have justify-content-between class
        assert.containsN(kanban, '.o_kanban_mobile_tabs.justify-content-between', 1,
            "should have justify-content-between class");
        assert.hasClass(kanban.$('.o_kanban_mobile_tabs'), 'justify-content-between',
            "the mobile tabs have the class 'justify-content-between'");

        kanban.destroy();
    });

    QUnit.test('mobile grouped on many2one rendering', async function (assert) {
        assert.expect(5);

        var kanban = await createView({
            View: KanbanView,
            model: 'partner',
            data: this.data,
            arch: '<kanban class="o_kanban_test o_kanban_small_column">' +
                '<templates><t t-name="kanban-box">' +
                '<div><field name="foo"/></div>' +
                '</t></templates>' +
                '</kanban>',
            groupBy: ['foo'],
        });

        // basic rendering tests
        assert.containsN(kanban, '.o_kanban_group', 4, "should have 4 columns");
        assert.containsN(kanban, '.o_kanban_group[data-id^="partner_"]', 4,
            "all column should have framework unique identifiers");

        // kanban column should match kanban mobile tabs
        var column_ids = kanban.$('.o_kanban_group').map(function () {
            return $(this).data('id');
        }).get();
        var tab_ids = kanban.$('.o_kanban_mobile_tab').map(function () {
            return $(this).data('id');
        }).get();
        assert.deepEqual(column_ids, tab_ids, "all columns data-id should match mobile tabs data-id");

        // kanban tabs with tab with lower width then available with have justify-content-between class
        assert.containsN(kanban, '.o_kanban_mobile_tabs.justify-content-between', 1,
            "should have justify-content-between class");
        assert.hasClass(kanban.$('.o_kanban_mobile_tabs'), 'justify-content-between',
            "the mobile tabs have the class 'justify-content-between'");

        kanban.destroy();
    });

    QUnit.test('mobile quick create column view rendering', async function (assert) {
        assert.expect(12);

        var kanban = await createView({
            View: KanbanView,
            model: 'partner',
            data: this.data,
            arch: '<kanban class="o_kanban_test o_kanban_small_column" on_create="quick_create">' +
                '<templates><t t-name="kanban-box">' +
                '<div><field name="foo"/></div>' +
                '</t></templates>' +
                '</kanban>',
            domain: [['product_id', '!=', false]],
            groupBy: ['product_id'],
        });

        // basic rendering tests
        assert.containsN(kanban, '.o_kanban_group', 2, "should have 2 columns");
        assert.hasClass(kanban.$('.o_kanban_view > .o_kanban_mobile_tabs_container > .o_kanban_mobile_tabs > div:last'), 'o_kanban_mobile_add_column',
            "should have column quick create tab and should be displayed as last tab");
        assert.hasClass(kanban.$('.o_kanban_mobile_tab:first'), 'o_current',
            "should have first tab as active tab with class 'o_current'");
        assert.hasClass(kanban.$('.o_kanban_group:first'), 'o_current',
            "should have first group as active group with class 'o_current'");
        assert.hasClass(kanban.$('.o_kanban_group:first'), 'o_current',
            "should have first column as active column with left 0");

        // quick create record in first column(tab)
        await dom.click(kanban.$('.o-kanban-button-new'));
        assert.hasClass(kanban.$('.o_kanban_group[data-id="3"].o_current > div:nth(1)'), 'o_kanban_quick_create',
            "should open record quick create when clicking on create button in first column");

        // quick create record not allowed in quick create column tab
        // clicking quick create record should move to first column and create record in first column
        await dom.click(kanban.$('.o_kanban_mobile_tab:last'));
        await dom.click(kanban.$('.o-kanban-button-new'));
        assert.hasClass(kanban.$('.o_kanban_group[data-id="5"].o_current > div:nth(1)'), 'o_kanban_quick_create',
            "should open record quick create when clicking on create button in new column quick create");

        // new quick create column
        await dom.click(kanban.$('.o_kanban_mobile_add_column'));
        assert.isVisible(kanban.$('.o_quick_create_unfolded'), "kanban quick create should be unfolded by default");
        assert.isVisible(kanban.$('.o_column_quick_create input'), "the quick create column input should be visible");
        assert.containsNone(kanban, '.o_kanban_examples', "Should not have See Examples link in mobile");
        assert.containsNone(kanban, '.o_discard_msg', "Should not have Esc to Discard in mobile kanban");
        kanban.$('.o_column_quick_create input').val('msh');
        await dom.click(kanban.$('.o_column_quick_create button.o_kanban_add'));

        assert.strictEqual(kanban.$('.o_kanban_group:last span:contains(msh)').length, 1,
            "the last column(tab) should be the newly created one");
        kanban.destroy();
    });

    QUnit.test('mobile no quick create column when grouping on non m2o field', async function (assert) {
        assert.expect(2);

        var kanban = await createView({
            View: KanbanView,
            model: 'partner',
            data: this.data,
            arch: '<kanban class="o_kanban_test o_kanban_small_column" on_create="quick_create">' +
                '<templates><t t-name="kanban-box">' +
                '<div><field name="foo"/></div>' +
                '<div><field name="int_field"/></div>' +
                '</t></templates>' +
                '</kanban>',
            groupBy: ['int_field'],
        });

        assert.containsNone(kanban, '.o_kanban_mobile_add_column', "should not have the add column button");
        assert.containsNone(kanban.$('.o_column_quick_create'),
            "should not have column quick create tab as we grouped records on integer field");
        kanban.destroy();
    });

    QUnit.test('mobile kanban view: preserve active column on grouped kanban view', async function (assert) {
        assert.expect(9);

        const actionManager = await createActionManager({
            data: this.data,
            archs: {
                'partner,false,kanban': '<kanban default_group_by="int_field">' +
                    '<templates><t t-name="kanban-box">' +
                    '<div class="oe_kanban_global_click"><field name="foo"/></div>' +
                    '</t></templates>' +
                '</kanban>',
                'partner,form_view,form': '<form string="Partner"><field name="foo"/></form>',
                'partner,false,search': '<search><filter name="product" string="product" context="{\'group_by\': \'product_id\'}"/></search>',
            },
        });

        await actionManager.doAction({
            name: 'Partner',
            res_model: 'partner',
            type: 'ir.actions.act_window',
            views: [[false, 'kanban'], ['form_view', 'form']],
        });

        // basic rendering tests
        assert.containsN(actionManager, '.o_kanban_group', 5, "should have 5 columns");
        assert.hasClass(actionManager.$('.o_kanban_mobile_tab:first'), 'o_current',
            "by default, first tab should be active");
        assert.hasClass(actionManager.$('.o_kanban_group:first'), 'o_current',
            "by default, first column should be active");

        // move to second column
        await dom.click(actionManager.$('.o_kanban_mobile_tab:nth(1)'));
        assert.hasClass(actionManager.$('.o_kanban_mobile_tab:nth(1)'), 'o_current',
            "second tab should be active");
        assert.hasClass(actionManager.$('.o_kanban_group:nth(1)'), 'o_current',
            "second column should be active");

        // open a form view of the first record from active tab
        await dom.click(actionManager.$('.o_kanban_group.o_current > .o_kanban_record:first'));

        // go back to the kanban view with 'back' arrow button
        await dom.click(actionManager.$('.o_back_button'));

        // check that second column is still active
        assert.hasClass(actionManager.$('.o_kanban_mobile_tab:nth(1)'), 'o_current',
            "second tab should still be active");
        assert.hasClass(actionManager.$('.o_kanban_group:nth(1)'), 'o_current',
            "second column should still be active");

        // change the group by on view
        await dom.click(actionManager.$('.o_enable_searchview')); // click search icon
        await dom.click(actionManager.$('.o_toggle_searchview_full')); // open full screen search view
        await dom.click($('.o_group_by_menu > .o_dropdown_toggler_btn')); // open 'group by' drop-down
        await dom.click($('.o_group_by_menu .o_menu_item .dropdown-item')); // select first drop-down item
        await dom.click($('button.o_mobile_search_footer')); // click 'See Result' button

        // after the group by is changed, check that preserved active column should be cleared and
        // first available column should be set to active instead
        assert.hasClass(actionManager.$('.o_kanban_mobile_tab:first'), 'o_current',
            "first available tab should be active");
        assert.hasClass(actionManager.$('.o_kanban_group:first'), 'o_current',
            "first available column should be active");

        actionManager.destroy();
    });
});
});

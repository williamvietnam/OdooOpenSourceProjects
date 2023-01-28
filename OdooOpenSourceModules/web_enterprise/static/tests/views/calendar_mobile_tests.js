odoo.define('web_enterprise.calendar_mobile_tests', function (require) {
    "use strict";

    const CalendarView = require('web.CalendarView');
    const testUtils = require('web.test_utils');

    const preInitialDate = new Date(2016, 11, 12, 8, 0, 0);
    const initialDate = new Date(preInitialDate.getTime() - preInitialDate.getTimezoneOffset() * 60 * 1000);

    QUnit.module('Views', {
        beforeEach: function () {
            this.data = {
                event: {
                    fields: {
                        id: { string: "ID", type: "integer" },
                        name: { string: "name", type: "char" },
                        start: { string: "start datetime", type: "datetime" },
                        stop: { string: "stop datetime", type: "datetime" },
                        partner_id: {string: "user", type: "many2one", relation: 'partner', related: 'user_id.partner_id', default: 1},
                    },
                    records: [
                        {id: 1, partner_id: 1, name: "event 1", start: "2016-12-11 00:00:00", stop: "2016-12-11 00:00:00"},
                        {id: 2, partner_id: 2, name: "event 2", start: "2016-12-12 10:55:05", stop: "2016-12-12 14:55:05"},
                    ],
                    async check_access_rights() {
                        return true;
                    },
                },
                partner: {
                    fields: {
                        id: {string: "ID", type: "integer"},
                        image: { string: "Image", type: "binary" },
                        display_name: {string: "Displayed name", type: "char"},
                    },
                    records: [
                        {id: 1, display_name: "partner 1", image: 'AAA'},
                        {id: 2, display_name: "partner 2", image: 'BBB'},
                    ]
                },
            };
        },
    }, function () {

        QUnit.module('CalendarView Mobile');

        QUnit.test('simple calendar rendering in mobile', async function (assert) {
            assert.expect(3);

            const calendar = await testUtils.createView({
                arch: `
            <calendar date_start="start" date_stop="stop">
                <field name="name"/>
            </calendar>`,
                data: this.data,
                model: 'event',
                View: CalendarView,
                viewOptions: {
                    initialDate: initialDate,
                },
            });

            assert.containsNone(calendar.$buttons, '.o_calendar_button_prev',
                "prev button should be hidden");
            assert.containsNone(calendar.$buttons, '.o_calendar_button_next',
                "next button should be hidden");
            assert.isVisible(document.querySelector('.o_control_panel .o_cp_bottom_right button.o_cp_today_button'),
                "today button should be visible in the pager area (bottom right corner)");

            calendar.destroy();
        });

        QUnit.test('calendar: popover rendering in mobile', async function (assert) {
            assert.expect(4);

            let calendar = await testUtils.createCalendarView({
                View: CalendarView,
                model: 'event',
                data: this.data,
                arch:
                    '<calendar date_start="start" date_stop="stop">' +
                    '<field name="name"/>' +
                    '</calendar>',
                viewOptions: {
                    initialDate: initialDate,
                },
            }, { positionalClicks: true });

            let fullCalendarEvent = calendar.el.querySelector('.fc-event');

            await testUtils.dom.click(fullCalendarEvent);
            await testUtils.nextTick();

            let popover = document.querySelector('.o_cw_popover');
            assert.ok(popover !== null, "there should be a modal");
            assert.ok(popover.parentNode === document.body, "the container of popover must be the body");

            // Check if the popover is "fullscreen"
            let actualPosition = popover.getBoundingClientRect();
            let windowRight = document.documentElement.clientWidth;
            let windowBottom = document.documentElement.clientHeight;
            let expectedPosition = [
                0,
                windowRight,
                windowBottom,
                0
            ];

            assert.deepEqual([
                actualPosition.top,
                actualPosition.right,
                actualPosition.bottom,
                actualPosition.left
            ], expectedPosition, "popover should be at position 0 " + windowRight + " " + windowBottom + " 0 (top right bottom left)");
            let closePopoverButton = document.querySelector('.o_cw_popover_close');
            await testUtils.dom.click(closePopoverButton);

            popover = document.querySelector('.o_cw_popover');
            assert.ok(popover === null, "there should be any modal");

            calendar.destroy();
        });

        QUnit.test('calendar: today button', async function (assert) {
            assert.expect(1);
            // Take the current day
            const initialDate = new Date();
            // Increment by two days to avoid test error near midnight
            initialDate.setDate(initialDate.getDate() + 2);

            let calendar = await testUtils.createCalendarView({
                View: CalendarView,
                model: 'event',
                data: this.data,
                arch: `<calendar mode="day" date_start="start" date_stop="stop"></calendar>`,
                viewOptions: {
                    initialDate: initialDate,
                },
            });

            const previousDate = calendar.el.querySelector('.fc-day-header[data-date]').dataset.date;
            let todayButton = calendar.el.querySelector('.o_calendar_button_today');
            await testUtils.dom.click(todayButton);

            const newDate = calendar.el.querySelector('.fc-day-header[data-date]').dataset.date;
            assert.notEqual(newDate, previousDate, "The today button must change the view to the today date");

            calendar.destroy();
        });

        QUnit.test('calendar: show and change other calendar', async function (assert) {
            assert.expect(8);

            let calendar = await testUtils.createCalendarView({
                View: CalendarView,
                model: 'event',
                data: this.data,
                arch: `
                    <calendar date_start="start" date_stop="stop" color="partner_id">
                        <filter name="user_id" avatar_field="image"/>
                        <field name="partner_id" filters="1" invisible="1"/>
                    </calendar>
                `,
                viewOptions: {
                    initialDate: initialDate,
                },
            }, {positionalClicks: true});


            let otherCalendarPanel = calendar.el.querySelector('.o_other_calendar_panel');
            assert.ok(otherCalendarPanel !== null, "there should be a panel over the calendar");
            const span = otherCalendarPanel.querySelectorAll('.o_filter > span');
            assert.equal(span.length, 3,
                'Panel should contains 3 span (1 label (USER) + 2 resources (user 1/2)');

            const calendarSidebar = calendar.el.querySelector('.o_calendar_sidebar');
            const calendarElement = calendar.el.querySelector('.o_calendar_view');
            assert.isVisible(calendarElement, "the calendar should be visible");
            assert.isNotVisible(calendarSidebar, "the panel with other calendar shouldn't be visible");
            otherCalendarPanel = calendar.el.querySelector('.o_other_calendar_panel');
            await testUtils.dom.click(otherCalendarPanel);

            assert.isNotVisible(calendarElement, "the calendar shouldn't be visible");
            assert.isVisible(calendarSidebar, "the panel with other calendar should be visible");
            otherCalendarPanel = calendar.el.querySelector('.o_other_calendar_panel');
            await testUtils.dom.click(otherCalendarPanel);

            assert.isVisible(calendarElement, "the calendar should be visible again");
            assert.isNotVisible(calendarSidebar, "the panel with other calendar shouldn't be visible again");

            calendar.destroy();
        });

    });
});

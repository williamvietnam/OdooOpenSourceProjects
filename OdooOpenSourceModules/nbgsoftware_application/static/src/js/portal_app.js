odoo.define("nbgsoftware_application.app_link", function (require) {
  "use strict";

  var rpc = require("web.rpc");
  var core = require("web.core");
  var _t = core._t;
  var ref;
  var open_tab;

  (async () => {
    const categories = await rpc.query({
      model: "ui.app.category",
      method: "search_read",
      fields: ["id", "name", "ui_app_ids", "parent_id"],
      domain: [['has_app', '=', true]],
    });

    //remove category when not assigning document
    var i = 0;
    while (i < categories.length) {
        if (categories[i].ui_app_ids.length === 0) {
          categories.splice(i, 1);
        } else {
          ++i;
        }
    }

    //filter categories parent  with first loading
    let listAllCategoriesAppId = [];
    categories.forEach((item) =>
      item["ui_app_ids"].forEach((child) => listAllCategoriesAppId.push(child))
    );
    const buttonBackGround = $("<ul>", {
      class: `background-menu o_search_panel`,
    });
    const listItemBackGround = $("<div>", { class: `background-listItem` });

    const dataWithChildren = [...categories].map((value) => {
      value.children = categories.filter(
        (child) => child.parent_id && value.id === child.parent_id[0]
      );
      return value;
    });

    const newData = dataWithChildren.filter((value) => !value.parent_id);

    function generateTemplate(list = []) {
      list.forEach((item, index) => {
        checkChildItem(item, buttonBackGround);
      });
    }

    function addArrowToggleIcon() {
      const listArrowFilter = Array.from(
        document.querySelectorAll("li.background-item")
      ).filter((x) => $(x).children(".background-item-child").length !== 0);

      const listNotArrow = Array.from(
        document.querySelectorAll("li.background-item")
      ).filter((x) => $(x).children(".background-item-child").length === 0);

      listArrowFilter.forEach((el_child) => {
        const templateAsFind = $(el_child).children("header:first-child");

        const templateArrow = $(`<div class="background-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                                              <!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                                              <path
                                                d="M182.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8H288c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128z"
                                              />
                                            </svg>
                                            </div>
                                            <span>
                                              ${templateAsFind.text()}
                                            </span>
                                          `);
        templateAsFind.html(templateArrow);
      });

      listNotArrow.forEach((el_child) => {
        const templateAsFind = $(el_child).children("header:first-child");

        let templateArrow;
        if ($(templateAsFind).attr("level").toString().includes("_0")) {
          templateArrow = $(`<div class="background-icon"></div>
                            <span>${templateAsFind.text()}</span>`);
        } else {
          templateArrow = $(`<div class="background-icon-not-arrow"></div>
                            <span>${templateAsFind.text()}</span>`);
        }
        templateAsFind.html(templateArrow);
      });
    }

    generateTemplate(newData);
    async function clickElement(e, isButtonAll = false) {
      if (isButtonAll === false) {
        const levelString = e.currentTarget.getAttribute("level");
        let level = levelString.substring(
          levelString.length - 1,
          levelString.length
        );
        const elParent = e.currentTarget.parentElement;
        $(elParent)
          .children("ul.background-item-child")
          .toggleClass("toggleClassMenu");

        //toggle arrow
        $(e.currentTarget)
          .children(".background-icon")
          .toggleClass("rotateArrow");

        //query all categories
        const child_Of_id = elParent.getAttribute("current_id");
        const data = await rpc.query({
          model: "ui.app.category",
          method: "search_read",
          fields: ["id", "name", "ui_app_ids"],
          domain: [["id", "child_of", +child_Of_id]],
        });
        let listID = [];
        data.forEach((x) => x["ui_app_ids"].forEach((y) => listID.push(y)));
        let apps = await Promise.all(
          listID.map(async (app_id) => {
            const app = await rpc.query({
              model: "ui.app",
              method: "search_read",
              fields: ["id", "name", "url", "web_icon", 'url_download', "down_document"],
              domain: [
                ["id", "=", app_id],
                ["is_custom_app", "=", true],
              ],
            });
            if (!app?.[0]) {
              return null;
            }

            if (app[0].down_document === true) {
                ref = app[0].url_download;
                open_tab = "";
            }
            else {
                ref = app[0].url
                open_tab = "_blank"
            }
            return $("<a>", {
              class:
                "list-group-item list-group-item-action d-flex align-items-center justify-content-between",
              href: ref,
              target: open_tab,
            })
              .append([
                $("<div>", { class: "o_app_icon" }).append(
                  $("<img>", { style: "width: 50px; height:50px;" }).attr(
                    "src",
                    `data:image/png;base64,${app[0].web_icon}`
                  )
                ),
              ])
              .append(
                `<span class="badge badge-secondary badge-pill">${app[0].name}<span>`
              );
          })
        );
        listItemBackGround.html(apps);
      } else {
        let apps = [];
        const app_no_category = await rpc.query({
          model: "ui.app",
          method: "search_read",
          fields: ["id", "name", "url", "web_icon","url_download", "down_document"],
          domain: [["is_custom_app", "=", true]],
        });
        if (app_no_category !== 0) {
          for (let i = 0; i < app_no_category.length; i++) {
            if (app_no_category[i].down_document === true) {
                ref = app_no_category[i].url_download;
                open_tab = ""
            }
            else {
                ref = app_no_category[i].url;
                open_tab = "_blank";
            }
            apps.push(
              $("<a >", {
                class:
                  "list-group-item list-group-item-action d-flex align-items-center justify-content-between",
                href: ref,
                target: open_tab,
              })
                .append([
                  $("<div>", { class: "o_app_icon" }).append(
                    $("<img>", { style: "width: 50px; height:50px;" }).attr(
                      "src",
                      `data:image/png;base64,${app_no_category[i].web_icon}`
                    )
                  ),
                ])
                .append(
                  `<span class="badge badge-secondary badge-pill">${app_no_category[i].name}<span>`
                )
            );
          }
        }
        listItemBackGround.html(apps);
      }
      toggleElementClick(e);

      //date state element click
    }

    function toggleElementClick(e) {
      const listEl = document.querySelectorAll(
        ".background-item header, .button-all-item"
      );
      listEl.forEach((x) => {
        x == e.currentTarget
          ? (x.style.background = "rgba(108, 193, 237, 0.3)")
          : (x.style.background = "unset");
      });
    }

    function checkChildItem(
      item,
      itemTemplate,
      index = 0,
      parent = true,
      isHidden = false
    ) {
      let templateChild;
      if (parent === true) {
        templateChild = $(
          `<li current_id="${item["id"]}" parent_id="${
            item["parent_id"] !== false ? item["parent_id"][0] : false
          }"
                      class="background-item"
                    ><header level="level_item_0" style="margin-left:${
                      index * 0
                    }px">
                        <span>${item.name}</span>
                      </header></li>`
        );
        itemTemplate.append(templateChild);
      } else {
        templateChild = $(
          `<li current_id="${item["id"]}" parent_id="${
            item["parent_id"] !== false ? item["parent_id"][0] : false
          }"
                    class="background-item"
                    ><header level="level_item_${index}">
                        <span>${item.name}</span>
                      </header></li>`
        );
        if (index > 0) {
          const backgroundChild = $(itemTemplate).find(`ul[level$=${index}]`);
          backgroundChild.append(templateChild);
          backgroundChild.hide();
        }
      }

      templateChild.find("header:first-child").click((e) => clickElement(e));

      if (item.children.length > 0) {
        const backgroundChildUl = $(
          `<ul class="background-item-child" level='level_item_${
            index + 1
          }'></ul>`
        );

        templateChild.append(backgroundChildUl);
      }

      item.children.forEach((childItem) => {
        checkChildItem(childItem, templateChild, index + 1, false, true);
      });
    }

    const listElement = document.querySelectorAll(".button-all-item");
    if (categories.length == 0) $(listElement?.[0]).hide();
    $(listElement?.[0]).click(async (e) => {
      await clickElement(e, true);
    });

    $(".first-background-col").append(buttonBackGround);
    addArrowToggleIcon();
    $(".last-background-col").append(listItemBackGround);
    buttonBackGround.attr(
      "style",
      "display:flex;flex-direction:column ; padding:0 10px"
    );
    listElement?.[0]?.click();
  })();
});

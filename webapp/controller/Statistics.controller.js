sap.ui.define(
  [
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
  ],
  function (BaseController, formatter, JSONModel, Sorter) {
    "use strict";

    return BaseController.extend(
      "sap.ui.agi.zeiterfassung.controller.Statistics",
      {
        formatter: formatter,
        onInit: function () {
          this.getView().setModel(
            new JSONModel({
              sortingState: true,
            }),
            "sorting"
          );
          this.getView().setModel(new JSONModel({ hours: 0 }), "statistics");
          this.getHoursInMonth();
        },
        onAfterRendering: function () {
          this.sortList();
        },
        sortList: function () {
          this.byId("statisticList")
            .getBinding("items")
            .sort(
              new Sorter({
                path: "Time",
                descending: this.getView()
                  .getModel("sorting")
                  .getProperty("/sortingState"),
              })
            );
        },
        onPressSort: function () {
          const sorting = this.getView().getModel("sorting");
          const sortingState = sorting.getProperty("/sortingState");
          sorting.setProperty("/sortingState", !sortingState);
          this.sortList();
        },
        getHoursInMonth: function () {
          let hours = 0;
          const entries = this.entries().getData();
          const currentDate = new Date(
            new Date().getFullYear(),
            new Date().getMonth()
          );
          entries.forEach((entry) => {
            const day = entry.Day.split(".");
            if (
              currentDate.toString() == new Date(day[0], day[1] - 1).toString()
            ) {
              hours += entry.Duration;
            }
          });
          this.getView().getModel("statistics").setProperty("/hours", hours);
        },
      }
    );
  }
);

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
        onInit() {
          this.getView().setModel(
            new JSONModel({
              sortingState: true,
            }),
            "sorting"
          );
          this.getView().setModel(new JSONModel({ hours: 0 }), "statistics");
          this.getHoursInMonth();
        },
        onAfterRendering() {
          this.sortList();
        },
        sortList() {
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
        onPressSort() {
          const sorting = this.getView().getModel("sorting");
          const sortingState = sorting.getProperty("/sortingState");
          sorting.setProperty("/sortingState", !sortingState);
          this.sortList();
        },
        getHoursInMonth() {
          let hours = 0;
          const entries = this.getEntriesModel().getData();
          entries.forEach((entry) => {
            hours += entry.Duration;
          });
          this.getView().getModel("statistics").setProperty("/hours", hours);
        },
      }
    );
  }
);

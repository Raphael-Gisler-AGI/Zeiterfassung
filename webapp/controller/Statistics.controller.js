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
          // items.sort(sorter);
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
      }
    );
  }
);

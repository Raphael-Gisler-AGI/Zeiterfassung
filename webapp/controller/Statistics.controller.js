sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "sap/ui/model/Sorter"],
  function (BaseController, JSONModel, Sorter) {
    "use strict";

    return BaseController.extend(
      "sap.ui.agi.zeiterfassung.controller.Statistics",
      {
        /**
         * Set Model for sorting and statistics,
         * Calculate the hours
         */
        onInit() {
          this.getView().setModel(
            new JSONModel({
              sortingState: true,
            }),
            "sorting"
          );

          let hours = 0;
          const entries = this.getEntriesModel().getData();
          entries.forEach((entry) => {
            hours += entry.Duration;
          });
          this.getView().setModel(
            new JSONModel({ hours: hours }),
            "statistics"
          );
        },
        /**
         * The List gets sorted after being rendered because it isn't there before
         */
        onAfterRendering() {
          this.sortList(true);
        },

        /**
         * Toggle the sorting state and run the sorting function
         */
        onPressSort() {
          const sorting = this.getView().getModel("sorting");
          const sortingState = !sorting.getProperty("/sortingState");
          sorting.setProperty("/sortingState", sortingState);
          this.sortList(sortingState);
        },

        /**
         * List of statistics get's ordered dependant on the state
         * @param {boolean} sortDescending If the List should be descending
         */
        sortList(sortDescending) {
          this.byId("statisticList")
            .getBinding("items")
            .sort(
              new Sorter({
                path: "Time",
                descending: sortDescending,
              })
            );
        }
      }
    );
  }
);

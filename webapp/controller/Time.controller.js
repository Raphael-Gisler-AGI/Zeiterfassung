sap.ui.define(
  [
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
  ],
  function (BaseController, formatter, Filter, FilterOperator, MessageToast) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Time", {
      formatter: formatter,
      onPressEdit: function (oEvent) {
        const oItem = oEvent.getSource();
        const entry = oItem.getBindingContext("entries");
        if (this.getTimer().getProperty("/id") == entry.getProperty("id")) {
          MessageToast.show("Please stop the timer before editing");
          return;
        }
        const startTime = entry.getProperty("StartTime");
        const endTime = entry.getProperty("EndTime");
        const category = entry.getProperty("Category")
        this.onOpenModify({
          id: entry.getProperty("id"),
          title: "Edit Entry",
          creationType: 1,
          description: entry.getProperty("Description"),
          category: category,
          type: this.getCategoryType(category),
          startDay: new Date(startTime),
          endDay: new Date(endTime),
          startTime: this.formatTime(startTime),
          endTime: this.formatTime(endTime),
        });
      },
      onPressDelete: async function (oEvent) {
        const oItem = oEvent.getSource();
        const id = oItem.getBindingContext("entries").getProperty("id");
        if (this.getTimer().getProperty("/id") == id) {
          MessageToast.show("Please stop the timer before deleting");
          return;
        }
        await this.beforeDeleteEntry(id);
      },

      // Event handler, lösen Re-Filter aus
      // setFilter --> holt sich ALLE filter und baut den Filter direkt auf
      // Einzelen Filter holen mit byId('')

      onFilterSearch: function (oEvent) {
        this.applyFilter();
      },
      onFilterCategory: function (oEvent) {
        this.applyFilter();
      },
      applyFilter: function (operation) {
        const aFilters = [];

        // Nicht über byId, sondern separates Filter-Model und Properties von dort holen...

        const sDesc = this.byId('inputDescript').getValue();
        if (sDesc) {
          aFilters.push(
            new Filter(
              "Description",
              FilterOperator.Contains,
              sDesc
            )
          )
        }

        const sCat = this.byId('inputCat').getValue();
        if (sCat) {
          aFilters.push(
            new Filter(
              "Category",
              FilterOperator.EQ,
              sCat
            )
          )
        }

        this.byId("entryTable")
          .getBinding("items")
          .filter(aFilters);
      },
    });
  }
);

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
        this.onOpenModify({
          id: entry.getProperty("id"),
          title: "Edit Entry",
          creationType: 1,
          description: entry.getProperty("Description"),
          category: entry.getProperty("Category"),
          type: 0,
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
      filter: [new Filter(), new Filter()],
      onFilterSearch: function (oEvent) {
        const query = oEvent.getParameter("newValue");
        this.filter[0] = new Filter(
          "Description",
          FilterOperator.Contains,
          query ? query : ""
        );
        this.setFilter(FilterOperator.Contains);
      },
      onFilterCategory: function (oEvent) {
        const id = oEvent.getSource().getSelectedKey();
        if (id) {
          this.filter[1] = new Filter("Category", FilterOperator.EQ, id);
        } else {
          this.filter[1] = new Filter();
        }
        this.setFilter(FilterOperator.EQ);
      },
      setFilter: function (operation) {
        this.byId("entryTable")
          .getBinding("items")
          .filter(this.filter, operation);
      },
    });
  }
);

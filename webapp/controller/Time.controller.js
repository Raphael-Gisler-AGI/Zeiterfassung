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
          return MessageToast.show("Please stop the timer before editing");
        }
        const startTime = entry.getProperty("StartTime");
        const endTime = entry.getProperty("EndTime");
        const category = entry.getProperty("Category");
        this.dialogModifyOpen({
          id: entry.getProperty("id"),
          title: "Edit Entry",
          creationType: this.CREATION_TYPE.UPDATE_ENTRY,
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
          return MessageToast.show("Please stop the timer before deleting");
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

sap.ui.define(
  [
    "./BaseController",
    "../model/categories",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (BaseController, categories, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Time", {
      formatter: categories,
      onPressEdit: function (oEvent) {
        const oItem = oEvent.getSource();
        const entry = oItem.getBindingContext("entries");
        this.onOpenModify("Edit Entry", () => {
          this.byId("modifyId").setText(entry.getProperty("id"));
          this.byId("modifyDescription").setValue(
            entry.getProperty("Description")
          );
          this.byId("modifyCategory").setSelectedKey(
            entry.getProperty("Category")
          );
          this.byId("modifyStartDate").setDateValue(
            new Date(entry.getProperty("Day"))
          );
          this.byId("modifyStartTime").setDateValue(
            new Date(entry.getProperty("StartTime"))
          );
          this.byId("modifyEndTime").setDateValue(
            new Date(entry.getProperty("EndTime"))
          );
        });
      },
      onPressDelete: async function (oEvent) {
        const oItem = oEvent.getSource();
        const id = oItem.getBindingContext("entries").getProperty("id");
        await this.deleteTime(id);
      },
      onFilterCategory: function (oEvent) {
        const filter = [];
        const query = oEvent.getParameter("query");
        console.log(query);
        if (query) {
          filter.push(
            new Filter("Description", FilterOperator.Contains, query)
          );
        }
        const test = this.byId("entryTable")
          .getBinding("items")
          .filter(filter, FilterOperator.Contains);
        console.log(test);
      },
    });
  }
);

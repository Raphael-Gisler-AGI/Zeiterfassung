sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "../model/categories", "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"],
  function (BaseController,
	JSONModel,
	categories,
	Filter,
	FilterOperator) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Time", {
      formatter: categories,
      onPressEdit: function (oEvent) {
        const oItem = oEvent.getSource();
        const entry = oItem.getBindingContext("entries");
        this.getView().setModel(
          new JSONModel({
            create: false,
            id: entry.getProperty("id"),
            Description: entry.getProperty("Description"),
            Category: entry.getProperty("Category"),
            Type: 0,
            Day: new Date(entry.getProperty("Day")),
            StartTime: new Date(),
            EndTime: new Date(),
          }),
          "modify"
        );
        console.log(this.getView().getModel("modify").getData())
        this.onOpenModify("Edit Entry");
      },
      onPressDelete: async function (oEvent) {
        const oItem = oEvent.getSource();
        const id = oItem.getBindingContext("entries").getProperty("id");
        await this.deleteTime(id);
      },
      onFilterCategory: function (oEvent) {
        const filter = [];
        const query = oEvent.getParameter("query");
        console.log(query)
        if (query) {
          filter.push(new Filter("Description", FilterOperator.Contains, query));
        }
        const test = this.byId("entryTable").getBinding("items").filter(filter, FilterOperator.Contains)
        console.log(test)
      },
    });
  }
);

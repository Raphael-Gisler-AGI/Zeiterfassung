sap.ui.define(
  [
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
  ],
  function (
    BaseController,
    formatter,
    Filter,
    FilterOperator,
    MessageToast,
    JSONModel
  ) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Time", {
      formatter: formatter,
      onInit() {
        this.getView().setModel(
          new JSONModel({
            description: undefined,
            category: undefined,
          }),
          "filter"
        );
      },

      onPressEdit(oEvent) {
        const entry = oEvent.getSource().getBindingContext("entries");
        if (
          this.getTimerModel().getProperty("/id") == entry.getProperty("id")
        ) {
          return MessageToast.show("Please stop the timer before editing");
        }
        const startTime = entry.getProperty("StartTime");
        const endTime = entry.getProperty("EndTime");
        const category = entry.getProperty("Category");
        this.openModifyDialog({
          id: entry.getProperty("id"),
          creationType: this.CREATION_TYPE.UPDATE_ENTRY,
          description: entry.getProperty("Description"),
          category: category,
          type: this.getCategoryType(category),
          startDay: new Date(startTime),
          endDay: new Date(endTime),
          startTime: this.formatTime(startTime),
          endTime: this.formatTime(endTime),
          halfDay: entry.getProperty("HalfDay") || false,
        });
      },

      onPressDelete(oEvent) {
        const oItem = oEvent.getSource();
        const id = oItem.getBindingContext("entries").getProperty("id");
        if (this.getTimerModel().getProperty("/id") == id) {
          return MessageToast.show("Please stop the timer before deleting");
        }
        this.confirmDeleteEntry(id, true);
      },

      onFilter() {
        const filters = [];
        const { description, category } = this.getView()
          .getModel("filter")
          .getData();

        if (description) {
          filters.push(
            new Filter("Description", FilterOperator.Contains, description)
          );
        }
        if (category) {
          filters.push(new Filter("Category", FilterOperator.EQ, category));
        }

        this.byId("entryTable")
          .getBinding("items")
          .filter(filters, FilterOperator.Contains);
      },
    });
  }
);

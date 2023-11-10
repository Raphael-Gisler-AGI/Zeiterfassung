sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
  ],
  function (BaseController, Filter, FilterOperator, MessageToast, JSONModel) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Time", {
      /**
       * Set new filter model
       */
      onInit() {
        this.getView().setModel(
          new JSONModel({
            description: undefined,
            category: undefined,
          }),
          "filter"
        );
      },
      /**
       * Handles the data and opens the modify dialog
       * @param {object} oEvent
       * @returns {void} Early return if the entry is the timer
       */
      onPressEdit(oEvent) {
        const entry = oEvent.getSource().getBindingContext("entries");
        if (entry.getProperty("timer")) {
          MessageToast.show("Please stop the timer before editing");
          return;
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
      /**
       * Parses the Id of an entry to the confirmation function
       * @param {object} oEvent
       * @returns {void} Early return if the entry is the timer
       */
      onPressDelete(oEvent) {
        const entry = oEvent.getSource().getBindingContext("entries");
        if (entry.getProperty("timer")) {
          MessageToast.show("Please stop the timer before deleting");
          return;
        }
        this.confirmDeleteEntry(entry.getProperty("id"), true);
      },
      /**
       * Apply the filters to the table of entries
       */
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

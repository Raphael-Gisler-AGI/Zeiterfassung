sap.ui.define(["./BaseController", "../model/categories"], function (
  Controller,
  categories
) {
  "use strict";

  return Controller.extend("sap.ui.agi.zeiterfassung.controller.Time", {
    formatter: categories,
    onInit: function () {
      this.convertToDate();
      this.entries().refresh();
      console.log(this.entries().getData());
    },
    handleCreate: function (oEvent) {
      const startTime = oEvent.getParameter("startDate");
      const endTime = oEvent.getParameter("endDate");
      this.onOpenModify("Create Entry", () => {
        this.setModifyCreateValues(startTime, startTime, endTime);
      });
    },
    handleDrop: function (oEvent) {
      const entry = oEvent
        .getParameter("appointment")
        .getBindingContext("entries");
      const startTime = oEvent.getParameter("startDate");
      const endTime = oEvent.getParameter("endDate");
      this.onOpenModify("Edit Entry", () => {
        this.setModifyEditValues(
          entry.getProperty("id"),
          entry.getProperty("Description"),
          entry.getProperty("Category"),
          startTime,
          startTime,
          endTime
        );
      });
    },
  });
});

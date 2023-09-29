sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/date/UI5Date"],
  function (Controller, UI5Date) {
    "use strict";

    return Controller.extend(
      "sap.ui.agi.zeiterfassung.controller.BaseController",
      {
        onNavigateTime: function () {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("time");
        },
        onNavigateCalendar: function () {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("calendar");
        },
        convertToDate: function () {
          this.getOwnerComponent()
            .getModel("entries")
            .getData()
            .forEach((entry) => {
              entry.StartTime = new Date(entry.StartTime);
              entry.EndTime = UI5Date.getInstance(entry.EndTime);
            });
        },
        deleteTime: async function (id) {
          return await fetch(`http://localhost:3000/deleteEntry?id=${id}`).then(
            (res) => {
              return res;
            }
          );
        },
      }
    );
  }
);

sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/date/UI5Date",
	"sap/ui/model/json/JSONModel"],
  function (Controller,
	UI5Date,
	JSONModel) {
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
          this.entries()
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
        entries: function () {
          return this.getOwnerComponent().getModel("entries");
        },
        categories: function () {
          return this.getOwnerComponent().getModel("categories");
        },
        onOpenModify: function (title) {
          if (!this.pDialog) {
            this.pDialog = this.loadFragment({
              name: "sap.ui.agi.zeiterfassung.view.Modify",
            });
          }
          this.pDialog.then(function (oDialog) {
            oDialog.setTitle(title);
            oDialog.open();
          });
        },
        onCloseModify: function () {
          this.byId("modifyDialog").close();
        },
      }
    );
  }
);

sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend(
      "sap.ui.agi.zeiterfassung.controller.BaseController",
      {
        onInit: function () {
          this.getOwnerComponent().setModel(
            new JSONModel({
              Description: "",
            }),
            "entry"
          );
        },
        // Navigation
        onNavigateTime: function () {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("time");
        },
        onNavigateCalendar: function () {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("calendar");
        },
        // Get Global Models
        entries: function () {
          return this.getOwnerComponent().getModel("entries");
        },
        categories: function () {
          return this.getOwnerComponent().getModel("categories");
        },
        default: function () {
          return this.getOwnerComponent().getModel("default");
        },
        // Create Edit Delete
        baseUrl: "http://localhost:3000/",
        createEntry: async function (data) {
          return await fetch(
            `${this.baseUrl}createEntry?data=${JSON.stringify(data)}`
          ).then((res) => {
            return res;
          });
        },
        editEntry: async function (data) {
          return await fetch(
            `${this.baseUrl}editEntry?data=${JSON.stringify(data)}`
          ).then((res) => {
            return res;
          });
        },
        deleteTime: async function (id) {
          return await fetch(`${this.baseUrl}deleteEntry?id=${id}`).then(
            (res) => {
              return res;
            }
          );
        },
        saveDefault: async function (data) {
          return await fetch(
            `${this.baseUrl}saveDefault?data=${JSON.stringify(data)}`
          ).then((res) => {
            return res.status;
          });
        },
        convertToDate: function () {
          this.entries()
            .getData()
            .forEach((entry) => {
              entry.StartTime = new Date(entry.StartTime);
              entry.EndTime = new Date(entry.EndTime);
            });
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
        onChangeCategoryModify: function (oEvent) {
          const id = oEvent.getSource().getSelectedKey();
          const type = this.categories()
            .getData()
            .find((category) => category.id == id).Type;
          this.getView()
            .getModel("modify")
            .setProperty("/category", oEvent.getSource().getSelectedKey());
          this.getView().getModel("modify").setProperty("/Type", type);
        },
        onOkModify: async function () {
          const modify = this.getView().getModel("modify");
          modify.setProperty(
            "/Duration",
            this.calcDuration(
              new Date(modify.getProperty("/StartTime")),
              new Date(modify.getProperty("/EndTime"))
            )
          );
          const day = new Date(modify.getProperty("/Day"))
            .toISOString()
            .split("T")[0];
          console.log(day);
          modify.setProperty("/Day", day);
          console.log("test");
          if (modify.create) {
            await this.createEntry(modify.getData());
          } else {
            await this.editEntry(modify.getData());
          }
          this.onCloseModify();
        },
        onCloseModify: function () {
          this.getView().getModel("modify").setData(null);
          this.getView().getModel("modify").refresh();
          this.byId("modifyDialog").close();
        },
        formatDate: function (date) {
          return new Date(date * 1000).toISOString().substring(11, 19);
        },
        calcDuration: function (startTime, endTime) {
          return this.formatDate(Math.round((endTime - startTime) / 1000));
        },
      }
    );
  }
);

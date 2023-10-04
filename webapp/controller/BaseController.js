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
        // Refresh Global Models
        refreshEntries: function () {
          this.entries().loadData;
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
        onOpenModify: function (title, setValues) {
          this.getView().setModel(
            new JSONModel({
              Type: 0,
            }),
            "type"
          );
          if (!this.pDialog) {
            this.pDialog = this.loadFragment({
              name: "sap.ui.agi.zeiterfassung.view.Modify",
            });
          }
          this.pDialog
            .then(function (oDialog) {
              oDialog.setTitle(title);
              oDialog.open();
            })
            .then(setValues);
        },
        onChangeCategoryModify: function (oEvent) {
          const id = oEvent.getSource().getSelectedKey();
          const type = this.categories()
            .getData()
            .find((category) => category.id == id).Type;
          this.getView().getModel("type").setProperty("/Type", type);
        },
        timeToDate: function (modifyTime, date) {
          const time = new Date();
          time.setFullYear(date.split(".")[2]);
          time.setMonth(date.split(".")[1] - 1);
          time.setDate(date.split(".")[0]);
          time.setHours(modifyTime.getHours());
          time.setMinutes(modifyTime.getMinutes());
          return time;
        },
        onOkModify: async function () {
          const date = this.byId("modifyStartDate").getValue();
          const modifyStartTime = new Date(
            this.byId("modifyStartTime").getDateValue()
          );
          const modifyEndTime = new Date(
            this.byId("modifyEndTime").getDateValue()
          );
          const startTime = this.timeToDate(modifyStartTime, date);
          const endTime = this.timeToDate(modifyEndTime, date);
          const result = {
            Day: this.byId("modifyStartDate").getValue(),
            StartTime: startTime,
            EndTime: endTime,
            Duration: 0,
            Description: this.byId("modifyDescription").getValue(),
            Category: this.byId("modifyCategory").getSelectedItem().getKey(),
          };
          const id = this.byId("modifyId").getText();
          if (id == "") {
            await this.createEntry(result);
          } else {
            result["id"] = id;
            await this.editEntry(result);
          }
          this.onCloseModify();
        },
        onCloseModify: function () {
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

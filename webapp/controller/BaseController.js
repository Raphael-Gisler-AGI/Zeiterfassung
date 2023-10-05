sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend(
      "sap.ui.agi.zeiterfassung.controller.BaseController",
      {
        // Navigation
        onNavigateTime: function () {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("time");
        },
        onNavigateCalendar: function () {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("calendar");
        },
        onNavigateStatistics: function () {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("statistics")
        },
        // Refresh Global Models
        refreshEntries: async function () {
          const data = await fetch(`${this.baseUrl}getEntries`).then((res) => {
            return res.json();
          });
          this.convertToDate(data);
          this.entries().setData(data);
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
          )
            .then((res) => {
              return res.status;
            })
            .then(this.refreshEntries());
        },
        editEntry: async function (data) {
          return await fetch(
            `${this.baseUrl}editEntry?data=${JSON.stringify(data)}`
          )
            .then((res) => {
              return res.status;
            })
            .then(this.refreshEntries());
        },
        deleteTime: async function (id) {
          return await fetch(`${this.baseUrl}deleteEntry?id=${id}`)
            .then((res) => {
              return res.status;
            })
            .then(this.refreshEntries());
        },
        saveDefault: async function (data) {
          return await fetch(
            `${this.baseUrl}saveDefault?data=${JSON.stringify(data)}`
          ).then((res) => {
            return res.status;
          });
        },
        convertToDate: function (entries) {
          entries.forEach((entry) => {
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
        dayToDate: function (day) {
          return new Date(
            day.split(".")[0],
            day.split(".")[1] - 1,
            day.split(".")[2],
            0,
            0,
            0,
            0
          );
        },
        timeToDate: function (modifyTime, day) {
          const time = this.dayToDate(day);
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
          const duration = new Date(endTime - startTime);
          duration.setHours(duration.getHours() - 1);
          const result = {
            Day: date,
            StartTime: startTime,
            EndTime: endTime,
            Duration: `${duration.getHours()}:${duration.getMinutes()}`,
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
        setModifyCreateValues: function (date, startTime, endTime) {
          this.byId("modifyId").setText("");
          this.byId("modifyDescription").setValue(
            this.default().getProperty("/Description")
          );
          this.byId("modifyCategory").setSelectedKey(
            this.default().getProperty("/Category")
          );
          this.byId("modifyStartDate").setDateValue(date);
          this.byId("modifyStartTime").setDateValue(startTime);
          this.byId("modifyEndTime").setDateValue(endTime);
        },
        setModifyEditValues: function (
          id,
          description,
          category,
          day,
          startTime,
          endTime
        ) {
          this.byId("modifyId").setText(id);
          this.byId("modifyDescription").setValue(description);
          this.byId("modifyCategory").setSelectedKey(category);
          this.byId("modifyStartDate").setDateValue(day);
          this.byId("modifyStartTime").setDateValue(startTime);
          this.byId("modifyEndTime").setDateValue(endTime);
        },
      }
    );
  }
);

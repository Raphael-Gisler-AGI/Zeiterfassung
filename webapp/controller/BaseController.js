sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, MessageToast) {
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
          oRouter.navTo("statistics");
        },
        // Refresh Global Models
        refresh: async function () {
          const [entries, categories] = await Promise.all([
            fetch(`${this.baseUrl}getEntries`).then((res) => res.json()),
            fetch(`${this.baseUrl}getCategories`).then((res) => res.json()),
          ]);
          this.convertToDate(entries);
          this.entries().setData(entries);
          this.categories().setData(categories)
        },
        // Get Global Models
        entries: function () {
          const entries = this.getOwnerComponent().getModel("entries");
          if (!Array.isArray(entries.getData())) {
            this.getOwnerComponent().setModel(new JSONModel([]), "entries");
            return this.getOwnerComponent().getModel("entries");
          }
          return entries;
        },
        categories: function () {
          return this.getOwnerComponent().getModel("categories");
        },
        default: function () {
          return this.getOwnerComponent().getModel("default");
        },
        getTimer: function () {
          return this.getOwnerComponent().getModel("timer");
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
            .then(this.refresh());
        },
        editEntry: async function (data) {
          return await fetch(
            `${this.baseUrl}editEntry?data=${JSON.stringify(data)}`
          )
            .then((res) => {
              return res.status;
            })
            .then(this.refresh());
        },
        deleteEntry: async function (id) {
          return await fetch(`${this.baseUrl}deleteEntry?id=${id}`)
            .then((res) => {
              return res.status;
            })
            .then(this.refresh());
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
        runTimer: function () {
          const timer = this.getTimer();
          this.timer = setInterval(() => {
            timer.setProperty("/time", timer.getProperty("/time") + 1);
            timer.setProperty(
              "/timeDisplay",
              this.formatDate(timer.getProperty("/time"))
            );
          }, 1000);
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
        changeType: function (id) {
          const type = this.categories()
            .getData()
            .find((category) => category.id == id).Type;
          this.getView().getModel("type").setProperty("/Type", type);
        },
        onChangeCategoryModify: function (oEvent) {
          const id = oEvent.getSource().getSelectedKey();
          this.changeType(id);
        },
        dayToDate: function (day) {
          return new Date(
            day.getFullYear(),
            day.getMonth(),
            day.getDate(),
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
          const type = this.getView().getModel("type").getProperty("/Type");
          const date = this.byId("modifyStartDate");
          const modifyStartTime = new Date(
            this.byId("modifyStartTime").getDateValue()
          );
          const modifyEndTime = new Date(
            this.byId("modifyEndTime").getDateValue()
          );
          let startTime;
          let endTime;
          if (type == 2) {
            startTime = this.dayToDate(date.getDateValue());
            endTime = this.byId("modifyEndDate").getDateValue();
          } else {
            startTime = this.timeToDate(modifyStartTime, date.getDateValue());
            endTime = this.timeToDate(modifyEndTime, date.getDateValue());
          }
          if (startTime > endTime) {
            MessageToast.show(
              "The End Time has to be larger than the Start Time"
            );
            return;
          }
          const day =
            type == 2
              ? `${date.getValue()} - ${this.byId("modifyEndDate").getValue()}`
              : date.getValue();
          await this.beforeCreateEntry(
            day,
            startTime,
            endTime,
            this.byId("modifyDescription").getValue(),
            this.byId("modifyCategory").getSelectedKey(),
            this.byId("modifyId").getText()
          );
          this.onCloseModify();
        },
        beforeCreateEntry: async function (
          day,
          startTime,
          endTime,
          description,
          category,
          id
        ) {
          const durationDate = new Date(endTime - startTime);
          const duration =
            durationDate.getMinutes() + (durationDate.getHours() - 1) * 60;
          const result = {
            Day: day,
            StartTime: startTime,
            EndTime: endTime,
            Duration: duration,
            Description: description,
            Category: category,
          };
          if (id == "") {
            await this.createEntry(result);
          } else {
            result["id"] = id;
            await this.editEntry(result);
          }
        },
        onCloseModify: function () {
          this.byId("modifyDialog").close();
        },
        formatDate: function (date) {
          return new Date(date * 1000).toISOString().substring(11, 19);
        },
        setModifyCreateValues: function (date, startTime, endTime) {
          this.byId("modifyId").setText("");
          this.byId("modifyDescription").setValue(
            this.default().getProperty("/Description")
          );
          this.byId("modifyCategory").setSelectedKey(
            this.default().getProperty("/Category")
          );
          this.changeType(this.default().getProperty("/Category"));
          this.byId("modifyStartDate").setDateValue(date);
          this.byId("modifyStartTime").setDateValue(startTime);
          this.byId("modifyEndTime").setDateValue(endTime);
        },
        setModifyEditValues: function (
          id,
          description,
          category,
          startTime,
          endTime
        ) {
          this.byId("modifyId").setText(id);
          this.byId("modifyDescription").setValue(description);
          this.byId("modifyCategory").setSelectedKey(category);
          this.changeType(category);
          this.byId("modifyStartDate").setDateValue(this.dayToDate(startTime));
          this.byId("modifyEndDate").setDateValue(this.dayToDate(endTime));
          this.byId("modifyStartTime").setDateValue(startTime);
          this.byId("modifyEndTime").setDateValue(endTime);
        },
      }
    );
  }
);

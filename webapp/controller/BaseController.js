sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, JSONModel, MessageToast, History, UIComponent) {
    "use strict";

    return Controller.extend(
      "sap.ui.agi.zeiterfassung.controller.BaseController",
      {
        // Navigation
        onNavBack() {
          const router = UIComponent.getRouterFor(this);
          const oHistory = History.getInstance();
          const sPreviousHash = oHistory.getPreviousHash();
          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            router.navTo("time", {});
          }
        },
        // Refresh Global Models
        async refresh() {
          const [entries, categories] = await Promise.all([
            fetch(`${this.baseUrl}getEntries`).then((res) => res.json()),
            fetch(`${this.baseUrl}getCategories`).then((res) => res.json()),
          ]);
          entries.forEach((entry) => {
            entry.StartTime = new Date(entry.StartTime);
            entry.EndTime = new Date(entry.EndTime);
          });
          this.entries().setData(entries);
          if (this.getTimer().getProperty("/active")) {
            this.addTimerToEntries();
          }
          this.categories().setData(categories);
        },
        addTimerToEntries() {
          const category =
            this.getTimer().getProperty("/category") ||
            this.default().getProperty("/category");
          const endTime = new Date();
          this.entries()
            .getData()
            .push({
              Day: "Active Timer",
              StartTime: new Date(localStorage.getItem("startTime")),
              EndTime: endTime,
              Duration: this.getDuration(
                new Date(localStorage.getItem("startTime")),
                endTime
              ),
              Description: this.getTimer().getProperty("/description"),
              Category: category,
            });
          this.entries().refresh();
          this.runTimer();
        },
        // Get Global Models
        entries() {
          return this.getOwnerComponent().getModel("entries");
        },
        categories() {
          return this.getOwnerComponent().getModel("categories");
        },
        default() {
          return this.getOwnerComponent().getModel("default");
        },
        getTimer() {
          return this.getOwnerComponent().getModel("timer");
        },
        messages() {
          return this.getOwnerComponent().getModel("messages");
        },
        // Create Edit Delete
        baseUrl: "http://localhost:3000/",
        async createEntry(data) {
          return await fetch(
            `${this.baseUrl}createEntry?data=${JSON.stringify(data)}`
          )
            .then((res) => {
              return res.status;
            })
            .then(this.refresh());
        },
        async editEntry(data) {
          return await fetch(
            `${this.baseUrl}editEntry?data=${JSON.stringify(data)}`
          )
            .then((res) => {
              return res.status;
            })
            .then(this.refresh());
        },
        async deleteEntry(id) {
          return await fetch(`${this.baseUrl}deleteEntry?id=${id}`)
            .then((res) => {
              return res.status;
            })
            .then(this.refresh());
        },
        async saveDefault(data) {
          return await fetch(
            `${this.baseUrl}saveDefault?data=${JSON.stringify(data)}`
          ).then((res) => {
            return res.status;
          });
        },
        getDuration(startTime, endTime) {
          const durationDate = new Date(endTime - startTime);
          return durationDate.getMinutes() + (durationDate.getHours() - 1) * 60;
        },
        onPressCreate() {
          this.onOpenModify("Create Entry", () => {
            const startTime = new Date();
            startTime.setHours(startTime.getHours() - 1);
            this.setModifyCreateValues(new Date(), startTime, new Date());
          });
        },
        onOpenModify(title, setValues) {
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
        getCategoryType(category) {
          return this.categories()
            .getData()
            .find((c) => c.id == category).Type;
        },
        changeType(id) {
          this.getView()
            .getModel("type")
            .setProperty("/Type", this.getCategoryType(id));
        },
        onChangeCategoryModify(oEvent) {
          const id = oEvent.getSource().getSelectedKey();
          this.changeType(id);
        },
        dayToDate(day) {
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
        timeToDate(modifyTime, day) {
          const time = this.dayToDate(day);
          time.setHours(modifyTime.getHours());
          time.setMinutes(modifyTime.getMinutes());
          return time;
        },
        async onOkModify() {
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
        async beforeCreateEntry(
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
          if (!id) {
            await this.createEntry(result);
          } else {
            result["id"] = id;
            await this.editEntry(result);
          }
        },
        onCloseModify() {
          this.byId("modifyDialog").close();
        },
        setRoundedMinutes(time) {
          return time.setMinutes(Math.round(time.getMinutes() / 15) * 15);
        },
        setModifyCreateValues(date, startTime, endTime) {
          const category = this.default().getProperty("/Category");
          const type = this.getCategoryType(category);
          if (type == 0) {
            this.setRoundedMinutes(startTime);
            this.setRoundedMinutes(endTime);
          }
          this.byId("modifyId").setText("");
          this.byId("modifyDescription").setValue(
            this.default().getProperty("/Description")
          );
          this.byId("modifyCategory").setSelectedKey(category);
          this.changeType(category);
          this.byId("modifyStartDate").setDateValue(date);
          this.byId("modifyStartTime").setDateValue(startTime);
          this.byId("modifyEndTime").setDateValue(endTime);
        },
        setModifyEditValues(id, description, category, startTime, endTime) {
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

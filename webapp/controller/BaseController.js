sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
  ],
  function (
    Controller,
    formatter,
    JSONModel,
    MessageToast,
    History,
    UIComponent
  ) {
    "use strict";

    return Controller.extend(
      "sap.ui.agi.zeiterfassung.controller.BaseController",
      {
        formatter: formatter,
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
        async refresh(newData) {
          const { entries, categories } = newData;
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
          const category = this.getTimer().getProperty("/category") || "";
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
        favorites() {
          return this.getOwnerComponent().getModel("favorites");
        },
        getTimer() {
          return this.getOwnerComponent().getModel("timer");
        },
        messages() {
          return this.getOwnerComponent().getModel("messages");
        },
        modify() {
          return this.getView().getModel("modify");
        },

        // Create Edit Delete
        baseUrl: "http://localhost:3000/",
        async createEntry(data) {
          const res = await fetch(`${this.baseUrl}createEntry`, {
            method: "POST",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify(data),
          });
          this.refresh(await res.json());
          return res.status;
        },
        async editEntry(data, id) {
          const res = await fetch(`${this.baseUrl}editEntry/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          });
          this.refresh(await res.json());
          return res.status;
        },
        async deleteEntry(id) {
          const res = await fetch(`${this.baseUrl}deleteEntry/${id}`, {
            method: "DELETE",
          });
          this.refresh(await res.json());
          return res.status;
        },
        async createFavorite(data) {
          const res = await fetch(`${this.baseUrl}createFavorite`, {
            method: "POST",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify(data),
          });
          this.favorites().setData(await res.json());
          return res.status;
        },
        async editFavorite(data, id) {
          const res = await fetch(`${this.baseUrl}editFavorite/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          });
          this.favorites().setData(await res.json());
          return res.status;
        },
        async deleteFavorite(id) {
          const res = await fetch(`${this.baseUrl}deleteFavorite/${id}`, {
            method: "DELETE",
          });
          this.favorites().setData(await res.json());
          return res.status;
        },

        // Before CRUD
        async beforeCreate() {
          const modifyData = this.getView().getModel("modify").getData();
          const data = {
            Day: modifyData.startDay,
            StartTime: modifyData.startTime,
            EndTime: modifyData.endTime,
            Duration: this.getDuration(
              modifyData.startTime,
              modifyData.endTime
            ),
            Description: modifyData.description,
            Category: modifyData.category,
          };
          let res = 0;
          switch (modifyData.creationType) {
            case 0:
              res = await this.createEntry(data);
              break;
            case 1:
              res = await this.editEntry(data, modifyData.id);
              break;
            case 2:
              delete data["Duration"];
              res = await this.createFavorite(data);
              break;
            case 3:
              delete data["Duration"];
              res = await this.editFavorite(data, modifyData.id);
              break;
          }
          console.log(res);
        },
        async beforeDeleteEntry(id) {
          const res = await this.deleteEntry(id);
          console.log(res);
          this.displayResponse(
            res,
            "Entry has been deleted",
            "Failed to delete an entry\nPlease try again"
          );
        },
        displayResponse(res, successMessage, rejectMessage) {
          if (res === 200) {
            MessageToast.show(successMessage);
          } else {
            MessageToast.show(rejectMessage);
          }
        },
        runTimer() {
          const timer = this.getTimer();
          const current = this.getRunningEntry();
          this.timer = setInterval(() => {
            timer.setProperty("/time", timer.getProperty("/time") + 1);
            if (timer.getProperty("/time") % 60 == 0) {
              const endTime = new Date();
              current.EndTime = endTime;
              current.Duration = this.getDuration(
                new Date(localStorage.getItem("startTime")),
                endTime
              );
              this.entries().refresh();
            }
          }, 1000);
        },
        getRunningEntry() {
          const entries = this.entries().getData();
          return entries[entries.length - 1];
        },
        getDuration(startTime, endTime) {
          const durationDate = new Date(endTime - startTime);
          return (
            durationDate.getMinutes() + (durationDate.getHours() - 1) * 60 ||
            undefined
          );
        },
        onOpenModify(modifyModel) {
          this.getView().setModel(new JSONModel(modifyModel), "modify");
          if (!this.pDialog) {
            this.pDialog = this.loadFragment({
              name: "sap.ui.agi.zeiterfassung.view.Modify",
            });
          }
          this.pDialog.then(function (oDialog) {
            oDialog.open();
          });
        },
        getCategoryType(category) {
          return this.categories()
            .getData()
            .find((c) => c.id == category)?.Type;
        },
        setModifyType(oEvent) {
          const id = oEvent.getSource().getSelectedKey();
          this.modify().setProperty("/type", this.getCategoryType(id));
        },
        dateToDay(date) {
          let month = date.getMonth() + 1;
          month = month < 10 ? `0${month}` : month;
          return `${date.getFullYear()}.${month}.${date.getDate()}`;
        },
        timeToDate(date, time) {
          return Date.parse(`${date} ${time}`);
        },
        async onOkModify() {
          const modify = this.getView().getModel("modify").getData();
          // Error handling
          if (modify.creationType < 2) {
            if (!modify.description) {
              MessageToast.show("Please fill in a description");
              return;
            }
            if (!modify.category) {
              MessageToast.show("Please select a category");
              return;
            }
            if (!modify.startDay) {
              MessageToast.show("no startday?");
              return;
            }
          }
          if (modify.startTime > modify.endTime) {
            MessageToast.show(
              "The End Time has to be larger than the Start Time"
            );
            return;
          }
          if (modify.startDay) {
            modify.startDay = this.dateToDay(modify.startDay);
          }
          if (modify.endDay) {
            modify.endDay = this.dateToDay(modify.endDay);
          }
          // Formatting Time
          modify.startTime = modify.startTime
            ? this.timeToDate(
                modify.startDay || this.dateToDay(new Date()),
                modify.type != 2 ? modify.startTime || "00:00" : "00:00"
              )
            : undefined;
          modify.endTime = modify.endTime
            ? this.timeToDate(
                modify.type != 2
                  ? modify.startDay || this.dateToDay(new Date())
                  : modify.endDay || this.dateToDay(new Date()),
                modify.type != 2 ? modify.endTime || "00:00" : "00:00"
              )
            : undefined;
          // Format Day
          if (modify.type == 2) {
            modify.startDay = `${modify.startDay} - ${modify.endDay}`;
          }
          await this.beforeCreate();
          this.onCloseModify();
        },
        onCloseModify() {
          this.byId("modifyDialog").close();
        },
        formatTime(time) {
          if (!time) {
            return undefined;
          }
          return `${
            time.getHours() < 10 ? "0" + time.getHours() : time.getHours()
          }:${
            time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes()
          }`;
        },
      }
    );
  }
);

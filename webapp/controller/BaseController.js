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
        baseUrl: "http://localhost:3000",
        CREATION_TYPE: {
          CREATE_ENTRY: 0,
          UPDATE_ENTRY: 1,
          CREATE_FAVORITE: 2,
          UPDATE_FAVORITE: 3,
        },

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
          this.getEntriesModel().setData(entries);
          if (this.getTimer().getProperty("/active")) {
            this.addTimerToEntries();
          }
          this.getCategoriesModel().setData(categories);
        },
        addTimerToEntries() {
          const category = this.getTimer().getProperty("/category") || -1;
          const startTime = Date.parse(localStorage.getItem("startTime"));
          const endTime = Date.now();
          this.getEntriesModel()
            .getData()
            .push({
              timer: true,
              StartTime: startTime,
              EndTime: endTime,
              Duration: this.getDuration(startTime, endTime),
              Description: this.getTimer().getProperty("/description"),
              Category: category,
            });
          this.getEntriesModel().refresh();
        },
        // Get Global Models
        getModel(modelName) {
          return this.getOwnerComponent().getModel(modelName);
        },
        getEntriesModel() {
          return this.getModel("entries");
        },
        getCategoriesModel() {
          return this.getModel("categories");
        },
        getFavoritesModel() {
          return this.getModel("favorites");
        },
        getTimer() {
          return this.getOwnerComponent().getModel("timer");
        },
        getMessagesModel() {
          return this.getModel("messages");
        },
        modify() {
          return this.getView().getModel("modify");
        },

        // CRUD Operations
        async _postEntry(url, method, data) {
          const res = await fetch(`${this.baseUrl}${url}`, {
            method: method,
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify(data),
          });
          this.refresh(await res.json());
          return res.status;
        },
        async createEntry(data) {
          return await this._postEntry("/createEntry", "POST", data);
        },
        async editEntry(data, id) {
          return await this._postEntry(`/editEntry/${id}`, "PATCH", data);
        },
        async deleteEntry(id) {
          const res = await fetch(`${this.baseUrl}/deleteEntry/${id}`, {
            method: "DELETE",
          });
          this.refresh(await res.json());
          return res.status;
        },
        async createFavorite(data) {
          const res = await fetch(`${this.baseUrl}/createFavorite`, {
            method: "POST",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify(data),
          });
          this.getFavoritesModel().setData(await res.json());
          return res.status;
        },
        async editFavorite(data, id) {
          const res = await fetch(`${this.baseUrl}/editFavorite/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          });
          this.getFavoritesModel().setData(await res.json());
          return res.status;
        },
        async deleteFavorite(id) {
          const res = await fetch(`${this.baseUrl}/deleteFavorite/${id}`, {
            method: "DELETE",
          });
          this.getFavoritesModel().setData(await res.json());
          return res.status;
        },

        // Before CRUD
        async beforeCreate() {
          const modifyData = this.getView().getModel("modify").getData();
          const data = {
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
            case this.CREATION_TYPE.CREATE_ENTRY:
              res = await this.createEntry(data);
              break;
            case this.CREATION_TYPE.UPDATE_ENTRY:
              res = await this.editEntry(data, modifyData.id);
              break;
            case this.CREATION_TYPE.CREATE_FAVORITE:
              delete data["Duration"];
              data.Name = modifyData.name;
              res = await this.createFavorite(data);
              break;
            case this.CREATION_TYPE.UPDATE_FAVORITE:
              delete data["Duration"];
              data.Name = modifyData.name;
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
        getRunningEntry() {
          const entries = this.getEntriesModel().getData();
          return entries[entries.length - 1];
        },
        getDuration(startTime, endTime) {
          const durationDate = new Date(endTime - startTime);
          const result =
            durationDate.getMinutes() + (durationDate.getHours() - 1) * 60;
          return result === NaN ? undefined : result;
        },
        dialogModifyOpen(modifyModel) {
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
          return this.getCategoriesModel()
            .getData()
            .find((c) => c.id == category)?.Type;
        },
        setModifyType(oEvent) {
          const id = oEvent.getSource().getSelectedKey();
          this.modify().setProperty("/type", this.getCategoryType(id));
        },
        dateToDay(date) {
          date = new Date(date);
          let month = date.getMonth() + 1;
          month = month < 10 ? `0${month}` : month;
          return `${date.getFullYear()}.${month}.${date.getDate()}`;
        },
        timeToDate(date, time) {
          if (!date && !time) {
            return undefined;
          }
          return Date.parse(
            `${date || this.dateToDay(new Date())} ${time || "00:00"}`
          );
        },
        modifyErrorHandling(modify) {
          if (modify.creationType < 2) {
            if (!modify.description) {
              return "Please fill in a description";
            }
            if (!modify.category) {
              return "Please select a category";
            }
            if (!modify.startDay) {
              return "Please select a start day";
            }
            if (modify.type != 2) {
              if (!modify.startTime) {
                return "Please select a start time";
              }
              if (!modify.endTime) {
                return "Please select an end time";
              }
            } else {
              if (!modify.endDay) {
                return "Please select an end day";
              }
            }
          }
          if (modify.startTime > modify.endTime) {
            return "The End Time has to be larger than the Start Time";
          }
          return "";
        },
        async onOkModify() {
          const modify = this.getView().getModel("modify").getData();
          // Error handling
          const error = this.modifyErrorHandling(modify);
          if (error != "") {
            return MessageToast.show(error);
          }
          // Format Days
          if (modify.startDay) {
            modify.startDay = this.dateToDay(modify.startDay);
          }
          if (modify.endDay) {
            modify.endDay = this.dateToDay(modify.endDay);
          }
          // Formatting Time
          modify.startTime = this.timeToDate(
            modify.startDay,
            modify.type != 2 ? modify.startTime : "00:00"
          );
          modify.endTime = this.timeToDate(
            modify.type != 2 ? modify.startDay : modify.endDay,
            modify.type != 2 ? modify.endTime : "00:00"
          );
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
          if (typeof time == "number") {
            time = new Date(time);
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

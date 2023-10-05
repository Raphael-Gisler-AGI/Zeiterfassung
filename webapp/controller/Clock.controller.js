sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/util/Storage",
  ],
  function (BaseController, JSONModel, MessageToast, Storage) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Clock", {
      onInit: function () {
        this.convertToDate(this.entries().getData());
        this.setDefaultTimer();
        if (!Storage.get("time")) {
          return;
        }
        const time = Math.round(
          (new Date() - new Date(Storage.get("time"))) / 1000
        );
        this.getTimer().setProperty("/time", time);
        this.getTimer().setProperty("/timeDisplay", this.formatDate(time));
        this.getTimer().setProperty("/active", true);
        this.runTimer();
      },
      setDefaultTimer: function () {
        this.getView().setModel(
          new JSONModel({
            description: "",
            category: "",
            active: false,
            time: 3600,
            timeDisplay: "00:00:00",
          }),
          "timer"
        );
      },
      resetTimer: function () {
        clearInterval(this.timer);
        Storage.remove("time");
        this.setDefaultTimer();
      },
      getTimer: function () {
        return this.getView().getModel("timer");
      },
      runTimer: function () {
        const timer = this.getView().getModel("timer");
        this.timer = setInterval(() => {
          timer.setProperty("/time", timer.getProperty("/time") + 1);
          timer.setProperty(
            "/timeDisplay",
            this.formatDate(timer.getProperty("/time"))
          );
        }, 1000);
      },
      onPressActivate: function () {
        const timer = this.getView().getModel("timer");
        if (!timer.getProperty("/active")) {
          timer.setProperty("/active", true);
          Storage.put("time", new Date());
          this.runTimer();
        } else {
          this.onSave();
        }
      },
      onSetCategory: function (oEvent) {
        this.getTimer().setProperty(
          "/category",
          oEvent.getSource().getSelectedKey()
        );
      },
      onSave: async function () {
        let errorMessage = "";
        const timer = this.getTimer();
        if (!timer.getProperty("/category")) {
          errorMessage = "Please select a category";
        }
        if (!timer.getProperty("/description")) {
          errorMessage = "Please add a description";
        }
        if (errorMessage != "") {
          MessageToast.show(errorMessage);
          return;
        }
        timer.setProperty("/active", false);
        const startTime = new Date(Storage.get("time"));
        const endTime = new Date();
        const duration = new Date(endTime - startTime);
        const result = {
          Day: startTime.toISOString().split("T")[0],
          StartTime: startTime,
          EndTime: endTime,
          Duration: `${duration.getUTCHours()}:${duration.getUTCMinutes()}`,
          Description: timer.getProperty("/description"),
          Category: timer.getProperty("/category"),
        };
        this.createEntry(result);
        this.resetTimer();
      },
      onPressCreate: function () {
        this.onOpenModify("Create Entry", () => {
          const startTime = new Date();
          startTime.setHours(startTime.getHours() - 1);
          this.setModifyCreateValues(new Date(), startTime, new Date());
        });
      },
    });
  }
);

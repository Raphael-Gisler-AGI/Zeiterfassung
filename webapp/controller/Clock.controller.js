sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/util/Storage",
    "../model/categories",
  ],
  function (BaseController, JSONModel, MessageToast, Storage, categories) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Clock", {
      onInit: function () {
        this.convertToDate();
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
            time: 0,
            timeDisplay: "00:00:00",
          }),
          "timer"
        );
      },
      getTimer: function () {
        return this.getView().getModel("timer");
      },
      formatDate: (date) => {
        return new Date(date * 1000).toISOString().substring(11, 19);
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
        const duration = this.formatDate(
          Math.round((endTime - startTime) / 1000)
        );
        const result = {
          Day: startTime.toISOString().split("T")[0],
          StartTime: startTime,
          EndTime: endTime,
          Duration: duration,
          Description: timer.getProperty("/description"),
          Category: timer.getProperty("/category"),
        };
        await fetch(
          `http://localhost:3000/createEntry?data=${JSON.stringify(result)}`
        ).then((res) => console.log(res));

        clearInterval(this.timer);
        Storage.remove("time");
        this.setDefaultTimer();
      },
      onPressCreate: function () {
        this.getView().setModel(
          new JSONModel({
            description: "heheheeha",
          }),
          "modify"
        );
        this.onOpenModify("Create Entry");
      },
    });
  }
);

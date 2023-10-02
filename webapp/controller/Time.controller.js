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
        this.convertToDate();
        console.log(this.categories().getData());
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
      runTimer: function () {
        const timer = this.getView().getModel("timer");
        this.timer = setInterval(() => {
          timer.setProperty("/time", timer.getProperty("/time") + 1);
          timer.setProperty(
            "/timeDisplay",
            new Date(timer.getProperty("/time") * 1000)
              .toISOString()
              .substring(11, 19)
          );
        }, 1000);
      },
      onPressActivate: function () {
        const timer = this.getView().getModel("timer");
        timer.setProperty("/active", !timer.getProperty("/active"));
        if (timer.getProperty("/active")) {
          Storage.put("time", new Date());
          this.runTimer();
        } else {
          clearInterval(this.timer);
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
        if (errorMessage != "") {
          MessageToast.show(errorMessage);
          return;
        }
        const timer = this.getTimer();
        const startTime = new Date(Storage.get("time"));
        const result = {
          Day: startTime.toISOString().split("T")[0],
          StartTime: startTime,
          EndTime: new Date(),
          Description: timer.getProperty("/description"),
          Category: timer.getProperty("/category"),
        };
        await fetch(
          `http://localhost:3000/createEntry?data=${JSON.stringify(result)}`
        ).then((res) => console.log(res));
        this.onInit();
      },
      onPressDelete: function (oEvent) {
        const oItem = oEvent.getSource();
        const id = oItem.getBindingContext("entries").getProperty("id");
        this.deleteTime(id);
      },
    });
  }
);

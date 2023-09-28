sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast"],
  function (BaseController, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Clock", {
      onInit: function () {
        console.log(this.getOwnerComponent().getModel("entries").getData());
        this.getView().setModel(
          new JSONModel({
            time: 0,
            active: false,
            Description: "",
          }),
          "Timer"
        );
      },
      onPressActivate: function () {
        const timer = this.getView().getModel("Timer").getData();
        timer.active = !timer.active;
        this.getView().getModel("Timer").refresh();
        if (!this.startTime) {
          this.startTime = new Date();
        }
        if (timer.active) {
          this.counter = setInterval(() => {
            timer.time++;
            this.getView().getModel("Timer").refresh();
          }, 1000);
        } else {
          clearInterval(this.counter);
        }
      },
      onPressSave: async function () {
        if (!this.startTime) {
          MessageToast.show("Please start the timer before saving");
          return;
        }
        const data = this.getView().getModel("Timer").getData();
        const result = {
          Day: this.startTime.toISOString().split("T")[0],
          StartTime: this.startTime.toString(),
          EndTime: new Date(),
          Duration: data.time,
          Description: data.Description,
        };
        await fetch(
          `http://localhost:3000/createEntry?data=${JSON.stringify(result)}`
        ).then((res) => console.log(res));
        data.time = 0;
        this.getView().getModel("Timer").refresh();
        this.startTime = undefined;
        this.getOwnerComponent().getModel("entries").getData().push(result);
        this.getOwnerComponent().getModel("entries").refresh();
      },
    });
  }
);

sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast"],
  function (BaseController, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Clock", {
      onInit: function () {
        this.convertToDate();
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
        console.log(this.startTime);
        const result = {
          Day: this.startTime.toISOString().split("T")[0],
          StartTime: this.startTime,
          EndTime: new Date(),
          Duration: data.time,
          Description: data.Description,
        };
        await fetch(
          `http://localhost:3000/createEntry?data=${JSON.stringify(result)}`
        ).then((res) => console.log(res));
        data.time = 0;
        data.active = false;
        this.getView().getModel("Timer").refresh();
        this.startTime = undefined;
        clearInterval(this.counter);
        this.getOwnerComponent().getModel("entries").getData().push(result);
        this.getOwnerComponent().getModel("entries").refresh();
      },
      onPressDelete: function (oEvent) {
        const oItem = oEvent.getSource();
        const id = oItem.getBindingContext("entries").getProperty("id");
        this.deleteTime(id);
      },
    });
  }
);

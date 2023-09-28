sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast"],
  function (BaseController, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Clock", {
      onInit: function () {
        this.getView().setModel(
          new JSONModel({
            time: 0,
            active: false,
            Description: "",
          }),
          "Timer"
        );
        this.getView().setModel(
          new JSONModel([
            {
              Day: "2023-09-28",
              StartTime: this.startTime,
              EndTime: this.endTime,
              Duration: "3",
              Description: "ösldfasödlfj",
            },
            {
              Day: "2023-09-28",
              StartTime: this.startTime,
              EndTime: this.endTime,
              Duration: "3",
              Description: "ösldfasödlfj",
            },
            {
              Day: "2023-09-29",
              StartTime: this.startTime,
              EndTime: this.endTime,
              Duration: "3",
              Description: "ösldfasödlfj",
            },
          ])
        );

        console.log(this.test);
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
      onPressSave: function () {
        if (!this.startTime) {
          MessageToast.show("Please start the timer before saving");
          return;
        }
        const data = this.getView().getModel("Timer").getData();
        this.endTime = new Date();
        this.getView()
          .getModel()
          .getData()
          .push({
            Day: this.startTime.toISOString().split("T")[0],
            StartTime: this.startTime,
            EndTime: this.endTime,
            Duration: data.time,
            Description: data.Description,
          });
        data.time = 0;
        this.getView().getModel("Timer").refresh();
        this.getView().getModel().refresh();
        this.startTime = undefined;
        this.endTime = undefined;
      },
    });
  }
);

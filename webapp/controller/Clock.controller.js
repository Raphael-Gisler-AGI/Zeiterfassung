sap.ui.define(
  [
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (BaseController, formatter, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Clock", {
      formatter: formatter,
      onInit: function () {
        this.convertToDate(this.entries().getData());
        this.setDefaultTimer();
        if (!localStorage.getItem("startTime")) {
          return;
        }
        MessageToast.show("heheheha", {duration: 900000});
        const newDuration =
          Math.floor(new Date() - new Date(localStorage.getItem("startTime"))) /
          1000;
        this.getTimer().setProperty("/time", newDuration);
        this.getTimer().setProperty("/active", true);
        this.runTimer();
      },
      setDefaultTimer: function () {
        this.getOwnerComponent().setModel(
          new JSONModel({
            description: "",
            category: "",
            active: false,
            id: "",
            time: 0,
          }),
          "timer"
        );
      },
      onPressActivate: function () {
        this.getTimer().setProperty("/active", true);
        localStorage.setItem("startTime", new Date());
        this.runTimer();
      },
      onPressReset: function () {
        clearInterval(this.timer);
        this.setDefaultTimer();
        localStorage.clear();
        this.getTimer().setProperty("/active", false);
        this.byId("clockCategory").setSelectedKey("");
      },
      onPressSave: async function () {
        const timer = this.getTimer();
        const description = timer.getProperty("/description");
        const category = timer.getProperty("/category");
        if (!description) {
          MessageToast.show("Please add a description");
          return;
        }
        if (!category) {
          MessageToast.show("Please select a category");
          return;
        }
        const day = new Date().toISOString();
        this.beforeCreateEntry(
          day.split("T")[0].replaceAll("-", "."),
          new Date(localStorage.getItem("startTime")),
          new Date(),
          description,
          category,
          timer.getProperty("/id")
        );
        this.onPressReset();
      },
      onSetCategory: function (oEvent) {
        this.getTimer().setProperty(
          "/category",
          oEvent.getSource().getSelectedKey()
        );
      },
    });
  }
);

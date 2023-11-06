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
      onInit() {
        this.setDefaultTimer();
        if (!localStorage.getItem("startTime")) {
          return;
        }
        this.getMessagesModel().getData().push({
          type: "Information",
          title: "Timer",
          subtitle: "Still running",
          description: "Your timer is currently active",
        });
        const newDuration = Math.floor(
          Math.floor(new Date() - new Date(localStorage.getItem("startTime"))) /
            1000
        );
        this.getTimer().setProperty("/time", newDuration);
        const description = localStorage.getItem("description") || "";
        const category = localStorage.getItem("category") || "";
        this.getTimer().setProperty("/description", description);
        this.getTimer().setProperty("/category", category);
        this.byId("clockCategory").setSelectedKey(category);
        this.getTimer().setProperty("/active", true);
        this.addTimerToEntries();
        this.runTimer();
      },
      setDefaultTimer() {
        this.getOwnerComponent().setModel(
          new JSONModel({
            description: "",
            category: -1,
            active: false,
            time: 0,
          }),
          "timer"
        );
      },
      onPressClock() {
        const active = this.getTimer().getProperty("/active");
        if (active) {
          this.saveTimer();
        } else {
          this.getTimer().setProperty("/active", true);
          localStorage.setItem("startTime", new Date());
          this.addTimerToEntries();
          this.runTimer();
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
            this.getEntriesModel().refresh();
          }
        }, 1000);
      },
      onPressReset() {
        clearInterval(this.timer);
        this.timer = undefined;
        if (this.getTimer().getProperty("/active")) {
          this.getEntriesModel().getData().pop();
          this.getEntriesModel().refresh();
          const index = this.getMessagesModel()
            .getData()
            .map((message) => message.title)
            .indexOf("Timer");
          this.getMessagesModel().getData().splice(index, 1);
          this.getMessagesModel().refresh(true);
        }
        this.byId("clockCategory").setSelectedKey("");
        localStorage.clear();
        this.getTimer().setProperty("/active", false);
        this.setDefaultTimer();
      },
      async saveTimer() {
        const timer = this.getTimer();
        const description = timer.getProperty("/description");
        const category = timer.getProperty("/category");
        if (!description) {
          MessageToast.show("Please add a description");
          return;
        }
        if (!category || category < 0) {
          MessageToast.show("Please select a category");
          return;
        }
        const day = new Date().toISOString();
        this.getView().setModel(
          new JSONModel({
            creationType: 0,
            startDay: day.split("T")[0].replaceAll("-", "."),
            startTime: Date.parse(localStorage.getItem("startTime")),
            endTime: Date.now(),
            description: description,
            category: category,
          }),
          "modify"
        );
        await this.beforeCreate();
        this.onPressReset();
      },
      onSetCategory(oEvent) {
        const category = oEvent.getSource().getSelectedKey() || -1;
        localStorage.setItem("category", category);
        this.getRunningEntry().Category = category;
        this.getEntriesModel().refresh();
        this.getTimer().setProperty("/category", category);
      },
      onChangeDescription(oEvent) {
        const description = oEvent.getSource().getValue();
        localStorage.setItem("description", description);
        this.getRunningEntry().Description = description;
        this.getEntriesModel().refresh();
      },
    });
  }
);

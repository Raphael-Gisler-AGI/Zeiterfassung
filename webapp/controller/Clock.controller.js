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
        this.setDefaultTimer();
        if (!localStorage.getItem("startTime")) {
          return;
        }
        this.messages().getData().push({
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
        this.addTimerToEntries();
      },
      setDefaultTimer: function () {
        this.getOwnerComponent().setModel(
          new JSONModel({
            description: "",
            category: "",
            active: false,
            time: 0,
          }),
          "timer"
        );
      },
      addTimerToEntries: function () {
        this.getTimer().setProperty("/active", true);
        const category =
          this.getTimer().getProperty("/category") ||
          this.default().getProperty("/category");
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
      runTimer: function () {
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
      onPressClock: function () {
        const active = this.getTimer().getProperty("/active");
        if (active) {
          this.saveTimer();
        } else {
          this.getTimer().setProperty("/active", true);
          localStorage.setItem("startTime", new Date());
          this.addTimerToEntries();
        }
      },
      onPressReset: function () {
        clearInterval(this.timer);
        if (this.getTimer().getProperty("/active")) {
          this.entries().getData().pop();
          this.entries().refresh();
        }
        this.byId("clockCategory").setSelectedKey("");
        localStorage.clear();
        this.getTimer().setProperty("/active", false);
        this.setDefaultTimer();
      },
      saveTimer: async function () {
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
      getRunningEntry: function () {
        const entries = this.entries().getData();
        return entries[entries.length - 1];
      },
      onSetCategory: function (oEvent) {
        const category = oEvent.getSource().getSelectedKey();
        localStorage.setItem("category", category);
        this.getRunningEntry().Category = category;
        this.entries().refresh();
        this.getTimer().setProperty("/category", category);
      },
      onChangeDescription: function (oEvent) {
        const description = oEvent.getSource().getValue();
        localStorage.setItem("description", description);
        this.getRunningEntry().Description = description;
        this.entries().refresh();
      },
    });
  }
);

sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (BaseController, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Clock", {
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
        this.getTimerModel().setProperty("/time", newDuration);
        const description = localStorage.getItem("description") || "";
        const category = localStorage.getItem("category") || "";
        this.getTimerModel().setProperty("/description", description);
        this.getTimerModel().setProperty("/category", category);
        this.byId("clockCategory").setSelectedKey(category);
        this.getTimerModel().setProperty("/active", true);
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
        const active = this.getTimerModel().getProperty("/active");
        if (active) {
          this.saveTimer();
        } else {
          this.getTimerModel().setProperty("/active", true);
          localStorage.setItem("startTime", new Date());
          this.addTimerToEntries();
          this.runTimer();
        }
      },
      runTimer() {
        const timer = this.getTimerModel();
        const current = this.getRunningEntry();
        const startTime = new Date(localStorage.getItem("startTime"));
        this.timer = setInterval(() => {
          timer.setProperty("/time", (new Date() - startTime) / 1000);
          const endTime = new Date();
          current.EndTime = endTime;
          current.Duration = this.getDuration(
            new Date(localStorage.getItem("startTime")),
            endTime
          );
          this.getEntriesModel().refresh();
        }, 1000);
      },
      getRunningEntry() {
        const entries = this.getEntriesModel().getData();
        return entries[entries.length - 1];
      },
      onPressReset() {
        clearInterval(this.timer);
        this.timer = undefined;
        if (this.getTimerModel().getProperty("/active")) {
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
        this.getTimerModel().setProperty("/active", false);
        this.setDefaultTimer();
      },
      async saveTimer() {
        const timer = this.getTimerModel();
        const description = timer.getProperty("/description");
        const category = timer.getProperty("/category");
        let errorMessage = "";
        if (!description) {
          errorMessage = "Please add a description";
        }
        if (!category || category < 0) {
          errorMessage += `${errorMessage ? "\n" : ""}Please select a category`;
        }
        if (errorMessage != "") {
          return MessageToast.show(errorMessage);
        }
        const day = new Date().toISOString();
        this.getView().setModel(
          new JSONModel({
            creationType: this.CREATION_TYPE.CREATE_ENTRY,
            startDay: day.split("T")[0].replaceAll("-", "."),
            startTime: Date.parse(localStorage.getItem("startTime")),
            endTime: Date.now(),
            description: description,
            category: category,
          }),
          "modify"
        );
        await this.handleData();
        this.onPressReset();
      },
      onChangeDescription(oEvent) {
        const description = oEvent.getSource().getValue();
        localStorage.setItem("description", description);
        if (this.getTimerModel().getProperty("/active")) {
          this.getRunningEntry().Description = description;
          this.getEntriesModel().refresh();
        }
      },
      onSetCategory(oEvent) {
        const category = oEvent.getSource().getSelectedKey() || -1;
        localStorage.setItem("category", category);
        this.getTimerModel().setProperty("/category", category);
        if (this.getTimerModel().getProperty("/active")) {
          this.getRunningEntry().Category = category;
          this.getEntriesModel().refresh();
        }
      },
    });
  }
);

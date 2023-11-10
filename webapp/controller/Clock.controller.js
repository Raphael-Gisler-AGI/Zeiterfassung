sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast"],
  function (BaseController, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Clock", {
      /**
       * Sets the default timer and continues the old one if active
       * @returns {void} Early returns if timer isn't active
       */
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
      /**
       * Creates a timer model in the component and sets its default values
       */
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
      /**
       * Either saves the timer or starts it
       */
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
      /**
       * Creates an interval that updates a timer
       * @returns {void} If the running timer wasn't found void will be returned
       */
      runTimer() {
        const timer = this.getTimerModel();
        const current = this.getRunningEntry();
        if (!current) {
          MessageToast.show("Timer couldn't be started");
          return;
        }
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
      /**
       * Gets the last entry in the entries model
       * @returns {object|undefined} If found returns the last entry which is the timer otherwise returns undefined
       */
      getRunningEntry() {
        const entries = this.getEntriesModel().getData();
        const lastEntry = entries[entries.length - 1];
        if (!lastEntry.timer) {
          return undefined;
        }
        return lastEntry;
      },
      /**
       * Resets the timer, If timer is running will remove it, If there is a message will remove it
       * @returns {void} Early return if timer isn't active
       */
      onPressReset() {
        clearInterval(this.timer);
        this.timer = undefined;
        this.byId("clockCategory").setSelectedKey("");
        localStorage.clear();
        const active = this.getTimerModel().getProperty("/active");
        this.setDefaultTimer();
        if (!active) {
          return;
        }
        this.getTimerModel().setProperty("/active", false);
        this.getEntriesModel().getData().pop();
        this.getEntriesModel().refresh(true);
        // Delete information message if exists
        const messages = this.getMessagesModel();
        const index = messages
          .getData()
          .map((message) => message.title)
          .indexOf("Timer");
        if (index < 0) {
          return;
        }
        messages.getData().splice(index, 1);
        messages.refresh(true);
      },
      /**
       * Error handling and creates JSONModel for modify dialog
       * @returns {void} If errors were found
       */
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
          MessageToast.show(errorMessage);
          return;
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
      /**
       * Changes the description in the localstorage and in the timer entry
       * @param {object} oEvent Event from description field being changed
       */
      onChangeDescription(oEvent) {
        const description = oEvent.getSource().getValue();
        localStorage.setItem("description", description);
        if (this.getTimerModel().getProperty("/active")) {
          this.getRunningEntry().Description = description;
          this.getEntriesModel().refresh();
        }
      },
      /**
       * Changes the category in the localstorage and in the timer entry
       * @param {object} oEvent Event from category combobox being changed
       */
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

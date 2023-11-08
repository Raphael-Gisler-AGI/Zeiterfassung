sap.ui.define(
  [
    "./BaseController",
    "../model/formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (BaseController, formatter, Fragment, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend(
      "sap.ui.agi.zeiterfassung.controller.Calendar",
      {
        formatter: formatter,
        onHandleCreate(oEvent) {
          const startTime = oEvent.getParameter("startDate");
          const endTime = oEvent.getParameter("endDate");
          this.openModifyDialog({
            creationType: this.CREATION_TYPE.CREATE_ENTRY,
            description: "",
            category: undefined,
            type: 0,
            startDay: startTime,
            endDay: endTime,
            startTime: this.formatTime(startTime),
            endTime: this.formatTime(endTime),
          });
        },

        onHandleChange(oEvent) {
          const entry = oEvent
            .getParameter("appointment")
            .getBindingContext("entries");
          if (entry.getProperty("timer")) {
            return MessageToast.show(
              "Please end the current timer before editing"
            );
          }
          const startTime = oEvent.getParameter("startDate");
          const endTime = oEvent.getParameter("endDate");
          const category = entry.getProperty("Category");
          this.openModifyDialog({
            id: entry.getProperty("id"),
            creationType: this.CREATION_TYPE.UPDATE_ENTRY,
            description: entry.getProperty("Description"),
            category: category,
            type: this.getCategoryType(category),
            startDay: new Date(startTime),
            endDay: new Date(endTime),
            startTime: this.formatTime(startTime),
            endTime: this.formatTime(endTime),
          });
        },

        onHandleSelect(oEvent) {
          if (!oEvent.getParameter("appointment")) {
            return;
          }
          const entry = oEvent
            .getParameter("appointment")
            .getBindingContext("entries")
            .getObject();
          if (entry.timer) {
            return MessageToast.show(
              "Please end the current timer before editing"
            );
          }
          this.getView().setModel(new JSONModel(entry), "details");
          if (!this.pDetails) {
            this.pDetails = Fragment.load({
              id: this.getView().getId(),
              name: "sap.ui.agi.zeiterfassung.view.Details",
              controller: this,
            }).then((oPopover) => {
              this.getView().addDependent(oPopover);
              return oPopover;
            });
          }
          this.pDetails.then(function (oPopover) {
            oPopover.setTitle(entry.Description);
            oPopover.openBy(oEvent.getParameter("appointment"));
          });
        },

        onHandleDeleteDetails() {
          const id = this.getView().getModel("details").getProperty("/id");
          this.confirmDeleteEntry(id);
        },

        onHandleEditDetails: async function () {
          const details = this.getView().getModel("details");
          const startTime = details.getProperty("/StartTime");
          const endTime = details.getProperty("/EndTime");
          const category = details.getProperty("/Category");
          this.openModifyDialog({
            creationType: this.CREATION_TYPE.UPDATE_ENTRY,
            id: details.getProperty("/id"),
            description: details.getProperty("/Description"),
            category: category,
            type: this.getCategoryType(category),
            startDay: new Date(startTime),
            endDay: new Date(endTime),
            startTime: this.formatTime(startTime),
            endTime: this.formatTime(endTime),
          });
        },

        onPressLegend: function (oEvent) {
          if (!this.pLegend) {
            this.pLegend = Fragment.load({
              id: this.getView().getId(),
              name: "sap.ui.agi.zeiterfassung.view.Legend",
              controller: this,
            }).then((oPopover) => {
              this.getView().addDependent(oPopover);
              return oPopover;
            });
          }
          this.pLegend.then(function (oPopover) {
            oPopover.openBy(oEvent.getSource());
          });
        },
      }
    );
  }
);

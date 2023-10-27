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
        handleCreate(oEvent) {
          const startTime = oEvent.getParameter("startDate");
          const endTime = oEvent.getParameter("endDate");
          const date = new Date();
          this.onOpenModify({
            title: "Create Entry",
            creationType: 0,
            description: "",
            category: undefined,
            type: 0,
            startDay: date,
            endDay: date,
            startTime: `${startTime.getHours()}:${startTime.getMinutes()}`,
            endTime: `${endTime.getHours()}:${endTime.getMinutes()}`,
          });
        },
        handleChange(oEvent) {
          const entry = oEvent
            .getParameter("appointment")
            .getBindingContext("entries");
          const startTime = oEvent.getParameter("startDate");
          const endTime = oEvent.getParameter("endDate");
          this.onOpenModify({
            id: entry.getProperty("id"),
            title: "Edit Entry",
            creationType: 1,
            description: entry.getProperty("Description"),
            category: entry.getProperty("Category"),
            type: 0,
            startDay: startTime,
            endDay: endTime,
            startTime: `${startTime.getHours()}:${startTime.getMinutes()}`,
            endTime: `${endTime.getHours()}:${endTime.getMinutes()}`,
          });
        },
        handleSelect(oEvent) {
          if (!oEvent.getParameter("appointment")) {
            return;
          }
          const entry = oEvent
            .getParameter("appointment")
            .getBindingContext("entries")
            .getObject();
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
        async handleDeleteDetails() {
          const id = this.getView().getModel("details").getProperty("/id");
          await this.beforeDeleteEntry(id);
        },
        handleEditDetails: async function () {
          const details = this.getView().getModel("details");
          this.onOpenModify("Edit Entry", () => {
            this.setModifyEditValues(
              details.getProperty("/id"),
              details.getProperty("/Description"),
              details.getProperty("/Category"),
              details.getProperty("/StartTime"),
              details.getProperty("/EndTime")
            );
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

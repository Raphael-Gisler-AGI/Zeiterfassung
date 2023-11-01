sap.ui.define(
  [
    "./BaseController",
    "../model/formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
  ],
  function (BaseController, formatter, Fragment, JSONModel) {
    "use strict";

    return BaseController.extend(
      "sap.ui.agi.zeiterfassung.controller.Calendar",
      {
        formatter: formatter,

        handleCreate(oEvent) { // on...
          const startTime = oEvent.getParameter("startDate");
          const endTime = oEvent.getParameter("endDate");
          const date = new Date();
          this.onOpenModify({
            title: "Create Entry",
            creationType: 0,
            description: "",
            category: undefined,
            type: 0,
            startDay: new Date(date),
            endDay: new Date(date),
            startTime: this.formatTime(startTime),
            endTime: this.formatTime(endTime),
          });
        },

        handleChange(oEvent) {
          const entry = oEvent
            .getParameter("appointment")
            .getBindingContext("entries");
          const startTime = oEvent.getParameter("startDate");
          const endTime = oEvent.getParameter("endDate");
          const category = entry.getProperty("Category");
          this.onOpenModify({
            id: entry.getProperty("id"),
            title: "Edit Entry",
            creationType: 1,
            description: entry.getProperty("Description"),
            category: category,
            type: this.getCategoryType(category),
            startDay: new Date(startTime),
            endDay: new Date(endTime),
            startTime: this.formatTime(startTime),
            endTime: this.formatTime(endTime),
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
        handleDeleteDetails() {
          const id = this.getView().getModel("details").getProperty("/id");
          this.beforeDeleteEntry(id);
        },
        handleEditDetails: async function () {
          const details = this.getView().getModel("details");
          const startTime = details.getProperty("/StartTime");
          const endTime = details.getProperty("/EndTime");
          const category = details.getProperty("/Category")
          this.onOpenModify({
            title: "Create Favorite",
            creationType: 1,
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

sap.ui.define(
  ["./BaseController", "sap/ui/core/date/UI5Date"],
  function (Controller, UI5Date) {
    "use strict";

    return Controller.extend("sap.ui.agi.zeiterfassung.controller.Time", {
      handleAppointmentCreate: function () {
        this._createInitialDialogValues(
          this.getView().byId("SPC1").getStartDate()
        );
      },
      _createInitialDialogValues: function (oDate) {
		console.log(oDate)
        this._arrangeDialogFragment("Create appointment");
      },
      _arrangeDialogFragment: function (text) {
        if (!this.pDialog) {
          this.pDialog = this.loadFragment({
            name: "sap.ui.agi.zeiterfassung.view.Create",
          });
        }

        this.pDialog.then(function (oDialog) {
          oDialog.open();
        });
      }
    });
  }
);

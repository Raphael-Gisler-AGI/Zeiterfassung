sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend(
    "sap.ui.agi.zeiterfassung.controller.BaseController",
    {
      onNavigateTime: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("time");
      },
      onNavigateCalendar: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("calendar");
      },
    }
  );
});

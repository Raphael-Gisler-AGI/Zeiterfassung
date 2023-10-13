sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel"], function (
  Controller
) {
  "use strict";

  return Controller.extend("sap.ui.demo.nav.controller.App", {
    onPressMenu: function () {
      const toolPage = this.byId("toolPage");
      toolPage.setSideExpanded(!toolPage.getSideExpanded());
    },
  });
});

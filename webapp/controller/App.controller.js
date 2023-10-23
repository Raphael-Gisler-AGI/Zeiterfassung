sap.ui.define(["./BaseController"], function (BaseController) {
  "use strict";

  return BaseController.extend("sap.ui.demo.nav.controller.App", {
    onPressMenu: function () {
      const toolPage = this.byId("toolPage");
      toolPage.setSideExpanded(!toolPage.getSideExpanded());
    },
  });
});

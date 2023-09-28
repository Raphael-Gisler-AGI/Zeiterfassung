sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel"], function (
  Controller,
  JSONModel
) {
  "use strict";

  return Controller.extend("sap.ui.demo.nav.controller.App", {
    onInit: function () {
      this.getView().setModel(new JSONModel(
        {
          test: "hfaésldjfélasdf"
        }
      ), "testing");
    },
  });
});

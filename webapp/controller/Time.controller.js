sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/util/Storage",
    "../model/categories",
  ],
  function (BaseController, JSONModel, MessageToast, Storage, categories) {
    "use strict";

    return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Time", {
      onPressDelete: async function (oEvent) {
        const oItem = oEvent.getSource();
        const id = oItem.getBindingContext("entries").getProperty("id");
        await this.deleteTime(id);
      },
    });
  }
);

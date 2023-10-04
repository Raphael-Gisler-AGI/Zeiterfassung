sap.ui.define(["./BaseController", "sap/m/MessageToast"], function (
  BaseController,
  MessageToast
) {
  "use strict";

  return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Default", {
    onSave: async function () {
      const data = this.default().getData();
      const res = await this.saveDefault(data);
      if (res == 400) {
        MessageToast.show("Couldn't save your settings");
      }
      if (res == 200) {
        MessageToast.show("Your settings have been saved");
      }
    },
  });
});

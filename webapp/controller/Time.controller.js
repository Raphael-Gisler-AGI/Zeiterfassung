sap.ui.define(["./BaseController", "../model/categories"], function (
  BaseController,
  categories
) {
  "use strict";

  return BaseController.extend("sap.ui.agi.zeiterfassung.controller.Time", {
    formatter: categories,
    onPressEdit: function (oEvent) {
      const oItem = oEvent.getSource();
      const entry = oItem.getBindingContext("entries");
      
      this.onOpenModify("Edit Entry");
    },
    onPressDelete: async function (oEvent) {
      const oItem = oEvent.getSource();
      const id = oItem.getBindingContext("entries").getProperty("id");
      await this.deleteTime(id);
    },
  });
});

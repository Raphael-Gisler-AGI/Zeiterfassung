sap.ui.define(
  [
    "sap/ui/core/library",
    "sap/ui/core/Fragment",
    "./BaseController",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/json/JSONModel",
    "sap/ui/unified/library",
    "sap/m/MessageToast",
    "sap/ui/core/date/UI5Date",
  ],
  function (
    coreLibrary,
    Fragment,
    Controller,
    DateFormat,
    JSONModel,
    unifiedLibrary,
    MessageToast,
    UI5Date
  ) {
    "use strict";

    return Controller.extend("sap.ui.agi.zeiterfassung.controller.Time", {
      onInit: function () {
        this.convertToDate();
        this.entries().refresh();
        console.log(this.entries().getData());
      },
   });
  }
);

sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel"], function (
  Controller,
  JSONModel
) {
  "use strict";

  return Controller.extend("sap.ui.agi.zeiterfassung.controller.Clock", {
	
    onInit: function () {
      this.getView().setModel(
        new JSONModel({
          time: 0,
          active: false,
        }),
        "Timer"
      );
    },
    counter: undefined,
    onPressActivate: function () {
      const timer = this.getView().getModel("Timer").getData();
      timer.active = !timer.active;
      this.getView().getModel("Timer").refresh();
      if (timer.active) {
        this.counter = setInterval(() => {
			timer.time++
			this.getView().getModel("Timer").refresh()
		}, 1000)
      } else {
        clearInterval(this.counter);
      }
    },
  });
});

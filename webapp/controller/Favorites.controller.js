sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel"], function (
  BaseController,
  JSONModel
) {
  "use strict";

  return BaseController.extend(
    "sap.ui.agi.zeiterfassung.controller.Favorites",
    {
      onPressCreateFavorite() {
        this.onOpenModify({
          title: "Create Favorite",
          creationType: 2,
          description: undefined,
          category: undefined,
          type: 0,
          startDay: undefined,
          endDay: undefined,
          startTime: undefined,
          endTime: undefined,
        });
      },
      onPressDeleteFavorite() {
        
      }
    }
  );
});

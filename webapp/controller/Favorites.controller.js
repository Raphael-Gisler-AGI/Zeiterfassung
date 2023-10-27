sap.ui.define(["./BaseController"], function (BaseController) {
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
      async onPressDeleteFavorite(oEvent) {
        const id = oEvent
          .getSource()
          .getBindingContext("favorites")
          .getProperty("id");
        await this.deleteFavorite(id);
      },
    }
  );
});

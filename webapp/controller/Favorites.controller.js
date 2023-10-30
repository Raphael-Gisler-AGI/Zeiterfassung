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
      onPressEditFavorite(oEvent) {
        const {
          id,
          Description,
          Category,
          StartTime,
          EndTime,
        } = oEvent.getSource().getBindingContext("favorites").getObject();
        this.onOpenModify({
          title: "Edit Favorite",
          creationType: 3,
          id: id,
          description: Description || undefined,
          category: Category || undefined,
          type: this.getCategoryType(Category),
          startDay: StartTime || undefined,
          endDay: EndTime || undefined,
          startTime: this.formatTime(StartTime),
          endTime: this.formatTime(EndTime) || undefined,
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

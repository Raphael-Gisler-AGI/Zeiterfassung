sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel"], function (
  BaseController,
  JSONModel
) {
  "use strict";

  return BaseController.extend(
    "sap.ui.agi.zeiterfassung.controller.Favorites",
    {
      onInit() {
        this.getView().setModel(new JSONModel(), "selectedFavorite");
      },
      onPressCreateFavorite() {
        this.openModifyDialog({
          creationType: this.CREATION_TYPE.CREATE_FAVORITE,
          name: "",
          description: undefined,
          category: undefined,
          type: 0,
          startDay: undefined,
          endDay: undefined,
          startTime: undefined,
          endTime: undefined,
          halfDay: false,
        });
      },
      onPressAddFavorite() {
        const favorite = this.getSelectedFavorite();
        this.openModifyDialog({
          creationType: this.CREATION_TYPE.CREATE_ENTRY,
          description: favorite.Description || undefined,
          category: favorite.Category || undefined,
          type: this.getCategoryType(favorite.Category) || undefined,
          startDay: new Date(favorite.StartTime) || undefined,
          endDay: new Date(favorite.EndTime) || undefined,
          startTime: this.formatTime(favorite.StartTime) || undefined,
          endTime: this.formatTime(favorite.EndTime) || undefined,
          halfDay: favorite.HalfDay || false,
        });
      },
      onPressEditFavorite() {
        const favorite = this.getSelectedFavorite();
        this.openModifyDialog({
          creationType: this.CREATION_TYPE.UPDATE_FAVORITE,
          id: favorite.id,
          name: favorite.Name,
          description: favorite.Description || undefined,
          category: favorite.Category || undefined,
          type: this.getCategoryType(favorite.Category),
          startDay: new Date(favorite.StartTime) || undefined,
          endDay: new Date(favorite.EndTime) || undefined,
          startTime: this.formatTime(favorite.StartTime) || undefined,
          endTime: this.formatTime(favorite.EndTime) || undefined,
          halfDay: favorite.HalfDay || false,
        });
      },
      onPressDeleteFavorite() {
        const favorite = this.getSelectedFavorite();
        this.confirmDeleteEntry(favorite.id, false);
      },
      getSelectedFavorite() {
        return this.getView().getModel("selectedFavorite").getData();
      },
      onPressOptions(oEvent) {
        const favorite = oEvent
          .getSource()
          .getBindingContext("favorites")
          .getObject();
        this.getView().getModel("selectedFavorite").setData(favorite);
        // Get the Actionsheet through the button
        // When done over Id causes issues with multiple Id's
        oEvent.getSource().getDependents()[0].openBy(oEvent.getSource());
      },
    }
  );
});

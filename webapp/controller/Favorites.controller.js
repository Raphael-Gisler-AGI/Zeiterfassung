sap.ui.define(["./BaseController", "sap/m/MessageToast"], function (
  BaseController,
  MessageToast
) {
  "use strict";

  return BaseController.extend(
    "sap.ui.agi.zeiterfassung.controller.Favorites",
    {
      onPressCreateFavorite() {
        this.onOpenModify({
          title: "Create Favorite",
          creationType: 2,
          name: "",
          description: undefined,
          category: undefined,
          type: 0,
          startDay: undefined,
          endDay: undefined,
          startTime: undefined,
          endTime: undefined,
        });
      },
      onPressAddFavorite() {
        const favorite = this.getSelectedItem();
        if (!favorite) {
          return this.showError();
        }
        this.onOpenModify({
          title: "Create Entry",
          creationType: 0,
          description: favorite.Description || undefined,
          category: favorite.Category || undefined,
          type: this.getCategoryType(favorite.Category) || undefined,
          startDay: new Date(favorite.StartTime) || undefined,
          endDay: new Date(favorite.EndTime) || undefined,
          startTime: this.formatTime(favorite.StartTime) || undefined,
          endTime: this.formatTime(favorite.EndTime) || undefined,
        });
      },
      onPressEditFavorite() {
        const favorite = this.getSelectedItem();
        if (!favorite?.id) {
          return this.showError();
        }
        this.onOpenModify({
          title: "Edit Favorite",
          creationType: 3,
          id: favorite.id,
          name: favorite.Name,
          description: favorite.Description || undefined,
          category: favorite.Category || undefined,
          type: this.getCategoryType(favorite.Category),
          startDay: new Date(favorite.StartTime) || undefined,
          endDay: new Date(favorite.EndTime) || undefined,
          startTime: this.formatTime(favorite.StartTime) || undefined,
          endTime: this.formatTime(favorite.EndTime) || undefined,
        });
      },
      async onPressDeleteFavorite() {
        const favorite = this.getSelectedItem();
        if (!favorite) {
          return this.showError();
        }
        await this.deleteFavorite(favorite.id);
      },
      getSelectedItem() {
        return this.byId("favoriteList")
          .getSelectedItem()
          ?.getBindingContext("favorites")
          ?.getObject();
      },
      showError() {
        MessageToast.show("Please select a favorite in the list above and try again");
      },
    }
  );
});

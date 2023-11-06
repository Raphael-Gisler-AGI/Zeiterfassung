sap.ui.define(["./BaseController", "sap/m/MessageToast"], function (
  BaseController,
  MessageToast
) {
  "use strict";

  return BaseController.extend(
    "sap.ui.agi.zeiterfassung.controller.Favorites",
    {
      onPressCreateFavorite() {
        this.dialogModifyOpen({
          title: "Create Favorite",
          creationType: this.CREATION_TYPE.CREATE_FAVORITE,
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
        this.dialogModifyOpen({
          title: "Create Entry",
          creationType: this.CREATION_TYPE.CREATE_ENTRY,
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
        this.dialogModifyOpen({
          title: "Edit Favorite",
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
        });
      },
      async onPressDeleteFavorite() {
        const favorite = this.getSelectedItem();
        if (!favorite?.id) {
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

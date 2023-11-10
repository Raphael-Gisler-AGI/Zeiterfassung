sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel"], function (
  BaseController,
  JSONModel
) {
  "use strict";

  return BaseController.extend(
    "sap.ui.agi.zeiterfassung.controller.Favorites",
    {
      /**
       * Create Model for the Selected Favorite
       */
      onInit() {
        this.getView().setModel(new JSONModel(), "selectedFavorite");
      },
      /**
       * Set values for Modify Dialog
       */
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
      /**
       * Set values for Modify Dialog
       */
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
      /**
       * Set values for Modify Dialog
       */
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
      /**
       * Parses the Id of an favorite to the confirmation function
       */
      onPressDeleteFavorite() {
        const favorite = this.getSelectedFavorite();
        this.confirmDeleteEntry(favorite.id, false);
      },
      /**
       * Get the selected favorite from its model
       * @returns {object} Returns the selected favorite
       */
      getSelectedFavorite() {
        return this.getView().getModel("selectedFavorite").getData();
      },
      /**
       * Opens the Action Sheet of the favorite
       * @param {object} oEvent 
       */
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

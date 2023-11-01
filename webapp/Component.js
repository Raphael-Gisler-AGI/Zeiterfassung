sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel"],
  function (UIComponent, JSONModel) {
    "use strict";
    return UIComponent.extend("sap.ui.agi.zeiterfassung.Component", {
      metadata: {
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
        manifest: "json",
      },
      init() {
        UIComponent.prototype.init.apply(this, arguments);
        this.getRouter().initialize();

        const entries = this.getModel("entries");
        const categories = this.getModel("categories");
        const favorites = this.getModel("favorites");

        this.setModel(new JSONModel([]), "messages");
        this.setModel(new JSONModel([]), "entries");
        this.setModel(new JSONModel([]), "categories");
        this.setModel(new JSONModel([]), "favorites");

        const errors = [];
        Promise.all([
          // this._waitForModel(entries),
          // this._waitForModel(categories),
// Wiederholender Code auslagern in eigene 'generische' Funktion

          entries.dataLoaded().then(() => {
            if (!Array.isArray(entries.getData())) {
              errors.push({
                type: "Error",
                title: "Entries",
                subtitle: "Connection to server failed",
                description:
                  "Your entries couldn't be fetched from the server.\nPlease check your internet connection",
              });
              this.setModel(new JSONModel([]), "entries");
            } else {
              this.setModel(entries, "entries");
            }
          }),
          categories.dataLoaded().then(() => {
            if (!Array.isArray(categories.getData())) {
              errors.push({
                type: "Error",
                title: "Categories",
                subtitle: "Connection to server failed",
                description:
                  "The categories couldn't be fetched from the server.\nPlease check your internet connection",
              });
              this.setModel(new JSONModel([]), "categories");
            } else {
              this.setModel(categories, "categories");
            }
          }),
          favorites.dataLoaded().then(() => {
            if (!Array.isArray(favorites.getData())) {
              errors.push({
                type: "Error",
                title: "Favorites",
                subtitle: "Connection to server failed",
                description:
                  "Your Favorites couldn't be fetched from the server.\nPlease check your internet connection",
              });
              this.setModel(new JSONModel([]), "favorites");
            } else {
              this.setModel(favorites, "favorites");
            }
          }),
        ]).then(() => {
          errors.push(...this.getModel("messages").getData());
          this.setModel(new JSONModel(errors), "messages");
        });
      },
    });
  }
);

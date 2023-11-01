sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel"],
  function (UIComponent, JSONModel) {
    "use strict";
    return UIComponent.extend("sap.ui.agi.zeiterfassung.Component", {
      metadata: {
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
        manifest: "json",
      },
      errors: [],
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

        Promise.all([
          this.waitForModel(entries, "Entries").then((entries) => {
            this.setModel(entries, "entries");
          }),
          this.waitForModel(categories, "Categories").then((categories) => {
            this.setModel(categories, "categories");
          }),
          this.waitForModel(favorites, "Favorites").then((favorites) => {
            this.setModel(favorites, "favorites");
          }),
        ]).then(() => {
          this.errors.push(...this.getModel("messages").getData());
          this.setModel(new JSONModel(this.errors), "messages");
        });
      },

      async waitForModel(model, errorTitle) {
        return await model.dataLoaded().then(() => {
          if (Array.isArray(model.getData())) {
            return model;
          }
          this.errors.push({
            type: "Error",
            title: errorTitle,
            subtitle: "Connection to server failed",
            description: `Your ${errorTitle} couldn't be fetched from the server.\nPlease check your internet connection`,
          });
          return new JSONModel([]);
        });
      },
    });
  }
);

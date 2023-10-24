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

        this.setModel(new JSONModel([]), "messages");
        this.setModel(new JSONModel([]), "entries");
        this.setModel(new JSONModel([]), "categories");

        const errors = [];
        Promise.all([
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
              console.log(entries.getData());
              entries.getData().forEach((entry) => {
                entry.StartTime = new Date(entry.StartTime);
                entry.EndTime = new Date(entry.EndTime);
              });
              entries.refresh();
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
        ]).then(() => {
          errors.push(...this.getModel("messages").getData());
          this.setModel(new JSONModel(errors), "messages");
        });
      },
    });
  }
);

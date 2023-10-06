sap.ui.define([], function () {
  "use strict";

  return {
    categoryText: function (id) {
      const categories = this.getOwnerComponent()
        .getModel("categories")
        .getData();
      const category = categories.find((category) => category.id == id);
      if (!category.Name) {
        return id;
      }
      return category.Name;
    },
  };
});

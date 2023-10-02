sap.ui.define([], function () {
  "use strict";

  return {
    categoryText: function (id) {
      const categories = this.getOwnerComponent()
        .getModel("categories")
        .getData();
      const result = categories.find((category) => category.id == id);
      return result ? result.Name : ""
    },
  };
});

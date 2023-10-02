sap.ui.define([], function () {
  "use strict";

  return {
    categoryText: function (id) {
      const categories = this.getOwnerComponent()
        .getModel("categories")
        .getData();
      let high = categories.length;
      let low = 0;
      while (high > low) {
        const mid = Math.floor(low + (high - low) / 2);
        const v = categories[mid].id;
        if (v == id) {
          return categories[mid].Name;
        } else if (v > id) {
          high = mid;
        } else {
          low = mid + 1;
        }
      }
      return "";
    },
  };
});

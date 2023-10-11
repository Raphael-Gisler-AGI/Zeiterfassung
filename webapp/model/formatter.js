sap.ui.define([], function () {
  "use strict";

  return {
    getCategoryText: function (id) {
      const categories = this.getOwnerComponent()
        .getModel("categories")
        .getData();
      const category = categories.find((category) => category.id == id);
      if (!category.Name) {
        return id;
      }
      return category.Name;
    },
    getTime: function (value) {
      const round = 1000;
      const hours = Math.round((value / 60) * round) / round;
      return `${hours}h`;
    },
    getCategoryType: function (type) {
      switch(type) {
        case(0):
          return "Projektleistungen"
        case(1):
          return "Nicht-Projektleistungen"
        case(2):
          return "Tages/Halbtages-Leistungen"
        default:
          return type
      }
    }
  };
});

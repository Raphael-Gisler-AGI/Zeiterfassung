sap.ui.define([], function () {
  "use strict";
  return {
    getDisplayTime: function (date) {
      return new Date(date * 1000).toISOString().substring(11, 19);
    },
    getCategoryText: function (id) {
      const categories = this.getOwnerComponent()
        .getModel("categories")
        .getData();
      const category = categories.find((category) => category.id == id);
      if (!category?.Name) {
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
      switch (type) {
        case 0:
          return "Projektleistungen";
        case 1:
          return "Nicht-Projektleistungen";
        case 2:
          return "Tages/Halbtages-Leistungen";
        default:
          return type;
      }
    },
    getCalendarType: function (category) {
      const type = this.getOwnerComponent()
        .getModel("categories")
        .getData()
        .find((c) => c.id == category)?.Type;
      switch (type) {
        case 0:
          return "Type01";
        case 1:
          return "Type02";
        case 2:
          return "Type03";
        default:
          return "Type01";
      }
    },
  };
});

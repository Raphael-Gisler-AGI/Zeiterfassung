sap.ui.define([], function () {
  "use strict";

  return {
    typeText: function (id) {
      switch (id) {
        case 0:
          return "{i18n>TypeProject}";
        case 1:
          return "{i18n>TypeNotProject}";
        case 2:
          return "{i18n>TypeDay}";
        default:
          return id;
      }
    },
  };
});

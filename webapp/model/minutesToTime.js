sap.ui.define([], function () {
  "use strict";

  return {
    getTime: function (value) {
      const round = 1000;
      const hours = Math.round((value / 60) * round) / round;
      return `${hours}h`;
    },
  };
});

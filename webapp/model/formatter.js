sap.ui.define([], function () {
  "use strict";
  return {
    getDisplayTime(date) {
      return new Date(date * 1000).toISOString().substring(11, 19);
    },
    getDateAsObject(date) {
      return new Date(date);
    },
    getDate(date) {
      return new Date(date).toLocaleTimeString().split(":", 2).join(":");
    },
    getCategoryText(id) {
      const categories = this.getOwnerComponent()
        .getModel("categories")
        .getData();
      const category = categories.find((category) => category.id == id);
      if (!category?.Name) {
        return id;
      }
      return category.Name;
    },
    getTime(value) {
      const round = 1000;
      const hours = Math.round((value / 60) * round) / round;
      return `${hours}h`;
    },
    getCategoryType(type) {
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
    getCalendarType(category) {
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
    getMessageIcon(messages) {
      if (messages.length === 0) {
        return "None";
      }
      let icon;
      loop: for (let i = 0; i < messages.length; i++) {
        switch (messages[i].type) {
          case "Error":
            icon = "error";
            break loop;
          case "Information":
            icon = "information";
            break;
          case "Success":
            icon = icon != "information" ? "success" : icon;
            break;
        }
      }
      return `sap-icon://${icon}`;
    },
    getMessageType(messages) {
      if (messages.length == 0) {
        return "Neutral";
      }
      let type;
      loop: for (let i = 0; i < messages.length; i++) {
        switch (messages[i].type) {
          case "Error":
            type = "Negative";
            break loop;
          case "Information":
            type = "Neutral";
            break;
          case "Success":
            type = type != "Critical" ? "Success" : type;
            break;
        }
      }
      return type;
    },
  };
});

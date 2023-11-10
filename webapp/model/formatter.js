sap.ui.define([], function () {
  "use strict";
  return {
    /**
     * Formatter for the grouping of entries
     * @param {object} entry
     * @returns {string} Returns the date formatted
     */
    tableGrouping(entry) {
      if (entry.getProperty("timer")) {
        return "Active Timer";
      }
      const startTime = entry.getProperty("StartTime");
      const formattedDate = new Date(startTime).toLocaleDateString();
      const categoryId = entry.getProperty("Category");
      const category = this.getOwnerComponent()
        .getModel("categories")
        .getData();
      const type = category.find((category) => category.id == categoryId)?.Type;
      if (type !== 2) {
        return formattedDate;
      }
      const formattedEndDate = new Date(
        entry.getProperty("EndTime")
      ).toLocaleDateString();
      return `${formattedDate} - ${formattedEndDate}`;
    },
    /**
     * Formatter for the modify title
     * @param {number} creationType 
     * @returns {string}
     */
    getModifyTitle(creationType) {
      switch (creationType) {
        case 0:
          return "Create Entry";
        case 1:
          return "Edit Entry";
        case 2:
          return "Create Favorite";
        case 3:
          return "Edit Favorite";
        default:
          return "Modify";
      }
    },
    /**
     * The minutes get converted into a date object and then get displayed
     * @param {number} timerSeconds The timer amount in seconds
     * @returns {string}
     */
    getDisplayTime(timerSeconds) {
      return new Date(timerSeconds * 1000).toISOString().substring(11, 19);
    },
    /**
     * Converts a date as a number into a date object
     * @param {number} date 
     * @returns {Date}
     */
    getDateAsObject(date) {
      return new Date(date);
    },
    /**
     * Display start and end time next to each other
     * @param {object} entry 
     * @returns {string}
     */
    getDate(entry) {
      if ("HalfDay" in entry) {
        return entry.HalfDay ? "Half Day" : "Full Day";
      }
      const convertDate = (date) => {
        return new Date(date).toLocaleTimeString().split(":", 2).join(":");
      };
      return `${convertDate(entry.StartTime)} - ${convertDate(entry.EndTime)}`;
    },
    /**
     * Formatter for getting the Category name
     * @param {string} id 
     * @returns {string} Returns name of a Category
     */
    getCategoryText(id) {
      const categories = this.getOwnerComponent()
        .getModel("categories")
        .getData();
      const category = categories.find((category) => category.id == id);
      if (!category?.Name) {
        return "N/A";
      }
      return category.Name;
    },
    /**
     * Converts minutes into hours
     * @param {number} minutes 
     * @returns {string} Returns hours with trailing 'h'
     */
    getTime(minutes) {
      const round = 1000;
      const hours = Math.round((minutes / 60) * round) / round;
      return `${hours}h`;
    },
    /**
     * Gives the name of the type
     * @param {number} type 
     * @returns {string|number} Should return a string but if no type is found will return same number back
     */
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
    /**
     * Uses type of a category to get a calendar type
     * @param {number} category 
     * @returns {string} Returns the calendar type
     */
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
    /**
     * Uses error message type to get a sap icon link
     * @param {object} messages 
     * @returns {string} Returns a sap icon link
     */
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
    /**
     * Get the type from a message object
     * @param {object} messages 
     * @returns {string} Returns the message type
     */
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

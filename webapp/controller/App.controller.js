sap.ui.define(
  [
    "./BaseController",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/m/Link",
    "sap/ui/model/json/JSONModel",
  ],
  function (BaseController, MessagePopover, MessageItem) {
    "use strict";
    let messagePopover;
    return BaseController.extend("sap.ui.demo.nav.controller.App", {
      /**
       * Event listener to select side navigation when refreshed
       * Set the message button in the footer
       */
      onInit() {
        this.getRouter().attachRouteMatched((oEvent) => {
          this.byId("sideNavigation").setSelectedKey(
            oEvent.getParameter("name")
          );
        });
        const messageTemplate = new MessageItem({
          type: "{messages>type}",
          title: "{messages>title}",
          description: "{messages>description}",
          subtitle: "{messages>subtitle}",
        });
        messagePopover = new MessagePopover({
          items: {
            path: "messages>/",
            template: messageTemplate,
          },
        });
        this.byId("messagePopoverButton").addDependent(messagePopover);
      },
      /**
       * Navigate to proper page
       * @param {object} oEvent 
       */
      onSelectSideNav(oEvent) {
        this.getRouter().navTo(oEvent.getParameter("item").getKey());
      },
      /**
       * Create data for modify Form
       */
      onPressCreate() {
        const date = new Date();
        const startDate = new Date(
          new Date().setHours(new Date().getHours() - 1)
        );
        this.openModifyDialog({
          creationType: this.CREATION_TYPE.CREATE_ENTRY,
          description: "",
          category: undefined,
          type: 0,
          startDay: startDate,
          endDay: date,
          startTime: this.formatTime(startDate),
          endTime: this.formatTime(date),
          halfDay: false,
        });
      },
      /**
       * Toggle the Side Navigation Menu
       */
      onShellbarMenuPress() {
        const toolPage = this.byId("toolPage");
        toolPage.setSideExpanded(!toolPage.getSideExpanded());
      },
      /**
       * Toggle the Message Menu
       */
      onPressMessageToggleButton(oEvent) {
        messagePopover.toggle(oEvent.getSource());
      },
    });
  }
);

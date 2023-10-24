sap.ui.define(
  [
    "./BaseController",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/m/Link",
    "sap/ui/model/json/JSONModel",
  ],
  function (BaseController, MessagePopover, MessageItem, Link, JSONModel) {
    "use strict";
    let messagePopover;
    return BaseController.extend("sap.ui.demo.nav.controller.App", {
      onInit() {
        const messageTemplate = new MessageItem({
          type: "{messages>type}",
          title: "{messages>title}",
          description: "{messages>description}",
          subtitle: "{messages>subtitle}",
        });
        console.log(this.messages().getData());
        this.messages().refresh()
        messagePopover = new MessagePopover({
          items: {
            path: "messages>/",
            template: messageTemplate,
          },
        });
        this.byId("messagePopoverButton").addDependent(messagePopover);
      },
      onPressMenu() {
        const toolPage = this.byId("toolPage");
        toolPage.setSideExpanded(!toolPage.getSideExpanded());
      },
      onPressFooterButton(oEvent) {
        messagePopover.toggle(oEvent.getSource());
      },
    });
  }
);

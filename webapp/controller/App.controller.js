sap.ui.define(
  [
    "./BaseController",
    "../model/formatter",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/m/Link",
    "sap/ui/model/json/JSONModel",
  ],
  function (BaseController, formatter, MessagePopover, MessageItem) {
    "use strict";
    let messagePopover;
    return BaseController.extend("sap.ui.demo.nav.controller.App", {
      formatter: formatter,
      onInit() {
        const messageTemplate = new MessageItem({
          type: "{messages>type}",
          title: "{messages>title}",
          description: "{messages>description}",
          subtitle: "{messages>subtitle}",
        });
        this.messages().refresh();
        messagePopover = new MessagePopover({
          items: {
            path: "messages>/",
            template: messageTemplate,
          },
        });
        this.byId("messagePopoverButton").addDependent(messagePopover);
      },
      onPressCreate() {
        const date = new Date();
        this.onOpenModify({
          title: "Create Entry",
          creationType: 0,
          description: "",
          category: undefined,
          type: 0,
          startDay: date,
          endDay: date,
          startTime: `${date.getHours()}:${date.getMinutes()}`,
          endTime: `${date.getHours()}:${date.getMinutes()}`,
        });
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

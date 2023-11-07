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
        this.getMessagesModel().refresh();
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
        });
      },
      onShellbarMenuPress() {
        const toolPage = this.byId("toolPage");
        toolPage.setSideExpanded(!toolPage.getSideExpanded());
      },
      onPressMessageToggleButton(oEvent) {
        messagePopover.toggle(oEvent.getSource());
      },
    });
  }
);

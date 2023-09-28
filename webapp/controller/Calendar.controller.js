sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/Fragment",
	"./BaseController",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/library",
	"sap/m/MessageToast",
	"sap/ui/core/date/UI5Date"
],
function(coreLibrary, Fragment, Controller, DateFormat, JSONModel, unifiedLibrary, MessageToast, UI5Date) {
	"use strict";

	let CalendarDayType = unifiedLibrary.CalendarDayType;
	let ValueState = coreLibrary.ValueState;

	return Controller.extend("sap.ui.agi.zeiterfassung.controller.Time", {

		onInit: function() {
			console.log(this.getView().getModel().getData())
			oModel = new JSONModel();
			oModel.setData({allDay: false});
			this.getView().setModel(oModel, "allDay");
		},

		handleAppointmentSelect: function (oEvent) {
			let oAppointment = oEvent.getParameter("appointment"),
				oStartDate,
				oEndDate,
				oTrimmedStartDate,
				oTrimmedEndDate,
				bAllDate,
				oModel,
				oView = this.getView();

			if ((!oAppointment || !oAppointment.getSelected()) && this._pDetailsPopover){
				this._pDetailsPopover.then(function(oResponsivePopover){
					oResponsivePopover.close();
				});
				return;
			}

			oStartDate = oAppointment.getStartDate();
			oEndDate = oAppointment.getEndDate();
			oTrimmedStartDate = UI5Date.getInstance(oStartDate);
			oTrimmedEndDate = UI5Date.getInstance(oEndDate);
			bAllDate = false;
			oModel = this.getView().getModel("allDay");

			this._setHoursToZero(oTrimmedStartDate);
			this._setHoursToZero(oTrimmedEndDate);

			if (oStartDate.getTime() === oTrimmedStartDate.getTime() && oEndDate.getTime() === oTrimmedEndDate.getTime()) {
				bAllDate = true;
			}

			oModel.getData().allDay = bAllDate;
			oModel.updateBindings();

			if (!this._pDetailsPopover) {
				this._pDetailsPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.ui.agi.zeiterfassung.view.Details",
					controller: this
				}).then(function(oDetailsPopover){
					oView.addDependent(oDetailsPopover);
					return oDetailsPopover;
				});
			}
			this._pDetailsPopover.then(function(oDetailsPopover){
				oDetailsPopover.setBindingContext(oAppointment.getBindingContext());
				oDetailsPopover.openBy(oAppointment);
			});
		},

		handleEditButton: function () {
			// The sap.m.Popover has to be closed before the sap.m.Dialog gets opened
			let oDetailsPopover = this.byId("detailsPopover");
			oDetailsPopover.close();
			this.sPath = oDetailsPopover.getBindingContext().getPath();
			this._arrangeDialogFragment("Edit appointment");
		},

		handlePopoverDeleteButton: function () {
			let oModel = this.getView().getModel(),
				oAppointments = oModel.getData().appointments,
				oDetailsPopover = this.byId("detailsPopover"),
				oAppointment = oDetailsPopover._getBindingContext().getObject();

			oDetailsPopover.close();

			oAppointments.splice(oAppointments.indexOf(oAppointment), 1);
			oModel.updateBindings();
		},

		_arrangeDialogFragment: function (sDescription) {
			let oView = this.getView();

			if (!this._pNewAppointmentDialog) {
				this._pNewAppointmentDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.ui.agi.zeiterfassung.view.Modify",
					controller: this
				}).then(function(oModifyDialog){
					oView.addDependent(oModifyDialog);
					return oModifyDialog;
				});
			}

			this._pNewAppointmentDialog.then(function(oModifyDialog){
				this._arrangeDialog(sDescription, oModifyDialog);
			}.bind(this));
		},

		_arrangeDialog: function (sDescription, oModifyDialog) {
			this._setValuesToDialogContent();
			oModifyDialog.setTitle(sDescription);
			oModifyDialog.open();
		},

		_setValuesToDialogContent: function () {
			let bAllDayAppointment = (this.byId("allDay")).getSelected(),
				sStartDatePickerID = bAllDayAppointment ? "DPStartDate" : "DTPStartDate",
				sEndDatePickerID = bAllDayAppointment ? "DPEndDate" : "DTPEndDate",
				oTitleControl = this.byId("appDescription"),
				oTypeControl = this.byId("appType"),
				oStartDateControl = this.byId(sStartDatePickerID),
				oEndDateControl = this.byId(sEndDatePickerID),
				oContext,
				oContextObject,
				oSPCStartDate,
				sDescription,
				oStartDate,
				oEndDate,
				sType;


			if (this.sPath) {
				oContext = this.byId("detailsPopover").getBindingContext();
				oContextObject = oContext.getObject();
				sDescription = oContextObject.title;
				oStartDate = oContextObject.startDate;
				oEndDate = oContextObject.endDate;
				sType = oContextObject.type;
			} else {
				sDescription = "";
				oSPCStartDate = this.getView().byId("SPC1").getStartDate();
				oStartDate = UI5Date.getInstance(oSPCStartDate);
				oStartDate.setHours(this._getDefaultAppointmentStartHour());
				oEndDate = UI5Date.getInstance(oSPCStartDate);
				oEndDate.setHours(this._getDefaultAppointmentEndHour());
				sType = "Type01";
			}

			oTitleControl.setValue(sDescription);
			oStartDateControl.setDateValue(oStartDate);
			oEndDateControl.setDateValue(oEndDate);
			oTypeControl.setSelectedKey(sType);
		},

		handleDialogOkButton: function () {
			let bAllDayAppointment = (this.byId("allDay")).getSelected(),
				sStartDate = bAllDayAppointment ? "DPStartDate" : "DTPStartDate",
				sEndDate = bAllDayAppointment ? "DPEndDate" : "DTPEndDate",
				sDescription = this.byId("appDescription").getValue(),
				sType = this.byId("appType").getSelectedItem().getText(),
				oStartDate = this.byId(sStartDate).getDateValue(),
				oEndDate = this.byId(sEndDate).getDateValue(),
				oModel = this.getView().getModel(),
				sAppointmentPath;

			if (this.byId(sStartDate).getValueState() !== "Error"
				&& this.byId(sEndDate).getValueState() !== "Error") {

				if (this.sPath) {
					sAppointmentPath = this.sPath;
					oModel.setProperty(sAppointmentPath + "/title", sDescription);
					oModel.setProperty(sAppointmentPath + "/type", sType);
					oModel.setProperty(sAppointmentPath + "/startDate", oStartDate);
					oModel.setProperty(sAppointmentPath + "/endDate", oEndDate);
				} else {
					oModel.getData().appointments.push({
						title: sDescription,
						type: sType,
						startDate: oStartDate,
						endDate: oEndDate
					});
				}

				oModel.updateBindings();

				this.byId("modifyDialog").close();
			}
		},

		formatDate: function (oDate) {
			if (oDate) {
				let iHours = oDate.getHours(),
				iMinutes = oDate.getMinutes(),
				iSeconds = oDate.getSeconds();

				if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
					return DateFormat.getDateTimeInstance({ style: "medium" }).format(oDate);
				} else  {
					return DateFormat.getDateInstance({ style: "medium" }).format(oDate);
				}
			}
			return "";
		},

		handleDialogCancelButton:  function () {
			this.sPath = null;
			this.byId("modifyDialog").close();
		},

		handleCheckBoxSelect: function (oEvent) {
			let bSelected = oEvent.getSource().getSelected(),
				sStartDatePickerID = bSelected ? "DTPStartDate" : "DPStartDate",
				sEndDatePickerID = bSelected ? "DTPEndDate" : "DPEndDate",
				oOldStartDate = this.byId(sStartDatePickerID).getDateValue(),
				oNewStartDate = UI5Date.getInstance(oOldStartDate),
				oOldEndDate = this.byId(sEndDatePickerID).getDateValue(),
				oNewEndDate = UI5Date.getInstance(oOldEndDate);

			if (!bSelected) {
				oNewStartDate.setHours(this._getDefaultAppointmentStartHour());
				oNewEndDate.setHours(this._getDefaultAppointmentEndHour());
			} else {
				this._setHoursToZero(oNewStartDate);
				this._setHoursToZero(oNewEndDate);
			}

			sStartDatePickerID = !bSelected ? "DTPStartDate" : "DPStartDate";
			sEndDatePickerID = !bSelected ? "DTPEndDate" : "DPEndDate";
			this.byId(sStartDatePickerID).setDateValue(oNewStartDate);
			this.byId(sEndDatePickerID).setDateValue(oNewEndDate);
		},

		_getDefaultAppointmentStartHour: function() {
			return 9;
		},

		_getDefaultAppointmentEndHour: function() {
			return 10;
		},

		_setHoursToZero: function (oDate) {
			oDate.setHours(0, 0, 0, 0);
		},

		handleAppointmentCreate: function () {
			this._createInitialDialogValues(this.getView().byId("SPC1").getStartDate());
		},

		handleHeaderDateSelect: function (oEvent) {
			this._createInitialDialogValues(oEvent.getParameter("date"));
		},

		_createInitialDialogValues: function (oDate) {
			let oStartDate = UI5Date.getInstance(oDate),
				oEndDate = UI5Date.getInstance(oStartDate);

			oStartDate.setHours(this._getDefaultAppointmentStartHour());
			oEndDate.setHours(this._getDefaultAppointmentEndHour());
			this.sPath = null;

			this._arrangeDialogFragment("Create appointment");
		},

		handleStartDateChange: function (oEvent) {
			let oStartDate = oEvent.getParameter("date");
			MessageToast.show("'startDateChange' event fired.\n\nNew start date is "  + oStartDate.toString());
		},

		updateButtonEnabledState: function (oDateTimePickerStart, oDateTimePickerEnd, oButton) {
			let bEnabled = oDateTimePickerStart.getValueState() !== "Error"
				&& oDateTimePickerStart.getValue() !== ""
				&& oDateTimePickerEnd.getValue() !== ""
				&& oDateTimePickerEnd.getValueState() !== "Error";

			oButton.setEnabled(bEnabled);
		},

		handleDateTimePickerChange: function() {
			let oDateTimePickerStart = this.byId("DTPStartDate"),
				oDateTimePickerEnd = this.byId("DTPEndDate"),
				oStartDate = oDateTimePickerStart.getDateValue(),
				oEndDate = oDateTimePickerEnd.getDateValue(),
				bEndDateBiggerThanStartDate = oEndDate.getTime() <= oStartDate.getTime(),
				bErrorState = oStartDate && oEndDate && bEndDateBiggerThanStartDate;

			this._setDateValueState(oDateTimePickerStart, bErrorState);
			this._setDateValueState(oDateTimePickerEnd, bErrorState);
			this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, this.byId("modifyDialog").getBeginButton());
		},

		handleDatePickerChange: function () {
			let oDatePickerStart = this.byId("DPStartDate"),
				oDatePickerEnd = this.byId("DPEndDate"),
				oStartDate = oDatePickerStart.getDateValue(),
				oEndDate = oDatePickerEnd.getDateValue(),
				bEndDateBiggerThanStartDate = oEndDate.getTime() < oStartDate.getTime(),
				bErrorState = oStartDate && oEndDate && bEndDateBiggerThanStartDate;

			this._setDateValueState(oDatePickerStart, bErrorState);
			this._setDateValueState(oDatePickerEnd, bErrorState);
			this.updateButtonEnabledState(oDatePickerStart, oDatePickerEnd, this.byId("modifyDialog").getBeginButton());
		},

		_setDateValueState: function(oPicker, bErrorState) {
			let sValueStateText = "Start date should be before End date";

			if (bErrorState) {
				oPicker.setValueState(ValueState.Error);
				oPicker.setValueStateText(sValueStateText);
			} else {
				oPicker.setValueState(ValueState.None);
			}
		}
	});
});
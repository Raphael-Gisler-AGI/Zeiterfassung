sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
  ],
  function (
    Controller,
    formatter,
    JSONModel,
    MessageToast,
    History,
    UIComponent,
    MessageBox
  ) {
    "use strict";

    return Controller.extend(
      "sap.ui.agi.zeiterfassung.controller.BaseController",
      {
        formatter: formatter,
        baseUrl: "http://localhost:3000",
        CREATION_TYPE: {
          CREATE_ENTRY: 0,
          UPDATE_ENTRY: 1,
          CREATE_FAVORITE: 2,
          UPDATE_FAVORITE: 3,
        },
        CATEGORY_TYPE: {
          PROJECT: 0,
          NON_PROJECT: 1,
          FULL_DAY: 2,
        },

        // Navigation
        /**
         * Navigate back to the previous page
         */
        onNavBack() {
          const router = UIComponent.getRouterFor(this);
          const oHistory = History.getInstance();
          const sPreviousHash = oHistory.getPreviousHash();
          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            router.navTo("time", {});
          }
        },

        // Refresh Global Models
        /**
         * Give the Entries and Categories Model new Data from the server
         * The entire previous data will be overwritten
         * @param {object} newData An object holding both entries and categories
         */
        async updateModels(newData) {
          const { entries, categories } = newData;
          this.getEntriesModel().setData(entries);
          this.getCategoriesModel().setData(categories);
          if (this.getTimerModel().getProperty("/active")) {
            this.addTimerToEntries();
          }
        },
        /**
         * Push a new Entry into the Array of Entries
         * The new Entry is a Timer
         */
        addTimerToEntries() {
          const startTime = Date.parse(localStorage.getItem("startTime"));
          const endTime = Date.now();
          this.getEntriesModel()
            .getData()
            .push({
              timer: true,
              StartTime: startTime,
              EndTime: endTime,
              Duration: this.getDuration(startTime, endTime),
              Description: this.getTimerModel().getProperty("/description"),
              Category: this.getTimerModel().getProperty("/category") || -1,
            });
          this.getEntriesModel().refresh();
        },

        // Get Global Models
        /**
         * Get any Model from the Component
         * @param {string} modelName The name of a Component Model
         * @returns {object}
         */
        getModel(modelName) {
          return this.getOwnerComponent().getModel(modelName);
        },
        /**
         * Get the Entries Model
         * @returns {object}
         */
        getEntriesModel() {
          return this.getModel("entries");
        },
        /**
         * Get the Categories Model
         * @returns {object}
         */
        getCategoriesModel() {
          return this.getModel("categories");
        },
        /**
         * Get the Favorites Model
         * @returns {object}
         */
        getFavoritesModel() {
          return this.getModel("favorites");
        },
        /**
         * Get the Timer Model
         * @returns {object}
         */
        getTimerModel() {
          return this.getModel("timer");
        },
        /**
         * Get the Messages Model
         * @returns {object}
         */
        getMessagesModel() {
          return this.getModel("messages");
        },
        /**
         * Get text from i18n
         * @param {string} text
         * @returns {object}
         */
        getI18nText(text) {
          return this.getModel("i18n").getResourceBundle().getText(text);
        },
        /**
         * Get the Modify Model
         * @returns {object}
         */
        getModifyModel() {
          return this.getView().getModel("modify");
        },

        // CRUD Operations
        /**
         * Sends the provided data to the server
         * @param {string} url
         * @param {string} method POST / PATCH / DELETE
         * @param {object} data
         * @returns {object} The response of a fetch
         */
        async _postData(url, method, data) {
          return await fetch(`${this.baseUrl}${url}`, {
            method: method,
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify(data),
          });
        },
        /**
         * Create an entry
         * @param {object} data
         * @returns {string} The message from the server (success or error)
         */
        async createEntry(data) {
          const res = await this._postData("/createEntry", "POST", data);
          this.updateModels(await res.json());
          return res.statusText;
        },
        /**
         * Update an entry
         * @param {object} data
         * @param {string} id
         * @returns {string} The message from the server (success or error)
         */
        async updateEntry(data, id) {
          const res = await this._postData(`/updateEntry/${id}`, "PATCH", data);
          this.updateModels(await res.json());
          return res.statusText;
        },
        /**
         * Deletes the entry
         * @param {string} id The Id of the entry
         * @returns {string} The message from the server (success or error)
         */
        async deleteEntry(id) {
          const res = await fetch(`${this.baseUrl}/deleteEntry/${id}`, {
            method: "DELETE",
          });
          this.updateModels(await res.json());
          return res.statusText;
        },
        /**
         * Creates a favorite
         * @param {object} data The new favorite
         * @returns {string} The message from the server (success or error)
         */
        async createFavorite(data) {
          const res = await this._postData("/createFavorite", "POST", data);
          this.getFavoritesModel().setData(await res.json());
          return res.statusText;
        },
        /**
         * Updates a favorite
         * @param {object} data The updated favorite
         * @param {string} id The Id of the favorite
         * @returns {string} The message from the server (success or error)
         */
        async updateFavorite(data, id) {
          const res = await this._postData(
            `/updateFavorite/${id}`,
            "PATCH",
            data
          );
          this.getFavoritesModel().setData(await res.json());
          return res.statusText;
        },
        /**
         * Delete a favorite
         * @param {string} id The Id of the favorite
         * @returns {string} The message from the server (success or error)
         */
        async deleteFavorite(id) {
          const res = await fetch(`${this.baseUrl}/deleteFavorite/${id}`, {
            method: "DELETE",
          });
          this.getFavoritesModel().setData(await res.json());
          return res.statusText;
        },

        // Before CRUD
        /**
         * Handles the data before given to the server
         * The data is handled dependant on the creation type
         */
        async handleData() {
          const modifyData = this.getView().getModel("modify").getData();
          const data = {
            StartTime: modifyData.startTime,
            EndTime: modifyData.endTime,
            Duration: this.getDuration(
              modifyData.startTime,
              modifyData.endTime
            ),
            Description: modifyData.description,
            Category: modifyData.category,
          };
          if (modifyData.type === this.CATEGORY_TYPE.FULL_DAY) {
            data.HalfDay = modifyData.halfDay;
          }
          let statusText;
          switch (modifyData.creationType) {
            case this.CREATION_TYPE.CREATE_ENTRY:
              statusText = await this.createEntry(data);
              break;
            case this.CREATION_TYPE.UPDATE_ENTRY:
              statusText = await this.updateEntry(data, modifyData.id);
              break;
            case this.CREATION_TYPE.CREATE_FAVORITE:
              delete data.Duration;
              data.Name = modifyData.name;
              statusText = await this.createFavorite(data);
              break;
            case this.CREATION_TYPE.UPDATE_FAVORITE:
              delete data.Duration;
              data.Name = modifyData.name;
              statusText = await this.updateFavorite(data, modifyData.id);
              break;
            default:
              statusText = "An error has occured";
              break;
          }
          MessageToast.show(statusText);
        },
        /**
         * Deletes the entry or favorite
         * @param {string} id The Id of an entry or favorite
         * @param {boolean} isEntry If the given Id is from an entry
         * @returns
         */
        async handleConfirmDelete(id, isEntry) {
          if (isEntry) {
            return await this.deleteEntry(id);
          }
          return await this.deleteFavorite(id);
        },
        /**
         * Creates a popup that asks the user if the element should be deleted
         * @param {string} id The Id of an entry or favorite
         * @param {boolean} isEntry If the given Id is from an entry
         */
        confirmDeleteEntry(id, isEntry) {
          MessageBox.confirm(
            `Are you sure you want to permanently delete this ${
              isEntry ? "entry" : "favorite"
            }`,
            {
              title: "Confirm Deletion",
              onClose: async (oEvent) => {
                if (oEvent === "OK") {
                  MessageToast.show(
                    await this.handleConfirmDelete(id, isEntry)
                  );
                }
              },
            }
          );
        },
        /**
         * Calculate the difference between the start time and end time
         * @param {number} startTime The Start Time
         * @param {number} endTime The End Time
         * @returns {number|undefined} The difference between the two in minutes
         */
        getDuration(startTime, endTime) {
          const durationDate = new Date(endTime - startTime);
          const result =
            durationDate.getMinutes() + (durationDate.getHours() - 1) * 60;
          return result === NaN ? undefined : result;
        },
        /**
         * Opens a dialog
         * @param {object} modifyModel The model that will be used for the form
         */
        openModifyDialog(modifyModel) {
          this.getView().setModel(new JSONModel(modifyModel), "modify");
          if (!this.pDialog) {
            this.pDialog = this.loadFragment({
              name: "sap.ui.agi.zeiterfassung.view.Modify",
            });
          }
          this.pDialog.then(function (oDialog) {
            oDialog.open();
          });
        },
        /**
         * Gets the type of a category
         * (Project, Non Project, Full Day)
         * @param {number} category
         * @returns {number}
         */
        getCategoryType(category) {
          return this.getCategoriesModel()
            .getData()
            .find((c) => c.id == category)?.Type;
        },
        /**
         * Writes to the modify model what the new type is
         * @param {object} oEvent
         */
        setModifyType(oEvent) {
          const id = oEvent.getSource().getSelectedKey();
          this.getModifyModel().setProperty("/type", this.getCategoryType(id));
        },

        // Formatting Dates
        /**
         * Converts a date object into a string
         * @param {Date} date
         * @returns {string|undefined}
         */
        dateToString(date) {
          if (!date) {
            return undefined;
          }
          return `${date.getFullYear()} ${
            date.getMonth() + 1
          } ${date.getDate()}`;
        },
        /**
         * Combines a date and time
         * @param {Date} date 
         * @param {string} time 
         * @returns {number|undefined}
         */
        timeToDate(date, time) {
          if (!time) {
            return undefined;
          }
          return Date.parse(
            `${this.dateToString(date) || this.dateToString(new Date())} ${
              time || "00:00"
            }`
          );
        },
        /**
         * Error Handling
         * @param {object} modify
         * @returns {object} An object containing all the errors
         */
        modifyErrorHandling(modify) {
          const errors = {};
          if (
            modify.creationType === this.CREATION_TYPE.CREATE_FAVORITE ||
            modify.creationType === this.CREATION_TYPE.UPDATE_FAVORITE
          ) {
            if (!modify.name || modify.name.trim() === "") {
              errors.name = {
                state: "Error",
                message: this.getI18nText("ModifyErrorName"),
              };
            }
          }
          if (
            modify.creationType === this.CREATION_TYPE.CREATE_ENTRY ||
            modify.creationType === this.CREATION_TYPE.UPDATE_ENTRY
          ) {
            if (!modify.description || modify.description.trim() === "") {
              errors.description = {
                state: "Error",
                message: this.getI18nText("ModifyErrorDescription"),
              };
            }
            if (!modify.category) {
              errors.category = {
                state: "Error",
                message: this.getI18nText("ModifyErrorCategory"),
              };
            }
            if (!modify.startDay) {
              errors.startDay = {
                state: "Error",
                message: this.getI18nText("ModifyErrorStartDay"),
              };
            }
            if (modify.type != this.CATEGORY_TYPE.FULL_DAY) {
              if (!modify.startTime) {
                errors.startTime = {
                  state: "Error",
                  message: this.getI18nText("ModifyErrorStartTime"),
                };
              }
              if (!modify.endTime) {
                errors.endTime = {
                  state: "Error",
                  message: this.getI18nText("ModifyErrorEndTime"),
                };
              }
            } else {
              if (!modify.endDay) {
                errors.endDay = {
                  state: "Error",
                  message: this.getI18nText("ModifyErrorEndDay"),
                };
              }
            }
          }
          if (modify.startTime > modify.endTime) {
            errors.startTime = {
              state: "Error",
              message: this.getI18nText("ModifyErrorStartEndTime"),
            };
            errors.endTime = {
              state: "Error",
              message: this.getI18nText("ModifyErrorStartEndTime"),
            };
          }
          return errors;
        },
        /**
         * Handle the submitted data from the Modify Dialog and Convert the date objects
         * @returns {void}
         */
        async onSubmitModifyDialog() {
          this.getView().setModel(new JSONModel({}), "modifyErrors");
          const modify = this.getView().getModel("modify").getData();
          // Error handling
          const errors = this.modifyErrorHandling(modify);
          if (Object.keys(errors).length > 0) {
            this.getView().getModel("modifyErrors").setData(errors);
            return;
          }
          // Formatting Time
          modify.startTime =
            this.timeToDate(
              modify.startDay,
              modify.type != this.CATEGORY_TYPE.FULL_DAY
                ? modify.startTime
                : "00:00"
            ) || undefined;
          modify.endTime =
            this.timeToDate(
              modify.type != this.CATEGORY_TYPE.FULL_DAY
                ? modify.startDay
                : modify.endDay,
              modify.type != this.CATEGORY_TYPE.FULL_DAY
                ? modify.endTime
                : "00:00"
            ) || undefined;
          await this.handleData();
          this.onCloseModifyDialog();
        },
        /**
         * Closes the Modify Dialog and resets the errors model
         */
        onCloseModifyDialog() {
          this.getView().getModel("modifyErrors")?.setData({});
          this.byId("modifyDialog").close();
        },
        /**
         * Add a trailing 0 if necessary
         * @param {object|number} time
         * @returns {string|undefined} If time is set returns a string otherwise undefined
         */
        formatTime(time) {
          if (!time) {
            return undefined;
          }
          if (typeof time == "number") {
            time = new Date(time);
          }
          const hours = time.getHours();
          const minutes = time.getMinutes();
          return `${hours < 10 ? "0" + hours : hours}:${
            minutes < 10 ? "0" + minutes : minutes
          }`;
        },
      }
    );
  }
);

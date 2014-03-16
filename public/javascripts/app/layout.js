$(document).ready(function () {
  ChatServer.initApp();
});

var ChatServer = {
  initApp: function () {
    this.app.initBindings();
  },

  app: {
    initBindings: function () {
      this.modalBindings();
      this.buttonBindings();
      this.focusFieldOnModalLoad('#username-modal', '#username');
    },

    modalBindings: function () {
      $('#username-modal').modal({show: true, backdrop: 'static', keyboard: false});
    },

    buttonBindings: function () {
      this.buttonEnableOnText('#username', '#submit-username-btn');
      this.buttonEnableOnText('#chat-room-name', '#create-chat-room-btn');
      this.buttonEnableOnText('#enter-message', '#send-btn');
    },

    enableButtonOnInput: function (btnSelector, fieldSelector, event) {
      if ($(fieldSelector).val().trim() !== '') {
        $(btnSelector).removeClass('disabled');
        if (event.keyCode === 13) {
          $(btnSelector).click();
        }
      }
      else {
        $(btnSelector).addClass('disabled');
      }
    },

    buttonEnableOnText: function (fieldSelector, btnSelector) {
      var self = this;

      $(fieldSelector).keyup(function (event) {
        self.enableButtonOnInput(btnSelector, fieldSelector, event);
      });
    },

    focusFieldOnModalLoad: function (modalSelector, fieldSelector) {
      $(modalSelector).on('shown.bs.modal', function () {
        $(fieldSelector).focus();
      })
    }
  }
}


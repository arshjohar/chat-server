$(document).ready(function () {
  var socket = io.connect('/');
  var users = {};

  var utils = {
    appendToWindowAndScroll: function (windowSelector, dom) {
      var element = $(windowSelector);
      element.append(dom);
      element.scrollTop(element[0].scrollHeight - element.height());
    }
  }

  var displayChatRoom = function (chatRoomName) {
    $('.chat-room-window').each(function () {
      $(this).removeClass('hide');
    });
    $('.homepage-window').each(function () {
      $(this).addClass('hide');
    });
    $('#current-chat-room').text(' ' + chatRoomName);
  }

  $('#submit-username-btn').click(function () {
    var username = $('#username').val().trim();
    if (username !== '') {
      socket.emit('join', username);
    }
  });

  $('#create-chat-room-btn').click(function () {
    var chatRoomToCreate = $('#chat-room-name').val().trim();
    if (chatRoomToCreate !== '') {
      socket.emit('create-chat-room', chatRoomToCreate);
    }
  });

  $('.listed-chat-room').click(function () {
    var chatRoomToJoin = $(this).text();

    if (chatRoomToJoin !== '') {
      socket.emit('join-chat-room', chatRoomToJoin);
    }
  });

  $('#send-btn').click(function () {
    var messageContent = $('#enter-message').val().trim();
    var chatRoom = $('#current-chat-room').text().trim();

    if (messageContent !== '') {
      socket.emit('message-all', {messageContent: messageContent, chatRoom: chatRoom});
      $('#enter-message').val('');
      $('#send-btn').addClass('disabled');
    }
  });

  $(window).on('beforeunload', function () {
    return 'This will exit the chat for the current username.';
  });

  $(window).on('unload', function () {
    var chatRoomToExit = $('#current-chat-room').text().trim();
    if (chatRoomToExit !== '') {
      socket.emit('exit-chat-room', chatRoomToExit);
    }
  });

  socket.on('exit', function () {
    window.close();
  });

  socket.on('user-registered', function () {
    $('#username-modal').modal('hide');
  });

  socket.on('duplicate-username', function (msg) {
    $('#username-modal .help-block').replaceWith("<span class='help-block'>" + msg + "</span>");
    $('#username-modal .modal-body').addClass('has-error');
  });

  socket.on('chat-room-joined-or-created', function (data) {
    displayChatRoom(data.chatRoomName);
    var updateHtmlChatWindow = "<i class='fa fa-sign-in'></i> " + data.successMessage + "<br>";
    utils.appendToWindowAndScroll('#chat-window', updateHtmlChatWindow);
  });

  socket.on('duplicate-chat-room', function (msg) {
    $('#new-chat-room .help-block').replaceWith("<span class='help-block'>" + msg + "</span>");
    $('#new-chat-room').addClass('has-error');
  });

  socket.on('messages', function (chatMessages) {
    var messageHtml = '';
    $.each(chatMessages, function (_, chatMessage) {
      messageHtml += "<i class='fa fa-angle-double-right'></i> <strong>" + chatMessage.username + ": </strong>" + chatMessage.messageContent + "<br>";
    });
    utils.appendToWindowAndScroll('#chat-window', messageHtml);
  });

  socket.on('user-joined', function (userInfo) {
    var updateHtmlChatWindow = "<i class='fa fa-user'> <i class='fa fa-plus-circle'></i></i> <strong>" + userInfo.username + "</strong>" + userInfo.updateMessage + "<br>";
    utils.appendToWindowAndScroll('#chat-window', updateHtmlChatWindow);
  });

  socket.on('updated-users', function (users) {
    var newUsersList = "<div id='users-list'>";
    $.each(users, function (key, value) {
      newUsersList += "<div><strong><i class='fa fa-user'></i> " + value + "</strong></div>";
    });
    newUsersList += '</div>';
    $('#users-list').replaceWith(newUsersList);
  });

  socket.on('user-left', function (userInfo) {
    $('#chat-window').append("<i class='fa fa-user'></i> <i class='fa fa-minus-circle'></i> <strong>" + userInfo.username + "</strong>" + userInfo.updateMessage + "<br>");
  });
});

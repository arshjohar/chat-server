var ChatRoom = require('./src/models/chat_room'),
  ChatMessage = require('./src/models/chat_message');

var SocketRoutes = function (app) {
  var users = {};

  function userExists(username) {
    for (key in users) {
      if (users[key] === username) {
        return true;
      }
    }
    return false;
  }

  app.io.route('join', function (req) {
    var username = req.data.trim();

    if (username !== '') {
      if (userExists(username)) {
        req.io.emit('duplicate-username', "Please select another username, since '" + username + "' already exists");
      }
      else {
        users[req.socket.id] = username;
        req.io.emit('user-registered');
      }
    }
  });

  app.io.route('message-all', function (req) {
    var messageContent = req.data.messageContent.trim(),
      currentChatRoom = req.data.chatRoom.trim();

    if (messageContent !== '') {
      ChatMessage.create({content: messageContent, username: users[req.socket.id]}, function (err, chatMessage) {
        ChatRoom.findOne({name: currentChatRoom}, function (err, chatRoom) {
          chatRoom.messages.push(chatMessage);
          chatRoom.save(function () {
            app.io.room(currentChatRoom).broadcast('messages', [
              {messageContent: messageContent, username: users[req.socket.id]}
            ]);
          });
        });
      });
    }
  });

  app.io.route('join-chat-room', function (req) {
    var chatRoomToJoin = req.data.trim(),
      username = users[req.socket.id];

    ChatRoom.findOne({name: chatRoomToJoin}, function (err, chatRoom) {
      if (chatRoom.users.indexOf(username) < 0) {
        chatRoom.users.push(username);
        req.io.join(chatRoomToJoin);

        var messagesWithUsernames = [];
        chatRoom.populate('messages', function () {
          if (chatRoom.messages !== null) {
            chatRoom.messages.forEach(function (chatMessage) {
              messagesWithUsernames.push({messageContent: chatMessage.content, username: chatMessage.username});
            });
          }

          chatRoom.save(function () {
            req.io.room(chatRoomToJoin).broadcast('user-joined', {username: username, updateMessage: ' just joined the chat room.'});
            req.io.emit('messages', messagesWithUsernames);
            req.io.emit('chat-room-joined-or-created', {successMessage: 'You just joined the chat room ' + chatRoomToJoin + '. Have fun!!', chatRoomName: chatRoomToJoin});
            app.io.room(chatRoomToJoin).broadcast('updated-users', chatRoom.users);
          });
        });
      }
    });
  });

  app.io.route('create-chat-room', function (req) {
    var chatRoomToCreate = req.data.trim(),
      username = users[req.socket.id];

    if ('/' + chatRoomToCreate in req.io.manager.rooms) {
      req.io.emit('duplicate-chat-room', chatRoomToCreate + ' already exists. Please select another name.')
    }
    else {
      ChatRoom.create({name: chatRoomToCreate, users: [username]}, function (err, chatRoom) {
        req.io.join(chatRoomToCreate);
        req.io.emit('chat-room-joined-or-created', {successMessage: 'You just created the chat room ' + chatRoomToCreate, chatRoomName: chatRoomToCreate});
        req.io.emit('updated-users', chatRoom.users);
      });
    }
  });

  app.io.route('exit-chat-room', function (req) {
    var chatRoomToExit = req.data.trim(),
      username = users[req.socket.id];

    ChatRoom.findOne({name: chatRoomToExit}, function (err, chatRoom) {
      chatRoom.users.splice(chatRoom.users.indexOf(username), 1);

      chatRoom.save(function () {
        req.io.leave(chatRoomToExit);
        delete users[req.socket.id];

        app.io.room(chatRoomToExit).broadcast('user-left', {username: username, updateMessage: ' left the chat room.'});
        app.io.room(chatRoomToExit).broadcast('updated-users', chatRoom.users);
      });
    });
  });
}

module.exports = SocketRoutes;

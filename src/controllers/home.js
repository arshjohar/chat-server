var mongoose = require('mongoose'),
  ChatRoom = require('../models/chat_room');

var Home = function (app) {
  app.get('/', function (req, res) {
    ChatRoom.find({}, function (err, chatRooms) {
      res.render('home/homepage', {chatRooms: chatRooms});
    });
  });
}

module.exports = Home;

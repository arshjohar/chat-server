var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId,
  ChatMessage = require('./chat_message');

var ChatRoomSchema = new Schema({
  name: {type: String, trim: true, index: {unique: true}},
  users: [String],
  messages: [{type: ObjectId, ref: 'ChatMessage'}]
});

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);

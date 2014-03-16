var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var ChatMessageSchema = new Schema({
  content: {type: String, trim: true},
  username: String
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);

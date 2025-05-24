const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userQuery: String,
  botResponse: String,
  intent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", messageSchema);

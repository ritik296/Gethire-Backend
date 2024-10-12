const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  lastMessageTime: { type: Date },
});

const ConversationModel = mongoose.model("Conversation", ConversationSchema);
module.exports = ConversationModel;

// models/AdminChatModel.js
const mongoose = require("mongoose");

const AdminChatSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  senderType: {
    type: String,
    enum: ["Admin", "Company"],
    required: true,
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const AdminChatModel = mongoose.model("AdminChat", AdminChatSchema);
module.exports = AdminChatModel;

// models/AdminConversationModel.js
const mongoose = require("mongoose");

const AdminConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "AdminChat" },
  lastMessageTime: { type: Date },
});

const AdminConversationModel = mongoose.model("AdminConversation", AdminConversationSchema);
module.exports = AdminConversationModel;

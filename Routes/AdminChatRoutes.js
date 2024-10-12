const express = require("express");
const router = express.Router();
const {
  createConversation,
  getMessages,
  getConversation,
  saveMessage,
} = require("../Controllers/AdminChatController");

router.get("/conversations/:conversationId/messages", getMessages);
router.get("/conversations/:companyId/admin", getConversation);
router.post("/conversations", createConversation);
router.post("/messages", saveMessage);

module.exports = router;

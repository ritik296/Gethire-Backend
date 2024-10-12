const express = require("express");
const router = express.Router();
const {
  createConversation,
  getMessages,
  getCoversation,
} = require("../Controllers/ChatController");

router.get("/conversations/:conversationId/messages", getMessages);
router.get("/conversation/:companyId/:studentId", getCoversation);
router.post("/conversations", createConversation);

module.exports = router;

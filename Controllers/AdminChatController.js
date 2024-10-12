const Chat = require("../Model/AdminChatModel");
const Conversation = require("../Model/AdminConversationModel");
const Company = require("../Model/CompanyModel");
const Admin = require("../Model/AdminModel");
const asynchandler = require("express-async-handler");
const response = require("../Middleware/responseMiddlewares");

const getMessages = asynchandler(async (req, res) => {
  try {
    const messages = await Chat.find({
      conversationId: req.params.conversationId,
    });
    const populatedMessages = await Promise.all(
      messages.map(async (message) => {
        let sender;
        if (message.senderType === "Company") {
          sender = await Company.findById(message.senderId).select("name");
        } else if (message.senderType === "Admin") {
          sender = await Admin.findById(message.senderId).select("name");
        }

        if (!sender) {
          console.error(
            `Sender not found: type=${message.senderType}, id=${message.senderId}`
          );
          return {
            ...message._doc,
            sender: { _id: null, name: "Unknown" },
          };
        }

        return {
          ...message._doc,
          sender: { _id: sender._id, name: sender.name },
        };
      })
    );
    response.successResponse(res, populatedMessages, "Messages Fetched");
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const createConversation = asynchandler(async (req, res) => {
  try {
    const conversation = new Conversation({
      participants: req.body.participants,
    });
    await conversation.save();
    response.successResponse(res, conversation, "Conversation Created");
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const saveMessage = asynchandler(async (data, io) => {
  const { conversationId, senderId, senderType, message } = data.body;
  const chatMessage = new Chat({
    conversationId,
    senderId,
    senderType,
    message,
  });
  try {
    await chatMessage.save();
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: chatMessage._id,
      lastMessageTime: chatMessage.timestamp,
    });
    io.to(conversationId).emit("receiveMessage", chatMessage);
  } catch (error) {
    console.error(error);
    // return response.internalServerError(res, "Internal server error");
  }
});

const getConversation = asynchandler(async (req, res) => {
  const { companyId } = req.params;
  try {
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }
    // Assuming Admin model exists and has a 'role' field to distinguish admins
    const admin = await Admin.findOne().select("_id"); // Assuming User model contains Admin and Company

    if (!admin) {
      return res.status(500).json({ error: "No admin found" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [companyId, admin._id] },
    });
    if (!conversation) {
      conversation = new Conversation({
        participants: [companyId, admin._id],
      });

      await conversation.save();
    }
    response.successResponse(res, conversation, "Conversation created");
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

module.exports = {
  getMessages,
  saveMessage,
  getConversation,
  createConversation,
};

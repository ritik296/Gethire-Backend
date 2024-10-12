const Chat = require("../Model/ChatModel");
const Conversation = require("../Model/ConversationModel");
const Company = require("../Model/CompanyModel");
const Student = require("../Model/StudentModel");
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
        if (message.senderType === "Student") {
          sender = await Student.findById(message.senderId).select("Name");
        } else if (message.senderType === "Company") {
          sender = await Company.findById(message.senderId).select("Name");
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
          sender: { _id: sender._id, name: sender.Name },
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
    response.successResponse(res, conversation, "conversation Fetched");
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const saveMessage = asynchandler(async (data, io) => {
  const { conversationId, senderId, message } = data;
  const chatMessage = new Chat({
    conversationId,
    sender: senderId,
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
    return response.internalServerError(res, "Internal server error");
  }
});

const getCoversation = asynchandler(async (req, res) => {
  const { companyId, studentId } = req.params;
  try {
    if (!companyId || !studentId) {
      return res
        .status(400)
        .json({ error: "Company ID and Student ID are required" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [companyId, studentId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [companyId, studentId],
      });

      await conversation.save();
    }

    response.successResponse(res, conversation, "conversation created");
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

module.exports = {
  getMessages,
  saveMessage,
  getCoversation,
  createConversation,
};

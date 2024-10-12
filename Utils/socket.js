const socketIo = require("socket.io");
const Chat = require("../Model/ChatModel");
const Conversation = require("../Model/ConversationModel");
const AdminChat = require("../Model/AdminChatModel");
const AdminConversation = require("../Model/AdminConversationModel");

// Track online users
let onlineUsers = {};

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: [
        process.env.student,
        process.env.hiring,
        "http://localhost:3000",
        "http://localhost:3001",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    socket.on("userConnected", (userId) => {
      onlineUsers[userId] = socket.id;
      io.emit("userStatus", { userId, online: true });
    });

    socket.on("userDisconnected", () => {
      const userId = Object.keys(onlineUsers).find(
        (key) => onlineUsers[key] === socket.id
      );
      if (userId) {
        delete onlineUsers[userId];
        io.emit("userStatus", { userId, online: false });
      }
    });

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("sendMessage", async (data) => {
      const { conversationId, senderId, senderType, message } = data;
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
        console.error("Error saving message to database:", error);
      }
    });
    socket.on("sendMessageAdmin", async (data) => {
      const { conversationId, senderId, senderType, message } = data;
      const chatMessage = new AdminChat({
        conversationId,
        senderId,
        senderType,
        message,
      });
      try {
        await chatMessage.save();
        await AdminConversation.findByIdAndUpdate(conversationId, {
          lastMessage: chatMessage._id,
          lastMessageTime: chatMessage.timestamp,
        });
        io.to(conversationId).emit("receiveMessage", chatMessage);
      } catch (error) {
        console.error("Error saving message to database:", error);
      }
    });

    socket.on("disconnect", () => {});
  });
};

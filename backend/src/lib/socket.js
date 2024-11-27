import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js"; // Import Message model

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

// used to store online users
const userSocketMap = {}; // {userId: socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on('mark-conversation-read', async (data) => {
    const { senderId, receiverId } = data;

    try {
      // Update messages in the database
      const updateResult = await Message.updateMany(
        {
          senderId: senderId,
          receiverId: receiverId,
          status: { $ne: 'read' }
        },
        {
          $set: { status: 'read' }
        }
      );

      // Emit read receipt to both sender and receiver
      const senderSocketId = getReceiverSocketId(senderId);
      const receiverSocketId = getReceiverSocketId(receiverId);

      // Broadcast read status to both users
      if (senderSocketId) {
        io.to(senderSocketId).emit('conversation-read', {
          conversationPartnerId: receiverId,
          status: 'read'
        });
      }

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('conversation-read', {
          conversationPartnerId: senderId,
          status: 'read'
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on('typing', (data) => {
    const { senderId, receiverId } = data;
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', {
        senderId,
        isTyping: true
      });
    }
  });

  socket.on('stop-typing', (data) => {
    const { senderId, receiverId } = data;
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', {
        senderId,
        isTyping: false
      });
    }
  });
  
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
export { io, app, server };
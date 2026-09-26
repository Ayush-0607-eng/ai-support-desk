import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import ChatMessage from "./models/ChatMessage.js";
import logger from "./config/logger.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const room = `org:${socket.user.organization}`;
    socket.join(room);
    logger.info(`Socket connected: ${socket.user.name} joined ${room}`);

    socket.on("chat:send", async (payload, callback) => {
      try {
        const message = await ChatMessage.create({
          organization: socket.user.organization,
          author: socket.user._id,
          content: payload.content
        });
        const populated = await message.populate("author", "name avatarColor role");
        io.to(room).emit("chat:message", populated);
        if (callback) callback({ ok: true });
      } catch (error) {
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

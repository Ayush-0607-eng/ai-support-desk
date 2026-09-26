import asyncHandler from "express-async-handler";
import ChatMessage from "../models/ChatMessage.js";

export const getChatMessages = asyncHandler(async (req, res) => {
  const messages = await ChatMessage.find({ organization: req.user.organization }).populate("author", "name avatarColor role").sort({ createdAt: 1 }).limit(200);
  res.json(messages);
});

import asyncHandler from "express-async-handler";
import Feedback from "../models/Feedback.js";

export const createFeedback = asyncHandler(async (req, res) => {
  const { messageId, ticketId, rating, comment } = req.body;
  const feedback = await Feedback.create({
    message: messageId,
    ticket: ticketId,
    ratedBy: req.user._id,
    rating,
    comment
  });
  res.status(201).json(feedback);
});

export const getFeedbackStats = asyncHandler(async (req, res) => {
  const helpful = await Feedback.countDocuments({ rating: "helpful" });
  const notHelpful = await Feedback.countDocuments({ rating: "not_helpful" });
  res.json({ helpful, notHelpful, total: helpful + notHelpful });
});

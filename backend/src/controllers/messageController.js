import asyncHandler from "express-async-handler";
import Message from "../models/Message.js";
import Ticket from "../models/Ticket.js";
import { queryRag } from "../utils/aiClient.js";
import { sendTicketReplyEmail } from "../utils/emailClient.js";

const getOrgTicket = async (ticketId, organization) => {
  return Ticket.findOne({ _id: ticketId, organization });
};

const canReply = (ticket, user) => {
  if (user.role === "admin") return true;
  return (ticket.assignedAgents || []).some((id) => id.toString() === user._id.toString());
};

export const getMessages = asyncHandler(async (req, res) => {
  const ticket = await getOrgTicket(req.params.ticketId, req.user.organization);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  const messages = await Message.find({ ticket: ticket._id }).populate("author", "name avatarColor").sort({ createdAt: 1 });
  res.json(messages);
});

export const createMessage = asyncHandler(async (req, res) => {
  const { content, sender } = req.body;
  const ticket = await getOrgTicket(req.params.ticketId, req.user.organization);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  if (sender !== "customer" && !canReply(ticket, req.user)) {
    res.status(403);
    throw new Error("Only the admin or agents assigned to this ticket can reply");
  }
  const message = await Message.create({
    ticket: ticket._id,
    sender: sender || "agent",
    author: sender === "customer" ? null : req.user._id,
    content
  });
  if (ticket.status === "open" && sender === "agent") {
    ticket.status = "pending";
    await ticket.save();
  }
  if (sender === "agent" || !sender) {
    sendTicketReplyEmail(ticket, content);
  }
  const populated = await message.populate("author", "name avatarColor");
  req.app.get("io").to(`org:${req.user.organization}`).emit("message:created", { ticketId: ticket._id.toString(), message: populated });
  res.status(201).json(populated);
});

export const generateAiDraft = asyncHandler(async (req, res) => {
  const ticket = await getOrgTicket(req.params.ticketId, req.user.organization);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  if (!canReply(ticket, req.user)) {
    res.status(403);
    throw new Error("Only the admin or agents assigned to this ticket can generate a draft");
  }
  const history = await Message.find({ ticket: ticket._id }).sort({ createdAt: 1 }).limit(20);
  const context = history.map((m) => `${m.sender}: ${m.content}`).join("\n");
  const question = req.body.question || ticket.description;
  const aiResult = await queryRag(question, context, req.user.organization.toString());
  const draft = await Message.create({
    ticket: ticket._id,
    sender: "ai",
    content: aiResult.answer,
    isDraft: true,
    sources: aiResult.sources || []
  });
  req.app.get("io").to(`org:${req.user.organization}`).emit("message:created", { ticketId: ticket._id.toString(), message: draft });
  res.status(201).json(draft);
});

export const approveDraft = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  const ticket = await getOrgTicket(message.ticket, req.user.organization);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  if (!canReply(ticket, req.user)) {
    res.status(403);
    throw new Error("Only the admin or agents assigned to this ticket can approve a draft");
  }
  message.isDraft = false;
  message.author = req.user._id;
  await message.save();
  sendTicketReplyEmail(ticket, message.content);
  req.app.get("io").to(`org:${req.user.organization}`).emit("message:created", { ticketId: ticket._id.toString(), message });
  res.json(message);
});

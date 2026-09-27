import asyncHandler from "express-async-handler";
import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import { canReply } from "../utils/permissions.js";

export const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, customerName, customerEmail, priority, category } = req.body;
  if (!subject || !description || !customerName || !customerEmail) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }
  const ticket = await Ticket.create({
    subject,
    description,
    customerName,
    customerEmail,
    priority,
    category,
    createdBy: req.user._id,
    organization: req.user.organization
  });
  await Message.create({ ticket: ticket._id, sender: "customer", content: description });
  req.app.get("io").to(`org:${req.user.organization}`).emit("ticket:created", ticket);
  res.status(201).json(ticket);
});

export const getTickets = asyncHandler(async (req, res) => {
  const { status, priority, search, assignedTo } = req.query;
  const filter = { organization: req.user.organization };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedAgents = assignedTo;
  if (search) filter.$text = { $search: search };
  const tickets = await Ticket.find(filter).populate("assignedAgents", "name email avatarColor").populate("createdBy", "name email").sort({ createdAt: -1 });
  res.json(tickets);
});

export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, organization: req.user.organization }).populate("assignedAgents", "name email avatarColor").populate("createdBy", "name email");
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  res.json(ticket);
});

export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, organization: req.user.organization });
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  if (!canReply(ticket, req.user)) {
    res.status(403);
    throw new Error("Only the admin or agents assigned to this ticket can update it");
  }
  const updatable = ["subject", "description", "status", "priority", "category", "tags"];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) ticket[field] = req.body[field];
  });
  await ticket.save();
  const populated = await ticket.populate([
    { path: "assignedAgents", select: "name email avatarColor" },
    { path: "createdBy", select: "name email" }
  ]);
  req.app.get("io").to(`org:${req.user.organization}`).emit("ticket:updated", populated);
  res.json(populated);
});

export const assignAgents = asyncHandler(async (req, res) => {
  const { agentIds } = req.body;
  const ticket = await Ticket.findOne({ _id: req.params.id, organization: req.user.organization });
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  ticket.assignedAgents = agentIds || [];
  await ticket.save();
  const populated = await ticket.populate([
    { path: "assignedAgents", select: "name email avatarColor" },
    { path: "createdBy", select: "name email" }
  ]);
  req.app.get("io").to(`org:${req.user.organization}`).emit("ticket:updated", populated);
  res.json(populated);
});

export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, organization: req.user.organization });
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  await Message.deleteMany({ ticket: ticket._id });
  await ticket.deleteOne();
  res.json({ message: "Ticket deleted" });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const organization = req.user.organization;
  const total = await Ticket.countDocuments({ organization });
  const statusCounts = await Ticket.aggregate([{ $match: { organization } }, { $group: { _id: "$status", count: { $sum: 1 } } }]);
  const priorityCounts = await Ticket.aggregate([{ $match: { organization } }, { $group: { _id: "$priority", count: { $sum: 1 } } }]);
  const urgent = await Ticket.countDocuments({ organization, priority: "urgent", status: { $ne: "closed" } });
  const recentTickets = await Ticket.find({ organization }).sort({ createdAt: -1 }).limit(5).populate("assignedAgents", "name avatarColor");
  const byStatus = { open: 0, pending: 0, resolved: 0, closed: 0 };
  statusCounts.forEach((s) => { byStatus[s._id] = s.count; });
  const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
  priorityCounts.forEach((p) => { byPriority[p._id] = p.count; });
  res.json({ total, open: byStatus.open, pending: byStatus.pending, resolved: byStatus.resolved, urgent, byStatus, byPriority, recentTickets });
});

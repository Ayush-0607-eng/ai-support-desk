import express from "express";
import { createTicket, getTickets, getTicketById, updateTicket, deleteTicket, getDashboardStats, assignAgents } from "../controllers/ticketController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/stats/dashboard", getDashboardStats);
router.route("/").get(getTickets).post(adminOnly, createTicket);
router.route("/:id").get(getTicketById).put(updateTicket).delete(deleteTicket);
router.put("/:id/assign", adminOnly, assignAgents);

export default router;

import express from "express";
import { createFeedback, getFeedbackStats } from "../controllers/feedbackController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/", createFeedback);
router.get("/stats", getFeedbackStats);

export default router;

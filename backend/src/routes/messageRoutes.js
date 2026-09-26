import express from "express";
import { getMessages, createMessage, generateAiDraft, approveDraft } from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.route("/:ticketId").get(getMessages).post(createMessage);
router.post("/:ticketId/ai-draft", generateAiDraft);
router.put("/draft/:id/approve", approveDraft);

export default router;

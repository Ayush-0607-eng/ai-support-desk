import express from "express";
import { getChatMessages } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getChatMessages);

export default router;

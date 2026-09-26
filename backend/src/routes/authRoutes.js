import express from "express";
import { registerOrganization, registerAgent, loginUser, getMe, getAgents } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register-organization", registerOrganization);
router.post("/register-agent", registerAgent);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/agents", protect, getAgents);

export default router;

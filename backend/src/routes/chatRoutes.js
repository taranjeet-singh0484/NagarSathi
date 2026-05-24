import express from "express";
import { chatWithBot } from "../controllers/chatController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Only citizens can use chatbot
router.post("/", protect, requireRole("citizen"), chatWithBot);

export default router;

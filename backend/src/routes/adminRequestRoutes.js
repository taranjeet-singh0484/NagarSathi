// backend/routes/adminRequestRoutes.js
import express from "express";
import {
  requestAdminRole,
  getPendingAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
} from "../controllers/adminRequestController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();
router.post("/request", protect, requestAdminRole);               // any logged-in user
router.get("/pending", protect, requireRole("admin"), getPendingAdminRequests); // admin only
router.patch("/:id/approve", protect, requireRole("admin"), approveAdminRequest);
router.patch("/:id/reject",  protect, requireRole("admin"), rejectAdminRequest);
export default router;


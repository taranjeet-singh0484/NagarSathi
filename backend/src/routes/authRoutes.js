import express from "express";
import { body } from "express-validator";
import passport from "../config/passport.js"; // ← add
import {
  register,
  login,
  me,
  googleCallback,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

// Routes for user authentication (register, login, etc.)

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.get("/me", protect, me);

// ── Google OAuth routes ──────────────────── // ← add these
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  googleCallback
);
// ── End Google OAuth routes ──────────────────


// Export authentication routes

export default router;

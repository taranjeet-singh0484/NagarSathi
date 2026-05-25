import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import { isDisposableEmail } from "../utils/emailValidator.js";

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      adminStatus: user.adminStatus,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "7d" },
  );

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (isDisposableEmail(email)) {
      return res.status(400).json({
        message:
          "Disposable email addresses are not allowed. Please use a valid email.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const userData = {
      name,
      email,
      password,
      role: "citizen",
      adminStatus: "none",
    };

    if (role === "admin") {
      userData.adminStatus = "pending";
      userData.adminRequestedAt = new Date();
    }

    const user = await User.create(userData);
    const token = signToken(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      adminStatus: user.adminStatus,
      token,
      message:
        role === "admin"
          ? "Registration successful! Your admin request is pending approval."
          : "Registration successful!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Block pending admin from accessing admin panel
    if (user.adminStatus === "pending") {
      const token = signToken(user);
      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: "citizen",
          adminStatus: "pending",
        },
        message:
          "Your admin request is pending approval. You are logged in as citizen.",
      });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        adminStatus: user.adminStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/set-password
export const setPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password) {
      return res.status(400).json({ 
        message: "Password already set. Use change password instead." 
      });
    }

    user.password = password; // pre-save hook will hash it
    await user.save();

    res.status(200).json({ 
      message: "Password set successfully! You can now login with email and password." 
    });
  } catch (err) { next(err); }
};

// GET /api/auth/google/callback
export const googleCallback = async (req, res) => {
  try {
    const token = signToken(req.user);

    const authObj = {
      type: "AUTH_SUCCESS",
      token,
      user: {
        id: req.user._id,
        role: req.user.role,
        name: req.user.name,
        adminStatus: req.user.adminStatus,
      },
      hasPassword: Boolean(req.user.password),
    };

    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Authenticating...</title></head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage(${JSON.stringify(authObj)}, "${process.env.FRONTEND_URL}");
            window.close();
          } else {
            window.location.href = "${process.env.FRONTEND_URL}/login";
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth error:", error);

    res.send(`
      <!DOCTYPE html>
      <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'AUTH_ERROR' }, "${process.env.FRONTEND_URL}");
            window.close();
          } else {
            window.location.href = "${process.env.FRONTEND_URL}/login?error=oauth_failed";
          }
        </script>
      </body>
      </html>
    `);
  }
};

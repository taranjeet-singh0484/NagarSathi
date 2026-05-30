import "./config/env.js"; // ← MUST be first import

import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import passport from "./config/passport.js";
import { connectDB } from "./config/db.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import aiRoutes from "./routes/aiRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { configurePassport } from "./config/passport.js";
import adminRequestRoutes from "./routes/adminRequestRoutes.js";
import path from "path";

const app = express();
const _dirname = path.resolve();

connectDB();
configurePassport(); 

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
    "https://nagar-sathi-phi.vercel.app",
  ],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "backend", "uploads")),
);

app.use("/api/complaints", complaintRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin-requests", adminRequestRoutes);

app.use(express.static(path.join(_dirname, "frontend/dist")));
app.get("/*splat", (_, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});

app.use(errorHandler);

app.get("/api/test-network", async (req, res) => {
  try {
    const r = await fetch("https://httpbin.org/get");
    const data = await r.json();
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, error: err.message, cause: err.cause?.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

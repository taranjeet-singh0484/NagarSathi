import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import aiRoutes from "./routes/aiRoutes.js"
import chatRoutes from "./routes/chatRoutes.js";

connectDB();

const app = express();
const _dirname = path.resolve();

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
app.use("/uploads", express.static("uploads"));

app.use("/api/complaints", complaintRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/ai", aiRoutes);

app.use(errorHandler);

app.use(express.static(path.join(_dirname, "frontend/dist")));
app.get("/*splat", (_, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});

app.use("/api/chat", chatRoutes);

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


// src/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import passport from "passport";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import "./config/passportGoogle.js";

import authRoutes from "./routes/authRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";

// =========================
// DB Connection
// =========================
connectDB();

// =========================
// App Initialization
// =========================
const app = express();

// =========================
// Utilities for static files
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================
// Global Middlewares
// =========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(morgan("dev"));

// =========================
// Routes
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/auth/google", googleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api", lessonRoutes);
app.use("/api", quizRoutes);
// =========================
// Health Check
// =========================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// =========================
// Global Error Handler
// =========================
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// =========================
// Server Start
// =========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

import express from "express";
import cors from "cors";
import path from "path";
import config from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

// ── Route imports ────────────────────────────────────────────────────────────
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import marksRoutes from "./routes/marks.routes.js";
import assignmentsRoutes from "./routes/assignments.routes.js";
import syllabusRoutes from "./routes/syllabus.routes.js";
import noticesRoutes from "./routes/notices.routes.js";
import resourcesRoutes from "./routes/resources.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import usersRoutes from "./routes/users.routes.js";
import healthRoutes from "./routes/health.routes.js";

// ── Create Express app ──────────────────────────────────────────────────────
const app = express();

// Trust X-Forwarded-For only behind a reverse proxy (nginx, Render, Fly, etc.)
if (config.trustProxy) {
  app.set("trust proxy", 1);
}

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / non-browser requests (no Origin header).
      if (!origin) return callback(null, true);
      if (config.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
    },
    credentials: true,
  })
);

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());

// ── Static file serving (uploads) ────────────────────────────────────────────
app.use("/uploads", express.static(config.uploadsDir));

// ── API routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/syllabus", syllabusRoutes);
app.use("/api/notices", noticesRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/admin/users", usersRoutes);
app.use("/api/health", healthRoutes);

// Backwards-compatible /api/upload endpoint — proxies to resources upload
app.use("/api/upload", (req, res, next) => {
  // Rewrite to the resources upload handler
  req.url = "/upload";
  resourcesRoutes(req, res, next);
});

// ── Static frontend (production build) ───────────────────────────────────────
const distDir = path.join(config.rootDir, "dist");
app.use(express.static(distDir));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;

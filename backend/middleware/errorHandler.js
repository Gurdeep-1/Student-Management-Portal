import multer from "multer";
import { MAX_UPLOAD_BYTES } from "./upload.js";

/**
 * Global Express error handler.
 *
 * Express 5 forwards rejected promises from async handlers here automatically.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Multer-specific errors (file too large, wrong type, etc.)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message: `File exceeds the ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB limit.`,
      });
    }
    return res.status(400).json({ message: err.message });
  }

  // Custom errors thrown by Multer's fileFilter
  if (err && err.message && err.message.includes("not allowed")) {
    return res.status(400).json({ message: err.message });
  }

  console.error("UNHANDLED_ERROR:", err);

  if (res.headersSent) return;

  res.status(500).json({ message: "Internal server error" });
}

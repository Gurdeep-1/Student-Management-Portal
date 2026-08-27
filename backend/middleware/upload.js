import multer from "multer";
import path from "path";
import config from "../config/env.js";

// ---------------------------------------------------------------------------
// Multer configuration for file uploads
// ---------------------------------------------------------------------------

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // Strip down to a safe extension only — never use the raw originalname
    // in a path (path-traversal / injection risk).
    const ext = path
      .extname(file.originalname)
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "");
    cb(null, `${unique}${ext}`);
  },
});

// Only allow document / spreadsheet / image MIME types.
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_UPLOAD_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error(`File type "${file.mimetype}" is not allowed.`));
    }
    cb(null, true);
  },
});

export default upload;

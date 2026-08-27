import path from "path";
import * as ResourcesModel from "../models/resources.model.js";

// ── GET /api/resources ──────────────────────────────────────────────────────
export async function getAll(_req, res) {
  const rows = await ResourcesModel.findAll();
  res.json(rows);
}

// ── GET /api/resources/:id ──────────────────────────────────────────────────
export async function getById(req, res) {
  const row = await ResourcesModel.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Resource not found." });
  res.json(row);
}

// ── POST /api/resources ─────────────────────────────────────────────────────
export async function create(req, res) {
  const { title, type, updated, file_url } = req.body || {};
  if (!title || !type) {
    return res.status(400).json({ message: "Resource title and type are required." });
  }
  const row = await ResourcesModel.create({
    title,
    type,
    updated,
    fileUrl: file_url,
  });
  res.status(201).json(row);
}

// ── PUT /api/resources/:id ──────────────────────────────────────────────────
export async function update(req, res) {
  const { title, type, updated, file_url } = req.body || {};
  const row = await ResourcesModel.update(req.params.id, {
    title,
    type,
    updated,
    fileUrl: file_url,
  });
  if (!row) return res.status(404).json({ message: "Resource not found." });
  res.json(row);
}

// ── DELETE /api/resources/:id ───────────────────────────────────────────────
export async function remove(req, res) {
  const deleted = await ResourcesModel.remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Resource not found." });
  res.json({ message: "Resource deleted." });
}

// ── POST /api/upload ────────────────────────────────────────────────────────
export async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "A file is required for upload." });
  }

  const title = req.body.title || req.file.originalname;
  const type =
    req.body.type ||
    path.extname(req.file.originalname).replace(".", "").toUpperCase() ||
    "FILE";
  const fileUrl = `/uploads/${req.file.filename}`;

  const resource = await ResourcesModel.create({
    title,
    type,
    updated: "Just now",
    fileUrl,
  });

  res.status(201).json({ resource });
}

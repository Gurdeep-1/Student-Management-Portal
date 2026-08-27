import * as NoticesModel from "../models/notices.model.js";

export async function getAll(_req, res) {
  const rows = await NoticesModel.findAll();
  res.json(rows);
}

export async function getById(req, res) {
  const row = await NoticesModel.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Notice not found." });
  res.json(row);
}

export async function create(req, res) {
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ message: "Notice message is required." });
  }
  const row = await NoticesModel.create({ message });
  res.status(201).json(row);
}

export async function update(req, res) {
  const { message } = req.body || {};
  const row = await NoticesModel.update(req.params.id, { message });
  if (!row) return res.status(404).json({ message: "Notice not found." });
  res.json(row);
}

export async function remove(req, res) {
  const deleted = await NoticesModel.remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Notice not found." });
  res.json({ message: "Notice deleted." });
}

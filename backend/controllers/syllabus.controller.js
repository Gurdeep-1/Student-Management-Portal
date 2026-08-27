import * as SyllabusModel from "../models/syllabus.model.js";

export async function getAll(_req, res) {
  const rows = await SyllabusModel.findAll();
  res.json(rows);
}

export async function getById(req, res) {
  const row = await SyllabusModel.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Syllabus item not found." });
  res.json(row);
}

export async function create(req, res) {
  const { item } = req.body || {};
  if (!item) {
    return res.status(400).json({ message: "Syllabus item text is required." });
  }
  const row = await SyllabusModel.create({ item });
  res.status(201).json(row);
}

export async function update(req, res) {
  const row = await SyllabusModel.update(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: "Syllabus item not found." });
  res.json(row);
}

export async function remove(req, res) {
  const deleted = await SyllabusModel.remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Syllabus item not found." });
  res.json({ message: "Syllabus item deleted." });
}

import * as AssignmentsModel from "../models/assignments.model.js";

export async function getAll(_req, res) {
  const rows = await AssignmentsModel.findAll();
  res.json(rows);
}

export async function getById(req, res) {
  const row = await AssignmentsModel.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Assignment not found." });
  res.json(row);
}

export async function create(req, res) {
  const { student_name, student_id, studentName, studentId, title, course, due, status } = req.body || {};
  if (!title || !course) {
    return res.status(400).json({ message: "Title and course are required." });
  }
  const name = student_name || studentName || req.user?.name || "Aarav Mehta";
  const sid = student_id || studentId || req.user?.student_id || "STU-2048";
  const item = await AssignmentsModel.create({
    student_name: name,
    student_id: sid,
    title,
    course,
    due,
    status,
  });
  res.status(201).json({ item });
}

export async function update(req, res) {
  const row = await AssignmentsModel.update(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: "Assignment not found." });
  res.json(row);
}

export async function remove(req, res) {
  const deleted = await AssignmentsModel.remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Assignment not found." });
  res.json({ message: "Assignment deleted." });
}

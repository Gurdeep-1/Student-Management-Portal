import * as MarksModel from "../models/marks.model.js";

export async function getAll(_req, res) {
  const rows = await MarksModel.findAll();
  res.json(rows);
}

export async function getById(req, res) {
  const row = await MarksModel.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Marks record not found." });
  res.json(row);
}

export async function create(req, res) {
  const { student_name, student_id, studentName, studentId, subject, mst1, mst2, total, grade } = req.body || {};
  if (!subject || mst1 == null || mst2 == null) {
    return res.status(400).json({ message: "Subject, MST1 score, and MST2 score are required." });
  }
  const name = student_name || studentName || req.user?.name || "Aarav Mehta";
  const sid = student_id || studentId || req.user?.student_id || "STU-2048";
  const m1 = Number(mst1);
  const m2 = Number(mst2);
  const tot = total != null ? Number(total) : 40;
  const score = m1 + m2;
  const calcGrade =
    grade ||
    (score >= 36 ? "A+" : score >= 32 ? "A" : score >= 28 ? "A-" : score >= 24 ? "B+" : score >= 20 ? "B" : "C");

  const row = await MarksModel.create({
    student_name: name,
    student_id: sid,
    subject,
    mst1: m1,
    mst2: m2,
    total: tot,
    grade: calcGrade,
  });
  res.status(201).json(row);
}

export async function update(req, res) {
  const row = await MarksModel.update(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: "Marks record not found." });
  res.json(row);
}

export async function remove(req, res) {
  const deleted = await MarksModel.remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Marks record not found." });
  res.json({ message: "Marks record deleted." });
}

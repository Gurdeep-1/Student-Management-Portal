import * as AttendanceModel from "../models/attendance.model.js";

export async function getAll(_req, res) {
  const rows = await AttendanceModel.findAll();
  res.json(rows);
}

export async function getById(req, res) {
  const row = await AttendanceModel.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Attendance record not found." });
  res.json(row);
}

export async function create(req, res) {
  const { student_name, student_id, studentName, studentId, subject, attended, total, percent } = req.body || {};
  if (!subject || attended == null || total == null) {
    return res.status(400).json({ message: "Subject, attended classes, and total classes are required." });
  }
  const name = student_name || studentName || req.user?.name || "Aarav Mehta";
  const sid = student_id || studentId || req.user?.student_id || "STU-2048";
  const attNum = Number(attended);
  const totNum = Number(total) || 1;
  const pctNum = percent != null ? Number(percent) : Math.round((attNum / totNum) * 100);
  const row = await AttendanceModel.create({
    student_name: name,
    student_id: sid,
    subject,
    attended: attNum,
    total: totNum,
    percent: pctNum,
  });
  res.status(201).json(row);
}

export async function update(req, res) {
  const row = await AttendanceModel.update(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: "Attendance record not found." });
  res.json(row);
}

export async function remove(req, res) {
  const deleted = await AttendanceModel.remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Attendance record not found." });
  res.json({ message: "Attendance record deleted." });
}

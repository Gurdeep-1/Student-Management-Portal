import * as NotificationsModel from "../models/notifications.model.js";

export async function getAll(_req, res) {
  const rows = await NotificationsModel.findAll();
  res.json(rows);
}

export async function getById(req, res) {
  const row = await NotificationsModel.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Notification not found." });
  res.json(row);
}

export async function create(req, res) {
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ message: "A message is required." });
  }
  await NotificationsModel.create({ message });
  res.status(201).json({ message: "Notification saved." });
}

export async function remove(req, res) {
  const deleted = await NotificationsModel.remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Notification not found." });
  res.json({ message: "Notification deleted." });
}

import * as UserModel from "../models/user.model.js";
import { getPasswordPolicyError, hashPassword } from "../utils/password.js";

// ── GET /api/admin/users ────────────────────────────────────────────────────
export async function getAll(_req, res) {
  const users = await UserModel.listAll();
  res.json(users);
}

// ── GET /api/admin/users/:id ────────────────────────────────────────────────
export async function getById(req, res) {
  const user = await UserModel.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });

  // Don't leak the password hash
  const { password_hash: _password_hash, ...safeUser } = user;
  res.json(safeUser);
}

// ── POST /api/admin/users ───────────────────────────────────────────────────
export async function create(req, res) {
  const { name, email, password, role, studentId, program, advisor } =
    req.body || {};

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }

  if (!["admin", "faculty", "student"].includes(role)) {
    return res
      .status(400)
      .json({ message: "Role must be one of: admin, faculty, student." });
  }

  const passwordError = getPasswordPolicyError(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (await UserModel.findByEmail(normalizedEmail)) {
    return res
      .status(400)
      .json({ message: "An account with that email already exists." });
  }

  const user = await UserModel.create({
    name,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role,
    studentId: studentId || "",
    program: program || "",
    advisor: advisor || "",
  });

  return res.status(201).json({ message: "User created successfully", user });
}

// ── PUT /api/admin/users/:id ────────────────────────────────────────────────
export async function update(req, res) {
  const { name, email, password, role, studentId, program, advisor } =
    req.body || {};

  const fields = {};
  if (name !== undefined) fields.name = name;
  if (email !== undefined) fields.email = String(email).trim().toLowerCase();
  if (role !== undefined) {
    if (!["admin", "faculty", "student"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be one of: admin, faculty, student." });
    }
    fields.role = role;
  }
  if (password !== undefined) {
    const passwordError = getPasswordPolicyError(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }
    fields.passwordHash = hashPassword(password);
  }
  if (studentId !== undefined) fields.studentId = studentId;
  if (program !== undefined) fields.program = program;
  if (advisor !== undefined) fields.advisor = advisor;

  // Check for email uniqueness if email is being changed
  if (fields.email) {
    const existing = await UserModel.findByEmail(fields.email);
    if (existing && existing.id !== Number(req.params.id)) {
      return res
        .status(400)
        .json({ message: "An account with that email already exists." });
    }
  }

  const user = await UserModel.update(req.params.id, fields);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ message: "User updated successfully", user });
}

// ── DELETE /api/admin/users/:id ─────────────────────────────────────────────
export async function remove(req, res) {
  // Prevent admins from deleting themselves
  if (Number(req.params.id) === req.user.id) {
    return res
      .status(400)
      .json({ message: "You cannot delete your own account." });
  }

  const deleted = await UserModel.remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: "User not found." });
  res.json({ message: "User deleted successfully." });
}

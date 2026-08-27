import * as UserModel from "../models/user.model.js";
import { makeToken, revokedTokenIds } from "../utils/token.js";
import {
  getPasswordPolicyError,
  hashPassword,
  comparePassword,
} from "../utils/password.js";
import { clearLoginAttempts } from "../middleware/rateLimiter.js";

// ── POST /api/auth/register ─────────────────────────────────────────────────
export async function register(req, res) {
  const { name, email, password, role, studentId, program, advisor } = req.body || {};

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
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

  const validRole = ["student", "faculty", "admin"].includes(role) ? role : "student";

  const user = await UserModel.create({
    name,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: validRole,
    studentId: studentId || (validRole === "student" ? `STU-${Date.now().toString().slice(-4)}` : ""),
    program: program || (validRole === "student" ? "B.Tech Computer Science" : "Faculty Department"),
    advisor: advisor || (validRole === "student" ? "Dr. Neha Rao" : ""),
  });

  const token = makeToken(user);
  return res
    .status(201)
    .json({ message: "User registered successfully", token, user });
}

// ── POST /api/auth/login ────────────────────────────────────────────────────
export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await UserModel.findByEmail(normalizedEmail);

  if (!user || !comparePassword(password, user.password_hash)) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  // Successful login clears the rate-limit counter for this key.
  clearLoginAttempts(req.ip, normalizedEmail);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    student_id: user.student_id,
    program: user.program,
    advisor: user.advisor,
  };

  return res
    .status(200)
    .json({ message: "Login successful", token: makeToken(safeUser), user: safeUser });
}

// ── POST /api/auth/logout ───────────────────────────────────────────────────
export function logout(req, res) {
  if (req.user.jti) {
    revokedTokenIds.add(req.user.jti);
  }
  res.json({ message: "Logged out successfully." });
}

// ── GET /api/auth/me ────────────────────────────────────────────────────────
export function me(req, res) {
  res.json({ user: req.user });
}

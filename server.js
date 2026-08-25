import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import Database from "better-sqlite3";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "portal.env") });

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

// Only trust X-Forwarded-For if you're actually behind a reverse proxy/load
// balancer (nginx, Render, Fly, etc.) — otherwise a client can spoof their
// own IP and bypass the login rate limiter below. Set TRUST_PROXY=1 in that case.
if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

if (!process.env.JWT_SECRET) {
  if (isProduction) {
    // A predictable secret in production would let anyone forge login tokens.
    console.error("FATAL: JWT_SECRET is not set. Refusing to start in production without it.");
    process.exit(1);
  }
  console.warn("JWT_SECRET missing; using an insecure fallback dev secret. Set JWT_SECRET before deploying.");
}
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// ---------------------------------------------------------------------------
// CORS — only allow known frontend origins, not the entire internet.
// Configure via ALLOWED_ORIGINS="https://a.example.com,https://b.example.com"
// Falls back to the Vite dev server origin when nothing is configured.
// ---------------------------------------------------------------------------
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin/non-browser requests (no Origin header, e.g. curl, health checks).
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
    },
    credentials: true,
  })
);
app.use(express.json());

// ---------------------------------------------------------------------------
// Database setup — Postgres when DATABASE_URL is set, SQLite otherwise.
//
// Both engines are exposed through the same small async adapter
// (`db.all`, `db.get`, `db.run`, `db.exec`) so every route below is written
// once and works unmodified against either database. Write queries with
// `?` placeholders as usual (SQLite-style) — the Postgres adapter rewrites
// them to `$1, $2, ...` automatically.
// ---------------------------------------------------------------------------
const dataDir = path.join(__dirname, "data");
const uploadsDir = path.join(dataDir, "uploads");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const usePostgres = !!process.env.DATABASE_URL;
let db;

if (usePostgres) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
  });

  pool.on("error", (err) => {
    // Errors on idle clients (e.g. a dropped connection) would otherwise
    // crash the whole process — log and let the pool recover instead.
    console.error("PG_POOL_ERROR:", err);
  });

  function toPgPlaceholders(sql) {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
  }

  db = {
    kind: "postgres",
    async all(sql, params = []) {
      const result = await pool.query(toPgPlaceholders(sql), params);
      return result.rows;
    },
    async get(sql, params = []) {
      const result = await pool.query(toPgPlaceholders(sql), params);
      return result.rows[0] || null;
    },
    async run(sql, params = []) {
      // Every table here has an `id` primary key, so we can transparently
      // support the SQLite-style `result.lastInsertRowid` pattern used
      // throughout the routes by appending RETURNING id to INSERTs.
      let finalSql = sql;
      if (/^\s*insert/i.test(sql) && !/returning/i.test(sql)) {
        finalSql = `${sql} RETURNING id`;
      }
      const result = await pool.query(toPgPlaceholders(finalSql), params);
      return {
        lastInsertRowid: result.rows[0]?.id,
        changes: result.rowCount,
      };
    },
    async exec(sql) {
      await pool.query(sql);
    },
    async close() {
      await pool.end();
    },
  };
} else {
  const sqliteDb = new Database(path.join(dataDir, "student_portal.db"));
  sqliteDb.pragma("journal_mode = WAL");

  db = {
    kind: "sqlite",
    async all(sql, params = []) {
      return sqliteDb.prepare(sql).all(...params);
    },
    async get(sql, params = []) {
      return sqliteDb.prepare(sql).get(...params) || null;
    },
    async run(sql, params = []) {
      const result = sqliteDb.prepare(sql).run(...params);
      return { lastInsertRowid: result.lastInsertRowid, changes: result.changes };
    },
    async exec(sql) {
      sqliteDb.exec(sql);
    },
    async close() {
      sqliteDb.close();
    },
  };
}

async function initSchema() {
  if (usePostgres) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        student_id VARCHAR(120),
        program VARCHAR(120),
        advisor VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        attended INTEGER NOT NULL,
        total INTEGER NOT NULL,
        percent INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS marks (
        id SERIAL PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        mst1 INTEGER NOT NULL,
        mst2 INTEGER NOT NULL,
        total INTEGER NOT NULL,
        grade VARCHAR(10) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        course VARCHAR(255) NOT NULL,
        due VARCHAR(120),
        status VARCHAR(50) DEFAULT 'Pending'
      );

      CREATE TABLE IF NOT EXISTS syllabus (
        id SERIAL PRIMARY KEY,
        item TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notices (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        updated VARCHAR(120),
        file_url TEXT
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    return;
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      student_id TEXT,
      program TEXT,
      advisor TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      attended INTEGER NOT NULL,
      total INTEGER NOT NULL,
      percent INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS marks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      mst1 INTEGER NOT NULL,
      mst2 INTEGER NOT NULL,
      total INTEGER NOT NULL,
      grade TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      course TEXT NOT NULL,
      due TEXT,
      status TEXT DEFAULT 'Pending'
    );

    CREATE TABLE IF NOT EXISTS syllabus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      updated TEXT,
      file_url TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// ---------------------------------------------------------------------------
// Seed data (only runs once, when tables are empty)
// ---------------------------------------------------------------------------
async function seedIfEmpty() {
  const userCount = (await db.get("SELECT COUNT(*) AS c FROM users")).c;
  if (Number(userCount) === 0) {
    const demoUsers = [
      { name: "Aarav Mehta", email: "student@college.edu", password: "student123", role: "student", studentId: "STU-2048", program: "B.Tech Computer Science", advisor: "Dr. Neha Rao" },
      { name: "Dr. Neha Rao", email: "faculty@college.edu", password: "faculty123", role: "faculty", studentId: "", program: "", advisor: "" },
      { name: "Administrator", email: "admin@college.edu", password: "admin123", role: "admin", studentId: "", program: "", advisor: "" },
    ];
    for (const u of demoUsers) {
      await db.run(
        `INSERT INTO users (name, email, password_hash, role, student_id, program, advisor) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [u.name, u.email, bcrypt.hashSync(u.password, 10), u.role, u.studentId, u.program, u.advisor]
      );
    }
    console.log("Seeded demo accounts: student@college.edu / faculty@college.edu / admin@college.edu (see README for passwords)");
  }

  if (Number((await db.get("SELECT COUNT(*) AS c FROM attendance")).c) === 0) {
    await db.run("INSERT INTO attendance (subject, attended, total, percent) VALUES (?, ?, ?, ?)", ["Operating Systems", 28, 32, 88]);
    await db.run("INSERT INTO attendance (subject, attended, total, percent) VALUES (?, ?, ?, ?)", ["Database Systems", 24, 28, 86]);
    await db.run("INSERT INTO attendance (subject, attended, total, percent) VALUES (?, ?, ?, ?)", ["Data Structures", 30, 32, 94]);
    await db.run("INSERT INTO attendance (subject, attended, total, percent) VALUES (?, ?, ?, ?)", ["Computer Networks", 22, 27, 81]);
  }

  if (Number((await db.get("SELECT COUNT(*) AS c FROM marks")).c) === 0) {
    await db.run("INSERT INTO marks (subject, mst1, mst2, total, grade) VALUES (?, ?, ?, ?, ?)", ["DBMS", 18, 21, 40, "A"]);
    await db.run("INSERT INTO marks (subject, mst1, mst2, total, grade) VALUES (?, ?, ?, ?, ?)", ["OS", 17, 18, 40, "A"]);
    await db.run("INSERT INTO marks (subject, mst1, mst2, total, grade) VALUES (?, ?, ?, ?, ?)", ["Networking", 15, 20, 40, "A-"]);
    await db.run("INSERT INTO marks (subject, mst1, mst2, total, grade) VALUES (?, ?, ?, ?, ?)", ["DSA", 19, 22, 40, "A+"]);
  }

  if (Number((await db.get("SELECT COUNT(*) AS c FROM assignments")).c) === 0) {
    await db.run("INSERT INTO assignments (title, course, due, status) VALUES (?, ?, ?, ?)", ["Mini Project Proposal", "DBMS", "12 Aug", "Submitted"]);
    await db.run("INSERT INTO assignments (title, course, due, status) VALUES (?, ?, ?, ?)", ["Network Topology Notes", "Networking", "15 Aug", "Pending"]);
    await db.run("INSERT INTO assignments (title, course, due, status) VALUES (?, ?, ?, ?)", ["System Design Case Study", "OS", "18 Aug", "In review"]);
  }

  if (Number((await db.get("SELECT COUNT(*) AS c FROM syllabus")).c) === 0) {
    const items = ["Operating Systems Fundamentals", "Database Normalization & SQL", "Networking Protocols", "Design and Analysis of Algorithms", "Cloud Concepts", "Security Basics"];
    for (const item of items) {
      await db.run("INSERT INTO syllabus (item) VALUES (?)", [item]);
    }
  }

  if (Number((await db.get("SELECT COUNT(*) AS c FROM notices")).c) === 0) {
    const notices = [
      "Attendance review meeting for 6th semester students on 20 Aug.",
      "MST-2 marks are now visible in the faculty portal.",
      "New assignment submission deadline for OS updated to 18 Aug.",
      "Research workshop registration is open for final-year students.",
    ];
    for (const m of notices) {
      await db.run("INSERT INTO notices (message) VALUES (?)", [m]);
    }
  }

  if (Number((await db.get("SELECT COUNT(*) AS c FROM resources")).c) === 0) {
    await db.run("INSERT INTO resources (title, type, updated, file_url) VALUES (?, ?, ?, ?)", ["Attendance Sheet", "Excel", "Today", "/uploads/sample-attendance.xlsx"]);
    await db.run("INSERT INTO resources (title, type, updated, file_url) VALUES (?, ?, ?, ?)", ["MST Marks", "Spreadsheet", "1 hour ago", "/uploads/sample-marks.xlsx"]);
    await db.run("INSERT INTO resources (title, type, updated, file_url) VALUES (?, ?, ?, ?)", ["Syllabus Map", "PDF", "Yesterday", "/uploads/sample-syllabus.pdf"]);
    await db.run("INSERT INTO resources (title, type, updated, file_url) VALUES (?, ?, ?, ?)", ["Assignment Brief", "Word", "Today", "/uploads/sample-assignment.docx"]);
  }
}

// ---------------------------------------------------------------------------
// File uploads
// ---------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // Strip the original name down to a safe extension only — using the
    // raw originalname in a path is a classic path-traversal / injection risk.
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, "");
    cb(null, `${unique}${ext}`);
  },
});

// Only allow document/spreadsheet/image types academic resources actually need.
// Reject anything else (executables, scripts, archives, etc.) up front.
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

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
app.use("/uploads", express.static(uploadsDir));

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

// Revoked-token blocklist, keyed by JWT id (jti). Tokens are short-lived-ish
// (7d) so this in-memory set is acceptable for a single-instance deployment;
// swap for a shared store (Redis, DB table) if you run multiple instances,
// since this list does not survive a restart or replicate across processes.
const revokedTokenIds = new Set();

function makeToken(user) {
  const jti = `${user.id}.${Date.now()}.${Math.random().toString(36).slice(2)}`;
  return jwt.sign({ id: user.id, email: user.email, role: user.role, jti }, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.jti && revokedTokenIds.has(decoded.jti)) {
      return res.status(401).json({ message: "Token has been revoked" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ---------------------------------------------------------------------------
// Minimal in-memory rate limiter (per IP+email) for the login route.
// Good enough for a single-instance deployment; for multi-instance
// deployments, back this with Redis or use a proper library like
// `express-rate-limit` + a shared store instead.
// ---------------------------------------------------------------------------
const loginAttempts = new Map(); // key -> { count, firstAttemptAt }
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_ATTEMPTS = 8;

function loginRateLimiter(req, res, next) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const key = `${req.ip}:${email}`;
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now - entry.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
    return next();
  }

  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((entry.firstAttemptAt + LOGIN_WINDOW_MS - now) / 1000);
    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({ message: "Too many login attempts. Please try again later." });
  }

  entry.count += 1;
  return next();
}

// Periodically clear stale rate-limit entries so the Map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of loginAttempts.entries()) {
    if (now - entry.firstAttemptAt > LOGIN_WINDOW_MS) loginAttempts.delete(key);
  }
}, LOGIN_WINDOW_MS).unref();

// ---------------------------------------------------------------------------
// Password policy
// ---------------------------------------------------------------------------
const PASSWORD_MIN_LENGTH = 8;

function getPasswordPolicyError(password) {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  }
  if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must include at least one number.";
  return null;
}

async function findUserByEmail(email) {
  return db.get("SELECT * FROM users WHERE email = ?", [email]);
}

async function addUser({ name, email, password, role, studentId, program, advisor }) {
  const passwordHash = bcrypt.hashSync(password, 10);
  const result = await db.run(
    `INSERT INTO users (name, email, password_hash, role, student_id, program, advisor) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, passwordHash, role, studentId, program, advisor]
  );
  return db.get(
    "SELECT id, name, email, role, student_id, program, advisor FROM users WHERE id = ?",
    [result.lastInsertRowid]
  );
}

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, studentId, program, advisor } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const passwordError = getPasswordPolicyError(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (await findUserByEmail(normalizedEmail)) {
      return res.status(400).json({ message: "An account with that email already exists." });
    }

    // Public self-registration can only ever create student accounts.
    // Faculty/admin accounts must be provisioned by an existing admin via
    // POST /api/admin/users, so an attacker can't just POST role: "admin".
    const user = await addUser({
      name,
      email: normalizedEmail,
      password,
      role: "student",
      studentId: studentId || `STU-${Date.now()}`,
      program: program || "General Studies",
      advisor: advisor || "Department Advisor",
    });

    const token = makeToken(user);
    return res.status(201).json({ message: "User registered successfully", token, user });
  } catch (err) {
    console.error("REGISTER_ERROR:", err);
    return res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

app.post("/api/auth/login", loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Successful login clears this key's rate-limit counter.
    loginAttempts.delete(`${req.ip}:${normalizedEmail}`);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      student_id: user.student_id,
      program: user.program,
      advisor: user.advisor,
    };
    return res.status(200).json({ message: "Login successful", token: makeToken(safeUser), user: safeUser });
  } catch (err) {
    console.error("LOGIN_ERROR:", err);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
});

app.post("/api/auth/logout", verifyToken, (req, res) => {
  if (req.user.jti) revokedTokenIds.add(req.user.jti);
  res.json({ message: "Logged out successfully." });
});

app.get("/api/auth/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// ---------------------------------------------------------------------------
// Admin-only: provision faculty/admin accounts.
// This is the only way to create a non-student account.
// ---------------------------------------------------------------------------
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}

app.post("/api/admin/users", verifyToken, requireAdmin, async (req, res) => {
  const { name, email, password, role, studentId, program, advisor } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }
  if (!["admin", "faculty", "student"].includes(role)) {
    return res.status(400).json({ message: "Role must be one of: admin, faculty, student." });
  }

  const passwordError = getPasswordPolicyError(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (await findUserByEmail(normalizedEmail)) {
    return res.status(400).json({ message: "An account with that email already exists." });
  }

  const user = await addUser({
    name,
    email: normalizedEmail,
    password,
    role,
    studentId: studentId || "",
    program: program || "",
    advisor: advisor || "",
  });

  return res.status(201).json({ message: "User created successfully", user });
});

// ---------------------------------------------------------------------------
// Dashboard data
// ---------------------------------------------------------------------------
const studentQuickActions = [
  { label: "View timetable", icon: "📅" },
  { label: "Submit assignment", icon: "📝" },
  { label: "Download notes", icon: "📚" },
  { label: "Ask mentor", icon: "💬" },
];
const upcomingClasses = [
  { time: "09:00", course: "Operating Systems", room: "A-204" },
  { time: "11:00", course: "Database Systems", room: "B-105" },
  { time: "14:00", course: "Computer Networks", room: "Lab 3" },
];
const performanceTrend = [72, 76, 80, 84, 88, 92];
const pyqData = [
  { title: "DBMS Mid-Term 2025", type: "PDF", size: "1.2 MB", file_url: "/uploads/dbms.pdf" },
  { title: "OS End-Term 2024", type: "PDF", size: "980 KB", file_url: "/uploads/os.pdf" },
  { title: "Networking Unit Test", type: "DOCX", size: "750 KB", file_url: "/uploads/networking.docx" },
  { title: "DSA Practice Set", type: "PDF", size: "2.1 MB", file_url: "/uploads/dsa.pdf" },
];
const facultyStats = [
  { label: "Courses", value: "06" },
  { label: "Students", value: "420" },
  { label: "Uploads", value: "128" },
  { label: "Pending reviews", value: "14" },
];
const facultyAlerts = [
  "12 students are below 75% attendance threshold.",
  "3 assignment submissions remain unreviewed.",
  "Mid-term analysis reports are ready to publish.",
];
const facultyUploadCards = ["Upload attendance", "Publish marks", "Add syllabus", "Share assignment"];
const studentRecords = [
  { name: "Aarav Mehta", status: "Excellent", score: "92%" },
  { name: "Ishita Verma", status: "On track", score: "87%" },
  { name: "Rohit Sharma", status: "Needs focus", score: "71%" },
  { name: "Mehul Gupta", status: "Excellent", score: "94%" },
];
const syllabusUpdates = [
  "Completed Unit 5: Data Security and Cloud Basics.",
  "MST-II answer sheets uploaded for all sections.",
  "Assignment brief for project-based evaluation published.",
];
const adminStats = [
  { label: "Departments", value: "12" },
  { label: "Accounts", value: "1,250" },
  { label: "System health", value: "99.8%" },
  { label: "Pending approvals", value: "27" },
];
const institutions = ["Computer Science Dept.", "Mechanical Engg.", "Electrical Engg.", "Business Studies"];

async function getStudentDashboard(user) {
  const [attendanceData, marksData, assignments, syllabusRows, noticeRows] = await Promise.all([
    db.all("SELECT * FROM attendance ORDER BY id"),
    db.all("SELECT * FROM marks ORDER BY id"),
    db.all("SELECT * FROM assignments ORDER BY id"),
    db.all("SELECT item FROM syllabus ORDER BY id"),
    db.all("SELECT message FROM notices ORDER BY id DESC"),
  ]);

  return {
    profile: {
      name: user.name,
      studentId: user.student_id,
      program: user.program,
      semester: "Semester 6",
      advisor: user.advisor,
      attendance: 88,
      cgpa: 8.9,
      pendingAssignments: 3,
      completion: 76,
    },
    attendanceData,
    marksData,
    assignments,
    syllabusItems: syllabusRows.map((r) => r.item),
    pyqData,
    notices: noticeRows.map((r) => r.message),
    quickActions: studentQuickActions,
    upcomingClasses,
    performanceTrend,
  };
}

async function getFacultyDashboard() {
  const [facultyResources, noticeRows] = await Promise.all([
    db.all("SELECT * FROM resources ORDER BY id"),
    db.all("SELECT message FROM notices ORDER BY id DESC"),
  ]);

  return {
    facultyStats,
    facultyResources,
    facultyAlerts,
    facultyUploadCards,
    studentRecords,
    syllabusUpdates,
    notices: noticeRows.map((r) => r.message),
  };
}

async function getAdminDashboard() {
  const [users, noticeRows] = await Promise.all([
    db.all("SELECT id, name, email, role FROM users ORDER BY id"),
    db.all("SELECT message FROM notices ORDER BY id DESC"),
  ]);

  return {
    stats: adminStats,
    users,
    institutions,
    notices: noticeRows.map((r) => r.message),
  };
}

app.get("/api/dashboard", verifyToken, async (req, res) => {
  const user = await db.get("SELECT * FROM users WHERE id = ?", [req.user.id]);
  if (!user) return res.status(404).json({ message: "User not found." });

  if (user.role === "admin") {
    return res.json({ user: req.user, dashboard: { admin: await getAdminDashboard() } });
  }
  if (user.role === "faculty") {
    return res.json({ user: req.user, dashboard: { faculty: await getFacultyDashboard() } });
  }
  return res.json({ user: req.user, dashboard: { student: await getStudentDashboard(user) } });
});

// ---------------------------------------------------------------------------
// Resources / assignments / uploads / notifications
// ---------------------------------------------------------------------------
app.get("/api/resources", verifyToken, async (_req, res) => {
  res.json(await db.all("SELECT * FROM resources ORDER BY id"));
});

app.post("/api/resources", verifyToken, async (req, res) => {
  const { title, type, updated, file_url } = req.body || {};
  if (!title || !type) {
    return res.status(400).json({ message: "Resource title and type are required." });
  }
  const result = await db.run(
    "INSERT INTO resources (title, type, updated, file_url) VALUES (?, ?, ?, ?)",
    [title, type, updated || "Just now", file_url || "/uploads/new-resource.pdf"]
  );
  const item = await db.get("SELECT * FROM resources WHERE id = ?", [result.lastInsertRowid]);
  res.status(201).json(item);
});

app.post("/api/upload", verifyToken, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: `File exceeds the ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB limit.` });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message || "Upload rejected." });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "A file is required for upload." });
  }
  const title = req.body.title || req.file.originalname;
  const type = req.body.type || path.extname(req.file.originalname).replace(".", "").toUpperCase() || "FILE";
  const fileUrl = `/uploads/${req.file.filename}`;
  const result = await db.run(
    "INSERT INTO resources (title, type, updated, file_url) VALUES (?, ?, ?, ?)",
    [title, type, "Just now", fileUrl]
  );
  const item = await db.get("SELECT * FROM resources WHERE id = ?", [result.lastInsertRowid]);
  res.status(201).json({ resource: item });
});

app.post("/api/assignments", verifyToken, async (req, res) => {
  const { title, course, due, status } = req.body || {};
  if (!title || !course) {
    return res.status(400).json({ message: "Title and course are required." });
  }
  const result = await db.run(
    "INSERT INTO assignments (title, course, due, status) VALUES (?, ?, ?, ?)",
    [title, course, due || "Next Monday", status || "Pending"]
  );
  const item = await db.get("SELECT * FROM assignments WHERE id = ?", [result.lastInsertRowid]);
  res.status(201).json({ item });
});

app.post("/api/notifications", verifyToken, async (req, res) => {
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ message: "A message is required." });
  }
  await db.run("INSERT INTO notifications (message) VALUES (?)", [message]);
  res.status(201).json({ message: "Notification saved." });
});

app.get("/api/health", async (_req, res) => {
  try {
    await db.get(usePostgres ? "SELECT 1 AS ok" : "SELECT 1 AS ok");
    res.json({ status: "ok", database: usePostgres ? "postgres" : "sqlite" });
  } catch (err) {
    res.status(503).json({ status: "error", database: usePostgres ? "postgres" : "sqlite", error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Static frontend (production build)
// ---------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, "dist")));
app.get(/^(?!\/api).*/, (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Express 5 forwards rejected promises from async handlers here automatically.
app.use((err, _req, res, _next) => {
  console.error("UNHANDLED_ERROR:", err);
  if (res.headersSent) return;
  res.status(500).json({ message: "Internal server error" });
});

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------
async function start() {
  try {
    await initSchema();
    await seedIfEmpty();
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT} (database: ${usePostgres ? "postgres" : "sqlite"})`);
    });
  } catch (err) {
    console.error("STARTUP_ERROR:", err);
    process.exit(1);
  }
}

start();

async function shutdown() {
  try {
    await db.close();
  } catch (err) {
    console.error("SHUTDOWN_ERROR:", err);
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

import { queryOne, execute } from "./pool.js";
import { hashPassword } from "../utils/password.js";

/**
 * Seed demo data into every table that is currently empty.
 * Safe to call on every startup — it's fully idempotent.
 */
export async function seedIfEmpty() {
  // ── Users ────────────────────────────────────────────────────────────────
  const userCount = await queryOne("SELECT COUNT(*) AS c FROM users");
  if (Number(userCount.c) === 0) {
    const demoUsers = [
      {
        name: "Aarav Mehta",
        email: "student@college.edu",
        password: "student123",
        role: "student",
        studentId: "STU-2048",
        program: "B.Tech Computer Science",
        advisor: "Dr. Neha Rao",
      },
      {
        name: "Dr. Neha Rao",
        email: "faculty@college.edu",
        password: "faculty123",
        role: "faculty",
        studentId: "",
        program: "",
        advisor: "",
      },
      {
        name: "Administrator",
        email: "admin@college.edu",
        password: "admin123",
        role: "admin",
        studentId: "",
        program: "",
        advisor: "",
      },
    ];

    for (const u of demoUsers) {
      await execute(
        `INSERT INTO users (name, email, password_hash, role, student_id, program, advisor)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [u.name, u.email, hashPassword(u.password), u.role, u.studentId, u.program, u.advisor]
      );
    }
    console.log(
      "Seeded demo accounts: student@college.edu / faculty@college.edu / admin@college.edu (see README for passwords)"
    );
  }

  // ── Attendance ───────────────────────────────────────────────────────────
  const attCount = await queryOne("SELECT COUNT(*) AS c FROM attendance");
  if (Number(attCount.c) === 0) {
    const rows = [
      ["Operating Systems", 28, 32, 88],
      ["Database Systems", 24, 28, 86],
      ["Data Structures", 30, 32, 94],
      ["Computer Networks", 22, 27, 81],
    ];
    for (const [subject, attended, total, percent] of rows) {
      await execute(
        "INSERT INTO attendance (subject, attended, total, percent) VALUES ($1, $2, $3, $4)",
        [subject, attended, total, percent]
      );
    }
  }

  // ── Marks ────────────────────────────────────────────────────────────────
  const marksCount = await queryOne("SELECT COUNT(*) AS c FROM marks");
  if (Number(marksCount.c) === 0) {
    const rows = [
      ["DBMS", 18, 21, 40, "A"],
      ["OS", 17, 18, 40, "A"],
      ["Networking", 15, 20, 40, "A-"],
      ["DSA", 19, 22, 40, "A+"],
    ];
    for (const [subject, mst1, mst2, total, grade] of rows) {
      await execute(
        "INSERT INTO marks (subject, mst1, mst2, total, grade) VALUES ($1, $2, $3, $4, $5)",
        [subject, mst1, mst2, total, grade]
      );
    }
  }

  // ── Assignments ──────────────────────────────────────────────────────────
  const assignCount = await queryOne("SELECT COUNT(*) AS c FROM assignments");
  if (Number(assignCount.c) === 0) {
    const rows = [
      ["Mini Project Proposal", "DBMS", "12 Aug", "Submitted"],
      ["Network Topology Notes", "Networking", "15 Aug", "Pending"],
      ["System Design Case Study", "OS", "18 Aug", "In review"],
    ];
    for (const [title, course, due, status] of rows) {
      await execute(
        "INSERT INTO assignments (title, course, due, status) VALUES ($1, $2, $3, $4)",
        [title, course, due, status]
      );
    }
  }

  // ── Syllabus ─────────────────────────────────────────────────────────────
  const sylCount = await queryOne("SELECT COUNT(*) AS c FROM syllabus");
  if (Number(sylCount.c) === 0) {
    const items = [
      "Operating Systems Fundamentals",
      "Database Normalization & SQL",
      "Networking Protocols",
      "Design and Analysis of Algorithms",
      "Cloud Concepts",
      "Security Basics",
    ];
    for (const item of items) {
      await execute("INSERT INTO syllabus (item) VALUES ($1)", [item]);
    }
  }

  // ── Notices ──────────────────────────────────────────────────────────────
  const noticeCount = await queryOne("SELECT COUNT(*) AS c FROM notices");
  if (Number(noticeCount.c) === 0) {
    const notices = [
      "Attendance review meeting for 6th semester students on 20 Aug.",
      "MST-2 marks are now visible in the faculty portal.",
      "New assignment submission deadline for OS updated to 18 Aug.",
      "Research workshop registration is open for final-year students.",
    ];
    for (const m of notices) {
      await execute("INSERT INTO notices (message) VALUES ($1)", [m]);
    }
  }

  // ── Resources ────────────────────────────────────────────────────────────
  const resCount = await queryOne("SELECT COUNT(*) AS c FROM resources");
  if (Number(resCount.c) === 0) {
    const rows = [
      ["Attendance Sheet", "Excel", "Today", "/uploads/sample-attendance.xlsx"],
      ["MST Marks", "Spreadsheet", "1 hour ago", "/uploads/sample-marks.xlsx"],
      ["Syllabus Map", "PDF", "Yesterday", "/uploads/sample-syllabus.pdf"],
      ["Assignment Brief", "Word", "Today", "/uploads/sample-assignment.docx"],
    ];
    for (const [title, type, updated, fileUrl] of rows) {
      await execute(
        "INSERT INTO resources (title, type, updated, file_url) VALUES ($1, $2, $3, $4)",
        [title, type, updated, fileUrl]
      );
    }
  }
}

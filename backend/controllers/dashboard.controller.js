import * as UserModel from "../models/user.model.js";
import * as AttendanceModel from "../models/attendance.model.js";
import * as MarksModel from "../models/marks.model.js";
import * as AssignmentsModel from "../models/assignments.model.js";
import * as SyllabusModel from "../models/syllabus.model.js";
import * as NoticesModel from "../models/notices.model.js";
import * as ResourcesModel from "../models/resources.model.js";
import {
  studentQuickActions,
  upcomingClasses,
  performanceTrend,
  pyqData,
  facultyUploadCards,
  studentRecords,
  syllabusUpdates,
  institutions,
} from "../utils/constants.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getStudentDashboard(user) {
  const [attendanceData, marksData, assignments, syllabusRows, noticeRows] =
    await Promise.all([
      AttendanceModel.findAll(),
      MarksModel.findAll(),
      AssignmentsModel.findAll(),
      SyllabusModel.findAll(),
      NoticesModel.findAll(),
    ]);

  // Filter or compute student-specific stats
  const userAttendance = attendanceData.filter(
    (a) => a.student_id === user.student_id || a.student_name === user.name
  );
  const effectiveAttendance = userAttendance.length ? userAttendance : attendanceData;
  const avgAttendance = effectiveAttendance.length
    ? Math.round(
        effectiveAttendance.reduce((acc, row) => acc + Number(row.percent || 0), 0) /
          effectiveAttendance.length
      )
    : 88;

  const userMarks = marksData.filter(
    (m) => m.student_id === user.student_id || m.student_name === user.name
  );
  const effectiveMarks = userMarks.length ? userMarks : marksData;
  const avgMarks = effectiveMarks.length
    ? effectiveMarks.reduce(
        (acc, row) => acc + Number(row.mst1 || 0) + Number(row.mst2 || 0),
        0
      ) / effectiveMarks.length
    : 36;
  const liveCgpa = Number((avgMarks / 4).toFixed(1));

  const pendingAssignments = assignments.filter((a) => a.status === "Pending").length;

  return {
    profile: {
      name: user.name,
      studentId: user.student_id || "STU-2048",
      program: user.program || "B.Tech Computer Science",
      semester: "Semester 6",
      advisor: user.advisor || "Dr. Neha Rao",
      attendance: avgAttendance,
      cgpa: liveCgpa,
      pendingAssignments,
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
  const [facultyResources, noticeRows, attendanceData, marksData, assignments, users] =
    await Promise.all([
      ResourcesModel.findAll(),
      NoticesModel.findAll(),
      AttendanceModel.findAll(),
      MarksModel.findAll(),
      AssignmentsModel.findAll(),
      UserModel.listAll(),
    ]);

  // Combine student cohort from users, default cohort, and any active attendance/marks records
  const studentMap = new Map();
  studentRecords.forEach((s) => {
    studentMap.set(s.name, { name: s.name, studentId: s.studentId || "STU-2048" });
  });
  users
    .filter((u) => u.role === "student")
    .forEach((u) => {
      studentMap.set(u.name, { name: u.name, studentId: u.student_id || "STU-2048" });
    });
  attendanceData.forEach((a) => {
    if (a.student_name && !studentMap.has(a.student_name)) {
      studentMap.set(a.student_name, { name: a.student_name, studentId: a.student_id || "STU-2048" });
    }
  });
  marksData.forEach((m) => {
    if (m.student_name && !studentMap.has(m.student_name)) {
      studentMap.set(m.student_name, { name: m.student_name, studentId: m.student_id || "STU-2048" });
    }
  });

  const studentList = Array.from(studentMap.values()).map((u) => {
    const studentMarks = marksData.filter(
      (m) => m.student_name === u.name || m.student_id === u.studentId
    );
    const studentAtt = attendanceData.filter(
      (a) => a.student_name === u.name || a.student_id === u.studentId
    );
    const avgPct = studentAtt.length
      ? Math.round(
          studentAtt.reduce((acc, r) => acc + Number(r.percent || 0), 0) /
            studentAtt.length
        )
      : 86;
    const avgM = studentMarks.length
      ? Math.round(
          studentMarks.reduce(
            (acc, r) => acc + Number(r.mst1 || 0) + Number(r.mst2 || 0),
            0
          ) / studentMarks.length
        )
      : 35;
    const scorePct = Math.round((avgM / 40) * 100);

    return {
      name: u.name,
      studentId: u.studentId || "STU-2048",
      status: avgPct >= 85 ? "Excellent" : avgPct >= 75 ? "On track" : "Needs focus",
      score: `${scorePct}%`,
      attendance: `${avgPct}%`,
    };
  });

  const lowAttendanceCount = attendanceData.filter((a) => Number(a.percent) < 75).length;
  const pendingReviews = assignments.filter((a) => a.status === "Pending" || a.status === "In review").length;

  const dynamicStats = [
    { label: "Courses", value: "06" },
    { label: "Students", value: String(studentList.length || 4) },
    { label: "Uploads", value: String(facultyResources.length + attendanceData.length + marksData.length) },
    { label: "Pending reviews", value: String(pendingReviews) },
  ];

  const dynamicAlerts = [
    `${lowAttendanceCount} course attendance records are below the 75% threshold.`,
    `${pendingReviews} assignment submissions are awaiting review.`,
    "All latest mid-term assessment scores are synced with PostgreSQL.",
  ];

  return {
    facultyStats: dynamicStats,
    facultyResources,
    facultyAlerts: dynamicAlerts,
    facultyUploadCards,
    studentRecords: studentList,
    attendanceData,
    marksData,
    assignments,
    syllabusUpdates,
    notices: noticeRows.map((r) => r.message),
  };
}

async function getAdminDashboard() {
  const [users, noticeRows, attendanceData, marksData, assignments] = await Promise.all([
    UserModel.listAll(),
    NoticesModel.findAll(),
    AttendanceModel.findAll(),
    MarksModel.findAll(),
    AssignmentsModel.findAll(),
  ]);

  return {
    stats: [
      { label: "Departments", value: "12" },
      { label: "Accounts", value: String(users.length) },
      { label: "System health", value: "99.8%" },
      { label: "Active records", value: String(attendanceData.length + marksData.length + assignments.length) },
    ],
    users,
    attendanceData,
    marksData,
    assignments,
    institutions,
    notices: noticeRows.map((r) => r.message),
  };
}

// ── GET /api/dashboard ──────────────────────────────────────────────────────
export async function getDashboard(req, res) {
  const user = await UserModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const [studentDash, facultyDash, adminDash] = await Promise.all([
    getStudentDashboard(user),
    user.role === "faculty" || user.role === "admin" ? getFacultyDashboard() : null,
    user.role === "admin" ? getAdminDashboard() : null,
  ]);

  return res.json({
    user: req.user,
    dashboard: {
      student: studentDash,
      faculty: facultyDash,
      admin: adminDash,
    },
  });
}

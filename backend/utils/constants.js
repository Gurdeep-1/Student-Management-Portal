// ---------------------------------------------------------------------------
// Static data used by the dashboard endpoints.  Kept separate so controllers
// stay focused on request handling.
// ---------------------------------------------------------------------------

export const studentQuickActions = [
  { label: "View timetable", icon: "📅" },
  { label: "Submit assignment", icon: "📝" },
  { label: "Download notes", icon: "📚" },
  { label: "Ask mentor", icon: "💬" },
];

export const upcomingClasses = [
  { time: "09:00", course: "Operating Systems", room: "A-204" },
  { time: "11:00", course: "Database Systems", room: "B-105" },
  { time: "14:00", course: "Computer Networks", room: "Lab 3" },
];

export const performanceTrend = [72, 76, 80, 84, 88, 92];

export const pyqData = [
  { title: "DBMS Mid-Term 2025", type: "PDF", size: "1.2 MB", file_url: "/uploads/dbms.pdf" },
  { title: "OS End-Term 2024", type: "PDF", size: "980 KB", file_url: "/uploads/os.pdf" },
  { title: "Networking Unit Test", type: "DOCX", size: "750 KB", file_url: "/uploads/networking.docx" },
  { title: "DSA Practice Set", type: "PDF", size: "2.1 MB", file_url: "/uploads/dsa.pdf" },
];

export const facultyStats = [
  { label: "Courses", value: "06" },
  { label: "Students", value: "420" },
  { label: "Uploads", value: "128" },
  { label: "Pending reviews", value: "14" },
];

export const facultyAlerts = [
  "12 students are below 75% attendance threshold.",
  "3 assignment submissions remain unreviewed.",
  "Mid-term analysis reports are ready to publish.",
];

export const facultyUploadCards = [
  "Upload attendance",
  "Publish marks",
  "Add syllabus",
  "Share assignment",
];

export const studentRecords = [
  { name: "Aarav Mehta", status: "Excellent", score: "92%" },
  { name: "Ishita Verma", status: "On track", score: "87%" },
  { name: "Rohit Sharma", status: "Needs focus", score: "71%" },
  { name: "Mehul Gupta", status: "Excellent", score: "94%" },
];

export const syllabusUpdates = [
  "Completed Unit 5: Data Security and Cloud Basics.",
  "MST-II answer sheets uploaded for all sections.",
  "Assignment brief for project-based evaluation published.",
];

export const adminStats = [
  { label: "Departments", value: "12" },
  { label: "Accounts", value: "1,250" },
  { label: "System health", value: "99.8%" },
  { label: "Pending approvals", value: "27" },
];

export const institutions = [
  "Computer Science Dept.",
  "Mechanical Engg.",
  "Electrical Engg.",
  "Business Studies",
];

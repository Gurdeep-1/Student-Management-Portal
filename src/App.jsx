import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const availableStudents = [
  { name: 'Aarav Mehta', id: 'STU-2048' },
  { name: 'Ishita Verma', id: 'STU-2049' },
  { name: 'Rohit Sharma', id: 'STU-2050' },
  { name: 'Mehul Gupta', id: 'STU-2051' },
]

const defaultStudentData = {
  profile: {
    name: 'Aarav Mehta',
    studentId: 'STU-2048',
    program: 'B.Tech Computer Science',
    semester: 'Semester 6',
    advisor: 'Dr. Neha Rao',
    attendance: 88,
    cgpa: 8.9,
    pendingAssignments: 3,
    completion: 76,
  },
  attendanceData: [
    { id: 1, student_name: 'Aarav Mehta', student_id: 'STU-2048', subject: 'Operating Systems', attended: 28, total: 32, percent: 88 },
    { id: 2, student_name: 'Aarav Mehta', student_id: 'STU-2048', subject: 'Database Systems', attended: 24, total: 28, percent: 86 },
    { id: 3, student_name: 'Aarav Mehta', student_id: 'STU-2048', subject: 'Data Structures', attended: 30, total: 32, percent: 94 },
    { id: 4, student_name: 'Aarav Mehta', student_id: 'STU-2048', subject: 'Computer Networks', attended: 22, total: 27, percent: 81 },
  ],
  marksData: [
    { id: 1, student_name: 'Aarav Mehta', student_id: 'STU-2048', subject: 'DBMS', mst1: 18, mst2: 21, total: 40, grade: 'A' },
    { id: 2, student_name: 'Aarav Mehta', student_id: 'STU-2048', subject: 'OS', mst1: 17, mst2: 18, total: 40, grade: 'A' },
    { id: 3, student_name: 'Aarav Mehta', student_id: 'STU-2048', subject: 'Networking', mst1: 15, mst2: 20, total: 40, grade: 'A-' },
    { id: 4, student_name: 'Aarav Mehta', student_id: 'STU-2048', subject: 'DSA', mst1: 19, mst2: 22, total: 40, grade: 'A+' },
  ],
  assignments: [
    { id: 1, student_name: 'Aarav Mehta', student_id: 'STU-2048', title: 'Mini Project Proposal', course: 'DBMS', due: '12 Aug', status: 'Submitted' },
    { id: 2, student_name: 'Aarav Mehta', student_id: 'STU-2048', title: 'Network Topology Notes', course: 'Networking', due: '15 Aug', status: 'Pending' },
    { id: 3, student_name: 'Aarav Mehta', student_id: 'STU-2048', title: 'System Design Case Study', course: 'OS', due: '18 Aug', status: 'In review' },
  ],
  syllabusItems: [
    'Operating Systems Fundamentals',
    'Database Normalization & SQL',
    'Networking Protocols',
    'Design and Analysis of Algorithms',
    'Cloud Concepts',
    'Security Basics',
  ],
  pyqData: [
    { title: 'DBMS Mid-Term 2025', type: 'PDF', size: '1.2 MB', file_url: '/uploads/dbms.pdf' },
    { title: 'OS End-Term 2024', type: 'PDF', size: '980 KB', file_url: '/uploads/os.pdf' },
    { title: 'Networking Unit Test', type: 'DOCX', size: '750 KB', file_url: '/uploads/networking.docx' },
    { title: 'DSA Practice Set', type: 'PDF', size: '2.1 MB', file_url: '/uploads/dsa.pdf' },
  ],
  notices: [
    'Attendance review meeting for 6th semester students on 20 Aug.',
    'MST-2 marks are now visible in the faculty portal.',
    'New assignment submission deadline for OS updated to 18 Aug.',
    'Research workshop registration is open for final-year students.',
  ],
  quickActions: [
    { label: 'View timetable', icon: '📅' },
    { label: 'Submit assignment', icon: '📝' },
    { label: 'Download notes', icon: '📚' },
    { label: 'Ask mentor', icon: '💬' },
  ],
  upcomingClasses: [
    { time: '09:00', course: 'Operating Systems', room: 'A-204' },
    { time: '11:00', course: 'Database Systems', room: 'B-105' },
    { time: '14:00', course: 'Computer Networks', room: 'Lab 3' },
  ],
  performanceTrend: [72, 76, 80, 84, 88, 92],
}

const defaultFacultyData = {
  facultyStats: [
    { label: 'Courses', value: '06' },
    { label: 'Students', value: '420' },
    { label: 'Uploads', value: '128' },
    { label: 'Pending reviews', value: '14' },
  ],
  facultyResources: [
    { title: 'Attendance Sheet', type: 'Excel', updated: 'Today', file_url: '/uploads/sample-attendance.xlsx' },
    { title: 'MST Marks', type: 'Spreadsheet', updated: '1 hour ago', file_url: '/uploads/sample-marks.xlsx' },
    { title: 'Syllabus Map', type: 'PDF', updated: 'Yesterday', file_url: '/uploads/sample-syllabus.pdf' },
    { title: 'Assignment Brief', type: 'Word', updated: 'Today', file_url: '/uploads/sample-assignment.docx' },
  ],
  studentRecords: [
    { name: 'Aarav Mehta', studentId: 'STU-2048', status: 'Excellent', score: '92%' },
    { name: 'Ishita Verma', studentId: 'STU-2049', status: 'On track', score: '87%' },
    { name: 'Rohit Sharma', studentId: 'STU-2050', status: 'Needs focus', score: '71%' },
    { name: 'Mehul Gupta', studentId: 'STU-2051', status: 'Excellent', score: '94%' },
  ],
  facultyAlerts: [
    '12 students are below 75% attendance threshold.',
    '3 assignment submissions remain unreviewed.',
    'Mid-term analysis reports are ready to publish.',
  ],
  facultyUploadCards: ['Upload attendance', 'Publish marks', 'Add syllabus', 'Share assignment'],
  syllabusUpdates: [
    'Completed Unit 5: Data Security and Cloud Basics.',
    'MST-II answer sheets uploaded for all sections.',
    'Assignment brief for project-based evaluation published.',
  ],
  notices: [
    'Attendance review meeting for 6th semester students on 20 Aug.',
    'MST-2 marks are now visible in the faculty portal.',
    'New assignment submission deadline for OS updated to 18 Aug.',
    'Research workshop registration is open for final-year students.',
  ],
}

const defaultAdminData = {
  stats: [
    { label: 'Departments', value: '12' },
    { label: 'Accounts', value: '1,250' },
    { label: 'System health', value: '99.8%' },
    { label: 'Pending approvals', value: '27' },
  ],
  users: [
    { id: 1, name: 'Aarav Mehta', email: 'student@college.edu', role: 'student', student_id: 'STU-2048' },
    { id: 2, name: 'Dr. Neha Rao', email: 'faculty@college.edu', role: 'faculty', student_id: 'FAC-101' },
    { id: 3, name: 'Administrator', email: 'admin@college.edu', role: 'admin', student_id: 'ADM-001' },
  ],
  institutions: [
    'Computer Science Dept.',
    'Mechanical Engg.',
    'Electrical Engg.',
    'Business Studies',
  ],
  notices: [
    'System health stable across all academic modules.',
    'New academic policy review scheduled for Friday.',
    'Faculty training workshops are open for registration.',
  ],
}

const defaultDashboard = {
  student: defaultStudentData,
  faculty: defaultFacultyData,
  admin: defaultAdminData,
}

const authFormDefaults = {
  name: '',
  email: '',
  password: '',
  role: 'student',
  studentId: '',
  program: '',
  advisor: '',
}

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState(authFormDefaults)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('student-portal-token') || '')
  const [dashboard, setDashboard] = useState(defaultDashboard)
  const [toast, setToast] = useState('')
  const [activeView, setActiveView] = useState('student')
  const [activeTab, setActiveTab] = useState('all')
  const [showTimetable, setShowTimetable] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)

  // Modals state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    student_name: 'Aarav Mehta',
    student_id: 'STU-2048',
    title: '',
    course: 'Operating Systems',
    due: 'Next Friday',
    status: 'Pending',
  })

  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [newAttendance, setNewAttendance] = useState({
    student_name: 'Aarav Mehta',
    student_id: 'STU-2048',
    subject: 'Operating Systems',
    attended: 28,
    total: 32,
  })

  const [showMarksModal, setShowMarksModal] = useState(false)
  const [newMarks, setNewMarks] = useState({
    student_name: 'Aarav Mehta',
    student_id: 'STU-2048',
    subject: 'DBMS',
    mst1: 18,
    mst2: 20,
    total: 40,
    grade: 'A+',
  })

  const [showSyllabusModal, setShowSyllabusModal] = useState(false)
  const [newSyllabusItem, setNewSyllabusItem] = useState('')

  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [newNotice, setNewNotice] = useState('')

  const [showUserModal, setShowUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
    program: '',
    advisor: '',
  })

  const fetchWithAuth = useCallback((url, options = {}) => {
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    return fetch(url, { ...options, headers })
  }, [token])

  useEffect(() => {
    if (!token) return

    const loadProfile = async () => {
      try {
        const response = await fetchWithAuth('/api/auth/me')
        if (!response.ok) {
          throw new Error('Token invalid')
        }
        const payload = await response.json()
        setUser(payload.user)
        setActiveView(payload.user?.role || 'student')
      } catch {
        localStorage.removeItem('student-portal-token')
        setToken('')
        setUser(null)
      }
    }

    loadProfile()
  }, [token, fetchWithAuth])

  useEffect(() => {
    if (!token || !user) return

    const loadDashboard = async () => {
      try {
        const response = await fetchWithAuth('/api/dashboard')
        if (!response.ok) throw new Error('Failed to load dashboard')
        const payload = await response.json()
        if (payload.dashboard) {
          setDashboard((prev) => ({
            ...prev,
            student: payload.dashboard.student || prev.student,
            faculty: payload.dashboard.faculty || prev.faculty,
            admin: payload.dashboard.admin || prev.admin,
            user: payload.user || prev.user,
          }))
        }
      } catch {
        // fallback
      }
    }

    loadDashboard()
  }, [token, user, fetchWithAuth])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const studentData = useMemo(() => dashboard.student || defaultStudentData, [dashboard.student])
  const facultyData = useMemo(() => dashboard.faculty || defaultFacultyData, [dashboard.faculty])
  const adminData = useMemo(() => dashboard.admin || defaultAdminData, [dashboard.admin])

  const handleAuthFieldChange = (event) => {
    const { name, value } = event.target
    setAuthForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.message || 'Authentication failed.')
      }

      localStorage.setItem('student-portal-token', payload.token)
      setToken(payload.token)
      setUser(payload.user)
      setActiveView(payload.user?.role || 'student')
      setActiveTab('all')
      setToast(authMode === 'login' ? 'Welcome back.' : 'Account created successfully.')
      setAuthForm(authFormDefaults)
    } catch (error) {
      setToast(error.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('student-portal-token')
    setToken('')
    setUser(null)
    setDashboard(defaultDashboard)
    setActiveTab('all')
    setToast('Logged out successfully.')
  }

  const refreshDashboard = async () => {
    try {
      const response = await fetchWithAuth('/api/dashboard')
      if (!response.ok) return
      const payload = await response.json()
      if (payload.dashboard) {
        setDashboard((prev) => ({
          ...prev,
          student: payload.dashboard.student || prev.student,
          faculty: payload.dashboard.faculty || prev.faculty,
          admin: payload.dashboard.admin || prev.admin,
          user: payload.user || prev.user,
        }))
      }
    } catch {
      // fallback
    }
  }

  const handleQuickAction = async (label) => {
    if (label === 'View timetable') {
      setShowTimetable((prev) => !prev)
      setActiveTab('timetable')
      setToast('Viewing class timetable.')
      return
    }

    if (label === 'Submit assignment') {
      setShowAssignmentModal(true)
      return
    }

    if (label === 'Download notes') {
      setActiveTab('resources')
      const response = await fetchWithAuth('/api/resources')
      if (response.ok) {
        const resources = await response.json()
        const resource = Array.isArray(resources) ? resources[0] : null
        if (resource?.file_url) {
          window.open(resource.file_url, '_blank', 'noopener,noreferrer')
        }
      }
      setToast('Displaying course notes and resources.')
      return
    }

    if (label === 'Ask mentor') {
      const response = await fetchWithAuth('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Student (${user?.name || 'Aarav'}) requested mentor guidance.` }),
      })

      if (response.ok) {
        setToast('Mentor consultation request submitted!')
      } else {
        setToast('Mentor request sent to advisor.')
      }
    }
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''))
    formData.append('type', file.type || 'Document')
    formData.append('file', file)

    try {
      const response = await fetchWithAuth('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      await refreshDashboard()
      setToast(`File "${file.name}" uploaded successfully!`)
    } catch (error) {
      setToast(error.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  // ── Modal Handlers ─────────────────────────────────────────────────────────

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    if (!newAssignment.title || !newAssignment.course) {
      setToast('Please enter title and course')
      return
    }

    try {
      const res = await fetchWithAuth('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to submit assignment')
      setShowAssignmentModal(false)
      await refreshDashboard()
      setNewAssignment({
        student_name: 'Aarav Mehta',
        student_id: 'STU-2048',
        title: '',
        course: 'Operating Systems',
        due: 'Next Friday',
        status: 'Pending',
      })
      setToast('Assignment submitted and recorded successfully!')
    } catch (err) {
      setToast(err.message)
    }
  }

  const handleCreateAttendance = async (e) => {
    e.preventDefault()
    if (!newAttendance.subject) {
      setToast('Please specify subject')
      return
    }

    try {
      const res = await fetchWithAuth('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAttendance),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to record attendance')
      setShowAttendanceModal(false)
      await refreshDashboard()
      setToast(`Attendance recorded for ${newAttendance.student_name} (${newAttendance.subject})!`)
    } catch (err) {
      setToast(err.message)
    }
  }

  const handleCreateMarks = async (e) => {
    e.preventDefault()
    if (!newMarks.subject) {
      setToast('Please specify subject')
      return
    }

    try {
      const res = await fetchWithAuth('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMarks),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to publish marks')
      setShowMarksModal(false)
      await refreshDashboard()
      setToast(`Marks published for ${newMarks.student_name} (${newMarks.subject})!`)
    } catch (err) {
      setToast(err.message)
    }
  }

  const handleCreateSyllabus = async (e) => {
    e.preventDefault()
    if (!newSyllabusItem.trim()) {
      setToast('Please enter syllabus topic text')
      return
    }

    try {
      const res = await fetchWithAuth('/api/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: newSyllabusItem }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to add syllabus item')
      setShowSyllabusModal(false)
      await refreshDashboard()
      setNewSyllabusItem('')
      setToast('Syllabus unit added to course curriculum!')
    } catch (err) {
      setToast(err.message)
    }
  }

  const handleCreateNotice = async (e) => {
    e.preventDefault()
    if (!newNotice.trim()) return

    try {
      const res = await fetchWithAuth('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newNotice }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to post notice')
      setShowNoticeModal(false)
      await refreshDashboard()
      setNewNotice('')
      setToast('Notice broadcasted to all students & faculty!')
    } catch (err) {
      setToast(err.message)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const res = await fetchWithAuth('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create user')
      setShowUserModal(false)
      await refreshDashboard()
      setNewUser({ name: '', email: '', password: '', role: 'student', studentId: '', program: '', advisor: '' })
      setToast('User account created successfully!')
    } catch (err) {
      setToast(err.message)
    }
  }

  const profile = user || { name: 'Student', role: 'student' }
  const currentRole = user?.role || 'student'

  // If not authenticated, show the login / registration card
  if (!token || !user) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-header">
            <div className="brand-mark">SP</div>
            <div>
              <p className="brand-title">Student Portal</p>
              <span className="brand-subtitle">Academic management suite</span>
            </div>
          </div>

          <div className="auth-toggle">
            <button type="button" className={authMode === 'login' ? 'auth-tab active' : 'auth-tab'} onClick={() => setAuthMode('login')}>Login</button>
            <button type="button" className={authMode === 'register' ? 'auth-tab active' : 'auth-tab'} onClick={() => setAuthMode('register')}>Register</button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {authMode === 'register' && (
              <>
                <label>Full name
                  <input name="name" value={authForm.name} onChange={handleAuthFieldChange} placeholder="Enter full name" required />
                </label>
                <label>Role
                  <select name="role" value={authForm.role} onChange={handleAuthFieldChange}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label>Student ID / Faculty ID
                  <input name="studentId" value={authForm.studentId} onChange={handleAuthFieldChange} placeholder="e.g. STU-2048 or FAC-101" />
                </label>
                <label>Program / Department
                  <input name="program" value={authForm.program} onChange={handleAuthFieldChange} placeholder="e.g. B.Tech Computer Science" />
                </label>
                <label>Advisor
                  <input name="advisor" value={authForm.advisor} onChange={handleAuthFieldChange} placeholder="e.g. Dr. Neha Rao" />
                </label>
              </>
            )}

            <label>Email
              <input name="email" type="email" value={authForm.email} onChange={handleAuthFieldChange} placeholder="name@college.edu" required />
            </label>

            <label>Password
              <input name="password" type="password" value={authForm.password} onChange={handleAuthFieldChange} placeholder="Enter password (min 6 chars)" required />
            </label>

            <button type="submit" className="primary-btn auth-submit">{authMode === 'login' ? 'Sign in' : 'Create account'}</button>
          </form>

          <div className="demo-box">
            <strong>Quick Demo Login (Click to Fill)</strong>
            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                setAuthMode('login')
                setAuthForm({ ...authFormDefaults, email: 'student@college.edu', password: 'student123' })
                setToast('Filled: Student credentials')
              }}
            >
              👨‍🎓 Student (<code>student@college.edu</code> / <code>student123</code>)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                setAuthMode('login')
                setAuthForm({ ...authFormDefaults, email: 'faculty@college.edu', password: 'faculty123' })
                setToast('Filled: Faculty credentials')
              }}
            >
              👩‍🏫 Faculty (<code>faculty@college.edu</code> / <code>faculty123</code>)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                setAuthMode('login')
                setAuthForm({ ...authFormDefaults, email: 'admin@college.edu', password: 'admin123' })
                setToast('Filled: Admin credentials')
              }}
            >
              🛡️ Admin (<code>admin@college.edu</code> / <code>admin123</code>)
            </button>
          </div>
        </div>
      </div>
    )
  }

  const notices = activeView === 'student'
    ? (studentData.notices || defaultStudentData.notices)
    : activeView === 'faculty'
      ? (facultyData.notices || defaultFacultyData.notices)
      : (adminData.notices || defaultAdminData.notices)

  // Sidebar navigation menu items based on active view
  const studentNavItems = [
    { id: 'all', label: 'Dashboard Overview', icon: '📊' },
    { id: 'attendance', label: 'Attendance', icon: '📈' },
    { id: 'marks', label: 'Marks & Grades', icon: '📝' },
    { id: 'assignments', label: 'Assignments', icon: '📚' },
    { id: 'pyq', label: 'Previous Year Papers', icon: '📑' },
    { id: 'syllabus', label: 'Syllabus & Notes', icon: '📖' },
    { id: 'timetable', label: 'Timetable', icon: '📅' },
  ]

  const facultyNavItems = [
    { id: 'all', label: 'Workspace Overview', icon: '📊' },
    { id: 'records', label: 'Student Records', icon: '👥' },
    { id: 'attendance', label: 'Student Attendance', icon: '📈' },
    { id: 'marks', label: 'Published Marks', icon: '📝' },
    { id: 'resources', label: 'Course Resources', icon: '📁' },
    { id: 'upload', label: 'Upload Center', icon: '📤' },
    { id: 'assignments', label: 'Assignment Tracker', icon: '📚' },
    { id: 'syllabus', label: 'Syllabus Updates', icon: '📘' },
    { id: 'alerts', label: 'Faculty Alerts', icon: '⚠️' },
  ]

  const adminNavItems = [
    { id: 'all', label: 'Admin Overview', icon: '📊' },
    { id: 'users', label: 'User Accounts', icon: '👥' },
    { id: 'attendance', label: 'All Attendance', icon: '📈' },
    { id: 'marks', label: 'All Marks', icon: '📝' },
    { id: 'departments', label: 'Departments', icon: '🏢' },
    { id: 'alerts', label: 'System Notices', icon: '⚠️' },
  ]

  const currentNavItems = activeView === 'student' ? studentNavItems : activeView === 'faculty' ? facultyNavItems : adminNavItems

  // Filter lists based on search query
  const q = searchQuery.toLowerCase().trim()

  const allAttendanceList =
    facultyData.attendanceData || studentData.attendanceData || defaultStudentData.attendanceData

  const allMarksList =
    facultyData.marksData || studentData.marksData || defaultStudentData.marksData

  const allAssignmentsList =
    facultyData.assignments || studentData.assignments || defaultStudentData.assignments

  const filteredAttendance = allAttendanceList.filter(
    (item) =>
      !q ||
      item.subject?.toLowerCase().includes(q) ||
      item.student_name?.toLowerCase().includes(q) ||
      item.student_id?.toLowerCase().includes(q)
  )

  const filteredMarks = allMarksList.filter(
    (item) =>
      !q ||
      item.subject?.toLowerCase().includes(q) ||
      item.grade?.toLowerCase().includes(q) ||
      item.student_name?.toLowerCase().includes(q) ||
      item.student_id?.toLowerCase().includes(q)
  )

  const filteredAssignments = allAssignmentsList.filter(
    (item) =>
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.course?.toLowerCase().includes(q) ||
      item.student_name?.toLowerCase().includes(q) ||
      item.student_id?.toLowerCase().includes(q)
  )

  const filteredPYQ = (studentData.pyqData || defaultStudentData.pyqData).filter(
    (item) => !q || item.title?.toLowerCase().includes(q) || item.type?.toLowerCase().includes(q)
  )

  const filteredSyllabus = (studentData.syllabusItems || defaultStudentData.syllabusItems).filter(
    (item) => !q || item.toLowerCase().includes(q)
  )

  const filteredFacultyResources = (facultyData.facultyResources || defaultFacultyData.facultyResources).filter(
    (item) => !q || item.title?.toLowerCase().includes(q) || item.type?.toLowerCase().includes(q)
  )

  const filteredAdminUsers = (adminData.users || defaultAdminData.users).filter(
    (item) =>
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.role?.toLowerCase().includes(q) ||
      item.student_id?.toLowerCase().includes(q)
  )

  return (
    <div className="portal-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">SP</div>
          <div>
            <p className="brand-title">Student Portal</p>
            <span className="brand-subtitle">Academic management suite</span>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="search-box">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search students, IDs, courses, files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          <div className="view-switch" aria-label="Portal views">
            {/* Admin can switch to any view */}
            {currentRole === 'admin' && (
              <>
                <button
                  type="button"
                  className={activeView === 'student' ? 'view-btn active' : 'view-btn'}
                  onClick={() => { setActiveView('student'); setActiveTab('all'); }}
                >
                  Student view
                </button>
                <button
                  type="button"
                  className={activeView === 'faculty' ? 'view-btn active' : 'view-btn'}
                  onClick={() => { setActiveView('faculty'); setActiveTab('all'); }}
                >
                  Faculty view
                </button>
                <button
                  type="button"
                  className={activeView === 'admin' ? 'view-btn active' : 'view-btn'}
                  onClick={() => { setActiveView('admin'); setActiveTab('all'); }}
                >
                  Admin view
                </button>
              </>
            )}

            {/* Faculty can switch between Faculty & Student */}
            {currentRole === 'faculty' && (
              <>
                <button
                  type="button"
                  className={activeView === 'student' ? 'view-btn active' : 'view-btn'}
                  onClick={() => { setActiveView('student'); setActiveTab('all'); }}
                >
                  Student view
                </button>
                <button
                  type="button"
                  className={activeView === 'faculty' ? 'view-btn active' : 'view-btn'}
                  onClick={() => { setActiveView('faculty'); setActiveTab('all'); }}
                >
                  Faculty view
                </button>
              </>
            )}

            {/* Student has Student view */}
            {currentRole === 'student' && (
              <button type="button" className="view-btn active">
                Student view
              </button>
            )}
          </div>

          <div className="profile-chip">
            <span className="chip-dot"></span>
            {profile.name} <small style={{ opacity: 0.7, marginLeft: '4px' }}>({currentRole})</small>
          </div>

          <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="side-card profile-card">
            <p className="eyebrow">Current profile</p>
            <h3>{profile.name}</h3>
            <div className="meta-block">
              <span className="role-tag">{profile.role?.toUpperCase()}</span>
              <span>{profile.program || (profile.role === 'faculty' ? 'Department of Computer Science' : 'Academic Management Account')}</span>
              <small>ID: {profile.student_id || (profile.role === 'faculty' ? 'FAC-101' : 'ADM-001')}</small>
            </div>
          </div>

          <div className="side-card nav-card">
            <p className="eyebrow">Navigation</p>
            <ul className="sidebar-list">
              {currentNavItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={activeTab === item.id ? 'sidebar-btn active' : 'sidebar-btn'}
                    onClick={() => {
                      setActiveTab(item.id)
                      if (item.id === 'timetable') setShowTimetable(true)
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="side-card notice-card">
            <div className="notice-header">
              <p className="eyebrow">Notices & Alerts</p>
              {(currentRole === 'faculty' || currentRole === 'admin') && (
                <button type="button" className="mini-add-btn" onClick={() => setShowNoticeModal(true)} title="Post notice">
                  + Add
                </button>
              )}
            </div>
            <ul>
              {notices.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="main-panel">
          {/* Active section banner info */}
          {activeTab !== 'all' && (
            <div className="tab-breadcrumb">
              <button type="button" className="back-btn" onClick={() => setActiveTab('all')}>
                ← Back to Full Dashboard
              </button>
              <span className="current-tab-title">
                Showing: <strong>{currentNavItems.find((n) => n.id === activeTab)?.label}</strong>
              </span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              STUDENT VIEW
             ══════════════════════════════════════════════════════════════════════ */}
          {activeView === 'student' && (
            <>
              {activeTab === 'all' && (
                <section className="hero-banner student-banner">
                  <div>
                    <p className="eyebrow light">Welcome back</p>
                    <h1>Track your academic progress, classes, and upcoming tasks.</h1>
                  </div>
                  <div className="banner-actions">
                    <button type="button" className="primary-btn" onClick={() => setShowTimetable((prev) => !prev)}>
                      {showTimetable ? 'Hide timetable' : '📅 View Timetable'}
                    </button>
                    <button type="button" className="primary-btn alt" onClick={() => setShowAssignmentModal(true)}>
                      📝 Submit Assignment
                    </button>
                  </div>
                </section>
              )}

              {/* Timetable Section */}
              {(showTimetable || activeTab === 'timetable') && (
                <section className="panel panel-wide timetable-panel">
                  <div className="panel-header">
                    <h3>Today's timetable & schedule</h3>
                    <span className="status-tag">Live classes</span>
                  </div>
                  <div className="list-stack compact">
                    {(studentData.upcomingClasses || defaultStudentData.upcomingClasses).map((item) => (
                      <div key={item.course} className="time-row">
                        <div>
                          <strong>{item.course}</strong>
                          <p>{item.room}</p>
                        </div>
                        <span className="time-badge">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Stats Overview */}
              {(activeTab === 'all' || activeTab === 'attendance' || activeTab === 'marks') && (
                <section className="stats-grid">
                  <div className="stats-card clickable" onClick={() => setActiveTab('attendance')}>
                    <span>Attendance</span>
                    <strong>{studentData.profile?.attendance ?? 88}%</strong>
                    <small>Across core subjects (Click to view)</small>
                  </div>
                  <div className="stats-card clickable" onClick={() => setActiveTab('marks')}>
                    <span>CGPA</span>
                    <strong>{studentData.profile?.cgpa ?? 8.9}</strong>
                    <small>Current cumulative grade</small>
                  </div>
                  <div className="stats-card clickable" onClick={() => setActiveTab('assignments')}>
                    <span>Assignments</span>
                    <strong>{studentData.profile?.pendingAssignments ?? 3}</strong>
                    <small>Pending review</small>
                  </div>
                  <div className="stats-card accent">
                    <span>Mentor</span>
                    <strong>{studentData.profile?.advisor ?? 'Dr. Neha Rao'}</strong>
                    <small>Academic guidance</small>
                  </div>
                </section>
              )}

              {/* Quick Actions Grid */}
              {activeTab === 'all' && (
                <section className="quick-actions panel">
                  <div className="panel-header">
                    <h3>Quick actions</h3>
                    <span className="status-tag">Shortcuts</span>
                  </div>
                  <div className="action-grid">
                    {(studentData.quickActions || defaultStudentData.quickActions).map((action) => (
                      <button type="button" key={action.label} className="action-button" onClick={() => handleQuickAction(action.label)}>
                        <span>{action.icon}</span>
                        {action.label}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Main Content Grid */}
              <section className="content-grid">
                {/* Attendance Panel */}
                {(activeTab === 'all' || activeTab === 'attendance') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Attendance overview</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {(currentRole === 'faculty' || currentRole === 'admin') && (
                          <button type="button" className="mini-action-btn" onClick={() => setShowAttendanceModal(true)}>
                            + Record Attendance
                          </button>
                        )}
                        <span className="status-tag success">Healthy</span>
                      </div>
                    </div>
                    <div className="attendance-list">
                      {filteredAttendance.map((item, idx) => (
                        <div className="attendance-row" key={item.id || (item.subject + (item.student_id || idx))}>
                          <div className="subject-meta">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong>{item.subject}</strong>
                              <span className="student-badge">👤 {item.student_name || 'Aarav Mehta'} ({item.student_id || 'STU-2048'})</span>
                            </div>
                            <span>{item.attended}/{item.total} classes attended</span>
                          </div>
                          <div className="progress-wrap">
                            <div className="progress-bar"><span style={{ width: `${item.percent}%` }} /></div>
                            <strong>{item.percent}%</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Marks Summary */}
                {(activeTab === 'all' || activeTab === 'marks') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Marks & assessment</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {(currentRole === 'faculty' || currentRole === 'admin') && (
                          <button type="button" className="mini-action-btn" onClick={() => setShowMarksModal(true)}>
                            + Publish Marks
                          </button>
                        )}
                        <span className="status-tag">Mid-Term</span>
                      </div>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Student Name & ID</th>
                          <th>Score</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMarks.map((item, idx) => (
                          <tr key={item.id || (item.subject + (item.student_id || idx))}>
                            <td><strong>{item.subject}</strong></td>
                            <td>
                              <span className="student-tag">{item.student_name || 'Aarav Mehta'}</span>
                              <span className="id-subtext">{item.student_id || 'STU-2048'}</span>
                            </td>
                            <td>{item.mst1 + item.mst2}/{item.total || 40}</td>
                            <td><span className="grade-badge">{item.grade}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Assignments */}
                {(activeTab === 'all' || activeTab === 'assignments') && (
                  <div className="panel">
                    <div className="panel-header">
                      <h3>Assignments</h3>
                      <button type="button" className="mini-action-btn" onClick={() => setShowAssignmentModal(true)}>
                        + Submit
                      </button>
                    </div>
                    <div className="list-stack">
                      {filteredAssignments.map((assignment) => (
                        <div key={assignment.id || assignment.title} className="list-item">
                          <div>
                            <strong>{assignment.title}</strong>
                            <p>{assignment.course} • <small style={{ color: '#2563eb' }}>{assignment.student_name || 'Aarav Mehta'} ({assignment.student_id || 'STU-2048'})</small></p>
                          </div>
                          <div className="assignment-meta">
                            <span>{assignment.due}</span>
                            <em className={assignment.status === 'Submitted' ? 'done' : assignment.status === 'Pending' ? 'pending' : 'review'}>
                              {assignment.status}
                            </em>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previous Year Papers */}
                {(activeTab === 'all' || activeTab === 'pyq' || activeTab === 'resources') && (
                  <div className="panel">
                    <div className="panel-header">
                      <h3>Previous year papers (PYQs)</h3>
                      <span className="status-tag">Library</span>
                    </div>
                    <div className="resource-list">
                      {filteredPYQ.map((paper) => (
                        <div key={paper.title} className="resource-item clickable" onClick={() => setToast(`Opening ${paper.title}...`)}>
                          <div>
                            <strong>{paper.title}</strong>
                            <p>{paper.type} • {paper.size}</p>
                          </div>
                          <button type="button" className="icon-link-btn" title="Download">⬇</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Academic Progress */}
                {(activeTab === 'all' || activeTab === 'marks') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Academic progress & semester trend</h3>
                      <span className="status-tag success">{studentData.profile?.completion ?? 76}% complete</span>
                    </div>
                    <div className="progress-grid">
                      <div className="ring-card">
                        <div className="ring" style={{ '--progress': `${studentData.profile?.completion ?? 76}` }}>
                          <span>{studentData.profile?.completion ?? 76}%</span>
                        </div>
                        <p>Semester completion</p>
                      </div>

                      <div className="trend-panel">
                        {(studentData.performanceTrend || defaultStudentData.performanceTrend).map((value, index) => (
                          <div key={value + index} className="trend-column">
                            <span className="trend-bar" style={{ height: `${value}%` }}></span>
                            <label>Sem {index + 1}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Syllabus & Course Topics */}
                {(activeTab === 'all' || activeTab === 'syllabus') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Course syllabus & modules</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {(currentRole === 'faculty' || currentRole === 'admin') && (
                          <button type="button" className="mini-action-btn" onClick={() => setShowSyllabusModal(true)}>
                            + Add Unit
                          </button>
                        )}
                        <span className="status-tag">Curriculum</span>
                      </div>
                    </div>
                    <div className="syllabus-grid">
                      {filteredSyllabus.map((item) => (
                        <div key={item} className="syllabus-pill">
                          <span className="pill-check">✓</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              FACULTY VIEW
             ══════════════════════════════════════════════════════════════════════ */}
          {activeView === 'faculty' && (
            <>
              {activeTab === 'all' && (
                <section className="hero-banner faculty-banner">
                  <div>
                    <p className="eyebrow light">Faculty workspace</p>
                    <h1>Manage student records, publish marks, attendance, and syllabus.</h1>
                  </div>
                  <div className="banner-actions">
                    <label className="primary-btn alt upload-label">
                      {uploading ? 'Uploading...' : '📁 Upload Resource'}
                      <input type="file" onChange={handleUpload} hidden />
                    </label>
                    <button type="button" className="primary-btn" onClick={() => setShowNoticeModal(true)}>
                      📢 Broadcast Notice
                    </button>
                  </div>
                </section>
              )}

              {/* Faculty Stats */}
              <section className="stats-grid">
                {(facultyData.facultyStats || defaultFacultyData.facultyStats).map((stat) => (
                  <div className="stats-card" key={stat.label}>
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                    <small>Live summary</small>
                  </div>
                ))}
              </section>

              <section className="content-grid">
                {/* Upload Center / Quick Actions */}
                {(activeTab === 'all' || activeTab === 'upload') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Upload center & action tools</h3>
                      <span className="status-tag">Interactive</span>
                    </div>
                    <div className="upload-grid">
                      <button
                        type="button"
                        className="upload-card"
                        onClick={() => setShowAttendanceModal(true)}
                      >
                        📊 Upload attendance
                      </button>
                      <button
                        type="button"
                        className="upload-card"
                        onClick={() => setShowMarksModal(true)}
                      >
                        📝 Publish marks
                      </button>
                      <button
                        type="button"
                        className="upload-card"
                        onClick={() => setShowSyllabusModal(true)}
                      >
                        📘 Add syllabus
                      </button>
                      <button
                        type="button"
                        className="upload-card"
                        onClick={() => setShowAssignmentModal(true)}
                      >
                        📚 Share assignment
                      </button>
                    </div>
                  </div>
                )}

                {/* Student Records & Performance Summary */}
                {(activeTab === 'all' || activeTab === 'records') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Student performance records & scores</h3>
                      <button type="button" className="mini-action-btn" onClick={() => setShowMarksModal(true)}>
                        + Publish Marks
                      </button>
                    </div>
                    <div className="list-stack">
                      {(facultyData.studentRecords || defaultFacultyData.studentRecords).map((student) => (
                        <div key={student.name + student.studentId} className="record-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <strong>{student.name}</strong>
                            <p>{student.status} • <small style={{ color: '#2563eb' }}>{student.studentId || 'STU-2048'}</small></p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="score-badge">Avg: {student.score}</span>
                            <span className="score-badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>Att: {student.attendance || '88%'}</span>
                            <button
                              type="button"
                              className="mini-action-btn"
                              onClick={() => {
                                setNewMarks((prev) => ({ ...prev, student_name: student.name, student_id: student.studentId || 'STU-2048' }))
                                setShowMarksModal(true)
                              }}
                            >
                              + Marks
                            </button>
                            <button
                              type="button"
                              className="mini-action-btn"
                              onClick={() => {
                                setNewAttendance((prev) => ({ ...prev, student_name: student.name, student_id: student.studentId || 'STU-2048' }))
                                setShowAttendanceModal(true)
                              }}
                            >
                              + Attendance
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Student Attendance Table in Faculty View */}
                {(activeTab === 'all' || activeTab === 'attendance') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Live Student Attendance Log</h3>
                      <button type="button" className="mini-action-btn" onClick={() => setShowAttendanceModal(true)}>
                        + Record Attendance
                      </button>
                    </div>
                    <div className="attendance-list">
                      {filteredAttendance.map((item, idx) => (
                        <div className="attendance-row" key={item.id || (item.subject + (item.student_id || idx))}>
                          <div className="subject-meta">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong>{item.subject}</strong>
                              <span className="student-badge">👤 {item.student_name || 'Aarav Mehta'} ({item.student_id || 'STU-2048'})</span>
                            </div>
                            <span>{item.attended}/{item.total} classes attended</span>
                          </div>
                          <div className="progress-wrap">
                            <div className="progress-bar"><span style={{ width: `${item.percent}%` }} /></div>
                            <strong>{item.percent}%</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Marks & Assessment Table in Faculty View */}
                {(activeTab === 'all' || activeTab === 'marks') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Published Student Marks & Grades</h3>
                      <button type="button" className="mini-action-btn" onClick={() => setShowMarksModal(true)}>
                        + Publish Marks
                      </button>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Student Name & ID</th>
                          <th>Score</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMarks.map((item, idx) => (
                          <tr key={item.id || (item.subject + (item.student_id || idx))}>
                            <td><strong>{item.subject}</strong></td>
                            <td>
                              <span className="student-tag">{item.student_name || 'Aarav Mehta'}</span>
                              <span className="id-subtext">{item.student_id || 'STU-2048'}</span>
                            </td>
                            <td>{item.mst1 + item.mst2}/{item.total || 40}</td>
                            <td><span className="grade-badge">{item.grade}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Course Resources */}
                {(activeTab === 'all' || activeTab === 'resources') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Published course resources</h3>
                      <label className="mini-action-btn upload-mini-btn">
                        + Upload New
                        <input type="file" onChange={handleUpload} hidden />
                      </label>
                    </div>
                    <div className="resource-grid">
                      {filteredFacultyResources.map((resource) => (
                        <div className="resource-card" key={resource.title}>
                          <div className="resource-badge">{resource.type}</div>
                          <strong>{resource.title}</strong>
                          <p>Updated {resource.updated}</p>
                          <button
                            type="button"
                            className="open-file-btn"
                            onClick={() => {
                              if (resource.file_url) {
                                window.open(resource.file_url, '_blank', 'noopener,noreferrer')
                              } else {
                                setToast(`Opened resource: ${resource.title}`)
                              }
                            }}
                          >
                            Open File ↗
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignment Tracking */}
                {(activeTab === 'all' || activeTab === 'assignments') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Assignment submissions & tasks</h3>
                      <button type="button" className="mini-action-btn" onClick={() => setShowAssignmentModal(true)}>
                        + Add Task
                      </button>
                    </div>
                    <div className="list-stack" style={{ marginBottom: '16px' }}>
                      {filteredAssignments.map((assignment) => (
                        <div key={assignment.id || assignment.title} className="list-item">
                          <div>
                            <strong>{assignment.title}</strong>
                            <p>{assignment.course} • <small style={{ color: '#2563eb' }}>{assignment.student_name || 'Aarav Mehta'} ({assignment.student_id || 'STU-2048'})</small></p>
                          </div>
                          <div className="assignment-meta">
                            <span>{assignment.due}</span>
                            <em className={assignment.status === 'Submitted' ? 'done' : assignment.status === 'Pending' ? 'pending' : 'review'}>
                              {assignment.status}
                            </em>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Faculty Alerts */}
                {(activeTab === 'all' || activeTab === 'alerts') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Faculty priority alerts</h3>
                      <button type="button" className="mini-action-btn" onClick={() => setShowNoticeModal(true)}>
                        + Post Alert
                      </button>
                    </div>
                    <div className="alert-list">
                      {(facultyData.facultyAlerts || defaultFacultyData.facultyAlerts).map((alert) => (
                        <div key={alert} className="alert-item">
                          <span className="alert-dot"></span>
                          <p>{alert}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Syllabus Updates */}
                {(activeTab === 'all' || activeTab === 'syllabus') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Syllabus milestones & logs</h3>
                      <button type="button" className="mini-action-btn" onClick={() => setShowSyllabusModal(true)}>
                        + Add Milestone
                      </button>
                    </div>
                    <div className="timeline-list">
                      {(facultyData.syllabusUpdates || defaultFacultyData.syllabusUpdates).map((item) => (
                        <div key={item} className="timeline-item">
                          <span className="dot"></span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              ADMIN VIEW
             ══════════════════════════════════════════════════════════════════════ */}
          {activeView === 'admin' && (
            <>
              {activeTab === 'all' && (
                <section className="hero-banner faculty-banner">
                  <div>
                    <p className="eyebrow light">Administration console</p>
                    <h1>Monitor institutional operations, user accounts, and system health.</h1>
                  </div>
                  <div className="banner-actions">
                    <button type="button" className="primary-btn" onClick={() => setShowUserModal(true)}>
                      👥 Add New User
                    </button>
                    <button type="button" className="primary-btn alt" onClick={() => setShowNoticeModal(true)}>
                      📢 Post Alert
                    </button>
                  </div>
                </section>
              )}

              {/* Admin Stats */}
              <section className="stats-grid">
                {(adminData.stats || defaultAdminData.stats).map((stat) => (
                  <div className="stats-card" key={stat.label}>
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                    <small>Operational status</small>
                  </div>
                ))}
              </section>

              <section className="content-grid">
                {/* Registered Users */}
                {(activeTab === 'all' || activeTab === 'users') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Registered accounts & roles</h3>
                      <button type="button" className="mini-action-btn" onClick={() => setShowUserModal(true)}>
                        + Add Account
                      </button>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr><th>Name</th><th>Email</th><th>Role</th><th>Student ID / Info</th></tr>
                      </thead>
                      <tbody>
                        {filteredAdminUsers.map((entry) => (
                          <tr key={entry.email}>
                            <td><strong>{entry.name}</strong></td>
                            <td>{entry.email}</td>
                            <td>
                              <span className={`role-badge ${entry.role}`}>{entry.role}</span>
                            </td>
                            <td>{entry.student_id || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Attendance in Admin */}
                {(activeTab === 'all' || activeTab === 'attendance') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Institutional Attendance Records</h3>
                      <button type="button" className="mini-action-btn" onClick={() => setShowAttendanceModal(true)}>
                        + Record Attendance
                      </button>
                    </div>
                    <div className="attendance-list">
                      {filteredAttendance.map((item, idx) => (
                        <div className="attendance-row" key={item.id || (item.subject + (item.student_id || idx))}>
                          <div className="subject-meta">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong>{item.subject}</strong>
                              <span className="student-badge">👤 {item.student_name || 'Aarav Mehta'} ({item.student_id || 'STU-2048'})</span>
                            </div>
                            <span>{item.attended}/{item.total} classes attended</span>
                          </div>
                          <div className="progress-wrap">
                            <div className="progress-bar"><span style={{ width: `${item.percent}%` }} /></div>
                            <strong>{item.percent}%</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Marks in Admin */}
                {(activeTab === 'all' || activeTab === 'marks') && (
                  <div className="panel panel-wide">
                    <div className="panel-header">
                      <h3>Institutional Marks & Grades</h3>
                      <button type="button" className="mini-action-btn" onClick={() => setShowMarksModal(true)}>
                        + Publish Marks
                      </button>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Student Name & ID</th>
                          <th>Score</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMarks.map((item, idx) => (
                          <tr key={item.id || (item.subject + (item.student_id || idx))}>
                            <td><strong>{item.subject}</strong></td>
                            <td>
                              <span className="student-tag">{item.student_name || 'Aarav Mehta'}</span>
                              <span className="id-subtext">{item.student_id || 'STU-2048'}</span>
                            </td>
                            <td>{item.mst1 + item.mst2}/{item.total || 40}</td>
                            <td><span className="grade-badge">{item.grade}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Departments */}
                {(activeTab === 'all' || activeTab === 'departments') && (
                  <div className="panel">
                    <div className="panel-header">
                      <h3>Academic departments</h3>
                      <span className="status-tag success">4 Active</span>
                    </div>
                    <div className="list-stack">
                      {(adminData.institutions || defaultAdminData.institutions).map((item) => (
                        <div key={item} className="list-item">
                          <strong>{item}</strong>
                          <span className="status-tag success">Online</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* System Alerts */}
                {(activeTab === 'all' || activeTab === 'alerts') && (
                  <div className="panel">
                    <div className="panel-header">
                      <h3>System alerts & notices</h3>
                      <button type="button" className="mini-action-btn" onClick={() => setShowNoticeModal(true)}>
                        + Post
                      </button>
                    </div>
                    <div className="alert-list">
                      {(adminData.notices || defaultAdminData.notices).map((alert) => (
                        <div key={alert} className="alert-item">
                          <span className="alert-dot"></span>
                          <p>{alert}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS WITH STUDENT NAME & ID SELECTORS
         ══════════════════════════════════════════════════════════════════════ */}

      {/* 1. Submit Assignment Modal */}
      {showAssignmentModal && (
        <div className="modal-backdrop" onClick={() => setShowAssignmentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit / Create Assignment</h3>
              <button type="button" className="close-btn" onClick={() => setShowAssignmentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateAssignment} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>Student Name
                  <input
                    type="text"
                    placeholder="e.g. Aarav Mehta"
                    value={newAssignment.student_name}
                    onChange={(e) => setNewAssignment({ ...newAssignment, student_name: e.target.value })}
                    required
                  />
                </label>
                <label>Student ID
                  <input
                    type="text"
                    placeholder="e.g. STU-2048"
                    value={newAssignment.student_id}
                    onChange={(e) => setNewAssignment({ ...newAssignment, student_id: e.target.value })}
                    required
                  />
                </label>
              </div>

              {/* Quick student picker */}
              <div className="quick-pill-row">
                {availableStudents.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    className="mini-pill-btn"
                    onClick={() => setNewAssignment((prev) => ({ ...prev, student_name: s.name, student_id: s.id }))}
                  >
                    👤 {s.name} ({s.id})
                  </button>
                ))}
              </div>

              <label>Assignment Title
                <input
                  type="text"
                  placeholder="e.g. Operating Systems Case Study"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  required
                />
              </label>

              <label>Course / Subject
                <input
                  type="text"
                  placeholder="e.g. Operating Systems"
                  value={newAssignment.course}
                  onChange={(e) => setNewAssignment({ ...newAssignment, course: e.target.value })}
                  required
                />
                <div className="quick-pill-row">
                  {['Operating Systems', 'DBMS', 'Data Structures', 'Computer Networks'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      className="mini-pill-btn"
                      onClick={() => setNewAssignment((prev) => ({ ...prev, course: c }))}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </label>

              <label>Due Date
                <input
                  type="text"
                  placeholder="e.g. 25 Aug"
                  value={newAssignment.due}
                  onChange={(e) => setNewAssignment({ ...newAssignment, due: e.target.value })}
                />
              </label>

              <label>Status
                <select
                  value={newAssignment.status}
                  onChange={(e) => setNewAssignment({ ...newAssignment, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Submitted">Submitted</option>
                  <option value="In review">In review</option>
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn form-btn">Submit Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Upload / Record Attendance Modal */}
      {showAttendanceModal && (
        <div className="modal-backdrop" onClick={() => setShowAttendanceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload / Record Attendance</h3>
              <button type="button" className="close-btn" onClick={() => setShowAttendanceModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateAttendance} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>Student Name
                  <input
                    type="text"
                    placeholder="e.g. Aarav Mehta"
                    value={newAttendance.student_name}
                    onChange={(e) => setNewAttendance({ ...newAttendance, student_name: e.target.value })}
                    required
                  />
                </label>
                <label>Student ID
                  <input
                    type="text"
                    placeholder="e.g. STU-2048"
                    value={newAttendance.student_id}
                    onChange={(e) => setNewAttendance({ ...newAttendance, student_id: e.target.value })}
                    required
                  />
                </label>
              </div>

              {/* Quick student picker */}
              <div className="quick-pill-row">
                {availableStudents.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    className="mini-pill-btn"
                    onClick={() => setNewAttendance((prev) => ({ ...prev, student_name: s.name, student_id: s.id }))}
                  >
                    👤 {s.name} ({s.id})
                  </button>
                ))}
              </div>

              <label>Subject / Course Name
                <input
                  type="text"
                  placeholder="e.g. Operating Systems"
                  value={newAttendance.subject}
                  onChange={(e) => setNewAttendance({ ...newAttendance, subject: e.target.value })}
                  required
                />
                <div className="quick-pill-row">
                  {['Operating Systems', 'Database Systems', 'Data Structures', 'Computer Networks', 'Cloud Computing'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      className="mini-pill-btn"
                      onClick={() => setNewAttendance((prev) => ({ ...prev, subject: c }))}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>Attended Classes
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 28"
                    value={newAttendance.attended}
                    onChange={(e) => setNewAttendance({ ...newAttendance, attended: Number(e.target.value) })}
                    required
                  />
                </label>
                <label>Total Classes
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 32"
                    value={newAttendance.total}
                    onChange={(e) => setNewAttendance({ ...newAttendance, total: Number(e.target.value) })}
                    required
                  />
                </label>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#475569', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                Calculated percentage:{' '}
                <strong>
                  {newAttendance.total ? Math.round((newAttendance.attended / newAttendance.total) * 100) : 0}%
                </strong>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowAttendanceModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn form-btn">Save Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Publish Marks Modal */}
      {showMarksModal && (
        <div className="modal-backdrop" onClick={() => setShowMarksModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Publish Marks & Assessment</h3>
              <button type="button" className="close-btn" onClick={() => setShowMarksModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateMarks} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>Student Name
                  <input
                    type="text"
                    placeholder="e.g. Aarav Mehta"
                    value={newMarks.student_name}
                    onChange={(e) => setNewMarks({ ...newMarks, student_name: e.target.value })}
                    required
                  />
                </label>
                <label>Student ID
                  <input
                    type="text"
                    placeholder="e.g. STU-2048"
                    value={newMarks.student_id}
                    onChange={(e) => setNewMarks({ ...newMarks, student_id: e.target.value })}
                    required
                  />
                </label>
              </div>

              {/* Quick student picker */}
              <div className="quick-pill-row">
                {availableStudents.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    className="mini-pill-btn"
                    onClick={() => setNewMarks((prev) => ({ ...prev, student_name: s.name, student_id: s.id }))}
                  >
                    👤 {s.name} ({s.id})
                  </button>
                ))}
              </div>

              <label>Course / Subject Name
                <input
                  type="text"
                  placeholder="e.g. DBMS"
                  value={newMarks.subject}
                  onChange={(e) => setNewMarks({ ...newMarks, subject: e.target.value })}
                  required
                />
                <div className="quick-pill-row">
                  {['DBMS', 'OS', 'Networking', 'DSA', 'Machine Learning'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      className="mini-pill-btn"
                      onClick={() => setNewMarks((prev) => ({ ...prev, subject: c }))}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>MST-1 Score (out of 20)
                  <input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="18"
                    value={newMarks.mst1}
                    onChange={(e) => setNewMarks({ ...newMarks, mst1: Number(e.target.value) })}
                    required
                  />
                </label>
                <label>MST-2 Score (out of 20)
                  <input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="20"
                    value={newMarks.mst2}
                    onChange={(e) => setNewMarks({ ...newMarks, mst2: Number(e.target.value) })}
                    required
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>Total Max Score
                  <input
                    type="number"
                    value={newMarks.total}
                    onChange={(e) => setNewMarks({ ...newMarks, total: Number(e.target.value) })}
                  />
                </label>
                <label>Grade
                  <select
                    value={newMarks.grade}
                    onChange={(e) => setNewMarks({ ...newMarks, grade: e.target.value })}
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="A-">A- (Very Good)</option>
                    <option value="B+">B+ (Good)</option>
                    <option value="B">B (Above Average)</option>
                    <option value="C">C (Pass)</option>
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowMarksModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn form-btn">Publish Marks</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Syllabus Item Modal */}
      {showSyllabusModal && (
        <div className="modal-backdrop" onClick={() => setShowSyllabusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Syllabus Unit / Topic</h3>
              <button type="button" className="close-btn" onClick={() => setShowSyllabusModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateSyllabus} className="modal-form">
              <label>Module / Topic Description
                <input
                  type="text"
                  placeholder="e.g. Unit 7: Microservices Architecture & Containerization"
                  value={newSyllabusItem}
                  onChange={(e) => setNewSyllabusItem(e.target.value)}
                  required
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowSyllabusModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn form-btn">Add Syllabus Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Post Notice Modal */}
      {showNoticeModal && (
        <div className="modal-backdrop" onClick={() => setShowNoticeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Broadcast New Notice</h3>
              <button type="button" className="close-btn" onClick={() => setShowNoticeModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateNotice} className="modal-form">
              <label>Notice Message
                <textarea
                  rows="4"
                  placeholder="Enter important announcement or reminder..."
                  value={newNotice}
                  onChange={(e) => setNewNotice(e.target.value)}
                  required
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowNoticeModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn form-btn">Broadcast Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add User Modal */}
      {showUserModal && (
        <div className="modal-backdrop" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New User (Admin)</h3>
              <button type="button" className="close-btn" onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-form">
              <label>Full Name
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </label>
              <label>Email Address
                <input
                  type="email"
                  placeholder="user@college.edu"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </label>
              <label>Password
                <input
                  type="password"
                  placeholder="Min 6 chars"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </label>
              <label>Role
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn form-btn">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App

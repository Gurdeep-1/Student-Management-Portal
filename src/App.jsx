import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

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
    { subject: 'Operating Systems', attended: 28, total: 32, percent: 88 },
    { subject: 'Database Systems', attended: 24, total: 28, percent: 86 },
    { subject: 'Data Structures', attended: 30, total: 32, percent: 94 },
    { subject: 'Computer Networks', attended: 22, total: 27, percent: 81 },
  ],
  marksData: [
    { subject: 'DBMS', mst1: 18, mst2: 21, total: 40, grade: 'A' },
    { subject: 'OS', mst1: 17, mst2: 18, total: 40, grade: 'A' },
    { subject: 'Networking', mst1: 15, mst2: 20, total: 40, grade: 'A-' },
    { subject: 'DSA', mst1: 19, mst2: 22, total: 40, grade: 'A+' },
  ],
  assignments: [
    { title: 'Mini Project Proposal', course: 'DBMS', due: '12 Aug', status: 'Submitted' },
    { title: 'Network Topology Notes', course: 'Networking', due: '15 Aug', status: 'Pending' },
    { title: 'System Design Case Study', course: 'OS', due: '18 Aug', status: 'In review' },
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
    { name: 'Aarav Mehta', status: 'Excellent', score: '92%' },
    { name: 'Ishita Verma', status: 'On track', score: '87%' },
    { name: 'Rohit Sharma', status: 'Needs focus', score: '71%' },
    { name: 'Mehul Gupta', status: 'Excellent', score: '94%' },
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
    { name: 'Aarav Mehta', email: 'student@college.edu', role: 'student' },
    { name: 'Dr. Neha Rao', email: 'faculty@college.edu', role: 'faculty' },
    { name: 'Administrator', email: 'admin@college.edu', role: 'admin' },
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
  const [showTimetable, setShowTimetable] = useState(false)
  const [uploading, setUploading] = useState(false)

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
        setDashboard((prev) => ({ ...prev, ...payload.dashboard, user: payload.user }))
      } catch {
        // ignore dashboard load errors for now
      }
    }

    loadDashboard()
  }, [token, user, fetchWithAuth])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  // set active view when user first loads or logs in

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
    setToast('Logged out successfully.')
  }

  const refreshDashboard = async () => {
    const response = await fetchWithAuth('/api/dashboard')
    if (!response.ok) return
    const payload = await response.json()
    setDashboard((prev) => ({ ...prev, ...payload.dashboard, user: payload.user }))
  }

  const handleQuickAction = async (label) => {
    if (label === 'View timetable') {
      setShowTimetable((prev) => !prev)
      setToast('Timetable panel toggled successfully.')
      return
    }

    if (label === 'Submit assignment') {
      const response = await fetchWithAuth('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Reflection Summary', course: 'DBMS', due: 'Next Friday', status: 'Pending' }),
      })

      if (response.ok) {
        await refreshDashboard()
        setToast('Assignment saved and sent to faculty review.')
      }
      return
    }

    if (label === 'Download notes') {
      const response = await fetchWithAuth('/api/resources')
      if (response.ok) {
        const resources = await response.json()
        const resource = Array.isArray(resources) ? resources[0] : null
        if (resource?.file_url) {
          window.open(resource.file_url, '_blank', 'noopener,noreferrer')
        }
      }
      setToast('Portal notes opened successfully.')
      return
    }

    if (label === 'Ask mentor') {
      const response = await fetchWithAuth('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Student requested mentor guidance for current coursework.' }),
      })

      if (response.ok) {
        setToast('Mentor request submitted successfully.')
      }
    }
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('title', `Uploaded ${file.name}`)
    formData.append('type', file.type || 'PDF')
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
      setToast('Resource uploaded successfully.')
    } catch (error) {
      setToast(error.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const profile = user || { name: 'Student', role: 'student' }
  // If not authenticated, show the auth (login / register) UI
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
                <label>Student ID
                  <input name="studentId" value={authForm.studentId} onChange={handleAuthFieldChange} placeholder="Optional" />
                </label>
                <label>Program
                  <input name="program" value={authForm.program} onChange={handleAuthFieldChange} placeholder="Optional" />
                </label>
                <label>Advisor
                  <input name="advisor" value={authForm.advisor} onChange={handleAuthFieldChange} placeholder="Optional" />
                </label>
              </>
            )}

            <label>Email
              <input name="email" type="email" value={authForm.email} onChange={handleAuthFieldChange} placeholder="name@college.edu" required />
            </label>

            <label>Password
              <input name="password" type="password" value={authForm.password} onChange={handleAuthFieldChange} placeholder="Enter password" required />
            </label>

            <button type="submit" className="primary-btn auth-submit">{authMode === 'login' ? 'Sign in' : 'Create account'}</button>
          </form>

          <div className="demo-box">
            <strong>Demo credentials</strong>
            <span>Student: student@college.edu / student123</span>
            <span>Faculty: faculty@college.edu / faculty123</span>
            <span>Admin: admin@college.edu / admin123</span>
          </div>
        </div>
      </div>
    )
  }

  const currentRole = user?.role || 'student'

  const notices = currentRole === 'student'
    ? (studentData.notices || defaultStudentData.notices)
    : currentRole === 'faculty'
      ? (facultyData.notices || defaultFacultyData.notices)
      : (adminData.notices || defaultAdminData.notices)

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
            <input type="text" placeholder="Search students, courses..." />
          </div>

          <div className="view-switch" aria-label="Portal views">
            {(currentRole === 'student' || currentRole === 'faculty' || currentRole === 'admin') && (
              <>
                {currentRole === 'student' && (
                  <button type="button" className={activeView === 'student' ? 'view-btn active' : 'view-btn'} onClick={() => setActiveView('student')}>
                    Student view
                  </button>
                )}
                {(currentRole === 'faculty' || currentRole === 'admin') && (
                  <button type="button" className={activeView === 'faculty' ? 'view-btn active' : 'view-btn'} onClick={() => setActiveView('faculty')}>
                    Faculty view
                  </button>
                )}
                {currentRole === 'admin' && (
                  <button type="button" className={activeView === 'admin' ? 'view-btn active' : 'view-btn'} onClick={() => setActiveView('admin')}>
                    Admin view
                  </button>
                )}
              </>
            )}
          </div>

          <div className="profile-chip">
            <span className="chip-dot"></span>
            {profile.name}
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
              <span>{profile.role}</span>
              <span>{profile.program || 'Academic management account'}</span>
            </div>
          </div>

          <div className="side-card">
            <p className="eyebrow">Quick links</p>
            <ul className="sidebar-list">
              <li>Dashboard</li>
              <li>Attendance</li>
              <li>Marks</li>
              <li>Assignments</li>
              <li>PYQs</li>
              <li>Resources</li>
            </ul>
          </div>

          <div className="side-card notice-card">
            <p className="eyebrow">Notices</p>
            <ul>
              {notices.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="main-panel">
          {currentRole === 'student' && activeView === 'student' && (
            <>
              <section className="hero-banner student-banner">
                <div>
                  <p className="eyebrow light">Welcome back</p>
                  <h1>Track your academic progress and upcoming tasks.</h1>
                </div>
                <button type="button" className="primary-btn" onClick={() => setShowTimetable((prev) => !prev)}>
                  {showTimetable ? 'Hide timetable' : 'View Timetable'}
                </button>
              </section>

              {showTimetable && (
                <section className="panel panel-wide timetable-panel">
                  <div className="panel-header">
                    <h3>Today's timetable</h3>
                    <span className="status-tag">Live</span>
                  </div>
                  <div className="list-stack compact">
                    {(studentData.upcomingClasses || defaultStudentData.upcomingClasses).map((item) => (
                      <div key={item.course} className="time-row">
                        <div>
                          <strong>{item.course}</strong>
                          <p>{item.room}</p>
                        </div>
                        <span>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="stats-grid">
                <div className="stats-card">
                  <span>Attendance</span>
                  <strong>{studentData.profile?.attendance ?? defaultStudentData.profile.attendance}%</strong>
                  <small>Across 4 core subjects</small>
                </div>
                <div className="stats-card">
                  <span>CGPA</span>
                  <strong>{studentData.profile?.cgpa ?? defaultStudentData.profile.cgpa}</strong>
                  <small>Current cumulative grade</small>
                </div>
                <div className="stats-card">
                  <span>Assignments</span>
                  <strong>{studentData.profile?.pendingAssignments ?? defaultStudentData.profile.pendingAssignments}</strong>
                  <small>Pending review</small>
                </div>
                <div className="stats-card accent">
                  <span>Mentor</span>
                  <strong>{studentData.profile?.advisor ?? defaultStudentData.profile.advisor}</strong>
                  <small>Academic guidance</small>
                </div>
              </section>

              <section className="quick-actions panel">
                <div className="panel-header">
                  <h3>Quick actions</h3>
                  <span className="status-tag">Today</span>
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

              <section className="content-grid">
                <div className="panel panel-wide">
                  <div className="panel-header">
                    <h3>Attendance overview</h3>
                    <span className="status-tag success">Healthy</span>
                  </div>
                  <div className="attendance-list">
                    {(studentData.attendanceData || defaultStudentData.attendanceData).map((item) => (
                      <div className="attendance-row" key={item.subject}>
                        <div className="subject-meta">
                          <strong>{item.subject}</strong>
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

                <div className="panel">
                  <div className="panel-header">
                    <h3>Today's classes</h3>
                    <span className="status-tag">Schedule</span>
                  </div>
                  <div className="list-stack compact">
                    {(studentData.upcomingClasses || defaultStudentData.upcomingClasses).map((item) => (
                      <div key={item.course} className="time-row">
                        <div><strong>{item.course}</strong><p>{item.room}</p></div>
                        <span>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <h3>Marks summary</h3>
                    <span className="status-tag">MST-2</span>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr><th>Course</th><th>MST</th><th>Grade</th></tr>
                    </thead>
                    <tbody>
                      {(studentData.marksData || defaultStudentData.marksData).map((item) => (
                        <tr key={item.subject}><td>{item.subject}</td><td>{item.mst1 + item.mst2}/40</td><td>{item.grade}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <h3>Assignments</h3>
                    <span className="status-tag warning">3 pending</span>
                  </div>
                  <div className="list-stack">
                    {(studentData.assignments || defaultStudentData.assignments).map((assignment) => (
                      <div key={assignment.title} className="list-item">
                        <div><strong>{assignment.title}</strong><p>{assignment.course}</p></div>
                        <div className="assignment-meta">
                          <span>{assignment.due}</span>
                          <em className={assignment.status === 'Submitted' ? 'done' : assignment.status === 'Pending' ? 'pending' : 'review'}>{assignment.status}</em>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <h3>Previous year papers</h3>
                    <span className="status-tag">Library</span>
                  </div>
                  <div className="resource-list">
                    {(studentData.pyqData || defaultStudentData.pyqData).map((paper) => (
                      <div key={paper.title} className="resource-item">
                        <div><strong>{paper.title}</strong><p>{paper.type}</p></div>
                        <span>{paper.size}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel panel-wide">
                  <div className="panel-header">
                    <h3>Academic progress</h3>
                    <span className="status-tag success">{studentData.profile?.completion ?? defaultStudentData.profile.completion}%</span>
                  </div>
                  <div className="progress-grid">
                    <div className="ring-card">
                      <div className="ring" style={{ '--progress': `${studentData.profile?.completion ?? defaultStudentData.profile.completion}` }}>
                        <span>{studentData.profile?.completion ?? defaultStudentData.profile.completion}%</span>
                      </div>
                      <p>Semester completion</p>
                    </div>

                    <div className="trend-panel">
                      {(studentData.performanceTrend || defaultStudentData.performanceTrend).map((value, index) => (
                        <div key={value + index} className="trend-column">
                          <span className="trend-bar" style={{ height: `${value}%` }}></span>
                          <label>{index + 1}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="panel panel-wide">
                  <div className="panel-header">
                    <h3>Course syllabus & resources</h3>
                    <span className="status-tag">Updated</span>
                  </div>
                  <div className="syllabus-grid">
                    {(studentData.syllabusItems || defaultStudentData.syllabusItems).map((item) => (
                      <div key={item} className="syllabus-pill">{item}</div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {currentRole === 'faculty' && activeView === 'faculty' && (
            <>
              <section className="hero-banner faculty-banner">
                <div>
                  <p className="eyebrow light">Faculty workspace</p>
                  <h1>Manage attendance, assessments, syllabus and assignment uploads.</h1>
                </div>
                <label className="primary-btn alt upload-label">
                  {uploading ? 'Uploading...' : 'Upload resource'}
                  <input type="file" onChange={handleUpload} hidden />
                </label>
              </section>

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
                <div className="panel panel-wide">
                  <div className="panel-header">
                    <h3>Course resources</h3>
                    <span className="status-tag success">Published</span>
                  </div>
                  <div className="resource-grid">
                    {(facultyData.facultyResources || defaultFacultyData.facultyResources).map((resource) => (
                      <div className="resource-card" key={resource.title}>
                        <div className="resource-badge">{resource.type}</div>
                        <strong>{resource.title}</strong>
                        <p>Updated {resource.updated}</p>
                        <button type="button" onClick={() => window.open(resource.file_url, '_blank', 'noopener,noreferrer')}>Open</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <h3>Upload center</h3>
                    <span className="status-tag">Quick tools</span>
                  </div>
                  <div className="upload-grid">
                    {(facultyData.facultyUploadCards || defaultFacultyData.facultyUploadCards).map((item) => (
                      <button key={item} type="button" className="upload-card" onClick={() => setToast(`${item} action started.`)}>{item}</button>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <h3>Attendance & assessment</h3>
                    <span className="status-tag warning">Action needed</span>
                  </div>
                  <div className="list-stack">
                    {(facultyData.studentRecords || defaultFacultyData.studentRecords).map((student) => (
                      <div key={student.name} className="record-row">
                        <div><strong>{student.name}</strong><p>{student.status}</p></div>
                        <span>{student.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <h3>Assignment tracking</h3>
                    <span className="status-tag">Live</span>
                  </div>
                  <div className="assignment-tracker">
                    <div><strong>42</strong><span>Submitted</span></div>
                    <div><strong>12</strong><span>Pending</span></div>
                    <div><strong>08</strong><span>Reviewed</span></div>
                  </div>
                </div>

                <div className="panel panel-wide">
                  <div className="panel-header">
                    <h3>Faculty alerts</h3>
                    <span className="status-tag warning">Priority</span>
                  </div>
                  <div className="alert-list">
                    {(facultyData.facultyAlerts || defaultFacultyData.facultyAlerts).map((alert) => (
                      <div key={alert} className="alert-item"><span className="alert-dot"></span><p>{alert}</p></div>
                    ))}
                  </div>
                </div>

                <div className="panel panel-wide">
                  <div className="panel-header">
                    <h3>Syllabus updates</h3>
                    <span className="status-tag">Current</span>
                  </div>
                  <div className="timeline-list">
                    {(facultyData.syllabusUpdates || defaultFacultyData.syllabusUpdates).map((item) => (
                      <div key={item}><span className="dot"></span>{item}</div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {currentRole === 'admin' && activeView === 'admin' && (
            <>
              <section className="hero-banner faculty-banner">
                <div>
                  <p className="eyebrow light">Administration portal</p>
                  <h1>Monitor academic systems, users, and institutional operations.</h1>
                </div>
                <button type="button" className="primary-btn alt" onClick={() => setToast('Admin sync completed.')}>Sync system</button>
              </section>

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
                <div className="panel panel-wide">
                  <div className="panel-header">
                    <h3>Registered accounts</h3>
                    <span className="status-tag success">Active</span>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Role</th></tr>
                    </thead>
                    <tbody>
                      {(adminData.users || defaultAdminData.users).map((entry) => (
                        <tr key={entry.email}><td>{entry.name}</td><td>{entry.email}</td><td>{entry.role}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <h3>Departments</h3>
                    <span className="status-tag">Overview</span>
                  </div>
                  <div className="list-stack">
                    {(adminData.institutions || defaultAdminData.institutions).map((item) => (
                      <div key={item} className="list-item"><strong>{item}</strong><span>Online</span></div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <h3>Admin alerts</h3>
                    <span className="status-tag warning">Priority</span>
                  </div>
                  <div className="alert-list">
                    {(adminData.notices || defaultAdminData.notices).map((alert) => (
                      <div key={alert} className="alert-item"><span className="alert-dot"></span><p>{alert}</p></div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App

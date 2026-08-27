-- Student Management Portal — PostgreSQL schema
-- Executed via initSchema() on server start (CREATE TABLE IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role       VARCHAR(50)  DEFAULT 'student',
  student_id VARCHAR(120),
  program    VARCHAR(120),
  advisor    VARCHAR(255),
  created_at TIMESTAMP    DEFAULT NOW(),
  updated_at TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id           SERIAL PRIMARY KEY,
  student_name VARCHAR(255) DEFAULT 'Aarav Mehta',
  student_id   VARCHAR(120) DEFAULT 'STU-2048',
  subject      VARCHAR(255) NOT NULL,
  attended     INTEGER      NOT NULL,
  total        INTEGER      NOT NULL,
  percent      INTEGER      NOT NULL,
  created_at   TIMESTAMP    DEFAULT NOW(),
  updated_at   TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marks (
  id           SERIAL PRIMARY KEY,
  student_name VARCHAR(255) DEFAULT 'Aarav Mehta',
  student_id   VARCHAR(120) DEFAULT 'STU-2048',
  subject      VARCHAR(255) NOT NULL,
  mst1         INTEGER      NOT NULL,
  mst2         INTEGER      NOT NULL,
  total        INTEGER      NOT NULL,
  grade        VARCHAR(10)  NOT NULL,
  created_at   TIMESTAMP    DEFAULT NOW(),
  updated_at   TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
  id           SERIAL PRIMARY KEY,
  student_name VARCHAR(255) DEFAULT 'Aarav Mehta',
  student_id   VARCHAR(120) DEFAULT 'STU-2048',
  title        VARCHAR(255) NOT NULL,
  course       VARCHAR(255) NOT NULL,
  due          VARCHAR(120),
  status       VARCHAR(50)  DEFAULT 'Pending',
  created_at   TIMESTAMP    DEFAULT NOW(),
  updated_at   TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS syllabus (
  id         SERIAL PRIMARY KEY,
  item       TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notices (
  id         SERIAL PRIMARY KEY,
  message    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  type       VARCHAR(50)  NOT NULL,
  updated    VARCHAR(120),
  file_url   TEXT,
  created_at TIMESTAMP    DEFAULT NOW(),
  updated_at TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  message    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

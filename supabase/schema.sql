-- PAIE Cell Student Engagement Platform Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_type AS ENUM ('mcq', 'coding', 'error');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_difficulty AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('not_started', 'pending', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  regdid VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  department VARCHAR(255),
  branch VARCHAR(255),
  clubmail VARCHAR(255),
  originalmail VARCHAR(255),
  profile_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  type task_type NOT NULL,
  difficulty task_difficulty NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  description TEXT,
  leetcode_link TEXT,
  mcq_data JSONB,
  error_data JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  week_number INT NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status submission_status DEFAULT 'not_started',
  answer JSONB,
  score INT,
  submitted_at TIMESTAMPTZ,
  UNIQUE(task_id, student_id)
);

CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  duration INT NOT NULL,
  test_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INT DEFAULT 0,
  question_order INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS test_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'in_progress',
  answers JSONB DEFAULT '{}',
  score INT DEFAULT 0,
  UNIQUE(test_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_week ON tasks(week_number, year);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON task_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Seed users (password for all: password123)
-- bcrypt hash generated with cost factor 10
INSERT INTO users (regdid, password_hash, name, role, department, branch, clubmail, originalmail, profile_photo) VALUES
('SA001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Super Admin', 'super_admin', 'CSE', 'Main', 'sa001@paiecell.com', 'superadmin@example.com', 'https://ui-avatars.com/api/?name=Super+Admin&background=7c3aed&color=fff'),
('AD001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', 'admin', 'CSE', 'Main', 'ad001@paiecell.com', 'admin@example.com', 'https://ui-avatars.com/api/?name=Admin+User&background=2563eb&color=fff'),
('ST001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John Student', 'student', 'CSE', 'A', 'st001@paiecell.com', 'john@example.com', 'https://ui-avatars.com/api/?name=John+Student&background=059669&color=fff'),
('ST002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Jane Doe', 'student', 'ECE', 'B', 'st002@paiecell.com', 'jane@example.com', 'https://ui-avatars.com/api/?name=Jane+Doe&background=dc2626&color=fff')
ON CONFLICT (regdid) DO NOTHING;

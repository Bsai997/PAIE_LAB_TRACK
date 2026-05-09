# Supabase Database Schema

Complete SQL schema for the Student Engagement Platform. Copy and paste into Supabase SQL Editor to create all tables.

## SQL Schema

```sql
-- Users Table (Student, Admin, Super Admin)
CREATE TABLE Users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regdid VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'admin', 'super_admin')),
  department VARCHAR(255),
  profile_img VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE Tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('mcq', 'coding', 'error')),
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  deadline TIMESTAMP NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- MCQ Options Table
CREATE TABLE MCQOptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES Tasks(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Coding Tasks Details
CREATE TABLE CodingTasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL UNIQUE REFERENCES Tasks(id) ON DELETE CASCADE,
  concept VARCHAR(255),
  leetcode_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Task Assignments (Student submissions)
CREATE TABLE TaskAssignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES Tasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'pending', 'completed', 'submitted')),
  started_at TIMESTAMP,
  submitted_at TIMESTAMP,
  answer JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(task_id, student_id)
);

-- Tests Table
CREATE TABLE Tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,
  date TIMESTAMP NOT NULL,
  created_by UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Questions Table
CREATE TABLE TestQuestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES Tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB,
  correct_answer VARCHAR(255),
  type VARCHAR(50) NOT NULL CHECK (type IN ('mcq', 'coding', 'error')),
  leetcode_link VARCHAR(500),
  question_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Test Submissions Table
CREATE TABLE TestSubmissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES Tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER,
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(test_id, student_id)
);

-- Weekly Statistics (for archival)
CREATE TABLE WeeklyStats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER NOT NULL,
  student_id UUID REFERENCES Users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES Users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES Tasks(id) ON DELETE CASCADE,
  tasks_solved INTEGER DEFAULT 0,
  tasks_missed INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  questions_created INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(week_number, student_id, task_id)
);

-- Leaderboard View (dynamic rankings)
CREATE VIEW Leaderboard AS
SELECT 
  u.id,
  u.name,
  u.department,
  u.email,
  COUNT(DISTINCT CASE WHEN ta.status = 'completed' THEN ta.id END) as tasks_completed,
  COUNT(DISTINCT CASE WHEN ts.score IS NOT NULL THEN ts.id END) as tests_taken,
  COALESCE(AVG(ts.score), 0) as avg_test_score,
  COUNT(DISTINCT ta.id) as total_assignments
FROM Users u
LEFT JOIN TaskAssignments ta ON u.id = ta.student_id
LEFT JOIN TestSubmissions ts ON u.id = ts.student_id
WHERE u.role = 'student'
GROUP BY u.id, u.name, u.department, u.email
ORDER BY tasks_completed DESC, avg_test_score DESC;

-- Indexes for Performance
CREATE INDEX idx_tasks_created_by ON Tasks(created_by);
CREATE INDEX idx_tasks_week_number ON Tasks(week_number);
CREATE INDEX idx_task_assignments_student ON TaskAssignments(student_id);
CREATE INDEX idx_task_assignments_task ON TaskAssignments(task_id);
CREATE INDEX idx_task_assignments_status ON TaskAssignments(status);
CREATE INDEX idx_test_submissions_student ON TestSubmissions(student_id);
CREATE INDEX idx_test_submissions_test ON TestSubmissions(test_id);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_mcq_options_task ON MCQOptions(task_id);
CREATE INDEX idx_test_questions_test ON TestQuestions(test_id);

-- Enable Row Level Security (RLS) for multi-tenancy
ALTER TABLE Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE TaskAssignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE TestSubmissions ENABLE ROW LEVEL SECURITY;
```

## Table Descriptions

### Users
- **id**: Primary key (UUID)
- **regdid**: Registration ID (unique, used for login)
- **name**: Full name
- **email**: Email address
- **password_hash**: Hashed password (bcrypt)
- **role**: 'student', 'admin', or 'super_admin'
- **department**: Department/Branch
- **profile_img**: URL to profile image
- **created_at/updated_at**: Timestamps

### Tasks
- **id**: Primary key
- **title**: Task title
- **type**: 'mcq', 'coding', or 'error'
- **difficulty**: 'easy', 'medium', or 'hard'
- **deadline**: Task deadline
- **description**: Full task description
- **created_by**: FK to Users (admin who created)
- **week_number**: Week number for archival
- **created_at/updated_at**: Timestamps

### MCQOptions
- **id**: Primary key
- **task_id**: FK to Tasks
- **option_text**: Option text
- **is_correct**: Boolean flag for correct answer

### CodingTasks
- **id**: Primary key
- **task_id**: FK to Tasks (unique)
- **concept**: Problem concept
- **leetcode_link**: External problem link

### TaskAssignments
- **id**: Primary key
- **task_id**: FK to Tasks
- **student_id**: FK to Users
- **status**: 'not_started', 'pending', 'completed', 'submitted'
- **started_at**: When student started
- **submitted_at**: When student submitted
- **answer**: JSONB for student's answer

### Tests
- **id**: Primary key
- **name**: Test name
- **duration**: Duration in minutes
- **date**: Test date/time
- **created_by**: FK to Users (admin who created)

### TestQuestions
- **id**: Primary key
- **test_id**: FK to Tests
- **question**: Question text
- **options**: JSONB with options
- **correct_answer**: Correct answer
- **type**: 'mcq', 'coding', or 'error'
- **leetcode_link**: For coding problems
- **question_number**: Question number in test

### TestSubmissions
- **id**: Primary key
- **test_id**: FK to Tests
- **student_id**: FK to Users
- **answers**: JSONB with student answers
- **score**: Test score
- **submitted_at**: Submission time

### WeeklyStats
- **id**: Primary key
- **week_number**: Week identifier
- **student_id**: FK to Users (for student stats)
- **admin_id**: FK to Users (for admin contributions)
- **task_id**: FK to Tasks (for task info)
- **tasks_solved**: Count of tasks solved
- **tasks_missed**: Count missed
- **total_completions**: Total completions
- **questions_created**: For admin contributions
- **created_at**: Timestamp

### Leaderboard (VIEW)
- Dynamic view showing rankings
- Combines task completion and test scores
- Ordered by tasks_completed and avg_test_score

## Steps to Create Schema

1. Go to Supabase Dashboard
2. Select your project
3. Click "SQL Editor"
4. Click "New Query"
5. Copy the entire SQL schema above
6. Click "Run"
7. Verify all tables are created

## Testing Data Queries

### Insert Test User
```sql
INSERT INTO Users (regdid, name, email, password_hash, role, department)
VALUES ('STU001', 'John Doe', 'john@example.com', 'hashed_password', 'student', 'CSE');
```

### Get All Students
```sql
SELECT id, name, email, department FROM Users WHERE role = 'student';
```

### Get Tasks for Current Week
```sql
SELECT * FROM Tasks WHERE week_number = 1;
```

### Get Student Task Status
```sql
SELECT ta.*, t.title, t.difficulty 
FROM TaskAssignments ta
JOIN Tasks t ON ta.task_id = t.id
WHERE ta.student_id = 'student-uuid';
```

### Get Leaderboard
```sql
SELECT * FROM Leaderboard LIMIT 10;
```

## Archival Query (Run Weekly)

```sql
-- Save weekly stats before deleting
INSERT INTO WeeklyStats (week_number, task_id, tasks_solved)
SELECT 
  week_number,
  id,
  (SELECT COUNT(*) FROM TaskAssignments 
   WHERE task_id = Tasks.id AND status = 'completed')
FROM Tasks
WHERE week_number = 1;  -- Replace with (current_week - 5)

-- Delete old tasks
DELETE FROM Tasks WHERE week_number = 1;  -- Replace with (current_week - 5)
```

## Security Notes

- All passwords are hashed with bcrypt before storing
- JWT tokens are used for API authentication
- Row Level Security (RLS) can be implemented for further security
- Sensitive data should never be exposed in API responses
- Foreign keys ensure data integrity
- Indexes optimize query performance

## Future Extensions

- Add notifications table
- Add email logs table
- Add audit logs table
- Add analytics materialized views
- Add student groups/batches table

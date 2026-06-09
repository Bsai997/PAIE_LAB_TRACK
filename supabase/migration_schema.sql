-- PAIE Cell Database Migration - New Task Schema Design
-- Run this in Supabase SQL Editor to restructure tasks table

-- ========================================
-- STEP 1: Create Type-Specific Tables
-- ========================================

-- Coding Tasks Table
CREATE TABLE IF NOT EXISTS coding_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  practice_link TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id)
);

-- MCQ Tasks Table
CREATE TABLE IF NOT EXISTS mcq_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- ["Option A", "Option B", "Option C", "Option D"]
  correct_answer INT NOT NULL, -- 0, 1, 2, or 3
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id)
);

-- Error Finding Tasks Table
CREATE TABLE IF NOT EXISTS error_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  correct_line INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id)
);

-- Algorithm Design Tasks Table
CREATE TABLE IF NOT EXISTS algorithm_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  problem_statement TEXT NOT NULL,
  input_description TEXT NOT NULL,
  output_description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id)
);

-- ========================================
-- STEP 2: Simplify Tasks Table
-- ========================================

-- Add skills column to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT;

-- Add admin_feedback and submission_status to task_submissions
ALTER TABLE task_submissions 
  ADD COLUMN IF NOT EXISTS admin_feedback TEXT,
  ADD COLUMN IF NOT EXISTS submission_status VARCHAR(50) DEFAULT 'submitted';

-- Remove old columns from tasks table (if they exist)
-- Note: Run these separately if you get "column doesn't exist" errors
ALTER TABLE tasks DROP COLUMN IF EXISTS leetcode_link CASCADE;
ALTER TABLE tasks DROP COLUMN IF EXISTS mcq_data CASCADE;
ALTER TABLE tasks DROP COLUMN IF EXISTS error_data CASCADE;

-- ========================================
-- STEP 3: Create Indexes for Performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_coding_tasks_task_id ON coding_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_mcq_tasks_task_id ON mcq_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_error_tasks_task_id ON error_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_algorithm_tasks_task_id ON algorithm_tasks(task_id);

-- ========================================
-- STEP 4: Data Migration (If applicable)
-- ========================================

-- Migrate existing MCQ data from old format (if any)
-- This is a template - adjust based on your actual data
-- INSERT INTO mcq_tasks (task_id, question, options, correct_answer)
-- SELECT id, mcq_data->>'question', mcq_data->'options', (mcq_data->>'correct_answer')::INT
-- FROM tasks WHERE type = 'mcq' AND mcq_data IS NOT NULL;

-- Migrate existing error data
-- INSERT INTO error_tasks (task_id, code, correct_line)
-- SELECT id, error_data->>'code', (error_data->>'correct_line')::INT
-- FROM tasks WHERE type = 'error' AND error_data IS NOT NULL;

-- Migrate existing coding data
-- INSERT INTO coding_tasks (task_id, practice_link)
-- SELECT id, leetcode_link
-- FROM tasks WHERE type = 'coding' AND leetcode_link IS NOT NULL;

COMMIT;

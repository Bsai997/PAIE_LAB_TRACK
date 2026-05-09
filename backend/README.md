# Student Engagement Platform - Backend

Node.js + Express + JWT + Supabase backend for the Student Engagement Platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with Supabase credentials:
   ```
   PORT=5000
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-service-role-key
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with regdid and password
- `POST /api/auth/register` - Register new user

### Student Routes
- `GET /api/student/dashboard` - Get dashboard stats
- `GET /api/student/tasks` - Get current week tasks
- `POST /api/student/tasks/:taskId/start` - Start a task
- `POST /api/student/tasks/:taskId/submit` - Submit task answer
- `GET /api/student/performance` - Get performance data
- `GET /api/student/tests` - Get available tests
- `GET /api/student/leaderboard` - Get leaderboard

### Admin Routes
- `GET /api/admin/dashboard` - Get admin dashboard
- `POST /api/admin/tasks` - Create new task
- `GET /api/admin/tasks` - Get tasks
- `GET /api/admin/tasks/:taskId/students` - Get students for a task
- `GET /api/admin/performance` - Get performance analytics
- `POST /api/admin/tests` - Create test
- `POST /api/admin/tests/:testId/questions` - Add test question

### Super Admin Routes
- `GET /api/superadmin/dashboard` - Get super admin dashboard
- `GET /api/superadmin/admins` - Get all admins
- `POST /api/superadmin/admins` - Create new admin
- `GET /api/superadmin/students` - Get all students
- `GET /api/superadmin/students/:studentId/performance` - Get student performance
- `GET /api/superadmin/tasks` - Get all tasks
- `GET /api/superadmin/tasks/:taskId/students` - Get students for task
- `POST /api/superadmin/tests` - Create test

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Cron Jobs

- Weekly cleanup runs every Sunday at midnight
- Archives old task statistics and deletes questions older than 5 weeks

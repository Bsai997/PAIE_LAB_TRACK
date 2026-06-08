# PAIE Cell — Student Engagement Platform

Full-stack role-based platform built with **React + Vite**, **Node.js + Express + JWT**, and **Supabase**.

## Features

- **Authentication**: Login with Registration ID + password; role-based auto-redirect (Student / Admin / Super Admin)
- **Student**: Tasks (MCQ, Coding, Error-finding), Performance, Timed Tests, Leaderboard
- **Admin**: Create weekly tasks, view student progress, performance charts, test management
- **Super Admin**: Member management, student monitoring, system-wide task/test control

## Project Structure

```
paie_cell/
├── backend/          # Express API + JWT auth
├── frontend/         # React + Vite SPA
└── supabase/         # Database schema + seed SQL
```

## Setup

### 1. Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `supabase/schema.sql`
3. Generate password hash and update seed users:

```bash
cd backend
npm install
node scripts/generate-seed.js
```

Copy the bcrypt hash into `supabase/schema.sql` for all seed users, then re-run the INSERT statements.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase URL, service key, JWT secret, and SMTP settings
npm install
npm run dev
```

API runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` (proxies `/api` to backend)

## Demo Credentials

| Role        | Reg ID | Password    |
|-------------|--------|-------------|
| Super Admin | SA001  | password123 |
| Admin       | AD001  | password123 |
| Student     | ST001  | password123 |

## API Routes

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Login, current user |
| `/api/student` | Student tasks, performance, tests, leaderboard |
| `/api/admin` | Admin task/test management, performance |
| `/api/superadmin` | System admin, members, monitoring |

## Image Placeholders

Dashboard cards use placeholder filenames (`task.jpg`, `performance.jpg`, etc.). Replace images in `frontend/public/` when ready.

## Email on Member Creation

When Super Admin creates a member, a welcome email is sent to `originalmail` with club mail and password. Configure SMTP in `.env` or check server console for preview when SMTP is not configured.

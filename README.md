# Student Engagement Platform

A complete, production-ready Student Engagement Platform built with React+Vite (frontend), Node.js+Express+JWT (backend), and Supabase (database).

## 📋 Project Overview

This platform manages student engagement through task assignments, performance tracking, tests, and leaderboards. It supports three roles:
- **Student**: Complete tasks, view performance, take tests, check leaderboard
- **Admin**: Create tasks, view student progress, manage tests
- **Super Admin**: System-level management of admins, students, tasks, and tests

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Supabase account

### Backend Setup

```bash
cd backend
npm install

# Create .env file with your Supabase credentials
# PORT=5000
# SUPABASE_URL=your-supabase-url
# SUPABASE_KEY=your-supabase-key
# JWT_SECRET=your-secret-key

npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`
The backend API will be at `http://localhost:5000`

## 📁 Project Structure

```
PAIE_LAB_TRACK/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── middlewares/     # Auth & validation
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Database operations
│   │   ├── utils/           # Helpers (Supabase, cron)
│   │   └── index.js         # Entry point
│   ├── package.json
│   ├── .env
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── assets/          # Images & static files
    │   ├── components/      # Reusable UI components
    │   ├── context/         # React context
    │   ├── hooks/           # Custom hooks
    │   ├── pages/           # Page components
    │   ├── routes/          # Route protection
    │   ├── services/        # API calls
    │   ├── styles/          # CSS stylesheets
    │   ├── App.jsx          # Main app
    │   └── main.jsx         # Entry point
    ├── package.json
    ├── vite.config.js
    └── README.md
```

## 🔑 Key Features

### Authentication
- JWT-based authentication
- Role-based access control
- Secure password hashing with bcrypt

### Student Dashboard
- **Tasks**: View weekly tasks, start/submit assignments
- **Performance**: Track completion rates with analytics
- **Tests**: Join available tests with timer
- **Leaderboard**: Rankings with search/filter

### Admin Dashboard
- **Task Management**: Create tasks with different types (MCQ, Coding, Error)
- **Analytics**: View student progress with charts
- **Test Management**: Create and manage tests
- **Performance Metrics**: Monitor student completion rates

### Super Admin Dashboard
- **Admin Management**: Add new admins, track contributions
- **Student Management**: View all students, detailed performance
- **System Monitoring**: Overall task and test analytics

## 📊 Database Schema

### Key Tables
- **Users** - Role-based user accounts
- **Tasks** - Task assignments with difficulty levels
- **TaskAssignments** - Student task submissions
- **Tests** - Test definitions
- **TestSubmissions** - Student test responses
- **MCQOptions** - MCQ answer options
- **CodingTasks** - Coding problem details
- **WeeklyStats** - Archived weekly statistics

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Student Routes
- `GET /api/student/dashboard` - Dashboard stats
- `GET /api/student/tasks` - Get tasks
- `POST /api/student/tasks/:taskId/submit` - Submit task
- `GET /api/student/performance` - Performance data
- `GET /api/student/tests` - Get tests
- `GET /api/student/leaderboard` - Get leaderboard

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard stats
- `POST /api/admin/tasks` - Create task
- `GET /api/admin/tasks` - Get tasks
- `GET /api/admin/performance` - Performance analytics
- `POST /api/admin/tests` - Create test

### Super Admin Routes
- `GET /api/superadmin/admins` - List admins
- `POST /api/superadmin/admins` - Add admin
- `GET /api/superadmin/students` - List students
- `GET /api/superadmin/students/:id/performance` - Student performance
- `GET /api/superadmin/tasks` - All tasks
- `POST /api/superadmin/tests` - Create test

## ⚙️ Configuration

### Environment Variables

**Backend (.env)**
```
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
JWT_SECRET=your-secret-key
NODE_ENV=development
```

**Frontend (vite.config.js)**
- Proxy configured to `http://localhost:5000`

## 🔧 Scheduled Jobs

- **Weekly Cleanup**: Every Sunday at midnight
  - Archives weekly statistics
  - Deletes tasks older than 5 weeks
  - Maintains historical data

## 🎨 UI/UX Features

- Responsive design (mobile, tablet, desktop)
- Consistent navbar with user profile
- Dashboard cards with images
- Real-time data with Chart.js graphs
- Search and filter functionality
- Form validation and error handling

## 📦 Dependencies

### Backend
- express
- @supabase/supabase-js
- jsonwebtoken
- bcrypt
- node-cron

### Frontend
- react
- react-router-dom
- axios
- chart.js
- react-chartjs-2

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy `dist/` folder to Vercel, Netlify, or any static host
```

### Backend
```bash
# Deploy to Render, Heroku, or any Node.js host
# Ensure environment variables are set in the hosting platform
```

## 📝 API Documentation

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify Supabase credentials in .env
- Check Supabase project is active
- Ensure API key has appropriate permissions

### CORS Issues
- Backend CORS is configured for localhost:3000
- Update for production URLs

### Port Conflicts
- Backend default: 5000 (change in .env)
- Frontend default: 3000 (change in vite.config.js)

## 📄 License

This project is proprietary and confidential.

## 👥 Contributors

- Development Team
- PAIE Labs

---

**For detailed setup and API documentation, see individual README files in backend/ and frontend/ folders.**

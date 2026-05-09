# API Documentation

Complete API endpoint reference for the Student Engagement Platform.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. Login
**POST** `/auth/login`

Login with registration ID and password.

**Request:**
```json
{
  "regdid": "STU001",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "student",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "department": "CSE"
  }
}
```

**Error (401):**
```json
{
  "message": "Invalid credentials"
}
```

### 2. Register
**POST** `/auth/register`

Create a new user account.

**Request:**
```json
{
  "regdid": "STU002",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "student",
  "department": "IT"
}
```

**Response (200):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "regdid": "STU002",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "student",
    "department": "IT"
  }
}
```

---

## Student Endpoints

All student endpoints require `Authorization: Bearer <token>` header and role `student`.

### 1. Get Dashboard
**GET** `/student/dashboard`

Get dashboard statistics for the current week.

**Response (200):**
```json
{
  "weekStats": {
    "submitted": 5,
    "pending": 2,
    "notSubmitted": 3
  },
  "message": "Dashboard data retrieved"
}
```

### 2. Get Tasks
**GET** `/student/tasks`

Get all tasks for the current week assigned to the student.

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Array Reversal",
      "type": "coding",
      "difficulty": "easy",
      "deadline": "2026-05-15T23:59:59Z",
      "description": "Reverse an array in place",
      "created_by_user": { "name": "Admin Name" },
      "status": "not_started"
    }
  ]
}
```

### 3. Start Task
**POST** `/student/tasks/:taskId/start`

Start a task (changes status to pending).

**URL Parameters:**
- `taskId` (UUID): Task ID

**Response (200):**
```json
{
  "message": "Task started",
  "assignment": {
    "id": "uuid",
    "status": "pending",
    "started_at": "2026-05-10T10:30:00Z"
  }
}
```

### 4. Submit Task
**POST** `/student/tasks/:taskId/submit`

Submit task answer (changes status to completed).

**URL Parameters:**
- `taskId` (UUID): Task ID

**Request:**
```json
{
  "answer": {
    "selectedOption": "option_a",
    "mcqAnswer": true
  }
}
```

**Response (200):**
```json
{
  "message": "Task submitted successfully",
  "assignment": {
    "id": "uuid",
    "status": "completed",
    "submitted_at": "2026-05-10T11:45:00Z"
  }
}
```

### 5. Get Performance
**GET** `/student/performance`

Get performance analytics including completion rates and trends.

**Response (200):**
```json
{
  "totalCompleted": 45,
  "totalNotSubmitted": 8,
  "weeklyBreakdown": [
    {
      "week_number": 1,
      "difficulty": "easy",
      "status": "completed"
    }
  ]
}
```

### 6. Get Tests
**GET** `/student/tests`

Get all available tests.

**Response (200):**
```json
{
  "tests": [
    {
      "id": "uuid",
      "name": "DSA Quiz Week 1",
      "duration": 60,
      "date": "2026-05-12T14:00:00Z"
    }
  ]
}
```

### 7. Get Leaderboard
**GET** `/student/leaderboard?search=john&sort=score`

Get student leaderboard with optional search and sort.

**Query Parameters:**
- `search` (optional): Search by name or department
- `sort` (optional): Sort field

**Response (200):**
```json
{
  "leaderboard": [
    {
      "id": "uuid",
      "name": "John Doe",
      "department": "CSE",
      "score": 950
    }
  ]
}
```

---

## Admin Endpoints

All admin endpoints require `Authorization: Bearer <token>` header and role `admin`.

### 1. Get Dashboard
**GET** `/admin/dashboard`

Get admin dashboard statistics.

**Response (200):**
```json
{
  "weekStats": {
    "allCompleted": 25,
    "notStarted": 15,
    "notSubmitted": 10
  },
  "message": "Admin dashboard data"
}
```

### 2. Create Task
**POST** `/admin/tasks`

Create a new task.

**Request:**
```json
{
  "title": "String Manipulation",
  "type": "coding",
  "difficulty": "medium",
  "deadline": "2026-05-20T23:59:59Z",
  "description": "Solve string problems on LeetCode",
  "conceptOrOptions": {
    "concept": "String Algorithms",
    "leetcodeLink": "https://leetcode.com/problems/..."
  }
}
```

**Response (201):**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "uuid",
    "title": "String Manipulation",
    "type": "coding",
    "week_number": 1
  }
}
```

### 3. Get Tasks
**GET** `/admin/tasks`

Get all tasks created by this admin for current week.

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "String Manipulation",
      "type": "coding",
      "difficulty": "medium",
      "deadline": "2026-05-20T23:59:59Z",
      "assignments": []
    }
  ]
}
```

### 4. Get Task Students
**GET** `/admin/tasks/:taskId/students`

Get all students for a specific task with their status.

**URL Parameters:**
- `taskId` (UUID): Task ID

**Response (200):**
```json
{
  "students": [
    {
      "status": "completed",
      "student": {
        "id": "uuid",
        "name": "John Doe",
        "department": "CSE"
      }
    }
  ]
}
```

### 5. Get Performance
**GET** `/admin/performance`

Get performance analytics for all students.

**Response (200):**
```json
{
  "weeklyStats": [
    {
      "week_number": 1,
      "total_completions": 25
    }
  ],
  "students": [
    {
      "id": "uuid",
      "name": "John Doe",
      "department": "CSE",
      "assignments": []
    }
  ]
}
```

### 6. Create Test
**POST** `/admin/tests`

Create a new test.

**Request:**
```json
{
  "name": "Week 1 Quiz",
  "duration": 60,
  "date": "2026-05-15T14:00:00Z"
}
```

**Response (201):**
```json
{
  "message": "Test created",
  "test": {
    "id": "uuid",
    "name": "Week 1 Quiz",
    "duration": 60
  }
}
```

### 7. Add Test Question
**POST** `/admin/tests/:testId/questions`

Add a question to a test.

**URL Parameters:**
- `testId` (UUID): Test ID

**Request:**
```json
{
  "question": "What is a binary tree?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "type": "mcq"
}
```

**Response (201):**
```json
{
  "message": "Question added",
  "testQuestion": {
    "id": "uuid",
    "test_id": "uuid",
    "question": "What is a binary tree?"
  }
}
```

---

## Super Admin Endpoints

All super admin endpoints require `Authorization: Bearer <token>` header and role `super_admin`.

### 1. Get Dashboard
**GET** `/superadmin/dashboard`

Get super admin dashboard.

**Response (200):**
```json
{
  "message": "Super Admin dashboard"
}
```

### 2. Get Admins
**GET** `/superadmin/admins`

Get all admins with their contribution stats.

**Response (200):**
```json
{
  "admins": [
    {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@example.com",
      "department": "CSE",
      "contribution": {
        "easy": 5,
        "medium": 3,
        "hard": 2
      }
    }
  ]
}
```

### 3. Create Admin
**POST** `/superadmin/admins`

Create a new admin user.

**Request:**
```json
{
  "name": "New Admin",
  "regdid": "ADM001",
  "email": "newadmin@example.com",
  "password": "password123",
  "branch": "CSE"
}
```

**Response (201):**
```json
{
  "message": "Admin created successfully",
  "admin": {
    "id": "uuid",
    "name": "New Admin",
    "role": "admin"
  }
}
```

### 4. Get Students
**GET** `/superadmin/students`

Get all students in the system.

**Response (200):**
```json
{
  "students": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "department": "CSE"
    }
  ]
}
```

### 5. Get Student Performance
**GET** `/superadmin/students/:studentId/performance`

Get detailed performance data for a specific student.

**URL Parameters:**
- `studentId` (UUID): Student ID

**Response (200):**
```json
{
  "student": {
    "id": "uuid",
    "name": "John Doe",
    "department": "CSE"
  },
  "weeklyStats": {
    "1": {
      "easy": 3,
      "medium": 2,
      "hard": 1,
      "notCompleted": 1,
      "total": 7
    }
  }
}
```

### 6. Get All Tasks
**GET** `/superadmin/tasks`

Get all tasks across the system.

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Task Title",
      "difficulty": "medium",
      "deadline": "2026-05-20T23:59:59Z",
      "created_by_user": { "name": "Admin Name" },
      "totalSubmissions": 45,
      "completed": 38
    }
  ]
}
```

### 7. Get Task Students
**GET** `/superadmin/tasks/:taskId/students?status=completed`

Get students for a task with optional status filter.

**URL Parameters:**
- `taskId` (UUID): Task ID

**Query Parameters:**
- `status` (optional): Filter by status (not_started, pending, completed, submitted)

**Response (200):**
```json
{
  "students": [
    {
      "status": "completed",
      "student": {
        "id": "uuid",
        "name": "John Doe",
        "department": "CSE"
      }
    }
  ]
}
```

### 8. Create Test
**POST** `/superadmin/tests`

Create a new test.

**Request:**
```json
{
  "name": "System-wide Quiz",
  "duration": 90,
  "date": "2026-05-25T10:00:00Z"
}
```

**Response (201):**
```json
{
  "message": "Test created",
  "test": {
    "id": "uuid",
    "name": "System-wide Quiz"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden: Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal error |

---

## Common Patterns

### Pagination
Not implemented in v1, but can be added:
```
GET /api/resource?page=1&limit=10
```

### Filtering
```
GET /api/resource?status=completed&difficulty=hard
```

### Sorting
```
GET /api/resource?sort=created_at&order=desc
```

### Search
```
GET /api/resource?search=keyword
```

---

## Rate Limiting
Currently no rate limiting. Implement based on your requirements.

---

## CORS
Frontend is whitelisted to localhost:3000 in development.
Update for production deployment.

---

## Caching
Implement Redis/in-memory caching for frequently accessed data:
- Dashboard stats
- Leaderboard rankings
- User profiles

---

## Versioning
Current API version: v1
Future versions will be prefixed: `/api/v2/`

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"regdid":"STU001","password":"password123"}'
```

### Get Dashboard (with token)
```bash
curl -X GET http://localhost:5000/api/student/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/admin/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Task","type":"mcq","difficulty":"easy","deadline":"2026-05-20T23:59:59Z","description":"Test"}'
```

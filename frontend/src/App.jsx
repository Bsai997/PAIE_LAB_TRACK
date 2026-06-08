import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentTasks from './pages/student/StudentTasks';
import TaskMCQ from './pages/student/TaskMCQ';
import TaskCoding from './pages/student/TaskCoding';
import TaskError from './pages/student/TaskError';
import StudentPerformance from './pages/student/StudentPerformance';
import StudentTests from './pages/student/StudentTests';
import TakeTest from './pages/student/TakeTest';
import Leaderboard from './pages/shared/Leaderboard';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTasks from './pages/admin/AdminTasks';
import AdminTaskStudents from './pages/admin/AdminTaskStudents';
import AdminPerformance from './pages/admin/AdminPerformance';
import AdminTests from './pages/admin/AdminTests';

import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminAdmins from './pages/superadmin/SuperAdminAdmins';
import SuperAdminStudents from './pages/superadmin/SuperAdminStudents';
import SuperAdminStudentPerformance from './pages/superadmin/SuperAdminStudentPerformance';
import SuperAdminTasks from './pages/superadmin/SuperAdminTasks';
import SuperAdminTaskStudents from './pages/superadmin/SuperAdminTaskStudents';
import SuperAdminTests from './pages/superadmin/SuperAdminTests';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/superadmin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/tasks" element={<ProtectedRoute roles={['student']}><StudentTasks /></ProtectedRoute>} />
          <Route path="/student/tasks/:id/mcq" element={<ProtectedRoute roles={['student']}><TaskMCQ /></ProtectedRoute>} />
          <Route path="/student/tasks/:id/coding" element={<ProtectedRoute roles={['student']}><TaskCoding /></ProtectedRoute>} />
          <Route path="/student/tasks/:id/error" element={<ProtectedRoute roles={['student']}><TaskError /></ProtectedRoute>} />
          <Route path="/student/performance" element={<ProtectedRoute roles={['student']}><StudentPerformance /></ProtectedRoute>} />
          <Route path="/student/tests" element={<ProtectedRoute roles={['student']}><StudentTests /></ProtectedRoute>} />
          <Route path="/student/tests/:id/take" element={<ProtectedRoute roles={['student']}><TakeTest /></ProtectedRoute>} />
          <Route path="/student/leaderboard" element={<ProtectedRoute roles={['student']}><Leaderboard apiPath="/student/leaderboard" /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/tasks" element={<ProtectedRoute roles={['admin']}><AdminTasks /></ProtectedRoute>} />
          <Route path="/admin/tasks/:id/students" element={<ProtectedRoute roles={['admin']}><AdminTaskStudents /></ProtectedRoute>} />
          <Route path="/admin/performance" element={<ProtectedRoute roles={['admin']}><AdminPerformance /></ProtectedRoute>} />
          <Route path="/admin/tests" element={<ProtectedRoute roles={['admin']}><AdminTests /></ProtectedRoute>} />
          <Route path="/admin/leaderboard" element={<ProtectedRoute roles={['admin']}><Leaderboard apiPath="/admin/leaderboard" /></ProtectedRoute>} />

          <Route path="/superadmin" element={<ProtectedRoute roles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/superadmin/admins" element={<ProtectedRoute roles={['super_admin']}><SuperAdminAdmins /></ProtectedRoute>} />
          <Route path="/superadmin/students" element={<ProtectedRoute roles={['super_admin']}><SuperAdminStudents /></ProtectedRoute>} />
          <Route path="/superadmin/students/:id/performance" element={<ProtectedRoute roles={['super_admin']}><SuperAdminStudentPerformance /></ProtectedRoute>} />
          <Route path="/superadmin/tasks" element={<ProtectedRoute roles={['super_admin']}><SuperAdminTasks /></ProtectedRoute>} />
          <Route path="/superadmin/tasks/:id/students" element={<ProtectedRoute roles={['super_admin']}><SuperAdminTaskStudents /></ProtectedRoute>} />
          <Route path="/superadmin/tests" element={<ProtectedRoute roles={['super_admin']}><SuperAdminTests /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

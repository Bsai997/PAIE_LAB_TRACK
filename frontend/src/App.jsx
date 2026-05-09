import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Login from './pages/Login';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentTasks from './pages/student/Tasks';
import StudentPerformance from './pages/student/Performance';
import StudentTests from './pages/student/Tests';
import StudentLeaderboard from './pages/student/Leaderboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTasks from './pages/admin/Tasks';
import AdminPerformance from './pages/admin/Performance';
import AdminTests from './pages/admin/Tests';
import AdminLeaderboard from './pages/admin/Leaderboard';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import SuperAdminAdmins from './pages/superadmin/Admins';
import SuperAdminStudents from './pages/superadmin/Students';
import StudentPerfPage from './pages/superadmin/StudentPerformance';
import SuperAdminTasks from './pages/superadmin/Tasks';
import SuperAdminTests from './pages/superadmin/Tests';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/tasks" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentTasks />
            </ProtectedRoute>
          } />
          <Route path="/student/performance" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentPerformance />
            </ProtectedRoute>
          } />
          <Route path="/student/tests" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentTests />
            </ProtectedRoute>
          } />
          <Route path="/student/leaderboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLeaderboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/tasks" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTasks />
            </ProtectedRoute>
          } />
          <Route path="/admin/performance" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPerformance />
            </ProtectedRoute>
          } />
          <Route path="/admin/tests" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTests />
            </ProtectedRoute>
          } />
          <Route path="/admin/leaderboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLeaderboard />
            </ProtectedRoute>
          } />

          {/* Super Admin Routes */}
          <Route path="/superadmin" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/superadmin/admins" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminAdmins />
            </ProtectedRoute>
          } />
          <Route path="/superadmin/students" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminStudents />
            </ProtectedRoute>
          } />
          <Route path="/superadmin/students/:studentId/performance" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <StudentPerfPage />
            </ProtectedRoute>
          } />
          <Route path="/superadmin/tasks" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminTasks />
            </ProtectedRoute>
          } />
          <Route path="/superadmin/tests" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminTests />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

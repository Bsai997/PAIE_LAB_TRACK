import { BrowserRouter, Routes, Route, Navigate, Suspense } from 'react-router-dom';
import { lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

// OPTIMIZED: Lazy load all route components to reduce initial bundle size
// Critical pages loaded immediately
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import Leaderboard from './pages/shared/Leaderboard';

// Lazy loaded pages
const StudentTasks = lazy(() => import('./pages/student/StudentTasks'));
const TaskMCQ = lazy(() => import('./pages/student/TaskMCQ'));
const TaskCoding = lazy(() => import('./pages/student/TaskCoding'));
const TaskError = lazy(() => import('./pages/student/TaskError'));
const SubmitAlgorithm = lazy(() => import('./pages/student/SubmitAlgorithm'));
const StudentPerformance = lazy(() => import('./pages/student/StudentPerformance'));
const StudentTests = lazy(() => import('./pages/student/StudentTests'));
const TakeTest = lazy(() => import('./pages/student/TakeTest'));

const AdminTasks = lazy(() => import('./pages/admin/AdminTasks'));
const AdminTaskStudents = lazy(() => import('./pages/admin/AdminTaskStudents'));
const AdminPerformance = lazy(() => import('./pages/admin/AdminPerformance'));
const AdminTests = lazy(() => import('./pages/admin/AdminTests'));

const SuperAdminAdmins = lazy(() => import('./pages/superadmin/SuperAdminAdmins'));
const SuperAdminStudents = lazy(() => import('./pages/superadmin/SuperAdminStudents'));
const SuperAdminStudentPerformance = lazy(() => import('./pages/superadmin/SuperAdminStudentPerformance'));
const SuperAdminTasks = lazy(() => import('./pages/superadmin/SuperAdminTasks'));
const SuperAdminTaskStudents = lazy(() => import('./pages/superadmin/SuperAdminTaskStudents'));
const SuperAdminTests = lazy(() => import('./pages/superadmin/SuperAdminTests'));

// Loading component
function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading...</p>
    </div>
  );
}

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
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RootRedirect />} />

              <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/tasks" element={<ProtectedRoute roles={['student']}><StudentTasks /></ProtectedRoute>} />
              <Route path="/student/tasks/:id/mcq" element={<ProtectedRoute roles={['student']}><TaskMCQ /></ProtectedRoute>} />
              <Route path="/student/tasks/:id/coding" element={<ProtectedRoute roles={['student']}><TaskCoding /></ProtectedRoute>} />
              <Route path="/student/tasks/:id/error" element={<ProtectedRoute roles={['student']}><TaskError /></ProtectedRoute>} />
              <Route path="/student/tasks/:id/algorithm" element={<ProtectedRoute roles={['student']}><SubmitAlgorithm /></ProtectedRoute>} />
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
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getSuperAdminDashboard,
  getAdminList,
  createAdmin,
  getStudentList,
  getStudentPerformance,
  getAllTasks,
  getTaskStudents,
  createTest
} from '../controllers/superAdminController.js';

const router = express.Router();

router.get('/dashboard', authenticate, authorize(['super_admin']), getSuperAdminDashboard);
router.get('/admins', authenticate, authorize(['super_admin']), getAdminList);
router.post('/admins', authenticate, authorize(['super_admin']), createAdmin);
router.get('/students', authenticate, authorize(['super_admin']), getStudentList);
router.get('/students/:studentId/performance', authenticate, authorize(['super_admin']), getStudentPerformance);
router.get('/tasks', authenticate, authorize(['super_admin']), getAllTasks);
router.get('/tasks/:taskId/students', authenticate, authorize(['super_admin']), getTaskStudents);
router.post('/tests', authenticate, authorize(['super_admin']), createTest);

export default router;

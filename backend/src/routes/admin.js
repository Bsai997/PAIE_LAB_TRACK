import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getAdminDashboard,
  createTask,
  getAdminTasks,
  getTaskStudents,
  getAdminPerformance,
  createTest,
  addTestQuestion
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/dashboard', authenticate, authorize(['admin']), getAdminDashboard);
router.post('/tasks', authenticate, authorize(['admin']), createTask);
router.get('/tasks', authenticate, authorize(['admin']), getAdminTasks);
router.get('/tasks/:taskId/students', authenticate, authorize(['admin']), getTaskStudents);
router.get('/performance', authenticate, authorize(['admin']), getAdminPerformance);
router.post('/tests', authenticate, authorize(['admin']), createTest);
router.post('/tests/:testId/questions', authenticate, authorize(['admin']), addTestQuestion);

export default router;

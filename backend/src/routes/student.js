import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getStudentDashboard,
  getStudentTasks,
  startTask,
  submitTask,
  getPerformance,
  getTests,
  getLeaderboard
} from '../controllers/studentController.js';

const router = express.Router();

router.get('/dashboard', authenticate, authorize(['student']), getStudentDashboard);
router.get('/tasks', authenticate, authorize(['student']), getStudentTasks);
router.post('/tasks/:taskId/start', authenticate, authorize(['student']), startTask);
router.post('/tasks/:taskId/submit', authenticate, authorize(['student']), submitTask);
router.get('/performance', authenticate, authorize(['student']), getPerformance);
router.get('/tests', authenticate, authorize(['student']), getTests);
router.get('/leaderboard', authenticate, authorize(['student']), getLeaderboard);

export default router;

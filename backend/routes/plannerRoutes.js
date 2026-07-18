import express from 'express';
import {
  generatePlan,
  getPlanner,
  getDailySchedules,
  updateDailyTaskStatus,
  updateTopicStatus,
  addCustomTopic,
  updateSpacedRepetitionStatus,
  deleteTopic,
  addSubject,
  deleteSubject
} from '../controllers/plannerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generatePlan);

router.get('/current', protect, getPlanner);
router.get('/schedules', protect, getDailySchedules);
router.patch('/schedules/:scheduleId/tasks/:taskId', protect, updateDailyTaskStatus);
router.patch('/topics/:topicId', protect, updateTopicStatus);
router.post('/topics', protect, addCustomTopic);
router.delete('/topics/:topicId', protect, deleteTopic);
router.post('/subjects', protect, addSubject);
router.delete('/subjects/:subjectName', protect, deleteSubject);
router.patch('/spaced-repetition/:srId', protect, updateSpacedRepetitionStatus);

export default router;

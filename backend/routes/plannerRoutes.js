import express from 'express';
import {
  generatePlan,
  getPlanner,
  getDailySchedules,
  updateDailyTaskStatus,
  updateTopicStatus,
  addCustomTopic,
  updateSpacedRepetitionStatus,
  upload,
  handleUploadSyllabus,
  handleUploadPYQ,
  generateStandardSyllabusEndpoint
} from '../controllers/plannerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generatePlan);
router.post('/upload-syllabus', protect, upload.single('file'), handleUploadSyllabus);
router.post('/upload-pyq', protect, upload.single('file'), handleUploadPYQ);
router.post('/generate-standard-syllabus', protect, generateStandardSyllabusEndpoint);

router.get('/current', protect, getPlanner);
router.get('/schedules', protect, getDailySchedules);
router.patch('/schedules/:scheduleId/tasks/:taskId', protect, updateDailyTaskStatus);
router.patch('/topics/:topicId', protect, updateTopicStatus);
router.post('/topics', protect, addCustomTopic);
router.patch('/spaced-repetition/:srId', protect, updateSpacedRepetitionStatus);

export default router;

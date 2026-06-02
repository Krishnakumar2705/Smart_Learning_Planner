import express from 'express';
import { getWeeklyReport, getAIRecommendationsController } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/report', protect, getWeeklyReport);
router.get('/recommendations', protect, getAIRecommendationsController);

export default router;

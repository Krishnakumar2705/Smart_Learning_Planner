import express from 'express';
import { dailyCheckIn } from '../controllers/gamificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/check-in', protect, dailyCheckIn);

export default router;

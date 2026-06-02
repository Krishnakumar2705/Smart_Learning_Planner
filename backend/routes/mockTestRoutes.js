import express from 'express';
import { generateMockTest, getMockTests } from '../controllers/mockTestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateMockTest);
router.get('/', protect, getMockTests);

export default router;

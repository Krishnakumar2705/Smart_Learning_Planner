import express from 'express';
import { syncUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/sync', protect, syncUser);       // sync Clerk user into MongoDB after login
router.get('/profile', protect, getUserProfile); // get user profile

export default router;

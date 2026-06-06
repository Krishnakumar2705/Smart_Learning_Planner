import User from '../models/User.js';
import mongoose from 'mongoose';

const isConnected = () => mongoose.connection.readyState === 1;

// POST /api/gamification/check-in
export const dailyCheckIn = async (req, res) => {
  try {
    if (!isConnected()) {
      return res.status(200).json({ message: 'Offline mode: check-in simulated', streakDays: 1, achievements: [] });
    }

    // req.user._id is the Clerk ID (payload.sub)
    const user = await User.findOne({ clerkId: req.user._id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);

    let isNewDay = false;

    if (!lastDate) {
      user.streakDays = 1;
      user.xp = (user.xp || 0) + 50;
      isNewDay = true;
    } else {
      const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) { user.streakDays += 1; user.xp += 50; isNewDay = true; }
      else if (diffDays > 1) { user.streakDays = 1; user.xp += 50; isNewDay = true; }
    }

    const newAchievements = [];
    if (!user.achievements.includes('First Check-In')) {
      user.achievements.push('First Check-In');
      newAchievements.push('First Check-In');
    }
    if (user.streakDays >= 7 && !user.achievements.includes('7 Day Streak')) {
      user.achievements.push('7 Day Streak');
      newAchievements.push('7 Day Streak');
    }

    // Level up logic
    if (user.xp >= 600 && user.level < 4) { user.level = 4; user.title = 'Master'; }
    else if (user.xp >= 300 && user.level < 3) { user.level = 3; user.title = 'Scholar'; }
    else if (user.xp >= 100 && user.level < 2) { user.level = 2; user.title = 'Learner'; }

    if (isNewDay) {
      user.lastStudyDate = new Date();
      await user.save();
    }

    res.json({
      success: true,
      streakDays: user.streakDays,
      achievements: user.achievements,
      newAchievements,
      xp: user.xp,
      level: user.level,
      title: user.title,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Failed to process check-in', error: error.message });
  }
};

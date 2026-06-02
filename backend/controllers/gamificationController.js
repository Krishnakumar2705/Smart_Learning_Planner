import User from '../models/User.js';
import mongoose from 'mongoose';

// Check if MongoDB is connected
const isConnected = () => mongoose.connection.readyState === 1;

// @desc    Update daily check-in (streak and achievements)
// @route   POST /api/gamification/check-in
// @access  Private
export const dailyCheckIn = async (req, res) => {
  try {
    if (!isConnected()) {
      return res.status(200).json({ 
        message: 'Offline mode: check-in simulated',
        streakDays: 1,
        achievements: []
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStudyDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
    if (lastStudyDate) {
      lastStudyDate.setHours(0, 0, 0, 0);
    }

    let isNewDay = false;

    const checkLevelUp = (user) => {
      if (user.xp >= 600 && user.level < 4) { user.level = 4; user.title = 'Master'; }
      else if (user.xp >= 300 && user.level < 3) { user.level = 3; user.title = 'Scholar'; }
      else if (user.xp >= 100 && user.level < 2) { user.level = 2; user.title = 'Learner'; }
    };

    if (!lastStudyDate) {
      // First check-in
      user.streakDays = 1;
      user.xp = (user.xp || 0) + 50;
      isNewDay = true;
    } else {
      const diffTime = Math.abs(today - lastStudyDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Checked in yesterday
        user.streakDays += 1;
        user.xp = (user.xp || 0) + 50;
        isNewDay = true;
      } else if (diffDays > 1) {
        // Streak broken
        user.streakDays = 1;
        user.xp = (user.xp || 0) + 50;
        isNewDay = true;
      }
    }

    // Achievements logic
    const newAchievements = [];
    if (!user.achievements.includes("First Plan Created")) {
      user.achievements.push("First Plan Created");
      newAchievements.push("First Plan Created");
    }
    
    if (user.streakDays >= 7 && !user.achievements.includes("7 Day Streak")) {
      user.achievements.push("7 Day Streak");
      newAchievements.push("7 Day Streak");
    }

    if (isNewDay) {
      checkLevelUp(user);
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
      title: user.title
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Failed to process check-in', error: error.message });
  }
};

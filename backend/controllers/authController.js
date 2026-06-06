import User from '../models/User.js';
import mongoose from 'mongoose';

const isConnected = () => mongoose.connection.readyState === 1;

// Called after Clerk sign-in to sync user into our MongoDB
// POST /api/auth/sync
export const syncUser = async (req, res) => {
  try {
    const { clerkId, username, email, avatar } = req.body;

    if (!clerkId) {
      return res.status(400).json({ message: 'clerkId is required' });
    }

    if (isConnected()) {
      // Find or create user in our DB using their Clerk ID
      let user = await User.findOne({ clerkId });

      if (!user) {
        user = await User.create({ clerkId, username, email, avatar });
      } else {
        // Update profile info in case it changed in Clerk
        user.username = username || user.username;
        user.email = email || user.email;
        user.avatar = avatar || user.avatar;
        await user.save();
      }

      return res.json({
        _id: user._id,
        clerkId: user.clerkId,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      });
    } else {
      // Offline mode — return a mock profile
      return res.json({
        _id: clerkId,
        clerkId,
        username: username || 'Learner',
        email: email || '',
        avatar: avatar || '',
      });
    }
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/auth/profile
export const getUserProfile = async (req, res) => {
  try {
    const clerkId = req.user._id; // set by authMiddleware (payload.sub)

    if (isConnected()) {
      const user = await User.findOne({ clerkId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({
        _id: user._id,
        clerkId: user.clerkId,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      });
    } else {
      return res.json({ _id: clerkId, clerkId, username: 'Learner', email: '', avatar: '' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

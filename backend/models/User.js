import mongoose from 'mongoose';

// Clerk handles all auth — we only store app-specific data here
const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    trim: true,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Gamification
  streakDays: { type: Number, default: 0 },
  lastStudyDate: { type: Date },
  achievements: { type: [String], default: [] },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  title: { type: String, default: 'Beginner' },
});

const User = mongoose.model('User', UserSchema);
export default User;

import mongoose from 'mongoose';

const StudyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  examDate: {
    type: Date,
    required: true,
  },
  goal: {
    type: String,
    required: true,
  },
  subjects: {
    type: [String],
    required: true,
  },
  weakSubjects: {
    type: [String],
    default: [],
  },
  dailyHours: {
    type: Number,
    required: true,
  },
  prepLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StudyPlan = mongoose.model('StudyPlan', StudyPlanSchema);
export default StudyPlan;

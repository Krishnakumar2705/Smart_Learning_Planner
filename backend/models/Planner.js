import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    default: 'General',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  completedAt: {
    type: Date,
  }
});

const SpacedRepetitionSchema = new mongoose.Schema({
  revisionNumber: {
    type: Number, // 1, 2, 3, 4
    required: true,
  },
  revisionName: {
    type: String, // "Revision 1 (1 Day)", etc.
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  topicName: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  }
});

const PlannerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  examDate: {
    type: Date,
    required: [true, 'Please select an exam date'],
  },
  goal: {
    type: String,
    required: [true, 'Please define a goal'],
    trim: true,
  },
  subjects: {
    type: [String],
    required: [true, 'Please add at least one subject'],
  },
  weakSubjects: {
    type: [String],
    default: [],
  },
  dailyHours: {
    type: Number,
    required: [true, 'Please specify daily study hours'],
    min: [1, 'Study time must be at least 1 hour daily'],
    max: [24, 'Study time cannot exceed 24 hours'],
  },
  prepLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  aiRecommendation: {
    type: String,
  },
  topics: [TopicSchema],
  spacedRepetition: [SpacedRepetitionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Planner = mongoose.model('Planner', PlannerSchema);
export default Planner;

import mongoose from 'mongoose';

const TaskItemSchema = new mongoose.Schema({
  timeSlot: {
    type: String, // e.g., "06:00 PM - 07:00 PM"
    required: true,
  },
  taskName: {
    type: String, // e.g., "DSA Practice - Trees"
    required: true,
  },
  subject: {
    type: String, // e.g., "DSA"
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  durationHours: {
    type: Number,
    default: 1,
  }
});

const DailyScheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Planner',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  tasks: [TaskItemSchema],
  isDayCompleted: {
    type: Boolean,
    default: false,
  },
  studyHoursLogged: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Calculate study hours logged dynamically if tasks completed
DailyScheduleSchema.pre('save', function(next) {
  if (this.tasks && this.tasks.length > 0) {
    const allCompleted = this.tasks.every(t => t.isCompleted);
    this.isDayCompleted = allCompleted;
    
    // Log hours of completed tasks
    this.studyHoursLogged = this.tasks
      .filter(t => t.isCompleted)
      .reduce((sum, t) => sum + (t.durationHours || 1), 0);
  }
  next();
});

const DailySchedule = mongoose.model('DailySchedule', DailyScheduleSchema);
export default DailySchedule;

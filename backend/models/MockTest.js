import mongoose from 'mongoose';

const MCQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: String, required: true }
});

const MockTestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  mcqs: {
    type: [MCQSchema],
    default: []
  },
  shortQuestions: {
    type: [String],
    default: []
  },
  longQuestions: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MockTest = mongoose.model('MockTest', MockTestSchema);
export default MockTest;

import MockTest from '../models/MockTest.js';
import User from '../models/User.js';
import Planner from '../models/Planner.js';
import { generateAIMockTest } from '../services/aiService.js';
import mongoose from 'mongoose';

const isConnected = () => mongoose.connection.readyState === 1;
let MOCK_TESTS_DB = [];

const resolveUserId = async (clerkId) => {
  if (!isConnected()) return clerkId;
  const user = await User.findOne({ clerkId });
  return user ? user._id : clerkId;
};

// POST /api/mock-test/generate
export const generateMockTest = async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) return res.status(400).json({ message: 'Subject is required' });

    const userId = await resolveUserId(req.user._id);

    let syllabusText = 'General topics';
    if (isConnected()) {
      const planner = await Planner.findOne({ user: userId });
      if (planner?.topics?.length > 0) {
        const subjectTopics = planner.topics.filter(t => t.subject === subject);
        if (subjectTopics.length > 0) {
          syllabusText = subjectTopics.map(t => `- ${t.unit}: ${t.name}`).join('\n');
        }
      }
    }

    const testData = await generateAIMockTest(subject, syllabusText);

    if (isConnected()) {
      const mockTest = await MockTest.create({
        user: userId,
        subject,
        mcqs: testData.mcqs || [],
        shortQuestions: testData.shortQuestions || [],
        longQuestions: testData.longQuestions || [],
      });
      return res.status(201).json({ success: true, mockTest });
    } else {
      const mockTest = {
        _id: `mocktest_${Date.now()}`,
        user: userId,
        subject,
        mcqs: testData.mcqs || [],
        shortQuestions: testData.shortQuestions || [],
        longQuestions: testData.longQuestions || [],
        createdAt: new Date(),
      };
      MOCK_TESTS_DB.push(mockTest);
      return res.status(201).json({ success: true, mockTest });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate mock test', error: error.message });
  }
};

// GET /api/mock-test
export const getMockTests = async (req, res) => {
  try {
    const userId = await resolveUserId(req.user._id);
    if (isConnected()) {
      const tests = await MockTest.find({ user: userId }).sort({ createdAt: -1 });
      return res.json(tests);
    } else {
      return res.json(MOCK_TESTS_DB.filter(t => t.user === userId));
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve mock tests', error: error.message });
  }
};

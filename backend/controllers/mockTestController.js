import MockTest from '../models/MockTest.js';
import { generateAIMockTest } from '../services/aiService.js';
import mongoose from 'mongoose';

// Check if MongoDB is connected
const isConnected = () => mongoose.connection.readyState === 1;

// In-Memory Database Simulator for Mock Tests
let MOCK_TESTS_DB = [];

// @desc    Generate and save a new mock test
// @route   POST /api/mock-test/generate
// @access  Private
export const generateMockTest = async (req, res) => {
  try {
    const { subject } = req.body;
    
    if (!subject) {
      return res.status(400).json({ message: 'Subject is required' });
    }

    const testData = await generateAIMockTest(subject);

    if (isConnected()) {
      const mockTest = await MockTest.create({
        user: req.user._id,
        subject,
        mcqs: testData.mcqs || [],
        shortQuestions: testData.shortQuestions || [],
        longQuestions: testData.longQuestions || []
      });

      res.status(201).json({ success: true, mockTest });
    } else {
      const mockTest = {
        _id: `mocktest_${Math.floor(1000 + Math.random() * 9000)}`,
        user: req.user._id.toString(),
        subject,
        mcqs: testData.mcqs || [],
        shortQuestions: testData.shortQuestions || [],
        longQuestions: testData.longQuestions || [],
        createdAt: new Date()
      };
      MOCK_TESTS_DB.push(mockTest);
      res.status(201).json({ success: true, mockTest });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate mock test', error: error.message });
  }
};

// @desc    Get all saved mock tests for user
// @route   GET /api/mock-test
// @access  Private
export const getMockTests = async (req, res) => {
  try {
    if (isConnected()) {
      const tests = await MockTest.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json(tests);
    } else {
      const tests = MOCK_TESTS_DB.filter(t => t.user === req.user._id.toString());
      res.json(tests);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve mock tests', error: error.message });
  }
};

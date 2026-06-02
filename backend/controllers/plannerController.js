import Planner from '../models/Planner.js';
import DailySchedule from '../models/DailySchedule.js';
import { generateAISchedule, extractSyllabusFromPDF, analyzePYQ, generateStandardSyllabus as genStdSyllabus } from '../services/aiService.js';
import mongoose from 'mongoose';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const storage = multer.memoryStorage();
export const upload = multer({ storage });

// In-Memory Database Simulator for Planners
let MOCK_PLANNER_DB = null;
let MOCK_DAILY_SCHEDULES_DB = [];

// Check if MongoDB is connected
const isConnected = () => mongoose.connection.readyState === 1;

// @desc    Generate a new study planner & schedules
// @route   POST /api/planner/generate
// @access  Private
export const generatePlan = async (req, res) => {
  try {
    const { examDate, goal, subjects, weakSubjects, dailyHours, prepLevel, topics } = req.body;
    const userId = req.user._id;

    if (!examDate || !goal || !subjects || subjects.length === 0 || !dailyHours) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    console.log('Generating study plan structure (using Gemini or Fallback)...');
    
    let generatedData;
    if (topics && topics.length > 0) {
      // If topics are already provided, we just need the AI to create schedule
      generatedData = await generateAISchedule({
        examDate,
        goal,
        subjects,
        weakSubjects,
        dailyHours: Number(dailyHours),
        prepLevel,
        providedTopics: topics
      });
    } else {
      generatedData = await generateAISchedule({
        examDate,
        goal,
        subjects,
        weakSubjects,
        dailyHours: Number(dailyHours),
        prepLevel
      });
    }

    if (isConnected()) {
      // Clear existing records
      await Planner.deleteMany({ user: userId });
      await DailySchedule.deleteMany({ user: userId });

      // Create Planner model in DB
      const planner = await Planner.create({
        user: userId,
        examDate: new Date(examDate),
        goal,
        subjects,
        weakSubjects: weakSubjects || [],
        dailyHours: Number(dailyHours),
        prepLevel: prepLevel || 'Intermediate',
        aiRecommendation: generatedData.aiRecommendation || '',
        topics: (topics && topics.length > 0 ? topics : generatedData.topics).map(t => ({
          name: t.name || t.topic,
          subject: t.subject || (subjects.length === 1 ? subjects[0] : 'General'),
          unit: t.unit || 'General',
          isCompleted: false,
          priority: t.priority || 'Medium'
        })),
        spacedRepetition: generatedData.spacedRepetition.map(sr => ({
          revisionNumber: sr.revisionNumber,
          revisionName: sr.revisionName,
          date: new Date(sr.date),
          topicName: sr.topicName,
          subject: sr.subject,
          isCompleted: false
        }))
      });

      // Save Daily Schedules
      const dailySchedulesToSave = generatedData.dailySchedules.map(ds => ({
        user: userId,
        planner: planner._id,
        date: new Date(ds.date),
        tasks: ds.tasks.map(task => ({
          timeSlot: task.timeSlot,
          taskName: task.taskName,
          subject: task.subject,
          isCompleted: false,
          durationHours: Number(task.durationHours) || 1
        }))
      }));

      const savedSchedules = await DailySchedule.insertMany(dailySchedulesToSave);

      return res.status(201).json({
        success: true,
        planner,
        dailySchedules: savedSchedules
      });
    } else {
      // OFFLINE MODE: In-Memory Database Simulator
      console.log('Writing study planner into memory caches (Offline Mode)...');
      
      const plannerId = new mongoose.Types.ObjectId().toString();
      
      MOCK_PLANNER_DB = {
        _id: plannerId,
        user: userId.toString(),
        examDate: new Date(examDate),
        goal,
        subjects,
        weakSubjects: weakSubjects || [],
        dailyHours: Number(dailyHours),
        prepLevel: prepLevel || 'Intermediate',
        aiRecommendation: generatedData.aiRecommendation || '',
        topics: (topics && topics.length > 0 ? topics : generatedData.topics).map((t, idx) => ({
          _id: `t_${idx}_${Math.floor(1000 + Math.random() * 9000)}`,
          name: t.name || t.topic,
          subject: t.subject || (subjects.length === 1 ? subjects[0] : 'General'),
          unit: t.unit || 'General',
          isCompleted: false,
          priority: t.priority || 'Medium'
        })),
        spacedRepetition: generatedData.spacedRepetition.map((sr, idx) => ({
          _id: `sr_${idx}_${Math.floor(1000 + Math.random() * 9000)}`,
          revisionNumber: sr.revisionNumber,
          revisionName: sr.revisionName,
          date: new Date(sr.date),
          topicName: sr.topicName,
          subject: sr.subject,
          isCompleted: false
        })),
        createdAt: new Date()
      };

      MOCK_DAILY_SCHEDULES_DB = generatedData.dailySchedules.map((ds, idx) => ({
        _id: `sched_${idx}_${Math.floor(1000 + Math.random() * 9000)}`,
        user: userId.toString(),
        planner: plannerId,
        date: new Date(ds.date),
        tasks: ds.tasks.map((task, tIdx) => ({
          _id: `task_${idx}_${tIdx}_${Math.floor(1000 + Math.random() * 9000)}`,
          timeSlot: task.timeSlot,
          taskName: task.taskName,
          subject: task.subject,
          isCompleted: false,
          durationHours: Number(task.durationHours) || 1
        })),
        isDayCompleted: false,
        studyHoursLogged: 0,
        createdAt: new Date()
      }));

      return res.status(201).json({
        success: true,
        planner: MOCK_PLANNER_DB,
        dailySchedules: MOCK_DAILY_SCHEDULES_DB
      });
    }
  } catch (error) {
    console.error('Plan Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate study plan', error: error.message });
  }
};

// @desc    Get active planner details
// @route   GET /api/planner/current
// @access  Private
export const getPlanner = async (req, res) => {
  try {
    if (isConnected()) {
      const planner = await Planner.findOne({ user: req.user._id });
      if (!planner) {
        return res.status(404).json({ message: 'No active study planner found. Please generate one.' });
      }
      return res.json(planner);
    } else {
      // OFFLINE MODE
      if (!MOCK_PLANNER_DB) {
        return res.status(404).json({ message: 'No active study planner found. Please generate one.' });
      }
      return res.json(MOCK_PLANNER_DB);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve planner info', error: error.message });
  }
};

// @desc    Get active daily schedules (next 7 days)
// @route   GET /api/planner/schedules
// @access  Private
export const getDailySchedules = async (req, res) => {
  try {
    if (isConnected()) {
      const schedules = await DailySchedule.find({ user: req.user._id }).sort({ date: 1 });
      return res.json(schedules);
    } else {
      // OFFLINE MODE
      return res.json(MOCK_DAILY_SCHEDULES_DB);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve daily schedules', error: error.message });
  }
};

// @desc    Toggle completion of a task in a daily schedule
// @route   PATCH /api/planner/schedules/:scheduleId/tasks/:taskId
// @access  Private
export const updateDailyTaskStatus = async (req, res) => {
  try {
    const { scheduleId, taskId } = req.params;
    const { isCompleted } = req.body;

    if (isConnected()) {
      const schedule = await DailySchedule.findOne({ _id: scheduleId, user: req.user._id });
      if (!schedule) {
        return res.status(404).json({ message: 'Daily schedule not found' });
      }

      const task = schedule.tasks.id(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task item not found' });
      }

      task.isCompleted = isCompleted;
      await schedule.save();

      return res.json({ success: true, schedule });
    } else {
      // OFFLINE MODE
      const schedule = MOCK_DAILY_SCHEDULES_DB.find(s => s._id === scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: 'Daily schedule not found' });
      }

      const task = schedule.tasks.find(t => t._id === taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task item not found' });
      }

      task.isCompleted = isCompleted;
      
      // Simulate MongoDB pre-save hooks in memory
      const allCompleted = schedule.tasks.every(t => t.isCompleted);
      schedule.isDayCompleted = allCompleted;
      schedule.studyHoursLogged = schedule.tasks
        .filter(t => t.isCompleted)
        .reduce((sum, t) => sum + (t.durationHours || 1), 0);

      return res.json({ success: true, schedule });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task status', error: error.message });
  }
};

// @desc    Toggle completion of a topic in syllabus checklist
// @route   PATCH /api/planner/topics/:topicId
// @access  Private
export const updateTopicStatus = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { isCompleted } = req.body;

    if (isConnected()) {
      const planner = await Planner.findOne({ user: req.user._id });
      if (!planner) {
        return res.status(404).json({ message: 'Planner not found' });
      }

      const topic = planner.topics.id(topicId);
      if (!topic) {
        return res.status(404).json({ message: 'Syllabus topic not found' });
      }

      topic.isCompleted = isCompleted;
      topic.completedAt = isCompleted ? new Date() : null;
      await planner.save();
      
      let xpAwarded = 0;
      let levelUpInfo = null;

      if (isCompleted) {
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(req.user._id);
        if (user) {
          user.xp = (user.xp || 0) + 10;
          xpAwarded = 10;
          let oldLevel = user.level;
          if (user.xp >= 600 && user.level < 4) { user.level = 4; user.title = 'Master'; }
          else if (user.xp >= 300 && user.level < 3) { user.level = 3; user.title = 'Scholar'; }
          else if (user.xp >= 100 && user.level < 2) { user.level = 2; user.title = 'Learner'; }
          
          if (user.level > oldLevel) {
            levelUpInfo = { newLevel: user.level, newTitle: user.title };
          }
          await user.save();
        }
      }

      return res.json({ success: true, planner, xpAwarded, levelUpInfo });
    } else {
      // OFFLINE MODE
      if (!MOCK_PLANNER_DB) {
        return res.status(404).json({ message: 'Planner not found' });
      }

      const topic = MOCK_PLANNER_DB.topics.find(t => t._id === topicId);
      if (!topic) {
        return res.status(404).json({ message: 'Syllabus topic not found' });
      }

      topic.isCompleted = isCompleted;
      topic.completedAt = isCompleted ? new Date() : null;

      return res.json({ success: true, planner: MOCK_PLANNER_DB, xpAwarded: isCompleted ? 10 : 0 });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update syllabus topic', error: error.message });
  }
};

// @desc    Add custom topic to syllabus checklist
// @route   POST /api/planner/topics
// @access  Private
export const addCustomTopic = async (req, res) => {
  try {
    const { name, subject, priority } = req.body;

    if (!name || !subject) {
      return res.status(400).json({ message: 'Please provide topic name and subject' });
    }

    if (isConnected()) {
      const planner = await Planner.findOne({ user: req.user._id });
      if (!planner) {
        return res.status(404).json({ message: 'No active study planner found' });
      }

      planner.topics.push({
        name,
        subject,
        priority: priority || 'Medium',
        isCompleted: false
      });

      await planner.save();
      return res.status(201).json({ success: true, planner });
    } else {
      // OFFLINE MODE
      if (!MOCK_PLANNER_DB) {
        return res.status(404).json({ message: 'No active study planner found' });
      }

      MOCK_PLANNER_DB.topics.push({
        _id: `t_custom_${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        subject,
        priority: priority || 'Medium',
        isCompleted: false
      });

      return res.status(201).json({ success: true, planner: MOCK_PLANNER_DB });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to add custom topic', error: error.message });
  }
};

// @desc    Toggle spaced repetition revision session completion
// @route   PATCH /api/planner/spaced-repetition/:srId
// @access  Private
export const updateSpacedRepetitionStatus = async (req, res) => {
  try {
    const { srId } = req.params;
    const { isCompleted } = req.body;

    if (isConnected()) {
      const planner = await Planner.findOne({ user: req.user._id });
      if (!planner) {
        return res.status(404).json({ message: 'Planner not found' });
      }

      const revision = planner.spacedRepetition.id(srId);
      if (!revision) {
        return res.status(404).json({ message: 'Revision session not found' });
      }

      revision.isCompleted = isCompleted;
      await planner.save();

      return res.json({ success: true, planner });
    } else {
      // OFFLINE MODE
      if (!MOCK_PLANNER_DB) {
        return res.status(404).json({ message: 'Planner not found' });
      }

      const revision = MOCK_PLANNER_DB.spacedRepetition.find(r => r._id === srId);
      if (!revision) {
        return res.status(404).json({ message: 'Revision session not found' });
      }

      revision.isCompleted = isCompleted;
      return res.json({ success: true, planner: MOCK_PLANNER_DB });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update spaced repetition status', error: error.message });
  }
};

// Access In-Memory database directly from other offline controllers
export const getOfflinePlannerData = () => {
  return {
    planner: MOCK_PLANNER_DB,
    dailySchedules: MOCK_DAILY_SCHEDULES_DB
  };
};

export const handleUploadSyllabus = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const data = await pdfParse(req.file.buffer);
    const syllabus = await extractSyllabusFromPDF(data.text);
    res.json({ success: true, syllabus });
  } catch (error) {
    console.error('Upload Syllabus Error:', error);
    res.status(500).json({ message: 'Failed to process syllabus PDF', error: error.message });
  }
};

export const handleUploadPYQ = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const data = await pdfParse(req.file.buffer);
    const frequentTopics = await analyzePYQ(data.text);
    res.json({ success: true, frequentTopics });
  } catch (error) {
    console.error('Upload PYQ Error:', error);
    res.status(500).json({ message: 'Failed to process PYQ PDF', error: error.message });
  }
};

export const generateStandardSyllabusEndpoint = async (req, res) => {
  try {
    const { subjects } = req.body;
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: 'Subjects array is required' });
    }
    let allTopics = [];
    for (const subject of subjects) {
      const syllabus = await genStdSyllabus(subject);
      const syllabusWithSubject = syllabus.map(t => ({ ...t, subject }));
      allTopics = allTopics.concat(syllabusWithSubject);
    }
    res.json({ success: true, topics: allTopics });
  } catch (error) {
    console.error('Generate Standard Syllabus Error:', error);
    res.status(500).json({ message: 'Failed to generate standard syllabus', error: error.message });
  }
};

import Planner from '../models/Planner.js';
import DailySchedule from '../models/DailySchedule.js';
import User from '../models/User.js';
import { generateAISchedule, extractSyllabusFromPDF, analyzePYQ, generateStandardSyllabus as genStdSyllabus } from '../services/aiService.js';
import mongoose from 'mongoose';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const storage = multer.memoryStorage();
export const upload = multer({ storage });

let MOCK_PLANNER_DB = null;
let MOCK_DAILY_SCHEDULES_DB = [];

const isConnected = () => mongoose.connection.readyState === 1;

// Clerk sends payload.sub (clerkId) as req.user._id
// We look up the MongoDB _id from our User collection
const resolveUserId = async (clerkId) => {
  if (!isConnected()) return clerkId;
  const user = await User.findOne({ clerkId });
  return user ? user._id : clerkId;
};

// POST /api/planner/generate
export const generatePlan = async (req, res) => {
  try {
    const { examDate, goal, subjects, weakSubjects, dailyHours, prepLevel, topics } = req.body;
    const userId = await resolveUserId(req.user._id);

    if (!examDate || !goal || !subjects || subjects.length === 0 || !dailyHours) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const generatedData = await generateAISchedule({
      examDate, goal, subjects,
      weakSubjects, dailyHours: Number(dailyHours),
      prepLevel, providedTopics: topics
    });

    if (isConnected()) {
      await Planner.deleteMany({ user: userId });
      await DailySchedule.deleteMany({ user: userId });

      const planner = await Planner.create({
        user: userId,
        examDate: new Date(examDate),
        goal, subjects,
        weakSubjects: weakSubjects || [],
        dailyHours: Number(dailyHours),
        prepLevel: prepLevel || 'Intermediate',
        aiRecommendation: generatedData.aiRecommendation || '',
        topics: (topics?.length > 0 ? topics : generatedData.topics).map(t => ({
          name: t.name || t.topic,
          subject: t.subject || (subjects.length === 1 ? subjects[0] : 'General'),
          unit: t.unit || 'General',
          isCompleted: false,
          priority: t.priority || 'Medium',
        })),
        spacedRepetition: generatedData.spacedRepetition.map(sr => ({
          revisionNumber: sr.revisionNumber,
          revisionName: sr.revisionName,
          date: new Date(sr.date),
          topicName: sr.topicName,
          subject: sr.subject,
          isCompleted: false,
        })),
      });

      const savedSchedules = await DailySchedule.insertMany(
        generatedData.dailySchedules.map(ds => ({
          user: userId,
          planner: planner._id,
          date: new Date(ds.date),
          tasks: ds.tasks.map(task => ({
            timeSlot: task.timeSlot,
            taskName: task.taskName,
            subject: task.subject,
            isCompleted: false,
            durationHours: Number(task.durationHours) || 1,
          })),
        }))
      );

      return res.status(201).json({ success: true, planner, dailySchedules: savedSchedules });
    } else {
      // Offline mode
      const plannerId = new mongoose.Types.ObjectId().toString();
      MOCK_PLANNER_DB = {
        _id: plannerId,
        user: userId,
        examDate: new Date(examDate),
        goal, subjects,
        weakSubjects: weakSubjects || [],
        dailyHours: Number(dailyHours),
        prepLevel: prepLevel || 'Intermediate',
        aiRecommendation: generatedData.aiRecommendation || '',
        topics: (topics?.length > 0 ? topics : generatedData.topics).map((t, idx) => ({
          _id: `t_${idx}`,
          name: t.name || t.topic,
          subject: t.subject || (subjects.length === 1 ? subjects[0] : 'General'),
          unit: t.unit || 'General',
          isCompleted: false,
          priority: t.priority || 'Medium',
        })),
        spacedRepetition: generatedData.spacedRepetition.map((sr, idx) => ({
          _id: `sr_${idx}`,
          revisionNumber: sr.revisionNumber,
          revisionName: sr.revisionName,
          date: new Date(sr.date),
          topicName: sr.topicName,
          subject: sr.subject,
          isCompleted: false,
        })),
        createdAt: new Date(),
      };

      MOCK_DAILY_SCHEDULES_DB = generatedData.dailySchedules.map((ds, idx) => ({
        _id: `sched_${idx}`,
        user: userId,
        planner: plannerId,
        date: new Date(ds.date),
        tasks: ds.tasks.map((task, tIdx) => ({
          _id: `task_${idx}_${tIdx}`,
          timeSlot: task.timeSlot,
          taskName: task.taskName,
          subject: task.subject,
          isCompleted: false,
          durationHours: Number(task.durationHours) || 1,
        })),
        isDayCompleted: false,
        studyHoursLogged: 0,
        createdAt: new Date(),
      }));

      return res.status(201).json({ success: true, planner: MOCK_PLANNER_DB, dailySchedules: MOCK_DAILY_SCHEDULES_DB });
    }
  } catch (error) {
    console.error('Plan Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate study plan', error: error.message });
  }
};

// GET /api/planner/current
export const getPlanner = async (req, res) => {
  try {
    const userId = await resolveUserId(req.user._id);
    if (isConnected()) {
      const planner = await Planner.findOne({ user: userId });
      if (!planner) return res.status(404).json({ message: 'No active study planner found.' });
      return res.json(planner);
    } else {
      if (!MOCK_PLANNER_DB) return res.status(404).json({ message: 'No active study planner found.' });
      return res.json(MOCK_PLANNER_DB);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve planner', error: error.message });
  }
};

// GET /api/planner/schedules
export const getDailySchedules = async (req, res) => {
  try {
    const userId = await resolveUserId(req.user._id);
    if (isConnected()) {
      const schedules = await DailySchedule.find({ user: userId }).sort({ date: 1 });
      return res.json(schedules);
    } else {
      return res.json(MOCK_DAILY_SCHEDULES_DB);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve schedules', error: error.message });
  }
};

// PATCH /api/planner/schedules/:scheduleId/tasks/:taskId
export const updateDailyTaskStatus = async (req, res) => {
  try {
    const { scheduleId, taskId } = req.params;
    const { isCompleted } = req.body;
    const userId = await resolveUserId(req.user._id);

    if (isConnected()) {
      const schedule = await DailySchedule.findOne({ _id: scheduleId, user: userId });
      if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
      const task = schedule.tasks.id(taskId);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      task.isCompleted = isCompleted;
      await schedule.save();
      return res.json({ success: true, schedule });
    } else {
      const schedule = MOCK_DAILY_SCHEDULES_DB.find(s => s._id === scheduleId);
      if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
      const task = schedule.tasks.find(t => t._id === taskId);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      task.isCompleted = isCompleted;
      schedule.isDayCompleted = schedule.tasks.every(t => t.isCompleted);
      schedule.studyHoursLogged = schedule.tasks.filter(t => t.isCompleted).reduce((sum, t) => sum + (t.durationHours || 1), 0);
      return res.json({ success: true, schedule });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

// PATCH /api/planner/topics/:topicId
export const updateTopicStatus = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { isCompleted } = req.body;
    const userId = await resolveUserId(req.user._id);

    if (isConnected()) {
      const planner = await Planner.findOne({ user: userId });
      if (!planner) return res.status(404).json({ message: 'Planner not found' });
      const topic = planner.topics.id(topicId);
      if (!topic) return res.status(404).json({ message: 'Topic not found' });
      topic.isCompleted = isCompleted;
      topic.completedAt = isCompleted ? new Date() : null;
      await planner.save();

      // Award XP on topic completion
      let xpAwarded = 0;
      if (isCompleted) {
        const user = await User.findOne({ clerkId: req.user._id });
        if (user) {
          user.xp = (user.xp || 0) + 10;
          xpAwarded = 10;
          if (user.xp >= 600 && user.level < 4) { user.level = 4; user.title = 'Master'; }
          else if (user.xp >= 300 && user.level < 3) { user.level = 3; user.title = 'Scholar'; }
          else if (user.xp >= 100 && user.level < 2) { user.level = 2; user.title = 'Learner'; }
          await user.save();
        }
      }
      return res.json({ success: true, planner, xpAwarded });
    } else {
      if (!MOCK_PLANNER_DB) return res.status(404).json({ message: 'Planner not found' });
      const topic = MOCK_PLANNER_DB.topics.find(t => t._id === topicId);
      if (!topic) return res.status(404).json({ message: 'Topic not found' });
      topic.isCompleted = isCompleted;
      topic.completedAt = isCompleted ? new Date() : null;
      return res.json({ success: true, planner: MOCK_PLANNER_DB, xpAwarded: isCompleted ? 10 : 0 });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update topic', error: error.message });
  }
};

// POST /api/planner/topics
export const addCustomTopic = async (req, res) => {
  try {
    const { name, subject, priority } = req.body;
    if (!name || !subject) return res.status(400).json({ message: 'Name and subject required' });
    const userId = await resolveUserId(req.user._id);

    if (isConnected()) {
      const planner = await Planner.findOne({ user: userId });
      if (!planner) return res.status(404).json({ message: 'No planner found' });
      planner.topics.push({ name, subject, priority: priority || 'Medium', isCompleted: false });
      await planner.save();
      return res.status(201).json({ success: true, planner });
    } else {
      if (!MOCK_PLANNER_DB) return res.status(404).json({ message: 'No planner found' });
      MOCK_PLANNER_DB.topics.push({ _id: `t_custom_${Date.now()}`, name, subject, priority: priority || 'Medium', isCompleted: false });
      return res.status(201).json({ success: true, planner: MOCK_PLANNER_DB });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to add topic', error: error.message });
  }
};

// PATCH /api/planner/spaced-repetition/:srId
export const updateSpacedRepetitionStatus = async (req, res) => {
  try {
    const { srId } = req.params;
    const { isCompleted } = req.body;
    const userId = await resolveUserId(req.user._id);

    if (isConnected()) {
      const planner = await Planner.findOne({ user: userId });
      if (!planner) return res.status(404).json({ message: 'Planner not found' });
      const revision = planner.spacedRepetition.id(srId);
      if (!revision) return res.status(404).json({ message: 'Revision not found' });
      revision.isCompleted = isCompleted;
      await planner.save();
      return res.json({ success: true, planner });
    } else {
      if (!MOCK_PLANNER_DB) return res.status(404).json({ message: 'Planner not found' });
      const revision = MOCK_PLANNER_DB.spacedRepetition.find(r => r._id === srId);
      if (!revision) return res.status(404).json({ message: 'Revision not found' });
      revision.isCompleted = isCompleted;
      return res.json({ success: true, planner: MOCK_PLANNER_DB });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update revision', error: error.message });
  }
};

export const getOfflinePlannerData = () => ({
  planner: MOCK_PLANNER_DB,
  dailySchedules: MOCK_DAILY_SCHEDULES_DB,
});

// POST /api/planner/upload-syllabus
export const handleUploadSyllabus = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const data = await pdfParse(req.file.buffer);
    const syllabus = await extractSyllabusFromPDF(data.text);
    res.json({ success: true, syllabus });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process syllabus PDF', error: error.message });
  }
};

// POST /api/planner/upload-pyq
export const handleUploadPYQ = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const data = await pdfParse(req.file.buffer);
    const frequentTopics = await analyzePYQ(data.text);
    res.json({ success: true, frequentTopics });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process PYQ PDF', error: error.message });
  }
};

// POST /api/planner/generate-standard-syllabus
export const generateStandardSyllabusEndpoint = async (req, res) => {
  try {
    const { subjects } = req.body;
    if (!subjects?.length) return res.status(400).json({ message: 'Subjects required' });
    let allTopics = [];
    for (const subject of subjects) {
      const list = await genStdSyllabus(subject);
      allTopics = allTopics.concat(list.map(t => ({ ...t, subject })));
    }
    res.json({ success: true, topics: allTopics });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate standard syllabus', error: error.message });
  }
};

// DELETE /api/planner/topics/:topicId
export const deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = await resolveUserId(req.user._id);

    if (isConnected()) {
      const planner = await Planner.findOne({ user: userId });
      if (!planner) return res.status(404).json({ message: 'Planner not found' });
      planner.topics = planner.topics.filter(t => t._id.toString() !== topicId);
      await planner.save();
      return res.json({ success: true, planner });
    } else {
      if (!MOCK_PLANNER_DB) return res.status(404).json({ message: 'Planner not found' });
      MOCK_PLANNER_DB.topics = MOCK_PLANNER_DB.topics.filter(t => t._id !== topicId);
      return res.json({ success: true, planner: MOCK_PLANNER_DB });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete topic', error: error.message });
  }
};

// POST /api/planner/subjects
export const addSubject = async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) return res.status(400).json({ message: 'Subject name required' });
    const userId = await resolveUserId(req.user._id);

    if (isConnected()) {
      const planner = await Planner.findOne({ user: userId });
      if (!planner) return res.status(404).json({ message: 'Planner not found' });
      if (!planner.subjects.includes(subject)) {
        planner.subjects.push(subject);
        await planner.save();
      }
      return res.status(201).json({ success: true, planner });
    } else {
      if (!MOCK_PLANNER_DB) return res.status(404).json({ message: 'Planner not found' });
      if (!MOCK_PLANNER_DB.subjects.includes(subject)) {
        MOCK_PLANNER_DB.subjects.push(subject);
      }
      return res.status(201).json({ success: true, planner: MOCK_PLANNER_DB });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to add subject', error: error.message });
  }
};

// DELETE /api/planner/subjects/:subjectName
export const deleteSubject = async (req, res) => {
  try {
    const { subjectName } = req.params;
    const userId = await resolveUserId(req.user._id);

    if (isConnected()) {
      const planner = await Planner.findOne({ user: userId });
      if (!planner) return res.status(404).json({ message: 'Planner not found' });
      planner.subjects = planner.subjects.filter(s => s !== subjectName);
      planner.topics = planner.topics.filter(t => t.subject !== subjectName);
      planner.weakSubjects = planner.weakSubjects.filter(s => s !== subjectName);
      await planner.save();
      return res.json({ success: true, planner });
    } else {
      if (!MOCK_PLANNER_DB) return res.status(404).json({ message: 'Planner not found' });
      MOCK_PLANNER_DB.subjects = MOCK_PLANNER_DB.subjects.filter(s => s !== subjectName);
      MOCK_PLANNER_DB.topics = MOCK_PLANNER_DB.topics.filter(t => t.subject !== subjectName);
      MOCK_PLANNER_DB.weakSubjects = MOCK_PLANNER_DB.weakSubjects.filter(s => s !== subjectName);
      return res.json({ success: true, planner: MOCK_PLANNER_DB });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subject', error: error.message });
  }
};

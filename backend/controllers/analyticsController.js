import Planner from '../models/Planner.js';
import DailySchedule from '../models/DailySchedule.js';
import User from '../models/User.js';
import { generateAIRecommendations } from '../services/aiService.js';
import { getOfflinePlannerData } from './plannerController.js';
import mongoose from 'mongoose';

const isConnected = () => mongoose.connection.readyState === 1;

const resolveUserId = async (clerkId) => {
  if (!isConnected()) return clerkId;
  const user = await User.findOne({ clerkId });
  return user ? user._id : clerkId;
};

// GET /api/analytics/report
export const getWeeklyReport = async (req, res) => {
  try {
    const userId = await resolveUserId(req.user._id);
    let planner = null;
    let schedules = [];

    if (isConnected()) {
      planner = await Planner.findOne({ user: userId });
      schedules = await DailySchedule.find({ user: userId }).sort({ date: 1 });
    } else {
      const offlineData = getOfflinePlannerData();
      planner = offlineData.planner;
      schedules = offlineData.dailySchedules;
    }

    if (!planner) {
      return res.status(404).json({ message: 'No active study planner found.' });
    }

    const totalTopics = planner.topics.length;
    const completedTopics = planner.topics.filter(t => t.isCompleted).length;
    const overallCompletionPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const totalHoursStudied = schedules.reduce((sum, s) => sum + (s.studyHoursLogged || 0), 0);
    const averageDailyStudy = schedules.length > 0 ? Number((totalHoursStudied / schedules.length).toFixed(1)) : 0;

    // Subject metrics
    const subjectMetricsMap = {};
    planner.subjects.forEach(subj => {
      subjectMetricsMap[subj] = { subject: subj, totalTopics: 0, completedTopics: 0, hoursStudied: 0 };
    });
    planner.topics.forEach(topic => {
      if (subjectMetricsMap[topic.subject]) {
        subjectMetricsMap[topic.subject].totalTopics++;
        if (topic.isCompleted) subjectMetricsMap[topic.subject].completedTopics++;
      }
    });
    schedules.forEach(sched => {
      sched.tasks.forEach(task => {
        if (task.isCompleted && subjectMetricsMap[task.subject]) {
          subjectMetricsMap[task.subject].hoursStudied += (task.durationHours || 1);
        }
      });
    });

    const subjectMetrics = Object.values(subjectMetricsMap).map(m => ({
      ...m,
      completionPercent: m.totalTopics > 0 ? Math.round((m.completedTopics / m.totalTopics) * 100) : 0,
    }));

    let strongestSubject = 'None', weakestSubject = 'None';
    let maxC = -1, minC = 101;
    subjectMetrics.forEach(sm => {
      if (sm.completionPercent > maxC) { maxC = sm.completionPercent; strongestSubject = sm.subject; }
      if (sm.completionPercent < minC) { minC = sm.completionPercent; weakestSubject = sm.subject; }
    });

    // Study hours trend
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const studyHoursTrend = schedules.map(s => ({
      day: days[new Date(s.date).getDay()],
      dateString: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      hours: s.studyHoursLogged || 0,
      targetHours: planner.dailyHours || 4,
    }));

    // Streak
    let currentStreak = 0, maxStreak = 0, tempStreak = 0;
    schedules.forEach(s => {
      if ((s.studyHoursLogged || 0) > 0) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else { tempStreak = 0; }
    });
    currentStreak = tempStreak;

    // Badges
    const badges = [];
    if (currentStreak >= 3) badges.push({ id: 'streak_3', name: 'Consistency Starter', icon: 'Flame', color: 'from-orange-400 to-red-500', description: 'Studied 3 days in a row!' });
    if (completedTopics >= 5) badges.push({ id: 'topics_5', name: 'Syllabus Shredder', icon: 'BookOpen', color: 'from-cyan-400 to-blue-500', description: 'Completed 5+ topics!' });
    if (totalHoursStudied >= 15) badges.push({ id: 'hours_15', name: 'Deep Work Champion', icon: 'Clock', color: 'from-purple-400 to-indigo-500', description: 'Logged 15+ study hours!' });
    if (overallCompletionPercent >= 80) badges.push({ id: 'percent_80', name: 'Exam Ready Warrior', icon: 'Trophy', color: 'from-yellow-400 to-amber-500', description: 'Completed 80%+ of syllabus!' });

    res.json({
      success: true,
      report: {
        completedTopics, totalTopics, overallCompletionPercent,
        totalHoursStudied, averageDailyStudy,
        strongestSubject, weakestSubject,
        currentStreak, maxStreak,
        subjectMetrics, studyHoursTrend, badges,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to aggregate analytics', error: error.message });
  }
};

// GET /api/analytics/recommendations
export const getAIRecommendationsController = async (req, res) => {
  try {
    const userId = await resolveUserId(req.user._id);
    let planner = null;
    let schedules = [];

    if (isConnected()) {
      planner = await Planner.findOne({ user: userId });
      schedules = await DailySchedule.find({ user: userId });
    } else {
      const offlineData = getOfflinePlannerData();
      planner = offlineData.planner;
      schedules = offlineData.dailySchedules;
    }

    if (!planner) return res.status(404).json({ message: 'No active study planner found' });

    const subjectsMap = {};
    planner.subjects.forEach(s => { subjectsMap[s] = { subject: s, totalTopics: 0, completedTopics: 0, hoursStudied: 0 }; });
    planner.topics.forEach(t => {
      if (subjectsMap[t.subject]) {
        subjectsMap[t.subject].totalTopics++;
        if (t.isCompleted) subjectsMap[t.subject].completedTopics++;
      }
    });
    schedules.forEach(s => {
      s.tasks.forEach(t => {
        if (t.isCompleted && subjectsMap[t.subject]) {
          subjectsMap[t.subject].hoursStudied += (t.durationHours || 1);
        }
      });
    });

    const statusList = Object.values(subjectsMap).map(s => ({
      subject: s.subject,
      completionPercent: s.totalTopics > 0 ? Math.round((s.completedTopics / s.totalTopics) * 100) : 0,
      hoursStudied: s.hoursStudied,
    }));

    const recommendations = await generateAIRecommendations(statusList);
    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate recommendations', error: error.message });
  }
};

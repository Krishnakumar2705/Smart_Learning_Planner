import Planner from '../models/Planner.js';
import DailySchedule from '../models/DailySchedule.js';
import { generateAIRecommendations } from '../services/aiService.js';
import { getOfflinePlannerData } from './plannerController.js';
import mongoose from 'mongoose';

// Check if MongoDB is connected
const isConnected = () => mongoose.connection.readyState === 1;

// @desc    Get aggregated learning metrics & chart data
// @route   GET /api/analytics/report
// @access  Private
export const getWeeklyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    let planner = null;
    let schedules = [];

    if (isConnected()) {
      planner = await Planner.findOne({ user: userId });
      schedules = await DailySchedule.find({ user: userId }).sort({ date: 1 });
    } else {
      // OFFLINE MODE: Pull from local simulated database
      const offlineData = getOfflinePlannerData();
      planner = offlineData.planner;
      schedules = offlineData.dailySchedules;
    }

    if (!planner) {
      return res.status(404).json({ message: 'No active study planner found. Please create one to view analytics.' });
    }

    // 2. Core Metrics
    const totalTopics = planner.topics.length;
    const completedTopics = planner.topics.filter(t => t.isCompleted).length;
    const overallCompletionPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const totalHoursStudied = schedules.reduce((sum, sched) => sum + (sched.studyHoursLogged || 0), 0);
    const averageDailyStudy = schedules.length > 0 ? Number((totalHoursStudied / schedules.length).toFixed(1)) : 0;

    // 3. Subject-wise Analysis
    const subjectMetricsMap = {};
    planner.subjects.forEach(subj => {
      subjectMetricsMap[subj] = {
        subject: subj,
        totalTopics: 0,
        completedTopics: 0,
        hoursStudied: 0,
      };
    });

    // Populate topics counts
    planner.topics.forEach(topic => {
      const metrics = subjectMetricsMap[topic.subject];
      if (metrics) {
        metrics.totalTopics += 1;
        if (topic.isCompleted) {
          metrics.completedTopics += 1;
        }
      }
    });

    // Populate hours studied from daily schedule tasks
    schedules.forEach(sched => {
      sched.tasks.forEach(task => {
        if (task.isCompleted && subjectMetricsMap[task.subject]) {
          subjectMetricsMap[task.subject].hoursStudied += (task.durationHours || 1);
        }
      });
    });

    const subjectMetrics = Object.values(subjectMetricsMap).map(metrics => {
      const completionPercent = metrics.totalTopics > 0 
        ? Math.round((metrics.completedTopics / metrics.totalTopics) * 100) 
        : 0;
      return {
        ...metrics,
        completionPercent
      };
    });

    // 4. Calculate Strongest & Weakest Subjects
    let strongestSubject = 'None';
    let weakestSubject = 'None';
    let maxCompletion = -1;
    let minCompletion = 101;

    subjectMetrics.forEach(sm => {
      if (sm.completionPercent > maxCompletion) {
        maxCompletion = sm.completionPercent;
        strongestSubject = sm.subject;
      }
      if (sm.completionPercent < minCompletion) {
        minCompletion = sm.completionPercent;
        weakestSubject = sm.subject;
      }
    });

    // 5. Generate Recharts Study Hours Trend
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const studyHoursTrend = schedules.map(sched => {
      const dayName = weekdayNames[new Date(sched.date).getDay()];
      return {
        day: dayName,
        dateString: new Date(sched.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        hours: sched.studyHoursLogged || 0,
        targetHours: planner.dailyHours || 4
      };
    });

    // 6. Calculate Streak count
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    schedules.forEach(sched => {
      const hoursLogged = sched.studyHoursLogged || 0;
      if (hoursLogged > 0) {
        tempStreak += 1;
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    });
    currentStreak = tempStreak;

    // 7. Badges system
    const badges = [];
    if (currentStreak >= 3) {
      badges.push({
        id: 'streak_3',
        name: 'Consistency Starter',
        icon: 'Flame',
        color: 'from-orange-400 to-red-500',
        description: 'Completed study tasks for 3 consecutive days!'
      });
    }
    if (completedTopics >= 5) {
      badges.push({
        id: 'topics_5',
        name: 'Syllabus Shredder',
        icon: 'BookOpen',
        color: 'from-cyan-400 to-blue-500',
        description: 'Successfully completed 5+ syllabus topics!'
      });
    }
    if (totalHoursStudied >= 15) {
      badges.push({
        id: 'hours_15',
        name: 'Deep Work Champion',
        icon: 'Clock',
        color: 'from-purple-400 to-indigo-500',
        description: 'Logged 15+ focus study hours in total!'
      });
    }
    if (overallCompletionPercent >= 80) {
      badges.push({
        id: 'percent_80',
        name: 'Exam Ready Warrior',
        icon: 'Trophy',
        color: 'from-yellow-400 to-amber-500',
        description: 'Completed 80%+ of the total syllabus topics!'
      });
    }

    res.json({
      success: true,
      report: {
        completedTopics,
        totalTopics,
        overallCompletionPercent,
        totalHoursStudied,
        averageDailyStudy,
        strongestSubject,
        weakestSubject,
        currentStreak,
        maxStreak,
        subjectMetrics,
        studyHoursTrend,
        badges
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to aggregate analytics', error: error.message });
  }
};

// @desc    Retrieve Gemini AI Performance Recommendations
// @route   GET /api/analytics/recommendations
// @access  Private
export const getAIRecommendationsController = async (req, res) => {
  try {
    const userId = req.user._id;
    let planner = null;
    let schedules = [];

    if (isConnected()) {
      planner = await Planner.findOne({ user: userId });
      schedules = await DailySchedule.find({ user: userId });
    } else {
      // OFFLINE MODE: Pull from simulated database
      const offlineData = getOfflinePlannerData();
      planner = offlineData.planner;
      schedules = offlineData.dailySchedules;
    }

    if (!planner) {
      return res.status(404).json({ message: 'No active study planner found' });
    }

    // 2. Aggregate subject data
    const subjectsMap = {};
    planner.subjects.forEach(s => {
      subjectsMap[s] = { subject: s, totalTopics: 0, completedTopics: 0, hoursStudied: 0 };
    });

    planner.topics.forEach(t => {
      if (subjectsMap[t.subject]) {
        subjectsMap[t.subject].totalTopics += 1;
        if (t.isCompleted) {
          subjectsMap[t.subject].completedTopics += 1;
        }
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
      hoursStudied: s.hoursStudied
    }));

    // 3. Request Gemini AI recommendation
    const recommendations = await generateAIRecommendations(statusList);
    res.json({ success: true, recommendations });
  } catch (error) {
    console.error('Recommendations Controller Error:', error);
    res.status(500).json({ message: 'Failed to generate recommendations', error: error.message });
  }
};

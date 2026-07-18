import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const PlannerContext = createContext();

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_PLANNER = `${BASE_URL}/api/planner`;
const API_ANALYTICS = `${BASE_URL}/api/analytics`;

export const PlannerProvider = ({ children }) => {
  const { user } = useAuth();
  const [planner, setPlanner] = useState(null);
  const [dailySchedules, setDailySchedules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [plannerLoading, setPlannerLoading] = useState(false);

  // Clear data when user logs out
  useEffect(() => {
    if (!user) {
      setPlanner(null);
      setDailySchedules([]);
      setAnalytics(null);
      setRecommendations([]);
    } else {
      fetchAllPlannerData();
    }
  }, [user]);

  // Aggregate all API requests to completely load the dashboard
  const fetchAllPlannerData = async () => {
    if (!user) return;
    setPlannerLoading(true);
    try {
      // 1. Fetch current planner
      const currentPlanRes = await axios.get(`${API_PLANNER}/current`).catch(err => {
        console.log('No current plan found yet.');
        return null;
      });

      if (currentPlanRes && currentPlanRes.data) {
        setPlanner(currentPlanRes.data);
        
        // 2. Fetch daily schedules
        const schedulesRes = await axios.get(`${API_PLANNER}/schedules`);
        setDailySchedules(schedulesRes.data);

        // 3. Fetch analytics & reports
        const reportRes = await axios.get(`${API_ANALYTICS}/report`);
        setAnalytics(reportRes.data.report);

        // 4. Fetch AI recommendations
        const recsRes = await axios.get(`${API_ANALYTICS}/recommendations`);
        setRecommendations(recsRes.data.recommendations);
      } else {
        setPlanner(null);
        setDailySchedules([]);
        setAnalytics(null);
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Failed to load study planner databases:', error);
    } finally {
      setPlannerLoading(false);
    }
  };

  // Generate new Study Planner
  const generateNewPlan = async (params) => {
    setPlannerLoading(true);
    try {
      const response = await axios.post(`${API_PLANNER}/generate`, params);
      const { planner, dailySchedules } = response.data;
      
      setPlanner(planner);
      setDailySchedules(dailySchedules);

      // Trigger analytics & advice reload immediately
      await reloadAnalyticsAndRecommendations();
      
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to generate study plan.'
      };
    } finally {
      setPlannerLoading(false);
    }
  };

  // Reload Analytics and AI Advice
  const reloadAnalyticsAndRecommendations = async () => {
    try {
      const reportRes = await axios.get(`${API_ANALYTICS}/report`);
      setAnalytics(reportRes.data.report);

      const recsRes = await axios.get(`${API_ANALYTICS}/recommendations`);
      setRecommendations(recsRes.data.recommendations);
    } catch (err) {
      console.error('Failed to refresh data summaries:', err);
    }
  };

  // Toggle checklist tasks in Daily Schedules
  const toggleTask = async (scheduleId, taskId, isCompleted) => {
    try {
      const response = await axios.patch(`${API_PLANNER}/schedules/${scheduleId}/tasks/${taskId}`, { isCompleted });
      const updatedSchedule = response.data.schedule;

      setDailySchedules(prev => 
        prev.map(s => s._id === scheduleId ? updatedSchedule : s)
      );

      // Sync metrics after checking off a task
      await reloadAnalyticsAndRecommendations();
    } catch (err) {
      console.error('Failed to update task checklist:', err);
    }
  };

  // Toggle syllabus checklists topics
  const toggleTopic = async (topicId, isCompleted) => {
    try {
      const response = await axios.patch(`${API_PLANNER}/topics/${topicId}`, { isCompleted });
      setPlanner(response.data.planner);

      // Sync metrics after checking off a syllabus topic
      await reloadAnalyticsAndRecommendations();
    } catch (err) {
      console.error('Failed to update syllabus topic:', err);
    }
  };

  // Add custom topics inside syllabus checklists
  const addNewTopic = async (name, subject, priority) => {
    try {
      const response = await axios.post(`${API_PLANNER}/topics`, { name, subject, priority });
      setPlanner(response.data.planner);
      await reloadAnalyticsAndRecommendations();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to add custom topic.'
      };
    }
  };

  // Toggle revision checklists
  const toggleRevision = async (srId, isCompleted) => {
    try {
      const response = await axios.patch(`${API_PLANNER}/spaced-repetition/${srId}`, { isCompleted });
      setPlanner(response.data.planner);
      await reloadAnalyticsAndRecommendations();
    } catch (err) {
      console.error('Failed to update spaced repetition checklist:', err);
    }
  };

  return (
    <PlannerContext.Provider value={{
      planner,
      dailySchedules,
      analytics,
      recommendations,
      plannerLoading,
      generateNewPlan,
      toggleTask,
      toggleTopic,
      addNewTopic,
      toggleRevision,
      refreshData: fetchAllPlannerData
    }}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => useContext(PlannerContext);

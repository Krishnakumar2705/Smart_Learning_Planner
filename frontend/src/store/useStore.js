import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_AUTH = `${BASE_URL}/api/auth`;
const API_PLANNER = `${BASE_URL}/api/planner`;
const API_ANALYTICS = `${BASE_URL}/api/analytics`;
const API_MOCK_TEST = `${BASE_URL}/api/mock-test`;

axios.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      theme: 'dark',
      streakDays: 0,
      achievements: [],
      
      planner: null,
      dailySchedules: [],
      analytics: null,
      recommendations: [],
      loading: false,

      // Auth actions
      setUser: (userData) => {
        set({ user: userData });
        if (userData?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        }
      },
      logout: () => {
        set({ user: null, token: null, streakDays: 0, achievements: [], planner: null, dailySchedules: [], analytics: null, recommendations: [] });
        delete axios.defaults.headers.common['Authorization'];
        toast.success('Logged out successfully');
      },
      
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        return { theme: newTheme };
      }),
      
      login: async (email, password) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_AUTH}/login`, { email, password });
          const data = response.data;
          set({ user: data, token: data.token });
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          toast.success('Logged in successfully!');
          await get().fetchAllPlannerData();
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Invalid email or password.';
          toast.error(msg);
          return { success: false, error: msg };
        } finally {
          set({ loading: false });
        }
      },

      register: async (username, email, password) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_AUTH}/register`, { username, email, password });
          const data = response.data;
          set({ user: data, token: data.token });
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          toast.success('Registration successful!');
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed. Please try again.';
          toast.error(msg);
          return { success: false, error: msg };
        } finally {
          set({ loading: false });
        }
      },

      googleLoginSimulate: async () => {
        set({ loading: true });
        try {
          const emails = ['placement_crack@gmail.com', 'topper_student@gmail.com', 'consistent_learner@gmail.com'];
          const names = ['Karan Sharma', 'Preeti Patel', 'Aditya Sen'];
          const randomIdx = Math.floor(Math.random() * names.length);
          const email = emails[randomIdx];
          const username = names[randomIdx];
          const googleId = `g_${Math.floor(100000 + Math.random() * 900000)}`;
          const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${username.replace(' ', '')}`;

          const response = await axios.post(`${API_AUTH}/google`, { email, username, googleId, avatar });
          const data = response.data;
          set({ user: data, token: data.token });
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          toast.success(`Welcome back, ${username}!`);
          await get().fetchAllPlannerData();
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Google Auth simulation failed.';
          toast.error(msg);
          return { success: false, error: msg };
        } finally {
          set({ loading: false });
        }
      },

      // Planner actions
      fetchAllPlannerData: async () => {
        if (!get().user) return;
        set({ loading: true });
        try {
          const currentPlanRes = await axios.get(`${API_PLANNER}/current`).catch(() => null);
          if (currentPlanRes && currentPlanRes.data) {
            const planner = currentPlanRes.data;
            const schedulesRes = await axios.get(`${API_PLANNER}/schedules`);
            const reportRes = await axios.get(`${API_ANALYTICS}/report`);
            const recsRes = await axios.get(`${API_ANALYTICS}/recommendations`);
            
            set({
              planner,
              dailySchedules: schedulesRes.data,
              analytics: reportRes.data.report,
              recommendations: recsRes.data.recommendations
            });
          } else {
            set({ planner: null, dailySchedules: [], analytics: null, recommendations: [] });
          }
        } catch (error) {
          console.error('Failed to load study planner databases:', error);
        } finally {
          set({ loading: false });
        }
      },

      generateNewPlan: async (params) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_PLANNER}/generate`, params);
          const { planner, dailySchedules } = response.data;
          set({ planner, dailySchedules });
          toast.success('Study plan generated successfully!');
          await get().reloadAnalyticsAndRecommendations();
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to generate study plan.';
          toast.error(msg);
          return { success: false, error: msg };
        } finally {
          set({ loading: false });
        }
      },

      reloadAnalyticsAndRecommendations: async () => {
        try {
          const reportRes = await axios.get(`${API_ANALYTICS}/report`);
          const recsRes = await axios.get(`${API_ANALYTICS}/recommendations`);
          set({
            analytics: reportRes.data.report,
            recommendations: recsRes.data.recommendations
          });
        } catch (err) {
          console.error('Failed to refresh data summaries:', err);
        }
      },

      toggleTask: async (scheduleId, taskId, isCompleted) => {
        try {
          const response = await axios.patch(`${API_PLANNER}/schedules/${scheduleId}/tasks/${taskId}`, { isCompleted });
          const updatedSchedule = response.data.schedule;
          set(state => ({
            dailySchedules: state.dailySchedules.map(s => s._id === scheduleId ? updatedSchedule : s)
          }));
          toast.success(isCompleted ? 'Task completed!' : 'Task unmarked.');
          await get().reloadAnalyticsAndRecommendations();
        } catch (err) {
          console.error('Failed to update task checklist:', err);
          toast.error('Failed to update task.');
        }
      },

      toggleTopic: async (topicId, isCompleted) => {
        try {
          const response = await axios.patch(`${API_PLANNER}/topics/${topicId}`, { isCompleted });
          set({ planner: response.data.planner });
          toast.success(isCompleted ? 'Topic completed!' : 'Topic unmarked.');
          await get().reloadAnalyticsAndRecommendations();
        } catch (err) {
          console.error('Failed to update syllabus topic:', err);
          toast.error('Failed to update topic.');
        }
      },

      addNewTopic: async (name, subject, priority) => {
        try {
          const response = await axios.post(`${API_PLANNER}/topics`, { name, subject, priority });
          set({ planner: response.data.planner });
          toast.success('Topic added successfully!');
          await get().reloadAnalyticsAndRecommendations();
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to add custom topic.';
          toast.error(msg);
          return { success: false, error: msg };
        }
      },

      toggleRevision: async (srId, isCompleted) => {
        try {
          const response = await axios.patch(`${API_PLANNER}/spaced-repetition/${srId}`, { isCompleted });
          set({ planner: response.data.planner });
          toast.success(isCompleted ? 'Revision completed!' : 'Revision unmarked.');
          await get().reloadAnalyticsAndRecommendations();
        } catch (err) {
          console.error('Failed to update spaced repetition checklist:', err);
          toast.error('Failed to update revision.');
        }
      },

      generateMockTest: async (subject) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_MOCK_TEST}/generate`, { subject });
          toast.success('Mock test generated successfully!');
          return { success: true, test: response.data.test };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to generate mock test.';
          toast.error(msg);
          return { success: false, error: msg };
        } finally {
          set({ loading: false });
        }
      },

      uploadSyllabusPDF: async (file) => {
        set({ loading: true });
        try {
          const formData = new FormData();
          formData.append('pdf', file);
          const response = await axios.post(`${API_PLANNER}/upload-syllabus`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.success('Syllabus PDF processed!');
          return { success: true, topics: response.data.topics };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to process PDF.';
          toast.error(msg);
          return { success: false, error: msg };
        } finally {
          set({ loading: false });
        }
      },

      uploadPYQ: async (file) => {
        set({ loading: true });
        try {
          const formData = new FormData();
          formData.append('pdf', file);
          const response = await axios.post(`${API_PLANNER}/upload-pyq`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.success('PYQ analyzed!');
          return { success: true, topics: response.data.topics };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to analyze PYQ.';
          toast.error(msg);
          return { success: false, error: msg };
        } finally {
          set({ loading: false });
        }
      },

      generateStandardSyllabus: async (subjects) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_PLANNER}/generate-standard-syllabus`, { subjects });
          toast.success('Standard syllabus generated!');
          return { success: true, topics: response.data.topics };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to generate standard syllabus.';
          toast.error(msg);
          return { success: false, error: msg };
        } finally {
          set({ loading: false });
        }
      },

      generateShortNotes: async (topicId) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_PLANNER}/topics/${topicId}/notes`);
          toast.success('Short notes generated!');
          return { success: true, notes: response.data.notes };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to generate notes.';
          toast.error(msg);
          return { success: false, error: msg };
        } finally {
          set({ loading: false });
        }
      },

      generateImportantQuestions: async (topicId) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_PLANNER}/topics/${topicId}/questions`);
          toast.success('Important questions generated!');
          return { success: true, questions: response.data.questions };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to generate questions.';
          toast.error(msg);
          return { success: false, error: msg };
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: 'smart-learning-planner-storage',
      partialize: (state) => ({ user: state.user, token: state.token, theme: state.theme }),
    }
  )
);

export default useStore;

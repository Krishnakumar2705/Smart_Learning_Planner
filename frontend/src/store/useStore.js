import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
const API_AUTH    = `${BASE_URL}/api/auth`;
const API_PLANNER = `${BASE_URL}/api/planner`;
const API_ANALYTICS = `${BASE_URL}/api/analytics`;
const API_MOCK_TEST = `${BASE_URL}/api/mock-test`;

// Attach Clerk token to every axios request automatically
axios.interceptors.request.use((config) => {
  const token = useStore.getState().clerkToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useStore = create(
  persist(
    (set, get) => ({
      // ── Clerk user info ───────────────────────────────────────
      user: null,        // synced MongoDB user profile
      clerkToken: null,  // Clerk session JWT (used in API calls)
      theme: 'dark',

      // ── Planner data ──────────────────────────────────────────
      planner: null,
      dailySchedules: [],
      analytics: null,
      recommendations: [],
      loading: false,

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // ── Called from App.jsx after Clerk confirms sign-in ──────
      // Syncs Clerk user into MongoDB, stores token, loads planner
      syncClerkUser: async (clerkUser, getToken) => {
        try {
          // Get Clerk session JWT to use for our backend API calls
          const token = await getToken();
          set({ clerkToken: token });
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Sync user profile into our MongoDB
          const response = await axios.post(`${API_AUTH}/sync`, {
            clerkId: clerkUser.id,
            username: clerkUser.fullName || clerkUser.username,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            avatar: clerkUser.imageUrl || '',
          });

          set({ user: response.data });

          // Load their planner data
          await get().fetchAllPlannerData();
        } catch (error) {
          console.error('Failed to sync Clerk user:', error);
        }
      },

      // Clear everything on sign-out (Clerk handles the actual sign-out)
      clearUserData: () => {
        set({
          user: null,
          clerkToken: null,
          planner: null,
          dailySchedules: [],
          analytics: null,
          recommendations: [],
        });
        delete axios.defaults.headers.common['Authorization'];
      },

      // ── Planner ───────────────────────────────────────────────
      fetchAllPlannerData: async () => {
        set({ loading: true });
        try {
          const currentPlanRes = await axios.get(`${API_PLANNER}/current`).catch(() => null);
          if (currentPlanRes && currentPlanRes.data) {
            const planner = currentPlanRes.data;
            const schedulesRes = await axios.get(`${API_PLANNER}/schedules`);
            const reportRes    = await axios.get(`${API_ANALYTICS}/report`);
            const recsRes      = await axios.get(`${API_ANALYTICS}/recommendations`);
            set({
              planner,
              dailySchedules: schedulesRes.data,
              analytics: reportRes.data.report,
              recommendations: recsRes.data.recommendations,
            });
          } else {
            set({ planner: null, dailySchedules: [], analytics: null, recommendations: [] });
          }
        } catch (error) {
          console.error('Failed to load planner data:', error);
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
          toast.success('Study plan generated!');
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
          const recsRes   = await axios.get(`${API_ANALYTICS}/recommendations`);
          set({ analytics: reportRes.data.report, recommendations: recsRes.data.recommendations });
        } catch (err) {
          console.error('Failed to refresh analytics:', err);
        }
      },

      toggleTask: async (scheduleId, taskId, isCompleted) => {
        try {
          const response = await axios.patch(`${API_PLANNER}/schedules/${scheduleId}/tasks/${taskId}`, { isCompleted });
          set((state) => ({
            dailySchedules: state.dailySchedules.map((s) =>
              s._id === scheduleId ? response.data.schedule : s
            ),
          }));
          toast.success(isCompleted ? 'Task completed!' : 'Task unmarked.');
          await get().reloadAnalyticsAndRecommendations();
        } catch (err) {
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
          toast.error('Failed to update topic.');
        }
      },

      addNewTopic: async (name, subject, priority) => {
        try {
          const response = await axios.post(`${API_PLANNER}/topics`, { name, subject, priority });
          set({ planner: response.data.planner });
          toast.success('Topic added!');
          await get().reloadAnalyticsAndRecommendations();
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to add topic.';
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
          toast.error('Failed to update revision.');
        }
      },

      generateMockTest: async (subject) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_MOCK_TEST}/generate`, { subject });
          toast.success('Mock test generated!');
          return { success: true, mockTest: response.data.mockTest };
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
          formData.append('file', file);
          const response = await axios.post(`${API_PLANNER}/upload-syllabus`, formData);
          toast.success('Syllabus PDF processed!');
          return { success: true, syllabus: response.data.syllabus };
        } catch (err) {
          toast.error('Failed to process PDF.');
          return { success: false };
        } finally {
          set({ loading: false });
        }
      },

      uploadPYQ: async (file) => {
        set({ loading: true });
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await axios.post(`${API_PLANNER}/upload-pyq`, formData);
          toast.success('PYQ analyzed!');
          return { success: true, frequentTopics: response.data.frequentTopics };
        } catch (err) {
          toast.error('Failed to analyze PYQ.');
          return { success: false };
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
          toast.error('Failed to generate syllabus.');
          return { success: false };
        } finally {
          set({ loading: false });
        }
      },

      generateShortNotes: async (topicId) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_PLANNER}/topics/${topicId}/notes`);
          toast.success('Notes generated!');
          return { success: true, notes: response.data.notes };
        } catch (err) {
          toast.error('Failed to generate notes.');
          return { success: false };
        } finally {
          set({ loading: false });
        }
      },

      generateImportantQuestions: async (topicId) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_PLANNER}/topics/${topicId}/questions`);
          toast.success('Questions generated!');
          return { success: true, questions: response.data.questions };
        } catch (err) {
          toast.error('Failed to generate questions.');
          return { success: false };
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'smart-learning-planner-storage',
      // Only persist theme — Clerk handles user session persistence
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export default useStore;

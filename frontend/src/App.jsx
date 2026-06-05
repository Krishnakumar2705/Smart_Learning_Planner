import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useStore from './store/useStore';
import { BrainCircuit, Flame, BookOpen } from 'lucide-react';
import { PropagateLoader } from 'react-spinners';
import { AnimatePresence, motion } from 'framer-motion';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Syllabus from './pages/Syllabus';
import Revision from './pages/Revision';
import Analytics from './pages/Analytics';
import Pomodoro from './pages/Pomodoro';
import Profile from './pages/Profile';
import MockTests from './pages/MockTests';

export default function App() {
  const { user, loading, planner, analytics, theme, fetchAllPlannerData } = useStore();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchAllPlannerData();
    }
  }, [user, fetchAllPlannerData]);

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-indigo-50/30 to-cyan-50/30 dark:bg-none dark:bg-[#05060b]">
        <div className="text-center">
          <BrainCircuit className="w-16 h-16 text-indigo-500 animate-pulse mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Loading Workspace...</h2>
          <p className="text-slate-500 dark:text-gray-400 mt-2">Setting up database buffers and security hashes</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <Login />
      </>
    );
  }

  if (!planner && !loading) {
    return (
      <>
        <Toaster position="top-right" />
        <Setup />
      </>
    );
  }

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return { title: 'Dashboard Overview', desc: `Focus target: ${planner?.goal}` };
      case '/schedule': return { title: 'Daily Study planner', desc: 'Track daily task items and register study slots' };
      case '/syllabus': return { title: 'Syllabus Manager', desc: 'Add subjects topics, check syllabus, and update study goals' };
      case '/revision': return { title: 'Spaced Repetition Board', desc: 'Optimize memory using active recall & spaced repetitions' };
      case '/analytics': return { title: 'Analytics & Performance', desc: 'Recharts performance metrics and PDF file exports' };
      case '/pomodoro': return { title: 'Pomodoro Timer', desc: 'Configure custom deep work sessions' };
      case '/profile': return { title: 'User Profile', desc: 'Manage your gamification XP and account details' };
      case '/mock-tests': return { title: 'AI Mock Tests', desc: 'Generate and take personalized AI mock assessments' };
      default: return { title: '', desc: '' };
    }
  };

  const { title, desc } = getPageTitle(location.pathname);

  return (
    <div className={`min-h-screen relative bg-gradient-to-br from-white via-indigo-50/30 to-cyan-50/30 dark:bg-none dark:bg-[#05060b] flex flex-col md:flex-row ${theme === 'dark' ? 'dark' : ''}`}>
      <Toaster position="top-right" />
      <div className="bg-glow-purple -top-40 -left-40"></div>
      <div className="bg-glow-blue -bottom-40 -right-40"></div>

      <Sidebar />

      <main className="flex-grow p-6 md:p-8 relative z-10 overflow-y-auto max-h-screen">
        {loading && planner ? (
          <div className="min-h-[60vh] flex items-center justify-center flex-col">
            <PropagateLoader color="#6366f1" size={15} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-2">Aggregating Study Databases...</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">Compiling spacing logs, calculating streaks, and caching badge profiles...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                  {title}
                </h1>
                <p className="text-slate-500 dark:text-gray-400 text-sm">
                  {desc}
                </p>
              </div>

              <div className="flex gap-4">
                <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl flex items-center gap-3">
                  <Flame className="w-5 h-5 text-orange-400 animate-bounce" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 block uppercase leading-none">Current Streak</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white leading-none">{(analytics && analytics.currentStreak) || 0} Days</span>
                  </div>
                </div>
                
                <div className="px-4 py-2 bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 rounded-xl flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-cyan-500 dark:text-cyan-400 animate-pulse" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 block uppercase leading-none">Syllabus Progress</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white leading-none">{(analytics && analytics.overallCompletionPercent) || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
                <Route path="/schedule" element={<PageTransition><Schedule /></PageTransition>} />
                <Route path="/syllabus" element={<PageTransition><Syllabus /></PageTransition>} />
                <Route path="/revision" element={<PageTransition><Revision /></PageTransition>} />
                <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
                <Route path="/pomodoro" element={<PageTransition><Pomodoro /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                <Route path="/mock-tests" element={<PageTransition><MockTests /></PageTransition>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}

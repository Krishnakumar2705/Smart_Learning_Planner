import React from 'react';
import { NavLink } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  BrainCircuit,
  LogOut,
  LayoutDashboard,
  Calendar,
  ListTodo,
  CheckSquare,
  Award,
  Clock,
  Moon,
  Sun,
  User,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, theme, toggleTheme } = useStore();

  if (!user) return null;

  return (
    <aside className="w-full md:w-64 bg-white/80 dark:bg-[#0d0f19]/80 backdrop-blur-md border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 flex flex-col relative z-20">
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
            <BrainCircuit className="w-6 h-6 text-indigo-500 dark:text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Smart Planner</h2>
            <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 tracking-wider uppercase">Active Session</span>
          </div>
        </div>
        <button onClick={toggleTheme} className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white transition">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="p-4 mx-4 my-4 rounded-xl bg-slate-100 dark:bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-3">
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
          alt="User avatar"
          className="w-10 h-10 rounded-full border border-indigo-200 dark:border-indigo-500/20 bg-slate-200 dark:bg-[#1e293b]"
        />
        <div className="overflow-hidden">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.username}</h4>
          <span className="text-[10px] text-slate-500 dark:text-gray-400 truncate block">{user.email}</span>
        </div>
      </div>

      <nav className="flex-grow px-4 space-y-1.5">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/' },
          { id: 'schedule', name: 'Daily Schedule', icon: Calendar, path: '/schedule' },
          { id: 'syllabus', name: 'Syllabus Manager', icon: ListTodo, path: '/syllabus' },
          { id: 'revision', name: 'Revision Board', icon: CheckSquare, path: '/revision' },
          { id: 'analytics', name: 'Analytics Report', icon: Award, path: '/analytics' },
          { id: 'pomodoro', name: 'Pomodoro Timer', icon: Clock, path: '/pomodoro' },
          { id: 'mock-tests', name: 'Mock Tests', icon: FileText, path: '/mock-tests' },
          { id: 'profile', name: 'User Profile', icon: User, path: '/profile' }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 shadow-md shadow-indigo-600/5'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-200 dark:bg-white/5 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 dark:border-white/5 hover:border-red-500/20 bg-slate-100 dark:bg-slate-200 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-semibold text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/react';
import useStore from '../store/useStore';
import {
  BrainCircuit, LayoutDashboard, Calendar, ListTodo,
  CheckSquare, Award, Clock, Moon, Sun, User, FileText, LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useStore();

  if (!clerkUser) return null;

  const navItems = [
    { name: 'Dashboard',       icon: LayoutDashboard, path: '/' },
    { name: 'Daily Schedule',  icon: Calendar,        path: '/schedule' },
    { name: 'Syllabus Manager',icon: ListTodo,        path: '/syllabus' },
    { name: 'Revision Board',  icon: CheckSquare,     path: '/revision' },
    { name: 'Analytics Report',icon: Award,           path: '/analytics' },
    { name: 'Pomodoro Timer',  icon: Clock,           path: '/pomodoro' },
    { name: 'Mock Tests',      icon: FileText,        path: '/mock-tests' },
    { name: 'User Profile',    icon: User,            path: '/profile' },
  ];

  return (
    <aside className="w-full md:w-64 bg-white/80 dark:bg-[#0d0f19]/80 backdrop-blur-md border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 flex flex-col relative z-20">
      {/* Logo */}
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
        <button onClick={toggleTheme} className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* User info */}
      <div className="p-4 mx-4 my-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-3">
        <img
          src={clerkUser.imageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${clerkUser.username}`}
          alt="avatar"
          className="w-10 h-10 rounded-full border border-indigo-200 dark:border-indigo-500/20"
        />
        <div className="overflow-hidden">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {clerkUser.fullName || clerkUser.username}
          </h4>
          <span className="text-[10px] text-slate-500 dark:text-gray-400 truncate block">
            {clerkUser.primaryEmailAddress?.emailAddress}
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-grow px-4 space-y-1.5">
        {navItems.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-200 ${
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 dark:border-white/5 hover:border-red-500/20 bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-semibold text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

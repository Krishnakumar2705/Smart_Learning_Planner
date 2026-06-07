import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/react';
import useStore from '../store/useStore';
import {
  BrainCircuit, LayoutDashboard, Calendar, ListTodo,
  CheckSquare, Award, Clock, Moon, Sun, User, FileText, LogOut,
  Menu, X
} from 'lucide-react';

const Sidebar = () => {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useStore();
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {/* Mobile Top Navbar (Visible only on mobile/tablet) */}
      <header className="md:hidden w-full bg-white/90 dark:bg-[#0d0f19]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
            <BrainCircuit className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">Smart Planner</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition border border-slate-200 dark:border-white/10 rounded-lg bg-slate-100 dark:bg-white/5 cursor-pointer"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs md:hidden z-20 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar aside (Responsive Drawer on Mobile, Fixed Sidebar on Desktop) */}
      <aside className={`
        fixed md:sticky top-[61px] md:top-0 left-0 bottom-0 z-20
        w-64 bg-white/95 dark:bg-[#0d0f19]/95 backdrop-blur-md 
        border-r border-slate-200 dark:border-white/10 
        flex flex-col transform md:transform-none transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Desktop Title & Logo (Hidden on mobile) */}
        <div className="hidden md:flex p-6 border-b border-slate-200 dark:border-white/10 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
              <BrainCircuit className="w-6 h-6 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Smart Planner</h2>
              <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 tracking-wider uppercase">Active Session</span>
            </div>
          </div>
          <button onClick={toggleTheme} className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* User profile detail block */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-3">
          <img
            src={clerkUser.imageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${clerkUser.username}`}
            alt="avatar"
            className="w-9 h-9 rounded-full border border-indigo-200 dark:border-indigo-500/20"
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

        {/* Navigation links list */}
        <nav className="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition duration-200 ${
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 shadow-sm'
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

        {/* Footer / Signout */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-white/5 hover:border-red-500/20 bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import React from 'react';
import useStore from '../store/useStore';
import { User, Mail, Target, Flame, Clock, Award, Star, Zap } from 'lucide-react';

const Profile = () => {
  const { user, planner, analytics } = useStore();

  const totalHours = analytics?.totalHoursStudied || 0;
  const streak = analytics?.currentStreak || 0;
  
  // Gamification logic for XP and Levels
  const xp = totalHours * 120 + streak * 50; 
  const nextLevelXp = (Math.floor(xp / 1000) + 1) * 1000;
  const level = Math.floor(xp / 1000) + 1;
  const progressPercent = Math.round(((xp % 1000) / 1000) * 100);

  const getTitle = (lvl) => {
    if (lvl < 3) return 'Novice Learner';
    if (lvl < 7) return 'Consistent Scholar';
    if (lvl < 15) return 'Focused Master';
    return 'Grandmaster';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-8 rounded-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-cyan-500">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
                alt="Profile"
                className="w-full h-full rounded-full bg-[#0d0f19] object-cover"
              />
            </div>
            <div className="absolute -bottom-3 -right-3 bg-[#0d0f19] p-1.5 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 dark:text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                Lv {level}
              </div>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{user?.username || 'Student'}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm text-slate-500 dark:text-gray-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-400" />
                {user?.email || 'user@example.com'}
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                {getTitle(level)}
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl max-w-lg mx-auto md:mx-0">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide">XP Progress</span>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    <span className="text-indigo-400">{xp}</span> / {nextLevelXp} XP
                  </div>
                </div>
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
              <div className="h-3 w-full bg-slate-50 dark:bg-[#05060b] rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-100 dark:bg-emerald-500/10 rounded-full relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center gap-4 hover:border-indigo-500/30 transition">
          <div className="p-4 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
            <Target className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase block mb-1">Target Exam</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{planner?.goal || 'Not Set'}</h4>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center gap-4 hover:border-orange-500/30 transition">
          <div className="p-4 bg-rose-100 dark:bg-rose-500/10 rounded-xl border border-orange-500/20">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase block mb-1">Current Streak</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{streak} Days</h4>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center gap-4 hover:border-cyan-500/30 transition">
          <div className="p-4 bg-cyan-100 dark:bg-cyan-500/10 rounded-xl border border-cyan-200 dark:border-cyan-500/20">
            <Clock className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase block mb-1">Total Study Time</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{totalHours} Hours</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

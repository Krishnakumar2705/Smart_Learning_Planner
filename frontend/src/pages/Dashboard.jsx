import React from 'react';
import useStore from '../store/useStore';
import { Clock, Calendar, CheckSquare, BrainCircuit, Sparkles, Trophy, Award, Check, AlertTriangle, ListTodo, TrendingUp, BookOpen } from 'lucide-react';
import { differenceInDays, isSameDay, isPast, startOfDay } from 'date-fns';

const Dashboard = () => {
  const { analytics, planner, recommendations, dailySchedules } = useStore();

  const daysToExam = planner?.examDate ? differenceInDays(new Date(planner.examDate), new Date()) : null;

  const todaySchedule = dailySchedules?.find(s => isSameDay(new Date(s.date), new Date()));
  const totalTasks = todaySchedule?.tasks?.length || 0;
  const completedTasks = todaySchedule?.tasks?.filter(t => t.isCompleted).length || 0;
  const dailyProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const missedRevisions = planner?.spacedRepetition?.filter(sr => {
    const srDate = startOfDay(new Date(sr.date));
    const today = startOfDay(new Date());
    return srDate < today && !sr.isCompleted;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between glass-card-hover">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-1">Cumulative Study Time</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{(analytics && analytics.totalHoursStudied) || 0} Hours</h3>
            <span className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-1 block">From checked schedule slots</span>
          </div>
          <div className="p-3.5 bg-indigo-500/15 rounded-2xl border border-indigo-500/30">
            <Clock className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between glass-card-hover">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-1">Average Daily Practice</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{(analytics && analytics.averageDailyStudy) || 0} hrs</h3>
            <span className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-1 block">Daily available: {planner?.dailyHours} hrs</span>
          </div>
          <div className="p-3.5 bg-cyan-500/15 rounded-2xl border border-cyan-500/30">
            <Calendar className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between glass-card-hover">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-1">Syllabus Checkmarks</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {(analytics && analytics.completedTopics) || 0} / {(analytics && analytics.totalTopics) || 0}
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-1 block">Checked topics in checklist</span>
          </div>
          <div className="p-3.5 bg-emerald-500/15 rounded-2xl border border-emerald-500/30">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between glass-card-hover col-span-1">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-1">Exam Countdown</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {daysToExam !== null ? (daysToExam > 0 ? `${daysToExam} Days` : 'Today!') : 'No Date'}
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-1 block">Until target exam</span>
          </div>
          <div className="p-3.5 bg-rose-500/15 rounded-2xl border border-rose-500/30">
            <Calendar className="w-6 h-6 text-rose-400" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between glass-card-hover col-span-1">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-1">Daily Task Progress</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{dailyProgress}%</h3>
            <span className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-1 block">Today's completion</span>
          </div>
          <div className="p-3.5 bg-blue-500/15 rounded-2xl border border-blue-500/30">
            <ListTodo className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 col-span-2 shadow-lg">
           <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subject-wise Progress</h3>
          </div>
          <div className="space-y-3">
            {planner?.subjects?.map(subj => {
              const subjTopics = planner.topics?.filter(t => t.subject === subj) || [];
              const completedSubjTopics = subjTopics.filter(t => t.isCompleted).length;
              const completionPercent = subjTopics.length > 0 ? Math.round((completedSubjTopics / subjTopics.length) * 100) : 0;
              return (
                <div key={subj} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-slate-600 dark:text-gray-300 font-semibold truncate">{subj}</div>
                  <div className="flex-1 bg-slate-200 dark:bg-white/5 border border-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full"
                      style={{ width: `${completionPercent}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-xs font-bold text-indigo-400 text-right">{completionPercent}%</div>
                </div>
              );
            })}
            {(!planner?.subjects || planner.subjects.length === 0) && (
              <div className="text-xs text-slate-400 dark:text-gray-500 italic">No subjects added.</div>
            )}
          </div>
        </div>
      </div>
      
      {missedRevisions.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-4 items-start">
          <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-rose-400 mb-1">Missed Revisions Alert!</h4>
            <p className="text-xs text-rose-300/80 mb-2">You have missed {missedRevisions.length} spaced repetition session(s). Catch up to maintain retention!</p>
            <div className="flex flex-wrap gap-2">
              {missedRevisions.slice(0, 3).map(mr => (
                <span key={mr._id} className="text-[10px] bg-rose-500/20 border border-rose-500/30 text-rose-300 px-2 py-1 rounded">
                  {mr.topicName} ({mr.subject})
                </span>
              ))}
              {missedRevisions.length > 3 && (
                <span className="text-[10px] bg-rose-500/20 border border-rose-500/30 text-rose-300 px-2 py-1 rounded">
                  +{missedRevisions.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Performance Analyst</h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/20 text-[9px] font-bold text-indigo-400 uppercase tracking-wide">
              Gemini Pro
            </span>
          </div>

          <div className="space-y-4">
            {recommendations && recommendations.length > 0 ? (
              recommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-200 dark:bg-white/5 border border-white/5 flex gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg flex-shrink-0 max-h-9 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 block uppercase leading-none mb-1.5">
                      Subject focus: {rec.subject}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">{rec.text}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-2 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">
                      <Check className="w-3 h-3" />
                      <span>Actionable: {rec.actionable}</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400 dark:text-gray-500 italic">No recommendations loaded yet. Mark topics or schedules completed to trigger AI advice!</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gamified Badge Academy</h3>
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/20 text-[9px] font-bold text-yellow-400 uppercase tracking-wide">
              Achievements
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics && analytics.badges && analytics.badges.length > 0 ? (
              analytics.badges.map((badge) => (
                <div key={badge.id} className="p-4 rounded-xl bg-slate-200 dark:bg-white/5 border border-white/5 flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${badge.color} text-slate-900 dark:text-white shadow-lg`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{badge.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 leading-tight">{badge.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-slate-400 dark:text-gray-500 text-xs italic">
                <span>No badges unlocked yet! Maintain streaks (3+ days) and check off syllabus topics (5+) to earn certifications!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

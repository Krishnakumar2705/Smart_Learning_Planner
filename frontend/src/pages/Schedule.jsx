import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Check } from 'lucide-react';

const Schedule = () => {
  const { dailySchedules, toggleTask } = useStore();
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {dailySchedules.map((sched, idx) => {
          const isSelected = selectedDayIdx === idx;
          const dateObj = new Date(sched.date);
          const dayLabel = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
          const dateLabel = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const isDayDone = sched.isDayCompleted;

          return (
            <button
              key={sched._id || idx}
              onClick={() => setSelectedDayIdx(idx)}
              className={`p-3 rounded-xl border text-center transition cursor-pointer relative ${
                isSelected
                  ? 'bg-indigo-600/10 border-indigo-500/50 text-slate-900 dark:text-white'
                  : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-300 dark:bg-white/10'
              }`}
            >
              <span className="text-[10px] font-bold block uppercase tracking-wider">{dayLabel}</span>
              <span className="text-sm font-bold block mt-1">{dateLabel}</span>
              {isDayDone && (
                <span className="absolute top-1 right-1 p-0.5 bg-emerald-500 text-slate-900 dark:text-white rounded-full">
                  <Check className="w-2.5 h-2.5" />
                </span>
              )}
              <span className="text-[9px] font-semibold mt-2 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/5 border border-white/5 block truncate">
                {sched.studyHoursLogged} Hours
              </span>
            </button>
          );
        })}
      </div>

      {dailySchedules[selectedDayIdx] ? (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Study Slots Checklist: {new Date(dailySchedules[selectedDayIdx].date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-300 font-semibold">
              Logged hours today: {dailySchedules[selectedDayIdx].studyHoursLogged} Hours
            </span>
          </div>

          <div className="space-y-4">
            {dailySchedules[selectedDayIdx].tasks.map((task) => (
              <div
                key={task._id}
                onClick={() => toggleTask(dailySchedules[selectedDayIdx]._id, task._id, !task.isCompleted)}
                className={`p-4 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                  task.isCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-500 dark:text-gray-400'
                    : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:border-indigo-200 dark:border-indigo-500/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-1.5 rounded-lg border flex items-center justify-center ${
                    task.isCompleted
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-transparent border-slate-200 dark:border-white/10 text-transparent'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${task.isCompleted ? 'line-through' : ''}`}>{task.taskName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold">{task.timeSlot}</span>
                      <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                      <span className="text-[10px] text-indigo-400 font-bold uppercase">{task.subject}</span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 border border-white/5 text-slate-500 dark:text-gray-400">
                  {task.durationHours} hrs
                </span>
              </div>
            ))}

            {dailySchedules[selectedDayIdx].tasks.length === 0 && (
              <p className="text-center text-slate-400 dark:text-gray-500 text-xs italic py-8">No specific tasks allocated for this date.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 glass-panel rounded-2xl border border-slate-200 dark:border-white/10">
          <p className="text-xs text-slate-400 dark:text-gray-500 italic">No study planners loaded. Please select active plans.</p>
        </div>
      )}
    </div>
  );
};

export default Schedule;

import React, { useState } from 'react';
import useStore from '../store/useStore';
import { BrainCircuit, Check } from 'lucide-react';

const Revision = () => {
  const { planner, toggleRevision } = useStore();
  const [srSubjectFilter, setSrSubjectFilter] = useState('All');

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-indigo-600/5 border border-indigo-200 dark:border-indigo-500/20 flex gap-4">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl max-h-12 flex items-center justify-center flex-shrink-0">
          <BrainCircuit className="w-6 h-6 text-indigo-400 animate-spin-slow" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Pedagogical Spaced Repetition Timeline</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
            We automate your revisions based on **Ebbinghaus' Forgetting Curve** to lock learning into permanent memory.
            Revision 1 triggers after **1 day**, Revision 2 after **3 days**, Revision 3 after **7 days**, and Revision 4 runs **2 days before your exam**.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSrSubjectFilter('All')}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
            srSubjectFilter === 'All'
              ? 'bg-indigo-100 dark:bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
              : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-300 dark:bg-white/10'
          }`}
        >
          All Subjects
        </button>
        {planner.subjects.map(s => (
          <button
            key={s}
            onClick={() => setSrSubjectFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
              srSubjectFilter === s
                ? 'bg-indigo-100 dark:bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-300 dark:bg-white/10'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 relative">
        <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-slate-200 dark:bg-white/5"></div>
        
        <div className="space-y-6 relative z-10">
          {planner.spacedRepetition
            .filter(sr => srSubjectFilter === 'All' || sr.subject === srSubjectFilter)
            .map((sr) => (
              <div key={sr._id} className="flex gap-6 items-start">
                <button
                  onClick={() => toggleRevision(sr._id, !sr.isCompleted)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 flex-shrink-0 cursor-pointer mt-1 ${
                    sr.isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-slate-900 dark:text-white'
                      : 'bg-[#0d0f19] border-slate-200 dark:border-white/10 text-transparent hover:border-indigo-500/50'
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </button>

                <div className={`flex-grow p-4 rounded-xl border transition ${
                  sr.isCompleted ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-500 dark:text-gray-400' : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border border-white/5 uppercase ${
                        sr.revisionNumber === 1 ? 'bg-indigo-100 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-400' :
                        sr.revisionNumber === 2 ? 'bg-cyan-100 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20 text-cyan-400' :
                        sr.revisionNumber === 3 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {sr.revisionName}
                      </span>
                      <h4 className={`text-sm font-semibold mt-1.5 ${sr.isCompleted ? 'line-through' : ''}`}>
                        Active Recall: {sr.topicName}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold block">
                        Schedule: {new Date(sr.date).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mt-0.5">
                        {sr.subject}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {planner.spacedRepetition.filter(sr => srSubjectFilter === 'All' || sr.subject === srSubjectFilter).length === 0 && (
            <p className="text-center text-slate-400 dark:text-gray-500 text-xs italic py-12">No spaced repetition tasks found for this subject filter.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Revision;

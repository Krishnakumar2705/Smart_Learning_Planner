import React from 'react';
import { BrainCircuit, Clock } from 'lucide-react';

const MockTests = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center py-16 px-8 bg-slate-100/50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 max-w-lg mx-auto">
        <div className="inline-flex p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 mb-6">
          <BrainCircuit className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Mock Tests</h2>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Coming Soon</span>
        </div>
        <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
          AI-powered mock test generation is temporarily unavailable. We're working on bringing it back with improvements. Check back soon!
        </p>
      </div>
    </div>
  );
};

export default MockTests;

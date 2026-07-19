import React, { useState } from 'react';
import useStore from '../store/useStore';
import { BrainCircuit, Loader2, FileText, CheckCircle2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const MockTests = () => {
  const { planner, generateMockTest, saveMockTest } = useStore();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState(null);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});

  const handleGenerate = async () => {
    if (!selectedSubject) return toast.error('Please select a subject');
    setLoading(true);
    setTestData(null);
    setSubmitted(false);
    setAnswers({});
    setScore(0);

    const data = await generateMockTest(selectedSubject);
    if (data.success && data.mockTest) {
      setTestData(data.mockTest);
      toast.success('Mock Test ready!');
    } else {
      toast.error(data.error || 'Failed to generate test');
    }
    setLoading(false);
  };

  const handleOptionChange = (qIndex, option) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = async () => {
    if (!testData) return;
    let calculatedScore = 0;
    testData.mcqs.forEach((mcq, idx) => {
      if (answers[idx] === mcq.answer) calculatedScore += 1;
    });
    setScore(calculatedScore);
    setSubmitted(true);
    toast.success(`Submitted! MCQ Score: ${calculatedScore}/${testData.mcqs.length}`);
    if (saveMockTest) {
      await saveMockTest({
        subject: selectedSubject,
        mcqs: testData.mcqs,
        shortQuestions: testData.shortQuestions,
        longQuestions: testData.longQuestions,
        score: calculatedScore,
      });
    }
  };

  const handleReset = () => {
    setTestData(null);
    setSubmitted(false);
    setAnswers({});
    setScore(0);
  };

  const answeredCount = Object.keys(answers).length;
  const totalMCQs = testData?.mcqs?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header / Generator */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Generate Mock Test</h2>
            <p className="text-xs text-slate-500 dark:text-gray-400">AI-powered with static fallback — always works</p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={selectedSubject}
            onChange={(e) => { setSelectedSubject(e.target.value); handleReset(); }}
            className="flex-1 bg-slate-50 dark:bg-[#05060b] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:border-indigo-500 focus:outline-none text-sm"
          >
            <option value="">Select a subject...</option>
            {planner?.subjects?.map(subj => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedSubject}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 text-sm whitespace-nowrap"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              : <><Zap className="w-4 h-4" /> Generate Test</>
            }
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="glass-panel p-12 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <div className="text-center">
            <p className="font-bold text-slate-900 dark:text-white">Generating your test...</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Trying AI first, falling back to question bank if needed</p>
          </div>
        </div>
      )}

      {/* Test content */}
      {testData && !loading && (
        <div className="space-y-6">
          {/* Progress bar (before submit) */}
          {!submitted && (
            <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 mb-1.5">
                  <span>MCQ Progress</span>
                  <span>{answeredCount} / {totalMCQs} answered</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${totalMCQs ? (answeredCount / totalMCQs) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={answeredCount === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition whitespace-nowrap"
              >
                Submit Test
              </button>
            </div>
          )}

          {/* Score banner */}
          {submitted && (
            <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Test Completed!</h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm mb-3">
                MCQ Score: <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{score}</span>
                <span className="text-lg text-slate-500 dark:text-gray-400"> / {totalMCQs}</span>
              </p>
              <button
                onClick={() => { handleReset(); }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition"
              >
                Try Another Test
              </button>
            </div>
          )}

          {/* MCQs */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-6">
            <h3 className="text-base font-bold text-indigo-400 border-b border-slate-200 dark:border-white/10 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Multiple Choice Questions
            </h3>
            <div className="space-y-6">
              {testData.mcqs.map((mcq, idx) => (
                <div key={idx} className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                  <p className="text-slate-900 dark:text-white font-medium mb-3 text-sm">{idx + 1}. {mcq.question}</p>
                  <div className="space-y-2">
                    {mcq.options.map((opt, i) => {
                      const isSelected = answers[idx] === opt;
                      const isCorrect  = submitted && opt === mcq.answer;
                      const isWrong    = submitted && isSelected && opt !== mcq.answer;

                      let cls = 'bg-white dark:bg-[#05060b] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:border-indigo-400 cursor-pointer';
                      if (!submitted && isSelected) cls = 'bg-indigo-500/15 border-indigo-500 text-indigo-300 cursor-pointer';
                      if (submitted) {
                        if (isCorrect)   cls = 'bg-emerald-500/15 border-emerald-500 text-emerald-400 cursor-default';
                        else if (isWrong) cls = 'bg-rose-500/15 border-rose-500 text-rose-400 cursor-default';
                        else              cls = 'bg-white dark:bg-[#05060b] border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-500 opacity-50 cursor-default';
                      }

                      return (
                        <label
                          key={i}
                          onClick={() => handleOptionChange(idx, opt)}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${cls}`}
                        >
                          <span className="flex-1 text-sm">{opt}</span>
                          {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Short Questions */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
            <h3 className="text-base font-bold text-cyan-400 border-b border-slate-200 dark:border-white/10 pb-3">
              Short Answer Questions <span className="text-xs font-normal text-slate-500 dark:text-gray-400">(Self-grade)</span>
            </h3>
            <div className="space-y-3">
              {testData.shortQuestions.map((sq, idx) => (
                <div key={idx} className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                  <p className="text-slate-900 dark:text-white text-sm font-medium">{idx + 1}. {sq}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Long Questions */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
            <h3 className="text-base font-bold text-amber-400 border-b border-slate-200 dark:border-white/10 pb-3">
              Long Answer Questions <span className="text-xs font-normal text-slate-500 dark:text-gray-400">(Self-grade)</span>
            </h3>
            <div className="space-y-3">
              {testData.longQuestions.map((lq, idx) => (
                <div key={idx} className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                  <p className="text-slate-900 dark:text-white text-sm font-medium">{idx + 1}. {lq}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom submit (repeated for convenience) */}
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-4 rounded-xl font-bold transition text-sm"
            >
              Submit & See Score
            </button>
          )}
        </div>
      )}

      {/* Empty state when no planner */}
      {!planner && !loading && (
        <div className="text-center py-16 bg-slate-100/50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
          <BrainCircuit className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Planner</h3>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Complete the setup wizard first to see your subjects here.</p>
        </div>
      )}
    </div>
  );
};

export default MockTests;

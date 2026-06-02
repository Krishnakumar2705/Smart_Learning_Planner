import React, { useState } from 'react';
import useStore from '../store/useStore';
import { BrainCircuit, Loader2, FileText, CheckCircle2 } from 'lucide-react';
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
    try {
      const data = await generateMockTest(selectedSubject);
      setTestData(data);
      toast.success('Mock Test generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate mock test');
    }
    setLoading(false);
  };

  const handleOptionChange = (qIndex, option) => {
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = async () => {
    let calculatedScore = 0;
    testData.mcqs.forEach((mcq, idx) => {
      if (answers[idx] === mcq.answer) {
        calculatedScore += 1; // Basic scoring for MCQs only
      }
    });
    setScore(calculatedScore);
    setSubmitted(true);
    toast.success(`Test Submitted! Your MCQ Score: ${calculatedScore}/${testData.mcqs.length}`);
    
    // Save to DB
    if (saveMockTest) {
      await saveMockTest({
        subject: selectedSubject,
        mcqs: testData.mcqs,
        shortQuestions: testData.shortQuestions,
        longQuestions: testData.longQuestions,
        score: calculatedScore
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Generate AI Mock Test</h2>
        <div className="flex gap-4 items-center">
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-[#05060b] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select a subject...</option>
            {planner?.subjects?.map(subj => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            Generate
          </button>
        </div>
      </div>

      {testData && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-indigo-400 border-b border-slate-200 dark:border-white/10 pb-2 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Multiple Choice Questions
            </h3>
            <div className="space-y-6">
              {testData.mcqs.map((mcq, idx) => (
                <div key={idx} className="bg-slate-200 dark:bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-slate-900 dark:text-white font-medium mb-3">{idx + 1}. {mcq.question}</p>
                  <div className="space-y-2">
                    {mcq.options.map((opt, i) => {
                      const isSelected = answers[idx] === opt;
                      const isCorrect = submitted && opt === mcq.answer;
                      const isWrong = submitted && isSelected && opt !== mcq.answer;
                      
                      let optionClass = "bg-slate-50 dark:bg-[#05060b] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:border-indigo-500";
                      if (submitted) {
                        if (isCorrect) optionClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                        else if (isWrong) optionClass = "bg-rose-500/20 border-rose-500 text-rose-400";
                        else optionClass = "bg-slate-50 dark:bg-[#05060b] border-slate-200 dark:border-white/10 text-slate-400 dark:text-gray-500 opacity-50";
                      } else if (isSelected) {
                        optionClass = "bg-indigo-500/20 border-indigo-500 text-indigo-300";
                      }

                      return (
                        <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${optionClass}`}>
                          <input 
                            type="radio" 
                            name={`mcq-${idx}`}
                            value={opt}
                            disabled={submitted}
                            checked={isSelected}
                            onChange={() => handleOptionChange(idx, opt)}
                            className="hidden"
                          />
                          <span className="flex-1 text-sm">{opt}</span>
                          {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-indigo-400 border-b border-slate-200 dark:border-white/10 pb-2 mb-4">Short Questions (Self-grade)</h3>
            <div className="space-y-4">
              {testData.shortQuestions.map((sq, idx) => (
                <div key={idx} className="bg-slate-200 dark:bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-slate-900 dark:text-white font-medium">{idx + 1}. {sq}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-indigo-400 border-b border-slate-200 dark:border-white/10 pb-2 mb-4">Long Questions (Self-grade)</h3>
            <div className="space-y-4">
              {testData.longQuestions.map((lq, idx) => (
                <div key={idx} className="bg-slate-200 dark:bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-slate-900 dark:text-white font-medium">{idx + 1}. {lq}</p>
                </div>
              ))}
            </div>
          </div>

          {!submitted && (
            <button 
              onClick={handleSubmit}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-slate-900 dark:text-white p-4 rounded-xl font-bold transition"
            >
              Submit Test
            </button>
          )}

          {submitted && (
            <div className="bg-indigo-500/20 border border-indigo-500 text-center p-6 rounded-xl">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Test Completed!</h3>
              <p className="text-indigo-300">MCQ Score: <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{score}/{testData.mcqs.length}</span></p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-4">Self-grade your short and long questions for a complete evaluation.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MockTests;

import React, { useState } from 'react';
import useStore from '../store/useStore';
import { ShieldAlert, BrainCircuit, LayoutList, ChevronRight, ChevronLeft, CheckCircle2, X, Trash2, Sparkles } from 'lucide-react';
import { PropagateLoader } from 'react-spinners';
import { useClerk } from '@clerk/react';

const Setup = () => {
  const { generateNewPlan, loading } = useStore();
  const { signOut } = useClerk();
  
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState('');

  // Step 1 State
  const [examDate, setExamDate] = useState('');
  const [goal, setGoal] = useState('Score 90%+');
  const [dailyHours, setDailyHours] = useState(4);
  const [prepLevel, setPrepLevel] = useState('Intermediate');
  
  // Step 2 State
  const [subjectInput, setSubjectInput] = useState('');
  const [subjects, setSubjects] = useState([]);

  // Step 3 State
  const [topics, setTopics] = useState([]); // Array of { name, subject, priority, unit }
  
  // Handlers for Step 1
  const handleStep1Next = () => {
    setFormError('');
    if (!examDate || !goal) {
      setFormError('Please pick an exam date and define your goal.');
      return;
    }
    if (new Date(examDate) <= new Date()) {
      setFormError('Exam date must be in the future.');
      return;
    }
    setStep(2);
  };

  // Handlers for Step 2
  const addSubjectTag = () => {
    const term = subjectInput.trim().slice(0, 50);
    if (!term) return;
    if (!/^[a-zA-Z0-9\s\-\.\+#]+$/.test(term)) {
      setFormError('Subject name can only contain letters, numbers, spaces, and basic symbols (- . + #).');
      return;
    }
    if (!subjects.includes(term)) {
      setSubjects([...subjects, term]);
      setSubjectInput('');
      setFormError('');
    }
  };

  const removeSubjectTag = (tag) => {
    setSubjects(subjects.filter(s => s !== tag));
  };

  const handleStep2Next = async () => {
    setFormError('');
    if (subjects.length === 0) {
      setFormError('Please add at least one subject.');
      return;
    }
    setTopics([]);
    setStep(3);
  };

  // Handlers for Step 3
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicSubject, setNewTopicSubject] = useState('');
  const [newTopicPriority, setNewTopicPriority] = useState('Medium');

  const handleAddTopic = () => {
    if (!newTopicName || !newTopicSubject) return;
    setTopics([...topics, { name: newTopicName, subject: newTopicSubject, priority: newTopicPriority }]);
    setNewTopicName('');
  };

  const handleRemoveTopic = (index) => {
    const newTopics = [...topics];
    newTopics.splice(index, 1);
    setTopics(newTopics);
  };

  const togglePriority = (index) => {
    const newTopics = [...topics];
    const priorities = ['Low', 'Medium', 'High'];
    const curr = newTopics[index].priority || 'Medium';
    const nextIdx = (priorities.indexOf(curr) + 1) % priorities.length;
    newTopics[index].priority = priorities[nextIdx];
    setTopics(newTopics);
  };

  const handleStep3Next = () => {
    if (topics.length === 0) {
      setFormError('Please review and ensure there is at least one topic.');
      return;
    }
    setStep(4);
  };

  // Final Generate
  const handleFinalize = async () => {
    // Collect weak subjects based on high priority topics
    const weakSubjects = [...new Set(topics.filter(t => t.priority === 'High').map(t => t.subject))];
    const finalSubjects = subjects.length > 0 ? subjects : [...new Set(topics.map(t => t.subject))];

    const res = await generateNewPlan({
      examDate,
      goal,
      subjects: finalSubjects,
      weakSubjects,
      dailyHours,
      prepLevel,
      topics // Send topics to backend if it accepts them
    });
    if (!res.success) setFormError(res.error);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 space-x-2 sm:space-x-4">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step === s 
              ? 'bg-indigo-500 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(99,102,241,0.6)]'
              : step > s 
                ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/30' 
                : 'bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-slate-400 dark:text-gray-500 border border-slate-300 dark:border-slate-200 dark:border-white/10'
          }`}>
            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
          </div>
          {s < 4 && (
            <div className={`w-6 sm:w-12 h-0.5 mx-2 ${step > s ? 'bg-indigo-500/50' : 'bg-slate-200 dark:bg-slate-300 dark:bg-white/10'}`}></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-white via-indigo-50/30 to-cyan-50/30 dark:bg-none dark:bg-[#05060b] overflow-y-auto py-12 px-4">
      <div className="bg-glow-purple -top-40 -left-40"></div>
      <div className="bg-glow-blue -bottom-40 -right-40"></div>

      <div className="w-full max-w-3xl glass-panel p-8 rounded-3xl relative z-10 shadow-2xl border border-slate-200 dark:border-white/10">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 mb-4">
            <BrainCircuit className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-gray-400">
            Setup Your Learning Workspace
          </h1>
        </div>

        {renderStepIndicator()}

        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm animate-shake">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <PropagateLoader color="#6366f1" size={15} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 mt-10">Processing your data...</h3>
            <p className="text-slate-500 dark:text-gray-400 text-sm text-center max-w-md">Our AI is analyzing the structure, extracting topics, and finding high-weightage areas. Please wait.</p>
          </div>
        ) : (
          <div className="min-h-[400px] flex flex-col justify-between">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Step 1: Basic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-2">Exam Target Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition"
                      value={examDate}
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      onChange={(e) => setExamDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-2">Primary Target Goal</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition appearance-none"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                    >
                      <option value="Score 90%+">Score 90%+</option>
                      <option value="Crack Placement">Crack Placement</option>
                      <option value="University Topper">University Topper</option>
                      <option value="Just Pass (40%+) ">Just Pass (40%+)</option>
                      <option value="Crack Competitive Exam">Crack Competitive Exam</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-2">
                      Daily Available Study Time: <span className="text-indigo-400 font-bold">{dailyHours} Hours</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="16"
                      step="1"
                      className="w-full accent-indigo-500"
                      value={dailyHours}
                      onChange={(e) => setDailyHours(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-2">Current Preparation Level</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition appearance-none"
                      value={prepLevel}
                      onChange={(e) => setPrepLevel(e.target.value)}
                    >
                      <option value="Beginner">Beginner (Starting from Scratch)</option>
                      <option value="Intermediate">Intermediate (Have basic understanding)</option>
                      <option value="Advanced">Advanced (Need mock revision & tests)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Step 2: Add Your Subjects</h3>

                <div className="p-5 bg-slate-100 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <LayoutList className="w-3.5 h-3.5" />
                      Add Subjects
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="e.g. Physics, DBMS, React"
                        className="flex-grow px-4 py-2.5 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                        maxLength={50}
                        value={subjectInput}
                        onChange={(e) => setSubjectInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSubjectTag()}
                      />
                      <button
                        type="button"
                        onClick={addSubjectTag}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white rounded-xl text-sm font-bold transition"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-200 font-semibold">
                          {tag}
                          <button onClick={() => removeSubjectTag(tag)} className="text-indigo-400 hover:text-slate-900 dark:text-white cursor-pointer"><X className="w-3.5 h-3.5"/></button>
                        </span>
                      ))}
                      {subjects.length === 0 && <span className="text-xs text-slate-400 dark:text-gray-500">No subjects added.</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in flex-grow flex flex-col">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Step 3: Review Topics</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">Review and adjust the extracted topics. You can add or modify priorities.</p>
                  </div>
                  <div className="text-xs font-bold text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                    Total: {topics.length}
                  </div>
                </div>

                {/* Add Custom Topic Inline */}
                <div className="flex flex-wrap sm:flex-nowrap gap-2 p-3 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10">
                  <input
                    type="text"
                    placeholder="Topic Name"
                    className="flex-grow px-3 py-2 bg-transparent text-sm text-slate-900 dark:text-white outline-none border-b border-transparent focus:border-indigo-500 min-w-[150px]"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Subject Name"
                    className="w-full sm:w-32 px-3 py-2 bg-transparent text-sm text-slate-900 dark:text-white outline-none border-b border-transparent focus:border-indigo-500"
                    value={newTopicSubject}
                    onChange={(e) => setNewTopicSubject(e.target.value)}
                  />
                  <select
                    className="w-full sm:w-auto px-3 py-2 bg-transparent text-sm text-slate-500 dark:text-gray-400 outline-none border-b border-transparent focus:border-indigo-500 appearance-none"
                    value={newTopicPriority}
                    onChange={(e) => setNewTopicPriority(e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <button onClick={handleAddTopic} className="w-full sm:w-auto px-4 py-2 bg-slate-300 dark:bg-white/10 hover:bg-white/20 text-slate-900 dark:text-white rounded-lg text-sm font-bold transition">Add</button>
                </div>

                <div className="flex-grow overflow-y-auto max-h-[40vh] custom-scrollbar space-y-2 pr-2">
                  {topics.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-200 dark:bg-white/5 border border-white/5 rounded-xl hover:bg-slate-300 dark:bg-white/10 transition group">
                      <div className="overflow-hidden pr-4">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase">{t.subject} {t.unit ? `• ${t.unit}` : ''}</div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button 
                          onClick={() => togglePriority(idx)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider cursor-pointer border ${
                            t.priority === 'High' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            t.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                            'bg-gray-500/20 text-slate-600 dark:text-gray-300 border-gray-500/30'
                          }`}
                        >
                          {t.priority === 'High' ? '🔥 High' : t.priority}
                        </button>
                        <button onClick={() => handleRemoveTopic(idx)} className="text-slate-400 dark:text-gray-500 hover:text-red-400 transition cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {topics.length === 0 && (
                    <div className="text-center py-10 text-slate-400 dark:text-gray-500 text-sm">No topics found. Add some above.</div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fade-in text-center py-8 flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ready to Launch!</h3>
                <p className="text-slate-500 dark:text-gray-400 text-sm max-w-md">
                  Your AI study map is ready to be generated. We will create a daily schedule tailored to your goal of <strong className="text-indigo-400">{goal}</strong> by <strong className="text-indigo-400">{examDate}</strong>.
                </p>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-6">
                  <div className="bg-slate-200 dark:bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                    <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{topics.length}</div>
                    <div className="text-xs text-slate-400 dark:text-gray-500 font-bold uppercase">Total Topics</div>
                  </div>
                  <div className="bg-slate-200 dark:bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                    <div className="text-2xl font-black text-red-400 mb-1">{topics.filter(t => t.priority === 'High').length}</div>
                    <div className="text-xs text-slate-400 dark:text-gray-500 font-bold uppercase">High Priority</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/5">
              <button
                type="button"
                onClick={() => step > 1 ? setStep(step - 1) : signOut()}
                className="px-5 py-2.5 text-sm font-semibold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white transition bg-transparent border border-transparent cursor-pointer flex items-center gap-2"
              >
                {step > 1 ? <><ChevronLeft className="w-4 h-4"/> Back</> : 'Logout'}
              </button>
              
              <button
                type="button"
                onClick={
                  step === 1 ? handleStep1Next :
                  step === 2 ? handleStep2Next :
                  step === 3 ? handleStep3Next :
                  handleFinalize
                }
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-slate-900 dark:text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                {step === 4 ? (
                  <><span>Generate Plan</span> <Sparkles className="w-4 h-4" /></>
                ) : (
                  <><span>Continue</span> <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setup;

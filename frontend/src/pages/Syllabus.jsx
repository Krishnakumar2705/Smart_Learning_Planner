import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Plus, Check, FileText, HelpCircle, X } from 'lucide-react';

const Syllabus = () => {
  const { planner, toggleTopic, addNewTopic, generateShortNotes, generateImportantQuestions } = useStore();
  const [showAddCustomTopicModal, setShowAddCustomTopicModal] = useState(false);
  const [customTopicName, setCustomTopicName] = useState('');
  const [customTopicSubject, setCustomTopicSubject] = useState('');
  const [customTopicPriority, setCustomTopicPriority] = useState('Medium');
  const [customTopicUnit, setCustomTopicUnit] = useState('');

  const [modalContent, setModalContent] = useState(null); // { type: 'notes' | 'questions', title: string, data: any }

  const handleAction = async (topicId, topicName, type) => {
    if (type === 'notes') {
      const res = await generateShortNotes(topicId);
      if (res.success) {
        setModalContent({ type: 'notes', title: `Short Notes: ${topicName}`, data: res.notes });
      }
    } else if (type === 'questions') {
      const res = await generateImportantQuestions(topicId);
      if (res.success) {
        setModalContent({ type: 'questions', title: `Important Questions: ${topicName}`, data: res.questions });
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Syllabus Topic Checklist</h3>
        <button
          onClick={() => setShowAddCustomTopicModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Topic</span>
        </button>
      </div>

      <div className="space-y-6">
        {planner.subjects.map((subj) => {
          const subjTopics = planner.topics.filter(t => t.subject === subj);
          const completedSubjTopics = subjTopics.filter(t => t.isCompleted).length;
          const completionPercent = subjTopics.length > 0 ? Math.round((completedSubjTopics / subjTopics.length) * 100) : 0;
          
          // Group by unit
          const units = subjTopics.reduce((acc, topic) => {
            const unit = topic.unit || 'General';
            if (!acc[unit]) acc[unit] = [];
            acc[unit].push(topic);
            return acc;
          }, {});

          return (
            <div key={subj} className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10 group-hover:bg-indigo-100 dark:bg-indigo-500/10 transition-all"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4 mb-5">
                <div>
                  <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 uppercase tracking-wide">{subj} Syllabus</h4>
                  <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold mt-1 block">
                    Completed topics: <span className="text-slate-900 dark:text-white">{completedSubjTopics}</span> / {subjTopics.length}
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-slate-200 dark:bg-white/5 px-4 py-2 rounded-xl">
                  <div className="w-32 bg-slate-100 dark:bg-black/40 border border-white/5 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500 relative"
                      style={{ width: `${completionPercent}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{completionPercent}%</span>
                </div>
              </div>

              {Object.keys(units).length === 0 ? (
                <p className="text-center text-sm text-slate-400 dark:text-gray-500 italic py-6">No topics mapped for this subject yet.</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(units).map(([unit, topics]) => (
                    <div key={unit} className="bg-black/20 p-4 rounded-xl border border-white/5">
                      <h5 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        Unit: {unit}
                      </h5>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {topics.map((topic) => (
                          <div
                            key={topic._id}
                            className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              topic.isCompleted
                                ? 'bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/20 text-slate-500 dark:text-gray-400'
                                : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:border-indigo-500/30 hover:bg-slate-300 dark:bg-white/10'
                            }`}
                          >
                            <div 
                              className="flex items-center gap-3 cursor-pointer flex-grow overflow-hidden"
                              onClick={() => toggleTopic(topic._id, !topic.isCompleted)}
                            >
                              <div className={`p-1.5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                                topic.isCompleted
                                  ? 'bg-indigo-500 border-indigo-500 text-slate-900 dark:text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                                  : 'bg-black/50 border-white/20 text-transparent hover:border-indigo-400'
                              }`}>
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-sm font-semibold truncate transition-all ${topic.isCompleted ? 'line-through opacity-60' : ''}`}>
                                {topic.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 pl-9 sm:pl-0">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                                topic.priority === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                topic.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                'bg-gray-500/20 text-slate-600 dark:text-gray-300 border border-gray-500/30'
                              }`}>
                                {topic.priority}
                              </span>
                              
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleAction(topic._id, topic.name, 'notes')}
                                  title="Generate Short Notes"
                                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 text-slate-500 dark:text-gray-400 transition border border-transparent hover:border-indigo-500/30 cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleAction(topic._id, topic.name, 'questions')}
                                  title="Important Questions"
                                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-500 dark:text-gray-400 transition border border-transparent hover:border-cyan-500/30 cursor-pointer"
                                >
                                  <HelpCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Notes/Questions */}
      {modalContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="w-full max-w-2xl bg-[#0a0a0f] border border-indigo-500/30 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.15)] flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-white/10 bg-slate-200 dark:bg-white/5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {modalContent.type === 'notes' ? <FileText className="w-5 h-5 text-indigo-400" /> : <HelpCircle className="w-5 h-5 text-cyan-400" />}
                {modalContent.title}
              </h3>
              <button
                onClick={() => setModalContent(null)}
                className="p-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-slate-300 dark:bg-white/10 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar text-slate-600 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
              {modalContent.data || "No content generated yet. The AI is still thinking or failed to generate."}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/40 flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-5 py-2 bg-slate-300 dark:bg-white/10 hover:bg-white/20 text-slate-900 dark:text-white rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Custom Topic */}
      {showAddCustomTopicModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-[#0a0a0f] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Custom Topic</h3>
              <button onClick={() => setShowAddCustomTopicModal(false)} className="text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5">Topic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tree Traversals"
                  className="w-full px-4 py-2.5 bg-black/50 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl text-sm text-slate-900 dark:text-white outline-none transition"
                  value={customTopicName}
                  onChange={(e) => setCustomTopicName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5">Unit (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 1"
                  className="w-full px-4 py-2.5 bg-black/50 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl text-sm text-slate-900 dark:text-white outline-none transition"
                  value={customTopicUnit}
                  onChange={(e) => setCustomTopicUnit(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5">Subject</label>
                <select
                  className="w-full px-4 py-2.5 bg-black/50 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl text-sm text-slate-600 dark:text-gray-300 outline-none transition"
                  value={customTopicSubject}
                  onChange={(e) => setCustomTopicSubject(e.target.value)}
                >
                  <option value="">Select subject...</option>
                  {planner.subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5">Priority Weight</label>
                <select
                  className="w-full px-4 py-2.5 bg-black/50 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl text-sm text-slate-600 dark:text-gray-300 outline-none transition"
                  value={customTopicPriority}
                  onChange={(e) => setCustomTopicPriority(e.target.value)}
                >
                  <option value="High">High Priority (Weakness areas)</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowAddCustomTopicModal(false)}
                className="px-5 py-2.5 bg-transparent hover:bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white rounded-xl text-sm font-semibold transition cursor-pointer border border-transparent"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (customTopicName && customTopicSubject) {
                    const res = await addNewTopic(customTopicName, customTopicSubject, customTopicPriority);
                    // Also consider unit for backend if supported, omitting unit for now as store only takes 3 args
                    if (res.success) {
                      setCustomTopicName('');
                      setCustomTopicSubject('');
                      setCustomTopicPriority('Medium');
                      setCustomTopicUnit('');
                      setShowAddCustomTopicModal(false);
                    }
                  }
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                Add Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Syllabus;

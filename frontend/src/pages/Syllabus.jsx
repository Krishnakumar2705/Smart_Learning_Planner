import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Plus, Check, X, Trash2, BookOpen, AlertTriangle } from 'lucide-react';

const Syllabus = () => {
  const { 
    planner, 
    toggleTopic, 
    addNewTopic, 
    deleteTopic, 
    addSubject, 
    deleteSubject
  } = useStore();

  const [showAddCustomTopicModal, setShowAddCustomTopicModal] = useState(false);
  const [customTopicName, setCustomTopicName] = useState('');
  const [customTopicSubject, setCustomTopicSubject] = useState('');
  const [customTopicPriority, setCustomTopicPriority] = useState('Medium');
  const [customTopicUnit, setCustomTopicUnit] = useState('');

  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // { type: 'subject' | 'topic', id: string, name: string }

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    if (showDeleteConfirm.type === 'subject') {
      await deleteSubject(showDeleteConfirm.name);
    } else {
      await deleteTopic(showDeleteConfirm.id);
    }
    setShowDeleteConfirm(null);
  };

  // If no planner exists, show a friendly empty state
  if (!planner) {
    return (
      <div className="text-center py-20 bg-slate-100/50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 max-w-lg mx-auto">
        <BookOpen className="w-16 h-16 text-indigo-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Planner</h3>
        <p className="text-slate-500 dark:text-gray-400 text-sm px-6">
          Please complete the workspace setup wizard to generate your study plan and syllabus topic list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-10">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-100/40 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Syllabus Topic Checklist</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400">Track, add, delete and study topics for all your current subjects.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="flex-grow sm:flex-grow-0 px-4 py-2.5 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border border-slate-300 dark:border-white/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
          <button
            onClick={() => {
              if (planner.subjects.length > 0) {
                setCustomTopicSubject(planner.subjects[0]);
              }
              setShowAddCustomTopicModal(true);
            }}
            className="flex-grow sm:flex-grow-0 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-slate-900 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Topic</span>
          </button>
        </div>
      </div>

      {/* Main Subjects and Topics List */}
      <div className="space-y-6">
        {planner.subjects.length === 0 ? (
          <div className="text-center py-20 bg-slate-100/50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
            <BookOpen className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500 dark:text-gray-400">No subjects in your planner yet. Add a new subject above!</p>
          </div>
        ) : (
          planner.subjects.map((subj) => {
            const subjTopics = planner.topics.filter(t => t.subject === subj);
            const completedSubjTopics = subjTopics.filter(t => t.isCompleted).length;
            const completionPercent = subjTopics.length > 0 ? Math.round((completedSubjTopics / subjTopics.length) * 100) : 0;
            
            // Group topics by unit
            const units = subjTopics.reduce((acc, topic) => {
              const unit = topic.unit || 'General';
              if (!acc[unit]) acc[unit] = [];
              acc[unit].push(topic);
              return acc;
            }, {});

            return (
              <div 
                key={subj} 
                className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden group hover:border-indigo-500/20 dark:hover:border-white/20 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                
                {/* Subject Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4 mb-5">
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-400 dark:from-indigo-400 dark:to-cyan-400 uppercase tracking-wide">
                        {subj} Syllabus
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold mt-0.5 block">
                        Completed topics: <span className="text-slate-900 dark:text-white">{completedSubjTopics}</span> / {subjTopics.length}
                      </span>
                    </div>
                    {/* Delete Subject Button */}
                    <button
                      onClick={() => setShowDeleteConfirm({ type: 'subject', name: subj })}
                      title={`Delete Subject: ${subj}`}
                      className="p-2 text-slate-400 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-400 transition hover:bg-red-500/10 rounded-xl cursor-pointer border border-transparent hover:border-red-500/20 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 bg-slate-200/50 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-slate-300/30 dark:border-white/5">
                    <div className="w-24 sm:w-32 bg-slate-100 dark:bg-black/40 border border-slate-300/40 dark:border-white/5 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500 relative"
                        style={{ width: `${completionPercent}%` }}
                      >
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10"></div>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{completionPercent}%</span>
                  </div>
                </div>

                {/* Units and Topics */}
                {Object.keys(units).length === 0 ? (
                  <div className="text-center py-8 bg-slate-100/30 dark:bg-black/20 rounded-xl border border-slate-200/50 dark:border-white/5">
                    <p className="text-sm text-slate-400 dark:text-gray-500 italic mb-3">No topics mapped for this subject yet.</p>
                    <button
                      onClick={() => {
                        setCustomTopicSubject(subj);
                        setShowAddCustomTopicModal(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer"
                    >
                      Add First Topic
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(units).map(([unit, topics]) => (
                      <div key={unit} className="bg-slate-100/35 dark:bg-black/20 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-white/5">
                        <h5 className="text-xs sm:text-sm font-bold text-indigo-500 dark:text-indigo-300 mb-3 flex items-center gap-2">
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
                                  : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:border-indigo-500/30 hover:bg-slate-300 dark:hover:bg-white/10'
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

                              <div className="flex items-center justify-between sm:justify-end gap-2 pl-9 sm:pl-0">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                                  topic.priority === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                  topic.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                  'bg-gray-500/20 text-slate-600 dark:text-gray-300 border border-gray-500/30'
                                }`}>
                                  {topic.priority}
                                </span>
                                
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setShowDeleteConfirm({ type: 'topic', id: topic._id, name: topic.name })}
                                    title="Delete Topic"
                                    className="p-1.5 rounded-lg bg-slate-200 dark:bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-500 dark:text-gray-400 transition border border-transparent hover:border-red-500/30 cursor-pointer active:scale-95"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
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
          })
        )}
      </div>

      {/* Modal for Add Custom Topic */}
      {showAddCustomTopicModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0a0a0f] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-2xl animate-scale-up">
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
                  className="w-full px-4 py-2.5 bg-black/55 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl text-sm text-slate-900 dark:text-white outline-none transition"
                  value={customTopicName}
                  onChange={(e) => setCustomTopicName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5">Unit (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 1"
                  className="w-full px-4 py-2.5 bg-black/55 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl text-sm text-slate-900 dark:text-white outline-none transition"
                  value={customTopicUnit}
                  onChange={(e) => setCustomTopicUnit(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5">Subject</label>
                <select
                  className="w-full px-4 py-2.5 bg-black/55 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl text-sm text-slate-600 dark:text-gray-300 outline-none transition"
                  value={customTopicSubject}
                  onChange={(e) => setCustomTopicSubject(e.target.value)}
                >
                  {planner.subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5">Priority Weight</label>
                <select
                  className="w-full px-4 py-2.5 bg-black/55 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl text-sm text-slate-600 dark:text-gray-300 outline-none transition"
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
                className="px-5 py-2.5 bg-transparent hover:bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (customTopicName && customTopicSubject) {
                    const res = await addNewTopic(customTopicName, customTopicSubject, customTopicPriority);
                    if (res.success) {
                      setCustomTopicName('');
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

      {/* Modal for Add Subject */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0a0a0f] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Subject</h3>
              <button onClick={() => setShowAddSubjectModal(false)} className="text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Marketing"
                  className="w-full px-4 py-2.5 bg-black/55 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl text-sm text-slate-900 dark:text-white outline-none transition"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  maxLength={50}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && newSubjectName.trim()) {
                      const res = await addSubject(newSubjectName.trim());
                      if (res.success) {
                        setNewSubjectName('');
                        setShowAddSubjectModal(false);
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="px-5 py-2.5 bg-transparent hover:bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (newSubjectName.trim()) {
                    const res = await addSubject(newSubjectName.trim());
                    if (res.success) {
                      setNewSubjectName('');
                      setShowAddSubjectModal(false);
                    }
                  }
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                Create Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Deletion Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#0d0d12] border border-red-500/20 p-6 rounded-2xl shadow-2xl text-center animate-scale-up">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Are you sure?</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-6">
              You are about to delete the {showDeleteConfirm.type === 'subject' ? 'subject' : 'topic'}{' '}
              <strong className="text-red-400">"{showDeleteConfirm.name}"</strong>. 
              {showDeleteConfirm.type === 'subject' && ' All associated topics will be permanently removed.'} This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 shadow-lg shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Syllabus;

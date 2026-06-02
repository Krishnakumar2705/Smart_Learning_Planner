import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';

const Pomodoro = () => {
  const [pomodoroMode, setPomodoroMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);
  const [pomodoroIsActive, setPomodoroIsActive] = useState(false);
  const [pomodoroSessionsCount, setPomodoroSessionsCount] = useState(0);
  const [pomodoroMuted, setPomodoroMuted] = useState(false);

  useEffect(() => {
    let interval = null;
    if (pomodoroIsActive && pomodoroTimeLeft > 0) {
      interval = setInterval(() => {
        setPomodoroTimeLeft((time) => time - 1);
      }, 1000);
    } else if (pomodoroTimeLeft === 0 && pomodoroIsActive) {
      clearInterval(interval);
      setPomodoroIsActive(false);
      
      if (!pomodoroMuted) {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.5);
        } catch (e) {
          console.log('Audio playback block by browser policy.');
        }
      }

      if (pomodoroMode === 'focus') {
        const nextSessionsCount = pomodoroSessionsCount + 1;
        setPomodoroSessionsCount(nextSessionsCount);
        if (nextSessionsCount % 4 === 0) {
          setPomodoroMode('longBreak');
          setPomodoroTimeLeft(15 * 60);
        } else {
          setPomodoroMode('shortBreak');
          setPomodoroTimeLeft(5 * 60);
        }
      } else {
        setPomodoroMode('focus');
        setPomodoroTimeLeft(25 * 60);
      }
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [pomodoroIsActive, pomodoroTimeLeft, pomodoroMode, pomodoroSessionsCount, pomodoroMuted]);

  const formatPomodoroTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getPomodoroRingPercent = () => {
    const total = pomodoroMode === 'focus' ? 25 * 60 : pomodoroMode === 'shortBreak' ? 5 * 60 : 15 * 60;
    return ((total - pomodoroTimeLeft) / total) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="max-w-md mx-auto glass-panel p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-100 dark:bg-indigo-500/5 blur-3xl"></div>

        <div className="relative z-10">
          <div className="inline-flex gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-200 dark:bg-white/5 border border-white/5 mb-8">
            {[
              { id: 'focus', name: 'Focus Slot', time: 25 * 60 },
              { id: 'shortBreak', name: 'Short Break', time: 5 * 60 },
              { id: 'longBreak', name: 'Long Break', time: 15 * 60 }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPomodoroIsActive(false);
                  setPomodoroMode(p.id);
                  setPomodoroTimeLeft(p.time);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  pomodoroMode === p.id
                    ? 'bg-indigo-600 text-slate-900 dark:text-white shadow'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-200 dark:bg-white/5'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="relative w-56 h-56 mx-auto mb-8 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke={pomodoroMode === 'focus' ? '#6366f1' : '#10b981'}
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - getPomodoroRingPercent() / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-none mb-1">
                {formatPomodoroTime(pomodoroTimeLeft)}
              </h2>
              <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                {pomodoroMode === 'focus' ? 'Focus Session' : 'Relax & Breathe'}
              </span>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setPomodoroMuted(!pomodoroMuted)}
              className="p-3 bg-slate-100 dark:bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:bg-white/10 rounded-xl border border-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white transition cursor-pointer"
            >
              {pomodoroMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setPomodoroIsActive(!pomodoroIsActive)}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg ${
                pomodoroIsActive
                  ? 'bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white shadow-red-600/10'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white shadow-indigo-600/20'
              }`}
            >
              {pomodoroIsActive ? 'Pause' : 'Start Focus'}
            </button>

            <button
              onClick={() => {
                setPomodoroIsActive(false);
                setPomodoroTimeLeft(pomodoroMode === 'focus' ? 25 * 60 : pomodoroMode === 'shortBreak' ? 5 * 60 : 15 * 60);
              }}
              className="p-3 bg-slate-100 dark:bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:bg-white/10 rounded-xl border border-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-8 border-t border-white/5 pt-6 flex justify-around">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold uppercase block">Completed Sessions</span>
              <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">{pomodoroSessionsCount} Focus blocks</span>
            </div>
            
            <div>
              <span className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold uppercase block">Aggregate Timer</span>
              <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">{pomodoroSessionsCount * 25} Mins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;

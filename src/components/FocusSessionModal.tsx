import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Flame, 
  Timer, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { Task } from '../types';
import { sound } from '../utils/audio';

interface FocusSessionModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onCompleteSession: (task: Task) => void;
}

export const FocusSessionModal: React.FC<FocusSessionModalProps> = ({
  isOpen,
  task,
  onClose,
  onCompleteSession
}) => {
  const durationMins = task?.target_duration_minutes || 25;
  const initialSeconds = durationMins * 60;

  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (task) {
      const s = (task.target_duration_minutes || 25) * 60;
      setSecondsRemaining(s);
      setIsRunning(false);
      setHasStarted(false);
    }
  }, [task, isOpen]);

  useEffect(() => {
    if (isRunning && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            sound.playLevelUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, secondsRemaining]);

  if (!isOpen || !task) return null;

  const toggleTimer = () => {
    sound.playClick();
    if (!hasStarted) setHasStarted(true);
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    sound.playClick();
    setIsRunning(false);
    setSecondsRemaining((task.target_duration_minutes || 25) * 60);
    setHasStarted(false);
  };

  const handleFinish = () => {
    sound.playQuestComplete();
    onCompleteSession(task);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalTime = (task.target_duration_minutes || 25) * 60;
  const progressPct = Math.round(((totalTime - secondsRemaining) / totalTime) * 100);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-modal-title"
    >
      <div className="relative w-full max-w-md bg-[#16130f] border border-[#3e3223] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black text-center text-[#e6ded3] animate-in fade-in zoom-in-95">
        {/* Close / Abandon Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8c7d6b] hover:text-[#e4c278] p-1.5 rounded-lg hover:bg-[#231d16] transition-colors text-xs font-mono"
        >
          Abandon Chamber ✕
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold mb-4">
          <Flame className="w-3.5 h-3.5" />
          <span>QUEST IN PROGRESS</span>
        </div>

        <h2 id="focus-modal-title" className="font-rpg text-xl sm:text-2xl font-bold text-[#f4ecd8] tracking-wide mb-2">
          {task.title}
        </h2>
        <p className="text-xs text-[#9c8d7b] mb-6 max-w-xs mx-auto">
          {task.description || 'Channel undistracted focus to satisfy session verification requirements.'}
        </p>

        {/* Circular Breathing / Timer Display */}
        <div className="relative w-56 h-56 mx-auto mb-6 flex items-center justify-center">
          {/* Ambient Pulsing Ring */}
          <div 
            className={`absolute inset-0 rounded-full border border-[#c99a4a]/20 transition-all duration-1000 ${
              isRunning ? 'scale-105 border-[#c99a4a]/40 animate-pulse' : ''
            }`} 
          />

          {/* Progress Ring SVG */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="96"
              className="text-[#211b14]"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="112"
              cy="112"
              r="96"
              className="text-[#c99a4a] transition-all duration-500"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 96}
              strokeDashoffset={(2 * Math.PI * 96) * (1 - progressPct / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-mono text-4xl sm:text-5xl font-extrabold text-[#f4ecd8] tracking-tight">
              {formattedTime}
            </div>
            <div className="text-[11px] font-rpg text-[#c99a4a] tracking-widest uppercase mt-1">
              {isRunning ? 'CHAMBER ACTIVE' : secondsRemaining === 0 ? 'SESSION READY' : 'PAUSED'}
            </div>
          </div>
        </div>

        {/* Session Controls */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={resetTimer}
            className="p-3 rounded-xl bg-[#1d1813] hover:bg-[#282119] border border-[#382d20] text-[#a89984] hover:text-[#e4c278] transition-colors"
            title="Reset Chamber Timer"
            aria-label="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleTimer}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#b38536] via-[#c99a4a] to-[#966d28] hover:from-[#c99a4a] hover:to-[#b38536] text-[#120e09] font-rpg font-bold tracking-wider shadow-lg shadow-amber-950/40 flex items-center gap-2 text-sm transition-all"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE SESSION</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{hasStarted ? 'RESUME SESSION' : 'COMMENCE FOCUS'}</span>
              </>
            )}
          </button>
        </div>

        {/* Complete Session Action */}
        <div className="border-t border-[#2d2419] pt-4">
          <button
            type="button"
            onClick={handleFinish}
            className="w-full py-2.5 px-4 bg-[#1f1912] hover:bg-[#2d2419] border border-[#4a3a27] hover:border-[#c99a4a] text-[#e4c278] rounded-xl font-rpg text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>FINISH & CLAIM VERIFIED REWARDS</span>
          </button>
          <div className="text-[10px] text-[#736553] mt-2 font-mono">
            {secondsRemaining === 0 
              ? 'Chamber threshold met! Quest will be recorded as session_verified.'
              : 'Completing will grant full XP & Gold with verified session seal.'}
          </div>
        </div>
      </div>
    </div>
  );
};

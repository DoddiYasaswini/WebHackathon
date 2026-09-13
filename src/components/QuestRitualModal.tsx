import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, Coins, Flame, ArrowRight } from 'lucide-react';
import { CompleteQuestResult } from '../types';

interface QuestRitualModalProps {
  isOpen: boolean;
  result: CompleteQuestResult | null;
  onClose: () => void;
  onProceedToLevelUp?: () => void;
}

export const QuestRitualModal: React.FC<QuestRitualModalProps> = ({
  isOpen,
  result,
  onClose,
  onProceedToLevelUp
}) => {
  useEffect(() => {
    if (isOpen && result) {
      // Trigger golden & bronze sparks
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c99a4a', '#e4c278', '#d4af37', '#ffffff', '#8c6729']
      });
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const handleContinue = () => {
    if (result.levelUp && onProceedToLevelUp) {
      onProceedToLevelUp();
    } else {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ritual-title"
    >
      <div className="relative w-full max-w-md bg-[#16130f] border border-[#4d3e2b] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black text-center text-[#e6ded3] animate-in fade-in zoom-in-95 duration-300">
        {/* Sacred Checkmark Aura */}
        <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping duration-1000" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c99a4a] to-[#73521e] p-[2px] shadow-lg shadow-amber-950/50">
            <div className="w-full h-full bg-[#17130e] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-[#e4c278]" />
            </div>
          </div>
        </div>

        <div className="text-[11px] font-mono tracking-widest text-[#c99a4a] uppercase font-bold mb-1">
          QUEST RITUAL COMPLETE
        </div>

        <h2 id="ritual-title" className="font-rpg text-2xl font-bold text-[#f4ecd8] tracking-wider mb-2">
          {result.task.title}
        </h2>

        <p className="text-xs text-[#9c8d7b] mb-6">
          Your real-world discipline has infused your character with vitality and power.
        </p>

        {/* Rewards Earned Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 bg-[#110f0c] border border-[#2d2419] rounded-2xl mb-6 shadow-inner font-mono">
          {/* XP Gained */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#1b1712] border border-[#382c1e]">
            <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-base sm:text-lg font-extrabold text-[#f4ecd8]">
              +{result.xpGained}
            </span>
            <span className="text-[10px] text-[#8c7d6c] uppercase font-rpg font-semibold tracking-wider">EXP</span>
          </div>

          {/* Gold Gained */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#1b1712] border border-[#382c1e]">
            <Coins className="w-4 h-4 text-[#e4c278] mb-1" />
            <span className="text-base sm:text-lg font-extrabold text-[#e4c278]">
              +{result.goldGained}
            </span>
            <span className="text-[10px] text-[#8c7d6c] uppercase font-rpg font-semibold tracking-wider">GOLD</span>
          </div>

          {/* Attribute Gained */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#1b1712] border border-[#382c1e]">
            <Flame className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-base sm:text-lg font-extrabold text-emerald-300">
              +{result.attributeGained}
            </span>
            <span className="text-[10px] text-[#8c7d6c] uppercase font-rpg font-semibold tracking-wider truncate max-w-full px-1">
              {result.attributeName}
            </span>
          </div>
        </div>

        {/* Streak notification */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#a89984] mb-6 font-mono">
          <Flame className="w-4 h-4 text-red-400" />
          <span>Current Streak: <strong className="text-[#f4ecd8]">{result.currentStreak} Days</strong></span>
        </div>

        {/* Level Up Indicator (if leveled up) */}
        {result.levelUp ? (
          <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-amber-950/40 border border-amber-600/50 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-left">
              <Sparkles className="w-5 h-5 text-[#e4c278] animate-spin" />
              <div>
                <div className="font-rpg font-bold text-sm text-[#f4ecd8]">ASCENSION READY!</div>
                <div className="text-[11px] text-amber-300/80">You have crossed the level threshold.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              className="px-3 py-1.5 bg-[#c99a4a] text-[#120f0c] rounded-lg font-rpg font-bold text-xs"
            >
              ASCEND
            </button>
          </div>
        ) : null}

        {/* Action button */}
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#b38536] via-[#c99a4a] to-[#966d28] hover:from-[#c99a4a] hover:to-[#b38536] text-[#120e09] font-rpg font-bold tracking-wider rounded-xl shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <span>{result.levelUp ? 'BEHOLD ASCENSION' : 'RESUME JOURNEY'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Shield, ArrowUp, Crown, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface LevelUpOverlayProps {
  isOpen: boolean;
  previousLevel: number;
  newLevel: number;
  onClose: () => void;
}

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({
  isOpen,
  previousLevel,
  newLevel,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playLevelUp();

      // Premium firework cascade
      const duration = 2500;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#c99a4a', '#e4c278', '#fff', '#aa8033']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#c99a4a', '#e4c278', '#fff', '#aa8033']
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const levelDelta = Math.max(1, newLevel - previousLevel);
  const bonusGold = levelDelta * 50;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/92 backdrop-blur-md overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
    >
      {/* Radiant Light Rays Backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#c99a4a] via-[#826127] to-transparent blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-lg bg-[#15120e] border-2 border-[#5c4930] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black text-center text-[#e6ded3] animate-in zoom-in-90 duration-500">
        {/* Crest */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#c99a4a]/40 animate-ping duration-1000" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#e4c278] via-[#c99a4a] to-[#594017] p-[2px] shadow-xl shadow-amber-950/60 rotate-3">
            <div className="w-full h-full bg-[#17130e] rounded-[14px] flex items-center justify-center">
              <Crown className="w-10 h-10 text-[#e4c278]" />
            </div>
          </div>
        </div>

        <div className="text-xs font-mono tracking-widest text-[#c99a4a] uppercase font-bold mb-2">
          THRESHOLD SURPASSED
        </div>

        <h2 id="levelup-title" className="font-rpg text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fff7e6] via-[#e4c278] to-[#99732b] tracking-wider mb-2">
          LEVEL UP
        </h2>

        {/* Level Progression Indicator 07 -> 08 */}
        <div className="flex items-center justify-center gap-4 my-6 font-rpg">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#736553] uppercase font-mono">Previous</span>
            <span className="text-2xl font-extrabold text-[#7d705f]">
              {String(previousLevel).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#231d16] border border-[#4a3a27]">
            <ArrowUp className="w-5 h-5 text-[#e4c278] rotate-90" />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#c99a4a] uppercase font-mono font-bold">Attained</span>
            <span className="text-4xl font-black text-[#e4c278] drop-shadow-[0_0_12px_rgba(201,154,74,0.4)]">
              {String(newLevel).padStart(2, '0')}
            </span>
          </div>
        </div>

        <p className="font-rpg text-sm tracking-wider text-[#d8cdbc] mb-6 italic">
          &ldquo;YOUR CHARACTER HAS GROWN.&rdquo;
        </p>

        {/* Stat Upgrade Benefits */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-[#110e0a] border border-[#2b2216] rounded-2xl mb-8 font-mono text-xs">
          <div className="p-2 rounded-xl bg-[#191510] border border-[#33281a]">
            <div className="text-[10px] text-[#8c7d6c] uppercase font-rpg font-semibold">STRENGTH</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">+{levelDelta}</div>
          </div>
          <div className="p-2 rounded-xl bg-[#191510] border border-[#33281a]">
            <div className="text-[10px] text-[#8c7d6c] uppercase font-rpg font-semibold">INTELLECT</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">+{levelDelta}</div>
          </div>
          <div className="p-2 rounded-xl bg-[#191510] border border-[#33281a]">
            <div className="text-[10px] text-[#8c7d6c] uppercase font-rpg font-semibold">VITALITY</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">+{levelDelta}</div>
          </div>
          <div className="p-2 rounded-xl bg-[#191510] border border-[#33281a]">
            <div className="text-[10px] text-[#8c7d6c] uppercase font-rpg font-semibold">BONUS GOLD</div>
            <div className="text-sm font-bold text-[#e4c278] mt-0.5">+{bonusGold}</div>
          </div>
        </div>

        {/* Claim Ascension Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-[#b38536] via-[#c99a4a] to-[#966d28] hover:from-[#c99a4a] hover:to-[#b38536] text-[#120e09] font-rpg font-black tracking-widest uppercase rounded-xl shadow-xl shadow-amber-950/60 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>CLAIM ASCENSION</span>
        </button>
      </div>
    </div>
  );
};

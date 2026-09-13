import React from 'react';
import { Compass, Sparkles, Coins, Flame, CheckCircle, ArrowRight } from 'lucide-react';
import { TaskHistory } from '../types';

interface JourneyViewProps {
  journey: TaskHistory[];
  onNavigateTab: (tab: string) => void;
}

export const JourneyView: React.FC<JourneyViewProps> = ({ journey, onNavigateTab }) => {
  return (
    <div className="space-y-6">
      <section className="bg-[#14110d] border border-[#2f251a] p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-6 h-6 text-[#c99a4a]" />
            <h1 className="font-rpg text-xl sm:text-2xl font-bold text-[#f4ecd8] tracking-wider uppercase">
              JOURNEY CHRONICLE & AUDIT
            </h1>
          </div>
          <p className="text-xs text-[#9c8d7b]">
            Authoritative chronological record of all completed quests, verified sessions, and rewards accrued.
          </p>
        </div>

        <div className="font-mono text-xs text-[#8c7d6c] px-3 py-1.5 rounded-xl bg-[#17130e] border border-[#2b2116]">
          {journey.length} Deeds Logged
        </div>
      </section>

      {journey.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-[#292015] rounded-3xl bg-[#120f0c]/50">
          <Compass className="w-12 h-12 text-[#4d3d29] mx-auto mb-3" />
          <h3 className="font-rpg text-base font-bold text-[#d8cdbc] mb-1 tracking-wider uppercase">
            YOUR JOURNEY LOG IS EMPTY
          </h3>
          <p className="text-xs text-[#80715f] max-w-sm mx-auto mb-4">
            Complete your first quest in the dashboard or quest registry to begin compiling your personal legend.
          </p>
          <button
            type="button"
            onClick={() => onNavigateTab('quests')}
            className="px-4 py-2 bg-[#231a10] hover:bg-[#2d2215] border border-[#4a3924] hover:border-[#c99a4a] text-[#e4c278] rounded-xl font-rpg text-xs font-semibold tracking-wider transition-all"
          >
            VIEW QUEST LOG
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {journey.map((entry) => (
            <article
              key={entry.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#15120e] border border-[#2d2317] hover:border-[#423321] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#211a12] border border-[#3b2d1d] flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded bg-[#211a12] border border-[#382b1d] text-[10px] font-mono text-[#a89984]">
                      {entry.category}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/40">
                      {entry.verification_status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-[#736553]">
                      {new Date(entry.completed_at).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="font-rpg text-sm sm:text-base font-bold text-[#f4ecd8]">
                    {entry.task_title}
                  </h3>
                </div>
              </div>

              {/* Rewards Earned in this Deed */}
              <div className="flex items-center gap-3 font-mono text-xs w-full sm:w-auto justify-end border-t sm:border-t-0 border-[#231a11] pt-2 sm:pt-0">
                <div className="flex items-center gap-1 text-amber-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+{entry.xp_earned} XP</span>
                </div>
                <div className="flex items-center gap-1 text-[#f4ecd8] font-bold">
                  <Coins className="w-3.5 h-3.5 text-[#e4c278]" />
                  <span>+{entry.gold_earned} G</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>+{entry.attribute_points} {entry.attribute}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

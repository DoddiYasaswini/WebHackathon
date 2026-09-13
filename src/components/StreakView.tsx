import React from 'react';
import { Flame, Calendar, Trophy, Award, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { UserProfile } from '../types';

interface StreakViewProps {
  profile: UserProfile;
  streakData: {
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    recent_days: { day: string; date: string; active: boolean }[];
  } | null;
}

export const StreakView: React.FC<StreakViewProps> = ({ profile, streakData }) => {
  const currentStreak = streakData?.current_streak ?? profile.current_streak;
  const longestStreak = streakData?.longest_streak ?? profile.longest_streak;

  const milestones = [
    { days: 3, name: 'Tri-Solar Spark', reward: '50 Gold', unlocked: currentStreak >= 3 },
    { days: 7, name: 'Week Warrior', reward: '150 Gold + "Week Warrior" Badge', unlocked: currentStreak >= 7 },
    { days: 14, name: 'Fortnight Guardian', reward: '300 Gold + Obsidian Shard', unlocked: currentStreak >= 14 },
    { days: 30, name: 'Monthly Paragon', reward: '750 Gold + "Ascendant" Title', unlocked: currentStreak >= 30 },
    { days: 60, name: 'Iron Discipline', reward: '1500 Gold + Legendary Relic', unlocked: currentStreak >= 60 },
    { days: 100, name: 'Centurion of Will', reward: '3000 Gold + Mythic Aura', unlocked: currentStreak >= 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Streak Banner */}
      <section className="bg-gradient-to-br from-[#23150d] via-[#1a110a] to-[#120c08] border border-[#4d2f19] p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-red-600 via-amber-600 to-amber-950 p-[2px] shadow-2xl shadow-red-950/60 flex items-center justify-center">
              <div className="w-full h-full bg-[#170e09] rounded-[22px] flex items-center justify-center">
                <Flame className="w-12 h-12 text-amber-500 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/50 border border-red-800/40 text-red-300 font-mono text-xs font-bold mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>ACTIVE STREAK EMBERS</span>
              </div>
              <h1 className="font-rpg text-3xl sm:text-4xl font-extrabold text-[#f4ecd8] tracking-wider">
                🔥 {currentStreak} DAY STREAK
              </h1>
              <p className="text-xs text-[#a8907a] mt-1 font-sans">
                Consecutive days of real-world disciplined activity logged in the realm.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#140c07] border border-[#331c10] rounded-2xl text-center min-w-[140px]">
            <div className="text-[10px] text-[#8c6b52] uppercase font-rpg font-semibold tracking-wider">All-Time Peak</div>
            <div className="font-mono text-2xl font-black text-[#e4c278] mt-0.5">{longestStreak} Days</div>
          </div>
        </div>
      </section>

      {/* 7-Day Visual Calendar */}
      <section className="bg-[#14110d] border border-[#2f251a] p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#c99a4a]" />
          <h2 className="font-rpg text-base font-bold text-[#f4ecd8] tracking-wider uppercase">
            WEEKLY QUEST LOG RHYTHM
          </h2>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center font-mono">
          {(streakData?.recent_days || [
            { day: 'MON', date: '2026-09-06', active: true },
            { day: 'TUE', date: '2026-09-07', active: true },
            { day: 'WED', date: '2026-09-08', active: true },
            { day: 'THU', date: '2026-09-09', active: true },
            { day: 'FRI', date: '2026-09-10', active: true },
            { day: 'SAT', date: '2026-09-11', active: true },
            { day: 'SUN', date: '2026-09-12', active: false }
          ]).map((day, idx) => (
            <div 
              key={idx}
              className={`p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                day.active
                  ? 'bg-[#21150c] border-[#5e381b] text-[#e4c278] shadow-md'
                  : 'bg-[#15120e] border-[#292015] text-[#5e5142]'
              }`}
            >
              <span className="text-[10px] sm:text-xs font-rpg font-semibold tracking-wider mb-2">
                {day.day}
              </span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                day.active ? 'bg-amber-500/20 text-[#e4c278]' : 'bg-[#100d0a] text-[#42372c]'
              }`}>
                {day.active ? '✓' : '○'}
              </div>
              <span className="text-[9px] text-[#736453] mt-2 hidden sm:block">
                {day.active ? 'Verified' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Streak Milestones */}
      <section className="bg-[#14110d] border border-[#2f251a] p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-[#c99a4a]" />
          <h2 className="font-rpg text-base font-bold text-[#f4ecd8] tracking-wider uppercase">
            STREAK MILESTONE VAULT
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {milestones.map((m) => (
            <div
              key={m.days}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                m.unlocked
                  ? 'bg-[#1a140d] border-[#4a3a24] text-[#f4ecd8]'
                  : 'bg-[#12100d] border-[#241c14] text-[#736553] opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  m.unlocked ? 'bg-amber-500/20 text-[#e4c278]' : 'bg-[#181410] text-[#524436]'
                }`}>
                  {m.unlocked ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5" />}
                </div>

                <div>
                  <div className="font-rpg text-xs font-bold">{m.name}</div>
                  <div className="text-[10px] font-mono text-[#8c7d6c]">{m.reward}</div>
                </div>
              </div>

              <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[#1f1811] border border-[#332619]">
                {m.days}D
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import { 
  Plus, 
  Sparkles, 
  Flame, 
  Coins, 
  CheckCircle, 
  Play, 
  Dumbbell, 
  Brain, 
  Heart, 
  Compass, 
  Scroll, 
  ArrowRight,
  Shield,
  Clock,
  Trophy,
  Anvil
} from 'lucide-react';
import { UserProfile, CharacterAttributes, Task, Item } from '../types';
import { sound } from '../utils/audio';

interface DashboardViewProps {
  profile: UserProfile;
  attributes: CharacterAttributes;
  tasks: Task[];
  rewards: (Item & { owned: boolean; equipped: boolean })[];
  streakData: {
    current_streak: number;
    longest_streak: number;
    recent_days: { day: string; date: string; active: boolean }[];
  } | null;
  onOpenForgeModal: () => void;
  onCompleteQuest: (task: Task) => void;
  onStartFocusSession: (task: Task) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  attributes,
  tasks,
  rewards,
  streakData,
  onOpenForgeModal,
  onCompleteQuest,
  onStartFocusSession,
  onNavigateTab
}) => {
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTodayCount = tasks.filter(t => t.completed).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Coding': return <Brain className="w-4 h-4 text-sky-400" />;
      case 'Study': return <Scroll className="w-4 h-4 text-amber-400" />;
      case 'Fitness': return <Dumbbell className="w-4 h-4 text-red-400" />;
      case 'Health': return <Heart className="w-4 h-4 text-emerald-400" />;
      default: return <Compass className="w-4 h-4 text-amber-300" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-stone-400 bg-stone-900/60 border-stone-800';
      case 'Normal': return 'text-amber-300 bg-amber-950/30 border-amber-800/40';
      case 'Hard': return 'text-orange-300 bg-orange-950/40 border-orange-800/50';
      case 'Epic': return 'text-purple-300 bg-purple-950/40 border-purple-800/50';
      default: return 'text-stone-400 bg-stone-900 border-stone-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. LAYERED CHARACTER HUD HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b1712] via-[#14110d] to-[#0f0d0a] border border-[#3b2f21] p-6 sm:p-7 shadow-2xl shadow-black/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-amber-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Title */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#c99a4a] via-[#8c6729] to-[#3a2c14] p-[2px] shadow-xl shadow-amber-950/50">
                <div className="w-full h-full bg-[#16120e] rounded-[14px] flex items-center justify-center">
                  <Shield className="w-9 h-9 sm:w-11 sm:h-11 text-[#e4c278]" />
                </div>
              </div>
              {profile.frame && profile.frame !== 'Standard' && (
                <div className="absolute -inset-1 border-2 border-[#c99a4a]/40 rounded-2xl pointer-events-none animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#2a2115] border border-[#4a3924] font-mono text-[10px] font-bold text-[#c99a4a] tracking-wider uppercase">
                  LEVEL {String(profile.level).padStart(2, '0')}
                </span>
                <span className="text-[11px] font-mono text-[#8c7d6c] uppercase tracking-widest">
                  {profile.title || 'THE SEEKER'}
                </span>
              </div>
              <h1 className="font-rpg text-2xl sm:text-3xl font-extrabold text-[#f4ecd8] tracking-wider mt-1">
                {profile.username}
              </h1>
              <p className="text-xs text-[#9c8d7b] mt-0.5 font-sans">
                {activeTasks.length} active quests in registry • {completedTodayCount} completed today
              </p>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* XP Bar */}
            <div className="flex-1 sm:w-64 bg-[#110e0b] border border-[#2b2216] p-3 rounded-2xl">
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-[#a89984] font-semibold">EXPERIENCE</span>
                <span className="text-[#e4c278] font-bold">
                  {profile.current_level_xp} <span className="text-[#594d3e]">/</span> {profile.xp_for_next_level} XP
                </span>
              </div>
              <div 
                role="progressbar" 
                aria-valuenow={profile.progress_percentage} 
                aria-valuemin={0} 
                aria-valuemax={100}
                className="w-full h-2.5 bg-[#1f1912] rounded-full overflow-hidden border border-[#382b1d]"
              >
                <div 
                  className="h-full bg-gradient-to-r from-[#8c6729] via-[#c99a4a] to-[#f4ecd8] transition-all duration-700 rounded-full"
                  style={{ width: `${profile.progress_percentage}%` }}
                />
              </div>
              <div className="text-[10px] text-[#736553] text-right mt-1 font-mono">
                {profile.progress_percentage}% to Level {profile.level + 1}
              </div>
            </div>

            {/* Gold Pill */}
            <div className="flex items-center gap-3 bg-[#110e0b] border border-[#2b2216] px-4 py-3 rounded-2xl min-w-[120px]">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Coins className="w-4 h-4 text-[#e4c278]" />
              </div>
              <div>
                <div className="text-[10px] font-rpg uppercase text-[#8c7d6c] font-semibold">Gold</div>
                <div className="font-mono text-base font-bold text-[#f4ecd8] leading-tight">
                  {profile.gold.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Streak Pill */}
            <div className="flex items-center gap-3 bg-[#110e0b] border border-[#2b2216] px-4 py-3 rounded-2xl min-w-[120px]">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-rpg uppercase text-[#8c7d6c] font-semibold">Streak</div>
                <div className="font-mono text-base font-bold text-[#f4ecd8] leading-tight">
                  {profile.current_streak} Days
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER COLUMN: Active Quests (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-[#14110d] border border-[#2f251a] rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <Scroll className="w-5 h-5 text-[#c99a4a]" />
                <h2 className="font-rpg text-lg font-bold text-[#f4ecd8] tracking-wider">
                  TODAY&apos;S QUEST LOG
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#211a12] border border-[#382b1c] text-[10px] font-mono text-[#a89984]">
                  {activeTasks.length} Active
                </span>
              </div>

              <button
                type="button"
                onClick={onOpenForgeModal}
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#b38536] to-[#966d28] hover:from-[#c99a4a] hover:to-[#b38536] text-[#120e09] font-rpg font-bold text-xs tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>FORGE QUEST</span>
              </button>
            </div>

            {/* Quests List */}
            {activeTasks.length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-[#292015] rounded-2xl bg-[#0f0d0a]/50">
                <Scroll className="w-10 h-10 text-[#4d3d29] mx-auto mb-3" />
                <h3 className="font-rpg text-base font-bold text-[#d8cdbc] mb-1 tracking-wider">
                  YOUR JOURNEY BEGINS HERE
                </h3>
                <p className="text-xs text-[#80715f] max-w-sm mx-auto mb-4">
                  No active quests in your scroll. Translate your daily study, workout, or coding goals into RPG rewards.
                </p>
                <button
                  type="button"
                  onClick={onOpenForgeModal}
                  className="px-4 py-2 bg-[#231a10] hover:bg-[#2d2215] border border-[#4a3924] hover:border-[#c99a4a] text-[#e4c278] rounded-xl font-rpg text-xs font-semibold tracking-wider transition-all"
                >
                  FORGE YOUR FIRST QUEST
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTasks.map((task) => (
                  <article
                    key={task.id}
                    className="p-4 rounded-2xl bg-[#18140f] hover:bg-[#1d1711] border border-[#302619] hover:border-[#4d3d28] transition-all group shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#211a12] border border-[#3b2d1d] flex items-center justify-center shrink-0 mt-0.5 group-hover:border-[#c99a4a]/50 transition-colors">
                        {getCategoryIcon(task.category)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-rpg font-semibold tracking-wider ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty}
                          </span>
                          <span className="text-[10px] font-mono text-[#8c7d6c]">
                            {task.category} • +{task.attribute_points} {task.attribute}
                          </span>
                          {task.verification_type === 'focus_session' && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-indigo-400 bg-indigo-950/30 px-1.5 py-0.5 rounded border border-indigo-800/40">
                              <Clock className="w-3 h-3" />
                              <span>{task.target_duration_minutes || 25}m Focus</span>
                            </span>
                          )}
                        </div>

                        <h4 className="font-rpg text-sm font-bold text-[#f4ecd8] group-hover:text-[#c99a4a] transition-colors truncate">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-xs text-[#8c7e6c] line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reward Pill & Action Buttons */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#261e14] pt-2 sm:pt-0">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-amber-300 font-bold">+{task.xp_reward} XP</span>
                        <span className="text-[#f4ecd8] font-bold">+{task.gold_reward} G</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.verification_type === 'focus_session' ? (
                          <button
                            type="button"
                            onClick={() => onStartFocusSession(task)}
                            className="px-3 py-1.5 bg-[#231b12] hover:bg-[#2e2317] border border-[#473623] hover:border-[#c99a4a] text-[#e4c278] rounded-xl font-rpg text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>START QUEST</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onCompleteQuest(task)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-[#b38536] to-[#966d28] hover:from-[#c99a4a] hover:to-[#b38536] text-[#120e09] rounded-xl font-rpg font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 shadow"
                          >
                            <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>COMPLETE</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Quick Artifacts from Reward Forge */}
          <section className="bg-[#14110d] border border-[#2f251a] rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Anvil className="w-5 h-5 text-[#c99a4a]" />
                <h3 className="font-rpg text-sm font-bold text-[#f4ecd8] tracking-wider uppercase">
                  REWARD FORGE ARTIFACTS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('rewards')}
                className="text-xs font-mono text-[#c99a4a] hover:underline flex items-center gap-1"
              >
                <span>Enter Forge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rewards.slice(0, 2).map((item) => (
                <div 
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#17130e] border border-[#2e2417] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#211a12] border border-[#3d2f1d] flex items-center justify-center text-[#e4c278]">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-rpg text-xs font-bold text-[#f4ecd8]">{item.name}</div>
                      <div className="text-[10px] text-[#8c7d6c] line-clamp-1">{item.effect || item.description}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-bold text-[#e4c278]">{item.price} Gold</div>
                    <span className="text-[9px] uppercase font-mono text-[#736553]">{item.rarity}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Character Attributes & Streak (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Attributes Card */}
          <section className="bg-[#14110d] border border-[#2f251a] rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#c99a4a]" />
                <h3 className="font-rpg text-sm font-bold text-[#f4ecd8] tracking-wider uppercase">
                  CHARACTER ATTRIBUTES
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('character')}
                className="text-xs font-mono text-[#8c7d6c] hover:text-[#c99a4a]"
              >
                Inspect
              </button>
            </div>

            <div className="space-y-4">
              {/* Strength */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="font-rpg font-semibold text-[#f4ecd8] flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-red-400" />
                    STRENGTH
                  </span>
                  <span className="font-bold text-[#f4ecd8]">{attributes.strength}</span>
                </div>
                <div 
                  role="progressbar" 
                  aria-valuenow={attributes.strength} 
                  aria-valuemin={0} 
                  aria-valuemax={100}
                  className="w-full h-2 bg-[#211a12] rounded-full overflow-hidden border border-[#332719]"
                >
                  <div 
                    className="h-full bg-gradient-to-r from-red-800 to-red-400 rounded-full"
                    style={{ width: `${Math.min(100, attributes.strength)}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#786a59] mt-0.5">Built through physical quests & grit.</div>
              </div>

              {/* Intellect */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="font-rpg font-semibold text-[#f4ecd8] flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-sky-400" />
                    INTELLECT
                  </span>
                  <span className="font-bold text-[#f4ecd8]">{attributes.intellect}</span>
                </div>
                <div 
                  role="progressbar" 
                  aria-valuenow={attributes.intellect} 
                  aria-valuemin={0} 
                  aria-valuemax={100}
                  className="w-full h-2 bg-[#211a12] rounded-full overflow-hidden border border-[#332719]"
                >
                  <div 
                    className="h-full bg-gradient-to-r from-sky-800 to-sky-400 rounded-full"
                    style={{ width: `${Math.min(100, attributes.intellect)}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#786a59] mt-0.5">Honed by coding, technical study, & books.</div>
              </div>

              {/* Vitality */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="font-rpg font-semibold text-[#f4ecd8] flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-emerald-400" />
                    VITALITY
                  </span>
                  <span className="font-bold text-[#f4ecd8]">{attributes.vitality}</span>
                </div>
                <div 
                  role="progressbar" 
                  aria-valuenow={attributes.vitality} 
                  aria-valuemin={0} 
                  aria-valuemax={100}
                  className="w-full h-2 bg-[#211a12] rounded-full overflow-hidden border border-[#332719]"
                >
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-800 to-emerald-400 rounded-full"
                    style={{ width: `${Math.min(100, attributes.vitality)}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#786a59] mt-0.5">Sustained by restorative sleep & hydration.</div>
              </div>

              {/* Mind */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="font-rpg font-semibold text-[#f4ecd8] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-400" />
                    MIND
                  </span>
                  <span className="font-bold text-[#f4ecd8]">{attributes.mind}</span>
                </div>
                <div 
                  role="progressbar" 
                  aria-valuenow={attributes.mind} 
                  aria-valuemin={0} 
                  aria-valuemax={100}
                  className="w-full h-2 bg-[#211a12] rounded-full overflow-hidden border border-[#332719]"
                >
                  <div 
                    className="h-full bg-gradient-to-r from-purple-800 to-purple-400 rounded-full"
                    style={{ width: `${Math.min(100, attributes.mind)}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#786a59] mt-0.5">Cultivated via meditation & mental discipline.</div>
              </div>
            </div>
          </section>

          {/* 7-Day Streak Calendar */}
          <section className="bg-[#14110d] border border-[#2f251a] rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="font-rpg text-sm font-bold text-[#f4ecd8] tracking-wider uppercase">
                  STREAK CALENDAR
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-[#e4c278]">
                {profile.current_streak} DAYS
              </span>
            </div>

            {/* 7 Day Grid */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono">
              {(streakData?.recent_days || [
                { day: 'MON', active: true },
                { day: 'TUE', active: true },
                { day: 'WED', active: true },
                { day: 'THU', active: true },
                { day: 'FRI', active: true },
                { day: 'SAT', active: true },
                { day: 'SUN', active: false }
              ]).map((d, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-[10px] text-[#786a59] mb-1">{d.day}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-bold transition-all ${
                    d.active 
                      ? 'bg-amber-950/40 border-amber-600/50 text-[#e4c278] shadow-sm'
                      : 'bg-[#18130e] border-[#292015] text-[#524434]'
                  }`}>
                    {d.active ? '✓' : '○'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#231a10] flex items-center justify-between text-[11px] font-mono text-[#8c7d6c]">
              <span>Record Streak:</span>
              <span className="text-[#f4ecd8] font-bold">{profile.longest_streak} Days</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

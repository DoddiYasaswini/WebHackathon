import React from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  Flame, 
  Award, 
  Sparkles, 
  Brain, 
  Dumbbell, 
  Heart, 
  Compass, 
  Lock,
  Crown
} from 'lucide-react';
import { Badge } from '../types';

interface AchievementsViewProps {
  achievements: (Badge & { unlocked: boolean; earned_at?: string })[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'CheckCircle2': return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
      case 'Flame': return <Flame className="w-6 h-6 text-amber-500" />;
      case 'Trophy': return <Trophy className="w-6 h-6 text-amber-400" />;
      case 'Award': return <Award className="w-6 h-6 text-yellow-400" />;
      case 'Brain': return <Brain className="w-6 h-6 text-sky-400" />;
      case 'Dumbbell': return <Dumbbell className="w-6 h-6 text-red-400" />;
      case 'Heart': return <Heart className="w-6 h-6 text-pink-400" />;
      case 'Compass': return <Compass className="w-6 h-6 text-purple-400" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-indigo-400" />;
      case 'Crown': return <Crown className="w-6 h-6 text-[#e4c278]" />;
      default: return <Award className="w-6 h-6 text-[#c99a4a]" />;
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-stone-900 border-stone-700 text-stone-300';
      case 'rare': return 'bg-sky-950/40 border-sky-800/40 text-sky-300';
      case 'epic': return 'bg-purple-950/40 border-purple-800/40 text-purple-300';
      case 'legendary': return 'bg-amber-950/50 border-amber-600/60 text-amber-300 font-bold';
      default: return 'bg-stone-900 text-stone-300';
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-[#14110d] border border-[#2f251a] p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-6 h-6 text-[#c99a4a]" />
            <h1 className="font-rpg text-xl sm:text-2xl font-bold text-[#f4ecd8] tracking-wider uppercase">
              HONOR BADGES & FEATS
            </h1>
          </div>
          <p className="text-xs text-[#9c8d7b]">
            Milestones and badges earned as testament to sustained discipline across life realms.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-2xl bg-[#17130e] border border-[#2b2116]">
          <span className="text-[#8c7d6c]">Feats Unlocked:</span>
          <span className="text-amber-300 font-bold">{unlockedCount} / {achievements.length}</span>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {achievements.map((badge) => {
          const isUnlocked = badge.unlocked;

          return (
            <article
              key={badge.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-[#18140f] border-[#4a3924] shadow-lg shadow-amber-950/20'
                  : 'bg-[#120f0c] border-[#241c14] opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                    isUnlocked
                      ? 'bg-[#211a12] border-[#473623]'
                      : 'bg-[#14100c] border-[#241a10] text-[#544434]'
                  }`}>
                    {isUnlocked ? getBadgeIcon(badge.icon) : <Lock className="w-5 h-5 text-[#544434]" />}
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] uppercase font-mono tracking-wider ${getRarityBadge(badge.rarity)}`}>
                    {badge.rarity}
                  </span>
                </div>

                <h3 className={`font-rpg text-base font-bold tracking-wider mb-1 ${
                  isUnlocked ? 'text-[#f4ecd8]' : 'text-[#7d705f]'
                }`}>
                  {badge.name}
                </h3>

                <p className="text-xs text-[#9c8d7b] mb-3 leading-relaxed">
                  {badge.description}
                </p>

                <div className="text-[11px] font-mono text-[#8c7d6c] bg-[#110e0b] border border-[#241a10] p-2 rounded-xl">
                  <strong>Requirement:</strong> {badge.requirement}
                </div>
              </div>

              <div className="pt-3 border-t border-[#241a10] mt-4 flex items-center justify-between text-[11px] font-mono">
                {isUnlocked ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unlocked {badge.earned_at ? new Date(badge.earned_at).toLocaleDateString() : 'Earned'}</span>
                  </span>
                ) : (
                  <span className="text-[#615242] flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked Feat</span>
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

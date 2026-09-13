import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Anvil, 
  Coins, 
  Sparkles, 
  Shield, 
  BookOpen, 
  Crown, 
  Flame, 
  Square, 
  Compass, 
  Feather, 
  Check, 
  Lock,
  AlertCircle
} from 'lucide-react';
import { Item, UserProfile } from '../types';
import { api } from '../utils/api';
import { sound } from '../utils/audio';

interface RewardForgeViewProps {
  profile: UserProfile;
  rewards: (Item & { owned: boolean; equipped: boolean; inventory_id?: string })[];
  onRewardPurchased: (updatedProfile: UserProfile, newItem: Item) => void;
}

export const RewardForgeView: React.FC<RewardForgeViewProps> = ({
  profile,
  rewards,
  onRewardPurchased
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const types = ['all', 'artifact', 'frame', 'avatar', 'badge', 'title'];

  const filteredRewards = rewards.filter(r => {
    if (selectedType === 'all') return true;
    return r.type === selectedType;
  });

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-stone-900 border-stone-700 text-stone-300';
      case 'rare': return 'bg-sky-950/40 border-sky-800/40 text-sky-300';
      case 'epic': return 'bg-purple-950/40 border-purple-800/40 text-purple-300 font-bold';
      case 'legendary': return 'bg-amber-950/50 border-amber-600/60 text-amber-300 font-bold shadow-[0_0_10px_rgba(201,154,74,0.3)]';
      default: return 'bg-stone-900 text-stone-300';
    }
  };

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield className="w-6 h-6 text-[#e4c278]" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-indigo-400" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-emerald-400" />;
      case 'Crown': return <Crown className="w-6 h-6 text-yellow-400" />;
      case 'Flame': return <Flame className="w-6 h-6 text-amber-500" />;
      case 'Square': return <Square className="w-6 h-6 text-stone-300" />;
      case 'Feather': return <Feather className="w-6 h-6 text-emerald-300" />;
      default: return <Compass className="w-6 h-6 text-amber-300" />;
    }
  };

  const handlePurchase = async (item: Item & { owned: boolean }) => {
    setError(null);
    setSuccessMsg(null);

    if (item.owned) {
      setError('You already possess this artifact in your inventory.');
      return;
    }

    if (profile.gold < item.price) {
      setError(`Not enough Gold to acquire this artifact. Needed: ${item.price} Gold, Available: ${profile.gold} Gold.`);
      return;
    }

    setPurchasingId(item.id);
    sound.playClick();

    try {
      const res = await api.purchaseReward(item.id);
      sound.playCoin();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c99a4a', '#e4c278', '#fff']
      });
      setSuccessMsg(`ARTIFACT ACQUIRED: ${item.name}! Added to your inventory.`);
      onRewardPurchased(res.profile, res.item);
    } catch (err: any) {
      setError(err.message || 'Artifact could not be acquired from the forge.');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <section className="bg-[#14110d] border border-[#2f251a] p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Anvil className="w-6 h-6 text-[#c99a4a]" />
            <h1 className="font-rpg text-xl sm:text-2xl font-bold text-[#f4ecd8] tracking-wider uppercase">
              REWARD FORGE
            </h1>
          </div>
          <p className="text-xs text-[#9c8d7b]">
            Transmute the gold earned through real discipline into cosmetic artifacts, titles, and emblems.
          </p>
        </div>

        {/* Current Gold Chamber Balance */}
        <div className="flex items-center gap-3 bg-[#18140f] border border-[#382d20] px-5 py-3 rounded-2xl shadow-inner">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Coins className="w-5 h-5 text-[#e4c278]" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-rpg text-[#8c7d6c] font-bold">Your Gold Vault</div>
            <div className="font-mono text-xl font-extrabold text-[#f4ecd8]">
              {profile.gold.toLocaleString()} <span className="text-xs font-normal text-[#c99a4a]">Gold</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      {error && (
        <div role="alert" className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div role="status" className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Type Filter Pills */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#120f0c] border border-[#2d2419] rounded-2xl font-rpg text-xs">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { sound.playClick(); setSelectedType(t); }}
            className={`px-4 py-2 rounded-xl uppercase font-bold tracking-wider transition-all ${
              selectedType === t
                ? 'bg-[#2b2216] text-[#e4c278] border border-[#4d3d28] shadow'
                : 'text-[#857766] hover:text-[#d0c4b2]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRewards.map((item) => {
          const canAfford = profile.gold >= item.price;
          const isPurchasing = purchasingId === item.id;

          return (
            <article
              key={item.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                item.owned
                  ? 'bg-[#12100d] border-[#261f16] opacity-80'
                  : 'bg-[#16120e] hover:bg-[#1a1510] border-[#382d20] hover:border-[#52412e] shadow-xl'
              }`}
            >
              <div>
                {/* Header: Icon & Rarity */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#211a12] border border-[#3b2d1d] flex items-center justify-center shadow-md">
                    {getItemIcon(item.icon)}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] uppercase font-mono tracking-wider ${getRarityBadge(item.rarity)}`}>
                    {item.rarity}
                  </span>
                </div>

                <h3 className="font-rpg text-base font-bold text-[#f4ecd8] tracking-wider mb-1">
                  {item.name}
                </h3>
                <div className="text-[11px] font-mono text-[#8c7d6c] uppercase mb-2">
                  {item.type}
                </div>

                <p className="text-xs text-[#9c8d7b] line-clamp-2 leading-relaxed mb-3">
                  {item.description}
                </p>

                {item.effect && (
                  <div className="p-2 rounded-xl bg-[#110e0b] border border-[#261e14] text-[11px] text-[#c99a4a] font-mono mb-4">
                    ✨ {item.effect}
                  </div>
                )}
              </div>

              {/* Price & Buy Action */}
              <div className="pt-3 border-t border-[#261e14] flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 font-mono">
                  <Coins className="w-4 h-4 text-[#e4c278]" />
                  <span className="text-base font-extrabold text-[#f4ecd8]">{item.price}</span>
                  <span className="text-xs text-[#8c7d6c]">Gold</span>
                </div>

                {item.owned ? (
                  <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-3 py-1.5 rounded-xl font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>POSSESSED</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!canAfford || isPurchasing}
                    onClick={() => handlePurchase(item)}
                    className={`px-4 py-2 rounded-xl font-rpg font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 ${
                      canAfford
                        ? 'bg-gradient-to-r from-[#b38536] to-[#966d28] hover:from-[#c99a4a] hover:to-[#b38536] text-[#120e09] shadow-md shadow-amber-950/30'
                        : 'bg-[#1f1a14] text-[#615444] border border-[#2e261d] cursor-not-allowed'
                    }`}
                  >
                    {!canAfford ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>NEED GOLD</span>
                      </>
                    ) : (
                      <span>{isPurchasing ? 'FORGING...' : 'ACQUIRE'}</span>
                    )}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

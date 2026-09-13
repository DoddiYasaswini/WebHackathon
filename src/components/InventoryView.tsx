import React, { useState } from 'react';
import { 
  Backpack, 
  Shield, 
  Check, 
  Sparkles, 
  BookOpen, 
  Crown, 
  Flame, 
  Square, 
  Compass, 
  Feather,
  ArrowRight
} from 'lucide-react';
import { InventoryItem, UserProfile } from '../types';
import { api } from '../utils/api';
import { sound } from '../utils/audio';

interface InventoryViewProps {
  inventory: InventoryItem[];
  profile: UserProfile;
  onItemEquipped: (updatedProfile: UserProfile, inventoryId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  profile,
  onItemEquipped,
  onNavigateTab
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [equippingId, setEquippingId] = useState<string | null>(null);

  const categories = ['all', 'avatar', 'frame', 'badge', 'title', 'artifact'];

  const filteredItems = inventory.filter((inv) => {
    if (!inv.item) return false;
    if (selectedCategory === 'all') return true;
    return inv.item.type === selectedCategory;
  });

  const handleEquip = async (inventoryId: string) => {
    setEquippingId(inventoryId);
    sound.playClick();
    try {
      const res = await api.equipItem(inventoryId);
      sound.playEquip();
      onItemEquipped(res.profile, inventoryId);
    } catch (err) {
      console.error('Failed to equip item:', err);
    } finally {
      setEquippingId(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-[#14110d] border border-[#2f251a] p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Backpack className="w-6 h-6 text-[#c99a4a]" />
            <h1 className="font-rpg text-xl sm:text-2xl font-bold text-[#f4ecd8] tracking-wider uppercase">
              HERO INVENTORY VAULT
            </h1>
          </div>
          <p className="text-xs text-[#9c8d7b]">
            Inspect possessed cosmetics, active titles, and equip artifacts to modify your character presence.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('rewards')}
          className="px-4 py-2 bg-[#211a12] hover:bg-[#2d2318] border border-[#473623] hover:border-[#c99a4a] text-[#e4c278] rounded-xl font-rpg text-xs font-semibold tracking-wider flex items-center gap-2 transition-all"
        >
          <span>Visit Reward Forge</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#120f0c] border border-[#2d2419] rounded-2xl font-rpg text-xs">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => { sound.playClick(); setSelectedCategory(c); }}
            className={`px-4 py-2 rounded-xl uppercase font-bold tracking-wider transition-all ${
              selectedCategory === c
                ? 'bg-[#2b2216] text-[#e4c278] border border-[#4d3d28] shadow'
                : 'text-[#857766] hover:text-[#d0c4b2]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-[#292015] rounded-3xl bg-[#120f0c]/50">
          <Backpack className="w-12 h-12 text-[#4d3d29] mx-auto mb-3" />
          <h3 className="font-rpg text-base font-bold text-[#d8cdbc] mb-1 tracking-wider uppercase">
            NO ARTIFACTS YET
          </h3>
          <p className="text-xs text-[#80715f] max-w-sm mx-auto mb-4">
            You do not possess any artifacts in this chamber. Spend gold in the Reward Forge to acquire relics.
          </p>
          <button
            type="button"
            onClick={() => onNavigateTab('rewards')}
            className="px-4 py-2 bg-[#231a10] hover:bg-[#2d2215] border border-[#4a3924] hover:border-[#c99a4a] text-[#e4c278] rounded-xl font-rpg text-xs font-semibold tracking-wider transition-all"
          >
            EXPLORE REWARD FORGE
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((inv) => {
            const item = inv.item!;
            const isEquipped = inv.equipped;
            const isEquipping = equippingId === inv.id;

            return (
              <article
                key={inv.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-[#1b150e] border-[#c99a4a]/70 shadow-lg shadow-amber-950/20'
                    : 'bg-[#15120e] hover:bg-[#191510] border-[#33281c] shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#211a12] border border-[#3b2d1d] flex items-center justify-center">
                      {getItemIcon(item.icon)}
                    </div>
                    {isEquipped && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                        ACTIVE EQUIPPED
                      </span>
                    )}
                  </div>

                  <h3 className="font-rpg text-base font-bold text-[#f4ecd8] tracking-wider mb-1">
                    {item.name}
                  </h3>
                  <div className="text-[11px] font-mono text-[#8c7d6c] uppercase mb-2">
                    {item.type} • {item.rarity}
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

                <div className="pt-3 border-t border-[#261e14] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#736553]">
                    Acquired {new Date(inv.purchased_at).toLocaleDateString()}
                  </span>

                  <button
                    type="button"
                    disabled={isEquipped || isEquipping}
                    onClick={() => handleEquip(inv.id)}
                    className={`px-4 py-2 rounded-xl font-rpg font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 ${
                      isEquipped
                        ? 'bg-emerald-950/30 border border-emerald-800/40 text-emerald-300'
                        : 'bg-[#261e14] hover:bg-[#33281b] border border-[#473623] hover:border-[#c99a4a] text-[#e4c278]'
                    }`}
                  >
                    {isEquipped ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>EQUIPPED</span>
                      </>
                    ) : (
                      <span>{isEquipping ? 'EQUIPPING...' : 'EQUIP'}</span>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

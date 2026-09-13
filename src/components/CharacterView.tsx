import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Crown, 
  Sparkles, 
  Flame, 
  Brain, 
  Dumbbell, 
  Heart, 
  Compass, 
  Edit3, 
  Check, 
  Coins, 
  Trophy,
  Scroll
} from 'lucide-react';
import { UserProfile, CharacterAttributes, TaskHistory } from '../types';
import { api } from '../utils/api';
import { sound } from '../utils/audio';

interface CharacterViewProps {
  profile: UserProfile;
  attributes: CharacterAttributes;
  journey: TaskHistory[];
  onProfileUpdated: (profile: UserProfile) => void;
}

export const CharacterView: React.FC<CharacterViewProps> = ({
  profile,
  attributes,
  journey,
  onProfileUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [title, setTitle] = useState(profile.title || 'THE SEEKER');
  const [saving, setSaving] = useState(false);

  const availableTitles = [
    'THE SEEKER',
    'THE SCHOLAR',
    'THE BUILDER',
    'THE EXPLORER',
    'THE ASCENDANT',
    'ARCHMAGE OF WILL'
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setSaving(true);
    sound.playClick();
    try {
      const res = await api.updateCharacter({
        username: username.trim(),
        title: title.toUpperCase()
      });
      sound.playEquip();
      onProfileUpdated(res.profile);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Character Hero Header */}
      <section className="bg-[#14110d] border border-[#2f251a] p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#c99a4a] via-[#8c6729] to-[#3a2c14] p-[2px] shadow-2xl">
                <div className="w-full h-full bg-[#16120e] rounded-[22px] flex items-center justify-center">
                  <Shield className="w-12 h-12 text-[#e4c278]" />
                </div>
              </div>
              {profile.frame && profile.frame !== 'Standard' && (
                <div className="absolute -inset-1 border-2 border-[#c99a4a] rounded-3xl pointer-events-none animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#2a2115] border border-[#4a3924] font-mono text-xs font-bold text-[#c99a4a]">
                  LEVEL {String(profile.level).padStart(2, '0')}
                </span>
                <span className="font-rpg text-xs text-[#8c7d6c] uppercase tracking-widest">
                  {profile.title || 'THE SEEKER'}
                </span>
              </div>
              <h1 className="font-rpg text-2xl sm:text-4xl font-extrabold text-[#f4ecd8] tracking-wider mt-1">
                {profile.username}
              </h1>
              <p className="text-xs text-[#8c7e6c] font-mono mt-1">
                Adventurer of the Realm • Total EXP: {profile.total_xp.toLocaleString()} XP
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { sound.playClick(); setIsEditing(!isEditing); }}
            className="px-4 py-2 bg-[#211a12] hover:bg-[#2d2318] border border-[#473623] hover:border-[#c99a4a] text-[#e4c278] rounded-xl font-rpg text-xs font-semibold tracking-wider flex items-center gap-2 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Cancel Edit' : 'Customize Hero'}</span>
          </button>
        </div>

        {/* Edit Identity Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-[#292015] grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
            <div>
              <label htmlFor="edit-hero-name" className="block text-xs font-semibold text-[#a89984] uppercase font-rpg tracking-wider mb-1.5">
                Hero Name
              </label>
              <input
                id="edit-hero-name"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#120f0c] border border-[#382d20] focus:border-[#c99a4a] rounded-xl text-xs text-[#f0e7d8]"
              />
            </div>

            <div>
              <label htmlFor="edit-hero-title" className="block text-xs font-semibold text-[#a89984] uppercase font-rpg tracking-wider mb-1.5">
                Title / Honorific
              </label>
              <select
                id="edit-hero-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#120f0c] border border-[#382d20] focus:border-[#c99a4a] rounded-xl text-xs text-[#f0e7d8]"
              >
                {availableTitles.map((t) => (
                  <option key={t} value={t} className="bg-[#120f0c]">{t}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#c99a4a] text-[#120f0c] font-rpg font-bold text-xs tracking-wider rounded-xl flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'SAVING IDENTITY...' : 'APPLY CUSTOMIZATION'}</span>
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Grid: Attributes & Progression Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attributes Breakdown (7 columns) */}
        <section className="lg:col-span-7 bg-[#14110d] border border-[#2f251a] p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#c99a4a]" />
            <h2 className="font-rpg text-base font-bold text-[#f4ecd8] tracking-wider uppercase">
              CHARACTER ATTRIBUTE SYSTEM
            </h2>
          </div>

          <div className="space-y-4">
            {/* Strength */}
            <div className="p-4 bg-[#18140f] border border-[#2e2417] rounded-2xl">
              <div className="flex justify-between items-center text-xs font-mono mb-1">
                <span className="font-rpg font-bold text-[#f4ecd8] flex items-center gap-2 text-sm">
                  <Dumbbell className="w-4 h-4 text-red-400" />
                  STRENGTH
                </span>
                <span className="text-base font-extrabold text-[#f4ecd8]">{attributes.strength}</span>
              </div>
              <div className="w-full h-3 bg-[#211a12] rounded-full overflow-hidden border border-[#332719] mb-2">
                <div className="h-full bg-gradient-to-r from-red-800 to-red-400 rounded-full" style={{ width: `${Math.min(100, attributes.strength)}%` }} />
              </div>
              <p className="text-xs text-[#8c7d6c]">
                <strong>Built through physical quests:</strong> Calisthenics, gym sessions, endurance runs, and bodily discipline.
              </p>
            </div>

            {/* Intellect */}
            <div className="p-4 bg-[#18140f] border border-[#2e2417] rounded-2xl">
              <div className="flex justify-between items-center text-xs font-mono mb-1">
                <span className="font-rpg font-bold text-[#f4ecd8] flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4 text-sky-400" />
                  INTELLECT
                </span>
                <span className="text-base font-extrabold text-[#f4ecd8]">{attributes.intellect}</span>
              </div>
              <div className="w-full h-3 bg-[#211a12] rounded-full overflow-hidden border border-[#332719] mb-2">
                <div className="h-full bg-gradient-to-r from-sky-800 to-sky-400 rounded-full" style={{ width: `${Math.min(100, attributes.intellect)}%` }} />
              </div>
              <p className="text-xs text-[#8c7d6c]">
                <strong>Built through analytical quests:</strong> Coding DSA algorithms, studying computer networks, engineering projects.
              </p>
            </div>

            {/* Vitality */}
            <div className="p-4 bg-[#18140f] border border-[#2e2417] rounded-2xl">
              <div className="flex justify-between items-center text-xs font-mono mb-1">
                <span className="font-rpg font-bold text-[#f4ecd8] flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 text-emerald-400" />
                  VITALITY
                </span>
                <span className="text-base font-extrabold text-[#f4ecd8]">{attributes.vitality}</span>
              </div>
              <div className="w-full h-3 bg-[#211a12] rounded-full overflow-hidden border border-[#332719] mb-2">
                <div className="h-full bg-gradient-to-r from-emerald-800 to-emerald-400 rounded-full" style={{ width: `${Math.min(100, attributes.vitality)}%` }} />
              </div>
              <p className="text-xs text-[#8c7d6c]">
                <strong>Built through restorative habits:</strong> 8-hour sleep cycles, consistent hydration, balanced meals, posture.
              </p>
            </div>

            {/* Mind */}
            <div className="p-4 bg-[#18140f] border border-[#2e2417] rounded-2xl">
              <div className="flex justify-between items-center text-xs font-mono mb-1">
                <span className="font-rpg font-bold text-[#f4ecd8] flex items-center gap-2 text-sm">
                  <Compass className="w-4 h-4 text-purple-400" />
                  MIND
                </span>
                <span className="text-base font-extrabold text-[#f4ecd8]">{attributes.mind}</span>
              </div>
              <div className="w-full h-3 bg-[#211a12] rounded-full overflow-hidden border border-[#332719] mb-2">
                <div className="h-full bg-gradient-to-r from-purple-800 to-purple-400 rounded-full" style={{ width: `${Math.min(100, attributes.mind)}%` }} />
              </div>
              <p className="text-xs text-[#8c7d6c]">
                <strong>Built through mental discipline:</strong> Meditation, creative writing, emotional regulation, deep reflection.
              </p>
            </div>
          </div>
        </section>

        {/* Leveling Formula & Lifetime Stats (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-[#14110d] border border-[#2f251a] p-6 rounded-3xl shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#c99a4a]" />
              <h2 className="font-rpg text-base font-bold text-[#f4ecd8] tracking-wider uppercase">
                EXPONENTIAL PROGRESSION
              </h2>
            </div>

            <p className="text-xs text-[#8c7d6c] mb-4 leading-relaxed">
              LifeQuest uses an authoritative polynomial leveling curve rather than a flat linear scale. Higher levels require progressively greater discipline to unlock.
            </p>

            <div className="p-3 bg-[#110e0b] border border-[#2b2216] rounded-xl font-mono text-xs space-y-2 mb-4">
              <div className="text-[#c99a4a] font-bold">requiredXP(level) = 100 × level^1.5</div>
              <div className="flex justify-between text-[#8c7d6c]">
                <span>Current Level Threshold:</span>
                <span className="text-[#f4ecd8] font-bold">{profile.xp_for_next_level} XP</span>
              </div>
              <div className="flex justify-between text-[#8c7d6c]">
                <span>Progress to Level {profile.level + 1}:</span>
                <span className="text-emerald-400 font-bold">{profile.progress_percentage}%</span>
              </div>
            </div>

            {/* Lifetime stats grid */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#18140f] border border-[#292015] rounded-xl">
                <div className="text-[10px] text-[#736553] uppercase font-rpg">Total Quests</div>
                <div className="text-lg font-bold text-[#f4ecd8] mt-0.5">{journey.length}</div>
              </div>
              <div className="p-3 bg-[#18140f] border border-[#292015] rounded-xl">
                <div className="text-[10px] text-[#736553] uppercase font-rpg">Max Streak</div>
                <div className="text-lg font-bold text-amber-500 mt-0.5">{profile.longest_streak} Days</div>
              </div>
              <div className="p-3 bg-[#18140f] border border-[#292015] rounded-xl">
                <div className="text-[10px] text-[#736553] uppercase font-rpg">Gold Pieces</div>
                <div className="text-lg font-bold text-[#e4c278] mt-0.5">{profile.gold}</div>
              </div>
              <div className="p-3 bg-[#18140f] border border-[#292015] rounded-xl">
                <div className="text-[10px] text-[#736553] uppercase font-rpg">Current Rank</div>
                <div className="text-sm font-bold text-[#d8cdbc] mt-0.5 truncate">{profile.title}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

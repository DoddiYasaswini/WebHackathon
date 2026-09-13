import React, { useState, useEffect } from 'react';
import { 
  Scroll, 
  Coins, 
  Sparkles, 
  Timer, 
  CheckCircle2, 
  FileText, 
  Dumbbell, 
  Brain, 
  Heart, 
  Compass, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Task, QuestCategory, AttributeType, QuestDifficulty, VerificationType } from '../types';
import { api } from '../utils/api';
import { sound } from '../utils/audio';

interface ForgeQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestForged: (quest: Task, isEdit: boolean) => void;
  taskToEdit?: Task | null;
}

export const ForgeQuestModal: React.FC<ForgeQuestModalProps> = ({
  isOpen,
  onClose,
  onQuestForged,
  taskToEdit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('Study');
  const [attribute, setAttribute] = useState<AttributeType>('Intellect');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('Normal');
  const [verificationType, setVerificationType] = useState<VerificationType>('self_report');
  const [targetDuration, setTargetDuration] = useState<number>(25);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category);
      setAttribute(taskToEdit.attribute);
      setDifficulty(taskToEdit.difficulty);
      setVerificationType(taskToEdit.verification_type);
      setTargetDuration(taskToEdit.target_duration_minutes || 25);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Study');
      setAttribute('Intellect');
      setDifficulty('Normal');
      setVerificationType('self_report');
      setTargetDuration(25);
    }
    setError(null);
  }, [taskToEdit, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Real-time calculated reward preview
  const getRewards = (diff: QuestDifficulty) => {
    switch (diff) {
      case 'Easy': return { xp: 20, gold: 10, attr: 1 };
      case 'Normal': return { xp: 40, gold: 20, attr: 2 };
      case 'Hard': return { xp: 75, gold: 40, attr: 3 };
      case 'Epic': return { xp: 150, gold: 100, attr: 5 };
    }
  };
  const currentReward = getRewards(difficulty);

  const categories: QuestCategory[] = [
    'Coding', 'Study', 'Fitness', 'Reading', 'Health', 'Personal', 'Creativity', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Quest title cannot remain blank in the registry.');
      return;
    }

    setLoading(true);
    sound.playClick();

    try {
      if (taskToEdit) {
        const res = await api.updateTask(taskToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          category,
          attribute,
          difficulty,
          verification_type: verificationType,
          target_duration_minutes: verificationType === 'focus_session' ? targetDuration : 0
        });
        sound.playEquip();
        onQuestForged(res.task, true);
      } else {
        const res = await api.createTask({
          title: title.trim(),
          description: description.trim(),
          category,
          attribute,
          difficulty,
          verification_type: verificationType,
          target_duration_minutes: verificationType === 'focus_session' ? targetDuration : 0
        });
        sound.playCoin();
        onQuestForged(res.task, false);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to forge quest.');
    } finally {
      setLoading(false);
    }
  };

  // Attribute change recommendations based on category
  const handleCategoryChange = (newCat: QuestCategory) => {
    setCategory(newCat);
    if (newCat === 'Coding' || newCat === 'Study' || newCat === 'Reading') {
      setAttribute('Intellect');
    } else if (newCat === 'Fitness') {
      setAttribute('Strength');
    } else if (newCat === 'Health') {
      setAttribute('Vitality');
    } else if (newCat === 'Personal' || newCat === 'Creativity') {
      setAttribute('Mind');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forge-quest-title"
    >
      <div className="relative w-full max-w-lg bg-[#16130f] border border-[#3e3223] rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black text-[#e6ded3] animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8c7d6b] hover:text-[#e4c278] p-1.5 rounded-lg hover:bg-[#231d16] transition-colors"
          aria-label="Close Forge Modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#231c14] border border-[#4a3a27] flex items-center justify-center shadow-md">
            <Scroll className="w-5 h-5 text-[#e4c278]" />
          </div>
          <div>
            <h2 id="forge-quest-title" className="font-rpg text-xl font-bold text-[#f4ecd8] tracking-wider">
              {taskToEdit ? 'REFINE QUEST SCROLL' : 'FORGE NEW QUEST'}
            </h2>
            <p className="text-xs text-[#9c8d7b]">
              Translate a real-world task into an authoritative RPG mission
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="quest-title" className="block text-xs font-semibold text-[#a89984] uppercase font-rpg tracking-wider mb-1.5">
              Quest Title <span className="text-red-400">*</span>
            </label>
            <input
              id="quest-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study Computer Networks / 30 Min Workout"
              className="w-full px-3.5 py-2.5 bg-[#120f0c] border border-[#382d20] focus:border-[#c99a4a] focus:ring-1 focus:ring-[#c99a4a] rounded-xl text-sm text-[#f0e7d8] placeholder-[#5c5040] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="quest-description" className="block text-xs font-semibold text-[#a89984] uppercase font-rpg tracking-wider mb-1.5">
              Quest Lore / Objective Description
            </label>
            <textarea
              id="quest-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clarify specific criteria: e.g. Solve dynamic programming problems or finish Chapter 4."
              className="w-full px-3.5 py-2 bg-[#120f0c] border border-[#382d20] focus:border-[#c99a4a] focus:ring-1 focus:ring-[#c99a4a] rounded-xl text-xs text-[#f0e7d8] placeholder-[#5c5040] transition-colors resize-none"
            />
          </div>

          {/* Category & Attribute */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="quest-category" className="block text-xs font-semibold text-[#a89984] uppercase font-rpg tracking-wider mb-1.5">
                Realm / Category
              </label>
              <select
                id="quest-category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as QuestCategory)}
                className="w-full px-3 py-2 bg-[#120f0c] border border-[#382d20] focus:border-[#c99a4a] rounded-xl text-xs text-[#f0e7d8]"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#120f0c]">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quest-attribute" className="block text-xs font-semibold text-[#a89984] uppercase font-rpg tracking-wider mb-1.5">
                Target Attribute
              </label>
              <select
                id="quest-attribute"
                value={attribute}
                onChange={(e) => setAttribute(e.target.value as AttributeType)}
                className="w-full px-3 py-2 bg-[#120f0c] border border-[#382d20] focus:border-[#c99a4a] rounded-xl text-xs text-[#f0e7d8]"
              >
                <option value="Intellect" className="bg-[#120f0c]">Intellect (Coding, Study, Reading)</option>
                <option value="Strength" className="bg-[#120f0c]">Strength (Fitness, Athletics, Grit)</option>
                <option value="Vitality" className="bg-[#120f0c]">Vitality (Health, Sleep, Nutrition)</option>
                <option value="Mind" className="bg-[#120f0c]">Mind (Meditation, Mental Focus, Art)</option>
              </select>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#a89984] uppercase font-rpg tracking-wider mb-1.5">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Easy', 'Normal', 'Hard', 'Epic'] as QuestDifficulty[]).map((d) => {
                const active = difficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { sound.playClick(); setDifficulty(d); }}
                    className={`py-2 px-1 rounded-xl text-center font-rpg text-xs transition-all border ${
                      active
                        ? 'bg-[#2d2214] text-[#e4c278] border-[#c99a4a] font-bold shadow-md shadow-amber-950/30'
                        : 'bg-[#120f0c] text-[#7a6e5e] border-[#2e251a] hover:border-[#423423] hover:text-[#d0c4b2]'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verification Method Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#a89984] uppercase font-rpg tracking-wider mb-1.5">
              Verification Chamber
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'self_report', label: 'Self Report', icon: CheckCircle2 },
                { type: 'focus_session', label: 'Focus Session', icon: Timer },
                { type: 'evidence_submission', label: 'Evidence Proof', icon: FileText }
              ].map((v) => {
                const Icon = v.icon;
                const active = verificationType === v.type;
                return (
                  <button
                    key={v.type}
                    type="button"
                    onClick={() => { sound.playClick(); setVerificationType(v.type as VerificationType); }}
                    className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all border ${
                      active
                        ? 'bg-[#292015] text-[#f4ecd8] border-[#c99a4a] font-semibold shadow-inner'
                        : 'bg-[#120f0c] text-[#7a6e5e] border-[#2e251a] hover:border-[#423423]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#e4c278]' : 'text-[#615647]'}`} />
                    <span className="text-[11px] leading-tight">{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focus Session duration config (if Focus Session selected) */}
          {verificationType === 'focus_session' && (
            <div className="p-3 bg-[#18140f] border border-[#382d20] rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#e4c278] font-rpg">Chamber Duration</div>
                <div className="text-[11px] text-[#8c7d6c]">Tracked session timer before verification</div>
              </div>
              <div className="flex items-center gap-1.5">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTargetDuration(mins)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                      targetDuration === mins
                        ? 'bg-[#c99a4a] text-[#120f0c] font-bold'
                        : 'bg-[#120f0c] text-[#a89984] hover:bg-[#231d16]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Authoritative Reward Preview Card */}
          <div className="p-3 bg-gradient-to-r from-[#1c1711] to-[#14100c] border border-[#3d3121] rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e4c278]" />
              <span className="font-rpg text-[#e4c278] font-bold tracking-wider">REWARDS EARNED:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-300 font-bold">+{currentReward.xp} XP</span>
              <span className="text-[#f4ecd8] font-bold">+{currentReward.gold} Gold</span>
              <span className="text-emerald-400 font-bold">+{currentReward.attr} {attribute}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#b38536] via-[#c99a4a] to-[#966d28] hover:from-[#c99a4a] hover:to-[#b38536] text-[#120e09] font-rpg font-bold tracking-wider rounded-xl shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>FORGING QUEST SCROLL...</span>
              </>
            ) : (
              <span>{taskToEdit ? 'SEAL CHANGES' : 'FORGE QUEST'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

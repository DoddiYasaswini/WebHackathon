import React, { useState } from 'react';
import { 
  Scroll, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  Play, 
  Trash2, 
  Edit3, 
  Dumbbell, 
  Brain, 
  Heart, 
  Compass, 
  FileText,
  Filter
} from 'lucide-react';
import { Task, QuestCategory, AttributeType } from '../types';
import { sound } from '../utils/audio';

interface QuestsViewProps {
  tasks: Task[];
  onOpenForgeModal: (taskToEdit?: Task) => void;
  onDeleteQuest: (taskId: string) => void;
  onCompleteQuest: (task: Task) => void;
  onStartFocusSession: (task: Task) => void;
}

export const QuestsView: React.FC<QuestsViewProps> = ({
  tasks,
  onOpenForgeModal,
  onDeleteQuest,
  onCompleteQuest,
  onStartFocusSession
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  const categories = ['All', 'Coding', 'Study', 'Fitness', 'Reading', 'Health', 'Personal', 'Creativity', 'Other'];
  const attributes = ['All', 'Strength', 'Intellect', 'Vitality', 'Mind'];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesAttr = selectedAttribute === 'All' || t.attribute === selectedAttribute;
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? !t.completed : t.completed;

    return matchesSearch && matchesCat && matchesAttr && matchesStatus;
  });

  const getAttributeIcon = (attr: AttributeType) => {
    switch (attr) {
      case 'Strength': return <Dumbbell className="w-3.5 h-3.5 text-red-400" />;
      case 'Intellect': return <Brain className="w-3.5 h-3.5 text-sky-400" />;
      case 'Vitality': return <Heart className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Mind': return <Compass className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-stone-900 border-stone-700 text-stone-300';
      case 'Normal': return 'bg-amber-950/40 border-amber-800/40 text-amber-300';
      case 'Hard': return 'bg-orange-950/40 border-orange-800/50 text-orange-300';
      case 'Epic': return 'bg-purple-950/40 border-purple-800/50 text-purple-300 font-bold';
      default: return 'bg-stone-900 text-stone-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#14110d] border border-[#2f251a] p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scroll className="w-5 h-5 text-[#c99a4a]" />
            <h1 className="font-rpg text-xl sm:text-2xl font-bold text-[#f4ecd8] tracking-wider">
              QUEST CHAMBER & REGISTRY
            </h1>
          </div>
          <p className="text-xs text-[#9c8d7b]">
            Manage, filter, and complete your active real-world disciplines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenForgeModal()}
          className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-[#b38536] via-[#c99a4a] to-[#966d28] hover:from-[#c99a4a] hover:to-[#b38536] text-[#120e09] font-rpg font-bold text-xs tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>FORGE NEW QUEST</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-[#14110d] border border-[#2f251a] p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#736553] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quests by title or lore..."
              className="w-full pl-9 pr-4 py-2 bg-[#120f0c] border border-[#33281b] rounded-xl text-xs text-[#f0e7d8] placeholder-[#5c5040] focus:border-[#c99a4a]"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-[#120f0c] border border-[#33281b] p-1 rounded-xl w-full md:w-auto justify-center font-rpg text-xs">
            {(['all', 'active', 'completed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => { sound.playClick(); setStatusFilter(st); }}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-[#292015] text-[#e4c278] border border-[#4d3d28]'
                    : 'text-[#857766] hover:text-[#d0c4b2]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Category & Attribute Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#231a11] text-xs font-mono">
          <span className="text-[10px] uppercase tracking-wider text-[#736553] font-rpg flex items-center gap-1">
            <Filter className="w-3 h-3" /> Realm:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#c99a4a] text-[#120f0c] font-bold'
                    : 'bg-[#18130e] text-[#8c7d6c] hover:text-[#e4c278] border border-[#2b2116]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quests Grid / List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-[#292015] rounded-3xl bg-[#120f0c]/50">
          <Scroll className="w-12 h-12 text-[#4d3d29] mx-auto mb-3" />
          <h3 className="font-rpg text-base font-bold text-[#d8cdbc] mb-1 tracking-wider">
            NO MATCHING QUESTS IN THE REALM
          </h3>
          <p className="text-xs text-[#80715f] max-w-sm mx-auto mb-4">
            Try adjusting your search criteria or forge a new quest for today.
          </p>
          <button
            type="button"
            onClick={() => onOpenForgeModal()}
            className="px-4 py-2 bg-[#231a10] hover:bg-[#2d2215] border border-[#4a3924] hover:border-[#c99a4a] text-[#e4c278] rounded-xl font-rpg text-xs font-semibold tracking-wider transition-all"
          >
            FORGE QUEST NOW
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <article
              key={task.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                task.completed
                  ? 'bg-[#13100d]/70 border-[#261e14] opacity-80'
                  : 'bg-[#16120e] hover:bg-[#1a1510] border-[#33271a] hover:border-[#4d3d28] shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-rpg tracking-wider font-semibold ${getDifficultyBadge(task.difficulty)}`}>
                      {task.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-[#8c7d6c]">
                      {getAttributeIcon(task.attribute)}
                      <span>+{task.attribute_points} {task.attribute}</span>
                    </span>
                  </div>

                  {/* Verification indicator */}
                  <span className="text-[10px] font-mono text-[#736553] uppercase">
                    {task.verification_type.replace('_', ' ')}
                  </span>
                </div>

                <h3 className={`font-rpg text-base font-bold tracking-wide mb-1.5 ${
                  task.completed ? 'line-through text-[#8c7d6c]' : 'text-[#f4ecd8]'
                }`}>
                  {task.title}
                </h3>

                {task.description && (
                  <p className="text-xs text-[#8c7e6c] line-clamp-2 mb-4 leading-relaxed">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Bottom Rewards & Actions */}
              <div className="pt-3 border-t border-[#231a11] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-amber-300 font-bold">+{task.xp_reward} XP</span>
                  <span className="text-[#f4ecd8] font-bold">+{task.gold_reward} Gold</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {!task.completed ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenForgeModal(task)}
                        className="p-1.5 rounded-lg text-[#736553] hover:text-[#e4c278] hover:bg-[#231a10] border border-transparent hover:border-[#3d2f1d] transition-colors"
                        title="Edit Quest Lore"
                        aria-label="Edit Quest"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteQuest(task.id)}
                        className="p-1.5 rounded-lg text-[#736553] hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-colors"
                        title="Banish Quest"
                        aria-label="Delete Quest"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {task.verification_type === 'focus_session' ? (
                        <button
                          type="button"
                          onClick={() => onStartFocusSession(task)}
                          className="px-3 py-1.5 bg-[#231b12] hover:bg-[#2d2215] border border-[#4a3924] hover:border-[#c99a4a] text-[#e4c278] rounded-xl font-rpg text-xs font-semibold tracking-wider flex items-center gap-1.5 transition-all"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Focus ({task.target_duration_minutes || 25}m)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onCompleteQuest(task)}
                          className="px-3 py-1.5 bg-gradient-to-r from-[#b38536] to-[#966d28] hover:from-[#c99a4a] hover:to-[#b38536] text-[#120e09] rounded-xl font-rpg font-bold text-xs tracking-wider flex items-center gap-1.5 transition-all shadow"
                        >
                          <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Complete</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-mono text-emerald-400/80 bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-1 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

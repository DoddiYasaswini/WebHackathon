import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { ForgeQuestModal } from './components/ForgeQuestModal';
import { FocusSessionModal } from './components/FocusSessionModal';
import { QuestRitualModal } from './components/QuestRitualModal';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { DashboardView } from './components/DashboardView';
import { QuestsView } from './components/QuestsView';
import { CharacterView } from './components/CharacterView';
import { StreakView } from './components/StreakView';
import { RewardForgeView } from './components/RewardForgeView';
import { InventoryView } from './components/InventoryView';
import { JourneyView } from './components/JourneyView';
import { AchievementsView } from './components/AchievementsView';

import { 
  User, 
  UserProfile, 
  CharacterAttributes, 
  Task, 
  Item, 
  InventoryItem, 
  TaskHistory, 
  Badge,
  CompleteQuestResult,
  AuthResponse 
} from './types';
import { api } from './utils/api';
import { sound } from './utils/audio';
import { Loader2, Sparkles, Shield, ArrowRight } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [attributes, setAttributes] = useState<CharacterAttributes | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');

  // Core Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<(Item & { owned: boolean; equipped: boolean; inventory_id?: string })[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [journey, setJourney] = useState<TaskHistory[]>([]);
  const [achievements, setAchievements] = useState<(Badge & { unlocked: boolean; earned_at?: string })[]>([]);
  const [streakData, setStreakData] = useState<{
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    recent_days: { day: string; date: string; active: boolean }[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  // Modals & Rituals
  const [forgeModalOpen, setForgeModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  const [ritualModalOpen, setRitualModalOpen] = useState(false);
  const [completionResult, setCompletionResult] = useState<CompleteQuestResult | null>(null);

  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ previousLevel: number; newLevel: number } | null>(null);

  // Refresh all state from API
  const refreshAllData = useCallback(async () => {
    try {
      const [
        charRes,
        tasksRes,
        rewardsRes,
        inventoryRes,
        journeyRes,
        streakRes,
        achievementsRes
      ] = await Promise.all([
        api.getCharacter(),
        api.getTasks(),
        api.getRewards(),
        api.getInventory(),
        api.getJourney(),
        api.getStreak(),
        api.getAchievements()
      ]);

      setProfile(charRes.profile);
      setAttributes(charRes.attributes);
      setTasks(tasksRes);
      setRewards(rewardsRes);
      setInventory(inventoryRes);
      setJourney(journeyRes);
      setStreakData(streakRes);
      setAchievements(achievementsRes);
    } catch (err) {
      console.error('Failed to refresh LifeQuest data:', err);
    }
  }, []);

  // Check initial authentication
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const token = api.getToken();
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me.user);
          setProfile(me.profile);
          setAttributes(me.attributes);
          await refreshAllData();
        } catch (err) {
          console.warn('Session expired or invalid, clearing token');
          api.logout();
          setUser(null);
          setProfile(null);
          setAttributes(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [refreshAllData]);

  // Auth Success Callback
  const handleAuthSuccess = async (data: AuthResponse) => {
    setUser(data.user);
    setProfile(data.profile);
    setAttributes(data.attributes);
    setAuthModalOpen(false);
    sound.playLevelUp();
    await refreshAllData();
  };

  // Instant Demo Login handler for reviewer convenience
  const handleInstantDemo = async () => {
    sound.playClick();
    setLoading(true);
    try {
      const data = await api.login('demo@lifequest.rpg', 'demo123');
      await handleAuthSuccess(data);
    } catch (err) {
      console.error('Demo login error:', err);
      // Fallback open modal
      setAuthModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    sound.playClick();
    api.logout();
    setUser(null);
    setProfile(null);
    setAttributes(null);
    setTasks([]);
    setRewards([]);
    setInventory([]);
    setJourney([]);
    setCurrentTab('dashboard');
  };

  // Quest Completion Ritual
  const handleCompleteQuest = async (task: Task) => {
    sound.playClick();
    try {
      const res = await api.completeQuest(task.id);
      sound.playQuestComplete();
      setCompletionResult(res);
      setRitualModalOpen(true);

      // Update state
      setProfile(res.profile);
      setAttributes(res.attributes);

      if (res.levelUp) {
        setLevelUpData({
          previousLevel: res.previousLevel || (res.level - 1),
          newLevel: res.level
        });
      }

      await refreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to complete quest');
    }
  };

  // Focus Session
  const handleStartFocusSession = (task: Task) => {
    sound.playClick();
    setFocusTask(task);
    setFocusModalOpen(true);
  };

  const handleCompleteFocusSession = async (task: Task) => {
    setFocusModalOpen(false);
    try {
      const res = await api.completeQuest(task.id, {
        evidence_notes: `Completed ${task.target_duration_minutes || 25}-minute verified focus session.`,
        verified_status: 'session_verified'
      });
      sound.playQuestComplete();
      setCompletionResult(res);
      setRitualModalOpen(true);

      setProfile(res.profile);
      setAttributes(res.attributes);

      if (res.levelUp) {
        setLevelUpData({
          previousLevel: res.previousLevel || (res.level - 1),
          newLevel: res.level
        });
      }

      await refreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to complete focus quest');
    }
  };

  // Delete Quest
  const handleDeleteQuest = async (taskId: string) => {
    if (!window.confirm('Banish this quest from your scroll?')) return;
    sound.playClick();
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete quest');
    }
  };

  // Task Forged / Updated
  const handleQuestForged = (quest: Task, isEdit: boolean) => {
    if (isEdit) {
      setTasks(prev => prev.map(t => t.id === quest.id ? quest : t));
    } else {
      setTasks(prev => [quest, ...prev]);
    }
    refreshAllData();
  };

  // Reward Purchased
  const handleRewardPurchased = (updatedProfile: UserProfile, newItem: Item) => {
    setProfile(updatedProfile);
    refreshAllData();
  };

  // Item Equipped
  const handleItemEquipped = (updatedProfile: UserProfile, inventoryId: string) => {
    setProfile(updatedProfile);
    setInventory(prev => prev.map(inv => ({
      ...inv,
      equipped: inv.id === inventoryId
    })));
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0a08] flex flex-col items-center justify-center p-4 text-[#e6ded3]">
        <div className="w-16 h-16 rounded-2xl bg-[#1d1711] border border-[#4a3924] flex items-center justify-center mb-4 shadow-xl">
          <Loader2 className="w-8 h-8 text-[#c99a4a] animate-spin" />
        </div>
        <div className="font-rpg text-xl font-bold tracking-widest text-[#f4ecd8] uppercase">
          AWAKENING LIFEQUEST REALM...
        </div>
        <div className="text-xs font-mono text-[#8c7d6c] mt-2">
          Syncing character scrolls & attribute matrix
        </div>
      </div>
    );
  }

  // Unauthenticated Welcome Hero
  if (!user || !profile || !attributes) {
    return (
      <div className="min-h-screen bg-[#0d0a08] flex flex-col text-[#e6ded3] selection:bg-[#c99a4a] selection:text-[#120f0c]">
        {/* Simple Unauth Header */}
        <header className="border-b border-[#292015] bg-[#120f0c]/90 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c99a4a] to-[#73521e] p-[1.5px]">
              <div className="w-full h-full bg-[#16120e] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#e4c278]" />
              </div>
            </div>
            <span className="font-rpg text-lg font-bold tracking-wider text-[#f4ecd8]">LIFEQUEST</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { sound.playClick(); setAuthModalMode('login'); setAuthModalOpen(true); }}
              className="px-4 py-1.5 rounded-xl font-rpg text-xs font-semibold text-[#c99a4a] hover:text-[#f4ecd8] border border-[#3d2f1f] hover:border-[#c99a4a] transition-all"
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { sound.playClick(); setAuthModalMode('signup'); setAuthModalOpen(true); }}
              className="px-4 py-1.5 bg-[#c99a4a] hover:bg-[#e4c278] text-[#120f0c] rounded-xl font-rpg text-xs font-bold tracking-wider transition-all"
            >
              CREATE HERO
            </button>
          </div>
        </header>

        {/* Hero Body */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 sm:py-16 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#211a12] border border-[#3d2f1f] text-xs font-mono text-[#c99a4a] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>REALITY TO RPG CONVERSION MATRIX</span>
          </div>

          <h1 className="font-rpg text-3xl sm:text-5xl font-black text-[#f4ecd8] tracking-wider leading-tight max-w-2xl mb-4">
            LEVEL UP YOUR REAL LIFE DISCIPLINE.
          </h1>

          <p className="text-sm sm:text-base text-[#9c8d7b] max-w-xl mb-8 leading-relaxed">
            Turn coding, study sessions, workouts, and restorative habits into an authoritative RPG adventure with XP, leveling curves, streak embers, and the Reward Forge.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleInstantDemo}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#b38536] via-[#c99a4a] to-[#966d28] hover:from-[#c99a4a] hover:to-[#b38536] text-[#120e09] font-rpg font-bold text-sm tracking-wider rounded-2xl shadow-xl shadow-amber-950/50 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#120e09]" />
              <span>ENTER WITH DEMO HERO (LVL 7)</span>
            </button>

            <button
              type="button"
              onClick={() => { sound.playClick(); setAuthModalMode('signup'); setAuthModalOpen(true); }}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#17130f] hover:bg-[#211a13] border border-[#3d2f1f] hover:border-[#c99a4a] text-[#e4c278] font-rpg font-bold text-sm tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <span>FORGE NEW CHARACTER</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Pillars Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 text-left w-full">
            <div className="p-5 bg-[#14100c] border border-[#2b2116] rounded-2xl">
              <div className="font-rpg text-sm font-bold text-[#e4c278] mb-1">REAL QUESTS, REAL XP</div>
              <p className="text-xs text-[#8c7d6c]">DSA problems, chapter readings, and gym sets convert mathematically to experience points.</p>
            </div>
            <div className="p-5 bg-[#14100c] border border-[#2b2116] rounded-2xl">
              <div className="font-rpg text-sm font-bold text-[#e4c278] mb-1">AUTHORITATIVE STATS</div>
              <p className="text-xs text-[#8c7d6c]">Build Strength, Intellect, Vitality, and Mind. Track progress through non-linear progression curves.</p>
            </div>
            <div className="p-5 bg-[#14100c] border border-[#2b2116] rounded-2xl">
              <div className="font-rpg text-sm font-bold text-[#e4c278] mb-1">THE REWARD FORGE</div>
              <p className="text-xs text-[#8c7d6c]">Earn gold pieces through discipline. Unlock legendary frames, titles, and cosmetic artifacts.</p>
            </div>
          </div>
        </main>

        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // Authenticated Main Layout
  return (
    <div className="min-h-screen bg-[#0d0a08] flex flex-col text-[#e6ded3] selection:bg-[#c99a4a] selection:text-[#120f0c]">
      {/* Top Navbar HUD */}
      <Navbar
        profile={profile}
        attributes={attributes}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthModalOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Permanent / Collapsible Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onLogout={handleLogout}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content Chamber */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              attributes={attributes}
              tasks={tasks}
              rewards={rewards}
              streakData={streakData}
              onOpenForgeModal={() => { setTaskToEdit(null); setForgeModalOpen(true); }}
              onCompleteQuest={handleCompleteQuest}
              onStartFocusSession={handleStartFocusSession}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'quests' && (
            <QuestsView
              tasks={tasks}
              onOpenForgeModal={(t) => { setTaskToEdit(t || null); setForgeModalOpen(true); }}
              onDeleteQuest={handleDeleteQuest}
              onCompleteQuest={handleCompleteQuest}
              onStartFocusSession={handleStartFocusSession}
            />
          )}

          {currentTab === 'character' && (
            <CharacterView
              profile={profile}
              attributes={attributes}
              journey={journey}
              onProfileUpdated={(updated) => setProfile(updated)}
            />
          )}

          {currentTab === 'streak' && (
            <StreakView
              profile={profile}
              streakData={streakData}
            />
          )}

          {currentTab === 'rewards' && (
            <RewardForgeView
              profile={profile}
              rewards={rewards}
              onRewardPurchased={handleRewardPurchased}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              profile={profile}
              onItemEquipped={handleItemEquipped}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'journey' && (
            <JourneyView
              journey={journey}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'achievements' && (
            <AchievementsView
              achievements={achievements}
            />
          )}
        </main>
      </div>

      {/* Modals & Ritual Overlays */}
      <ForgeQuestModal
        isOpen={forgeModalOpen}
        onClose={() => { setForgeModalOpen(false); setTaskToEdit(null); }}
        onQuestForged={handleQuestForged}
        taskToEdit={taskToEdit}
      />

      <FocusSessionModal
        isOpen={focusModalOpen}
        task={focusTask}
        onClose={() => setFocusModalOpen(false)}
        onCompleteSession={handleCompleteFocusSession}
      />

      <QuestRitualModal
        isOpen={ritualModalOpen}
        result={completionResult}
        onClose={() => setRitualModalOpen(false)}
        onProceedToLevelUp={() => {
          setRitualModalOpen(false);
          setLevelUpOpen(true);
        }}
      />

      {levelUpData && (
        <LevelUpOverlay
          isOpen={levelUpOpen}
          previousLevel={levelUpData.previousLevel}
          newLevel={levelUpData.newLevel}
          onClose={() => {
            setLevelUpOpen(false);
            setLevelUpData(null);
          }}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

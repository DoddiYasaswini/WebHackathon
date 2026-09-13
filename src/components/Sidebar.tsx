import React from 'react';
import { 
  LayoutDashboard, 
  Scroll, 
  User, 
  Flame, 
  Anvil, 
  Backpack, 
  Compass, 
  Trophy, 
  LogOut 
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'quests', label: 'QUESTS', icon: Scroll },
    { id: 'character', label: 'CHARACTER', icon: User },
    { id: 'streak', label: 'STREAK', icon: Flame },
    { id: 'rewards', label: 'REWARD FORGE', icon: Anvil },
    { id: 'inventory', label: 'INVENTORY', icon: Backpack },
    { id: 'journey', label: 'JOURNEY', icon: Compass },
    { id: 'achievements', label: 'BADGES', icon: Trophy }
  ];

  const handleSelectTab = (tabId: string) => {
    sound.playClick();
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar (Left permanent column) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-[#2d251a] bg-[#12100d] min-h-[calc(100vh-57px)] p-4 select-none">
        <div className="text-[11px] font-mono tracking-widest text-[#7a6d5c] uppercase px-3 mb-2 font-semibold">
          Chambers of Realm
        </div>

        <nav className="space-y-1.5 flex-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-rpg text-xs tracking-wider transition-all text-left ${
                  active
                    ? 'bg-gradient-to-r from-[#2a2217] to-[#1c1812] text-[#f4ecd8] border border-[#52412b] shadow-md shadow-amber-950/20 font-bold'
                    : 'text-[#9c8d7b] hover:text-[#e4c278] hover:bg-[#181510] border border-transparent'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#e4c278]' : 'text-[#7d705f]'}`} />
                <span>{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c99a4a] shadow-[0_0_8px_#c99a4a]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar Action */}
        <div className="pt-4 mt-auto border-t border-[#2a2217] space-y-2">
          <div className="p-3 bg-[#171410] border border-[#2d251a] rounded-xl text-center">
            <div className="text-[11px] font-rpg text-[#c99a4a] font-bold">LIFEQUEST ENGINE</div>
            <div className="text-[10px] text-[#736756] mt-0.5 font-mono">v1.0 • RPG Productivity</div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-[#8c7d6c] hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-all font-mono"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Depart Realm</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (When hamburger menu is opened) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-black/80 backdrop-blur-sm">
          <div className="w-72 max-w-[80vw] h-full bg-[#12100d] border-r border-[#2d251a] p-4 flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#2d251a] mb-3">
              <span className="font-rpg text-sm font-bold text-[#e4c278]">NAVIGATION</span>
              <button 
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-[#8c7d6c] hover:text-white"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-1.5 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-rpg text-xs tracking-wider transition-all text-left ${
                      active
                        ? 'bg-[#2a2217] text-[#f4ecd8] border border-[#52412b] font-bold'
                        : 'text-[#9c8d7b] hover:text-[#e4c278] hover:bg-[#181510]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#e4c278]' : 'text-[#7d705f]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-[#2a2217]">
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs text-red-400 bg-red-950/20 border border-red-900/40"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Persistent quick access on small screens) */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#12100d]/95 backdrop-blur border-t border-[#2d251a] flex items-center justify-around py-2 px-1"
        aria-label="Mobile Bottom Navigation"
      >
        {[
          { id: 'dashboard', label: 'HUD', icon: LayoutDashboard },
          { id: 'quests', label: 'Quests', icon: Scroll },
          { id: 'character', label: 'Hero', icon: User },
          { id: 'rewards', label: 'Forge', icon: Anvil },
          { id: 'streak', label: 'Streak', icon: Flame }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-lg transition-colors ${
                active ? 'text-[#e4c278]' : 'text-[#7d705f] hover:text-[#a89984]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-rpg tracking-wider font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

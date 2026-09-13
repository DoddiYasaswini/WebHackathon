import React from 'react';
import { 
  Shield, 
  Coins, 
  Flame, 
  Volume2, 
  VolumeX, 
  Compass, 
  Sparkles, 
  BookOpen, 
  Crown, 
  LogOut, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { UserProfile, CharacterAttributes } from '../types';
import { sound } from '../utils/audio';

interface NavbarProps {
  profile: UserProfile | null;
  attributes: CharacterAttributes | null;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  currentTab,
  setCurrentTab,
  onLogout,
  onOpenAuth,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.isMuted());

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const getAvatarIcon = (avatarName: string) => {
    switch (avatarName) {
      case 'Flame': return <Flame className="w-5 h-5 text-amber-500" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-400" />;
      case 'Crown': return <Crown className="w-5 h-5 text-yellow-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-amber-400" />;
      default: return <Compass className="w-5 h-5 text-amber-300" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#110f0c]/95 backdrop-blur border-b border-[#2e271d] px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded text-[#a89984] hover:text-[#e6ded3] hover:bg-[#1e1a14] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button 
            type="button"
            onClick={() => { sound.playClick(); setCurrentTab('dashboard'); }}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            aria-label="LifeQuest Dashboard"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#c99a4a] via-[#8c6729] to-[#3a2c14] p-[1px] shadow-lg shadow-amber-950/40">
              <div className="w-full h-full bg-[#171410] rounded-[7px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#e4c278] group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="font-rpg text-base sm:text-lg font-bold tracking-wider text-[#f4ecd8] group-hover:text-[#c99a4a] transition-colors">
                LIFEQUEST
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-[#8c7e6c] font-medium">
                Real Life RPG
              </span>
            </div>
          </button>
        </div>

        {/* Center: Live Character Progression HUD (when logged in) */}
        {profile ? (
          <div className="hidden lg:flex items-center gap-6 bg-[#16130f] border border-[#2e261c] px-4 py-1.5 rounded-xl shadow-inner">
            {/* Level & XP */}
            <div className="flex items-center gap-3 min-w-[210px]">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-[#a89984] uppercase tracking-wider">Level</span>
                <span className="font-rpg text-base font-extrabold text-[#e4c278] leading-none">
                  {String(profile.level).padStart(2, '0')}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center text-[11px] mb-1 font-mono">
                  <span className="text-[#a89984]">EXP</span>
                  <span className="text-[#d8cdbc]">
                    {profile.current_level_xp} <span className="text-[#6d6150]">/</span> {profile.xp_for_next_level}
                  </span>
                </div>
                {/* Accessible Progress Bar */}
                <div 
                  role="progressbar" 
                  aria-valuenow={profile.progress_percentage} 
                  aria-valuemin={0} 
                  aria-valuemax={100}
                  aria-label={`Experience progress: ${profile.progress_percentage}% to Level ${profile.level + 1}`}
                  className="w-full h-2 bg-[#211b14] rounded-full overflow-hidden border border-[#382f22]"
                >
                  <div 
                    className="h-full bg-gradient-to-r from-[#9e752e] via-[#c99a4a] to-[#f4ecd8] transition-all duration-500 rounded-full"
                    style={{ width: `${profile.progress_percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-[#2e261c]" />

            {/* Gold Currency */}
            <div className="flex items-center gap-1.5" title={`${profile.gold} Gold Pieces`}>
              <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5 text-[#e4c278]" />
              </div>
              <span className="font-mono font-semibold text-sm text-[#f4ecd8]">
                {profile.gold.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#9c8d7b] font-medium">Gold</span>
            </div>

            <div className="h-6 w-[1px] bg-[#2e261c]" />

            {/* Streak Flame */}
            <div className="flex items-center gap-1.5" title={`${profile.current_streak} Day Streak`}>
              <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              </div>
              <span className="font-mono font-semibold text-sm text-[#f4ecd8]">
                {profile.current_streak}
              </span>
              <span className="text-[11px] text-[#9c8d7b] font-medium">Streak</span>
            </div>
          </div>
        ) : null}

        {/* Right: Sound toggle & Character Avatar / Auth CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle button */}
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-lg text-[#a89984] hover:text-[#e4c278] hover:bg-[#1a1712] border border-transparent hover:border-[#382f22] transition-colors"
            title={isMuted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
            aria-label={isMuted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-[#c99a4a]" />}
          </button>

          {profile ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-[#2e271d]">
              <button
                type="button"
                onClick={() => { sound.playClick(); setCurrentTab('character'); }}
                className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-lg hover:bg-[#1e1a14] border border-transparent hover:border-[#3d3223] transition-all text-left group"
                aria-label={`View Character: ${profile.username}`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-[#1e1913] border border-[#4d3f2c] flex items-center justify-center shadow-md group-hover:border-[#c99a4a] transition-colors">
                    {getAvatarIcon(profile.avatar)}
                  </div>
                  {profile.frame && profile.frame !== 'Standard' && (
                    <div className="absolute -inset-0.5 border border-[#c99a4a]/50 rounded-lg pointer-events-none animate-pulse" />
                  )}
                </div>

                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-[#f0e6d6] group-hover:text-[#c99a4a] transition-colors leading-tight">
                    {profile.username}
                  </div>
                  <div className="text-[10px] text-[#8e806e] font-mono tracking-wider">
                    {profile.title || 'THE SEEKER'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-lg text-[#8e806e] hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/40 transition-colors"
                title="Log Out of Realm"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-[#d8cdbc] hover:text-white bg-[#1a1611] hover:bg-[#262017] border border-[#3d3222] rounded-lg transition-colors"
              >
                Enter Realm
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

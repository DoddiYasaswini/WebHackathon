import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, AlertCircle, ArrowRight, Lock, Mail, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import { sound } from '../utils/audio';
import { AuthResponse } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (data: AuthResponse) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signup'
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client validation
    if (!email.trim()) {
      setError('Please enter your scroll address (email).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setError('Please provide a secure passcode.');
      return;
    }
    if (password.length < 6) {
      setError('Passcode must be at least 6 characters in length.');
      return;
    }

    setLoading(true);
    sound.playClick();

    try {
      if (mode === 'signup') {
        const res = await api.signup(email.trim(), password, username.trim() || undefined);
        sound.playLevelUp();
        onAuthSuccess(res);
      } else {
        const res = await api.login(email.trim(), password);
        sound.playCoin();
        onAuthSuccess(res);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    sound.playClick();
    try {
      const res = await api.login('demo@lifequest.rpg', 'demo123');
      sound.playLevelUp();
      onAuthSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Could not awaken demo adventurer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        className="relative w-full max-w-md bg-[#16130f] border border-[#3e3223] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black text-[#e6ded3] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8c7d6b] hover:text-[#e4c278] p-1.5 rounded-lg hover:bg-[#231d16] transition-colors"
          aria-label="Close Authentication Chamber"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#c99a4a] to-[#59421c] p-[1px] mb-3 shadow-lg shadow-amber-950/40">
            <div className="w-full h-full bg-[#171410] rounded-[11px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#e4c278]" />
            </div>
          </div>
          <h2 id="auth-modal-title" className="font-rpg text-xl sm:text-2xl font-bold text-[#f4ecd8] tracking-wider">
            {mode === 'signup' ? 'FORGE YOUR CHARACTER' : 'ENTER THE REALM'}
          </h2>
          <p className="text-xs text-[#9c8d7b] mt-1 font-sans">
            {mode === 'signup' 
              ? 'Begin your journey at Level 1, 100 Gold & 10 Core Attributes' 
              : 'Resume your quest log and ongoing streak'}
          </p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div 
            role="alert"
            className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Auth Mode Toggle */}
        <div className="grid grid-cols-2 p-1 bg-[#120f0c] border border-[#2d2419] rounded-xl mb-6 font-rpg text-xs">
          <button
            type="button"
            onClick={() => { sound.playClick(); setMode('signup'); setError(null); }}
            className={`py-2 rounded-lg font-bold transition-all ${
              mode === 'signup'
                ? 'bg-[#2b2216] text-[#e4c278] shadow border border-[#4d3d28]'
                : 'text-[#857664] hover:text-[#d8cdbc]'
            }`}
          >
            CREATE CHARACTER
          </button>
          <button
            type="button"
            onClick={() => { sound.playClick(); setMode('login'); setError(null); }}
            className={`py-2 rounded-lg font-bold transition-all ${
              mode === 'login'
                ? 'bg-[#2b2216] text-[#e4c278] shadow border border-[#4d3d28]'
                : 'text-[#857664] hover:text-[#d8cdbc]'
            }`}
          >
            SIGN IN
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-username" className="block text-xs font-semibold text-[#a89984] mb-1.5 uppercase font-rpg tracking-wider">
                Adventurer Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#736553]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Roland the Bold"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#120f0c] border border-[#382d20] focus:border-[#c99a4a] focus:ring-1 focus:ring-[#c99a4a] rounded-xl text-sm text-[#f0e7d8] placeholder-[#5c5040] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold text-[#a89984] mb-1.5 uppercase font-rpg tracking-wider">
              Scroll Address (Email) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#736553]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adventurer@realm.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#120f0c] border border-[#382d20] focus:border-[#c99a4a] focus:ring-1 focus:ring-[#c99a4a] rounded-xl text-sm text-[#f0e7d8] placeholder-[#5c5040] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="auth-password" className="block text-xs font-semibold text-[#a89984] uppercase font-rpg tracking-wider">
                Passcode (Password) <span className="text-red-400">*</span>
              </label>
              {mode === 'signup' && (
                <span className="text-[10px] text-[#807261]">Min 6 characters</span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#736553]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-[#120f0c] border border-[#382d20] focus:border-[#c99a4a] focus:ring-1 focus:ring-[#c99a4a] rounded-xl text-sm text-[#f0e7d8] placeholder-[#5c5040] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#736553] hover:text-[#c99a4a]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#b38536] via-[#c99a4a] to-[#966d28] hover:from-[#c99a4a] hover:to-[#b38536] text-[#120e09] font-rpg font-bold tracking-wider rounded-xl shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'signup' ? 'FORGING CHARACTER...' : 'OPENING GATES...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'signup' ? 'COMMENCE ODYSSEY' : 'ENTER REALM'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div className="mt-6 pt-5 border-t border-[#2e261b]">
          <div className="text-center text-[11px] text-[#736655] mb-2 uppercase tracking-widest font-mono">
            Hackathon Reviewer Quick Access
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-3 bg-[#1e1913] hover:bg-[#282119] border border-[#423423] hover:border-[#c99a4a]/50 text-[#e4c278] rounded-xl text-xs font-rpg font-semibold tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e4c278]" />
            <span>INSTANT DEMO CHARACTER (LVL 7 AIDEN)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

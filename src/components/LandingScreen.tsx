import React from 'react';
import { audioManager } from '../services/audioManager';
import { Swords, Shield, Trophy, Flame, Sparkles, ChevronRight, Lock } from 'lucide-react';

interface LandingScreenProps {
  onEnterArena: () => void;
  onOpenAdminLogin: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onEnterArena,
  onOpenAdminLogin,
}) => {
  const handleStart = () => {
    // WAJIB: Start BGM on user interaction
    audioManager.startBGM();
    onEnterArena();
  };

  return (
    <div className="relative min-h-screen w-full bg-[#07101F] text-white flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden select-none">
      
      {/* Background Hero Banner with Measured Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/arena_background_1790519727561.jpg"
          alt="Clash of Champions Arena"
          className="w-full h-full object-cover object-center opacity-35 scale-105 filter blur-[1px]"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // CSS fallback if image not found
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07101F] via-[#07101F]/80 to-[#07101F]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(#00F2FE_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      </div>

      {/* Top Bar / Mini Header */}
      <div className="relative z-10 w-full max-w-6xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F2FE] to-[#FFB703] p-0.5 shadow-[0_0_15px_rgba(0,242,254,0.5)]">
            <div className="w-full h-full bg-[#07101F] rounded-[6px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#00F2FE]" />
            </div>
          </div>
          <span className="font-heading text-xs sm:text-sm font-bold tracking-wider text-slate-200">
            ESPORT QUIZ CHAMPIONSHIP
          </span>
        </div>

        {/* Small discrete Admin button */}
        <button
          onClick={onOpenAdminLogin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-[#FFB703] transition-colors text-xs font-heading uppercase tracking-wider cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>ADMIN</span>
        </button>
      </div>

      {/* Center Hero Block */}
      <div className="relative z-10 my-auto text-center max-w-3xl flex flex-col items-center py-8">
        
        {/* Championship Crest Icon */}
        <div className="relative mb-6">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl p-1 bg-gradient-to-b from-[#00F2FE] via-[#FFB703] to-[#07101F] shadow-[0_0_50px_rgba(0,242,254,0.4)] animate-pulse-glow">
            <div className="w-full h-full bg-[#0B1325] rounded-[22px] overflow-hidden flex items-center justify-center p-2 relative">
              <img
                src="/src/assets/images/championship_crest_1790519739320.jpg"
                alt="Championship Emblem"
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Swords className="w-14 h-14 text-[#00F2FE] drop-shadow-[0_0_12px_#00F2FE]" />
              </div>
            </div>
          </div>
          {/* Glowing Gem Accents */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FFB703] rotate-45 shadow-[0_0_15px_#FFB703]" />
        </div>

        {/* Main Title */}
        <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] via-[#FFFFFF] to-[#00CFE8] uppercase drop-shadow-[0_4px_12px_rgba(0,242,254,0.6)]">
          CLASH OF CHAMPIONS
        </h1>

        {/* Subtitles */}
        <div className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-widest text-[#FFB703] uppercase drop-shadow-[0_2px_10px_rgba(255,183,3,0.5)] my-2">
          IPS ARENA
        </div>

        <p className="text-sm sm:text-base md:text-lg text-[#BFC7D5] font-subheading tracking-widest uppercase mb-8 max-w-xl">
          PERTANDINGAN QUIZ IPS • PERUBAHAN IKLIM & TANTANGAN GLOBAL
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-10 text-xs sm:text-sm font-semibold text-slate-300">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-[#00F2FE]/40 text-[#00F2FE] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-ping" />
            <span>30 KARTU BERTINGKAT</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-[#FFB703]/40 text-[#FFB703] flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>LEVEL 1 · 2 · 3</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>RANKING SETIAP 8 MENIT</span>
          </div>
        </div>

        {/* Big Entry Button */}
        <button
          onClick={handleStart}
          className="group relative overflow-hidden py-4 sm:py-5 px-10 sm:px-14 rounded-2xl font-heading font-black text-lg sm:text-xl uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-[#00F2FE] via-[#00CFE8] to-[#FFB703] text-[#07101F] shadow-[0_0_35px_rgba(0,242,254,0.6)] hover:shadow-[0_0_60px_rgba(0,242,254,0.9)] hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/40"
        >
          {/* Animated Sheen Overlay */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
          
          <span className="relative z-10 flex items-center justify-center gap-3">
            <Sparkles className="w-6 h-6 fill-current" />
            <span>MASUK ARENA PERTANDINGAN</span>
            <ChevronRight className="w-6 h-6 stroke-[3] group-hover:translate-x-1 transition-transform" />
          </span>
        </button>

        <p className="text-xs text-slate-400 mt-4 tracking-wide font-rajdhani">
          *Musik latar pertandingan (BGM) akan otomatis aktif saat tombol ditekan
        </p>
      </div>

      {/* Footer info */}
      <div className="relative z-10 w-full max-w-6xl text-center border-t border-slate-800/80 pt-4 pb-2 text-xs text-slate-500 font-rajdhani">
        <span>Mata Pelajaran IPS SMP / MTs • Kurikulum Merdeka • Mode Proyektor Kelas</span>
      </div>
    </div>
  );
};

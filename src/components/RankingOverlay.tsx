import React, { useEffect, useState } from 'react';
import { Participant } from '../types';
import { Trophy, Crown, Flame, Timer, ArrowRight } from 'lucide-react';

interface RankingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
}

export const RankingOverlay: React.FC<RankingOverlayProps> = ({
  isOpen,
  onClose,
  participants,
}) => {
  const [countdown, setCountdown] = useState(12);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(12);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sorted = [...participants].sort((a, b) => b.score - a.score);
  const topFive = sorted.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl p-1 rounded-3xl bg-gradient-to-b from-[#00F2FE] via-[#FFB703] to-[#07101F] shadow-[0_0_60px_rgba(0,242,254,0.5)] animate-in zoom-in-95 duration-200">
        
        {/* Interior Container */}
        <div className="relative w-full h-full bg-gradient-to-b from-[#0B1325] via-[#07101F] to-[#040812] rounded-[22px] p-6 sm:p-10 text-center text-white overflow-hidden">
          
          {/* Subtle Cyber Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#00F2FE_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

          {/* Glowing Aura Ring */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00F2FE]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Badge & Title */}
          <div className="relative z-10 flex flex-col items-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB703]/20 border border-[#FFB703]/40 text-[#FFB703] text-xs font-heading uppercase tracking-widest mb-3">
              <Timer className="w-3.5 h-3.5" />
              <span>UPDATE SETIAP 8 MENIT</span>
            </div>

            <div className="relative mb-2 w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00F2FE]/20 to-[#FFB703]/20 border-2 border-[#00F2FE] flex items-center justify-center shadow-[0_0_25px_rgba(0,242,254,0.4)]">
              <Trophy className="w-8 h-8 text-[#FFB703]" />
              <Crown className="w-4 h-4 text-[#00F2FE] absolute -top-2 -right-2" />
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] via-white to-[#FFB703] uppercase">
              CHAMPIONS RANKING
            </h2>
            <p className="text-xs sm:text-sm text-[#BFC7D5] font-rajdhani tracking-wide mt-1">
              Klasemen Sementara Turnamen Clash of Champions : IPS Arena
            </p>
          </div>

          {/* Standings List */}
          <div className="relative z-10 space-y-2.5 mb-8 text-left">
            {topFive.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Belum ada skor yang tercatat di sesi ini.
              </div>
            ) : (
              topFive.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    idx === 0
                      ? 'bg-gradient-to-r from-[#FFB703]/25 to-slate-900/60 border-[#FFB703] shadow-[0_0_20px_rgba(255,183,3,0.3)]'
                      : idx === 1
                      ? 'bg-slate-800/80 border-slate-400/50'
                      : idx === 2
                      ? 'bg-slate-800/60 border-amber-700/50'
                      : 'bg-slate-900/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-heading font-black text-sm sm:text-base w-7 h-7 rounded-lg flex items-center justify-center ${
                        idx === 0
                          ? 'bg-[#FFB703] text-slate-950 shadow-[0_0_10px_#FFB703]'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-[260px]">
                      {p.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-[#00F2FE] text-base sm:text-lg tabular-nums">
                      {p.score}
                    </span>
                    <span className="text-[11px] text-[#BFC7D5] uppercase font-semibold">POIN</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Countdown & Close */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-700/60 text-xs">
            <div className="text-slate-400 flex items-center gap-1.5">
              <span>Menutup otomatis dalam</span>
              <span className="font-heading font-bold text-[#00F2FE] tabular-nums text-sm">
                {countdown}s
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#00CFE8] to-[#FFB703] text-[#07101F] font-heading font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(0,242,254,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>LANJUTKAN PERTANDINGAN</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

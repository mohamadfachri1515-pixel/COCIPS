import React from 'react';
import { Question } from '../types';
import { Shield, CheckCircle2, Users, Sparkles, Clock } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  hasCurrentParticipantAnswered: boolean;
  totalAnsweredCount: number;
  isParticipantInCooldown: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  hasCurrentParticipantAnswered,
  totalAnsweredCount,
  isParticipantInCooldown,
  onClick,
  disabled = false,
}) => {
  // Format 2-digit number (e.g. 01, 09, 30)
  const formattedNumber = String(question.cardNumber).padStart(2, '0');

  // Difficulty badge & colors
  const levelBadge = {
    'Level 1': { text: 'LEVEL 1', color: 'from-[#00F2FE] to-[#0077B6]', glow: 'shadow-[#00F2FE]/20', border: 'border-[#00F2FE]/50' },
    'Level 2': { text: 'LEVEL 2', color: 'from-[#FFB703] to-[#FB8500]', glow: 'shadow-[#FFB703]/20', border: 'border-[#FFB703]/50' },
    'Level 3': { text: 'LEVEL 3', color: 'from-[#E63946] to-[#9D0208]', glow: 'shadow-[#E63946]/20', border: 'border-[#E63946]/50' },
  }[question.level];

  return (
    <button
      onClick={onClick}
      disabled={disabled || hasCurrentParticipantAnswered}
      aria-label={`Kartu nomor ${question.cardNumber}, ${question.level}, ${question.points} poin`}
      className={`group relative text-left w-full h-[185px] sm:h-[195px] p-0.5 rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00F2FE] ${
        hasCurrentParticipantAnswered
          ? 'opacity-60 cursor-not-allowed filter grayscale-[30%]'
          : 'hover:-translate-y-1.5 hover:scale-[1.02] cursor-pointer'
      }`}
    >
      {/* Outer Metallic & Cyber Shield Border Frame */}
      <div
        className={`relative w-full h-full rounded-xl overflow-hidden p-[2px] transition-all duration-300 ${
          hasCurrentParticipantAnswered
            ? 'bg-slate-800/80 border border-slate-700/60'
            : question.level === 'Level 1'
            ? 'bg-gradient-to-b from-[#00F2FE]/60 via-[#07101F] to-[#00CFE8]/70 hover:from-[#00F2FE] hover:to-[#00CFE8] shadow-lg hover:shadow-[0_0_20px_rgba(0,242,254,0.45)]'
            : question.level === 'Level 2'
            ? 'bg-gradient-to-b from-[#FFB703]/60 via-[#07101F] to-[#8A5A00]/70 hover:from-[#FFB703] hover:to-[#FB8500] shadow-lg hover:shadow-[0_0_20px_rgba(255,183,3,0.45)]'
            : 'bg-gradient-to-b from-[#E63946]/60 via-[#07101F] to-[#9D0208]/70 hover:from-[#E63946] hover:to-[#E63946] shadow-lg hover:shadow-[0_0_20px_rgba(230,57,70,0.45)]'
        }`}
      >
        {/* Card Interior */}
        <div className="relative w-full h-full bg-gradient-to-b from-[#0B1325] via-[#07101F] to-[#040812] rounded-[10px] p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden">
          
          {/* Subtle Background Pattern & Cyber Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#00F2FE_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none" />
          
          {/* Metallic Corner Ornaments */}
          <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#00F2FE]/60" />
          <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#00F2FE]/60" />
          <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#FFB703]/60" />
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#FFB703]/60" />

          {/* Top Brand Tag */}
          <div className="flex items-center justify-between w-full border-b border-slate-700/50 pb-1">
            <span className="text-[9px] sm:text-[10px] font-heading tracking-widest text-[#BFC7D5] uppercase truncate">
              CLASH OF CHAMPIONS
            </span>
            <div className="flex items-center gap-1.5">
              {totalAnsweredCount > 0 && (
                <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-0.5">
                  <Users className="w-2.5 h-2.5 text-[#00F2FE]" />
                  <span>{totalAnsweredCount}</span>
                </span>
              )}
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase ${
                  question.level === 'Level 1'
                    ? 'bg-[#00F2FE]/15 text-[#00F2FE]'
                    : question.level === 'Level 2'
                    ? 'bg-[#FFB703]/15 text-[#FFB703]'
                    : 'bg-[#E63946]/15 text-[#E63946]'
                }`}
              >
                {question.difficultyLabel}
              </span>
            </div>
          </div>

          {/* Center Card Number & Title */}
          <div className="flex flex-col items-center justify-center my-auto text-center py-1">
            <span className="text-[10px] sm:text-[11px] tracking-widest text-[#BFC7D5] font-subheading uppercase">
              KARTU ESSAY
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-extrabold tracking-wider my-0.5 text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5F7FA] to-[#BFC7D5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              #{formattedNumber}
            </div>
            
            {/* Level & Points Bar */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold tracking-wider text-slate-300">
              <span className="text-white font-bold">{levelBadge.text}</span>
              <span className="text-slate-500">•</span>
              <span className="text-[#FFB703] font-bold tabular-nums">+{question.points} POIN</span>
            </div>
          </div>

          {/* Bottom Gem & Shield Status Element */}
          <div className="relative flex items-center justify-center w-full pt-1 border-t border-slate-700/50">
            {hasCurrentParticipantAnswered ? (
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>SUDAH KAMU JAWAB</span>
              </div>
            ) : isParticipantInCooldown ? (
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="tracking-wider uppercase text-[10px] font-rajdhani">COOLDOWN</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#00F2FE]">
                {/* Glowing Diamond Gem */}
                <div className="w-2.5 h-2.5 bg-gradient-to-tr from-[#00F2FE] to-[#FFB703] rotate-45 shadow-[0_0_8px_#00F2FE] animate-pulse" />
                <span className="tracking-wider uppercase text-[10px] font-rajdhani">PILIH SOAL</span>
                <div className="w-2.5 h-2.5 bg-gradient-to-tr from-[#FFB703] to-[#00F2FE] rotate-45 shadow-[0_0_8px_#FFB703] animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

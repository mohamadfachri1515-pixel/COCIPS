import React from 'react';
import { Participant } from '../types';
import { Trophy, Medal, X, Crown, Award, Flame } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  participants,
}) => {
  if (!isOpen) return null;

  // Sort participants by score descending, then accuracy descending
  const sorted = [...participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.accuracy - a.accuracy;
  });

  const topThree = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto rounded-2xl p-1 bg-gradient-to-b from-[#FFB703] via-[#00F2FE] to-[#07101F] shadow-[0_0_50px_rgba(255,183,3,0.35)] animate-in zoom-in-95 duration-200">
        
        {/* Interior Container */}
        <div className="relative w-full h-full bg-gradient-to-b from-[#0B1325] via-[#07101F] to-[#040812] rounded-[14px] p-5 sm:p-8 text-white overflow-hidden">
          
          {/* Subtle Cyber Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#00F2FE_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#FFB703]/20 to-[#00F2FE]/20 border border-[#FFB703]/40 shadow-[0_0_15px_rgba(255,183,3,0.3)]">
                <Trophy className="w-6 h-6 text-[#FFB703]" />
              </div>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFB703] via-white to-[#00F2FE] uppercase">
                  CHAMPION LEADERBOARD
                </h2>
                <p className="text-xs text-[#BFC7D5] font-rajdhani tracking-wide">
                  Peringkat skor kumulatif peserta turnamen IPS Arena
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* If No Participants Yet */}
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
              <p className="font-medium">Belum ada peserta yang menyelesaikan soal.</p>
              <p className="text-xs text-slate-500 mt-1">Pilih salah satu kartu untuk memulai pertarungan!</p>
            </div>
          ) : (
            <>
              {/* Podium Section for Top 3 */}
              <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4 mb-8 items-end pt-6">
                
                {/* #2 Rank (Silver) */}
                <div className="flex flex-col items-center">
                  {topThree[1] ? (
                    <div className="w-full text-center">
                      <div className="relative mx-auto mb-2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-800 border-2 border-slate-300 flex items-center justify-center shadow-[0_0_15px_rgba(192,192,192,0.4)]">
                        <Medal className="w-6 h-6 sm:w-7 sm:h-7 text-slate-300" />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-slate-300 text-slate-950 font-bold text-[10px] rounded-full">
                          #2
                        </span>
                      </div>
                      <div className="font-heading text-xs sm:text-sm font-bold truncate max-w-[120px] mx-auto text-slate-200">
                        {topThree[1].name}
                      </div>
                      <div className="text-[#00F2FE] font-bold text-sm sm:text-base tabular-nums">
                        {topThree[1].score} pts
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {topThree[1].accuracy}% Akurasi
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-center text-slate-600 text-xs py-4">- Kosong -</div>
                  )}
                  <div className="w-full h-14 sm:h-18 mt-2 rounded-t-xl bg-gradient-to-t from-slate-800 to-slate-700/80 border-t border-slate-500/50 flex items-center justify-center font-heading font-black text-slate-400 text-lg sm:text-xl">
                    2ND
                  </div>
                </div>

                {/* #1 Rank (Gold Champion) */}
                <div className="flex flex-col items-center">
                  {topThree[0] ? (
                    <div className="w-full text-center">
                      <div className="relative mx-auto mb-2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#FFB703]/30 to-[#FFD166]/20 border-2 border-[#FFB703] flex items-center justify-center shadow-[0_0_25px_rgba(255,183,3,0.6)] animate-pulse">
                        <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFB703]" />
                        <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-[#FFB703] text-slate-950 font-extrabold text-xs rounded-full">
                          #1
                        </span>
                      </div>
                      <div className="font-heading text-sm sm:text-base font-extrabold truncate max-w-[140px] mx-auto text-[#FFB703]">
                        {topThree[0].name}
                      </div>
                      <div className="text-white font-extrabold text-base sm:text-xl tabular-nums">
                        {topThree[0].score} pts
                      </div>
                      <div className="text-xs text-amber-300 font-semibold">
                        {topThree[0].correctCount} Benar • {topThree[0].accuracy}% Akurasi
                      </div>
                    </div>
                  ) : null}
                  <div className="w-full h-20 sm:h-26 mt-2 rounded-t-xl bg-gradient-to-t from-[#8A5A00]/80 via-[#FFB703]/50 to-[#FFB703] border-t-2 border-[#FFB703] flex items-center justify-center font-heading font-black text-slate-950 text-2xl sm:text-3xl shadow-[0_0_20px_rgba(255,183,3,0.4)]">
                    1ST
                  </div>
                </div>

                {/* #3 Rank (Bronze) */}
                <div className="flex flex-col items-center">
                  {topThree[2] ? (
                    <div className="w-full text-center">
                      <div className="relative mx-auto mb-2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-800 border-2 border-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.3)]">
                        <Award className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-amber-700 text-white font-bold text-[10px] rounded-full">
                          #3
                        </span>
                      </div>
                      <div className="font-heading text-xs sm:text-sm font-bold truncate max-w-[120px] mx-auto text-slate-200">
                        {topThree[2].name}
                      </div>
                      <div className="text-[#00F2FE] font-bold text-sm sm:text-base tabular-nums">
                        {topThree[2].score} pts
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {topThree[2].accuracy}% Akurasi
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-center text-slate-600 text-xs py-4">- Kosong -</div>
                  )}
                  <div className="w-full h-11 sm:h-14 mt-2 rounded-t-xl bg-gradient-to-t from-slate-900 to-amber-950/80 border-t border-amber-700/50 flex items-center justify-center font-heading font-black text-amber-600 text-base sm:text-lg">
                    3RD
                  </div>
                </div>
              </div>

              {/* Full Participants Table */}
              <div className="relative z-10 border border-slate-700/60 rounded-xl overflow-hidden bg-slate-900/40">
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/90 text-xs uppercase font-heading text-[#BFC7D5] border-b border-slate-700/60 sticky top-0">
                      <tr>
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Nama Peserta</th>
                        <th className="py-3 px-4 text-center">Skor</th>
                        <th className="py-3 px-4 text-center">Benar</th>
                        <th className="py-3 px-4 text-center">Salah</th>
                        <th className="py-3 px-4 text-right">Akurasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {sorted.map((p, index) => (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-800/50 transition-colors ${
                            index === 0
                              ? 'bg-[#FFB703]/10 font-semibold'
                              : index < 3
                              ? 'bg-slate-800/20'
                              : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-heading font-bold">
                            {index === 0 ? (
                              <span className="text-[#FFB703]">#1 👑</span>
                            ) : index === 1 ? (
                              <span className="text-slate-300">#2 🥈</span>
                            ) : index === 2 ? (
                              <span className="text-amber-600">#3 🥉</span>
                            ) : (
                              <span className="text-slate-500 tabular-nums">#{index + 1}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium text-white truncate max-w-[180px]">
                            {p.name}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-[#00F2FE] tabular-nums">
                            {p.score}
                          </td>
                          <td className="py-3 px-4 text-center text-emerald-400 font-semibold tabular-nums">
                            {p.correctCount}
                          </td>
                          <td className="py-3 px-4 text-center text-rose-400 font-semibold tabular-nums">
                            {p.wrongCount}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-300 tabular-nums">
                            {p.accuracy}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Footer note */}
          <div className="relative z-10 mt-6 flex items-center justify-between text-xs text-slate-400">
            <span>Total Peserta Terdaftar: {sorted.length}</span>
            <button
              onClick={onClose}
              className="py-2 px-6 rounded-lg bg-gradient-to-r from-[#00F2FE] to-[#00CFE8] text-[#07101F] font-heading font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer"
            >
              KEMBALI KE ARENA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

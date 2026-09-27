import React, { useEffect } from 'react';
import { GameSession, Participant } from '../types';
import { audioManager } from '../services/audioManager';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Medal, Award, RotateCcw, Sparkles, Download, Printer } from 'lucide-react';

interface GameOverScreenProps {
  session: GameSession;
  onPlayAgain: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  session,
  onPlayAgain,
}) => {
  useEffect(() => {
    // Stop BGM cleanly on Game Over
    audioManager.stopBGM();

    // Trigger celebratory grand confetti cascades
    const end = Date.now() + 3.5 * 1000;
    const colors = ['#00F2FE', '#FFB703', '#FFFFFF', '#00CFE8'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const sorted = [...session.participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.accuracy - a.accuracy;
  });

  const topThree = sorted.slice(0, 3);

  const handleExportCSV = () => {
    const rows: (string | number)[][] = [
      ['Peringkat', 'Nama Siswa', 'Total Skor', 'Soal Terjawab', 'Jumlah Benar', 'Jumlah Salah', 'Akurasi (%)']
    ];
    sorted.forEach((p, idx) => {
      rows.push([
        idx + 1,
        p.name,
        p.score,
        p.answeredCount,
        p.correctCount,
        p.wrongCount,
        p.accuracy
      ]);
    });

    const csvContent = '\uFEFF' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Hasil_Turnamen_IPS_Arena_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-[#07101F] text-white flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Background Ambience & Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00F2FE]/15 via-[#0B1325]/80 to-[#040812] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#00F2FE_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl text-center">
        
        {/* Championship Trophy Crest */}
        <div className="relative mx-auto mb-6 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#FFB703]/30 via-[#00F2FE]/20 to-[#FFB703]/30 border-2 border-[#FFB703] flex items-center justify-center shadow-[0_0_50px_rgba(255,183,3,0.5)] animate-pulse-glow">
          <Trophy className="w-14 h-14 sm:w-16 sm:h-16 text-[#FFB703]" />
          <Crown className="w-8 h-8 text-[#00F2FE] absolute -top-4 -right-4" />
        </div>

        {/* Title */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#FFB703]/20 border border-[#FFB703]/40 text-[#FFB703] text-xs sm:text-sm font-heading tracking-widest uppercase mb-3">
          HASIL AKHIR PERTANDINGAN
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] via-white to-[#FFB703] uppercase drop-shadow-[0_0_20px_rgba(0,242,254,0.4)] mb-2">
          CLASH OF CHAMPIONS
        </h1>
        <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-widest text-[#00F2FE] uppercase mb-8">
          IPS ARENA : TOURNAMENT COMPLETED
        </h2>

        {/* Podium Champions */}
        {sorted.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
            {/* 1st Place Champion Highlight */}
            {sorted[0] && (
              <div className="sm:col-span-3 p-6 rounded-2xl bg-gradient-to-r from-[#8A5A00]/40 via-[#FFB703]/20 to-slate-900 border-2 border-[#FFB703] shadow-[0_0_35px_rgba(255,183,3,0.35)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFB703] text-slate-950 flex items-center justify-center font-heading font-black text-2xl shadow-[0_0_20px_#FFB703] shrink-0">
                    👑 #1
                  </div>
                  <div>
                    <div className="text-xs uppercase font-heading text-[#FFB703] tracking-widest">
                      GRAND CHAMPION
                    </div>
                    <div className="text-xl sm:text-2xl font-heading font-bold text-white">
                      {sorted[0].name}
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      {sorted[0].correctCount} Jawaban Benar • {sorted[0].accuracy}% Akurasi
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-heading font-black text-[#00F2FE] tabular-nums">
                    {sorted[0].score}
                  </div>
                  <div className="text-xs text-slate-400 font-heading uppercase tracking-wider">
                    TOTAL POIN
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="border border-slate-700/60 rounded-2xl overflow-hidden bg-slate-900/60 backdrop-blur-md mb-8">
          <div className="p-4 bg-slate-900/90 border-b border-slate-700/60 text-left flex items-center justify-between">
            <span className="font-heading text-sm font-bold tracking-wider uppercase text-white">
              KLASEMEN AKHIR PESERTA
            </span>
            <span className="text-xs text-[#00F2FE] font-rajdhani tracking-wide">
              {sorted.length} Peserta Bertanding
            </span>
          </div>

          <div className="overflow-x-auto max-h-[320px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase font-heading text-[#BFC7D5] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Peringkat</th>
                  <th className="py-3 px-4">Nama Peserta</th>
                  <th className="py-3 px-4 text-center">Total Skor</th>
                  <th className="py-3 px-4 text-center">Benar</th>
                  <th className="py-3 px-4 text-center">Salah</th>
                  <th className="py-3 px-4 text-right">Akurasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sorted.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      idx === 0 ? 'bg-[#FFB703]/10 font-bold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-heading font-bold">
                      {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx + 1}`}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{p.name}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#00F2FE] tabular-nums">
                      {p.score}
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-semibold tabular-nums">
                      {p.correctCount}
                    </td>
                    <td className="py-3 px-4 text-center text-rose-400 font-semibold tabular-nums">
                      {p.wrongCount}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 font-semibold tabular-nums">
                      {p.accuracy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons: Export & Play Again */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl border border-emerald-500/50 bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-300 font-heading font-bold uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>UNDUH HASIL (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-heading font-bold uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>CETAK LAPORAN</span>
          </button>

          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-heading font-extrabold uppercase tracking-wider text-sm bg-gradient-to-r from-[#00F2FE] via-[#00CFE8] to-[#FFB703] text-[#07101F] shadow-[0_0_30px_rgba(0,242,254,0.6)] hover:shadow-[0_0_45px_rgba(0,242,254,0.9)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>MAIN LAGI (SESI BARU)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

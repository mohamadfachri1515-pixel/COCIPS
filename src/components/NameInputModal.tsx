import React, { useState } from 'react';
import { Participant } from '../types';
import { User, Swords, AlertCircle, Sparkles, Check, Clock, UserCheck, Plus, X } from 'lucide-react';

interface NameInputModalProps {
  isOpen: boolean;
  onConfirm: (name: string) => void;
  onSelectParticipant?: (participantId: string) => void;
  participants?: Participant[];
  currentParticipantId?: string | null;
  onCancel?: () => void;
  canCancel?: boolean;
}

export const NameInputModal: React.FC<NameInputModalProps> = ({
  isOpen,
  onConfirm,
  onSelectParticipant,
  participants = [],
  currentParticipantId,
  onCancel,
  canCancel = false,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(participants.length === 0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Silakan masukkan nama peserta terlebih dahulu!');
      return;
    }
    if (trimmed.length < 2) {
      setError('Nama peserta minimal harus 2 karakter!');
      return;
    }
    setError(null);
    onConfirm(trimmed);
    setName('');
  };

  const handleSelectExisting = (pId: string) => {
    if (onSelectParticipant) {
      onSelectParticipant(pId);
    } else {
      const found = participants.find(p => p.id === pId);
      if (found) {
        onConfirm(found.name);
      }
    }
  };

  const now = Date.now();
  const formatCooldown = (lastTs?: number) => {
    if (!lastTs) return null;
    const elapsed = Math.floor((now - lastTs) / 1000);
    const left = Math.max(0, 480 - elapsed);
    if (left === 0) return null;
    const mins = Math.floor(left / 60);
    const secs = left % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto p-1 rounded-2xl bg-gradient-to-b from-[#00F2FE] via-[#FFB703] to-[#07101F] shadow-[0_0_40px_rgba(0,242,254,0.35)]">
        {/* Modal Interior */}
        <div className="relative w-full h-full bg-gradient-to-b from-[#0B1325] via-[#07101F] to-[#040812] rounded-[14px] p-5 sm:p-7 text-center overflow-hidden text-white">
          
          {/* Subtle Cyber Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#00F2FE_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

          {/* Close button if cancellable */}
          {canCancel && onCancel && (
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Icon Header */}
          <div className="relative mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-tr from-[#00F2FE]/20 to-[#FFB703]/20 border border-[#00F2FE]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.3)]">
            <Swords className="w-7 h-7 text-[#00F2FE]" />
            <div className="absolute -bottom-1 w-2.5 h-2.5 bg-[#FFB703] rotate-45 shadow-[0_0_8px_#FFB703]" />
          </div>

          <h3 className="font-heading text-lg sm:text-xl font-bold tracking-wider text-white mb-1 uppercase">
            GILIRAN PESERTA BERTANDING
          </h3>
          <p className="text-xs text-[#BFC7D5] mb-5 font-rajdhani tracking-wide">
            Pilih siswa yang sudah terdaftar atau ketikkan nama peserta baru
          </p>

          {/* Tab / Switcher between existing and new */}
          {participants.length > 0 && (
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl mb-4 border border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className={`w-1/2 py-2 px-3 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  !isAddingNew
                    ? 'bg-gradient-to-r from-[#00F2FE] to-[#00CFE8] text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Pilih Siswa ({participants.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className={`w-1/2 py-2 px-3 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isAddingNew
                    ? 'bg-gradient-to-r from-[#00F2FE] to-[#00CFE8] text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Daftar Baru</span>
              </button>
            </div>
          )}

          {/* SECTION 1: Pick Existing Registered Participant */}
          {!isAddingNew && participants.length > 0 && (
            <div className="mb-4 text-left space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Klik nama siswa untuk giliran menjawab:</span>
                <span className="text-[#00F2FE]">{participants.length} Terdaftar</span>
              </div>

              <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                {participants.map((p) => {
                  const isCurrent = p.id === currentParticipantId;
                  const cdTime = formatCooldown(p.lastAnswerTimestamp);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectExisting(p.id)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                        isCurrent
                          ? 'bg-[#00F2FE]/15 border-[#00F2FE] text-white shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCurrent ? 'bg-[#00F2FE] text-slate-950' : 'bg-slate-800 text-[#00F2FE]'
                        }`}>
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="font-heading font-bold text-xs sm:text-sm truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {p.answeredCount} Soal dijawab • {p.accuracy}% Akurasi
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {cdTime ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-mono">
                            <Clock className="w-2.5 h-2.5 text-amber-400" />
                            <span>{cdTime}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Siap</span>
                          </span>
                        )}
                        <span className="text-xs font-heading font-extrabold text-[#FFB703] tabular-nums">
                          {p.score} pt
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="text-xs text-[#00F2FE] hover:underline font-heading tracking-wide cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Daftarkan Siswa Baru Lainnya</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: Register New Participant Form */}
          {(isAddingNew || participants.length === 0) && (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label htmlFor="participant-name" className="block text-xs font-semibold uppercase tracking-wider text-[#00F2FE] mb-1.5">
                  Nama Lengkap Siswa / Peserta Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5 text-[#00F2FE]/70" />
                  </div>
                  <input
                    id="participant-name"
                    type="text"
                    autoFocus
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Contoh: Siti Rahmawati"
                    maxLength={40}
                    className="w-full pl-11 pr-4 py-3 bg-[#040812]/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-medium focus:outline-none focus:border-[#00F2FE] focus:ring-1 focus:ring-[#00F2FE] shadow-inner transition-colors text-sm"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-1.5 mt-2 text-rose-400 text-xs font-medium animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center gap-3">
                {participants.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="w-1/3 py-3 px-3 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 font-bold hover:bg-slate-700 transition-colors text-xs uppercase tracking-wider font-heading cursor-pointer"
                  >
                    Kembali
                  </button>
                )}
                <button
                  type="submit"
                  className={`group relative overflow-hidden py-3 px-6 rounded-xl font-heading font-extrabold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer ${
                    participants.length > 0 ? 'w-2/3' : 'w-full'
                  } bg-gradient-to-r from-[#00F2FE] via-[#00CFE8] to-[#FFB703] text-[#07101F] shadow-[0_0_20px_rgba(0,242,254,0.5)] hover:shadow-[0_0_30px_rgba(0,242,254,0.8)] hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 fill-current" />
                    SIMPAN & MASUK
                  </span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { GameSession, Question, DifficultyLevel } from '../types';
import {
  saveQuestions,
  resetQuestionsToDefault,
  resetSession,
  saveAdminCredentials,
  getAdminCredentials
} from '../services/storageService';
import {
  X,
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  KeyRound,
  Save,
  Bell,
  Download,
  Printer,
  Clock,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onUpdateQuestions: (newQuestions: Question[]) => void;
  session: GameSession;
  onUpdateSession?: (newSession: GameSession) => void;
  onResetSession: () => void;
  onTrigger8MinRanking: () => void;
  onForceGameOver: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  questions,
  onUpdateQuestions,
  session,
  onUpdateSession,
  onResetSession,
  onTrigger8MinRanking,
  onForceGameOver,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'stats' | 'session' | 'security'>('questions');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');

  // Question editing / creation state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [keywordsInput, setKeywordsInput] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Question>>({
    cardNumber: 1,
    level: 'Level 1',
    difficultyLabel: 'Mudah',
    points: 100,
    category: 'Perubahan Iklim',
    question: '',
    referenceAnswer: '',
    keywords: [],
    explanation: '',
  });

  // Admin security credentials form
  const creds = getAdminCredentials();
  const [newAdminUser, setNewAdminUser] = useState(creds.user);
  const [newAdminPass, setNewAdminPass] = useState(creds.pass);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter questions
  const filteredQuestions = selectedLevelFilter === 'ALL'
    ? questions
    : questions.filter(q => q.level === selectedLevelFilter);

  // Statistics calculation
  const totalParticipants = session.participants.length;
  let totalAnswered = 0;
  let totalCorrect = 0;
  let totalWrong = 0;

  session.participants.forEach(p => {
    totalAnswered += p.answeredCount;
    totalCorrect += p.correctCount;
    totalWrong += p.wrongCount;
  });

  const avgAccuracy = totalAnswered > 0
    ? Math.round((totalCorrect / totalAnswered) * 100)
    : 0;

  const topScorer = session.participants.length > 0
    ? [...session.participants].sort((a, b) => b.score - a.score)[0]
    : null;

  // Find most missed question
  const questionMissCounts: Record<number, number> = {};
  session.participants.forEach(p => {
    p.history.forEach(h => {
      if (!h.isCorrect) {
        questionMissCounts[h.cardNumber] = (questionMissCounts[h.cardNumber] || 0) + 1;
      }
    });
  });

  let mostMissedCardNumber: number | null = null;
  let maxMisses = 0;
  Object.entries(questionMissCounts).forEach(([cardNumStr, misses]) => {
    if (misses > maxMisses) {
      maxMisses = misses;
      mostMissedCardNumber = Number(cardNumStr);
    }
  });

  const handleOpenEdit = (q: Question) => {
    setIsCreatingNew(false);
    setEditingQuestion(q);
    setKeywordsInput((q.keywords || []).join(', '));
    setFormData({
      ...q,
    });
  };

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setEditingQuestion(null);
    setKeywordsInput('');
    const nextCardNum = questions.length + 1;
    setFormData({
      id: Date.now(),
      cardNumber: nextCardNum,
      level: 'Level 1',
      difficultyLabel: 'Mudah',
      points: 100,
      category: 'Perubahan Iklim',
      question: '',
      referenceAnswer: '',
      keywords: [],
      explanation: '',
    });
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question?.trim() || !formData.referenceAnswer?.trim()) {
      alert('Pertanyaan dan Kunci Uraian Acuan tidak boleh kosong!');
      return;
    }

    const difficultyLabel: 'Mudah' | 'Menengah' | 'Sulit' =
      formData.level === 'Level 1' ? 'Mudah' : formData.level === 'Level 2' ? 'Menengah' : 'Sulit';

    const parsedKeywords = keywordsInput
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (isCreatingNew) {
      const newQ: Question = {
        id: formData.id || Date.now(),
        cardNumber: Number(formData.cardNumber) || (questions.length + 1),
        level: (formData.level as DifficultyLevel) || 'Level 1',
        difficultyLabel,
        points: Number(formData.points) || 100,
        category: formData.category || 'Perubahan Iklim',
        question: formData.question || '',
        referenceAnswer: formData.referenceAnswer || '',
        keywords: parsedKeywords.length > 0 ? parsedKeywords : [formData.referenceAnswer.slice(0, 20)],
        explanation: formData.explanation || '',
      };
      const updated = [...questions, newQ];
      onUpdateQuestions(updated);
      saveQuestions(updated);
    } else if (editingQuestion) {
      const updated: Question[] = questions.map(q => {
        if (q.id === editingQuestion.id) {
          return {
            ...q,
            cardNumber: Number(formData.cardNumber) || q.cardNumber,
            level: (formData.level as DifficultyLevel) || q.level,
            difficultyLabel,
            points: Number(formData.points) || q.points,
            category: formData.category || q.category,
            question: formData.question || q.question,
            referenceAnswer: formData.referenceAnswer || q.referenceAnswer,
            keywords: parsedKeywords.length > 0 ? parsedKeywords : q.keywords,
            explanation: formData.explanation || q.explanation,
          };
        }
        return q;
      });
      onUpdateQuestions(updated);
      saveQuestions(updated);
    }

    setEditingQuestion(null);
    setIsCreatingNew(false);
  };

  const handleDeleteQuestion = (id: number) => {
    if (confirm('Yakin ingin menghapus soal ini dari Bank Soal?')) {
      const updated = questions.filter(q => q.id !== id);
      onUpdateQuestions(updated);
      saveQuestions(updated);
    }
  };

  const handleResetQuestionsBank = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh 30 soal ke data default?')) {
      const defs = resetQuestionsToDefault();
      onUpdateQuestions(defs);
      alert('Bank soal berhasil di-reset ke 30 soal bawaan.');
    }
  };

  const handleResetSessionConfirm = () => {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh data sesi permainan saat ini? (Skor, peserta, dan status kartu akan di-reset)')) {
      onResetSession();
      alert('Sesi permainan telah berhasil di-reset!');
    }
  };

  // Export Leaderboard / Scores to CSV
  const handleExportLeaderboardCSV = () => {
    const rows: (string | number)[][] = [
      ['Peringkat', 'Nama Siswa', 'Total Skor', 'Soal Terjawab', 'Jumlah Benar', 'Jumlah Salah', 'Akurasi (%)']
    ];
    const sorted = [...session.participants].sort((a, b) => b.score - a.score);
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
    link.download = `Rekap_Nilai_IPS_Arena_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Essay Answers to CSV
  const handleExportEssayAnswersCSV = () => {
    const rows: (string | number)[][] = [
      ['Nama Siswa', 'Nomor Kartu', 'Tingkat Soal', 'Poin Maksimal', 'Pertanyaan Soal', 'Jawaban Siswa', 'Status', 'Poin Diperoleh', 'Validasi Guru']
    ];

    session.participants.forEach(p => {
      p.history.forEach(h => {
        const q = questions.find(item => item.cardNumber === h.cardNumber);
        rows.push([
          p.name,
          `#${String(h.cardNumber).padStart(2, '0')}`,
          q ? q.level : '-',
          q ? q.points : '-',
          q ? q.question : '-',
          h.studentAnswer,
          h.isCorrect ? 'Benar' : 'Salah',
          h.pointsEarned,
          h.teacherOverridden ? 'Ya (Koreksi Guru)' : 'Otomatis'
        ]);
      });
    });

    const csvContent = '\uFEFF' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Log_Jawaban_Essay_Siswa_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset Cooldown for all participants
  const handleResetAllCooldowns = () => {
    if (!onUpdateSession) return;
    const updated = {
      ...session,
      participants: session.participants.map(p => ({
        ...p,
        lastAnswerTimestamp: undefined
      }))
    };
    onUpdateSession(updated);
    alert('Cooldown seluruh siswa telah di-reset! Semua siswa dapat langsung menjawab kembali.');
  };

  // Toggle Cooldown Enforcement
  const handleToggleCooldownEnforced = () => {
    if (!onUpdateSession) return;
    const nextVal = !(session.cooldownEnforced ?? true);
    const updated = {
      ...session,
      cooldownEnforced: nextVal
    };
    onUpdateSession(updated);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUser.trim() || !newAdminPass.trim()) {
      alert('Username dan password admin tidak boleh kosong!');
      return;
    }
    saveAdminCredentials(newAdminUser.trim(), newAdminPass.trim());
    setSaveSuccessMsg('Kredensial admin berhasil diperbarui!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto rounded-2xl p-1 bg-gradient-to-b from-[#FFB703] via-slate-700 to-[#07101F] shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200">
        <div className="relative w-full h-full bg-[#0B1325] rounded-[14px] p-5 sm:p-7 text-white flex flex-col max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#FFB703]/20 border border-[#FFB703]/40 text-[#FFB703]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg sm:text-xl font-bold tracking-wider text-white uppercase">
                  PANEL KONTROL GURU / ADMIN
                </h2>
                <p className="text-xs text-slate-400 font-rajdhani">
                  Manajemen Soal IPS, Statistik Permainan, & Kontrol Sesi
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl mb-4 shrink-0 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('questions'); setEditingQuestion(null); setIsCreatingNew(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'questions'
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#00CFE8] text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Bank Soal ({questions.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('stats'); setEditingQuestion(null); setIsCreatingNew(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#00CFE8] text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistik Peserta</span>
            </button>

            <button
              onClick={() => { setActiveTab('session'); setEditingQuestion(null); setIsCreatingNew(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'session'
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#00CFE8] text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kontrol Sesi</span>
            </button>

            <button
              onClick={() => { setActiveTab('security'); setEditingQuestion(null); setIsCreatingNew(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#00CFE8] text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Keamanan Admin</span>
            </button>
          </div>

          {/* TAB 1: BANK SOAL */}
          {activeTab === 'questions' && (
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* Question Form Editor (Create / Edit) */}
              {(isCreatingNew || editingQuestion) ? (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-[#00F2FE]/40 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="font-heading text-sm font-bold text-[#00F2FE] uppercase">
                      {isCreatingNew ? '+ Tambah Soal Baru' : `Edit Soal Kartu #${formData.cardNumber}`}
                    </h4>
                    <button
                      type="button"
                      onClick={() => { setEditingQuestion(null); setIsCreatingNew(false); }}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                    >
                      Batal
                    </button>
                  </div>

                  <form onSubmit={handleSaveQuestion} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Nomor Kartu</label>
                        <input
                          type="number"
                          value={formData.cardNumber || 1}
                          onChange={(e) => setFormData({ ...formData, cardNumber: Number(e.target.value) })}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Tingkat Level</label>
                        <select
                          value={formData.level || 'Level 1'}
                          onChange={(e) => {
                            const lvl = e.target.value as DifficultyLevel;
                            const pts = lvl === 'Level 1' ? 100 : lvl === 'Level 2' ? 200 : 300;
                            setFormData({ ...formData, level: lvl, points: pts });
                          }}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                        >
                          <option value="Level 1">Level 1 (Mudah)</option>
                          <option value="Level 2">Level 2 (Menengah)</option>
                          <option value="Level 3">Level 3 (Sulit)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Poin</label>
                        <input
                          type="number"
                          value={formData.points || 100}
                          onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Kategori / Topik</label>
                        <input
                          type="text"
                          value={formData.category || ''}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                          placeholder="Perubahan Iklim"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Pertanyaan Essay / Uraian</label>
                      <textarea
                        rows={3}
                        value={formData.question || ''}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                        placeholder="Ketikkan teks pertanyaan essay di sini..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-emerald-400 font-semibold mb-1">
                        Kunci Jawaban Uraian Model / Acuan:
                      </label>
                      <textarea
                        rows={3}
                        value={formData.referenceAnswer || ''}
                        onChange={(e) => setFormData({ ...formData, referenceAnswer: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-emerald-500 rounded text-emerald-200"
                        placeholder="Kunci model jawaban uraian yang benar dan lengkap..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[#00F2FE] font-semibold mb-1">
                        Kata Kunci Penilaian Otomatis (Pisahkan dengan koma):
                      </label>
                      <input
                        type="text"
                        value={keywordsInput}
                        onChange={(e) => setKeywordsInput(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-[#00F2FE]/50 rounded text-white"
                        placeholder="Contoh: pemanasan global, kenaikan suhu, gas rumah kaca, radiasi"
                        required
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Jika jawaban siswa mengandung minimal salah satu kata kunci di atas, sistem akan menganggap benar secara otomatis (guru tetap dapat melakukan override).
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Penjelasan / Ulasan Materi IPS</label>
                      <textarea
                        rows={2}
                        value={formData.explanation || ''}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                        placeholder="Penjelasan edukatif materi IPS setelah peserta menjawab..."
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setEditingQuestion(null); setIsCreatingNew(false); }}
                        className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>SIMPAN SOAL</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Question List controls */
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Filter Level:</span>
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg text-xs">
                      {['ALL', 'Level 1', 'Level 2', 'Level 3'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setSelectedLevelFilter(lvl)}
                          className={`px-2.5 py-1 rounded transition-colors ${
                            selectedLevelFilter === lvl
                              ? 'bg-slate-700 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetQuestionsBank}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reset Bank Soal Default</span>
                    </button>
                    <button
                      onClick={handleOpenCreate}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#00F2FE] to-[#00CFE8] text-slate-950 text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-90 cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Soal</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Table of Questions */}
              <div className="border border-slate-700/60 rounded-xl overflow-hidden bg-slate-900/60">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-heading border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Kartu</th>
                        <th className="py-2.5 px-3">Level / Poin</th>
                        <th className="py-2.5 px-3">Pertanyaan Uraian</th>
                        <th className="py-2.5 px-3">Kunci Uraian Acuan</th>
                        <th className="py-2.5 px-3">Kata Kunci Penilaian</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredQuestions.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-heading font-bold text-[#00F2FE]">
                            #{String(q.cardNumber).padStart(2, '0')}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-semibold text-white">{q.level}</span>
                            <span className="text-slate-500"> • </span>
                            <span className="text-[#FFB703] font-bold">{q.points} pt</span>
                          </td>
                          <td className="py-2.5 px-3 max-w-[220px] truncate text-slate-200">
                            {q.question}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-400 max-w-[200px] truncate font-medium">
                            {q.referenceAnswer}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 max-w-[150px] truncate">
                            {(q.keywords || []).join(', ')}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEdit(q)}
                              className="p-1 text-slate-400 hover:text-[#00F2FE] mr-1.5 cursor-pointer"
                              title="Edit Soal"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                              title="Hapus Soal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STATISTIK & ANALISIS */}
          {activeTab === 'stats' && (
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Total Peserta</div>
                  <div className="text-2xl font-heading font-bold text-[#00F2FE] mt-1 tabular-nums">
                    {totalParticipants}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Soal Terjawab</div>
                  <div className="text-2xl font-heading font-bold text-white mt-1 tabular-nums">
                    {totalAnswered} / 30
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Jawaban Benar</div>
                  <div className="text-2xl font-heading font-bold text-emerald-400 mt-1 tabular-nums">
                    {totalCorrect}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Rata-Rata Akurasi</div>
                  <div className="text-2xl font-heading font-bold text-[#FFB703] mt-1 tabular-nums">
                    {avgAccuracy}%
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs font-heading font-bold text-[#FFB703] uppercase mb-2">
                    🏆 Peserta Skor Tertinggi
                  </div>
                  {topScorer ? (
                    <div>
                      <div className="text-lg font-bold text-white">{topScorer.name}</div>
                      <div className="text-xs text-slate-300 mt-1">
                        Total Skor: <strong className="text-[#00F2FE]">{topScorer.score} POIN</strong>
                      </div>
                      <div className="text-xs text-slate-400">
                        {topScorer.correctCount} Benar • {topScorer.accuracy}% Akurasi
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">Belum ada data peserta.</div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs font-heading font-bold text-rose-400 uppercase mb-2">
                    ⚠️ Soal Paling Sering Salah
                  </div>
                  {mostMissedCardNumber ? (
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Kartu #{String(mostMissedCardNumber).padStart(2, '0')}
                      </div>
                      <div className="text-xs text-rose-300 mt-1">
                        Salah dijawab sebanyak {maxMisses} kali oleh peserta
                      </div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {questions.find(q => q.cardNumber === mostMissedCardNumber)?.question}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">Belum ada riwayat jawaban salah.</div>
                  )}
                </div>
              </div>

              {/* Log Jawaban Essay Seluruh Peserta */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="text-xs font-heading font-bold text-[#00F2FE] uppercase tracking-wider">
                      📝 Log Jawaban Essay Lengkap Seluruh Siswa
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Tersimpan rapi di histori sesi turnamen
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportEssayAnswersCSV}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600/40 text-emerald-300 text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh CSV Log Essay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak / Print</span>
                    </button>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-[300px]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-heading border-b border-slate-800 sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Nama Siswa</th>
                          <th className="py-2.5 px-3">Kartu</th>
                          <th className="py-2.5 px-3">Jawaban Essay Yang Ditulis Siswa</th>
                          <th className="py-2.5 px-3 text-center">Panjang Kata</th>
                          <th className="py-2.5 px-3 text-center">Hasil</th>
                          <th className="py-2.5 px-3 text-right">Poin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {session.participants.flatMap(p =>
                          p.history.map((h, i) => ({
                            participantName: p.name,
                            ...h,
                            key: `${p.id}_${h.cardNumber}_${i}`
                          }))
                        ).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-500 italic">
                              Belum ada jawaban essay yang dikirimkan oleh siswa pada sesi ini.
                            </td>
                          </tr>
                        ) : (
                          session.participants.flatMap(p =>
                            p.history.map((h, i) => ({
                              participantName: p.name,
                              ...h,
                              key: `${p.id}_${h.cardNumber}_${i}`
                            }))
                          ).map((item) => (
                            <tr key={item.key} className="hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                                {item.participantName}
                              </td>
                              <td className="py-2.5 px-3 font-heading font-bold text-[#00F2FE] whitespace-nowrap">
                                Kartu #{String(item.cardNumber).padStart(2, '0')}
                              </td>
                              <td className="py-2.5 px-3 text-slate-200 min-w-[260px] max-w-[420px] whitespace-pre-wrap leading-relaxed text-[11px] italic">
                                "{item.studentAnswer}"
                              </td>
                              <td className="py-2.5 px-3 text-center text-slate-400 tabular-nums whitespace-nowrap">
                                {item.wordCount || item.studentAnswer.split(/\s+/).filter(Boolean).length} kata
                              </td>
                              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    item.isCorrect
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  }`}
                                >
                                  {item.isCorrect ? 'Benar' : 'Salah'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-[#FFB703] tabular-nums whitespace-nowrap">
                                +{item.pointsEarned} pt
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KONTROL SESI */}
          {activeTab === 'session' && (
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div>
                  <h4 className="font-heading text-sm font-bold text-white uppercase mb-1">
                    Kontrol Permainan Langsung
                  </h4>
                  <p className="text-xs text-slate-400">
                    Gunakan kontrol ini saat mengelola alur perlombaan di depan kelas.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {/* Trigger 8 min overlay */}
                  <button
                    onClick={() => {
                      onTrigger8MinRanking();
                      onClose();
                    }}
                    className="p-3.5 rounded-xl border border-[#00F2FE]/40 bg-[#00F2FE]/10 hover:bg-[#00F2FE]/20 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#00F2FE] uppercase mb-1">
                      <Bell className="w-4 h-4" />
                      <span>Uji Overlay 8 Menit</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Tampilkan notifikasi ranking 8 menit sekarang untuk demonstrasi.
                    </div>
                  </button>

                  {/* Force Game Over */}
                  <button
                    onClick={() => {
                      if (confirm('Selesaikan turnamen sekarang dan tampilkan layar Game Over?')) {
                        onForceGameOver();
                        onClose();
                      }
                    }}
                    className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xs font-heading font-bold text-amber-400 uppercase mb-1">
                      <Play className="w-4 h-4" />
                      <span>Selesaikan Turnamen</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Langsung buka layar Game Over dan Podium Juara akhir.
                    </div>
                  </button>

                  {/* Reset Game Session */}
                  <button
                    onClick={handleResetSessionConfirm}
                    className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xs font-heading font-bold text-rose-400 uppercase mb-1">
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Sesi Permainan</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Hapus peserta, reset skor, dan buka kembali 30 kartu soal.
                    </div>
                  </button>
                </div>
              </div>

              {/* Cooldown Settings & Reset Card */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-heading text-sm font-bold text-amber-400 uppercase flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Pengaturan Aturan Cooldown 8 Menit</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Kendali fleksibel untuk guru saat kelas latihan cepat atau turnamen resmi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleCooldownEnforced}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                      session.cooldownEnforced !== false
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {session.cooldownEnforced !== false ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-amber-400" />
                        <span>Aturan 8 Menit : AKTIF</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-500" />
                        <span>Aturan 8 Menit : NONAKTIF (Bebas)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-300">
                    Siswa terhambat giliran karena cooldown? Anda dapat langsung mereset seluruh cooldown siswa:
                  </span>
                  <button
                    type="button"
                    onClick={handleResetAllCooldowns}
                    className="py-2 px-4 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Reset Cooldown Seluruh Siswa Sekarang
                  </button>
                </div>
              </div>

              {/* Export & Report Card */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div>
                  <h4 className="font-heading text-sm font-bold text-[#00F2FE] uppercase flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-[#00F2FE]" />
                    <span>Ekspor & Cetak Laporan Turnamen</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Unduh data perolehan skor dan jawaban essay siswa untuk penilaian harian / formatif kelas.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleExportLeaderboardCSV}
                    className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-left transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-heading font-bold text-emerald-400 uppercase">
                        Unduh Rekap Nilai (CSV)
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Tabel skor, akurasi, dan peringkat
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportEssayAnswersCSV}
                    className="p-3 rounded-xl border border-[#00F2FE]/40 bg-cyan-950/20 hover:bg-cyan-950/40 text-left transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-heading font-bold text-[#00F2FE] uppercase">
                        Unduh Log Essay (CSV)
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Teks essay lengkap seluruh siswa
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-[#00F2FE] shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-left transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-heading font-bold text-slate-200 uppercase">
                        Cetak Laporan / PDF
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Print atau simpan sebagai PDF
                      </div>
                    </div>
                    <Printer className="w-4 h-4 text-slate-300 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KEAMANAN ADMIN */}
          {activeTab === 'security' && (
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              <form onSubmit={handleSaveSecurity} className="max-w-md p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
                <h4 className="font-heading text-sm font-bold text-white uppercase">
                  Ubah Kredensial Login Admin
                </h4>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Username Admin Baru</label>
                  <input
                    type="text"
                    value={newAdminUser}
                    onChange={(e) => setNewAdminUser(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password Admin Baru</label>
                  <input
                    type="text"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-white"
                    required
                  />
                </div>

                {saveSuccessMsg && (
                  <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-[#FFB703] to-[#8A5A00] text-slate-950 font-heading font-bold uppercase tracking-wider cursor-pointer"
                >
                  SIMPAN PERUBAHAN
                </button>
              </form>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span>Clash of Champions : IPS Arena Panel Guru</span>
            <button
              onClick={onClose}
              className="py-1.5 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Tutup Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

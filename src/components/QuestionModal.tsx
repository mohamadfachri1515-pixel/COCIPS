import React, { useState, useRef, useEffect } from 'react';
import { Question } from '../types';
import { audioManager } from '../services/audioManager';
import { verifyAnswerSemantics } from '../services/semanticEvaluator';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  XCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Send,
  Edit3,
  ShieldAlert,
  FileText,
  Quote,
  Check,
  RotateCcw,
  Cpu,
  BrainCircuit,
  HelpCircle,
  X
} from 'lucide-react';

interface QuestionModalProps {
  question: Question;
  participantName: string;
  onComplete: (
    isCorrect: boolean,
    pointsEarned: number,
    studentAnswer: string,
    teacherOverridden?: boolean
  ) => void;
  onClose: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  participantName,
  onComplete,
  onClose,
}) => {
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [teacherOverridden, setTeacherOverridden] = useState<boolean>(false);
  const [semanticFeedback, setSemanticFeedback] = useState<string>('');
  const [evaluationSource, setEvaluationSource] = useState<'ai-semantic' | 'local-semantic' | 'teacher-override'>('local-semantic');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (!isSubmitted && !isEvaluating && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isSubmitted, isEvaluating]);

  // Global Escape key listener to exit safely
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEvaluating) {
        if (!isSubmitted) {
          onClose();
        } else {
          handleContinue();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isEvaluating, isSubmitted, isCorrect, studentAnswer, teacherOverridden]);

  // Calculate live word count & character count
  const trimmed = studentAnswer.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const charCount = studentAnswer.length;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isEvaluating) return;

    if (!trimmed) {
      setErrorMessage('Silakan ketikkan jawaban uraian / essay Anda sebelum mengirim!');
      return;
    }
    if (trimmed.length < 3) {
      setErrorMessage('Jawaban terlalu singkat. Jelaskan uraian konsep dengan lebih lengkap!');
      return;
    }

    setErrorMessage(null);
    setIsEvaluating(true);

    try {
      // Verifikasi keselarasan makna (Semantic Analysis)
      // "Yang penting jawabannya maknanya sama itu sudah dianggap benar, tanpa harus kata dan kalimatnya sama persis"
      const result = await verifyAnswerSemantics(trimmed, question);

      setIsCorrect(result.isCorrect);
      setSemanticFeedback(result.semanticFeedback);
      setEvaluationSource(result.source);
      setIsSubmitted(true);

      if (result.isCorrect) {
        audioManager.playCorrectSFX();
        try {
          confetti({
            particleCount: 85,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#00F2FE', '#FFB703', '#FFFFFF', '#00CFE8']
          });
        } catch (err) {}
      } else {
        audioManager.playWrongSFX();
      }
    } catch (err) {
      console.error('Error saat verifikasi jawaban:', err);
      // Fallback ramah jika terjadi kendala tak terduga
      setIsCorrect(false);
      setSemanticFeedback('Verifikasi makna selesai. Guru dapat memvalidasi langsung di bawah.');
      setIsSubmitted(true);
      audioManager.playWrongSFX();
    } finally {
      setIsEvaluating(false);
    }
  };

  // Keyboard shortcut: Ctrl + Enter or Cmd + Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Allows teacher/evaluator to override result if needed
  const handleTeacherOverride = (newStatus: boolean) => {
    setIsCorrect(newStatus);
    setTeacherOverridden(true);
    setEvaluationSource('teacher-override');

    if (newStatus) {
      audioManager.playCorrectSFX();
      try {
        confetti({
          particleCount: 65,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#00F2FE', '#FFB703', '#FFFFFF']
        });
      } catch (err) {}
    } else {
      audioManager.playWrongSFX();
    }
  };

  const handleContinue = () => {
    const points = isCorrect ? question.points : 0;
    onComplete(isCorrect, points, studentAnswer.trim(), teacherOverridden);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto rounded-2xl p-1 bg-gradient-to-b from-[#00F2FE] via-[#111e38] to-[#FFB703] shadow-[0_0_50px_rgba(0,242,254,0.35)] animate-in zoom-in-95 duration-200">
        
        {/* Modal Inner Container */}
        <div className="relative w-full h-full bg-gradient-to-b from-[#0B1325] via-[#07101F] to-[#040812] rounded-[14px] p-5 sm:p-8 overflow-hidden text-white flex flex-col justify-between">
          
          {/* Subtle Cyber Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#00F2FE_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          {/* Top Header Section */}
          <div className="relative z-10 border-b border-slate-700/60 pb-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-heading text-xs sm:text-sm tracking-widest text-[#00F2FE] font-bold">
                  KARTU #{String(question.cardNumber).padStart(2, '0')}
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-xs uppercase font-semibold text-slate-300">
                  {question.level} ({question.difficultyLabel})
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-xs font-bold text-[#FFB703] tabular-nums">
                  {question.points} POIN
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00F2FE]/15 text-[#00F2FE] font-bold uppercase tracking-wider flex items-center gap-1">
                  <BrainCircuit className="w-3 h-3 text-[#00F2FE]" />
                  <span>VERIFIKASI SEMANTIK</span>
                </span>
              </div>

              {/* Active Player Tag & Close Button */}
              <div className="flex items-center gap-2">
                <div className="text-xs px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-200 flex items-center gap-1.5 font-medium">
                  <span className="text-slate-400">Peserta:</span>
                  <span className="font-bold text-[#00F2FE] truncate max-w-[140px]">{participantName}</span>
                </div>

                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={onClose}
                  className="p-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Kembali ke Arena"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-[#BFC7D5] font-subheading tracking-wide uppercase">
              Topik Materi IPS: {question.category}
            </div>
          </div>

          {/* Question Prompt */}
          <div className="relative z-10 mb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#FFB703] mb-1.5 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              <span>PERTANYAAN URAIAN / ESSAY:</span>
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-semibold leading-relaxed text-white bg-slate-900/70 p-4 rounded-xl border border-slate-700/80 shadow-inner">
              {question.question}
            </h2>
          </div>

          {/* Evaluating Scanning State */}
          {isEvaluating && (
            <div className="relative z-10 my-6 p-6 rounded-xl bg-slate-900/90 border border-[#00F2FE]/50 shadow-[0_0_30px_rgba(0,242,254,0.2)] text-center space-y-4 animate-pulse">
              <div className="flex items-center justify-center gap-3 text-[#00F2FE]">
                <Cpu className="w-7 h-7 animate-spin" />
                <span className="font-heading text-base sm:text-lg font-bold uppercase tracking-wider">
                  MEMERIKSA KESESUAIAN MAKNA JAWABAN...
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Sistem sedang memverifikasi esensi konsep dan makna pemahaman Anda. Kata atau kalimat tidak harus sama persis dengan kunci, asalkan memiliki makna yang tepat.
              </p>
              {/* Cyber Progress Indicator */}
              <div className="w-full max-w-md mx-auto h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                <div className="h-full bg-gradient-to-r from-[#00F2FE] via-[#00CFE8] to-[#FFB703] animate-[pulse_1s_infinite] w-full" />
              </div>
            </div>
          )}

          {/* Essay Answer Input Form (Shown before submission) */}
          {!isSubmitted && !isEvaluating && (
            <div className="relative z-10 mb-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="student-essay-textarea"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#00F2FE]" />
                  <span>Ketik Uraian Jawaban Anda:</span>
                </label>
                <div className="text-[11px] font-mono text-slate-400">
                  <span className={wordCount > 0 ? 'text-[#00F2FE] font-bold' : ''}>
                    {wordCount} kata
                  </span>
                  <span className="mx-1">•</span>
                  <span>{charCount} karakter</span>
                </div>
              </div>

              {/* Spacious Textarea with Custom Scroll & Cyber Focus */}
              <div className="relative">
                <textarea
                  id="student-essay-textarea"
                  ref={textareaRef}
                  rows={6}
                  value={studentAnswer}
                  onChange={(e) => {
                    setStudentAnswer(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketikkan uraian pemahaman Anda dengan bahasa sendiri di sini... (Kata dan kalimat tidak harus persis, yang penting maknanya sama)"
                  className="w-full min-h-[160px] sm:min-h-[180px] p-4 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 font-medium focus:outline-none focus:border-[#00F2FE] focus:ring-2 focus:ring-[#00F2FE]/40 transition-all leading-relaxed shadow-inner resize-y text-sm sm:text-base"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
                <span className="italic text-[11px] text-[#00CFE8] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FFB703]" />
                  <span>Penilaian berbasis makna: Gunakan bahasa atau penjelasan sendiri asalkan konsepnya sesuai.</span>
                </span>
                <span className="text-[11px] text-slate-400 font-rajdhani hidden sm:inline">
                  Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Enter</kbd> untuk kirim
                </span>
              </div>
            </div>
          )}

          {/* Result and Verification View (Shown after submission) */}
          {isSubmitted && !isEvaluating && (
            <div className="relative z-10 mb-5 space-y-3.5 animate-in fade-in duration-300">
              
              {/* Full Submitted Student Essay */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-700 text-xs sm:text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-[11px] uppercase font-bold flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-[#00F2FE]" />
                    <span>Uraian Jawaban Yang Dikirim Peserta:</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {wordCount} kata ({charCount} karakter)
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 whitespace-pre-wrap leading-relaxed max-h-[130px] overflow-y-auto">
                  {studentAnswer}
                </div>
              </div>

              {/* Status Banner with Semantic Feedback & Teacher Override */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'bg-rose-950/40 border-rose-500/60 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-7 h-7 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-heading font-black text-base sm:text-lg uppercase tracking-wide flex flex-wrap items-center gap-2">
                      <span>{isCorrect ? `JAWABAN BENAR! (+${question.points} POIN)` : 'JAWABAN BELUM SESUAI (0 POIN)'}</span>
                      
                      {/* Badge source */}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 font-mono border border-cyan-500/30">
                        {evaluationSource === 'ai-semantic'
                          ? '🤖 AI Semantic Check'
                          : evaluationSource === 'teacher-override'
                          ? '👑 Validasi Guru'
                          : '⚡ Verifikasi Makna'}
                      </span>

                      {teacherOverridden && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold border border-amber-500/50">
                          Koreksi Guru Aktif
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-medium mt-1 leading-relaxed opacity-95">
                      <strong>Analisis Makna:</strong> {semanticFeedback}
                    </div>
                  </div>
                </div>

                {/* Teacher Override Action Controls */}
                <div className="flex items-center gap-1.5 shrink-0 bg-slate-900/95 p-1.5 rounded-lg border border-slate-700 self-end sm:self-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-1">
                    Koreksi Guru:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTeacherOverride(true)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isCorrect
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                    }`}
                    title="Tandai sebagai Benar"
                  >
                    <Check className="w-3 h-3" />
                    <span>Benar (+{question.points})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTeacherOverride(false)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      !isCorrect
                        ? 'bg-rose-500 text-white shadow'
                        : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                    }`}
                    title="Tandai sebagai Salah"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Salah (0)</span>
                  </button>
                </div>
              </div>

              {/* Reference Answer and IPS Explanation */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2.5 text-xs sm:text-sm">
                <div>
                  <span className="text-[#FFB703] font-bold uppercase tracking-wider block text-xs mb-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#FFB703]" />
                    <span>Kunci Uraian Model / Jawaban Acuan:</span>
                  </span>
                  <p className="text-slate-100 font-medium leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    {question.referenceAnswer}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-start gap-2 text-slate-300">
                  <Sparkles className="w-4 h-4 text-[#00F2FE] shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Ulasan Pembahasan IPS:</strong> {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
            {!isSubmitted ? (
              <>
                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={onClose}
                  className="py-2.5 px-5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  KEMBALI KE ARENA
                </button>

                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={() => handleSubmit()}
                  className={`py-3 px-8 rounded-xl font-heading font-extrabold uppercase tracking-wider text-sm transition-all duration-200 flex items-center gap-2 ${
                    isEvaluating
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#00F2FE] to-[#00CFE8] text-[#07101F] shadow-[0_0_20px_rgba(0,242,254,0.6)] hover:scale-[1.02] cursor-pointer'
                  }`}
                >
                  {isEvaluating ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin" />
                      <span>MEMERIKSA MAKNA...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 stroke-[2.5]" />
                      <span>KIRIM JAWABAN ESSAY</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleContinue}
                className="py-3 px-8 rounded-xl font-heading font-extrabold uppercase tracking-wider text-sm bg-gradient-to-r from-[#00F2FE] via-[#FFB703] to-[#FFB703] text-[#07101F] shadow-[0_0_25px_rgba(255,183,3,0.6)] hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>SELESAI & KEMBALI KE ARENA</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

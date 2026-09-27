import React, { useState, useEffect, useRef } from 'react';
import {
  GameSession,
  Participant,
  Question,
  AnswerHistoryItem
} from './types';
import {
  getQuestions,
  saveQuestions,
  getSession,
  saveSession,
  resetSession as resetGameSession,
  createInitialSession
} from './services/storageService';
import { audioManager } from './services/audioManager';
import { LandingScreen } from './components/LandingScreen';
import { QuestionCard } from './components/QuestionCard';
import { QuestionModal } from './components/QuestionModal';
import { NameInputModal } from './components/NameInputModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { RankingOverlay } from './components/RankingOverlay';
import { GameOverScreen } from './components/GameOverScreen';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { MusicToggle } from './components/MusicToggle';
import {
  Trophy,
  User,
  Users,
  Timer,
  Shield,
  RotateCcw,
  Sparkles,
  Lock,
  ChevronRight,
  Flame,
  Layers,
  ArrowRightLeft,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';

const COOLDOWN_SECONDS = 480; // 8 menit (480 detik)

export default function App() {
  const [questions, setQuestions] = useState<Question[]>(() => getQuestions());
  const [session, setSession] = useState<GameSession>(() => getSession());
  const [currentScreen, setCurrentScreen] = useState<'LANDING' | 'ARENA' | 'GAME_OVER'>('LANDING');

  // Modals
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [is8MinRankingOpen, setIs8MinRankingOpen] = useState<boolean>(false);
  const [cooldownAlertMsg, setCooldownAlertMsg] = useState<string | null>(null);

  // Real-time ticking clock for 8-min interval & participant cooldowns
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [secondsUntilNextRanking, setSecondsUntilNextRanking] = useState<number>(480);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // 8-minute periodic ranking interval
      const elapsedSeconds = Math.floor((now - session.timerStartedAt) / 1000);
      const interval = 480; // 8 minutes
      const remainder = elapsedSeconds % interval;
      const timeLeft = interval - remainder;

      setSecondsUntilNextRanking(timeLeft);

      if (elapsedSeconds > 0 && remainder === 0 && !session.isGameOver) {
        setIs8MinRankingOpen(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session.timerStartedAt, session.isGameOver]);

  // Sync session to localStorage
  useEffect(() => {
    saveSession(session);
  }, [session]);

  // Current active participant
  const currentParticipant = session.participants.find(
    (p) => p.id === session.currentParticipantId
  ) || null;

  // Calculate current participant's cooldown in seconds (rule: 1 answer per 8 minutes)
  const isCooldownEnforced = session.cooldownEnforced !== false;
  const getParticipantRemainingCooldown = (p: Participant | null): number => {
    if (!p || !p.lastAnswerTimestamp) return 0;
    const elapsed = Math.floor((currentTime - p.lastAnswerTimestamp) / 1000);
    return Math.max(0, COOLDOWN_SECONDS - elapsed);
  };

  const currentCooldown = isCooldownEnforced ? getParticipantRemainingCooldown(currentParticipant) : 0;
  const isCurrentInCooldown = isCooldownEnforced && currentCooldown > 0;

  // Reset active student's cooldown (teacher action)
  const handleResetActiveCooldown = () => {
    if (!currentParticipant) return;
    setSession((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.id === currentParticipant.id ? { ...p, lastAnswerTimestamp: undefined } : p
      ),
    }));
    setCooldownAlertMsg(null);
  };

  // Format mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Handler: Enter Arena
  const handleEnterArena = () => {
    setCurrentScreen('ARENA');
    if (!session.currentParticipantId) {
      setIsNameModalOpen(true);
    }
  };

  // Handler: Confirm Participant Name
  const handleConfirmName = (name: string) => {
    const existing = session.participants.find(
      (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
    );

    let participantId: string;
    let updatedParticipants = [...session.participants];

    if (existing) {
      participantId = existing.id;
    } else {
      participantId = 'p_' + Date.now();
      const newParticipant: Participant = {
        id: participantId,
        name: name.trim(),
        score: 0,
        answeredCount: 0,
        correctCount: 0,
        wrongCount: 0,
        accuracy: 0,
        lastActive: Date.now(),
        history: [],
      };
      updatedParticipants.push(newParticipant);
    }

    setSession((prev) => ({
      ...prev,
      participants: updatedParticipants,
      currentParticipantId: participantId,
    }));

    setIsNameModalOpen(false);
  };

  // Handler: Card Click
  const handleCardClick = (question: Question) => {
    if (!session.currentParticipantId) {
      setIsNameModalOpen(true);
      return;
    }

    // Check 8-minute cooldown rule
    if (isCurrentInCooldown) {
      setCooldownAlertMsg(
        `Peserta "${currentParticipant?.name}" sudah menjawab 1 soal pada rentang waktu 8 menit ini. Sisa waktu cooldown: ${formatTime(
          currentCooldown
        )}. Silakan ganti ke peserta lain agar siswa lain dapat giliran menjawab!`
      );
      return;
    }

    // Check if THIS participant already answered this specific card
    const alreadyAnsweredByThisParticipant = currentParticipant?.history.some(
      (h) => h.cardNumber === question.cardNumber
    );

    if (alreadyAnsweredByThisParticipant) {
      setCooldownAlertMsg(
        `Peserta "${currentParticipant?.name}" sudah pernah menjawab Kartu #${String(
          question.cardNumber
        ).padStart(2, '0')} sebelumnya. Silakan pilih kartu essay lain yang belum dikerjakan!`
      );
      return;
    }

    // Open question essay modal!
    setActiveQuestion(question);
  };

  // Handler: Submit essay answer completed
  const handleQuestionComplete = (
    isCorrect: boolean,
    pointsEarned: number,
    studentAnswer: string,
    teacherOverridden?: boolean
  ) => {
    if (!activeQuestion || !session.currentParticipantId) {
      setActiveQuestion(null);
      return;
    }

    const cardNum = activeQuestion.cardNumber;
    const now = Date.now();
    const trimmed = studentAnswer.trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;

    // Update participant statistics & start their 8-minute cooldown
    const updatedParticipants = session.participants.map((p) => {
      if (p.id === session.currentParticipantId) {
        const newScore = p.score + pointsEarned;
        const newAnswered = p.answeredCount + 1;
        const newCorrect = isCorrect ? p.correctCount + 1 : p.correctCount;
        const newWrong = !isCorrect ? p.wrongCount + 1 : p.wrongCount;
        const newAccuracy = Math.round((newCorrect / newAnswered) * 100);

        const newHistoryItem: AnswerHistoryItem = {
          cardNumber: cardNum,
          questionId: activeQuestion.id,
          studentAnswer: trimmed,
          isCorrect,
          pointsEarned,
          timestamp: now,
          wordCount,
          teacherOverridden,
        };

        return {
          ...p,
          score: newScore,
          answeredCount: newAnswered,
          correctCount: newCorrect,
          wrongCount: newWrong,
          accuracy: newAccuracy,
          lastActive: now,
          lastAnswerTimestamp: now, // 8-minute cooldown timestamp
          history: [...p.history, newHistoryItem],
        };
      }
      return p;
    });

    setSession((prev) => ({
      ...prev,
      participants: updatedParticipants,
    }));

    setActiveQuestion(null);
  };

  // Reset Session
  const handleResetSession = () => {
    const fresh = resetGameSession();
    setSession(fresh);
    setCurrentScreen('ARENA');
    setIsNameModalOpen(true);
  };

  // Force Game Over from Admin
  const handleForceGameOver = () => {
    setSession((prev) => ({ ...prev, isGameOver: true }));
    setCurrentScreen('GAME_OVER');
  };

  // Route: Landing Screen
  if (currentScreen === 'LANDING') {
    return (
      <>
        <LandingScreen
          onEnterArena={handleEnterArena}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        />
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onSuccess={() => {
            setIsAdminLoginOpen(false);
            setIsAdminPanelOpen(true);
          }}
        />
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          questions={questions}
          onUpdateQuestions={setQuestions}
          session={session}
          onUpdateSession={setSession}
          onResetSession={handleResetSession}
          onTrigger8MinRanking={() => setIs8MinRankingOpen(true)}
          onForceGameOver={handleForceGameOver}
        />
      </>
    );
  }

  // Route: Game Over Screen
  if (currentScreen === 'GAME_OVER' || session.isGameOver) {
    return (
      <GameOverScreen
        session={session}
        onPlayAgain={handleResetSession}
      />
    );
  }

  // Route: ARENA Screen
  return (
    <div className="min-h-screen w-full bg-[#07101F] text-white flex flex-col relative select-none">
      
      {/* Background Arena Texture */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/src/assets/images/arena_background_1790519727561.jpg"
          alt="Arena Background"
          className="w-full h-full object-cover object-center opacity-20 filter blur-[2px]"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07101F]/90 via-[#0B1325]/90 to-[#040812]" />
        <div className="absolute inset-0 bg-[radial-gradient(#00F2FE_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
      </div>

      {/* TOP BAR / ARENA HUD */}
      <header className="relative z-20 w-full border-b border-slate-700/60 bg-[#07101F]/95 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F2FE] via-[#FFB703] to-[#00CFE8] p-0.5 shadow-[0_0_15px_rgba(0,242,254,0.4)] shrink-0">
              <div className="w-full h-full bg-[#0B1325] rounded-[6px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#00F2FE]" />
              </div>
            </div>
            <div>
              <h1 className="font-heading text-xs sm:text-sm md:text-base font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] via-white to-[#FFB703] uppercase whitespace-nowrap">
                CLASH OF CHAMPIONS : IPS ARENA
              </h1>
              <div className="text-[10px] text-[#BFC7D5] font-rajdhani hidden sm:block">
                Kuis Uraian Singkat • 1 Soal per Rentang 8 Menit
              </div>
            </div>
          </div>

          {/* Zone 2: Player HUD & Match Progress */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1">
            
            {/* Active Player Chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-[#00F2FE]/50 shadow-[0_0_10px_rgba(0,242,254,0.2)]">
              <User className="w-4 h-4 text-[#00F2FE] shrink-0" />
              <div className="text-left">
                <div className="text-[9px] uppercase font-bold text-slate-400">Peserta Aktif</div>
                <div className="text-xs sm:text-sm font-heading font-bold text-white truncate max-w-[110px] sm:max-w-[150px]">
                  {currentParticipant ? currentParticipant.name : 'Belum Ada'}
                </div>
              </div>
              <button
                onClick={() => setIsNameModalOpen(true)}
                className="ml-1 p-1 rounded hover:bg-slate-800 text-[#FFB703] hover:text-white transition-colors cursor-pointer"
                title="Ganti Peserta / Masukkan Nama Baru"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 8-Minute Cooldown Status for Active Player */}
            {currentParticipant && (
              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
                  isCurrentInCooldown
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-300'
                    : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                }`}
              >
                {isCurrentInCooldown ? (
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <div className="text-left">
                  <div className="text-[9px] uppercase font-bold text-slate-400">Status 8 Menit</div>
                  <div className="text-xs font-heading font-bold tabular-nums">
                    {isCurrentInCooldown ? `Cooldown ${formatTime(currentCooldown)}` : 'Siap Menjawab'}
                  </div>
                </div>
              </div>
            )}

            {/* Active Player Score */}
            {currentParticipant && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hidden md:flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
                <div className="text-left">
                  <div className="text-[9px] uppercase font-bold text-slate-400">Skor Pemain</div>
                  <div className="text-xs sm:text-sm font-heading font-extrabold text-[#FFB703] tabular-nums">
                    {currentParticipant.score} pts
                  </div>
                </div>
              </div>
            )}

            {/* Periodic 8-minute Ranking Countdown Indicator */}
            <button
              onClick={() => setIs8MinRankingOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-[#00F2FE]/50 hover:bg-cyan-950/30 transition-colors cursor-pointer"
              title="Klik untuk melihat ranking sementara sekarang"
            >
              <Timer className="w-3.5 h-3.5 text-[#00F2FE] animate-pulse" />
              <div className="text-left">
                <div className="text-[9px] uppercase font-bold text-slate-400">Ranking 8 Menit</div>
                <div className="text-xs font-heading font-bold text-[#00F2FE] tabular-nums">
                  {formatTime(secondsUntilNextRanking)}
                </div>
              </div>
            </button>
          </div>

          {/* Zone 3: Actions (Leaderboard, Music Toggle, Admin) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFB703]/20 to-[#8A5A00]/20 border border-[#FFB703]/70 text-[#FFB703] hover:bg-[#FFB703]/30 shadow-[0_0_12px_rgba(255,183,3,0.3)] transition-all cursor-pointer font-heading text-xs font-bold uppercase tracking-wider"
              title="Buka Klasemen Leaderboard"
            >
              <Trophy className="w-4 h-4 text-[#FFB703]" />
              <span className="hidden sm:inline">LEADERBOARD</span>
            </button>

            {/* WAJIB: Background Music Toggle */}
            <MusicToggle />

            {/* Admin Panel Access */}
            <button
              onClick={() => setIsAdminLoginOpen(true)}
              className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Panel Guru / Admin"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ARENA CONTENT AREA */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-start">
        
        {/* Arena Welcome & Rule Information Banner */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#0B1325]/90 via-[#07101F]/80 to-[#0B1325]/90 border border-slate-800/80 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE]">
              <Flame className="w-5 h-5 text-[#00F2FE]" />
            </div>
            <div>
              <h2 className="font-heading text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>ARENA KUIS ESSAY IPS</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  SOAL BISA DIPILIH BERSAMA
                </span>
              </h2>
              <p className="text-xs text-[#BFC7D5] font-rajdhani">
                Setiap peserta dapat menjawab 1 soal pada rentang 8 menit. Soal yang telah dipilih peserta A tetap dapat dipilih oleh peserta B!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNameModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#00CFE8] text-[#07101F] font-heading font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,242,254,0.4)] cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>GANTI GILIRAN PESERTA</span>
            </button>
          </div>
        </div>

        {/* Cooldown Active Alert Bar for Current Participant */}
        {isCurrentInCooldown && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/60 text-amber-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Peserta "{currentParticipant?.name}"</strong> telah menjawab 1 soal. Sisa waktu cooldown:{' '}
                <strong className="text-white font-mono text-base">{formatTime(currentCooldown)}</strong>.
                Silakan ganti giliran ke siswa berikutnya!
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetActiveCooldown}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                title="Buka giliran siswa ini tanpa menunggu 8 menit"
              >
                Bypass Cooldown (Guru)
              </button>
              <button
                type="button"
                onClick={() => setIsNameModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Ganti ke Siswa Lain
              </button>
            </div>
          </div>
        )}

        {/* Level Legend Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold px-1">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-[#00F2FE] shadow-[0_0_8px_#00F2FE]" />
              <span>KARTU 01 - 10 : LEVEL 1 (100 POIN)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-[#FFB703] shadow-[0_0_8px_#FFB703]" />
              <span>KARTU 11 - 20 : LEVEL 2 (200 POIN)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-[#E63946] shadow-[0_0_8px_#E63946]" />
              <span>KARTU 21 - 30 : LEVEL 3 (300 POIN)</span>
            </div>
          </div>

          <div className="text-slate-400 font-rajdhani flex items-center gap-2">
            <span>Total Soal Tersedia: <strong className="text-[#00F2FE]">{questions.length} Soal</strong></span>
            <span>•</span>
            <span>Total Peserta Terdaftar: <strong className="text-[#FFB703]">{session.participants.length}</strong></span>
          </div>
        </div>

        {/* 30 CARDS GRID (Shared Cards across participants) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-12">
          {questions.map((question) => {
            // Check if current participant already answered this card
            const hasCurrentParticipantAnswered =
              currentParticipant?.history.some((h) => h.cardNumber === question.cardNumber) || false;

            // Total participants in the session who answered this card
            const totalAnsweredCount = session.participants.filter((p) =>
              p.history.some((h) => h.cardNumber === question.cardNumber)
            ).length;

            return (
              <QuestionCard
                key={question.id}
                question={question}
                hasCurrentParticipantAnswered={hasCurrentParticipantAnswered}
                totalAnsweredCount={totalAnsweredCount}
                isParticipantInCooldown={isCurrentInCooldown}
                onClick={() => handleCardClick(question)}
              />
            );
          })}
        </div>
      </main>

      {/* COOLDOWN / RESTRICTION ALERT MODAL */}
      {cooldownAlertMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-1 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-600 to-[#07101F] shadow-[0_0_40px_rgba(251,191,36,0.4)]">
            <div className="relative w-full h-full bg-[#0B1325] rounded-[14px] p-6 text-center text-white">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>

              <h3 className="font-heading text-lg font-bold text-amber-400 uppercase tracking-wider mb-2">
                ATURAN WAKTU 8 MENIT
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                {cooldownAlertMsg}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCooldownAlertMsg(null)}
                  className="w-full sm:w-1/3 py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-xs uppercase font-heading cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleResetActiveCooldown}
                  className="w-full sm:w-1/3 py-2.5 px-3 rounded-xl border border-amber-500/60 bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 text-xs uppercase font-heading cursor-pointer"
                  title="Guru dapat membuka giliran siswa ini"
                >
                  Bypass (Guru)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCooldownAlertMsg(null);
                    setIsNameModalOpen(true);
                  }}
                  className="w-full sm:w-1/3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#00CFE8] text-slate-950 font-bold text-xs uppercase font-heading hover:opacity-95 shadow cursor-pointer"
                >
                  Ganti Peserta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Input Nama Peserta */}
      <NameInputModal
        isOpen={isNameModalOpen}
        onConfirm={handleConfirmName}
        onSelectParticipant={(pId) => {
          setSession((prev) => ({
            ...prev,
            currentParticipantId: pId,
          }));
          setIsNameModalOpen(false);
        }}
        participants={session.participants}
        currentParticipantId={session.currentParticipantId}
        onCancel={() => setIsNameModalOpen(false)}
        canCancel={!!session.currentParticipantId}
      />

      {/* MODAL 2: Question Essay Screen */}
      {activeQuestion && (
        <QuestionModal
          question={activeQuestion}
          participantName={currentParticipant?.name || 'Peserta'}
          onComplete={handleQuestionComplete}
          onClose={() => setActiveQuestion(null)}
        />
      )}

      {/* MODAL 3: Leaderboard Klasemen */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        participants={session.participants}
      />

      {/* OVERLAY 4: Periodic 8-minute Ranking Overlay */}
      <RankingOverlay
        isOpen={is8MinRankingOpen}
        onClose={() => setIs8MinRankingOpen(false)}
        participants={session.participants}
      />

      {/* MODAL 5: Admin Login */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminPanelOpen(true);
        }}
      />

      {/* MODAL 6: Admin Panel */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        questions={questions}
        onUpdateQuestions={setQuestions}
        session={session}
        onUpdateSession={setSession}
        onResetSession={handleResetSession}
        onTrigger8MinRanking={() => setIs8MinRankingOpen(true)}
        onForceGameOver={handleForceGameOver}
      />
    </div>
  );
}

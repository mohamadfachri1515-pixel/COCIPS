export type DifficultyLevel = 'Level 1' | 'Level 2' | 'Level 3';

export interface Question {
  id: number;
  cardNumber: number; // 1 to 30
  level: DifficultyLevel;
  difficultyLabel: 'Mudah' | 'Menengah' | 'Sulit';
  points: number; // 100, 200, 300
  question: string;
  referenceAnswer: string; // Kunci jawaban / uraian model
  keywords: string[]; // Kata kunci untuk evaluasi otomatis
  explanation: string; // Pembahasan materi IPS
  category: string;
}

export type CardStatus = 'AVAILABLE' | 'OPENED' | 'ANSWERED';

export interface AnswerHistoryItem {
  cardNumber: number;
  questionId: number;
  studentAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  timestamp: number;
  wordCount?: number;
  teacherOverridden?: boolean;
}

export interface Participant {
  id: string;
  name: string;
  score: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  lastActive: number;
  lastAnswerTimestamp?: number; // Waktu terakhir mengisi jawaban untuk aturan 1x per 8 menit
  history: AnswerHistoryItem[];
}

export interface GameSession {
  id: string;
  startTime: number;
  participants: Participant[];
  currentParticipantId: string | null;
  cardStatuses: Record<number, CardStatus>; // key: cardNumber 1..30
  isGameOver: boolean;
  timerStartedAt: number; // For 8-minute periodic ranking
  nextRankingInterval: number; // 8 minutes in seconds = 480
  cooldownEnforced?: boolean; // Toggleable 8-minute cooldown enforcement by teacher
}

export interface AudioSettings {
  bgmMuted: boolean;
  sfxMuted: boolean;
  bgmVolume: number;
  sfxVolume: number;
}

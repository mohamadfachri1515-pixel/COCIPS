import { GameSession, Participant, Question, CardStatus } from '../types';
import { INITIAL_QUESTIONS } from '../data/seedQuestions';

const QUESTIONS_KEY = 'coc_ips_questions';
const SESSION_KEY = 'coc_ips_game_session';
const ADMIN_KEY = 'coc_ips_admin_creds';

export function getQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (!raw) {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Migrate if old multiple-choice format detected
      if (!parsed[0].keywords || !parsed[0].referenceAnswer) {
        localStorage.setItem(QUESTIONS_KEY, JSON.stringify(INITIAL_QUESTIONS));
        return INITIAL_QUESTIONS;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed reading questions from localStorage:', err);
  }
  return INITIAL_QUESTIONS;
}

export function saveQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed saving questions to localStorage:', err);
  }
}

export function resetQuestionsToDefault(): Question[] {
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(INITIAL_QUESTIONS));
  } catch (err) {
    console.error('Failed resetting questions:', err);
  }
  return INITIAL_QUESTIONS;
}

export function createInitialSession(): GameSession {
  const cardStatuses: Record<number, CardStatus> = {};
  for (let i = 1; i <= 30; i++) {
    cardStatuses[i] = 'AVAILABLE';
  }

  const now = Date.now();
  return {
    id: 'session_' + now,
    startTime: now,
    participants: [],
    currentParticipantId: null,
    cardStatuses,
    isGameOver: false,
    timerStartedAt: now,
    nextRankingInterval: 480, // 8 minutes in seconds
    cooldownEnforced: true,
  };
}

export function getSession(): GameSession {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      const fresh = createInitialSession();
      localStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const session = JSON.parse(raw) as GameSession;
    if (session.cooldownEnforced === undefined) {
      session.cooldownEnforced = true;
    }
    // Ensure all 30 cards exist
    for (let i = 1; i <= 30; i++) {
      if (!session.cardStatuses[i]) {
        session.cardStatuses[i] = 'AVAILABLE';
      }
    }
    return session;
  } catch (err) {
    console.error('Failed reading session:', err);
    return createInitialSession();
  }
}

export function saveSession(session: GameSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed saving session:', err);
  }
}

export function resetSession(): GameSession {
  const fresh = createInitialSession();
  saveSession(fresh);
  return fresh;
}

export function getAdminCredentials(): { user: string; pass: string } {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading admin creds:', err);
  }
  return { user: 'admin', pass: 'admin123' };
}

export function saveAdminCredentials(user: string, pass: string): void {
  localStorage.setItem(ADMIN_KEY, JSON.stringify({ user, pass }));
}

// ============================================================
// 클라이언트 상태 관리 (localStorage 기반)
// 키: bujeok_app_v1
// ============================================================

import type { TalismanCategory } from '../data/talismans';
import type { DailyFortune } from '../data/fortune';

// ─── 타입 정의 ──────────────────────────────────────────────

/** 사용자 프로필 */
export interface UserProfile {
  name: string;
  /** 양력 출생 연도 (사주 연도는 입춘 기준이라 다를 수 있음 — getSajuYear 참고) */
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  /** 출생 시각 0-23 (12지시 선택 시 각 지시의 대표 시각) */
  birthHour: number;
  /** 출생 시간을 실제로 아는지 여부. false면 birthHour는 기본값(12시) 추정치 */
  birthHourKnown?: boolean;
  /** 입춘 기준으로 산출된 띠 동물 이름 (예: '뱀') */
  animal?: string;
  completedOnboarding: boolean;
}

/** 저장된 부적 */
export interface SavedTalisman {
  id: string; // UUID
  type: string; // TalismanType.id
  category: TalismanCategory;
  style: 'traditional' | 'modern';
  message: string; // 사용자 메시지
  createdAt: string; // ISO 날짜
  animal: string; // 띠 동물 이름
  mantra: string; // 주문
}

/** 감정 기록 */
export interface EmotionEntry {
  date: string; // YYYY-MM-DD
  emotion: string;
  note?: string;
}

/** 앱 설정 */
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  dailyFortuneTime: string; // HH:MM
  language: 'ko';
}

/** 전체 사용자 상태 */
export interface UserState {
  profile: UserProfile | null;
  talismans: SavedTalisman[];
  fortuneHistory: DailyFortune[];
  emotionLog: EmotionEntry[];
  settings: AppSettings;
}

// ─── 상수 ───────────────────────────────────────────────────

const STORAGE_KEY = 'bujeok_app_v1';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  notifications: true,
  dailyFortuneTime: '08:00',
  language: 'ko',
};

const DEFAULT_STATE: UserState = {
  profile: null,
  talismans: [],
  fortuneHistory: [],
  emotionLog: [],
  settings: { ...DEFAULT_SETTINGS },
};

// ─── 유틸리티 ───────────────────────────────────────────────

function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 9)
  );
}

// ─── 저장/불러오기 ──────────────────────────────────────────

/**
 * 전체 상태를 localStorage에서 불러오기
 */
export function loadState(): UserState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<UserState>;

    return {
      profile: parsed.profile ?? null,
      talismans: parsed.talismans ?? [],
      fortuneHistory: parsed.fortuneHistory ?? [],
      emotionLog: parsed.emotionLog ?? [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

/**
 * 전체 상태를 localStorage에 저장
 */
export function saveState(state: UserState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[부적앱] 상태 저장 실패:', e);
  }
}

/**
 * 전체 상태 초기화
 */
export function clearState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ─── 프로필 관리 ────────────────────────────────────────────

/**
 * 프로필 저장
 */
export function saveProfile(profile: UserProfile): void {
  const state = loadState();
  state.profile = profile;
  saveState(state);
}

/**
 * 프로필 조회
 */
export function loadProfile(): UserProfile | null {
  return loadState().profile;
}

/**
 * 온보딩 완료 처리
 */
export function completeOnboarding(): void {
  const state = loadState();
  if (state.profile) {
    state.profile.completedOnboarding = true;
    saveState(state);
  }
}

// ─── 부적 관리 ──────────────────────────────────────────────

/**
 * 부적 저장
 */
export function saveTalisman(
  talisman: Omit<SavedTalisman, 'id' | 'createdAt'>
): SavedTalisman {
  const state = loadState();
  const saved: SavedTalisman = {
    ...talisman,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  state.talismans.unshift(saved); // 최신순 정렬
  saveState(state);
  return saved;
}

/**
 * 저장된 부적 목록 조회
 */
export function loadTalismans(): SavedTalisman[] {
  return loadState().talismans;
}

/**
 * 특정 부적 조회
 */
export function loadTalismanById(id: string): SavedTalisman | undefined {
  return loadState().talismans.find((t) => t.id === id);
}

/**
 * 부적 삭제
 */
export function deleteTalisman(id: string): void {
  const state = loadState();
  state.talismans = state.talismans.filter((t) => t.id !== id);
  saveState(state);
}

// ─── 운세 기록 ──────────────────────────────────────────────

/**
 * 운세 기록 저장
 */
export function saveFortune(fortune: DailyFortune): void {
  const state = loadState();
  // 같은 날짜 중복 방지
  state.fortuneHistory = state.fortuneHistory.filter(
    (f) => f.date !== fortune.date
  );
  state.fortuneHistory.unshift(fortune);
  // 최대 90일치 유지
  if (state.fortuneHistory.length > 90) {
    state.fortuneHistory = state.fortuneHistory.slice(0, 90);
  }
  saveState(state);
}

/**
 * 운세 기록 조회
 */
export function loadFortuneHistory(): DailyFortune[] {
  return loadState().fortuneHistory;
}

/**
 * 오늘의 운세 조회
 */
export function loadTodayFortune(): DailyFortune | undefined {
  const today = new Date().toISOString().slice(0, 10);
  return loadState().fortuneHistory.find((f) => f.date === today);
}

// ─── 감정 기록 ──────────────────────────────────────────────

/**
 * 감정 기록 저장
 */
export function saveEmotion(entry: Omit<EmotionEntry, 'date'>): void {
  const state = loadState();
  const today = new Date().toISOString().slice(0, 10);

  // 같은 날짜 중복 방지 (업데이트)
  state.emotionLog = state.emotionLog.filter((e) => e.date !== today);
  state.emotionLog.unshift({ ...entry, date: today });

  // 최대 365일치 유지
  if (state.emotionLog.length > 365) {
    state.emotionLog = state.emotionLog.slice(0, 365);
  }
  saveState(state);
}

/**
 * 감정 기록 조회
 */
export function loadEmotionLog(): EmotionEntry[] {
  return loadState().emotionLog;
}

// ─── 설정 관리 ──────────────────────────────────────────────

/**
 * 설정 업데이트
 */
export function updateSettings(
  partial: Partial<AppSettings>
): void {
  const state = loadState();
  state.settings = { ...state.settings, ...partial };
  saveState(state);
}

/**
 * 설정 조회
 */
export function loadSettings(): AppSettings {
  return loadState().settings;
}

// ============================================================
// 고른 날짜 저장 — localStorage
//
// 저장할 때 계산 기준(규칙 버전·달력 출처)을 함께 남긴다.
// 나중에 규칙이 바뀌어도 "그때 무엇을 근거로 골랐는지"가 남게 하기 위함이다.
// ============================================================

import { CALENDAR_VERSION, getCalendarSource } from '@/lib/calendar/calendarAdapter';
import { RULES_VERSION } from './date-selection-rules';
import type { DayCandidate, GoodDayPurpose, PartnerInput, SavedGoodDay } from '@/types/good-day';

const STORAGE_KEY = 'bujeok-good-days';

export function loadSavedDays(): SavedGoodDay[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedGoodDay[]) : [];
  } catch {
    return [];
  }
}

export function saveGoodDay(
  purpose: GoodDayPurpose,
  candidate: DayCandidate,
  profileKey: string,
  partner?: PartnerInput
): SavedGoodDay {
  const entry: SavedGoodDay = {
    id: `${purpose}-${candidate.date}`,
    purpose,
    date: candidate.date,
    profileKey,
    partner,
    score: candidate.score,
    reasons: candidate.reasons,
    rulesVersion: RULES_VERSION,
    calendarSource: getCalendarSource(),
    calendarVersion: CALENDAR_VERSION,
    savedAt: new Date().toISOString(),
  };
  const list = loadSavedDays().filter((s) => s.id !== entry.id);
  list.unshift(entry);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // 저장 실패해도 화면 흐름은 막지 않는다
  }
  return entry;
}

export function removeSavedDay(id: string): void {
  const list = loadSavedDays().filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/** 오늘 기준 남은 날 (음수면 지나간 날) */
export function daysUntil(date: string, today = new Date()): number {
  const target = new Date(`${date}T00:00:00Z`).getTime();
  const base = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - base) / 86400000);
}

/** 홈 카드에 띄울 한 줄 — 아직 오지 않은 날 중 가장 가까운 것 */
export function getUpcomingLine(
  list: SavedGoodDay[] = loadSavedDays(),
  today = new Date()
): { entry: SavedGoodDay; line: string } | null {
  const upcoming = list
    .map((e) => ({ e, d: daysUntil(e.date, today) }))
    .filter((x) => x.d >= 0)
    .sort((a, b) => a.d - b.d)[0];
  if (!upcoming) return null;

  const { e, d } = upcoming;
  const label = { move: '이사', contract: '계약', confession: '그날', wedding: '결혼' }[
    e.purpose
  ];

  if (e.purpose === 'wedding') {
    return {
      entry: e,
      line: d === 0 ? '두 분이 고른 날이 오늘이에요' : '두 분이 고른 날을 정성껏 기다리고 있어요',
    };
  }
  return {
    entry: e,
    line: d === 0 ? `${label} 당일이에요` : `${label}까지 ${d}일 남았어요`,
  };
}

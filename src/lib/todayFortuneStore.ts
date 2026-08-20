// ============================================================
// 오늘의 운세 보관 — 운영 규칙을 지키는 자리
//
//  · 같은 사람이 하루에 몇 번 들어와도 같은 결과를 본다 (날짜별로 캐시)
//  · 자정이 지나면 다음 날 운세로 바뀐다 (기기 로컬 날짜 기준)
//  · 최근 14일에 쓴 문구는 다시 고르지 않는다
// ============================================================

import {
  computeTodayFortune,
  localDateString,
  type TodayFortune,
  type TodayFortuneInput,
} from '@/data/today-fortune';

const CACHE_KEY = 'bujeok-today-fortune';
const LOG_KEY = 'bujeok-fortune-phrase-log';
const KEEP_DAYS = 14;

interface CacheShape {
  date: string;
  /** 생년월일시가 바뀌면(프로필 수정) 다시 계산해야 한다 */
  who: string;
  fortune: TodayFortune;
}

interface LogEntry {
  date: string;
  keys: string[];
}

function whoKey(i: Pick<TodayFortuneInput, 'year' | 'month' | 'day' | 'hour'>) {
  return `${i.year}-${i.month}-${i.day}-${i.hour ?? 'x'}`;
}

function readLog(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as LogEntry[]) : [];
  } catch {
    return [];
  }
}

/** 최근 KEEP_DAYS 일 안의 기록만 남긴다 */
function pruneLog(log: LogEntry[], today: string): LogEntry[] {
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - KEEP_DAYS);
  const cutoffStr = localDateString(cutoff);
  return log.filter((e) => e.date > cutoffStr).slice(-KEEP_DAYS);
}

/**
 * 오늘의 운세. 브라우저에서만 부른다 (localStorage 사용).
 * 같은 날 다시 불러도 저장해 둔 결과를 그대로 돌려준다.
 */
export function getTodayFortune(
  input: Omit<TodayFortuneInput, 'recentKeys'>
): TodayFortune {
  const date = localDateString(input.today ?? new Date());
  const who = whoKey(input);

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as CacheShape;
      if (cached?.date === date && cached.who === who && cached.fortune) {
        return cached.fortune;
      }
    }
  } catch {
    // 캐시가 깨졌으면 새로 계산한다
  }

  const log = pruneLog(readLog(), date);
  const recentKeys = log.flatMap((e) => e.keys);
  const { fortune, usedKeys } = computeTodayFortune({ ...input, recentKeys });

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ date, who, fortune } satisfies CacheShape)
    );
    localStorage.setItem(
      LOG_KEY,
      JSON.stringify([...log.filter((e) => e.date !== date), { date, keys: usedKeys }])
    );
  } catch {
    // 저장에 실패해도 오늘 화면은 그대로 보여준다
  }

  return fortune;
}

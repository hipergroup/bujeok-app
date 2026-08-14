// ============================================================
// 달력 어댑터 — 하루치 공식 정보를 모아 준다
//
//   · 음력·윤달   ← korean-lunar-calendar (한국천문연구원 기준표)
//   · 공휴일      ← holidays.ts (규칙 계산 + 손으로 적은 임시공휴일)
//   · 일진·세차·월건 ← 앱의 만세력 (data/saju.ts)
//   · 24절기      ← 앱의 천문 계산 (data/solar-terms.ts)
//
// 어느 값도 지어내지 않는다. 범위 밖의 해는 계산하지 않고 오류를 던진다.
// ============================================================

import { getSaju } from '@/data/saju';
import { getSolarTermsOfYear } from '@/data/solar-terms';
import type { CalendarDay } from '@/types/good-day';
import { getHolidays } from './holidays';
import {
  LUNAR_MAX_YEAR,
  LUNAR_MIN_YEAR,
  LUNAR_SOURCE,
  LunarRangeError,
  solarToLunar,
} from './lunarCalendar';

export { LunarRangeError };

/** 달력을 만들 수 없을 때 (지원 범위 밖) */
export class CalendarDataMissingError extends Error {
  readonly year: number;
  constructor(year: number, cause?: string) {
    super(
      `${year}년 달력을 만들 수 없습니다 (지원 ${LUNAR_MIN_YEAR}~${LUNAR_MAX_YEAR}).` +
        (cause ? ` ${cause}` : '')
    );
    this.name = 'CalendarDataMissingError';
    this.year = year;
  }
}

export const CALENDAR_VERSION = '2.0.0';

/** 연도별 캐시 — 같은 해를 다시 계산하지 않는다 */
const holidayCache = new Map<number, Map<string, string>>();
const termCache = new Map<number, Map<string, string>>();

function holidaysOf(year: number): Map<string, string> {
  let hit = holidayCache.get(year);
  if (!hit) {
    hit = getHolidays(year);
    holidayCache.set(year, hit);
  }
  return hit;
}

/** 그 해에 절기가 시작하는 날짜 → 절기 이름 */
function termsOf(year: number): Map<string, string> {
  let hit = termCache.get(year);
  if (!hit) {
    hit = new Map<string, string>();
    const pad = (n: number) => String(n).padStart(2, '0');
    for (const t of getSolarTermsOfYear(year)) {
      const { year: y, month, day } = t.time;
      hit.set(`${y}-${pad(month)}-${pad(day)}`, t.name);
    }
    termCache.set(year, hit);
  }
  return hit;
}

/**
 * 예전 인터페이스 호환 — 이제 네트워크를 타지 않으므로 범위 검사만 한다.
 * (화면에서 await 로 호출하던 자리를 그대로 두기 위해 남긴다)
 */
export async function loadCalendarYear(year: number): Promise<void> {
  if (year < LUNAR_MIN_YEAR || year > LUNAR_MAX_YEAR) {
    throw new CalendarDataMissingError(year);
  }
}

export async function loadCalendarRange(from: string, to: string): Promise<void> {
  const y1 = Number(from.slice(0, 4));
  const y2 = Number(to.slice(0, 4));
  for (let y = y1; y <= y2; y++) await loadCalendarYear(y);
}

/** 하루치 공식 정보 */
export function getCalendarDay(date: string): CalendarDay {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) throw new CalendarDataMissingError(y || 0, `${date} 형식 오류`);

  let lunar;
  try {
    lunar = solarToLunar(y, m, d);
  } catch (e) {
    throw new CalendarDataMissingError(
      y,
      e instanceof Error ? e.message : String(e)
    );
  }

  const holidayName = holidaysOf(y).get(date);
  const saju = getSaju(y, m, d, 12);

  return {
    solar: date,
    lunarYear: lunar.year,
    lunarMonth: lunar.month,
    lunarDay: lunar.day,
    leapMonth: lunar.leapMonth,
    weekday: new Date(`${date}T00:00:00Z`).getUTCDay(),
    secha: `${saju.yearStem.hanja}${saju.yearBranch.hanja}`,
    wolgeon: `${saju.monthStem.hanja}${saju.monthBranch.hanja}`,
    iljin: `${saju.dayStem.hanja}${saju.dayBranch.hanja}`,
    solarTerm: termsOf(y).get(date),
    holiday: Boolean(holidayName),
    ...(holidayName ? { holidayName } : {}),
  };
}

export function getCalendarSource(): string {
  return LUNAR_SOURCE;
}

export function getCalendarVersion(): string {
  return CALENDAR_VERSION;
}

/** from~to 사이의 날짜를 하루씩 (UTC 기준으로 계산해 시간대 밀림 방지) */
export function eachDate(from: string, to: string): string[] {
  const out: string[] = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  for (let d = start; d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

// ============================================================
// 공식 달력 데이터 어댑터
//
// 음양력·공휴일은 한국천문연구원(KASI) 자료를 빌드 전에 받아
// public/data/calendar/{year}.json 으로 구워둔 것을 읽는다.
// (생성기: tools/gen-calendar-data.mjs)
//
// 데이터가 없으면 절대 임의의 날짜를 만들어내지 않고 오류를 던진다 —
// 손 없는 날·음력 표기는 추측으로 대신할 수 있는 값이 아니다.
// ============================================================

import type { CalendarDay, CalendarYearFile } from '@/types/good-day';

/** 달력 데이터가 아직 준비되지 않았을 때 */
export class CalendarDataMissingError extends Error {
  readonly year: number;
  constructor(year: number, cause?: string) {
    super(
      `${year}년 달력 데이터가 없습니다. ` +
        `KASI_SERVICE_KEY 를 설정하고 "node tools/gen-calendar-data.mjs ${year}" 로 생성하세요.` +
        (cause ? ` (${cause})` : '')
    );
    this.name = 'CalendarDataMissingError';
    this.year = year;
  }
}

/**
 * GitHub Pages 는 /bujeok-app 하위에서 서빙되므로 public 자산을 받을 때
 * 접두어가 필요하다. (lib/gift.ts 의 basePath 감지와 같은 방식)
 */
function basePath(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname.startsWith('/bujeok-app') ? '/bujeok-app' : '';
}

const cache = new Map<number, Map<string, CalendarDay>>();
const metaCache = new Map<number, CalendarYearFile['meta']>();

/** 한 해치 달력을 읽어 캐시에 담는다. 없으면 CalendarDataMissingError */
export async function loadCalendarYear(year: number): Promise<void> {
  if (cache.has(year)) return;

  let file: CalendarYearFile;
  try {
    const res = await fetch(`${basePath()}/data/calendar/${year}.json`);
    if (!res.ok) throw new CalendarDataMissingError(year, `HTTP ${res.status}`);
    file = (await res.json()) as CalendarYearFile;
  } catch (e) {
    if (e instanceof CalendarDataMissingError) throw e;
    throw new CalendarDataMissingError(
      year,
      e instanceof Error ? e.message : String(e)
    );
  }

  if (!file?.days?.length) throw new CalendarDataMissingError(year, '빈 파일');

  const byDate = new Map<string, CalendarDay>();
  for (const d of file.days) byDate.set(d.solar, d);
  cache.set(year, byDate);
  metaCache.set(year, file.meta);
}

/** 조회 구간에 걸친 해를 모두 읽는다 */
export async function loadCalendarRange(
  from: string,
  to: string
): Promise<void> {
  const y1 = Number(from.slice(0, 4));
  const y2 = Number(to.slice(0, 4));
  for (let y = y1; y <= y2; y++) await loadCalendarYear(y);
}

/** 하루치 공식 정보. 읽어둔 해가 아니면 오류 */
export function getCalendarDay(date: string): CalendarDay {
  const year = Number(date.slice(0, 4));
  const byDate = cache.get(year);
  if (!byDate) throw new CalendarDataMissingError(year, '먼저 loadCalendarYear 필요');
  const day = byDate.get(date);
  if (!day) throw new CalendarDataMissingError(year, `${date} 없음`);
  return day;
}

/** 데이터 출처 표기 — 화면 하단과 저장 기록에 남긴다 */
export function getCalendarSource(year: number): string {
  return metaCache.get(year)?.source ?? '한국천문연구원 음양력/특일 정보';
}

export function getCalendarVersion(year: number): string {
  return metaCache.get(year)?.version ?? 'unknown';
}

/** from~to 사이의 날짜 문자열을 하루씩 (UTC 기준으로 계산해 시간대 밀림 방지) */
export function eachDate(from: string, to: string): string[] {
  const out: string[] = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  for (let d = start; d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

// ============================================================
// 한국 공휴일
//
// 매년 규칙이 정해진 공휴일은 여기서 계산한다.
//   · 양력 고정 — 신정·삼일절·어린이날·현충일·광복절·개천절·한글날·성탄절
//   · 음력 기반 — 설날(전날~다음날)·부처님오신날·추석(전날~다음날)
//   · 대체공휴일 — 관공서의 공휴일에 관한 규정 제3조 (2023년 확대 기준)
//
// 계산할 수 없는 것(임시공휴일·선거일)은 발표가 나야 알 수 있으므로
// holiday-overrides.ts 에 손으로 적어 둔다.
// ============================================================

import { HOLIDAY_OVERRIDES } from './holiday-overrides';
import { lunarToSolar } from './lunarCalendar';

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/** 하루 더하거나 뺀 날짜 (UTC 기준으로 계산해 시간대 밀림 방지) */
function shift(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const weekdayOf = (dateStr: string) =>
  new Date(`${dateStr}T00:00:00Z`).getUTCDay();

/** 양력 고정 공휴일 — [월, 일, 이름, 대체공휴일 대상 여부] */
const FIXED: [number, number, string, boolean][] = [
  [1, 1, '신정', false],
  [3, 1, '삼일절', true],
  [5, 5, '어린이날', true],
  [6, 6, '현충일', false],
  [8, 15, '광복절', true],
  [10, 3, '개천절', true],
  [10, 9, '한글날', true],
  [12, 25, '성탄절', true],
];

interface Holiday {
  date: string;
  name: string;
  /** 대체공휴일 적용 대상인지 */
  substitutable: boolean;
  /** 설·추석 연휴인지 (일요일에만 대체가 붙는다) */
  seolChuseok?: boolean;
}

/**
 * 한 해의 공휴일. 대체공휴일과 수동 지정분까지 반영한다.
 * @returns 'YYYY-MM-DD' → 공휴일 이름
 */
export function getHolidays(year: number): Map<string, string> {
  const base: Holiday[] = [];

  for (const [m, d, name, substitutable] of FIXED) {
    base.push({ date: iso(year, m, d), name, substitutable });
  }

  // 설날 — 음력 1월 1일과 그 전후 하루
  const seol = lunarToSolar(year, 1, 1, false);
  if (seol) {
    base.push({ date: shift(seol, -1), name: '설날 연휴', substitutable: true, seolChuseok: true });
    base.push({ date: seol, name: '설날', substitutable: true, seolChuseok: true });
    base.push({ date: shift(seol, 1), name: '설날 연휴', substitutable: true, seolChuseok: true });
  }

  // 추석 — 음력 8월 15일과 그 전후 하루
  const chuseok = lunarToSolar(year, 8, 15, false);
  if (chuseok) {
    base.push({ date: shift(chuseok, -1), name: '추석 연휴', substitutable: true, seolChuseok: true });
    base.push({ date: chuseok, name: '추석', substitutable: true, seolChuseok: true });
    base.push({ date: shift(chuseok, 1), name: '추석 연휴', substitutable: true, seolChuseok: true });
  }

  // 부처님오신날 — 음력 4월 8일
  const buddha = lunarToSolar(year, 4, 8, false);
  if (buddha) {
    base.push({ date: buddha, name: '부처님오신날', substitutable: true });
  }

  const map = new Map<string, string>();
  for (const h of base) {
    // 설·추석 연휴가 해를 넘길 수 있으니 해당 연도 것만 담는다
    if (h.date.startsWith(String(year))) map.set(h.date, h.name);
  }

  // ── 대체공휴일 ──
  // 설·추석 연휴: 일요일과 겹칠 때만
  // 어린이날: 토·일 또는 다른 공휴일과 겹칠 때
  // 나머지 대상: 토·일과 겹칠 때
  const substitutes = new Map<string, string>();
  for (const h of base) {
    if (!h.substitutable) continue;
    const wd = weekdayOf(h.date);
    const overlapsHoliday =
      h.name === '어린이날' &&
      base.some((o) => o !== h && o.date === h.date);

    const needs = h.seolChuseok
      ? wd === 0
      : h.name === '어린이날'
        ? wd === 0 || wd === 6 || overlapsHoliday
        : wd === 0 || wd === 6;
    if (!needs) continue;

    // 겹친 날 다음의 첫 번째 비공휴일
    let cand = shift(h.date, 1);
    while (map.has(cand) || substitutes.has(cand)) cand = shift(cand, 1);
    if (cand.startsWith(String(year))) substitutes.set(cand, `${h.name} 대체공휴일`);
  }
  for (const [d, n] of substitutes) map.set(d, n);

  // ── 손으로 적어 둔 임시공휴일·선거일 ──
  for (const [d, n] of Object.entries(HOLIDAY_OVERRIDES)) {
    if (d.startsWith(String(year))) map.set(d, n);
  }

  return map;
}

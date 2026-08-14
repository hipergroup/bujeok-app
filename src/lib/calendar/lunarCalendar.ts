// ============================================================
// 음양력 변환
//
// 한국천문연구원(KASI) 기준표를 담은 korean-lunar-calendar 를 감싼다.
// 공식 API 를 부르는 것과 같은 값이며, 인증키 없이 오프라인으로 동작한다.
//
// 지원 범위: 양력 1000-02-13 ~ 2050-12-31
// ============================================================

import KoreanLunarCalendar from 'korean-lunar-calendar';

export const LUNAR_SOURCE = '한국천문연구원 기준 음양력 (korean-lunar-calendar)';
export const LUNAR_MIN_YEAR = 1000;
export const LUNAR_MAX_YEAR = 2050;

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  /** 윤달 여부 */
  leapMonth: boolean;
}

/** 지원 범위를 벗어난 해 */
export class LunarRangeError extends Error {
  constructor(year: number) {
    super(
      `${year}년은 음양력 변환 범위(${LUNAR_MIN_YEAR}~${LUNAR_MAX_YEAR}) 밖입니다.`
    );
    this.name = 'LunarRangeError';
  }
}

/** 양력 → 음력. 범위 밖이면 LunarRangeError */
export function solarToLunar(
  year: number,
  month: number,
  day: number
): LunarDate {
  if (year < LUNAR_MIN_YEAR || year > LUNAR_MAX_YEAR) {
    throw new LunarRangeError(year);
  }
  const cal = new KoreanLunarCalendar();
  if (!cal.setSolarDate(year, month, day)) {
    throw new LunarRangeError(year);
  }
  const l = cal.getLunarCalendar();
  return {
    year: l.year,
    month: l.month,
    day: l.day,
    leapMonth: Boolean(l.intercalation),
  };
}

/**
 * 음력 → 양력 'YYYY-MM-DD'. 없는 날짜(그 해에 없는 윤달 등)면 null.
 * 공휴일 계산에서 설·추석·부처님오신날을 구할 때 쓴다.
 */
export function lunarToSolar(
  year: number,
  month: number,
  day: number,
  leapMonth = false
): string | null {
  if (year < LUNAR_MIN_YEAR || year > LUNAR_MAX_YEAR) return null;
  const cal = new KoreanLunarCalendar();
  if (!cal.setLunarDate(year, month, day, leapMonth)) return null;
  const s = cal.getSolarCalendar();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${s.year}-${pad(s.month)}-${pad(s.day)}`;
}

// ============================================================
// 태어난 시각 — 십이지시(十二支時) 한 곳
// ------------------------------------------------------------
// 화면마다 0~23 숫자 입력 / 한자 격자 / "23-01" 표기가 제각각이라
// 무엇을 넣어야 하는지 애매했다. 이제 표기는 여기 한 곳에서 나온다.
//
// · 값(value)은 사주 계산에 쓰는 시(hour, 0-23) — 각 시진의 정중앙
// · 자시는 23:00~00:59 를 한 묶음으로 보므로 0시로 둔다 (saju 모듈과 동일)
// ============================================================

/** 태어난 시각을 모를 때의 값 */
export const HOUR_UNKNOWN = -1;
/** 모를 때 계산에 쓰는 시각 (오시 정중앙) */
export const DEFAULT_HOUR = 12;

export interface HourBranch {
  /** 사주 계산용 시(0-23) */
  value: number;
  /** 자시·축시 … */
  name: string;
  hanja: string;
  /** 사람 말로 읽는 시간대 */
  range: string;
}

export const HOUR_BRANCHES: HourBranch[] = [
  { value: 0, name: '자시', hanja: '子', range: '밤 11시 ~ 새벽 1시' },
  { value: 2, name: '축시', hanja: '丑', range: '새벽 1시 ~ 3시' },
  { value: 4, name: '인시', hanja: '寅', range: '새벽 3시 ~ 5시' },
  { value: 6, name: '묘시', hanja: '卯', range: '아침 5시 ~ 7시' },
  { value: 8, name: '진시', hanja: '辰', range: '아침 7시 ~ 9시' },
  { value: 10, name: '사시', hanja: '巳', range: '오전 9시 ~ 11시' },
  { value: 12, name: '오시', hanja: '午', range: '낮 11시 ~ 오후 1시' },
  { value: 14, name: '미시', hanja: '未', range: '오후 1시 ~ 3시' },
  { value: 16, name: '신시', hanja: '申', range: '오후 3시 ~ 5시' },
  { value: 18, name: '유시', hanja: '酉', range: '저녁 5시 ~ 7시' },
  { value: 20, name: '술시', hanja: '戌', range: '저녁 7시 ~ 9시' },
  { value: 22, name: '해시', hanja: '亥', range: '밤 9시 ~ 11시' },
];

/** 시계 시각(0-23) → 그 시각이 드는 시진 */
export function branchOfHour(hour: number): HourBranch {
  // 23시는 다음 날 자시로 본다
  if (hour >= 23 || hour < 1) return HOUR_BRANCHES[0];
  return (
    HOUR_BRANCHES.find((b) => b.value !== 0 && hour >= b.value - 1 && hour < b.value + 1) ??
    HOUR_BRANCHES[6]
  );
}

/** "저녁 5시 ~ 7시 (유시)" — 모르면 안내 문구 */
export function hourLabel(hour: number | null | undefined): string {
  if (hour === null || hour === undefined || hour === HOUR_UNKNOWN || hour < 0) {
    return '태어난 시각 모름';
  }
  const b = branchOfHour(hour);
  return `${b.range} (${b.name})`;
}

/** 모르면 기본 시각으로 대체 */
export function effectiveHour(hour: number | null | undefined): number {
  if (hour === null || hour === undefined || hour === HOUR_UNKNOWN || hour < 0) {
    return DEFAULT_HOUR;
  }
  return hour;
}

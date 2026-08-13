// ============================================================
// 목적별 규칙 — 무엇을 묻고, 무엇을 후보에서 빼는가
// ============================================================

import type { DateConditions, GoodDayPurpose } from '@/types/good-day';

export interface PurposeSpec {
  id: GoodDayPurpose;
  title: string;
  desc: string;
  /** 상대방 정보 — 안 받음 / 선택 / 필수 */
  partner: 'none' | 'optional' | 'required';
  /** 조회 기간 상한 (개월) */
  maxMonths: number;
  /** 이 목적에서만 묻는 조건 */
  extras: Array<'moveDirection' | 'onlySon' | 'weekdaysOnly' | 'weekendOnly'>;
}

export const PURPOSE_SPECS: PurposeSpec[] = [
  {
    id: 'move',
    title: '이사',
    desc: '짐을 옮기는 날을 고릅니다',
    partner: 'none',
    maxMonths: 6,
    extras: ['moveDirection', 'onlySon'],
  },
  {
    id: 'contract',
    title: '계약',
    desc: '서명하고 도장 찍는 날을 고릅니다',
    partner: 'none',
    maxMonths: 6,
    extras: ['weekdaysOnly'],
  },
  {
    id: 'confession',
    title: '고백·중요한 대화',
    desc: '마음을 꺼내 보이는 날을 고릅니다',
    partner: 'optional',
    maxMonths: 3,
    extras: [],
  },
  {
    id: 'wedding',
    title: '결혼 날 받기',
    desc: '두 분이 함께 설 날을 고릅니다',
    partner: 'required',
    maxMonths: 24,
    extras: ['weekendOnly'],
  },
];

export function getPurposeSpec(id: GoodDayPurpose): PurposeSpec {
  const spec = PURPOSE_SPECS.find((p) => p.id === id);
  if (!spec) throw new Error(`알 수 없는 목적: ${id}`);
  return spec;
}

/**
 * 조건만으로 후보에서 빼야 하는 날인지 (사주와 무관한 1차 거르기).
 * 점수로 낮추는 게 아니라 아예 빼는 것들만 여기서 다룬다.
 */
export function isFilteredOut(
  conditions: DateConditions,
  weekday: number,
  holiday: boolean
): boolean {
  if (conditions.weekdays.length > 0 && !conditions.weekdays.includes(weekday))
    return true;
  if (!conditions.includeHolidays && holiday) return true;
  if (conditions.weekdaysOnly && (weekday === 0 || weekday === 6)) return true;
  return false;
}

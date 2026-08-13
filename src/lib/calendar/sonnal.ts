// ============================================================
// 손 없는 날 (손날)
//
// 민간에서 이사·집수리 날을 고를 때 쓰는 셈법이다.
// '손'은 날짜마다 동·서·남·북을 돌아다니며 훼방을 놓는다는 귀신으로,
// 음력 날짜의 끝수로 그 방향이 정해진다.
//
//   끝수 1·2 → 동쪽,  3·4 → 남쪽,  5·6 → 서쪽,  7·8 → 북쪽
//   끝수 9·0 → 어느 방향에도 손이 없다 (손 없는 날)
//
// 즉 음력 9·10·19·20·29·30일이 손 없는 날이다.
//
// 이 파일은 음력 '일(日)' 숫자만 받는 순수 함수다 —
// 음력 날짜 자체는 공식 달력 데이터에서 오고, 여기서 만들어내지 않는다.
// ============================================================

import type { MoveDirection, SonDirection } from '@/types/good-day';

export const SON_DIRECTION_LABEL: Record<SonDirection, string> = {
  east: '동쪽',
  south: '남쪽',
  west: '서쪽',
  north: '북쪽',
  none: '없음',
};

/**
 * 음력 일(日)로 손의 방향을 구한다.
 * @param lunarDay 음력 날짜의 일 (1~30)
 */
export function getSonDirection(lunarDay: number): SonDirection {
  if (!Number.isInteger(lunarDay) || lunarDay < 1 || lunarDay > 30) {
    throw new RangeError(`음력 일이 1~30 범위를 벗어났습니다: ${lunarDay}`);
  }
  switch (lunarDay % 10) {
    case 1:
    case 2:
      return 'east';
    case 3:
    case 4:
      return 'south';
    case 5:
    case 6:
      return 'west';
    case 7:
    case 8:
      return 'north';
    default:
      // 9, 0
      return 'none';
  }
}

/** 손 없는 날인지 */
export function isSonEomneunNal(lunarDay: number): boolean {
  return getSonDirection(lunarDay) === 'none';
}

/**
 * 이사 방향과 그날 손의 방향이 부딪히는지.
 * 방향을 모르면(unknown) 충돌을 따지지 않는다 — 손 없는 날 여부만 표시한다.
 */
export function conflictsWithMove(
  lunarDay: number,
  direction: MoveDirection
): boolean {
  if (direction === 'unknown') return false;
  return getSonDirection(lunarDay) === direction;
}

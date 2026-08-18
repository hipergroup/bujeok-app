// ============================================================
// 좋은 날 고르기 — 점수 규칙
//
// 여기 있는 숫자가 추천 순서를 정한다. 조정은 이 파일 한 곳에서만 한다.
//
// ⚠ 이 값들은 전통적으로 확정된 절대 공식이 아니다.
//   화면에서는 반드시 "수호부의 맞춤 해석 기준"으로 표기한다.
// ============================================================

import type { BranchRelation } from './branch-relations';
import type { GoodDayPurpose } from '@/types/good-day';

/** 저장된 추천이 어떤 기준으로 계산됐는지 남기기 위한 버전 */
export const RULES_VERSION = '1.1.0';

/** 모든 날짜가 여기서 출발한다 */
export const BASE_SCORE = 50;

/** 지지 관계별 가감점 — 내 일지(日支)와 그날 일진 지지의 관계 */
export const RELATION_SCORE: Record<BranchRelation, number> = {
  yukhap: 10,
  samhap: 8,
  chung: -25,
  hyeong: -12,
  pa: -8,
  hae: -8,
  none: 0,
};

/** 그날의 오행이 내게 필요한 기운(용신·희신)일 때 */
export const OHENG_SCORE = {
  /** 용신과 일치 */
  yongsin: 15,
  /** 희신과 일치 */
  huisin: 7,
  /** 기신과 일치 */
  gisin: -10,
};

/** 현실적인 일정 조건 */
export const SCHEDULE_SCORE = {
  /** 사용자가 고른 요일에 해당 */
  preferredWeekday: 5,
  /** 주말 우선을 켰고 실제로 주말 */
  weekendWhenPreferred: 5,
  /** 공휴일 (포함을 켠 경우에만 후보로 남는다) */
  holiday: 3,
};

/** 손 없는 날 — 이사에서만 크게 반영한다 */
export const SON_SCORE: Record<GoodDayPurpose, number> = {
  move: 20,
  // 계약·고백·결혼에서는 손 없는 날을 최고의 날로 취급하지 않는다.
  // 민간에서 이사·집수리에 쓰던 셈법이라 보조 정보로만 둔다.
  contract: 3,
  confession: 0,
  wedding: 3,
};

/**
 * 살(煞) — 전통적으로 큰일을 피하는 날. 목적이 무거울수록 크게 본다.
 *
 * ⚠ 감점 폭은 전통 자료가 정해 준 값이 아니라 수호부가 정한 무게다.
 *   표(어떤 날이 해당하는가)는 출처가 있지만, 몇 점을 뺄지는 해석이다.
 */
export const SAL_SCORE: Record<GoodDayPurpose, number> = {
  wedding: -18,
  move: -10,
  contract: -10,
  confession: -5,
};

/** 살 종류별 무게 배수 — 위 목적별 점수에 곱한다 */
export const SAL_WEIGHT = {
  wolgiil: 1,
  gochoil: 1,
  /** 십악대패일은 택일에서 가장 무겁게 보는 축이다 */
  sipakDaepae: 1.4,
  /** 살부대기월은 원전 미확인 통용표라 무게를 낮춰 잡는다 */
  salbuDaegiwol: 0.8,
};

/** 신부 띠의 대리월(大利月)에 드는 달 — 혼인에만 쓰는 가점 */
export const DAERIWOL_SCORE = 12;

/** 추천 등급을 가르는 점수 경계 */
export const TIER_THRESHOLD = {
  best: 70,
  fine: 55,
};

/**
 * 결혼 택일 — 두 사람 점수를 합치는 방식.
 * 한 사람에게만 높은 날보다 둘 다 무리가 적은 날을 앞세우기 위해
 * 평균과 최저점을 함께 본다.
 */
export const WEDDING_BLEND = {
  averageWeight: 0.5,
  minWeight: 0.5,
  /** 둘 중 한 명이라도 강한 충이면 추가 감점 */
  eitherChungPenalty: -15,
};

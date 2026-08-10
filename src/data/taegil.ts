// ============================================================
// 택일(擇日) — 나의 사주와 그날의 일진(日辰)을 맞춰 좋은 날 고르기
//
// 전통 택일 관습을 참고한 참고용 정보다. 단정하지 않는다.
//  · 천간합: 일간 ↔ 일진 천간 (갑기·을경·병신·정임·무계)
//  · 지지 육합/삼합/충: 일지 ↔ 일진 지지
//  · 천을귀인·문창귀인: 일간 기준 그날 지지
//  · 용신/기신: 일진 지지 오행 대입
//  · 목적별 가점: 이사(역마) · 계약(재성) · 개업(식상·재성)
//               · 고백(육합·도화) · 시험(문창)
// ============================================================

import {
  getSaju,
  CHEONGAN,
  JIJI,
  type SajuResult,
  type CheonGan,
  type JiJi,
} from './saju';
import { GEUK, SAENG, type YongsinResult } from './yongsin';

export type TaegilPurpose =
  | '전체'
  | '이사'
  | '계약·매매'
  | '개업·시작'
  | '고백·만남'
  | '시험·면접';

export const TAEGIL_PURPOSES: TaegilPurpose[] = [
  '전체', '이사', '계약·매매', '개업·시작', '고백·만남', '시험·면접',
];

export type DayLevel = 'best' | 'good' | 'normal' | 'careful';

export const LEVEL_LABEL: Record<DayLevel, string> = {
  best: '아주 좋은 날',
  good: '좋은 날',
  normal: '무난한 날',
  careful: '쉬어가는 날',
};

export interface DayRating {
  date: Date;
  iljinGan: CheonGan;
  iljinJi: JiJi;
  score: number;
  level: DayLevel;
  /** 좋은/조심 이유 (짧은 한글 문구) */
  reasons: string[];
}

// ─── 조견표 ────────────────────────────────────────────────

/** 천간합 쌍 (index): 갑기 을경 병신 정임 무계 */
const GAN_HAP: [number, number][] = [
  [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
];

/** 지지 육합 (index): 자축 인해 묘술 진유 사신 오미 */
const JI_YUKHAP: [number, number][] = [
  [0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7],
];

/** 지지 충 (index): 자오 축미 인신 묘유 진술 사해 */
const JI_CHUNG: [number, number][] = [
  [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11],
];

/** 삼합 그룹: 지지 index → 그룹 (0 신자진 / 1 인오술 / 2 사유축 / 3 해묘미) */
const SAMHAP_GROUP: number[] = [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3];

/** 삼합 그룹 → 역마/도화 지지 index */
const YEOKMA_OF_GROUP = [2, 8, 11, 5];
const DOHWA_OF_GROUP = [9, 3, 6, 0]; // 신자진→유, 인오술→묘, 사유축→오, 해묘미→자

/** 천을귀인 — 일간 index → 지지 index 목록 */
const CHEONEUL: Record<number, number[]> = {
  0: [1, 7], 1: [0, 8], 2: [11, 9], 3: [11, 9], 4: [1, 7],
  5: [0, 8], 6: [1, 7], 7: [2, 6], 8: [5, 3], 9: [5, 3],
};

/** 문창귀인 — 일간 index → 지지 index */
const MUNCHANG: Record<number, number> = {
  0: 5, 1: 6, 2: 8, 3: 9, 4: 8, 5: 9, 6: 11, 7: 0, 8: 2, 9: 3,
};

const isPair = (pairs: [number, number][], a: number, b: number) =>
  pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

// ─── 메인 ──────────────────────────────────────────────────

export function getDayRating(
  mySaju: SajuResult,
  yongsin: YongsinResult,
  date: Date,
  purpose: TaegilPurpose
): DayRating {
  const iljin = getSaju(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    12
  );
  const dGan = iljin.dayStem;
  const dJi = iljin.dayBranch;

  const myGanIdx = CHEONGAN.indexOf(mySaju.dayStem);
  const myJiIdx = JIJI.indexOf(mySaju.dayBranch);
  const yeonjiIdx = JIJI.indexOf(mySaju.yearBranch);
  const dGanIdx = CHEONGAN.indexOf(dGan);
  const dJiIdx = JIJI.indexOf(dJi);

  let score = 0;
  const reasons: string[] = [];

  // 천간합 — 마음이 통하는 날
  if (isPair(GAN_HAP, myGanIdx, dGanIdx)) {
    score += 2;
    reasons.push('내 일간과 그날의 천간이 합(合) — 마음이 통하는 날이에요');
  }

  // 지지 육합 — 인연이 맺어지는 날
  const yukhap = isPair(JI_YUKHAP, myJiIdx, dJiIdx);
  if (yukhap) {
    score += 2;
    reasons.push('내 일지와 그날의 지지가 육합(六合) — 인연이 맺어지기 좋은 날이에요');
  }

  // 지지 삼합 — 같은 국이면 순풍
  const samhap =
    myJiIdx !== dJiIdx && SAMHAP_GROUP[myJiIdx] === SAMHAP_GROUP[dJiIdx];
  if (samhap) {
    score += 1.5;
    reasons.push('내 일지와 삼합(三合)을 이루는 날 — 흐름이 순조로워요');
  }

  // 지지 충 — 부딪히기 쉬운 날
  const chung = isPair(JI_CHUNG, myJiIdx, dJiIdx);
  if (chung) {
    score -= 2.5;
    reasons.push('내 일지와 충(沖)이 되는 날 — 부딪히기 쉬우니 큰일은 쉬어가요');
  }

  // 천을귀인 — 귀인이 돕는 날
  if ((CHEONEUL[myGanIdx] ?? []).includes(dJiIdx)) {
    score += 2;
    reasons.push('천을귀인(天乙貴人)이 드는 날 — 귀인이 돕는 날이에요');
  }

  // 용신/기신
  if (dJi.oheng === yongsin.yongsin) {
    score += 1.5;
    reasons.push(`나에게 필요한 ${yongsin.yongsin} 기운이 들어오는 날이에요`);
  } else if (dJi.oheng === yongsin.gisin) {
    score -= 1;
    reasons.push('부담이 되는 기운이 드는 날 — 무리하지 않으면 충분해요');
  }

  // 복음(伏吟) — 내 일주와 같은 간지
  if (myGanIdx === dGanIdx && myJiIdx === dJiIdx) {
    score -= 0.5;
    reasons.push('내 일주와 똑같은 날(복음) — 제자리걸음 느낌이 들 수 있어요');
  }

  // ── 목적별 가점 ──
  const jaeseong = GEUK[mySaju.dayStem.oheng]; // 재성 — 내가 다루는 오행
  const siksang = SAENG[mySaju.dayStem.oheng]; // 식상 — 내가 만들어내는 오행

  if (purpose === '이사') {
    const yeokma = new Set([
      YEOKMA_OF_GROUP[SAMHAP_GROUP[yeonjiIdx]],
      YEOKMA_OF_GROUP[SAMHAP_GROUP[myJiIdx]],
    ]);
    if (yeokma.has(dJiIdx)) {
      score += 1;
      reasons.push('역마(驛馬)가 드는 날 — 이동·이사와 결이 잘 맞아요');
    }
    if (chung) {
      score -= 1;
      reasons.push('이사는 충이 드는 날을 특히 피하는 게 관례예요');
    }
  } else if (purpose === '계약·매매') {
    if (dJi.oheng === jaeseong) {
      score += 1.5;
      reasons.push('재성(내가 다루는 기운)이 드는 날 — 계약·거래에 좋아요');
    }
  } else if (purpose === '개업·시작') {
    if (dJi.oheng === siksang || dJi.oheng === jaeseong) {
      score += 1;
      reasons.push('만들고 거두는 기운이 드는 날 — 새 시작과 결이 맞아요');
    }
  } else if (purpose === '고백·만남') {
    if (yukhap) {
      score += 1;
      reasons.push('육합이 드는 날은 마음이 이어지기 특히 좋아요');
    }
    if (DOHWA_OF_GROUP[SAMHAP_GROUP[myJiIdx]] === dJiIdx) {
      score += 1;
      reasons.push('도화(桃花)가 드는 날 — 매력이 살아나는 날이에요');
    }
  } else if (purpose === '시험·면접') {
    if (MUNCHANG[myGanIdx] === dJiIdx) {
      score += 1.5;
      reasons.push('문창귀인(文昌貴人)이 드는 날 — 시험·면접에 힘이 실려요');
    }
  }

  const level: DayLevel =
    score >= 4 ? 'best' : score >= 2 ? 'good' : score > -1.5 ? 'normal' : 'careful';

  if (reasons.length === 0) {
    reasons.push('특별한 합도 충도 없는 담백한 날 — 평소의 리듬이면 충분해요');
  }

  return { date, iljinGan: dGan, iljinJi: dJi, score, level, reasons };
}

/** 한 달치 등급 계산 */
export function getMonthRatings(
  mySaju: SajuResult,
  yongsin: YongsinResult,
  year: number,
  month: number, // 1-12
  purpose: TaegilPurpose
): DayRating[] {
  const days = new Date(year, month, 0).getDate();
  const out: DayRating[] = [];
  for (let d = 1; d <= days; d++) {
    out.push(getDayRating(mySaju, yongsin, new Date(year, month - 1, d), purpose));
  }
  return out;
}

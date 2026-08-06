// ============================================================
// 궁합 (宮合) — 두 사람의 인연 읽기 엔진
// ------------------------------------------------------------
// 전통 근거 (사주 자료 §7 합충형파해):
//   · 천간합 5합  — 갑기合토 · 을경合금 · 병신合수 · 정임合목 · 무계合화
//   · 지지육합 6합 — 자축 · 인해 · 묘술 · 진유 · 사신 · 오미
//   · 삼합 4국    — 인오술(화) · 사유축(금) · 신자진(수) · 해묘미(목)
//   · 지지충 6충  — 자오 · 축미 · 인신 · 묘유 · 진술 · 사해
//   · 오행 상생/상극 (두 일간 사이)
//   · 용신 보완   — 내게 필요한 기운을 상대가 넉넉히 지닌 경우 (최고 신호)
//
// 철학: 점수는 50~99 — 절망 점수는 없다. 충(沖)도 "부딪히는 만큼
// 서로를 바꾸는 힘"으로 다시 읽는다. '안 맞는다'는 말은 쓰지 않는다.
// 궁합의 끝은 언제나 "두 사람을 위한 부적" 하나로 모인다.
// ============================================================

import {
  getSaju,
  CHEONGAN,
  JIJI,
  getOheng,
  type SajuResult,
  type Oheng,
  type CheonGan,
  type JiJi,
} from './saju';
import { getYongsin, SAENG, GEUK } from './yongsin';
import { OHENG_INFO } from './saju-interpretation';
import { getTalismanById, TALISMANS, type TalismanType } from './talismans';

// ─── 입력/출력 타입 ─────────────────────────────────────────

export interface GunghapPerson {
  birth: { year: number; month: number; day: number; hour: number };
  name?: string;
}

export interface GunghapInput {
  a: GunghapPerson;
  b: GunghapPerson;
}

export type GunghapAspectKind =
  | 'ilgan-oheng'
  | 'ji-yukhap'
  | 'ji-samhap'
  | 'ji-chung'
  | 'cheongan-hap'
  | 'yongsin-complement'
  | 'animal';

export interface GunghapAspect {
  kind: GunghapAspectKind;
  /** 점수 기여분 — 충(沖)은 살짝 음수지만 detail 은 긍정적으로 재해석 */
  score: number;
  title: string;
  detail: string;
}

export type GunghapGrade =
  | '천생연분'
  | '서로 밝혀주는 사이'
  | '맞춰가는 재미'
  | '다름이 동력';

export interface GunghapResult {
  /** 50~99 — 절망 점수는 없다 */
  score: number;
  grade: GunghapGrade;
  /** 의미 있는 순서로 정렬된 상위 4~6개 */
  aspects: GunghapAspect[];
  /** 따뜻한 한 문단 요약 */
  summary: string;
  /** 두 사람을 위한 부적 */
  sharedTalisman: { talisman: TalismanType; reason: string };
}

// ─── 전통 조견표 ────────────────────────────────────────────

/** 천간합 5합 — (i, (i+5)%10). 결과 오행과 전통 별칭 */
const CHEONGAN_HAP: Record<
  number,
  { pair: [number, number]; oheng: Oheng; alias: string; keyword: string }
> = {
  0: { pair: [0, 5], oheng: '토', alias: '중정지합(中正之合)', keyword: '신의와 중용' },
  1: { pair: [1, 6], oheng: '금', alias: '인의지합(仁義之合)', keyword: '의리와 강직' },
  2: { pair: [2, 7], oheng: '수', alias: '위엄지합(威嚴之合)', keyword: '품격과 절제' },
  3: { pair: [3, 8], oheng: '목', alias: '정임지합(丁壬之合)', keyword: '정감과 예술성' },
  4: { pair: [4, 9], oheng: '화', alias: '무계지합(戊癸之合)', keyword: '담백한 끌림' },
};

/** 두 천간이 천간합인지 → 합 정보 반환 */
function findCheonganHap(a: CheonGan, b: CheonGan) {
  const ai = CHEONGAN.indexOf(a);
  const bi = CHEONGAN.indexOf(b);
  if ((ai + 5) % 10 === bi || (bi + 5) % 10 === ai) {
    return CHEONGAN_HAP[Math.min(ai, bi) % 5];
  }
  return null;
}

/** 지지육합 6합 — 지지 index 쌍 */
const JI_YUKHAP: [number, number][] = [
  [0, 1], // 자축
  [2, 11], // 인해
  [3, 10], // 묘술
  [4, 9], // 진유
  [5, 8], // 사신
  [6, 7], // 오미
];

function isYukhap(a: JiJi, b: JiJi): boolean {
  const ai = JIJI.indexOf(a);
  const bi = JIJI.indexOf(b);
  return JI_YUKHAP.some(
    ([x, y]) => (x === ai && y === bi) || (x === bi && y === ai)
  );
}

/** 삼합 4국 — [지지 index 3개, 국(局) 오행] */
const SAMHAP_GROUPS: { members: number[]; guk: Oheng; name: string }[] = [
  { members: [2, 6, 10], guk: '화', name: '인오술(寅午戌) 화국' },
  { members: [5, 9, 1], guk: '금', name: '사유축(巳酉丑) 금국' },
  { members: [8, 0, 4], guk: '수', name: '신자진(申子辰) 수국' },
  { members: [11, 3, 7], guk: '목', name: '해묘미(亥卯未) 목국' },
];

function findSamhap(a: JiJi, b: JiJi) {
  const ai = JIJI.indexOf(a);
  const bi = JIJI.indexOf(b);
  if (ai === bi) return null;
  return (
    SAMHAP_GROUPS.find(
      (g) => g.members.includes(ai) && g.members.includes(bi)
    ) ?? null
  );
}

/** 지지충 6충 — (i, (i+6)%12) */
function isChung(a: JiJi, b: JiJi): boolean {
  const ai = JIJI.indexOf(a);
  const bi = JIJI.indexOf(b);
  return (ai + 6) % 12 === bi;
}

// ─── 오행 → 두 사람을 위한 부적 (용신 보완 시) ──────────────
// 부부가 함께 지니기 좋은, 그 기운을 대표하는 부적
const OHENG_SHARED_TALISMAN: Record<Oheng, { id: string; reason: string }> = {
  목: {
    id: 'wealth-05', // 개업대길부 — 새 시작·성장
    reason:
      '두 사람 사이에 목(木)의 기운이 오가며, 함께 무언가를 새로 시작하고 키워가는 힘이 됩니다. 새 출발의 기운을 담은 부적을 함께 지녀보세요.',
  },
  화: {
    id: 'wealth-01', // 초복부 — 따뜻한 복
    reason:
      '두 사람 사이에 화(火)의 따뜻한 기운이 오갑니다. 그 온기가 흩어지지 않고 복으로 쌓이도록, 복을 불러들이는 부적을 함께 지녀보세요.',
  },
  토: {
    id: 'family-02', // 화목부 — 가정의 안정
    reason:
      '두 사람 사이에 토(土)의 든든한 기운이 오갑니다. 그 안정감이 두 사람의 터전이 되도록, 화목의 부적을 함께 지녀보세요.',
  },
  금: {
    id: 'protect-04', // 호신부 — 서로를 지킴
    reason:
      '두 사람 사이에 금(金)의 단단한 기운이 오갑니다. 서로가 서로의 방패가 되어주는 인연이니, 지켜주는 부적을 함께 지녀보세요.',
  },
  수: {
    id: 'health-03', // 수명장수부 — 오래 함께
    reason:
      '두 사람 사이에 수(水)의 깊고 잔잔한 기운이 오갑니다. 오래도록 함께 건강하기를 바라는 부적을 함께 지녀보세요.',
  },
};

// ─── 이름 헬퍼 ─────────────────────────────────────────────

function personLabel(p: GunghapPerson, fallback: string): string {
  const n = (p.name ?? '').trim();
  return n ? `${n}님` : fallback;
}

/** 받침 유무에 따라 '와/과' 조사를 붙인다 */
function wa(word: string): string {
  const last = word.charCodeAt(word.length - 1);
  if (last >= 0xac00 && last <= 0xd7a3) {
    return word + ((last - 0xac00) % 28 === 0 ? '와' : '과');
  }
  return word + '와';
}

// ─── 본 엔진 ───────────────────────────────────────────────

/** 상대 사주 8글자에서 특정 오행이 몇 글자인지 센다 */
function countOheng(saju: SajuResult, oheng: Oheng): number {
  const els: Oheng[] = [
    saju.yearStem.oheng,
    saju.yearBranch.oheng,
    saju.monthStem.oheng,
    saju.monthBranch.oheng,
    saju.dayStem.oheng,
    saju.dayBranch.oheng,
    saju.hourStem.oheng,
    saju.hourBranch.oheng,
  ];
  return els.filter((e) => e === oheng).length;
}

function gradeOf(score: number): GunghapGrade {
  if (score >= 88) return '천생연분';
  if (score >= 76) return '서로 밝혀주는 사이';
  if (score >= 64) return '맞춰가는 재미';
  return '다름이 동력';
}

/**
 * 궁합 산출 — 두 사람의 사주를 합충·오행·용신으로 읽는다.
 *
 * 점수 철학: 기본 60점에서 합(合)이 더하고 충(沖)이 조금 덜어내되,
 * 충의 해석은 언제나 "그만큼 서로를 바꾸는 힘"으로 긍정 재해석한다.
 * 최종 점수는 50~99 사이 — 인연에 낙제점은 없다.
 */
export function getGunghap(input: GunghapInput): GunghapResult {
  const { a, b } = input;
  const sajuA = getSaju(a.birth.year, a.birth.month, a.birth.day, a.birth.hour);
  const sajuB = getSaju(b.birth.year, b.birth.month, b.birth.day, b.birth.hour);
  const nameA = personLabel(a, '나');
  const nameB = personLabel(b, '상대');

  const aspects: GunghapAspect[] = [];
  let score = 60;
  let hasChung = false;
  let complementOheng: Oheng | null = null;

  // ── 1. 일간 천간합 — 두 사람의 '나'가 서로 끌어당기는 합 ──
  const ilganHap = findCheonganHap(sajuA.dayStem, sajuB.dayStem);
  if (ilganHap) {
    const gained = 12;
    score += gained;
    aspects.push({
      kind: 'cheongan-hap',
      score: gained,
      title: '일간이 서로를 끌어당기는 천간합',
      detail: `${sajuA.dayStem.name}(${sajuA.dayStem.hanja})과 ${sajuB.dayStem.name}(${sajuB.dayStem.hanja})은 ${ilganHap.alias} — ${ilganHap.keyword}으로 맺어지는 합이에요. 두 사람의 중심 글자가 자석처럼 서로를 향해 있는, 명리에서 손꼽는 인연의 신호입니다.`,
    });
  }

  // ── 2. 일간 오행 상생/상극 ──
  const ohA = sajuA.dayStem.oheng;
  const ohB = sajuB.dayStem.oheng;
  if (ohA === ohB) {
    score += 5;
    aspects.push({
      kind: 'ilgan-oheng',
      score: 5,
      title: '같은 결을 지닌 일간',
      detail: `두 사람 모두 ${ohA}(${OHENG_INFO[ohA].hanja})의 기운을 중심에 두고 있어요. 말하지 않아도 통하는 부분이 많고, 서로의 속도를 자연스럽게 이해하는 사이입니다.`,
    });
  } else if (SAENG[ohA] === ohB || SAENG[ohB] === ohA) {
    const giver = SAENG[ohA] === ohB ? nameA : nameB;
    const receiver = SAENG[ohA] === ohB ? nameB : nameA;
    score += 8;
    aspects.push({
      kind: 'ilgan-oheng',
      score: 8,
      title: '일간이 서로 돕는 사이',
      detail: `${ohA}(${OHENG_INFO[ohA].hanja})과 ${ohB}(${OHENG_INFO[ohB].hanja})은 상생(相生)의 흐름 — ${giver}의 기운이 ${receiver}를 자라게 해요. 한쪽이 물을 주면 한쪽이 꽃을 피우는, 순환이 좋은 인연입니다.`,
    });
  } else if (GEUK[ohA] === ohB || GEUK[ohB] === ohA) {
    score -= 3;
    aspects.push({
      kind: 'ilgan-oheng',
      score: -3,
      title: '서로 다른 결이라 배울 게 많은 사이',
      detail: `${ohA}(${OHENG_INFO[ohA].hanja})과 ${ohB}(${OHENG_INFO[ohB].hanja})은 서로를 다듬는 상극(相剋)의 관계예요. 가끔 팽팽할 수 있지만, 그만큼 혼자서는 못 볼 각도를 서로 보여주는 사이 — 다름이 곧 성장의 재료가 됩니다.`,
    });
  }

  // ── 3. 일지 (배우자궁) 합충 — 가장 밀접한 자리 ──
  const dayYukhap = isYukhap(sajuA.dayBranch, sajuB.dayBranch);
  const daySamhap = findSamhap(sajuA.dayBranch, sajuB.dayBranch);
  const dayChung = isChung(sajuA.dayBranch, sajuB.dayBranch);
  if (dayYukhap) {
    score += 10;
    aspects.push({
      kind: 'ji-yukhap',
      score: 10,
      title: '배우자 자리가 꼭 맞물리는 육합',
      detail: `${sajuA.dayBranch.name}(${sajuA.dayBranch.hanja})와 ${sajuB.dayBranch.name}(${sajuB.dayBranch.hanja})는 1:1로 꼭 맞물리는 육합(六合)이에요. 일지는 곁을 지키는 사람의 자리 — 그 자리가 서로를 향해 있으니, 함께 있을 때 가장 편안한 인연입니다.`,
    });
  } else if (daySamhap) {
    score += 9;
    aspects.push({
      kind: 'ji-samhap',
      score: 9,
      title: '한 뜻으로 뭉치는 삼합의 배우자 자리',
      detail: `두 사람의 일지가 ${daySamhap.name}을 이루는 짝이에요. 삼합은 서로 다른 글자가 하나의 목적으로 뭉치는 결합 — 함께 무언가를 도모할 때 ${daySamhap.guk}(${OHENG_INFO[daySamhap.guk].hanja})의 큰 힘이 만들어집니다.`,
    });
  } else if (dayChung) {
    hasChung = true;
    score -= 6;
    aspects.push({
      kind: 'ji-chung',
      score: -6,
      title: '부딪히며 서로를 여는 자리',
      detail: `${sajuA.dayBranch.name}(${sajuA.dayBranch.hanja})와 ${sajuB.dayBranch.name}(${sajuB.dayBranch.hanja})는 정면으로 마주 보는 충(沖)이에요. 부딪힐 수 있지만 그만큼 서로를 바꾸는 힘이 강한 인연 — 명리에서 충은 '막힌 것을 여는 힘'이기도 해요. 서로의 닫힌 문을 열어주는 사이입니다.`,
    });
  }

  // ── 4. 띠 궁합 (년지) ──
  const yearSamhap = findSamhap(sajuA.yearBranch, sajuB.yearBranch);
  const yearYukhap = isYukhap(sajuA.yearBranch, sajuB.yearBranch);
  const yearChung = isChung(sajuA.yearBranch, sajuB.yearBranch);
  const aniA = `${sajuA.yearBranch.animal}띠${sajuA.yearBranch.emoji}`;
  const aniB = `${sajuB.yearBranch.animal}띠${sajuB.yearBranch.emoji}`;
  if (yearSamhap) {
    score += 8;
    aspects.push({
      kind: 'ji-samhap',
      score: 8,
      title: '삼합으로 뭉치는 띠 궁합',
      detail: `${aniA}와 ${aniB}는 ${yearSamhap.name}의 한 식구예요. 예로부터 삼합 띠끼리는 '같은 배를 탄 인연'이라 하여 최고의 띠 궁합으로 꼽았습니다.`,
    });
  } else if (yearYukhap) {
    score += 7;
    aspects.push({
      kind: 'ji-yukhap',
      score: 7,
      title: '은근히 끌리는 육합 띠',
      detail: `${aniA}와 ${aniB}는 육합(六合)으로 묶이는 짝이에요. 겉으로 요란하지 않아도 곁에 두면 마음이 놓이는, 밀착도가 높은 띠 궁합입니다.`,
    });
  } else if (yearChung) {
    hasChung = true;
    score -= 5;
    aspects.push({
      kind: 'ji-chung',
      score: -5,
      title: '서로를 흔들어 깨우는 띠',
      detail: `${aniA}와 ${aniB}는 마주 보는 충(沖)의 자리예요. 성향이 반대라 처음엔 낯설 수 있지만, 반대이기에 서로에게 없는 것을 정확히 채워줄 수 있어요. 부딪힘을 대화로 바꾸면 누구보다 단단해지는 조합입니다.`,
    });
  } else {
    aspects.push({
      kind: 'animal',
      score: 3,
      title: `${aniA} × ${aniB}`,
      detail: `${aniA}와 ${aniB}는 서로를 밀지도 당기지도 않는 담백한 사이예요. 정해진 틀이 없는 만큼, 두 사람이 만들어가는 대로 관계의 모양이 정해집니다.`,
    });
    score += 3;
  }

  // ── 5. 용신 보완 — 내게 필요한 기운을 상대가 지녔는가 (최고 신호) ──
  const yongsinA = getYongsin(sajuA, getOheng(sajuA));
  const yongsinB = getYongsin(sajuB, getOheng(sajuB));
  const bFillsA = countOheng(sajuB, yongsinA.yongsin); // B가 지닌 A의 용신 글자 수
  const aFillsB = countOheng(sajuA, yongsinB.yongsin);
  const B_FILLS = bFillsA >= 2;
  const A_FILLS = aFillsB >= 2;

  if (B_FILLS && A_FILLS) {
    score += 14;
    complementOheng = yongsinA.yongsin;
    aspects.push({
      kind: 'yongsin-complement',
      score: 14,
      title: '서로의 빈 곳을 채워주는 인연',
      detail: `${nameA}에게 필요한 ${yongsinA.yongsin}(${OHENG_INFO[yongsinA.yongsin].hanja}) 기운을 ${nameB}가 넉넉히 지녔고, ${nameB}에게 필요한 ${yongsinB.yongsin}(${OHENG_INFO[yongsinB.yongsin].hanja}) 기운은 ${nameA}가 품고 있어요. 함께 있는 것만으로 서로의 부족함이 메워지는, 명리에서 가장 귀하게 보는 상호 보완의 인연입니다.`,
    });
  } else if (B_FILLS || A_FILLS) {
    const filled = B_FILLS ? nameA : nameB;
    const filler = B_FILLS ? nameB : nameA;
    const oh = B_FILLS ? yongsinA.yongsin : yongsinB.yongsin;
    complementOheng = oh;
    score += 8;
    aspects.push({
      kind: 'yongsin-complement',
      score: 8,
      title: '필요한 기운을 건네주는 사람',
      detail: `${filled}의 사주에 꼭 필요한 ${oh}(${OHENG_INFO[oh].hanja}) 기운을 ${filler}가 넉넉히 지니고 있어요. 곁에 있는 것만으로 ${filled}의 기운이 순해지는 — 존재 자체가 보약이 되는 사이입니다.`,
    });
  }

  // ── 마무리: 점수·등급·정렬 ──
  score = Math.max(50, Math.min(99, Math.round(score)));
  const grade = gradeOf(score);

  // 의미 큰 순서로 정렬 (기여 절댓값 기준), 상위 6개
  const sorted = [...aspects].sort((x, y) => Math.abs(y.score) - Math.abs(x.score));
  const topAspects = sorted.slice(0, 6);

  // ── 요약 문단 ──
  const summary = buildSummary(grade, topAspects, hasChung, nameA, nameB);

  // ── 두 사람을 위한 부적 ──
  const sharedTalisman = pickSharedTalisman(hasChung, complementOheng);

  return { score, grade, aspects: topAspects, summary, sharedTalisman };
}

// ─── 요약 문단 ─────────────────────────────────────────────

function buildSummary(
  grade: GunghapGrade,
  aspects: GunghapAspect[],
  hasChung: boolean,
  nameA: string,
  nameB: string
): string {
  const best = aspects.find((a) => a.score > 0);
  const opening: Record<GunghapGrade, string> = {
    천생연분: `${wa(nameA)} ${nameB}의 여덟 글자는 여러 자리에서 서로를 향해 맞물려 있어요. 옛사람들이 '하늘이 맺어준 짝'이라 부르던 모양에 가깝습니다.`,
    '서로 밝혀주는 사이': `${wa(nameA)} ${nameB}의 사주는 서로의 좋은 면을 끌어내는 방향으로 흐르고 있어요. 함께 있을 때 각자 혼자일 때보다 조금 더 밝아지는 인연입니다.`,
    '맞춰가는 재미': `${wa(nameA)} ${nameB}는 닮은 구석과 다른 구석을 골고루 지닌 짝이에요. 처음부터 완성된 그림이 아니라, 맞춰갈수록 그림이 좋아지는 인연입니다.`,
    '다름이 동력': `${wa(nameA)} ${nameB}는 결이 꽤 다른 두 사람이에요. 하지만 명리에서 다름은 끝이 아니라 동력 — 서로 다른 결이라 배울 게 많고, 그만큼 함께 넓어질 수 있는 사이입니다.`,
  };
  let text = opening[grade];
  if (best) {
    text += ` 특히 「${best.title}」의 기운이 두 사람을 이어주는 가장 큰 힘이에요.`;
  }
  if (hasChung) {
    text +=
      ' 부딪히는 자리도 있지만, 충(沖)은 막힌 것을 여는 힘이기도 해요. 부딪힘을 미워하지 말고 대화의 문으로 삼으면, 그 자리가 오히려 두 사람을 가장 깊이 이어주는 통로가 됩니다.';
  } else {
    text +=
      ' 서로의 속도를 존중하며 걸어가면, 시간이 지날수록 더 잘 맞물리는 인연이 될 거예요.';
  }
  return text;
}

// ─── 두 사람을 위한 부적 선택 ───────────────────────────────

function pickSharedTalisman(
  hasChung: boolean,
  complementOheng: Oheng | null
): { talisman: TalismanType; reason: string } {
  // 1) 충이 있으면 — 화합의 부적으로 부딪힘을 감싼다
  if (hasChung) {
    const t = getTalismanById('family-01') ?? TALISMANS[0]; // 부부화합부
    return {
      talisman: t,
      reason:
        '두 사람 사이에 부딪히는 자리(충)가 있어요. 부딪힘은 서로를 바꾸는 힘이지만, 그 힘이 다치지 않고 흐르도록 화합의 기운을 곁에 두면 좋아요. 예로부터 연인·부부가 함께 지니던 화합의 부적을 권해드립니다.',
    };
  }
  // 2) 용신 보완이 있으면 — 오가는 그 기운을 북돋는 부적
  if (complementOheng) {
    const pick = OHENG_SHARED_TALISMAN[complementOheng];
    const t = getTalismanById(pick.id) ?? getTalismanById('family-02')!;
    return { talisman: t, reason: pick.reason };
  }
  // 3) 기본 — 화목부
  const t = getTalismanById('family-02') ?? TALISMANS[0]; // 화목부
  return {
    talisman: t,
    reason:
      '가화만사성(家和萬事成) — 화목한 기운은 모든 좋은 일의 바탕이 됩니다. 두 사람이 함께 지니며 서로의 평안을 빌어주기 좋은 부적이에요.',
  };
}

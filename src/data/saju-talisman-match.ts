// ============================================================
// 사주(四柱) 기반 부적 추천 엔진
// ------------------------------------------------------------
// 대화 키워드만 보고 고르는 것이 아니라, 사용자의 사주 원국
// (용신 · 오행 분포 · 일간 · 띠 · 삼재)을 읽어 43종 전통 부적 중에서
// "지금 이 사람에게 필요한 부적"을 골라준다.
//
// 원칙
//  1. 순수 함수 — localStorage·Date.now() 등 외부 상태에 접근하지 않는다.
//     (오늘의 부적도 호출자가 넘긴 date 로만 계산한다)
//  2. 부적은 반드시 talismans.ts 의 43종 안에서만 고른다.
//  3. 겁주지 않는다 — 약점은 "여기를 채우면 더 편해져요" 로 말한다.
//  4. 단정하지 않는다 — "반드시 ~된다" 같은 적중 표현을 쓰지 않는다.
//  5. 전문용어(삼재·오행·일간 등)는 괄호로 한자와 함께 풀어 쓴다.
//
// 추천의 1순위 근거는 용신(用神, yongsin.ts)이다.
// ------------------------------------------------------------
// 왜 "개수가 적은 오행" 이 아니라 용신인가
//   글자 수만 세면 "적으니까 부족하다" 는 결론밖에 나오지 않는다.
//   명리에서는 적어도 지금 필요 없는 기운이 있고(예: 신약한 사주의 관성),
//   많아도 더 필요한 기운이 있다(예: 조후가 급한 사주의 화).
//   반대로 신강한 사주는 나를 도와주는 기운이 아무리 많아도
//   그것을 '덜어내야' 편해진다.
//   용신은 신강신약 · 조후 · 통관까지 따져 나온 결론이므로,
//   추천의 최상위 가중치를 용신에 둔다.
//   (용신 계산이 어떤 이유로든 실패하면 예전의 lacking/excess 규칙으로 물러난다)
//
// 오행 ↔ 부적 매핑의 근거 (전통 오방 상징)
//  | 오행 | 색 | 방위 | 상징            | 보강하는 영역          |
//  | 목   | 청 | 동   | 성장·발전·학습   | 학업, 새로운 시작       |
//  | 화   | 적 | 남   | 열정·확장·명예   | 재물, 사업, 벽사        |
//  | 토   | 황 | 중앙 | 안정·신뢰·중재   | 가정, 집터, 화합        |
//  | 금   | 백 | 서   | 결단·정의·수호   | 수호, 벽사, 결단        |
//  | 수   | 흑 | 북   | 지혜·유연·치유   | 건강, 학문, 정신안정    |
// ============================================================

import type { SajuResult, OhengScore, AnimalInfo, SamjaeResult, Oheng } from './saju';
import { OHENG_INFO, analyzeOheng } from './saju-interpretation';
import type { OhengAnalysis } from './saju-interpretation';
import {
  TALISMANS,
  TalismanCategory,
  getTalismanRecommendation,
} from './talismans';
import type { TalismanType } from './talismans';
import { getYongsin, getGyejeol } from './yongsin';
import type { YongsinResult, Gyejeol } from './yongsin';

// ============================================================
// 1. 공개 타입
// ============================================================

export type MatchReasonKind =
  | 'samjae' // 삼재년 — 최우선
  | 'yongsin' // 용신(用神) 오행 직결 — 최고 가중치
  | 'huisin' // 희신(喜神) 오행 — 용신을 뒤에서 밀어주는 기운
  | 'gisin' // 기신(忌神) 오행 — 지금은 조금 과한 기운 (감점)
  | 'singang' // 신강신약(身強身弱) 보완
  | 'lackingOheng' // (폴백) 부족한 오행 보강
  | 'excessOheng' // (폴백) 과다한 오행 제어
  | 'ilganTrait' // 일간 성격상 보완
  | 'animal' // 띠 수호
  | 'balance'; // 전반 균형

export interface MatchReason {
  kind: MatchReasonKind;
  /** 사용자에게 보여줄 설명 (초보자용, 전문용어는 괄호 풀이) */
  text: string;
  /** 내부 가중치 */
  weight: number;
}

export interface SajuTalismanMatch {
  talisman: TalismanType;
  score: number;
  reasons: MatchReason[];
  /** 카드에 표시할 한 줄 이유 */
  headline: string;
}

export interface SajuMatchInput {
  saju: SajuResult;
  oheng: OhengScore;
  animal: AnimalInfo;
  samjae: SamjaeResult;
  /**
   * 용신(用神) — 추천의 1순위 근거.
   * 넘기지 않으면 내부에서 getYongsin(saju, oheng) 으로 계산한다.
   * (이미 화면에서 계산해 둔 값이 있으면 그대로 넘겨 중복 계산을 피할 수 있다)
   */
  yongsin?: YongsinResult;
}

// ============================================================
// 2. 오행 상징 테이블
// ============================================================

/** 오행별 전통 상징 정보 (UI 설명에도 쓸 수 있게 공개) */
export interface OhengTalismanGuide {
  oheng: Oheng;
  hanja: string;
  /** 오방색 이름 */
  colorName: string;
  direction: string;
  /** 이 기운이 상징하는 것 */
  symbol: string;
  /** 이 기운이 보강하는 영역 */
  supports: string;
}

export const OHENG_TALISMAN_GUIDE: Record<Oheng, OhengTalismanGuide> = {
  목: {
    oheng: '목',
    hanja: '木',
    colorName: '청(靑)',
    direction: '동쪽',
    symbol: '성장 · 발전 · 학습',
    supports: '학업, 새로운 시작',
  },
  화: {
    oheng: '화',
    hanja: '火',
    colorName: '적(赤)',
    direction: '남쪽',
    symbol: '열정 · 확장 · 명예',
    supports: '재물, 사업, 벽사',
  },
  토: {
    oheng: '토',
    hanja: '土',
    colorName: '황(黃)',
    direction: '중앙',
    symbol: '안정 · 신뢰 · 중재',
    supports: '가정, 집터, 화합',
  },
  금: {
    oheng: '금',
    hanja: '金',
    colorName: '백(白)',
    direction: '서쪽',
    symbol: '결단 · 정의 · 수호',
    supports: '수호, 벽사, 결단',
  },
  수: {
    oheng: '수',
    hanja: '水',
    colorName: '흑(黑)',
    direction: '북쪽',
    symbol: '지혜 · 유연 · 치유',
    supports: '건강, 학문, 정신안정',
  },
};

/**
 * 오행이 보강하는 부적군.
 *  - categories : 그 기운이 대표하는 부적 카테고리 (가장 강한 연결)
 *  - ids        : 카테고리 밖이지만 그 기운의 성격에 맞는 개별 부적
 */
const OHENG_SUPPORT: Record<
  Oheng,
  { categories: TalismanCategory[]; ids: string[] }
> = {
  // 목(木) — 자라나는 기운. 배움과 첫걸음을 돕는다.
  목: {
    categories: [TalismanCategory.Study],
    ids: [
      'wealth-05', // 개업대길부 — 새 시작
      'other-05', // 택일부 — 좋은 날에 첫걸음
      'other-01', // 작명부 — 새 이름, 새 출발
    ],
  },
  // 화(火) — 밝게 퍼지는 기운. 재물·사업의 확장과 벽사를 돕는다.
  화: {
    categories: [TalismanCategory.Wealth],
    ids: [
      'protect-01', // 벽사부 — 붉은 양기(陽氣)
      'protect-08', // 경면주사부 — 주사(朱砂)의 기운
      'other-07', // 정승부 — 명예
    ],
  },
  // 토(土) — 가운데를 잡아주는 기운. 집과 가족을 안정시킨다.
  토: {
    categories: [TalismanCategory.Family],
    ids: [
      'protect-02', // 오방신장부 — 집터 안정
      'protect-07', // 부도옹부 — 흔들리지 않는 중심
      'health-03', // 수명장수부 — 오래 가는 안정
    ],
  },
  // 금(金) — 맺고 끊는 기운. 지키고 잘라내는 일을 돕는다.
  금: {
    categories: [TalismanCategory.Protection],
    ids: [
      'family-06', // 구설방지부 — 말을 막는 방패
      'family-07', // 잡인퇴거부 — 인연을 정리
      'other-08', // 도난방지부 — 재물 수호
    ],
  },
  // 수(水) — 깊이 흐르는 기운. 몸을 돌보고 마음을 가라앉힌다.
  수: {
    categories: [TalismanCategory.Health],
    ids: [
      'study-03', // 총명부 — 지혜
      'study-04', // 문창부 — 학문
      'study-05', // 집중부 — 정신 안정
    ],
  },
};

/** 상극(相剋) — 이 기운이 다스리는 기운 (목극토 · 토극수 · 수극화 · 화극금 · 금극목) */
const CONTROLS: Record<Oheng, Oheng> = {
  목: '토',
  토: '수',
  수: '화',
  화: '금',
  금: '목',
};

/** 상극(相剋) 역방향 — 이 기운을 다스려주는 기운 */
const CONTROLLED_BY: Record<Oheng, Oheng> = {
  토: '목',
  수: '토',
  화: '수',
  금: '화',
  목: '금',
};

// ============================================================
// 3. 오행 색 판별
// ============================================================

/**
 * 부적 색 표기(한글)에서 읽어낼 오방색 단서.
 * inkColor / paperColor 는 대부분 '주사(朱砂) 붉은색' · '황지(黃紙)' 라는
 * 공통 기본값이라 그대로 쓰면 변별력이 없다. 기본값은 제외하고
 * "그 부적만의 색"만 본다.
 */
const COLOR_WORDS: Record<Oheng, string[]> = {
  목: ['청', '푸른', '초록', '녹색', '연둣'],
  화: ['적', '붉', '홍', '주사', '진사'],
  토: ['황', '노란', '금색', '황금', '누런', '베이지', '흙빛'],
  금: ['백', '흰', '하얀', '은빛', '은색'],
  수: ['흑', '검', '먹색', '남색', '짙은 파랑'],
};

/** talismans.ts 의 공통 기본 색 표기 (변별력이 없어 색 가산에서 제외) */
const DEFAULT_INK = '주사(朱砂) 붉은색';
const DEFAULT_PAPER = '황지(黃紙)';

/** #RRGGBB → HSL (h 0-360, s·l 0-100) */
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: s * 100, l: l * 100 };
}

/** 색상값(hex)을 오방색 하나로 분류 */
function ohengOfHex(hex: string): Oheng | null {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  const { h, s, l } = hsl;
  if (l <= 18) return '수'; // 아주 어두운 색 → 흑(黑)
  if (s <= 12) return l >= 70 ? '금' : null; // 아주 밝은 무채색 → 백(白)
  if (h < 20 || h >= 335) return '화'; // 붉은색 → 적(赤)
  if (h < 70) return '토'; // 주황·노랑·흙빛 → 황(黃)
  if (h < 165) return '목'; // 초록 → 청(靑)
  return '수'; // 파랑·남색·보라 → 북방 물빛
}

/** 이 부적이 지닌 "고유한" 오방색들 */
function talismanColorOhengs(t: TalismanType): Set<Oheng> {
  const found = new Set<Oheng>();

  const texts: string[] = [];
  if (t.design.inkColor !== DEFAULT_INK) texts.push(t.design.inkColor);
  if (t.design.paperColor !== DEFAULT_PAPER) texts.push(t.design.paperColor);

  for (const text of texts) {
    (Object.keys(COLOR_WORDS) as Oheng[]).forEach((o) => {
      if (COLOR_WORDS[o].some((w) => text.includes(w))) found.add(o);
    });
  }

  // colors[0]·colors[1]은 모든 부적이 공유하는 주사/황지 색이라 건너뛴다.
  for (const hex of t.colors.slice(2)) {
    const o = ohengOfHex(hex);
    if (o) found.add(o);
  }

  return found;
}

// ============================================================
// 4. 일간(日干) 보완 매핑
// ============================================================

/**
 * 일간(日干, 태어난 날의 천간 = 나 자신)의 "돌보면 좋은 점"을
 * 부드럽게 받쳐주는 부적.
 * ILGAN_PROFILES[*].caution 의 내용을 부적으로 옮긴 것이다.
 */
const ILGAN_SUPPORT: Record<string, { ids: string[]; text: string }> = {
  갑: {
    ids: ['family-02', 'family-05'],
    text: '갑(甲) 일간은 한번 정한 방향을 굽히기 어려워요—사이를 부드럽게 풀어줍니다',
  },
  을: {
    ids: ['protect-07', 'family-06'],
    text: '을(乙) 일간은 주변에 맞추다 지칠 때가 있어요—내 중심을 지켜줍니다',
  },
  병: {
    ids: ['health-08', 'study-05'],
    text: '병(丙) 일간은 크게 타올랐다 금세 지치곤 해요—마음을 가라앉혀 줍니다',
  },
  정: {
    ids: ['family-05', 'health-08'],
    text: '정(丁) 일간은 서운함을 안에 오래 담아둬요—맺힌 마음을 풀어줍니다',
  },
  무: {
    ids: ['wealth-05', 'other-05'],
    text: '무(戊) 일간은 변화에 시간이 걸려요—새 흐름을 열어줍니다',
  },
  기: {
    ids: ['study-05', 'protect-07'],
    text: '기(己) 일간은 이것저것 다 품다 지칠 수 있어요—마음을 한곳에 모아줍니다',
  },
  경: {
    ids: ['family-02', 'family-05'],
    text: '경(庚) 일간은 말이 곧아 세게 전해질 수 있어요—관계를 따뜻하게 이어줍니다',
  },
  신: {
    ids: ['family-06', 'health-08'],
    text: '신(辛) 일간은 작은 말에도 오래 마음이 쓰여요—그 마음을 감싸줍니다',
  },
  임: {
    ids: ['study-05', 'study-04'],
    text: '임(壬) 일간은 관심이 여러 갈래로 흘러요—한곳에 물길을 모아줍니다',
  },
  계: {
    ids: ['study-05', 'protect-04'],
    text: '계(癸) 일간은 주변 기분에 쉽게 물들어요—나를 지키는 울타리가 되어줍니다',
  },
};

// ============================================================
// 5. 띠(十二支) 문양 매핑
// ============================================================

/**
 * 띠 동물이 부적 문양(design.symbols)에 실제로 등장하는지 볼 때 쓰는 표기들.
 * 오탐을 막기 위해 한자 단독 표기는 괄호 형태까지 포함한 것만 쓴다.
 */
const ANIMAL_SYMBOL_WORDS: Record<string, string[]> = {
  쥐: ['쥐'],
  소: ['소(牛)', '牛'],
  호랑이: ['호랑이'],
  토끼: ['토끼'],
  용: ['용', '龍'],
  뱀: ['뱀', '蛇'],
  말: ['말(馬)', '馬'],
  양: ['양(羊)', '羊'],
  원숭이: ['원숭이'],
  닭: ['닭'],
  개: ['개(犬)', '犬'],
  돼지: ['돼지'],
};

function hasAnimalSymbol(t: TalismanType, animalName: string): boolean {
  const words = ANIMAL_SYMBOL_WORDS[animalName];
  if (!words) return false;
  return t.design.symbols.some((s) => words.some((w) => s.includes(w)));
}

// ============================================================
// 6. 점수 상수 · 정렬 규칙
// ============================================================

const W = {
  /** 삼재년 → 삼재부 */
  samjae: 50,

  // ── 용신 기반 (1순위 근거) ───────────────────────────────
  /** 용신 오행을 대표하는 카테고리의 부적 */
  yongsinCategory: 40,
  /** 용신 오행의 결에 맞는 개별 부적 */
  yongsinId: 24,
  /** 희신 오행을 대표하는 카테고리의 부적 */
  huisinCategory: 20,
  /** 희신 오행의 결에 맞는 개별 부적 */
  huisinId: 12,
  /** 용신·희신 오행의 오방색까지 맞을 때의 가산 */
  yongsinColor: 10,
  /** 기신 오행의 부적 — 지금은 이미 넉넉한 기운이라 뒤로 미룬다 */
  gisin: -15,
  /**
   * 신강신약 보완 — 어느 방향으로 손보면 좋은지 "설명"만 덧붙인다.
   * 방향 자체는 이미 용신 점수에 반영돼 있어 중복 가산하지 않는다.
   */
  singang: 0,

  // ── 폴백 (용신 계산 실패 시에만 쓰인다) ──────────────────
  lackingCategory: 30,
  lackingId: 18,
  lackingColor: 10,
  excess: 15,

  ilgan: 20,
  animal: 10,
  balance: 8,
} as const;

/** 같은 점수일 때의 우선순위: 수호 > 건강 > 가정 > 재물 > 학업 > 기타 */
const CATEGORY_PRIORITY: Record<TalismanCategory, number> = {
  [TalismanCategory.Protection]: 0,
  [TalismanCategory.Health]: 1,
  [TalismanCategory.Family]: 2,
  [TalismanCategory.Wealth]: 3,
  [TalismanCategory.Study]: 4,
  [TalismanCategory.Other]: 5,
};

/**
 * headline 을 뽑을 때의 이유 우선순위.
 * 'gisin' 은 감점 근거라 카드 문구로는 쓰지 않는다.
 */
const REASON_PRIORITY: MatchReasonKind[] = [
  'samjae',
  'yongsin',
  'huisin',
  'lackingOheng',
  'ilganTrait',
  'singang',
  'excessOheng',
  'animal',
  'balance',
];

// ============================================================
// 7. 내부 계산
// ============================================================

/** `${오행}(${한자})` 표기 */
function ohengLabel(o: Oheng): string {
  return `${o}(${OHENG_INFO[o].hanja})`;
}

/** 마지막 한글 음절에 받침이 있는지 (한자·괄호가 뒤에 붙어도 읽는 소리 기준) */
function hasJongseong(word: string): boolean {
  for (let i = word.length - 1; i >= 0; i--) {
    const code = word.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      return (code - 0xac00) % 28 !== 0;
    }
  }
  return false;
}

/** 을/를 */
function eulReul(word: string): string {
  return word + (hasJongseong(word) ? '을' : '를');
}

/**
 * 부적이 해당 오행의 보강 대상인지 — 카테고리(강한 연결) 우선, 없으면 개별 지정.
 * 어느 층에 걸렸는지만 돌려주고, 점수는 호출자가 근거 종류에 맞춰 매긴다.
 */
function ohengSupportTier(
  t: TalismanType,
  o: Oheng
): 'category' | 'id' | null {
  const support = OHENG_SUPPORT[o];
  if (support.categories.includes(t.category)) return 'category';
  if (support.ids.includes(t.id)) return 'id';
  return null;
}

/** 부적이 해당 오행의 보강 대상인지 (폴백 경로용 점수) */
function ohengSupportPoints(t: TalismanType, o: Oheng): number {
  const tier = ohengSupportTier(t, o);
  if (tier === 'category') return W.lackingCategory;
  if (tier === 'id') return W.lackingId;
  return 0;
}

/** 삼재부 판별 — id 또는 이름으로 찾는다 */
function isSamjaeTalisman(t: TalismanType): boolean {
  return t.id === 'protect-06' || t.name === '삼재부';
}

/**
 * 한 기운이 "압도적으로" 많은지.
 * getOheng() 점수는 가장 많은 기운이 100이 되도록 환산된 상대 점수라,
 * 2등이 절반도 되지 않으면 한쪽으로 크게 쏠린 것으로 본다.
 */
function isDominantOverwhelming(score: OhengScore, dominant: Oheng): boolean {
  const others = (Object.keys(score) as Oheng[])
    .filter((o) => o !== dominant)
    .map((o) => score[o]);
  const runnerUp = others.length ? Math.max(...others) : 0;
  return score[dominant] >= 100 && runnerUp <= 50;
}

/** headline 을 만들 때 쓰는, "이 부적에 실제로 걸린" 근거들 */
interface HeadlineContext {
  /** 이 부적이 담고 있는 용신 오행 (없으면 null) */
  matchedYongsin: Oheng | null;
  /** 이 부적이 담고 있는 희신 오행 (없으면 null) */
  matchedHuisin: Oheng | null;
  /** 조후(調候)가 급한 사주일 때의 온도 방향 */
  johuUrgent: { needed: Oheng; season: Gyejeol } | null;
  /** 신강신약 등급 (중화면 null) */
  singangLevel: '극신강' | '신강' | '신약' | '극신약' | null;
  /** (폴백) 이 부적이 실제로 채워주는 기운 */
  matchedLacking: Oheng | null;
  /** (폴백) 이 부적이 실제로 다스려주는 기운 */
  tamedExcess: Oheng | null;
  /** 일간 표기 (예: '무(戊)') */
  ilgan: string;
  /** 띠 이름 (예: '개') */
  animal: string;
}

/** 조후가 급할 때의 카드 문구 — 없으면 null */
function johuHeadline(ctx: HeadlineContext): string | null {
  if (!ctx.johuUrgent) return null;
  const { needed, season } = ctx.johuUrgent;
  if (ctx.matchedYongsin !== needed) return null;
  if (needed === '화') return '차가운 사주에 온기를 더하는 부적';
  if (needed === '수')
    return `${season} 사주의 열기를 시원하게 식혀주는 부적`;
  return '흩어지기 쉬운 기운에 중심을 잡아주는 부적';
}

/** 이유 목록에서 카드용 한 줄 문구 만들기 */
function buildHeadline(reasons: MatchReason[], ctx: HeadlineContext): string {
  for (const kind of REASON_PRIORITY) {
    const hit = reasons.find((r) => r.kind === kind);
    if (!hit) continue;

    switch (kind) {
      case 'samjae':
        return '삼재(三災)의 해를 든든히 지켜주는 부적';
      case 'yongsin': {
        const johu = johuHeadline(ctx);
        if (johu) return johu;
        return ctx.matchedYongsin
          ? `용신 ${ohengLabel(ctx.matchedYongsin)}의 기운을 담은 부적`
          : '지금 가장 필요한 기운을 담은 부적';
      }
      case 'huisin':
        return ctx.matchedHuisin
          ? `용신을 뒤에서 밀어주는 ${ohengLabel(ctx.matchedHuisin)} 기운의 부적`
          : '지금 필요한 기운을 거들어주는 부적';
      case 'lackingOheng':
        return ctx.matchedLacking
          ? `부족한 ${ohengLabel(ctx.matchedLacking)} 기운을 채워주는 부적`
          : '지금 필요한 기운을 채워주는 부적';
      case 'ilganTrait':
        return `${ctx.ilgan} 일간(日干, 나 자신)의 결을 받쳐주는 부적`;
      case 'singang':
        return ctx.singangLevel === '신강' || ctx.singangLevel === '극신강'
          ? '넉넉한 힘을 부드럽게 덜어내주는 부적'
          : '여린 기운을 든든하게 채워주는 부적';
      case 'excessOheng':
        return ctx.tamedExcess
          ? `넘치는 ${ohengLabel(ctx.tamedExcess)} 기운을 다스려주는 부적`
          : '기운의 균형을 잡아주는 부적';
      case 'animal':
        return `${ctx.animal}띠를 지켜주는 문양이 담긴 부적`;
      case 'balance':
        return '지금의 균형을 오래 지켜주는 부적';
    }
  }
  return '지금의 나에게 마음 기대기 좋은 부적';
}

// ── 용신 기반 문구 조각 ─────────────────────────────────────

/** 조후가 급한 사주일 때 덧붙이는 온도 이야기 — 없으면 null */
function johuPhrase(yongsin: YongsinResult, season: Gyejeol): string | null {
  const { johu } = yongsin;
  if (johu.urgency !== 'high' || !johu.needed) return null;
  if (johu.needed === '화')
    return `${season}에 태어나 사주가 차가운 편인데, 이 부적이 온기를 더해줘요`;
  if (johu.needed === '수')
    return `${season}에 태어나 사주에 열기가 있는 편인데, 이 부적이 시원한 기운을 더해줘요`;
  return '기운이 흩어지기 쉬운 편인데, 이 부적이 가운데를 잡아줘요';
}

/** 신강·신약을 부적과 이어 설명하는 한 줄 — 중화면 null */
function singangPhrase(yongsin: YongsinResult): string | null {
  switch (yongsin.singang.level) {
    case '극신강':
    case '신강':
      return '힘이 넉넉한 사주라 그 기운을 부드럽게 덜어내면 좋아요(신강, 身強)—이 부적이 힘을 쓸 통로가 되어줍니다';
    case '신약':
    case '극신약':
      return '혼자 다 짊어지기보다 기대며 채우는 결이에요(신약, 身弱)—이 부적이 그 자리를 받쳐줍니다';
    default:
      return null;
  }
}

/** 부적 하나에 대한 사주 점수 · 이유 계산 */
function scoreTalisman(
  t: TalismanType,
  input: SajuMatchInput,
  analysis: OhengAnalysis,
  excess: Oheng | null,
  yongsin: YongsinResult | null,
  season: Gyejeol
): { score: number; reasons: MatchReason[]; headline: string } {
  const reasons: MatchReason[] = [];
  let score = 0;

  // 이 부적에 "실제로" 걸린 근거 — headline 문구를 정확히 쓰기 위해 기록한다.
  let matchedYongsin: Oheng | null = null;
  let matchedHuisin: Oheng | null = null;
  let matchedLacking: Oheng | null = null;
  let matchedLackingWeight = 0;
  let tamedExcess: Oheng | null = null;

  // ── 1. 삼재년 — 최우선 ──────────────────────────────────
  if (input.samjae.is && isSamjaeTalisman(t)) {
    const typeText = input.samjae.type ? `${input.samjae.type} 해예요. ` : '';
    reasons.push({
      kind: 'samjae',
      text: `${typeText}올해는 삼재(三災, 3년에 걸쳐 지나가는 조심하는 해)라 든든한 보호가 도움이 돼요`,
      weight: W.samjae,
    });
    score += W.samjae;
  }

  const colorOhengs = talismanColorOhengs(t);
  /** 이 부적이 "지금 필요한 기운" 을 실제로 담고 있는가 (balance 근거 판정용) */
  let needMatched = false;

  if (yongsin) {
    // ── 2. 용신(用神) — 지금 이 사람에게 가장 필요한 기운 ──
    const yTier = ohengSupportTier(t, yongsin.yongsin);
    if (yTier) {
      const base = yTier === 'category' ? W.yongsinCategory : W.yongsinId;
      const hasColor = colorOhengs.has(yongsin.yongsin);
      const weight = base + (hasColor ? W.yongsinColor : 0);
      const label = ohengLabel(yongsin.yongsin);
      const guide = OHENG_TALISMAN_GUIDE[yongsin.yongsin];
      const info = OHENG_INFO[yongsin.yongsin];

      // 조후가 급하면 온도 이야기를 앞세우는 편이 훨씬 와닿는다.
      const johu = johuPhrase(yongsin, season);
      const head = johu
        ? `${johu}`
        : `당신의 용신(用神, 지금 가장 필요한 기운)은 ${label}—이 부적이 그 기운을 담고 있어요`;

      reasons.push({
        kind: 'yongsin',
        text: hasColor
          ? `${head}. ${guide.colorName} 빛깔이 ${eulReul(
              info.meaning
            )} 한층 또렷하게 살려줍니다`
          : `${head}. ${eulReul(info.meaning)} 곁에서 받쳐줍니다`,
        weight,
      });
      score += weight;
      matchedYongsin = yongsin.yongsin;
      needMatched = true;
    }

    // ── 3. 희신(喜神) — 용신을 뒤에서 밀어주는 기운 ────────
    const hTier = ohengSupportTier(t, yongsin.huisin);
    if (hTier && yongsin.huisin !== yongsin.yongsin) {
      const weight = hTier === 'category' ? W.huisinCategory : W.huisinId;
      reasons.push({
        kind: 'huisin',
        text: `${ohengLabel(yongsin.huisin)} 기운은 용신 ${eulReul(
          ohengLabel(yongsin.yongsin)
        )} 생(生)해주는 희신(喜神)이에요—이 부적이 그 뒷심을 보태줍니다`,
        weight,
      });
      score += weight;
      matchedHuisin = yongsin.huisin;
      needMatched = true;
    }

    // ── 4. 기신(忌神) — 지금은 이미 넉넉한 기운이라 뒤로 ────
    const gTier = ohengSupportTier(t, yongsin.gisin);
    if (
      gTier &&
      yongsin.gisin !== yongsin.yongsin &&
      yongsin.gisin !== yongsin.huisin
    ) {
      reasons.push({
        kind: 'gisin',
        text: `${ohengLabel(
          yongsin.gisin
        )} 기운은 지금 이미 넉넉한 편(기신, 忌神)이라 서두르지 않아도 괜찮아요—마음이 가면 그때 곁에 두어도 충분합니다`,
        weight: W.gisin,
      });
      score += W.gisin;
    }

    // ── 5. 신강신약(身強身弱) 보완 설명 ────────────────────
    // 방향은 이미 용신 점수에 반영돼 있어, 여기서는 이유만 덧붙인다.
    if (needMatched) {
      const phrase = singangPhrase(yongsin);
      if (phrase) {
        reasons.push({ kind: 'singang', text: phrase, weight: W.singang });
        score += W.singang;
      }
    }
  } else {
    // ── (폴백) 용신을 잡지 못했을 때 — 예전의 개수 기반 규칙 ──
    for (const lack of analysis.lacking) {
      const base = ohengSupportPoints(t, lack);
      if (base <= 0) continue;

      needMatched = true;
      const info = OHENG_INFO[lack];

      const guide = OHENG_TALISMAN_GUIDE[lack];
      const hasColor = colorOhengs.has(lack);
      const weight = base + (hasColor ? W.lackingColor : 0);

      reasons.push({
        kind: 'lackingOheng',
        text: hasColor
          ? `부족한 ${ohengLabel(lack)} 기운—${eulReul(
              info.meaning
            )} 보충해주고, ${guide.colorName} 빛깔이 그 기운을 더해줍니다`
          : `부족한 ${ohengLabel(lack)} 기운—${eulReul(info.meaning)} 보충해줍니다`,
        weight,
      });
      score += weight;

      if (weight > matchedLackingWeight) {
        matchedLackingWeight = weight;
        matchedLacking = lack;
      }
    }

    // 과다한 기운 다스리기 (상극, 相剋)
    if (excess) {
      const tamer = CONTROLLED_BY[excess];
      if (ohengSupportPoints(t, tamer) > 0) {
        reasons.push({
          kind: 'excessOheng',
          text: `넉넉한 ${ohengLabel(excess)} 기운을 ${ohengLabel(
            tamer
          )}의 결로 부드럽게 다스려줘요`,
          weight: W.excess,
        });
        score += W.excess;
        tamedExcess = excess;
      }
    }
  }

  // ── 6. 일간(日干) 보완 ─────────────────────────────────
  const ilganName = input.saju.dayStem.name;
  const ilganSupport = ILGAN_SUPPORT[ilganName];
  if (ilganSupport && ilganSupport.ids.includes(t.id)) {
    reasons.push({
      kind: 'ilganTrait',
      text: ilganSupport.text,
      weight: W.ilgan,
    });
    score += W.ilgan;
  }

  // ── 7. 띠 문양 ─────────────────────────────────────────
  if (hasAnimalSymbol(t, input.animal.name)) {
    reasons.push({
      kind: 'animal',
      text: `${input.animal.name}띠를 지키는 문양이 담겨 있어요 ${input.animal.emoji}`,
      weight: W.animal,
    });
    score += W.animal;
  }

  // ── 8. 전반 균형 ───────────────────────────────────────
  if (analysis.balance === 'balanced') {
    // 이미 고른 사주 — 지금의 결을 지켜주는 두루 좋은 부적을 조금 밀어준다.
    if (t.id === 'wealth-01' || t.id === 'protect-04') {
      reasons.push({
        kind: 'balance',
        text: '다섯 기운(오행, 五行)이 고르게 자리 잡은 사주예요—지금의 균형을 오래 지켜줍니다',
        weight: W.balance,
      });
      score += W.balance;
    }
  } else if (analysis.balance === 'polarized' && needMatched) {
    // 색이 진한 사주 — 약점이 아니라 "반대쪽을 조금 채우면 편해지는" 결이다.
    reasons.push({
      kind: 'balance',
      text: '기운이 한쪽으로 뚜렷하게 모인 사주예요—반대쪽을 조금 채워두면 한결 편안해집니다',
      weight: W.balance,
    });
    score += W.balance;
  }

  const singangLevel =
    yongsin && yongsin.singang.level !== '중화' ? yongsin.singang.level : null;

  const headline = buildHeadline(reasons, {
    matchedYongsin,
    matchedHuisin,
    johuUrgent:
      yongsin && yongsin.johu.urgency === 'high' && yongsin.johu.needed
        ? { needed: yongsin.johu.needed, season }
        : null,
    singangLevel,
    matchedLacking,
    tamedExcess,
    ilgan: `${input.saju.dayStem.name}(${input.saju.dayStem.hanja})`,
    animal: input.animal.name,
  });

  return { score, reasons, headline };
}

/** 점수·카테고리 우선순위·id 순으로 정렬 (같은 입력이면 항상 같은 결과) */
function compareMatches(a: SajuTalismanMatch, b: SajuTalismanMatch): number {
  if (b.score !== a.score) return b.score - a.score;
  const pa = CATEGORY_PRIORITY[a.talisman.category];
  const pb = CATEGORY_PRIORITY[b.talisman.category];
  if (pa !== pb) return pa - pb;
  return a.talisman.id.localeCompare(b.talisman.id);
}

/**
 * 용신 확보 — 호출자가 넘긴 값이 있으면 그대로, 없으면 계산한다.
 * 계산이 실패하면 null 을 돌려 예전(개수 기반) 규칙으로 물러난다.
 */
function resolveYongsin(input: SajuMatchInput): YongsinResult | null {
  if (input.yongsin) return input.yongsin;
  try {
    return getYongsin(input.saju, input.oheng);
  } catch {
    return null;
  }
}

/** 43종 전체에 대한 사주 점수표 */
function scoreAll(input: SajuMatchInput): SajuTalismanMatch[] {
  const analysis = analyzeOheng(input.oheng);
  const excess = isDominantOverwhelming(input.oheng, analysis.dominant)
    ? analysis.dominant
    : null;
  const yongsin = resolveYongsin(input);
  const season = getGyejeol(input.saju);

  return TALISMANS.map((t) => {
    const { score, reasons, headline } = scoreTalisman(
      t,
      input,
      analysis,
      excess,
      yongsin,
      season
    );
    return { talisman: t, score, reasons, headline };
  }).sort(compareMatches);
}

// ============================================================
// 8. 공개 API
// ============================================================

/**
 * 사주 기반 부적 추천 — 상위 N개
 *
 * 삼재 → 용신 → 희신 → 일간 → 띠 순으로 가중치를 매기고,
 * 지금 넉넉한 기신(忌神) 쪽 부적은 조금 뒤로 미뤄
 * 43종 전통 부적 중 지금 도움이 될 만한 것을 골라준다.
 *
 * @param input 사주 원국 · 오행 점수 · 띠 · 삼재 판정 (+ 선택적으로 용신)
 * @param limit 받아볼 개수 (기본 5, 1 이상)
 */
export function recommendBySaju(
  input: SajuMatchInput,
  limit: number = 5
): SajuTalismanMatch[] {
  const n = Math.max(1, Math.min(TALISMANS.length, Math.floor(limit)));
  return scoreAll(input).slice(0, n);
}

/**
 * 사주 + 대화 키워드 혼합 추천 (부적 만들기 플로우용)
 *
 * 사용자가 직접 말한 고민(키워드·카테고리)을 우선하되,
 * 비슷한 후보 사이에서는 사주가 저울을 기울이도록 합쳐서 계산한다.
 * 반환되는 reasons 는 "왜 이 사람에게 맞는지"를 설명하는 사주 근거다.
 *
 * @param keywords 대화에서 뽑아낸 고민 키워드
 * @param category 사용자가 고른 카테고리 (없으면 null)
 */
export function recommendBySajuAndKeywords(
  input: SajuMatchInput,
  keywords: string[],
  category?: TalismanCategory | null
): SajuTalismanMatch {
  const sajuScores = new Map<string, SajuTalismanMatch>();
  for (const m of scoreAll(input)) sajuScores.set(m.talisman.id, m);

  const cleaned = keywords.map((k) => k.trim()).filter((k) => k.length > 0);

  // 기존 키워드 엔진(talismans.ts)의 1순위 추천에 가산점을 준다.
  const keywordPick =
    cleaned.length > 0 || category
      ? getTalismanRecommendation(category ?? null, cleaned)
      : null;

  const keywordScore = (t: TalismanType): number => {
    let s = 0;
    if (category && t.category === category) s += 20;
    if (keywordPick && keywordPick.id === t.id) s += 25;

    for (const kw of cleaned) {
      if (t.name.includes(kw) || t.hanja.includes(kw)) s += 30;
      else if (t.description.includes(kw)) s += 8;
      if (t.situations.some((sit) => sit.includes(kw))) s += 6;
      if (t.meaning.some((m) => m.includes(kw))) s += 3;
    }
    return s;
  };

  const blended: SajuTalismanMatch[] = TALISMANS.map((t) => {
    const base = sajuScores.get(t.id);
    const saju = base?.score ?? 0;
    return {
      talisman: t,
      // 사용자가 말한 고민이 앞서고, 사주는 저울을 기울이는 역할(가중 0.5)
      score: Math.round((keywordScore(t) + saju * 0.5) * 10) / 10,
      reasons: base?.reasons ?? [],
      headline:
        base && base.reasons.length > 0
          ? base.headline
          : '지금 마음 쓰이는 일에 맞춰 고른 부적',
    };
  }).sort(compareMatches);

  return blended[0];
}

/**
 * 오늘의 부적
 *
 * 상위 후보 중에서 날짜를 씨앗으로 하나를 고른다.
 * 같은 사람·같은 날이면 항상 같은 부적이 나오고, 날짜가 바뀌면 달라진다.
 *
 * @param date 기준 날짜 (호출자가 넘긴 값만 사용 — 순수 함수 유지)
 */
export function getTodayTalisman(
  input: SajuMatchInput,
  date: Date
): SajuTalismanMatch {
  const pool = recommendBySaju(input, 7);

  // 삼재년에는 보호를 먼저 권한다 (매일 바뀌지 않아도 되는 예외).
  const samjaePick = pool.find((m) => isSamjaeTalisman(m.talisman));
  if (input.samjae.is && samjaePick) return samjaePick;

  const seedText = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    input.saju.dayStem.name,
    input.saju.dayBranch.name,
    input.saju.yearStem.name,
    input.saju.yearBranch.name,
    input.animal.name,
  ].join('-');

  // 간단한 문자열 해시 (FNV 계열) — 같은 씨앗이면 항상 같은 값
  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  return pool[hash % pool.length];
}

/**
 * 특정 부적이 이 사주와 어떻게 이어지는지 설명 (상세 화면용).
 * 추천 목록에 없는 부적도 조회할 수 있다.
 */
export function explainMatch(
  input: SajuMatchInput,
  talismanId: string
): SajuTalismanMatch | null {
  return scoreAll(input).find((m) => m.talisman.id === talismanId) ?? null;
}

/** 상극 관계 조회 헬퍼 (UI 설명용) — 이 기운이 다스리는 기운 */
export function getControlledOheng(o: Oheng): Oheng {
  return CONTROLS[o];
}

/** 상극 관계 조회 헬퍼 (UI 설명용) — 이 기운을 다스려주는 기운 */
export function getTamingOheng(o: Oheng): Oheng {
  return CONTROLLED_BY[o];
}

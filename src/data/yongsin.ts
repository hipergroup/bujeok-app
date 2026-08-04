// ============================================================
// 용신(用神) 계산 — 지장간 · 신강신약 · 조후 · 취용
//
// 용신(用神)이란 "내 사주에 가장 필요한 기운" 을 뜻합니다.
// 명리학은 사주를 '중화(中和, 균형)를 향해 조정할 시스템' 으로 보기 때문에,
// 넘치는 것은 덜어내고 모자란 것은 채워주는 오행 하나를 골라 처방약처럼 씁니다.
//
// 원칙
//  1. 순수 함수만 둔다 — 저장소·브라우저 API에 접근하지 않는다.
//  2. 전문용어는 반드시 한자를 병기하고 쉬운 말로 풀어 쓴다.
//  3. 단정하지 않는다 — "~입니다" 대신 "~로 봅니다", "~하면 좋아요".
//  4. 겁주지 않는다 — 기신(忌神)은 '나쁜 것' 이 아니라 '조금 덜어내면 좋은 것'.
//  5. 용신 취용은 명리학에서 보는 사람마다 답이 갈리는 영역이라는 점을 숨기지 않는다.
//
// 채택한 규칙 (유파 명시)
//  - 지장간: 『연해자평』·『삼명통회』 계열 통용본, 일수 ÷ 30 을 그대로 가중치로 사용
//  - 신강신약: 자리 가중치 정량 모델 (월지 30 / 일지 15 / 시지 12 / 년지 10 /
//              월간 10 / 시간 8 / 년간 5, 일간은 기준점이라 세력에서 제외)
//  - 희신: "용신을 생(生)해주는 오행" 정의를 채택 (반대 정의를 쓰는 유파도 있음)
//  - 조후가 급하면 억부보다 조후를 앞세우는 궁통보감 계열 통설을 따름
// ============================================================

import type { Oheng, SajuResult, OhengScore, JiJi, CheonGan } from './saju';
import { CHEONGAN } from './saju';
import { OHENG_INFO } from './saju-interpretation';

// ─── 한글 조사 헬퍼 ────────────────────────────────────────
function hasJongseong(word: string): boolean {
  for (let i = word.length - 1; i >= 0; i--) {
    const code = word.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      return (code - 0xac00) % 28 !== 0;
    }
  }
  return false;
}

/** 이/가 */
function iGa(word: string): string {
  return word + (hasJongseong(word) ? '이' : '가');
}

/** 을/를 */
function eulReul(word: string): string {
  return word + (hasJongseong(word) ? '을' : '를');
}

/** 은/는 */
function eunNeun(word: string): string {
  return word + (hasJongseong(word) ? '은' : '는');
}

/** 오행을 '화(火)' 형태로 표기 */
export function ohengLabel(o: Oheng): string {
  return `${o}(${OHENG_INFO[o].hanja})`;
}

// ============================================================
// 0. 오행 상생(相生)·상극(相剋) 관계
// ============================================================

/** 내가 생(生)하는 오행 — 목→화→토→금→수→목 */
export const SAENG: Record<Oheng, Oheng> = {
  목: '화',
  화: '토',
  토: '금',
  금: '수',
  수: '목',
};

/** 나를 생(生)해주는 오행 (SAENG 의 역방향) */
export const SAENG_ME: Record<Oheng, Oheng> = {
  화: '목',
  토: '화',
  금: '토',
  수: '금',
  목: '수',
};

/** 내가 극(剋)하는 오행 — 목→토→수→화→금→목 */
export const GEUK: Record<Oheng, Oheng> = {
  목: '토',
  토: '수',
  수: '화',
  화: '금',
  금: '목',
};

/** 나를 극(剋)하는 오행 (GEUK 의 역방향) */
export const GEUK_ME: Record<Oheng, Oheng> = {
  토: '목',
  수: '토',
  화: '수',
  금: '화',
  목: '금',
};

/** 십성(十星) 5대 그룹 */
export type SipseongGroup = '비겁' | '인성' | '식상' | '재성' | '관성';

/** 표시 순서용 */
export const SIPSEONG_ORDER: SipseongGroup[] = [
  '비겁',
  '인성',
  '식상',
  '재성',
  '관성',
];

/** 십성 그룹의 쉬운 풀이 */
export const SIPSEONG_LABEL: Record<SipseongGroup, string> = {
  비겁: '비겁(比劫, 나와 같은 기운 · 자기 힘과 동료)',
  인성: '인성(印星, 나를 길러주는 기운 · 배움과 후원)',
  식상: '식상(食傷, 내가 내보내는 기운 · 표현과 재능)',
  재성: '재성(財星, 내가 다루는 기운 · 재물과 현실)',
  관성: '관성(官星, 나를 다잡는 기운 · 책임과 자리)',
};

/**
 * 일간(日干) 오행 기준으로 상대 오행이 어떤 십성 그룹인지 판정.
 *  - 비겁: 일간과 같은 오행
 *  - 인성: 일간을 생(生)하는 오행
 *  - 식상: 일간이 생하는 오행
 *  - 재성: 일간이 극(剋)하는 오행
 *  - 관성: 일간을 극하는 오행
 */
export function getSipseongGroup(ilgan: Oheng, target: Oheng): SipseongGroup {
  if (target === ilgan) return '비겁';
  if (target === SAENG_ME[ilgan]) return '인성';
  if (target === SAENG[ilgan]) return '식상';
  if (target === GEUK[ilgan]) return '재성';
  return '관성';
}

/** 십성 그룹에 해당하는 오행을 돌려준다 (getSipseongGroup 의 역함수) */
export function getGroupOheng(ilgan: Oheng, group: SipseongGroup): Oheng {
  switch (group) {
    case '비겁':
      return ilgan;
    case '인성':
      return SAENG_ME[ilgan];
    case '식상':
      return SAENG[ilgan];
    case '재성':
      return GEUK[ilgan];
    case '관성':
      return GEUK_ME[ilgan];
  }
}

// ============================================================
// 1. 지장간(地藏干)
//    지지(地支) 한 글자 속에 숨어 있는 천간(天干).
//    겉으로는 한 글자지만 그 안에 1~3개의 기운이 일수(日數) 비율로 들어 있고,
//    사주의 실제 세력을 계산할 때는 이 비율로 나눠서 셉니다.
//
//    여기(餘氣) — 지난 계절에서 넘어온 남은 기운 (앞부분)
//    중기(中氣) — 삼합(三合)의 기운이 저장된 것 (가운데)
//    정기(正氣) — 그 지지의 본래 성분. 가장 강하고 오래 작용 (본기)
// ============================================================

export interface JijangganEntry {
  /** 천간 이름 (한글) — 예: '무' */
  gan: string;
  /** 천간 한자 — 예: '戊' */
  hanja: string;
  /** 천간의 오행 */
  oheng: Oheng;
  /** 30일 기준 사령(司令) 일수 */
  days: number;
  /** 비율 0~1 (일수 ÷ 30) */
  ratio: number;
  /** 여기 / 중기 / 정기 */
  type: '여기' | '중기' | '정기';
}

/**
 * 12지지 지장간 표 (『연해자평』·『삼명통회』 계열 통용본)
 * 키는 지지의 한글 이름 ('자'~'해'), 값은 여기 → 중기 → 정기 순.
 * ratio 는 일수 ÷ 30 을 소수 둘째 자리로 정리해 합이 1.00 이 되도록 맞췄습니다.
 *
 * [학파차이] 午의 중기를 己로 볼지, 申의 여기를 戊로 볼지, 亥에 戊를 넣을지 등
 * 판본마다 미세한 차이가 있습니다.
 */
export const JIJANGGAN: Record<string, JijangganEntry[]> = {
  자: [
    { gan: '임', hanja: '壬', oheng: '수', days: 10, ratio: 0.33, type: '여기' },
    { gan: '계', hanja: '癸', oheng: '수', days: 20, ratio: 0.67, type: '정기' },
  ],
  축: [
    { gan: '계', hanja: '癸', oheng: '수', days: 9, ratio: 0.3, type: '여기' },
    { gan: '신', hanja: '辛', oheng: '금', days: 3, ratio: 0.1, type: '중기' },
    { gan: '기', hanja: '己', oheng: '토', days: 18, ratio: 0.6, type: '정기' },
  ],
  인: [
    { gan: '무', hanja: '戊', oheng: '토', days: 7, ratio: 0.23, type: '여기' },
    { gan: '병', hanja: '丙', oheng: '화', days: 7, ratio: 0.23, type: '중기' },
    { gan: '갑', hanja: '甲', oheng: '목', days: 16, ratio: 0.54, type: '정기' },
  ],
  묘: [
    { gan: '갑', hanja: '甲', oheng: '목', days: 10, ratio: 0.33, type: '여기' },
    { gan: '을', hanja: '乙', oheng: '목', days: 20, ratio: 0.67, type: '정기' },
  ],
  진: [
    { gan: '을', hanja: '乙', oheng: '목', days: 9, ratio: 0.3, type: '여기' },
    { gan: '계', hanja: '癸', oheng: '수', days: 3, ratio: 0.1, type: '중기' },
    { gan: '무', hanja: '戊', oheng: '토', days: 18, ratio: 0.6, type: '정기' },
  ],
  사: [
    { gan: '무', hanja: '戊', oheng: '토', days: 7, ratio: 0.23, type: '여기' },
    { gan: '경', hanja: '庚', oheng: '금', days: 7, ratio: 0.23, type: '중기' },
    { gan: '병', hanja: '丙', oheng: '화', days: 16, ratio: 0.54, type: '정기' },
  ],
  오: [
    { gan: '병', hanja: '丙', oheng: '화', days: 10, ratio: 0.33, type: '여기' },
    { gan: '기', hanja: '己', oheng: '토', days: 9, ratio: 0.3, type: '중기' },
    { gan: '정', hanja: '丁', oheng: '화', days: 11, ratio: 0.37, type: '정기' },
  ],
  미: [
    { gan: '정', hanja: '丁', oheng: '화', days: 9, ratio: 0.3, type: '여기' },
    { gan: '을', hanja: '乙', oheng: '목', days: 3, ratio: 0.1, type: '중기' },
    { gan: '기', hanja: '己', oheng: '토', days: 18, ratio: 0.6, type: '정기' },
  ],
  신: [
    { gan: '무', hanja: '戊', oheng: '토', days: 7, ratio: 0.23, type: '여기' },
    { gan: '임', hanja: '壬', oheng: '수', days: 7, ratio: 0.23, type: '중기' },
    { gan: '경', hanja: '庚', oheng: '금', days: 16, ratio: 0.54, type: '정기' },
  ],
  유: [
    { gan: '경', hanja: '庚', oheng: '금', days: 10, ratio: 0.33, type: '여기' },
    { gan: '신', hanja: '辛', oheng: '금', days: 20, ratio: 0.67, type: '정기' },
  ],
  술: [
    { gan: '신', hanja: '辛', oheng: '금', days: 9, ratio: 0.3, type: '여기' },
    { gan: '정', hanja: '丁', oheng: '화', days: 3, ratio: 0.1, type: '중기' },
    { gan: '무', hanja: '戊', oheng: '토', days: 18, ratio: 0.6, type: '정기' },
  ],
  해: [
    { gan: '무', hanja: '戊', oheng: '토', days: 7, ratio: 0.23, type: '여기' },
    { gan: '갑', hanja: '甲', oheng: '목', days: 7, ratio: 0.23, type: '중기' },
    { gan: '임', hanja: '壬', oheng: '수', days: 16, ratio: 0.54, type: '정기' },
  ],
};

/** 지지의 지장간 목록 조회 (지지 객체 또는 한글 이름) */
export function getJijanggan(branch: JiJi | string): JijangganEntry[] {
  const key = typeof branch === 'string' ? branch : branch.name;
  return JIJANGGAN[key] ?? [];
}

/** 지지의 정기(正氣, 본래 성분) 지장간 */
export function getJeonggi(branch: JiJi | string): JijangganEntry | undefined {
  return getJijanggan(branch).find((e) => e.type === '정기');
}

/** 천간 이름으로 천간 정보 조회 */
export function findGan(name: string): CheonGan | undefined {
  return CHEONGAN.find((g) => g.name === name);
}

// ============================================================
// 2. 신강(身強)·신약(身弱) 판정
//    일간(日干) = "나" 의 힘이 사주 전체에서 넉넉한지 모자란지를 재는 작업.
//    용신을 고르는 출발점이 됩니다.
//
//    아군(我方) = 비겁(나와 같은 기운) + 인성(나를 길러주는 기운)
//    적군(異方) = 식상(내보내는 기운) + 재성(쓰는 기운) + 관성(누르는 기운)
// ============================================================

/** 세력 계산에 쓰는 자리별 가중치 */
export interface PositionWeight {
  key: string;
  /** 화면 표기용 이름 */
  label: string;
  weight: number;
}

/**
 * 자리 가중치 — 월지가 가장 무겁고 년간이 가장 가볍다.
 * 일간(日干)은 판정의 '기준점' 이므로 세력 점수에서는 제외합니다.
 * [학파차이] 수치는 유파·프로그램마다 다르며, 중요한 것은
 * 월지 > 일지 > 시지·월간 > 년주 라는 순서입니다.
 */
export const POSITION_WEIGHTS: PositionWeight[] = [
  { key: 'monthBranch', label: '월지(月支)', weight: 30 },
  { key: 'dayBranch', label: '일지(日支)', weight: 15 },
  { key: 'hourBranch', label: '시지(時支)', weight: 12 },
  { key: 'yearBranch', label: '년지(年支)', weight: 10 },
  { key: 'monthStem', label: '월간(月干)', weight: 10 },
  { key: 'hourStem', label: '시간(時干)', weight: 8 },
  { key: 'yearStem', label: '년간(年干)', weight: 5 },
];

const EMPTY_OHENG = (): Record<Oheng, number> => ({
  목: 0,
  화: 0,
  토: 0,
  금: 0,
  수: 0,
});

/** 소수 첫째 자리로 정리 */
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * 자리 가중치 + 지장간 비율을 적용한 오행 세력 점수 (합계 100 정규화).
 *
 * - 천간은 그 자리의 가중치를 자기 오행에 그대로 싣습니다.
 * - 지지는 지장간 비율로 쪼개서 각 오행에 나눠 싣습니다.
 *   예) 월지 인(寅) 30점 → 무 7점(토) · 병 7점(화) · 갑 16점(목)
 *
 * getOheng() 이 "글자 수" 를 세는 간단한 방식이라면,
 * 이 함수는 자리의 무게와 숨은 기운까지 반영한 정밀 버전입니다.
 */
function rawWeightedOheng(saju: SajuResult): Record<Oheng, number> {
  const raw = EMPTY_OHENG();

  const stems: [CheonGan, number][] = [
    [saju.monthStem, 10],
    [saju.hourStem, 8],
    [saju.yearStem, 5],
  ];
  for (const [stem, w] of stems) {
    raw[stem.oheng] += w;
  }

  const branches: [JiJi, number][] = [
    [saju.monthBranch, 30],
    [saju.dayBranch, 15],
    [saju.hourBranch, 12],
    [saju.yearBranch, 10],
  ];
  for (const [branch, w] of branches) {
    const hidden = getJijanggan(branch);
    if (hidden.length === 0) {
      raw[branch.oheng] += w;
      continue;
    }
    for (const entry of hidden) {
      raw[entry.oheng] += w * entry.ratio;
    }
  }

  return raw;
}

/** 합계 100 으로 정규화 */
function normalize(raw: Record<Oheng, number>): Record<Oheng, number> {
  const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
  const scaled = EMPTY_OHENG();
  (Object.keys(raw) as Oheng[]).forEach((o) => {
    scaled[o] = round1((raw[o] / total) * 100);
  });
  return scaled;
}

export function getWeightedOheng(saju: SajuResult): Record<Oheng, number> {
  return normalize(rawWeightedOheng(saju));
}

/**
 * 일간(日干) 자신을 세력에 얼마나 실을지.
 *
 * 참고 문헌의 자리 가중치 표는 일간 자리를 "(기준, 제외 또는 10)" 이라고 적어
 * **제외** 와 **10점** 두 가지를 모두 허용합니다. 여기서는 10점을 택했습니다.
 *
 * 이유: 일간을 빼고 계산하면 아군(비겁+인성)의 기대값이 대략 0.40 근처에 머물러,
 * 문헌이 제시한 등급 기준선(중화 0.45~0.55)과 어긋나 대부분의 사주가 신약으로 쏠립니다.
 * 실제로 표본 9,792건을 돌려보면 제외 시 신약·극신약이 62%(그중 극신약만 20%)가 되는데,
 * 극신약은 본래 종격(從格)을 검토할 만큼 드문 판정이라 이 분포는 과합니다.
 * 일간을 비겁으로 10점 실으면 분포가 중화 근처로 다시 모여 등급 기준선과 맞습니다.
 *
 * 0 으로 바꾸면 일간을 제외하는 방식(문헌의 다른 선택지)으로 그대로 돌아갑니다.
 */
export const ILGAN_SELF_WEIGHT = 10;

/**
 * 신강신약·용신 판정에 쓰는 오행 세력 (일간 자신을 비겁으로 포함, 합계 100).
 * getWeightedOheng() 은 일간을 뺀 순수 '주변 세력' 이라는 점이 다릅니다.
 */
export function getSingangElements(saju: SajuResult): Record<Oheng, number> {
  const raw = rawWeightedOheng(saju);
  raw[saju.dayStem.oheng] += ILGAN_SELF_WEIGHT;
  return normalize(raw);
}

/** 신강/신약 판정 결과 */
export interface SinganganResult {
  /** 아군 점수 (0~100 정규화) */
  score: number;
  /** 신강도 0~1 */
  ratio: number;
  level: '극신강' | '신강' | '중화' | '신약' | '극신약';
  /** 비겁 + 인성 */
  allyScore: number;
  /** 식상 + 재성 + 관성 */
  enemyScore: number;
  detail: {
    비겁: number;
    인성: number;
    식상: number;
    재성: number;
    관성: number;
  };
  /** 초보자용 한 줄 설명 */
  summary: string;
}

/** 등급별 한 줄 설명 */
const SINGANG_SUMMARY: Record<SinganganResult['level'], string> = {
  극신강:
    '내 기운(일간)이 아주 넉넉한 편으로 봅니다. 힘이 남는 만큼 밖으로 꺼내 쓸 통로가 있으면 훨씬 편해져요.',
  신강:
    '내 기운(일간)이 든든한 편으로 봅니다. 스스로 밀고 나가는 힘이 좋아서, 그 힘을 쓸 자리를 만들면 좋아요.',
  중화:
    '내 기운(일간)과 주변 기운이 제법 고르게 균형을 이룬 편으로 봅니다. 명리에서 가장 편안하게 보는 자리예요.',
  신약:
    '내 기운(일간)이 조금 여린 편으로 봅니다. 혼자 다 짊어지기보다 배우고 기대며 채우는 쪽이 잘 맞아요.',
  극신약:
    '내 기운(일간)이 많이 여린 편으로 봅니다. 힘을 쓰기보다 먼저 채우고 회복하는 데 무게를 두면 좋아요.',
};

/**
 * 신강·신약 판정
 *
 * 신강도 = (비겁 + 인성) ÷ 전체
 *   ≥ 0.75 극신강 / 0.55~0.75 신강 / 0.45~0.55 중화 / 0.25~0.45 신약 / < 0.25 극신약
 *
 * [학파차이] 점수로 계량하는 방식 자체를 비판하고 월령(月令) 득실과 통근 유무만으로
 * 정성 판단해야 한다는 입장(적천수 계열)도 있습니다. 여기서는 정량 모델을 씁니다.
 */
export function analyzeSingang(saju: SajuResult): SinganganResult {
  const me = saju.dayStem.oheng;

  // 일간 자신(=비겁)을 세력에 얹은 뒤 100 으로 정규화한다.
  const elements = getSingangElements(saju);

  const detail = { 비겁: 0, 인성: 0, 식상: 0, 재성: 0, 관성: 0 };
  (Object.keys(elements) as Oheng[]).forEach((o) => {
    detail[getSipseongGroup(me, o)] += elements[o];
  });
  (Object.keys(detail) as SipseongGroup[]).forEach((g) => {
    detail[g] = round1(detail[g]);
  });

  const allyScore = round1(detail.비겁 + detail.인성);
  const enemyScore = round1(detail.식상 + detail.재성 + detail.관성);
  const total = allyScore + enemyScore || 1;
  const ratio = allyScore / total;

  let level: SinganganResult['level'];
  if (ratio >= 0.75) level = '극신강';
  else if (ratio >= 0.55) level = '신강';
  else if (ratio >= 0.45) level = '중화';
  else if (ratio >= 0.25) level = '신약';
  else level = '극신약';

  return {
    score: Math.round(allyScore),
    ratio: Math.round(ratio * 1000) / 1000,
    level,
    allyScore,
    enemyScore,
    detail,
    summary: SINGANG_SUMMARY[level],
  };
}

// ============================================================
// 3. 조후(調候) — 사주의 온도와 습도 맞추기
//    사주를 하나의 생태계로 보고, 그 안이 너무 춥거나 덥지는 않은지 살핍니다.
//    얼어붙거나 메마른 상태라면 균형(억부)보다 온도 조절이 먼저라고 봅니다.
//    근거 문헌: 『궁통보감(窮通寶鑑)』 = 『난강망(欄江網)』
// ============================================================

/** 계절 구분 (월지 기준) */
export type Gyejeol = '봄' | '여름' | '가을' | '겨울';

const SEASON_BY_BRANCH: Record<string, Gyejeol> = {
  인: '봄',
  묘: '봄',
  진: '봄',
  사: '여름',
  오: '여름',
  미: '여름',
  신: '가을',
  유: '가을',
  술: '가을',
  해: '겨울',
  자: '겨울',
  축: '겨울',
};

/** 월지(月支)로 계절을 판정 */
export function getGyejeol(saju: SajuResult): Gyejeol {
  return SEASON_BY_BRANCH[saju.monthBranch.name] ?? '봄';
}

export interface JohuResult {
  /** 조후상 필요한 오행. 대개 화(火) 또는 수(水), 물이 넘칠 때만 토(土). 없으면 null */
  needed: Oheng | null;
  urgency: 'high' | 'medium' | 'none';
  /** 왜 그 기운이 필요한지 — 쉬운 한 문장 */
  reason: string;
}

/** '많다' 로 볼 상대 점수 기준선 (getOheng 은 가장 큰 기운이 100인 상대 점수) */
const JOHU_MUCH = 60;
/** '아주 많다(과다)' 기준선 */
const JOHU_TOO_MUCH = 85;
/** '옅다' 기준선 */
const JOHU_THIN = 30;

/**
 * 조후 판정
 *
 *  - 겨울(해·자·축월) 출생 + 수(水)가 많음 → 화(火)가 급함
 *  - 여름(사·오·미월) 출생 + 화(火)가 많음 → 수(水)가 급함
 *  - 토(土)가 과다하고 메마름 → 수(水)로 적셔줌
 *  - 수(水)가 과다해 넘침 → 토(土)로 둑을 쌓음
 *
 * @param saju  사주 원국
 * @param oheng getOheng() 이 돌려주는 상대 오행 점수
 */
export function analyzeJohu(saju: SajuResult, oheng: OhengScore): JohuResult {
  const season = getGyejeol(saju);
  const month = `${saju.monthBranch.name}(${saju.monthBranch.hanja})월`;

  // ── 겨울: 한랭(寒冷) ────────────────────────────────────
  if (season === '겨울') {
    if (oheng.화 <= 0) {
      return {
        needed: '화',
        urgency: 'high',
        reason: `한겨울인 ${month}에 태어났는데 사주에 따뜻한 화(火) 기운이 보이지 않아, 온기를 채우는 일이 가장 급한 것으로 봅니다.`,
      };
    }
    if (oheng.수 >= JOHU_MUCH) {
      return {
        needed: '화',
        urgency: 'high',
        reason: `${month}에 태어나 사주가 차가운 편인데 물(水) 기운까지 넉넉해서, 얼지 않도록 따뜻한 화(火) 기운을 먼저 채우면 좋아요.`,
      };
    }
    if (oheng.화 <= JOHU_THIN) {
      return {
        needed: '화',
        urgency: 'high',
        reason: `${month}에 태어나 사주가 차가운 편인데 온기를 낼 화(火) 기운이 옅어서, 따뜻함을 먼저 채우면 좋아요.`,
      };
    }
    return {
      needed: '화',
      urgency: 'medium',
      reason: `${month} 출생이라 사주가 서늘한 편으로 봅니다. 화(火) 기운이 조금 더해지면 한결 살기 좋은 온도가 돼요.`,
    };
  }

  // ── 여름: 염열(炎熱) ────────────────────────────────────
  if (season === '여름') {
    if (oheng.수 <= 0) {
      return {
        needed: '수',
        urgency: 'high',
        reason: `한여름인 ${month}에 태어났는데 사주에 물(水) 기운이 보이지 않아, 열을 식혀줄 수(水)를 채우는 일이 가장 급한 것으로 봅니다.`,
      };
    }
    if (oheng.화 >= JOHU_MUCH) {
      return {
        needed: '수',
        urgency: 'high',
        reason: `${month}에 태어나 사주가 더운 편인데 불(火) 기운까지 강해서, 메마르지 않도록 시원한 수(水) 기운을 먼저 채우면 좋아요.`,
      };
    }
    if (oheng.수 <= JOHU_THIN) {
      return {
        needed: '수',
        urgency: 'high',
        reason: `${month}에 태어나 사주에 열기가 있는 편인데 그것을 식혀줄 물(水) 기운이 옅어서, 수(水)를 먼저 채우면 좋아요.`,
      };
    }
    return {
      needed: '수',
      urgency: 'medium',
      reason: `${month} 출생이라 사주에 열기가 있는 편으로 봅니다. 수(水) 기운이 조금 더해지면 훨씬 시원하게 흘러가요.`,
    };
  }

  // ── 토(土) 과다 + 건조 → 수(水)로 적심 ─────────────────
  if (oheng.토 >= JOHU_TOO_MUCH && oheng.수 <= JOHU_THIN) {
    return {
      needed: '수',
      urgency: 'medium',
      reason: `흙(土) 기운이 두텁고 물(水) 기운이 옅어 땅이 메마른 모양으로 봅니다. 수(水) 기운으로 적셔주면 씨앗이 자랄 수 있어요.`,
    };
  }

  // ── 수(水) 과다 → 토(土)로 제방 ────────────────────────
  if (oheng.수 >= JOHU_TOO_MUCH && oheng.토 <= JOHU_THIN) {
    return {
      needed: '토',
      urgency: 'medium',
      reason: `물(水) 기운이 넘칠 만큼 많아 흐름이 흩어지기 쉬운 모양으로 봅니다. 토(土) 기운으로 둑을 쌓아주면 힘이 한곳에 모여요.`,
    };
  }

  return {
    needed: null,
    urgency: 'none',
    reason: `${month} 출생이라 사주의 온도와 습도가 크게 치우치지 않은 편으로 봅니다. 급하게 온도를 맞출 일은 없어 보여요.`,
  };
}

// ============================================================
// 5. 개운(改運) 조언 — 용신 오행을 생활 속에서 보강하는 방법
//    색·방위·계절·활동을 용신 오행에 맞추는 것이 명리의 전통적인 처방입니다.
//    거창한 것보다 매일 할 수 있는 작은 습관이 오래갑니다.
// ============================================================

/** 용신 오행별 실생활 조언 3가지 */
export const YONGSIN_ADVICE: Record<Oheng, string[]> = {
  목: [
    '청색·초록빛 물건을 곁에 두고, 동쪽(東) 창이나 동쪽으로 난 자리를 자주 쓰면 좋아요.',
    '화분을 하나 길러보세요. 살아 있는 것을 돌보는 일이 목(木) 기운을 가장 잘 불러옵니다.',
    '아침에 산책하며 하루를 시작해 보세요. 새로 자라나는 시간대라 목(木) 기운과 결이 잘 맞아요.',
  ],
  화: [
    '적색·주홍빛(한지 인주색) 포인트를 몸에 하나 지니고, 남쪽(南)의 밝은 자리를 가까이하면 좋아요.',
    '몸을 움직이는 운동을 꾸준히 해보세요. 땀이 나는 활동이 화(火) 기운을 살려줍니다.',
    '좋아하는 사람들을 만나 소리 내어 웃는 시간을 만들어 보세요. 표현할수록 기운이 밝아져요.',
  ],
  토: [
    '황토색·베이지 같은 흙빛을 가까이 두고, 집이나 사무실의 중앙(中央) 자리를 정돈해 보세요.',
    '서랍 한 칸 정리처럼 작게 시작하는 정리정돈이 토(土) 기운을 쌓아줍니다.',
    '하루 5분이라도 가만히 앉아 호흡을 고르는 명상을 해보세요. 중심이 잡히는 감각이 생겨요.',
  ],
  금: [
    '백색·은빛 소품이나 금속 액세서리를 지니고, 서쪽(西) 방향을 가까이하면 좋아요.',
    '끝맺음과 결단이 필요한 일을 미루지 말고 하나씩 정리해 보세요. 금(金) 기운은 마무리에서 자랍니다.',
    '자고 일어나는 시간처럼 규칙 하나를 정해 지켜보세요. 규칙적인 생활이 곧 금(金) 기운이에요.',
  ],
  수: [
    '검정·짙은 남색(한지 남색)을 가까이 두고, 북쪽(北) 자리를 활용하면 좋아요.',
    '책을 읽거나 새로운 것을 배우는 시간을 따로 떼어두세요. 수(水)는 사색과 학습에서 자랍니다.',
    '물을 자주 마시고, 강가나 바닷가처럼 물이 있는 곳을 산책해 보세요. 마음이 한결 유연해져요.',
  ],
};

/** 용신 오행별 한 줄 키워드 (headline 보조용) */
const YONGSIN_KEYWORD: Record<Oheng, string> = {
  목: '새로 시작하고 자라나는 힘',
  화: '밝게 드러내고 움직이는 힘',
  토: '중심을 잡고 쌓아가는 힘',
  금: '정리하고 매듭짓는 힘',
  수: '깊이 생각하고 흐르는 힘',
};

// ============================================================
// 4. 용신(用神) 취용(取用)
//
//    [1] 조후가 급하면 → 조후용신 우선
//    [2] 아니면 억부용신 — 강한 것은 누르고(抑), 약한 것은 돕는다(扶)
//    [3] 두 기운이 팽팽히 맞서면 → 통관용신으로 다리를 놓는다
//    [4] 한 세력이 압도적이면 → 거스르지 않고 따라가는 전왕용신
//
//    희신(喜神) = 용신을 생(生)해주는 오행 — 용신의 든든한 후원
//    기신(忌神) = 용신을 극(剋)하는 오행 — 조금 덜어내면 좋은 기운
// ============================================================

export type YongsinType = '억부' | '조후' | '통관' | '전왕';

export interface YongsinResult {
  /** 용신 — 가장 필요한 오행 */
  yongsin: Oheng;
  /** 희신 — 용신을 돕는 오행 */
  huisin: Oheng;
  /** 기신 — 피해야 할 오행 */
  gisin: Oheng;
  /** 취용 방식 */
  type: YongsinType;
  /** 신강신약 결과 */
  singang: SinganganResult;
  /** 조후 결과 */
  johu: JohuResult;
  /** 왜 이 오행이 용신인지 — 초보자용 2~3문장 */
  explanation: string;
  /** 한 줄 요약 */
  headline: string;
  /** 용신 오행을 보강하는 실생활 조언 3가지 */
  advice: string[];
  /** 신뢰도 — 판정이 애매하면 낮게 */
  confidence: 'high' | 'medium' | 'low';
}

/** 통관(通關) 성립을 볼 때 두 기운이 '팽팽하다' 고 보는 기준 */
const TONGGWAN_STRONG = 24;
const TONGGWAN_GAP = 9;

/** 전왕(專旺)으로 볼 만큼 한쪽이 압도적이라고 보는 기준 */
const JEONWANG_RATIO = 0.82;

/** 용신 후보 중 원국에 실제로 뿌리가 있는 것을 우선 고른다 */
function pickPresent(
  candidates: Oheng[],
  elements: Record<Oheng, number>,
  threshold = 5
): Oheng {
  const found = candidates.find((c) => elements[c] >= threshold);
  return found ?? candidates[0];
}

/** 서로 극(剋)하는 두 기운이 팽팽히 맞서는지 확인 → 통관용신 후보 */
function findTonggwan(elements: Record<Oheng, number>): Oheng | null {
  const pairs: [Oheng, Oheng][] = [
    ['금', '목'],
    ['목', '토'],
    ['토', '수'],
    ['수', '화'],
    ['화', '금'],
  ];
  for (const [a, b] of pairs) {
    if (
      elements[a] >= TONGGWAN_STRONG &&
      elements[b] >= TONGGWAN_STRONG &&
      Math.abs(elements[a] - elements[b]) <= TONGGWAN_GAP
    ) {
      // 두 기운을 이어주는 다리 = a 가 생하는 오행 (= b 를 생하는 오행)
      const bridge = SAENG[a];
      if (bridge === b) continue;
      return bridge;
    }
  }
  return null;
}

/** 가장 옅은 오행 (동점이면 목→화→토→금→수 순) */
function weakestOheng(elements: Record<Oheng, number>): Oheng {
  const order: Oheng[] = ['목', '화', '토', '금', '수'];
  return order.reduce((min, o) => (elements[o] < elements[min] ? o : min), order[0]);
}

/** 용신이 원국에서 얼마나 힘이 있는지 (설명 문구용) */
function yongsinStrengthPhrase(score: number): string {
  if (score >= 20) return '이 기운은 원국(原局, 타고난 여덟 글자)에도 든든하게 자리 잡고 있어서, 이미 가지고 있는 강점을 조금 더 밀어주는 셈이에요.';
  if (score >= 8) return '이 기운은 원국(原局, 타고난 여덟 글자)에 옅게나마 들어 있어서, 조금만 북돋아도 금세 살아나요.';
  return '이 기운은 원국(原局, 타고난 여덟 글자)에 거의 드러나 있지 않아서, 생활 속에서 의식적으로 채워주면 도움이 돼요.';
}

/** 용신 취용이 유일한 정답이 아니라는 점을 은근히 담는 꼬리말 (3-1 주의사항) */
const HUMBLE_TAIL: Record<YongsinResult['confidence'], string> = {
  high: '다만 용신은 보는 사람에 따라 다르게 잡히기도 하는 영역이라, 정답이라기보다 방향을 알려주는 나침반으로 여겨주시면 좋아요.',
  medium:
    '용신은 명리에서 해석이 가장 많이 갈리는 자리라, 다른 곳에서는 다른 기운을 짚어줄 수도 있어요. 하나의 유력한 방향으로 읽어주세요.',
  low: '이 사주는 힘의 균형이 애매한 편이라 용신을 잡기가 까다로운 쪽에 속해요. 술사마다 답이 갈릴 수 있으니, 참고할 방향 하나로만 받아들이시면 좋아요.',
};

/**
 * 용신(用神) 취용
 *
 * @param saju  사주 원국
 * @param oheng getOheng() 이 돌려주는 상대 오행 점수 (조후 판정에 사용)
 */
export function getYongsin(saju: SajuResult, oheng: OhengScore): YongsinResult {
  const me = saju.dayStem.oheng;
  const ilganName = `${saju.dayStem.name}(${saju.dayStem.hanja})`;
  const elements = getSingangElements(saju);
  const singang = analyzeSingang(saju);
  const johu = analyzeJohu(saju, oheng);
  const { detail, level } = singang;

  let yongsin: Oheng;
  let type: YongsinType;
  let reason: string;
  let confidence: YongsinResult['confidence'] = 'medium';

  const allyRatio = singang.ratio;

  if (level === '극신강' && allyRatio >= JEONWANG_RATIO) {
    // ── [1] 전왕(專旺) — 한 세력이 압도적이면 거스르지 않고 따라간다 ──
    type = '전왕';
    yongsin = detail.인성 > detail.비겁 ? SAENG_ME[me] : me;
    reason = `사주가 온통 ${eulReul(
      `내 편(비겁·인성) 기운`
    )} 향해 쏠려 있어서, 억지로 눌러 균형을 맞추기보다 그 흐름을 그대로 타고 가는 편이 자연스럽다고 봅니다. 그래서 가장 왕성한 ${ohengLabel(
      yongsin
    )} 기운을 용신으로 잡았어요.`;
    confidence = 'low';
  } else if (johu.urgency === 'high' && johu.needed) {
    // ── [2] 조후(調候) 우선 — 얼거나 타는 상황이 먼저다 ──
    type = '조후';
    yongsin = johu.needed;
    reason = `${johu.reason} 사주에서는 힘의 균형(억부)보다 온도를 맞추는 일이 급할 때 그쪽을 먼저 본다고 하여, ${ohengLabel(
      yongsin
    )} 기운을 용신으로 잡았어요.`;
    confidence = 'high';
  } else if (level === '신강' || level === '극신강') {
    // ── [3] 억부(抑扶) — 강하니 덜어낸다 ──
    type = '억부';
    let group: SipseongGroup;
    if (detail.인성 > detail.비겁) {
      // 인다신왕(印多身旺) — 길러주는 기운이 넘치면 재성으로 조절 (재극인)
      group = '재성';
      reason = `${ilganName} 일간을 길러주는 인성(印星, 배움·후원의 기운)이 넉넉해서 힘이 남는 쪽으로 봅니다. 이럴 때는 ${eulReul(
        '넘치는 인성'
      )} 적당히 눌러줄 ${SIPSEONG_LABEL.재성}, 곧 ${ohengLabel(
        getGroupOheng(me, '재성')
      )} 기운이 약이 된다고 봐요.`;
    } else {
      // 비겁이 많아 신강 — 관성으로 눌러주고, 없으면 식상으로 흘려보낸다
      const cands: Oheng[] = [
        getGroupOheng(me, '관성'),
        getGroupOheng(me, '식상'),
        getGroupOheng(me, '재성'),
      ];
      const picked = pickPresent(cands, elements, 8);
      group = getSipseongGroup(me, picked);
      reason =
        group === '관성'
          ? `${ilganName} 일간과 같은 편인 비겁(比劫, 나와 같은 기운)이 많아 힘이 남는 쪽으로 봅니다. 이럴 때는 ${SIPSEONG_LABEL.관성}, 곧 ${ohengLabel(
              picked
            )} 기운이 고삐를 잡아주면 그 힘이 제대로 쓰인다고 봐요.`
          : `${ilganName} 일간의 힘이 넉넉한 편이라 어딘가로 흘려보낼 통로가 있으면 좋습니다. 원국 사정을 보면 ${SIPSEONG_LABEL[group]}, 곧 ${ohengLabel(
              picked
            )} 기운이 그 통로 역할을 해줄 만해요.`;
    }
    yongsin = getGroupOheng(me, group);
    confidence = level === '신강' ? 'high' : 'medium';
  } else if (level === '신약' || level === '극신약') {
    // ── [4] 억부(抑扶) — 약하니 채운다 ──
    type = '억부';
    const strongest = (['관성', '재성', '식상'] as SipseongGroup[]).reduce(
      (a, b) => (detail[b] > detail[a] ? b : a),
      '관성' as SipseongGroup
    );
    let group: SipseongGroup;
    if (strongest === '관성') {
      // 살중신경(殺重身輕) — 인성으로 살인상생(殺印相生)
      group = '인성';
      reason = `${ilganName} 일간을 눌러오는 관성(官星, 책임·자리의 기운)이 무거운 편이라 힘이 부치는 쪽으로 봅니다. 이럴 때는 ${SIPSEONG_LABEL.인성}, 곧 ${ohengLabel(
        getGroupOheng(me, '인성')
      )} 기운이 그 압박을 배움과 실력으로 바꿔준다고 하여(살인상생, 殺印相生) 용신으로 잡았어요.`;
    } else if (strongest === '재성') {
      // 재다신약(財多身弱) — 비겁·인성으로 감당할 체력을 키운다
      const picked = pickPresent(
        [getGroupOheng(me, '비겁'), getGroupOheng(me, '인성')],
        elements,
        8
      );
      group = getSipseongGroup(me, picked);
      reason = `벌이고 다룰 일(재성, 財星)은 많은데 ${eunNeun(
        `${ilganName} 일간`
      )} 그만큼 든든하지 않은 모양(재다신약, 財多身弱)으로 봅니다. 먼저 내 힘을 키우는 ${SIPSEONG_LABEL[group]}, 곧 ${ohengLabel(
        picked
      )} 기운이 필요하다고 봐요.`;
    } else {
      // 식상이 강해 신약 — 인성으로 새는 기운을 잡아준다 (상관패인)
      const picked = pickPresent(
        [getGroupOheng(me, '인성'), getGroupOheng(me, '비겁')],
        elements,
        8
      );
      group = getSipseongGroup(me, picked);
      reason = `표현하고 내보내는 식상(食傷)의 기운이 커서 ${eunNeun(
        `${ilganName} 일간`
      )} 쉽게 지치는 편으로 봅니다. 빠져나가는 힘을 붙잡아 줄 ${SIPSEONG_LABEL[group]}, 곧 ${ohengLabel(
        picked
      )} 기운이 약이 된다고 봐요.`;
    }
    yongsin = getGroupOheng(me, group);
    confidence = level === '신약' ? 'high' : 'low';
  } else {
    // ── [5] 중화(中和) — 통관 → 조후 → 가장 옅은 기운 순으로 본다 ──
    const bridge = findTonggwan(elements);
    if (bridge) {
      type = '통관';
      yongsin = bridge;
      reason = `힘의 균형은 제법 잘 맞아 있는데, 서로 부딪히는 두 기운이 팽팽하게 맞서 있는 모양으로 봅니다. 이럴 때는 사이에서 다리를 놓아주는 ${ohengLabel(
        yongsin
      )} 기운이 있으면 부딪힘이 소통으로 바뀐다고 하여 용신으로 잡았어요.`;
      confidence = 'medium';
    } else if (johu.needed) {
      type = '조후';
      yongsin = johu.needed;
      reason = `${eunNeun('힘의 균형')} 제법 고르게 잡혀 있어서 억지로 눌러줄 것도, 크게 채울 것도 없는 편으로 봅니다. ${
        johu.reason
      } 그래서 온도를 맞춰주는 ${ohengLabel(yongsin)} 기운을 용신으로 잡았어요.`;
      confidence = 'medium';
    } else {
      type = '억부';
      yongsin = weakestOheng(elements);
      reason = `${eunNeun(
        '힘의 균형'
      )} 고르게 잡힌 편이라 크게 손볼 곳이 없는 사주로 봅니다. 다만 다섯 기운 가운데 ${ohengLabel(
        yongsin
      )} 기운이 가장 옅어서, 그 자리를 채워두면 전체가 더 매끄럽게 돌아간다고 봐요.`;
      confidence = 'low';
    }
  }

  // 희신·기신 자동 도출
  const huisin = SAENG_ME[yongsin];
  const gisin = GEUK_ME[yongsin];

  // 용신이 원국에 거의 없으면 신뢰도를 한 단계 낮춘다
  const yongsinScore = elements[yongsin];
  if (yongsinScore < 5 && confidence === 'high') confidence = 'medium';
  else if (yongsinScore < 3 && confidence === 'medium') confidence = 'low';

  const label = ohengLabel(yongsin);
  const info = OHENG_INFO[yongsin];

  const headlineByType: Record<YongsinType, string> = {
    억부: `${label} 기운으로 힘의 균형을 잡으면 좋아요`,
    조후: `${label} 기운으로 사주의 온도를 맞추면 좋아요`,
    통관: `${label} 기운이 부딪히는 두 기운 사이를 이어주면 좋아요`,
    전왕: `흐름을 거스르기보다 ${label} 기운을 타고 가면 좋아요`,
  };

  const explanation = [
    reason,
    `${eunNeun(label)} ${info.season}·${info.direction}의 기운이자 ${
      YONGSIN_KEYWORD[yongsin]
    }이라, 이 결을 생활에 조금씩 들여놓으면 일이 한결 수월하게 풀린다고 봐요. ${yongsinStrengthPhrase(
      yongsinScore
    )}`,
    `${eulReul(
      `${ohengLabel(huisin)} 기운`
    )} 곁에 두면 용신을 뒤에서 밀어주고(희신, 喜神), ${ohengLabel(
      gisin
    )} 기운은 조금 덜어내면 좋은 쪽(기신, 忌神)으로 봅니다. 나쁜 기운이라기보다 지금의 나에게 조금 과한 것이라고 여기면 편해요.`,
    HUMBLE_TAIL[confidence],
  ].join(' ');

  return {
    yongsin,
    huisin,
    gisin,
    type,
    singang,
    johu,
    explanation,
    headline: `${headlineByType[type]} — ${iGa(`용신(用神)`)} ${label}`,
    advice: YONGSIN_ADVICE[yongsin],
    confidence,
  };
}

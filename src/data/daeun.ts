// ============================================================
// 대운(大運) — 10년 주기 인생의 큰 흐름
//
// 대운이란 태어난 순간부터 10년 단위로 바뀌어 가는 "인생의 계절"입니다.
// 원국(原局, 타고난 여덟 글자)이 변하지 않는 지도라면,
// 대운은 그 지도 위를 지나가는 날씨·계절에 해당합니다.
//
// 산출 규칙 (연구 문서 01_사주분석_항목_전체.md §9-1 기준)
//  1. 방향: 년간(年干)의 음양 + 성별 → "양남음녀 순행, 음남양녀 역행"
//  2. 기둥: 월주(月柱)에서 60갑자 순서대로 앞(순행)/뒤(역행)로 진행
//  3. 대운수: 생일시각에서 다음 절입(순행) / 이전 절입(역행)까지의
//     일수 ÷ 3 (3일 = 1년 대응). 나머지 1은 버리고 2는 올림(= 반올림),
//     결과가 0이면 1로 처리. [학파차이: 72시간 나눗셈으로 소수점까지 쓰는 유파도 있음]
//
// 나이 표기: 이 모듈은 **만 나이** 를 씁니다.
//  - 대운수 N = "태어나서 약 N년이 지난 시점(만 N세 무렵)부터 첫 대운" 으로 근사.
//  - 세는 나이를 쓰는 만세력과 1살 정도 차이가 날 수 있습니다.
//
// 해석 원칙
//  - 순수 함수만 둔다 — 저장소·브라우저 API에 접근하지 않는다.
//  - 겁주지 않는다. 기신(忌神) 대운도 "나쁜 10년"이 아니라 "다지는 10년".
//  - 단정하지 않는다 — "~예요", "~로 봅니다" 체를 유지.
//  - 대운 글자와 용신·희신·기신 대입 시 지지(地支)를 우선한다.
//    [학파차이: 천간 5년/지지 5년 분할설, 동시 작용설도 있으나
//     "대운에서는 지지(환경·계절)의 비중이 크다"는 다수설을 채택]
// ============================================================

import {
  CHEONGAN,
  JIJI,
  getSajuDetail,
  type CheonGan,
  type JiJi,
  type Oheng,
} from './saju';
import { toJulianDayTime, getSolarTerm } from './solar-terms';
import type { YongsinResult } from './yongsin';

// ─── 타입 ──────────────────────────────────────────────────

/** 대운 한 기둥 (10년) */
export interface DaeunPillar {
  /** 0부터 시작하는 순번 */
  index: number;
  /** 시작 나이 — 만 나이 기준 */
  startAge: number;
  /** 끝 나이 — 만 나이 기준 (startAge + 9) */
  endAge: number;
  gan: CheonGan;
  ji: JiJi;
  ganOheng: Oheng;
  jiOheng: Oheng;
  /** 이 대운이 용신을 돕는가 (지지 우선, 지지가 중립이면 천간으로 판정) */
  relation: 'yongsin' | 'huisin' | 'gisin' | 'neutral';
  /** 초보자용 한 줄 해석 — 따뜻하게, 단정 금지 */
  summary: string;
}

/** 대운 전체 결과 */
export interface DaeunResult {
  direction: '순행' | '역행';
  /** 대운수 — 첫 대운이 시작되는 나이 (만 나이 근사, 1~10) */
  daeunSu: number;
  /** 9개 기둥 (대운수 ~ 대운수+89세 커버) */
  pillars: DaeunPillar[];
  /** 현재 나이가 속한 대운 (첫 대운 시작 전이면 null) */
  current: DaeunPillar | null;
  /** 현재 대운 해설 문단 */
  currentReading: string;
  /** 현재 만 나이 — 나이대별 해설의 시제(과거/지금/미래) 판정용 */
  age: number;
}

// ─── 관계별 문구 ────────────────────────────────────────────

/** 관계별 한 줄 해석 — 기신도 겁주지 않는다 */
const RELATION_SUMMARY: Record<DaeunPillar['relation'], string> = {
  yongsin:
    '필요한 기운이 들어오는 시기 — 새로운 시도에 힘이 실리는 때예요.',
  huisin:
    '뒤에서 밀어주는 기운이 함께하는 시기 — 꾸준히 쌓아온 것이 빛을 보기 쉬워요.',
  gisin:
    '속도를 조금 늦추고 다지기 좋은 시기예요. 보호가 되어줄 부적을 곁에 두면 마음이 단단해집니다.',
  neutral: '큰 파도 없이 흘러가는 시기 — 평소의 리듬을 지키면 충분해요.',
};

/** 관계별 짧은 배지 이름 (UI 표기용) */
export const RELATION_BADGE: Record<
  DaeunPillar['relation'],
  { label: string; term: string }
> = {
  yongsin: { label: '힘 실리는 때', term: '용신(用神)운' },
  huisin: { label: '밀어주는 때', term: '희신(喜神)운' },
  gisin: { label: '다지는 때', term: '기신(忌神)운' },
  neutral: { label: '잔잔한 때', term: '평운(平運)' },
};

/** 관계별 어울리는 부적 갈래 안내 (카테고리 이름은 TalismanCategory 문자열 값과 동일) */
export const DAEUN_TALISMAN_SUGGESTION: Record<
  DaeunPillar['relation'],
  { category: '재물' | '학업' | '수호' | '건강'; text: string }
> = {
  yongsin: {
    category: '재물',
    text: '기회가 들어오는 흐름이라, 결실을 비는 재물 부적이 결이 잘 맞아요.',
  },
  huisin: {
    category: '학업',
    text: '차곡차곡 쌓기 좋은 흐름이라, 배움과 성장을 돕는 학업 부적이 잘 어울려요.',
  },
  gisin: {
    category: '수호',
    text: '다지는 시기에는 곁을 지켜주는 수호 부적이 마음을 단단하게 해줘요.',
  },
  neutral: {
    category: '건강',
    text: '흐름이 잔잔할 때는 몸과 마음을 돌보는 건강 부적이 좋은 벗이 돼요.',
  },
};

// ─── 나이대별 해설 ──────────────────────────────────────────
//
// 각 대운 기둥을 "인생 단계(나이대) × 들어오는 기운 × 시제(과거/지금/미래)"로
// 풀어 쓴다. 겁주지 않고, 단정하지 않는다.

/** 나이대(인생 단계) 테마 — 기둥의 중간 나이로 판정 */
function lifeStageOf(midAge: number): { label: string; theme: string } {
  if (midAge < 10)
    return {
      label: '유년기',
      theme: '세상을 처음 배우며 몸과 마음의 바탕이 만들어지는 나이대예요.',
    };
  if (midAge < 20)
    return {
      label: '10대',
      theme: '배움과 자아가 함께 자라는 나이대 — 나답게 크는 것이 가장 큰 공부예요.',
    };
  if (midAge < 30)
    return {
      label: '20대',
      theme: '도전과 인연의 나이대 — 길을 넓게 열어두고 이것저것 부딪혀보기 좋아요.',
    };
  if (midAge < 40)
    return {
      label: '30대',
      theme: '기반을 다지는 나이대 — 일과 관계 모두 뿌리를 내리는 때예요.',
    };
  if (midAge < 50)
    return {
      label: '40대',
      theme: '책임이 커지고 그동안 심어둔 것들이 열매를 맺기 시작하는 나이대예요.',
    };
  if (midAge < 60)
    return {
      label: '50대',
      theme: '거두고 정리하는 나이대 — 건강과 마음의 균형이 점점 중요해져요.',
    };
  if (midAge < 70)
    return {
      label: '60대',
      theme: '지혜를 나누는 나이대 — 쌓아온 것이 주변을 비추기 시작해요.',
    };
  return {
    label: '70대 이후',
    theme: '평안을 누리는 나이대 — 몸을 아끼고 마음을 넉넉히 두면 좋아요.',
  };
}

/** 지지 오행이 실어오는 계절감 */
const OHENG_FLAVOR: Record<Oheng, string> = {
  목: '푸른 나무처럼 새로 뻗어나가는',
  화: '햇살처럼 활짝 피어나는',
  토: '땅처럼 든든하게 다지는',
  금: '열매를 거두듯 여물고 정리하는',
  수: '물처럼 스미고 고요히 흐르는',
};

/** 관계 × 시제별 마무리 문장 */
const RELATION_TENSE: Record<
  DaeunPillar['relation'],
  { past: string; now: string; future: string }
> = {
  yongsin: {
    past: '필요한 기운이 함께했던 구간이라, 그때 겪고 이룬 것들이 지금의 자산이 되어 있을 거예요.',
    now: '필요한 기운이 들어오는 중이라 새로운 시도에 힘이 실려요. 마음이 가는 일이 있다면 미루지 않아도 좋아요.',
    future: '필요한 기운이 들어오는 구간이라 새로운 시도에 힘이 실릴 거예요. 이때를 위해 미리 씨앗을 심어두면 좋아요.',
  },
  huisin: {
    past: '뒤에서 밀어주는 기운이 함께했던 구간이에요. 꾸준히 해온 것들이 이 시기에 빛을 봤을 거예요.',
    now: '뒤에서 밀어주는 기운이 함께하는 중이에요. 쌓아온 것을 믿고 한 걸음씩 나아가기 좋아요.',
    future: '뒤에서 밀어주는 기운이 함께하는 구간이라, 그때까지 쌓아둔 것이 빛을 보기 쉬워요.',
  },
  gisin: {
    past: '속도를 늦추고 다지는 구간이었어요. 힘들게 느꼈다면 그만큼 단단해진 시기이기도 해요.',
    now: '속도를 조금 늦추고 다지기 좋은 때예요. 무리한 확장보다 지금 가진 것을 지키는 쪽이 결이 맞아요.',
    future: '속도를 늦추고 다지는 구간이에요. 미리 겁낼 일은 아니고, 크게 벌리기보다 내실을 쌓는 시기로 삼으면 충분해요.',
  },
  neutral: {
    past: '큰 파도 없이 흘러간 구간이에요. 평범해 보여도 그 잔잔함이 바탕을 만들어줬을 거예요.',
    now: '큰 파도 없이 흘러가는 중이라, 평소의 리듬을 지키는 것만으로 충분해요.',
    future: '큰 파도 없이 잔잔하게 흐르는 구간이에요. 일상의 리듬을 지키며 차분히 보내기 좋아요.',
  },
};

/** 대운 한 기둥의 나이대별 해설 */
export function getPillarReading(
  pillar: DaeunPillar,
  currentAge: number
): { stageLabel: string; text: string } {
  const mid = pillar.startAge + 4.5;
  const stage = lifeStageOf(mid);

  const tense: 'past' | 'now' | 'future' =
    currentAge > pillar.endAge
      ? 'past'
      : currentAge < pillar.startAge
        ? 'future'
        : 'now';

  const ganji = `${pillar.gan.name}${pillar.ji.name}(${pillar.gan.hanja}${pillar.ji.hanja})`;
  const flavor = OHENG_FLAVOR[pillar.jiOheng];

  const opener =
    tense === 'past'
      ? `만 ${pillar.startAge}세부터 ${pillar.endAge}세까지 지나온 ${ganji} 대운이에요.`
      : tense === 'now'
        ? `지금 지나고 있는 만 ${pillar.startAge}세~${pillar.endAge}세의 ${ganji} 대운이에요.`
        : `만 ${pillar.startAge}세부터 ${pillar.endAge}세까지 이어질 ${ganji} 대운이에요.`;

  const text = [
    opener,
    stage.theme,
    `이 구간에는 ${flavor} ${pillar.jiOheng} 기운이 환경처럼 깔려요.`,
    RELATION_TENSE[pillar.relation][tense],
  ].join(' ');

  return { stageLabel: stage.label, text };
}

// ─── 내부 유틸 ──────────────────────────────────────────────

/** 마지막 한글 글자의 받침 유무 (조사 선택용 — 괄호 속 한자는 건너뜀) */
function hasJongseong(word: string): boolean {
  for (let i = word.length - 1; i >= 0; i--) {
    const code = word.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      return (code - 0xac00) % 28 !== 0;
    }
  }
  return false;
}

/** 은/는 */
function eunNeun(word: string): string {
  return word + (hasJongseong(word) ? '은' : '는');
}

/** 12절(節)의 절기 인덱스 — 입춘(0)·경칩(2)·청명(4)…소한(22) */
const MAJOR_TERM_INDEXES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

/** 60갑자 인덱스 → 천간/지지 */
function gapjaOf(idx: number): { gan: CheonGan; ji: JiJi } {
  const i = ((idx % 60) + 60) % 60;
  return { gan: CHEONGAN[i % 10], ji: JIJI[i % 12] };
}

/** 월주(천간·지지)의 60갑자 인덱스 */
function findGapjaIndex(gan: CheonGan, ji: JiJi): number {
  const s = CHEONGAN.indexOf(gan);
  const b = JIJI.indexOf(ji);
  for (let i = 0; i < 60; i++) {
    if (i % 10 === s && i % 12 === b) return i;
  }
  return 0; // 정상 간지라면 도달하지 않음
}

/**
 * 출생 시각 앞뒤의 절입(節入) 시각(JD, KST 기준)을 찾는다.
 * 사주 기준 연도 앞뒤 1년씩, 총 3년치 12절의 절입 시각을 모아 이분한다.
 */
function findAdjacentTermJDs(
  sajuYear: number,
  birthJD: number
): { prev: number; next: number } {
  const jds: number[] = [];
  for (let y = sajuYear - 1; y <= sajuYear + 1; y++) {
    for (const t of MAJOR_TERM_INDEXES) {
      const st = getSolarTerm(y, t);
      jds.push(toJulianDayTime(st.year, st.month, st.day, st.hour, st.minute));
    }
  }
  jds.sort((a, b) => a - b);

  let prev = jds[0];
  let next = jds[jds.length - 1];
  for (const jd of jds) {
    if (jd <= birthJD) prev = jd;
    if (jd > birthJD) {
      next = jd;
      break;
    }
  }
  return { prev, next };
}

/**
 * 대운수 — 절입까지의 일수 ÷ 3.
 * 나머지 1은 버림, 2는 올림(= 반올림과 동치), 0이면 1로 처리. 상한 10.
 */
function calcDaeunSu(days: number): number {
  const su = Math.round(days / 3);
  return Math.min(10, Math.max(1, su));
}

/** 만 나이 계산 */
function fullAge(
  birth: { year: number; month: number; day: number },
  at: Date
): number {
  let age = at.getFullYear() - birth.year;
  const m = at.getMonth() + 1;
  const d = at.getDate();
  if (m < birth.month || (m === birth.month && d < birth.day)) age -= 1;
  return age;
}

/** 오행 → 용신 관계 분류 */
function classifyOheng(
  o: Oheng,
  yongsin: YongsinResult
): DaeunPillar['relation'] {
  if (o === yongsin.yongsin) return 'yongsin';
  if (o === yongsin.huisin) return 'huisin';
  if (o === yongsin.gisin) return 'gisin';
  return 'neutral';
}

// ─── 메인 ──────────────────────────────────────────────────

/**
 * 대운(大運) 산출
 *
 * @param input.birth       양력 생년월일시
 * @param input.gender      성별 ('M' 남 / 'F' 여) — 순행·역행 판정에 필요
 * @param input.yongsin     getYongsin() 결과 — 대운 길흉 판정에 사용
 * @param input.currentDate 현재 시점 (기본 오늘) — 현재 대운 판정용
 */
export function getDaeun(input: {
  birth: { year: number; month: number; day: number; hour: number };
  gender: 'M' | 'F';
  yongsin: YongsinResult;
  currentDate?: Date;
}): DaeunResult {
  const { birth, gender, yongsin } = input;
  const now = input.currentDate ?? new Date();

  const saju = getSajuDetail(birth.year, birth.month, birth.day, birth.hour);

  // 1) 방향 — 양남음녀 순행, 음남양녀 역행
  const yangGan = !saju.yearStem.yin;
  const forward =
    (yangGan && gender === 'M') || (!yangGan && gender === 'F');
  const direction: DaeunResult['direction'] = forward ? '순행' : '역행';

  // 2) 대운수 — 절입까지의 일수 ÷ 3
  const birthJD = toJulianDayTime(birth.year, birth.month, birth.day, birth.hour, 0);
  const { prev, next } = findAdjacentTermJDs(saju.sajuYear, birthJD);
  const days = forward ? next - birthJD : birthJD - prev;
  const daeunSu = calcDaeunSu(days);

  // 3) 대운 기둥 — 월주에서 60갑자를 앞/뒤로 진행 (9개 = 약 90년 커버)
  const monthIdx = findGapjaIndex(saju.monthStem, saju.monthBranch);
  const pillars: DaeunPillar[] = [];
  for (let i = 1; i <= 9; i++) {
    const idx = forward ? monthIdx + i : monthIdx - i;
    const { gan, ji } = gapjaOf(idx);

    // 용신 대입 — 지지(환경·계절)를 우선하고, 지지가 중립이면 천간으로 본다
    const jiRel = classifyOheng(ji.oheng, yongsin);
    const ganRel = classifyOheng(gan.oheng, yongsin);
    const relation = jiRel !== 'neutral' ? jiRel : ganRel;

    const startAge = daeunSu + (i - 1) * 10;
    pillars.push({
      index: i - 1,
      startAge,
      endAge: startAge + 9,
      gan,
      ji,
      ganOheng: gan.oheng,
      jiOheng: ji.oheng,
      relation,
      summary: RELATION_SUMMARY[relation],
    });
  }

  // 4) 현재 대운 (만 나이 기준)
  const age = fullAge(birth, now);
  const current =
    pillars.find((p) => age >= p.startAge && age <= p.endAge) ?? null;

  // 5) 현재 대운 해설
  let currentReading: string;
  if (!current) {
    if (age < daeunSu) {
      currentReading = `아직 첫 대운이 시작되기 전이에요. 만 ${daeunSu}세 무렵부터 첫 번째 큰 흐름이 들어온다고 봅니다. 그 전까지는 타고난 원국(原局)의 기운이 삶의 바탕을 그려가는 시기예요.`;
    } else {
      currentReading = `표에 담긴 아홉 번의 큰 흐름을 모두 지나오신 시기예요. 이때부터는 대운보다 한 해 한 해의 운(세운)과 스스로 다져온 리듬이 더 크게 작용한다고 봅니다.`;
    }
  } else {
    const ganji = `${current.gan.name}${current.ji.name}(${current.gan.hanja}${current.ji.hanja})`;
    const nextPillar = pillars[current.index + 1] ?? null;
    const parts = [
      `지금은 만 ${current.startAge}세부터 ${current.endAge}세까지 이어지는 ${ganji} 대운을 지나는 중이에요.`,
      `위쪽 글자 ${eunNeun(`${current.gan.name}(${current.gan.hanja})`)} ${current.ganOheng} 기운을, 아래쪽 글자 ${eunNeun(`${current.ji.name}(${current.ji.hanja})`)} ${current.jiOheng} 기운을 실어오는데, 대운에서는 환경과 계절을 뜻하는 아래쪽 글자의 비중을 조금 더 크게 봅니다.`,
      current.summary,
    ];
    if (nextPillar) {
      parts.push(
        `다음 흐름은 만 ${nextPillar.startAge}세 무렵에 바뀌어요. 대운이 바뀌는 앞뒤 한두 해는 변화가 잦다고 보니, 그 즈음에는 조금 여유를 두고 움직이면 좋아요.`
      );
    }
    currentReading = parts.join(' ');
  }

  return { direction, daeunSu, pillars, current, currentReading, age };
}

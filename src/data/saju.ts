// ============================================================
// 사주 (四柱) 계산 유틸리티
// 천간(天干), 지지(地支), 오행(五行) 기반 사주팔자 산출
// ============================================================

import {
  getSajuYear,
  getMonthBranchIndex,
  getIpchun,
  getSolarTerm,
  SOLAR_TERM_NAMES,
} from './solar-terms';

// 절기 관련 유틸을 saju 모듈에서도 그대로 노출 (외부 사용 편의)
export { getSajuYear, getMonthBranchIndex, getIpchun, getSolarTerm, SOLAR_TERM_NAMES };

/** 오행 (五行) */
export type Oheng = '목' | '화' | '토' | '금' | '수';

/** 천간 (天干) 10간 */
export interface CheonGan {
  name: string;
  hanja: string;
  oheng: Oheng;
  yin: boolean; // 음양: false=양, true=음
}

/** 지지 (地支) 12지 */
export interface JiJi {
  name: string;
  hanja: string;
  oheng: Oheng;
  animal: string;
  emoji: string;
  yin: boolean;
}

/** 사주팔자 결과 */
export interface SajuResult {
  yearStem: CheonGan;
  yearBranch: JiJi;
  monthStem: CheonGan;
  monthBranch: JiJi;
  dayStem: CheonGan;
  dayBranch: JiJi;
  hourStem: CheonGan;
  hourBranch: JiJi;
}

/** 오행 점수 */
export interface OhengScore {
  목: number;
  화: number;
  토: number;
  금: number;
  수: number;
}

/** 사주 계산 옵션 */
export interface SajuOptions {
  /**
   * 야자시(夜子時) 처리 방식.
   * false(기본) : 23:00~23:59 도 당일 일주 그대로 사용 — 한국 만세력 관행(자정 기준)
   * true        : 23:00 부터 다음날 일주로 넘김 — 중국식 자시 기준
   */
  lateNightZi?: boolean;
}

/** 삼재 판단 결과 */
export interface SamjaeResult {
  is: boolean;
  type: '들삼재' | '눌삼재' | '날삼재' | null;
}

/** 띠 동물 정보 */
export interface AnimalInfo {
  name: string;
  emoji: string;
  element: Oheng;
}

// ─── 천간 데이터 ────────────────────────────────────────────
export const CHEONGAN: CheonGan[] = [
  { name: '갑', hanja: '甲', oheng: '목', yin: false },
  { name: '을', hanja: '乙', oheng: '목', yin: true },
  { name: '병', hanja: '丙', oheng: '화', yin: false },
  { name: '정', hanja: '丁', oheng: '화', yin: true },
  { name: '무', hanja: '戊', oheng: '토', yin: false },
  { name: '기', hanja: '己', oheng: '토', yin: true },
  { name: '경', hanja: '庚', oheng: '금', yin: false },
  { name: '신', hanja: '辛', oheng: '금', yin: true },
  { name: '임', hanja: '壬', oheng: '수', yin: false },
  { name: '계', hanja: '癸', oheng: '수', yin: true },
];

// ─── 지지 데이터 ────────────────────────────────────────────
export const JIJI: JiJi[] = [
  { name: '자', hanja: '子', oheng: '수', animal: '쥐', emoji: '🐭', yin: false },
  { name: '축', hanja: '丑', oheng: '토', animal: '소', emoji: '🐮', yin: true },
  { name: '인', hanja: '寅', oheng: '목', animal: '호랑이', emoji: '🐯', yin: false },
  { name: '묘', hanja: '卯', oheng: '목', animal: '토끼', emoji: '🐰', yin: true },
  { name: '진', hanja: '辰', oheng: '토', animal: '용', emoji: '🐲', yin: false },
  { name: '사', hanja: '巳', oheng: '화', animal: '뱀', emoji: '🐍', yin: true },
  { name: '오', hanja: '午', oheng: '화', animal: '말', emoji: '🐴', yin: false },
  { name: '미', hanja: '未', oheng: '토', animal: '양', emoji: '🐑', yin: true },
  { name: '신', hanja: '申', oheng: '금', animal: '원숭이', emoji: '🐵', yin: false },
  { name: '유', hanja: '酉', oheng: '금', animal: '닭', emoji: '🐔', yin: true },
  { name: '술', hanja: '戌', oheng: '토', animal: '개', emoji: '🐶', yin: false },
  { name: '해', hanja: '亥', oheng: '수', animal: '돼지', emoji: '🐷', yin: true },
];

// ─── 월주 천간 산출 테이블 (년간 기준 월간 조견표) ───────────
// 갑/기년 → 병인월, 을/경년 → 무인월, 병/신년 → 경인월,
// 정/임년 → 임인월, 무/계년 → 갑인월
// (년간 index % 5) 로 조회한다. 갑(0)·기(5) → 2(병), 을(1)·경(6) → 4(무) ...
const MONTH_STEM_BASE: number[] = [2, 4, 6, 8, 0];

// ─── 시주 천간 산출 테이블 (일간 기준 시간 조견표) ─────────────
// 갑/기일 → 갑자시, 을/경일 → 병자시, 병/신일 → 무자시,
// 정/임일 → 경자시, 무/계일 → 임자시
// (일간 index % 5) 로 조회한다.
const HOUR_STEM_BASE: number[] = [0, 2, 4, 6, 8];

// ─── 60갑자 기준점 ────────────────────────────────────────
// 서기 4년(갑자년)을 기준으로 (년 - 4) % 60 이 60갑자 순번이 된다.
const YEAR_GAPJA_OFFSET = 4;

// ─── 일주(日柱) 기준점 ────────────────────────────────────
// 율리우스적일수(JDN) 기준 60갑자 순번 = (JDN + 49) % 60
// 검증: 2000-01-01 (JDN 2451545) → (2451545+49)%60 = 54 → 무오(戊午)일
//       1900-01-01 (JDN 2415021) → 갑술(甲戌)일
const DAY_GAPJA_OFFSET = 49;

/**
 * 율리우스 적일수(JDN) 계산 (그레고리력 기준, 정수)
 */
function toJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * 년주 (年柱) 계산 — 만세력 기준
 *
 * 사주의 한 해는 양력 1월 1일이 아니라 **입춘(立春)** 에 시작된다.
 * 예) 1990-01-20 생 → 아직 1990년 입춘(2/4) 전이므로 1989년(기사년) 생으로 본다.
 *
 * @param year  양력 연도
 * @param month 양력 월 (1-12)
 * @param day   양력 일
 * @param hour  시 (0-23)
 */
function getYearPillar(
  year: number,
  month: number,
  day: number,
  hour: number
): { stem: CheonGan; branch: JiJi; sajuYear: number } {
  const sajuYear = getSajuYear(year, month, day, hour);
  const idx = sajuYear - YEAR_GAPJA_OFFSET;
  const stemIdx = ((idx % 10) + 10) % 10;
  const branchIdx = ((idx % 12) + 12) % 12;
  return { stem: CHEONGAN[stemIdx], branch: JIJI[branchIdx], sajuYear };
}

/**
 * 월주 (月柱) 계산 — 만세력 기준
 *
 * 월지(月支)는 달력의 월이 아니라 **12절(節)의 절입일** 로 나뉜다.
 *   입춘~경칩 = 인월(寅), 경칩~청명 = 묘월(卯), ... 소한~입춘 = 축월(丑)
 * 월간(月干)은 년간(年干)에 따른 조견표로 결정한다.
 *   월간 = (MONTH_STEM_BASE[년간 % 5] + 인월로부터의 개월수) % 10
 *
 * @param yearStemIdx 년간(年干) 인덱스 0-9
 */
function getMonthPillar(
  year: number,
  month: number,
  day: number,
  hour: number,
  yearStemIdx: number
): { stem: CheonGan; branch: JiJi } {
  // 절기 기반 월지
  const branchIdx = getMonthBranchIndex(year, month, day, hour);

  // 인월(寅, index 2)을 0번째로 세었을 때의 순번
  const monthsFromIn = ((branchIdx - 2) % 12 + 12) % 12;

  const baseIdx = MONTH_STEM_BASE[((yearStemIdx % 5) + 5) % 5];
  const stemIdx = (baseIdx + monthsFromIn) % 10;

  return { stem: CHEONGAN[stemIdx], branch: JIJI[branchIdx] };
}

/**
 * 일주 (日柱) 계산
 * 율리우스 적일수 기반 60갑자 순환.
 * (하루의 경계는 자정 00:00 기준 = 조자시(朝子時) 방식)
 */
function getDayPillar(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  options: SajuOptions = {}
): { stem: CheonGan; branch: JiJi } {
  let jd = toJulianDay(year, month, day);
  // 야자시 옵션: 23시 이후는 다음날 일주로 본다
  if (options.lateNightZi && hour >= 23) jd += 1;
  const gapja = ((jd + DAY_GAPJA_OFFSET) % 60 + 60) % 60;
  return { stem: CHEONGAN[gapja % 10], branch: JIJI[gapja % 12] };
}

/**
 * 시주 (時柱) 계산
 *
 * 시지(時支): 23-01시 자(子), 01-03 축(丑), 03-05 인(寅) ... 21-23 해(亥)
 * 시간(時干): 일간(日干) 기준 조견표
 *   시간 = (HOUR_STEM_BASE[일간 % 5] + 시지 인덱스) % 10
 */
function getHourPillar(
  year: number,
  month: number,
  day: number,
  hour: number,
  options: SajuOptions = {}
): { stem: CheonGan; branch: JiJi } {
  // 시지 계산 (23시~00시 59분은 자시)
  const branchIdx = Math.floor(((hour + 1) % 24) / 2);

  // 시간: 일간에 따라 결정
  const dayStemIdx = CHEONGAN.indexOf(
    getDayPillar(year, month, day, hour, options).stem
  );
  const baseIdx = HOUR_STEM_BASE[((dayStemIdx % 5) + 5) % 5];
  const stemIdx = (baseIdx + branchIdx) % 10;

  return { stem: CHEONGAN[stemIdx], branch: JIJI[branchIdx] };
}

/**
 * 사주팔자 산출 (만세력 · 24절기 기반)
 *
 * - 년주: 입춘(立春) 기준으로 해가 바뀐다
 * - 월주: 12절(節)의 절입 시각 기준으로 달이 바뀐다
 * - 일주: 율리우스 적일수 기반 60갑자
 * - 시주: 2시간 단위 12지 + 일간 기준 조견표
 *
 * @param year 출생년 (양력)
 * @param month 출생월 (1-12)
 * @param day 출생일 (1-31)
 * @param hour 출생시 (0-23)
 */
export function getSaju(
  year: number,
  month: number,
  day: number,
  hour: number,
  options: SajuOptions = {}
): SajuResult {
  const yearPillar = getYearPillar(year, month, day, hour);
  const yearStemIdx = CHEONGAN.indexOf(yearPillar.stem);
  const monthPillar = getMonthPillar(year, month, day, hour, yearStemIdx);
  const dayPillar = getDayPillar(year, month, day, hour, options);
  const hourPillar = getHourPillar(year, month, day, hour, options);

  return {
    yearStem: yearPillar.stem,
    yearBranch: yearPillar.branch,
    monthStem: monthPillar.stem,
    monthBranch: monthPillar.branch,
    dayStem: dayPillar.stem,
    dayBranch: dayPillar.branch,
    hourStem: hourPillar.stem,
    hourBranch: hourPillar.branch,
  };
}

/**
 * 사주 상세 정보 (사주 기준 연도 포함)
 * 입춘 이전 출생자의 실제 사주 연도를 알아야 할 때 사용한다.
 */
export function getSajuDetail(
  year: number,
  month: number,
  day: number,
  hour: number,
  options: SajuOptions = {}
): SajuResult & { sajuYear: number; monthBranchIndex: number } {
  const yearPillar = getYearPillar(year, month, day, hour);
  const yearStemIdx = CHEONGAN.indexOf(yearPillar.stem);
  const monthPillar = getMonthPillar(year, month, day, hour, yearStemIdx);
  const dayPillar = getDayPillar(year, month, day, hour, options);
  const hourPillar = getHourPillar(year, month, day, hour, options);

  return {
    yearStem: yearPillar.stem,
    yearBranch: yearPillar.branch,
    monthStem: monthPillar.stem,
    monthBranch: monthPillar.branch,
    dayStem: dayPillar.stem,
    dayBranch: dayPillar.branch,
    hourStem: hourPillar.stem,
    hourBranch: hourPillar.branch,
    sajuYear: yearPillar.sajuYear,
    monthBranchIndex: getMonthBranchIndex(year, month, day, hour),
  };
}

/**
 * 사주팔자를 "갑자" 형태의 문자열 4개로 반환 (검증/표시용)
 */
export function getSajuText(
  year: number,
  month: number,
  day: number,
  hour: number,
  options: SajuOptions = {}
): { year: string; month: string; day: string; hour: string } {
  const s = getSaju(year, month, day, hour, options);
  return {
    year: s.yearStem.name + s.yearBranch.name,
    month: s.monthStem.name + s.monthBranch.name,
    day: s.dayStem.name + s.dayBranch.name,
    hour: s.hourStem.name + s.hourBranch.name,
  };
}

/**
 * 오행 점수 계산 (각 0-100)
 * 사주팔자 8글자의 오행 분포를 점수화
 */
export function getOheng(saju: SajuResult): OhengScore {
  const counts: OhengScore = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

  // 천간 4개 + 지지 4개 = 8주의 오행 집계
  const elements: Oheng[] = [
    saju.yearStem.oheng,
    saju.yearBranch.oheng,
    saju.monthStem.oheng,
    saju.monthBranch.oheng,
    saju.dayStem.oheng,
    saju.dayBranch.oheng,
    saju.hourStem.oheng,
    saju.hourBranch.oheng,
  ];

  for (const el of elements) {
    counts[el] += 1;
  }

  // 8개 중 각 개수를 비율로 환산 (최대 비율 보정)
  // 기본: 1개=12.5, 2개=25, ..., 8개=100
  // 보정: 없는 오행=0, 있는 오행은 상대 비율로 0-100 매핑
  const maxCount = Math.max(...Object.values(counts), 1);
  const score: OhengScore = {
    목: Math.round((counts.목 / maxCount) * 100),
    화: Math.round((counts.화 / maxCount) * 100),
    토: Math.round((counts.토 / maxCount) * 100),
    금: Math.round((counts.금 / maxCount) * 100),
    수: Math.round((counts.수 / maxCount) * 100),
  };

  return score;
}

/**
 * 띠 동물 조회
 *
 * 띠(생년 지지) 역시 만세력에서는 **입춘** 을 기준으로 바뀐다.
 * 월/일이 함께 주어지면 입춘 경계를 반영해 정확한 띠를 돌려준다.
 * (기존 호출부 호환을 위해 year 만 넘기면 양력 연도 기준으로 동작한다.)
 *
 * @param year 출생년도
 * @param month 출생월 (선택)
 * @param day 출생일 (선택)
 * @param hour 출생시 (선택, 기본 12시)
 */
export function getAnimal(
  year: number,
  month?: number,
  day?: number,
  hour: number = 12
): AnimalInfo {
  const y =
    month !== undefined && day !== undefined
      ? getSajuYear(year, month, day, hour)
      : year;
  const idx = ((y - 4) % 12 + 12) % 12;
  const ji = JIJI[idx];
  return {
    name: ji.animal,
    emoji: ji.emoji,
    element: ji.oheng,
  };
}

// ─── 삼재 (三災) 판별 ──────────────────────────────────────
// 삼재 그룹 (지지 기준):
// 신자진(申子辰) 생 → 인묘진(寅卯辰) 해에 삼재
// 인오술(寅午戌) 생 → 신유술(申酉戌) 해에 삼재
// 사유축(巳酉丑) 생 → 해자축(亥子丑) 해에 삼재
// 해묘미(亥卯未) 생 → 사오미(巳午未) 해에 삼재

const SAMJAE_GROUPS: { birth: number[]; disaster: number[] }[] = [
  { birth: [8, 0, 4], disaster: [2, 3, 4] },   // 신자진 → 인묘진
  { birth: [2, 6, 10], disaster: [8, 9, 10] },  // 인오술 → 신유술
  { birth: [5, 9, 1], disaster: [11, 0, 1] },   // 사유축 → 해자축
  { birth: [11, 3, 7], disaster: [5, 6, 7] },   // 해묘미 → 사오미
];

const SAMJAE_TYPES: ('들삼재' | '눌삼재' | '날삼재')[] = [
  '들삼재',
  '눌삼재',
  '날삼재',
];

/**
 * 삼재 판별
 *
 * 출생 연도의 지지(띠) 그룹과 대상 연도의 지지로 판정한다.
 * 정확한 입춘 경계가 필요하면 미리 getSajuYear() 로 변환한 값을 넘긴다.
 *
 * @param year 대상 연도 (올해)
 * @param birthYear 출생 연도 (사주 기준 연도)
 */
export function isSamjae(year: number, birthYear: number): SamjaeResult {
  const birthBranchIdx = ((birthYear - 4) % 12 + 12) % 12;
  const yearBranchIdx = ((year - 4) % 12 + 12) % 12;

  for (const group of SAMJAE_GROUPS) {
    if (group.birth.includes(birthBranchIdx)) {
      const disasterPos = group.disaster.indexOf(yearBranchIdx);
      if (disasterPos !== -1) {
        return {
          is: true,
          type: SAMJAE_TYPES[disasterPos],
        };
      }
      return { is: false, type: null };
    }
  }

  return { is: false, type: null };
}

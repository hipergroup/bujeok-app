// ============================================================
// 사주 (四柱) 계산 유틸리티
// 천간(天干), 지지(地支), 오행(五行) 기반 사주팔자 산출
// ============================================================

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

// ─── 월주 천간 산출 테이블 (년간 기준) ────────────────────────
// 갑/기년 → 병인월, 을/경년 → 무인월, 병/신년 → 경인월, 정/임년 → 임인월, 무/계년 → 갑인월
const MONTH_STEM_BASE: number[] = [2, 4, 6, 8, 0]; // 년간 인덱스 0-1→2, 2-3→4, ...

// ─── 시주 천간 산출 테이블 (일간 기준) ────────────────────────
const HOUR_STEM_BASE: number[] = [0, 2, 4, 6, 8]; // 일간 인덱스 0-1→0, 2-3→2, ...

// ─── 기준일: 1900년 1월 1일은 경자(庚子)일 → 천간6(경), 지지0(자) ───
const BASE_YEAR = 1900;
const BASE_YEAR_STEM = 6; // 경(庚) = index 6
const BASE_YEAR_BRANCH = 0; // 자(子) = index 0

// ─── 일주 계산용 기준점 (1900-01-01 = 경자일, JD 기반) ───────
const BASE_JD_STEM = 6; // 경 = 6
const BASE_JD_BRANCH = 0; // 자 = 0

/**
 * 율리우스 일수 계산 (그레고리력 기준)
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

const BASE_JD = toJulianDay(1900, 1, 1);

/**
 * 년주 (年柱) 계산
 * 음력 기준으로는 입춘 이전이면 전년도지만 간략화하여 양력 기준 사용
 */
function getYearPillar(year: number): { stem: CheonGan; branch: JiJi } {
  const diff = year - BASE_YEAR;
  const stemIdx = ((BASE_YEAR_STEM + diff) % 10 + 10) % 10;
  const branchIdx = ((BASE_YEAR_BRANCH + diff) % 12 + 12) % 12;
  return { stem: CHEONGAN[stemIdx], branch: JIJI[branchIdx] };
}

/**
 * 월주 (月柱) 계산
 * 음력 월 기반, 간략화: month(1-12)를 지지 인(寅)=1월 기준으로 매핑
 */
function getMonthPillar(
  year: number,
  month: number
): { stem: CheonGan; branch: JiJi } {
  // 월지: 1월=인(2), 2월=묘(3), ... 11월=자(0), 12월=축(1)
  const branchIdx = (month + 1) % 12;

  // 월간: 년간에 따라 결정
  const yearStemIdx = getYearPillar(year).stem
    ? CHEONGAN.indexOf(getYearPillar(year).stem)
    : 0;
  const baseIdx = MONTH_STEM_BASE[Math.floor(yearStemIdx / 2) % 5];
  const stemIdx = (baseIdx + (month - 1)) % 10;

  return { stem: CHEONGAN[stemIdx], branch: JIJI[branchIdx] };
}

/**
 * 일주 (日柱) 계산
 * 율리우스 일수 차이 기반
 */
function getDayPillar(
  year: number,
  month: number,
  day: number
): { stem: CheonGan; branch: JiJi } {
  const jd = toJulianDay(year, month, day);
  const diff = jd - BASE_JD;
  const stemIdx = ((BASE_JD_STEM + diff) % 10 + 10) % 10;
  const branchIdx = ((BASE_JD_BRANCH + diff) % 12 + 12) % 12;
  return { stem: CHEONGAN[stemIdx], branch: JIJI[branchIdx] };
}

/**
 * 시주 (時柱) 계산
 * 시간(0-23)을 2시간 단위 지지로 매핑
 * 23-01:자, 01-03:축, 03-05:인, ... 21-23:해
 */
function getHourPillar(
  year: number,
  month: number,
  day: number,
  hour: number
): { stem: CheonGan; branch: JiJi } {
  // 시지 계산
  const branchIdx = Math.floor(((hour + 1) % 24) / 2);

  // 시간: 일간에 따라 결정
  const dayStemIdx = CHEONGAN.indexOf(getDayPillar(year, month, day).stem);
  const baseIdx = HOUR_STEM_BASE[Math.floor(dayStemIdx / 2) % 5];
  const stemIdx = (baseIdx + branchIdx) % 10;

  return { stem: CHEONGAN[stemIdx], branch: JIJI[branchIdx] };
}

/**
 * 사주팔자 산출
 * @param year 출생년 (양력)
 * @param month 출생월 (1-12)
 * @param day 출생일 (1-31)
 * @param hour 출생시 (0-23)
 */
export function getSaju(
  year: number,
  month: number,
  day: number,
  hour: number
): SajuResult {
  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month);
  const dayPillar = getDayPillar(year, month, day);
  const hourPillar = getHourPillar(year, month, day, hour);

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
 * @param year 출생년도
 */
export function getAnimal(year: number): AnimalInfo {
  const idx = ((year - 4) % 12 + 12) % 12;
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
 * @param year 대상 연도 (올해)
 * @param birthYear 출생 연도
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

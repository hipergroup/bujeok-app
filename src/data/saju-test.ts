// ============================================================
// 만세력 사주 계산 검증 테스트
// ------------------------------------------------------------
// 아래 기대값은 한국천문연구원(KASI) 절기 시각 및
// 전통 만세력(60갑자)과 교차 검증한 값이다.
//
// 브라우저/노드 어디서든 runTests() 만 호출하면 된다.
//   import { runTests } from '@/data/saju-test';
//   console.table(runTests().results);
// ============================================================

import { getSajuText } from './saju';
import { getIpchun, getSolarTerm, getMonthBranchIndex, getSajuYear } from './solar-terms';

/** 사주팔자 기대값 */
export interface SajuExpectation {
  year: string;
  month: string;
  day: string;
  hour: string;
}

/** 테스트 케이스 */
export interface SajuTestCase {
  /** [년, 월, 일, 시] (양력 · KST) */
  input: [number, number, number, number];
  expected: SajuExpectation;
  note: string;
}

// ------------------------------------------------------------
// 1. 사주팔자 테스트 케이스
// ------------------------------------------------------------
export const TEST_CASES: SajuTestCase[] = [
  {
    // 1990년 입춘은 2/4 11:14 → 1/20 은 아직 기사년(己巳年)
    input: [1990, 1, 20, 12],
    expected: { year: '기사', month: '정축', day: '을유', hour: '임오' },
    note: '입춘 전 출생 → 전년도(기사년) 적용, 월지도 축월',
  },
  {
    // 2000년 경칩은 3/5 15:42 → 3/3 은 아직 인월(寅月)
    input: [2000, 3, 3, 12],
    expected: { year: '경진', month: '무인', day: '경신', hour: '임오' },
    note: '경칩 전 → 묘월이 아니라 인월',
  },
  {
    // 1984년 입춘은 2/5 00:18 → 2/4 는 아직 계해년
    input: [1984, 2, 4, 12],
    expected: { year: '계해', month: '을축', day: '무진', hour: '무오' },
    note: '갑자년 시작 직전 (입춘 2/5 00:18)',
  },
  {
    input: [1984, 2, 5, 12],
    expected: { year: '갑자', month: '병인', day: '기사', hour: '경오' },
    note: '갑자년(甲子年) 첫날 — 60갑자 원점',
  },
  {
    // 2024년 입춘 2/4 17:27 → 17시는 아직 계묘년
    input: [2024, 2, 4, 17],
    expected: { year: '계묘', month: '을축', day: '무술', hour: '신유' },
    note: '입춘 당일 절입 시각 직전 (17:27 이전)',
  },
  {
    input: [2024, 2, 4, 18],
    expected: { year: '갑진', month: '병인', day: '무술', hour: '신유' },
    note: '입춘 당일 절입 시각 직후 → 갑진년/인월로 전환',
  },
  {
    // 2010년 입추 8/7 23:49
    input: [2010, 8, 7, 9],
    expected: { year: '경인', month: '계미', day: '기축', hour: '기사' },
    note: '입추 절입 전 → 미월',
  },
  {
    input: [2010, 8, 8, 9],
    expected: { year: '경인', month: '갑신', day: '경인', hour: '신사' },
    note: '입추 절입 후 → 신월',
  },
  {
    // 2004년 청명 4/4 19:43
    input: [2004, 4, 4, 13],
    expected: { year: '갑신', month: '정묘', day: '계축', hour: '기미' },
    note: '청명 절입 전 → 진월이 아니라 묘월',
  },
  {
    // 1999년 입춘 2/4 15:57
    input: [1999, 2, 4, 3],
    expected: { year: '무인', month: '을축', day: '정해', hour: '임인' },
    note: '입춘 당일 새벽 → 아직 무인년/축월',
  },
  {
    // 일주 기준점 검증: 2000-01-01 = 무오일 (JDN 2451545)
    input: [2000, 1, 1, 12],
    expected: { year: '기묘', month: '병자', day: '무오', hour: '무오' },
    note: '일주 기준점 검증 (2000-01-01 = 무오일)',
  },
  {
    // 일주 기준점 검증: 1900-01-01 = 갑술일
    input: [1900, 1, 1, 12],
    expected: { year: '기해', month: '병자', day: '갑술', hour: '경오' },
    note: '일주 기준점 검증 (1900-01-01 = 갑술일)',
  },
  {
    input: [1970, 7, 15, 7],
    expected: { year: '경술', month: '계미', day: '병신', hour: '임진' },
    note: '일반 케이스 (절기 경계와 무관)',
  },
  {
    input: [1966, 10, 8, 22],
    expected: { year: '병오', month: '정유', day: '경자', hour: '정해' },
    note: '한로(10/9) 직전 → 유월 유지, 해시',
  },
  {
    input: [2012, 12, 21, 11],
    expected: { year: '임진', month: '임자', day: '병진', hour: '갑오' },
    note: '동지 무렵 (대설 이후 → 자월)',
  },
  {
    input: [2025, 6, 15, 4],
    expected: { year: '을사', month: '임오', day: '을묘', hour: '무인' },
    note: '망종 이후 → 오월, 인시',
  },
  {
    input: [2023, 12, 31, 23],
    expected: { year: '계묘', month: '갑자', day: '계해', hour: '임자' },
    note: '23시 = 자시 (기본값은 자정 기준 일주 유지)',
  },
  {
    input: [2000, 1, 1, 0],
    expected: { year: '기묘', month: '병자', day: '무오', hour: '임자' },
    note: '0시 = 자시',
  },
  {
    input: [2100, 12, 25, 20],
    expected: { year: '경신', month: '무자', day: '신축', hour: '무술' },
    note: '계산 범위 상한(2100년) 검증',
  },
];

// ------------------------------------------------------------
// 2. 입춘 절입 시각 테스트 케이스 (KST)
// ------------------------------------------------------------
export interface IpchunTestCase {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export const IPCHUN_TEST_CASES: IpchunTestCase[] = [
  { year: 2024, month: 2, day: 4, hour: 17, minute: 27 },
  { year: 2025, month: 2, day: 3, hour: 23, minute: 10 },
  { year: 2020, month: 2, day: 4, hour: 18, minute: 3 },
  { year: 2000, month: 2, day: 4, hour: 21, minute: 40 },
  { year: 1990, month: 2, day: 4, hour: 11, minute: 14 },
  { year: 1984, month: 2, day: 5, hour: 0, minute: 18 },
];

/** 절입 시각 허용 오차 (분) */
export const TOLERANCE_MINUTES = 1;

// ------------------------------------------------------------
// 3. 테스트 실행기
// ------------------------------------------------------------

export interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  note?: string;
}

export interface TestReport {
  passed: number;
  failed: number;
  results: TestResult[];
}

/**
 * 전체 검증 실행
 * - 사주팔자 4주 일치 여부
 * - 입춘 절입 시각 (±1분)
 * - 년/월 경계 로직 (getSajuYear / getMonthBranchIndex)
 */
export function runTests(): TestReport {
  const results: TestResult[] = [];

  // ── 3-1. 사주팔자 ──────────────────────────────────────
  for (const tc of TEST_CASES) {
    const [y, m, d, h] = tc.input;
    const actual = getSajuText(y, m, d, h);
    const exp = `${tc.expected.year} ${tc.expected.month} ${tc.expected.day} ${tc.expected.hour}`;
    const act = `${actual.year} ${actual.month} ${actual.day} ${actual.hour}`;
    results.push({
      name: `사주 ${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${h}시`,
      passed: exp === act,
      expected: exp,
      actual: act,
      note: tc.note,
    });
  }

  // ── 3-2. 입춘 절입 시각 ────────────────────────────────
  for (const tc of IPCHUN_TEST_CASES) {
    const ip = getIpchun(tc.year);
    const expMin = tc.day * 1440 + tc.hour * 60 + tc.minute;
    const actMin = ip.day * 1440 + ip.hour * 60 + ip.minute;
    const ok =
      ip.month === tc.month && Math.abs(expMin - actMin) <= TOLERANCE_MINUTES;
    results.push({
      name: `입춘 ${tc.year}`,
      passed: ok,
      expected: `${tc.month}/${tc.day} ${pad(tc.hour)}:${pad(tc.minute)}`,
      actual: `${ip.month}/${ip.day} ${pad(ip.hour)}:${pad(ip.minute)}`,
      note: 'KST · 허용오차 ±1분',
    });
  }

  // ── 3-3. 년 경계 (입춘) 로직 ───────────────────────────
  const yearBoundary: { input: [number, number, number, number]; expected: number }[] = [
    { input: [1990, 1, 20, 12], expected: 1989 },
    { input: [1990, 2, 4, 10], expected: 1989 }, // 입춘 11:14 이전
    { input: [1990, 2, 4, 12], expected: 1990 }, // 입춘 이후
    { input: [2024, 2, 4, 17], expected: 2023 },
    { input: [2024, 2, 4, 18], expected: 2024 },
    { input: [2024, 12, 31, 23], expected: 2024 },
    { input: [2025, 2, 3, 22], expected: 2024 }, // 입춘 2/3 23:10 이전
    { input: [2025, 2, 4, 0], expected: 2025 },
  ];
  for (const tc of yearBoundary) {
    const [y, m, d, h] = tc.input;
    const actual = getSajuYear(y, m, d, h);
    results.push({
      name: `사주년도 ${y}-${m}-${d} ${h}시`,
      passed: actual === tc.expected,
      expected: String(tc.expected),
      actual: String(actual),
      note: '입춘 기준 년주 경계',
    });
  }

  // ── 3-4. 월지(절기) 경계 로직 ──────────────────────────
  const branchNames = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  const monthBoundary: { input: [number, number, number, number]; expected: string }[] = [
    { input: [2000, 3, 3, 12], expected: '인' }, // 경칩(3/5) 전
    { input: [2000, 3, 6, 12], expected: '묘' }, // 경칩 후
    { input: [2010, 8, 7, 9], expected: '미' }, // 입추(8/7 23:49) 전
    { input: [2010, 8, 8, 9], expected: '신' }, // 입추 후
    { input: [2004, 4, 4, 13], expected: '묘' }, // 청명(4/4 19:43) 전
    { input: [2004, 4, 4, 21], expected: '진' }, // 청명 후
    { input: [2024, 1, 5, 12], expected: '자' }, // 소한(1/6) 전 → 자월
    { input: [2024, 1, 7, 12], expected: '축' }, // 소한 후 → 축월
  ];
  for (const tc of monthBoundary) {
    const [y, m, d, h] = tc.input;
    const actual = branchNames[getMonthBranchIndex(y, m, d, h)];
    results.push({
      name: `월지 ${y}-${m}-${d} ${h}시`,
      passed: actual === tc.expected,
      expected: `${tc.expected}월`,
      actual: `${actual}월`,
      note: '12절 절입 기준 월지',
    });
  }

  // ── 3-5. 절기 순서 단조성 (샘플 연도) ──────────────────
  for (const y of [1900, 1950, 2000, 2024, 2050, 2100]) {
    let ok = true;
    let prev = -Infinity;
    for (let i = 0; i < 24; i++) {
      const t = getSolarTerm(y, i);
      const v =
        t.year * 100000000 + t.month * 1000000 + t.day * 10000 + t.hour * 100 + t.minute;
      if (v <= prev) ok = false;
      prev = v;
    }
    results.push({
      name: `절기 순서 ${y}`,
      passed: ok,
      expected: '입춘→대한 24절기 시간순 증가',
      actual: ok ? 'OK' : '순서 오류',
    });
  }

  const passed = results.filter((r) => r.passed).length;
  return { passed, failed: results.length - passed, results };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * 콘솔 출력용 요약 문자열
 */
export function formatTestReport(report: TestReport): string {
  const lines = [
    `만세력 사주 검증: ${report.passed} passed / ${report.failed} failed`,
    '─'.repeat(60),
  ];
  for (const r of report.results) {
    lines.push(
      `${r.passed ? '✅' : '❌'} ${r.name}\n    기대: ${r.expected}\n    실제: ${r.actual}` +
        (r.note ? `\n    (${r.note})` : '')
    );
  }
  return lines.join('\n');
}

// ============================================================
// 좋은 날 고르기 — 검증 테스트
//
// 기존 data/saju-test.ts 와 같은 방식이다 (러너 없이 함수 호출).
//   import { runGoodDayTests } from '@/lib/good-day/good-day-test';
//   console.table(runGoodDayTests().results);
//
// 노드에서:  npx tsx src/lib/good-day/run-tests.ts
// ============================================================

import { getSonDirection, isSonEomneunNal, conflictsWithMove } from '@/lib/calendar/sonnal';
import {
  CalendarDataMissingError,
  getCalendarDay,
} from '@/lib/calendar/calendarAdapter';
import { getBranchRelation } from './branch-relations';
import { buildPersonSaju, recommendDates } from './dateSelectionEngine';
import { isFilteredOut } from './purposeRules';
import { JIJI } from '@/data/saju';
import type { CalendarDay, DateConditions } from '@/types/good-day';

interface TestResult {
  name: string;
  pass: boolean;
  detail: string;
}

const results: TestResult[] = [];

function check(name: string, pass: boolean, detail = '') {
  results.push({ name, pass, detail });
}

function eq<T>(name: string, actual: T, expected: T) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  check(name, pass, pass ? '' : `기대 ${JSON.stringify(expected)} / 실제 ${JSON.stringify(actual)}`);
}

// ── 1. 손 없는 날 ────────────────────────────────────────────

function testSonnal() {
  // 끝수 9·0 → 손 없는 날
  for (const d of [9, 10, 19, 20, 29, 30]) {
    eq(`손없는날 음력 ${d}일`, isSonEomneunNal(d), true);
  }
  // 방향별 끝수
  eq('끝수 1·2 → 동쪽', [getSonDirection(1), getSonDirection(22)], ['east', 'east']);
  eq('끝수 3·4 → 남쪽', [getSonDirection(3), getSonDirection(14)], ['south', 'south']);
  eq('끝수 5·6 → 서쪽', [getSonDirection(15), getSonDirection(6)], ['west', 'west']);
  eq('끝수 7·8 → 북쪽', [getSonDirection(7), getSonDirection(28)], ['north', 'north']);

  // 손 없는 날이 아닌 날은 전부 방향이 있다
  const noneDays = Array.from({ length: 30 }, (_, i) => i + 1).filter((d) =>
    isSonEomneunNal(d)
  );
  eq('손 없는 날은 한 달에 6일', noneDays, [9, 10, 19, 20, 29, 30]);

  // 이사 방향 충돌
  eq('동쪽 이사 + 끝수 1 → 충돌', conflictsWithMove(11, 'east'), true);
  eq('동쪽 이사 + 끝수 3 → 충돌 아님', conflictsWithMove(13, 'east'), false);
  eq('방향 모름 → 충돌 계산 안 함', conflictsWithMove(11, 'unknown'), false);

  // 범위 밖은 조용히 넘기지 않고 오류
  let threw = false;
  try {
    getSonDirection(31);
  } catch {
    threw = true;
  }
  check('음력 31일은 오류', threw);
}

// ── 2. 지지 관계 ─────────────────────────────────────────────

function testRelations() {
  const idx = (n: string) => JIJI.findIndex((j) => j.name === n);
  eq('자-오 충', getBranchRelation(idx('자'), idx('오')), 'chung');
  eq('자-축 육합', getBranchRelation(idx('자'), idx('축')), 'yukhap');
  eq('신-자 삼합', getBranchRelation(idx('신'), idx('자')), 'samhap');
  eq('인-사 형', getBranchRelation(idx('인'), idx('사')), 'hyeong');
  eq('자-유 파', getBranchRelation(idx('자'), idx('유')), 'pa');
  eq('자-미 해', getBranchRelation(idx('자'), idx('미')), 'hae');
  eq('진-진 자형', getBranchRelation(idx('진'), idx('진')), 'hyeong');
  // 충이 합보다 먼저 잡히는지 (감점이 묻히지 않게)
  eq('충 우선', getBranchRelation(idx('축'), idx('미')), 'chung');
}

// ── 3. 조건 거르기 ───────────────────────────────────────────

function testFilters() {
  const base: DateConditions = {
    from: '2026-01-01',
    to: '2026-01-31',
    weekdays: [],
    preferWeekend: false,
    includeHolidays: true,
  };
  eq('요일 조건 없으면 통과', isFilteredOut(base, 3, false), false);
  eq('고른 요일만', isFilteredOut({ ...base, weekdays: [6] }, 3, false), true);
  eq('공휴일 제외', isFilteredOut({ ...base, includeHolidays: false }, 3, true), true);
  eq('평일만 — 토요일 제외', isFilteredOut({ ...base, weekdaysOnly: true }, 6, false), true);
}

// ── 4. 추천 엔진 (가짜 달력 주입) ────────────────────────────

/** 테스트용 달력 — 실제 데이터가 아니라 엔진 동작 확인용임을 명시한다 */
function fakeCalendar(dates: { solar: string; lunarDay: number; weekday: number }[]) {
  const map = new Map<string, CalendarDay>();
  for (const d of dates) {
    map.set(d.solar, {
      solar: d.solar,
      lunarYear: 2026,
      lunarMonth: 1,
      lunarDay: d.lunarDay,
      leapMonth: false,
      weekday: d.weekday,
      holiday: false,
    });
  }
  return map;
}

function testEngine() {
  const cal = fakeCalendar([
    { solar: '2026-03-02', lunarDay: 9, weekday: 1 }, // 손 없는 날
    { solar: '2026-03-03', lunarDay: 10, weekday: 2 }, // 손 없는 날
    { solar: '2026-03-04', lunarDay: 11, weekday: 3 }, // 동쪽 손
    { solar: '2026-03-05', lunarDay: 12, weekday: 4 }, // 동쪽 손
  ]);
  const getDay = (d: string) => {
    const hit = cal.get(d);
    if (!hit) throw new Error(`테스트 달력에 ${d} 없음`);
    return hit;
  };
  const source = '테스트 달력 (실제 데이터 아님)';

  const me = buildPersonSaju(1990, 5, 20, 10);
  const conditions: DateConditions = {
    from: '2026-03-02',
    to: '2026-03-05',
    weekdays: [],
    preferWeekend: false,
    includeHolidays: true,
    moveDirection: 'east',
  };

  const r1 = recommendDates({ purpose: 'move', conditions, me, getDay, source });
  // 동쪽 이사 → 끝수 1·2 인 날은 후보에서 빠진다
  eq(
    '동쪽 이사에서 동쪽 손 날짜 제외',
    r1.candidates.map((c) => c.date).sort(),
    ['2026-03-02', '2026-03-03']
  );
  eq('제외된 날 수', r1.excludedCount, 2);

  // 같은 입력 → 같은 결과
  const r2 = recommendDates({ purpose: 'move', conditions, me, getDay, source });
  eq(
    '같은 입력은 같은 결과',
    r1.candidates.map((c) => `${c.date}:${c.score}`),
    r2.candidates.map((c) => `${c.date}:${c.score}`)
  );

  // 태어난 시간을 몰라도 계산된다
  const noHour = buildPersonSaju(1990, 5, 20, null);
  const r3 = recommendDates({ purpose: 'move', conditions, me: noHour, getDay, source });
  check('시간 미상도 계산됨', r3.candidates.length > 0);
  eq('시간 미상 표시', r3.hourUnknown.me, true);

  // 결혼 — 두 사람 점수가 모두 반영된다
  const partner = buildPersonSaju(1992, 8, 3, null);
  const wedding = recommendDates({
    purpose: 'wedding',
    conditions: { ...conditions, moveDirection: undefined },
    me,
    partner,
    getDay,
    source,
  });
  const first = wedding.candidates[0];
  check(
    '결혼: 두 사람 점수 모두 반영',
    first?.myScore !== undefined && first?.partnerScore !== undefined,
    `my=${first?.myScore} partner=${first?.partnerScore}`
  );
  eq('결혼: 상대 시간 미상 표시', wedding.hourUnknown.partner, true);

  // 손 없는 날 가중치가 목적에 따라 다르다
  const moveSon = r1.candidates.find((c) => c.son === 'none');
  check(
    '이사에서 손 없는 날 +20',
    Boolean(moveSon?.factors.some((f) => f.rule === 'son:none' && f.delta === 20))
  );
  const confession = recommendDates({
    purpose: 'confession',
    conditions: { ...conditions, moveDirection: undefined },
    me,
    getDay,
    source,
  });
  check(
    '고백에서는 손 없는 날 가점 없음',
    !confession.candidates.some((c) => c.factors.some((f) => f.rule === 'son:none'))
  );

  // 윤달도 그대로 통과한다 (음력 일 기준 계산이므로 영향 없음)
  const leap = fakeCalendar([{ solar: '2026-03-02', lunarDay: 9, weekday: 1 }]);
  const leapDay = leap.get('2026-03-02')!;
  leapDay.leapMonth = true;
  const rLeap = recommendDates({
    purpose: 'move',
    conditions: { ...conditions, to: '2026-03-02', moveDirection: 'unknown' },
    me,
    getDay: () => leapDay,
    source,
  });
  eq('윤달 날짜도 후보로 처리', rLeap.candidates.length, 1);
  eq('윤달 표시 보존', rLeap.candidates[0].calendar.leapMonth, true);
}

// ── 5. 달력 데이터가 없을 때 ─────────────────────────────────

function testMissingData() {
  let threw = false;
  let madeUpValue: unknown = undefined;
  try {
    madeUpValue = getCalendarDay('2099-01-01');
  } catch (e) {
    threw = e instanceof CalendarDataMissingError;
  }
  check('데이터 없으면 오류', threw);
  check('데이터 없을 때 값을 지어내지 않음', madeUpValue === undefined);
}

// ── 6. 실제 달력 (음력·공휴일·절기) ──────────────────────────

function testRealCalendar() {
  // 설날 — 음력 1월 1일
  const seol = getCalendarDay('2026-02-17');
  eq('2026 설날 음력', [seol.lunarMonth, seol.lunarDay], [1, 1]);
  eq('2026 설날 공휴일', seol.holidayName, '설날');
  check('설날 전날도 연휴', getCalendarDay('2026-02-16').holiday);
  check('설날 다음날도 연휴', getCalendarDay('2026-02-18').holiday);

  // 추석 — 음력 8월 15일
  const chuseok = getCalendarDay('2026-09-25');
  eq('2026 추석 음력', [chuseok.lunarMonth, chuseok.lunarDay], [8, 15]);
  eq('2026 추석 공휴일', chuseok.holidayName, '추석');

  // 양력 고정 공휴일
  for (const [d, name] of [
    ['2026-01-01', '신정'],
    ['2026-03-01', '삼일절'],
    ['2026-05-05', '어린이날'],
    ['2026-06-06', '현충일'],
    ['2026-08-15', '광복절'],
    ['2026-10-03', '개천절'],
    ['2026-10-09', '한글날'],
    ['2026-12-25', '성탄절'],
  ] as [string, string][]) {
    eq(`고정 공휴일 ${name}`, getCalendarDay(d).holidayName, name);
  }

  // 대체공휴일 — 주말과 겹친 공휴일 다음 평일에 하나 생겨야 한다
  let foundSubstitute = false;
  for (const y of [2026, 2027, 2028]) {
    for (const m of [3, 8, 10, 12]) {
      for (let d = 1; d <= 12; d++) {
        const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const day = getCalendarDay(iso);
        if (day.holidayName?.includes('대체공휴일')) foundSubstitute = true;
      }
    }
  }
  check('대체공휴일이 계산된다', foundSubstitute);

  // 절기 — 입춘은 2월 3~5일 사이
  const ipchun = ['2026-02-03', '2026-02-04', '2026-02-05'].map(
    (d) => getCalendarDay(d).solarTerm
  );
  check('입춘이 2월 초에 잡힌다', ipchun.includes('입춘'), ipchun.join(','));

  // 일진·세차·월건이 채워진다
  check('일진 채워짐', Boolean(seol.iljin) && seol.iljin!.length === 2, seol.iljin);
  check('세차 채워짐', Boolean(seol.secha), seol.secha);

  // 손 없는 날이 실제 음력과 이어진다 (음력 9일 → 손 없는 날)
  const lunar9 = ['2026-02-25', '2026-02-26', '2026-02-27'].find(
    (d) => getCalendarDay(d).lunarDay === 9
  );
  check('음력 9일을 실제 달력에서 찾음', Boolean(lunar9), String(lunar9));
  if (lunar9) eq('그날은 손 없는 날', getSonDirection(9), 'none');

  // 지원 범위 밖은 오류
  let ranged = false;
  try {
    getCalendarDay('2051-01-01');
  } catch (e) {
    ranged = e instanceof CalendarDataMissingError;
  }
  check('2051년은 범위 밖 오류', ranged);
}

export function runGoodDayTests() {
  results.length = 0;
  testSonnal();
  testRelations();
  testFilters();
  testEngine();
  testMissingData();
  testRealCalendar();
  const passed = results.filter((r) => r.pass).length;
  return { passed, total: results.length, results };
}

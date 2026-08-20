// 오늘의 운세 엔진 테스트 — 운영 규칙이 지켜지는지 확인한다.
// npm test 로 좋은 날 테스트와 함께 돈다.

import { computeTodayFortune, type FortuneTier } from './today-fortune';

export interface TestResult {
  name: string;
  pass: boolean;
  detail?: string;
}

const TIERS: FortuneTier[] = [
  '흐름이 좋은 날',
  '차분히 나아갈 날',
  '신중함이 필요한 날',
  '잠시 쉬어갈 날',
];

const PEOPLE = [
  { label: '1990-01-01 12시', year: 1990, month: 1, day: 1, hour: 12 as number | null },
  { label: '1985-07-23 03시', year: 1985, month: 7, day: 23, hour: 3 as number | null },
  { label: '2001-11-09 시모름', year: 2001, month: 11, day: 9, hour: null as number | null },
];

export function runTodayFortuneTests(): {
  passed: number;
  total: number;
  results: TestResult[];
} {
  const results: TestResult[] = [];
  const t = (name: string, pass: boolean, detail?: string) =>
    results.push({ name, pass, detail });

  const me = PEOPLE[0];

  // 하루 동안 몇 번을 봐도 같은 결과
  const morning = computeTodayFortune({ ...me, today: new Date('2026-08-20T09:00:00') });
  const night = computeTodayFortune({ ...me, today: new Date('2026-08-20T23:30:00') });
  t(
    '같은 날은 몇 번을 봐도 같은 결과',
    JSON.stringify(morning.fortune) === JSON.stringify(night.fortune)
  );

  // 자정을 넘기면 다음 날 운세
  const tomorrow = computeTodayFortune({ ...me, today: new Date('2026-08-21T00:10:00') });
  t(
    '자정을 넘기면 일진이 바뀐다',
    morning.fortune.basis.todayGanji !== tomorrow.fortune.basis.todayGanji,
    `${morning.fortune.basis.todayGanji} → ${tomorrow.fortune.basis.todayGanji}`
  );
  t('날짜가 로컬 기준으로 잡힌다', tomorrow.fortune.date === '2026-08-21', tomorrow.fortune.date);

  // 태어난 시를 모르면 시주를 뺀다
  const noHour = computeTodayFortune({
    ...me,
    hour: null,
    today: new Date('2026-08-20T09:00:00'),
  });
  t('시 모름이면 시주를 뺀다', noHour.fortune.basis.hourExcluded === true);

  // 최근 14일에 쓴 문구는 피한다
  const again = computeTodayFortune({
    ...me,
    today: new Date('2026-08-20T09:00:00'),
    recentKeys: morning.usedKeys,
  });
  t(
    '최근에 쓴 한마디는 다시 고르지 않는다',
    again.fortune.headline !== morning.fortune.headline
  );
  t(
    '최근에 쓴 분야 문구도 다시 고르지 않는다',
    again.fortune.areas.work !== morning.fortune.areas.work
  );

  for (const who of PEOPLE) {
    const seen = new Set<string>();
    const dist: Record<string, number> = {};
    let bad = '';

    for (let i = 0; i < 120; i++) {
      const d = new Date('2026-08-20T09:00:00');
      d.setDate(d.getDate() + i);
      const { fortune } = computeTodayFortune({ ...who, today: d });
      dist[fortune.tier] = (dist[fortune.tier] ?? 0) + 1;
      seen.add(fortune.tier);

      const shown = [
        fortune.headline,
        fortune.energy,
        fortune.doThis,
        fortune.avoidThis,
        ...Object.values(fortune.areas),
      ].join(' ');

      if (/\d+\s*점/.test(shown)) bad ||= `점수 노출: ${shown.slice(0, 40)}`;
      if (/무조건|틀림없이|반드시 (돈|재물|이익)/.test(shown))
        bad ||= `단정 표현: ${shown.slice(0, 40)}`;
      if (/병원에 가|약을 (드|먹)|진단|처방/.test(shown))
        bad ||= `의료 지시: ${shown.slice(0, 40)}`;
      if (/투자하세요|사두세요|팔아치우|반드시 계약/.test(shown))
        bad ||= `투자·계약 지시: ${shown.slice(0, 40)}`;
      if (!fortune.talismanId) bad ||= '추천 부적 없음';
      if (!TIERS.includes(fortune.tier)) bad ||= `등급 이상: ${fortune.tier}`;

      for (const [k, v] of Object.entries(fortune.areas)) {
        const sentences = v.split(/(?<=[.!?])\s+/).filter(Boolean).length;
        if (sentences > 2) bad ||= `${k} 세 문장 이상`;
      }
    }

    t(`[${who.label}] 금지 표현·형식 위반 없음`, bad === '', bad);
    t(`[${who.label}] 네 등급이 고루 나온다`, seen.size >= 3, JSON.stringify(dist));
    const gloomy =
      ((dist['신중함이 필요한 날'] ?? 0) + (dist['잠시 쉬어갈 날'] ?? 0)) / 120;
    t(
      `[${who.label}] 조심하라는 날이 절반을 넘지 않는다`,
      gloomy < 0.5,
      `${Math.round(gloomy * 100)}%`
    );
  }

  return { passed: results.filter((r) => r.pass).length, total: results.length, results };
}

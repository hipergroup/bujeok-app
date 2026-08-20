// 전체 테스트 실행기 — npm test
import { runGoodDayTests } from '../src/lib/good-day/good-day-test';
import { runTodayFortuneTests } from '../src/data/today-fortune-test';

let passed = 0;
let total = 0;

for (const [title, run] of [
  ['좋은 날 고르기', runGoodDayTests],
  ['오늘의 운세', runTodayFortuneTests],
] as const) {
  const r = run();
  console.log(`\n── ${title} ──`);
  for (const x of r.results) {
    console.log(`${x.pass ? '  통과' : '✗ 실패'}  ${x.name}${x.detail ? ` — ${x.detail}` : ''}`);
  }
  passed += r.passed;
  total += r.total;
}

console.log(`\n${passed}/${total} 통과`);
process.exit(passed === total ? 0 : 1);

// 좋은 날 고르기 테스트 실행기 —  npm test
import { runGoodDayTests } from '../src/lib/good-day/good-day-test';

const { passed, total, results } = runGoodDayTests();
for (const r of results) {
  console.log(`${r.pass ? '  통과' : '✗ 실패'}  ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
}
console.log(`\n${passed}/${total} 통과`);
process.exit(passed === total ? 0 : 1);

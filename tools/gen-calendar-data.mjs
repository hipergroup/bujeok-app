// ============================================================
// 공식 달력 데이터 생성기 (한국천문연구원 · 공공데이터포털)
//
//   KASI_SERVICE_KEY=... node tools/gen-calendar-data.mjs 2026 2035
//
// 두 서비스를 받아 연도별 JSON 한 장으로 굽는다:
//   · 음양력 정보     — 양력→음력, 윤달, 세차·월건·일진
//   · 특일 정보       — 공휴일
//
// 인증키는 이 스크립트(빌드 시점)에서만 쓰고 프런트 번들에는 넣지 않는다.
// 키가 없으면 아무 파일도 만들지 않고 종료한다 — 가짜 날짜를 굽지 않는다.
// ============================================================

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const VERSION = '1.0.0';
const OUT_DIR = 'public/data/calendar';
const LUNAR_API =
  'https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getLunCalInfo';
const HOLIDAY_API =
  'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo';

const KEY = process.env.KASI_SERVICE_KEY;

if (!KEY) {
  console.error(
    '\n[calendar] KASI_SERVICE_KEY 가 없습니다.\n' +
      '  공공데이터포털에서 "음양력 정보"와 "특일 정보" 활용신청 후 일반 인증키를 넣어주세요:\n' +
      '    KASI_SERVICE_KEY=... node tools/gen-calendar-data.mjs 2026 2035\n' +
      '  키 없이는 달력 데이터를 만들지 않습니다 (임의 생성 금지).\n'
  );
  process.exit(1);
}

const fromYear = Number(process.argv[2] ?? 2026);
const toYear = Number(process.argv[3] ?? fromYear);

/** XML 한 덩어리에서 태그 값 뽑기 — 응답이 작아 정규식으로 충분하다 */
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? m[1].trim() : undefined;
};
const allItems = (xml) => xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

async function fetchXml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url.split('?')[0]}`);
  const text = await res.text();
  if (text.includes('<errMsg>') || text.includes('SERVICE_KEY')) {
    const err = tag(text, 'returnAuthMsg') ?? tag(text, 'errMsg') ?? '알 수 없는 오류';
    throw new Error(`API 오류: ${err}`);
  }
  return text;
}

/** 한 달치 음양력 — solYear/solMonth 로 조회하면 그 달 전체가 온다 */
async function fetchLunarMonth(year, month) {
  const url =
    `${LUNAR_API}?serviceKey=${KEY}` +
    `&solYear=${year}&solMonth=${String(month).padStart(2, '0')}&numOfRows=40`;
  const xml = await fetchXml(url);
  return allItems(xml).map((it) => ({
    solar: `${tag(it, 'solYear')}-${tag(it, 'solMonth')}-${tag(it, 'solDay')}`,
    lunarYear: Number(tag(it, 'lunYear')),
    lunarMonth: Number(tag(it, 'lunMonth')),
    lunarDay: Number(tag(it, 'lunDay')),
    leapMonth: tag(it, 'lunLeapmonth') === '윤',
    secha: tag(it, 'lunSecha'),
    wolgeon: tag(it, 'lunWolgeon'),
    iljin: tag(it, 'lunIljin'),
  }));
}

/** 한 해 공휴일 */
async function fetchHolidays(year) {
  const map = new Map();
  for (let m = 1; m <= 12; m++) {
    const url =
      `${HOLIDAY_API}?serviceKey=${KEY}` +
      `&solYear=${year}&solMonth=${String(m).padStart(2, '0')}&numOfRows=50`;
    const xml = await fetchXml(url);
    for (const it of allItems(xml)) {
      if (tag(it, 'isHoliday') !== 'Y') continue;
      const locdate = tag(it, 'locdate'); // YYYYMMDD
      const iso = `${locdate.slice(0, 4)}-${locdate.slice(4, 6)}-${locdate.slice(6, 8)}`;
      map.set(iso, tag(it, 'dateName'));
    }
  }
  return map;
}

async function buildYear(year) {
  process.stdout.write(`[calendar] ${year} …`);
  const holidays = await fetchHolidays(year);

  const days = [];
  for (let m = 1; m <= 12; m++) {
    const rows = await fetchLunarMonth(year, m);
    for (const r of rows) {
      const holidayName = holidays.get(r.solar);
      days.push({
        ...r,
        weekday: new Date(`${r.solar}T00:00:00Z`).getUTCDay(),
        holiday: Boolean(holidayName),
        ...(holidayName ? { holidayName } : {}),
      });
    }
    process.stdout.write('.');
  }

  days.sort((a, b) => a.solar.localeCompare(b.solar));

  const file = {
    meta: {
      year,
      source: '한국천문연구원 음양력 정보·특일 정보 (공공데이터포털)',
      generatedAt: new Date().toISOString(),
      version: VERSION,
    },
    days,
  };

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, `${year}.json`), JSON.stringify(file));
  console.log(` ${days.length}일 저장`);
}

for (let y = fromYear; y <= toYear; y++) {
  await buildYear(y);
}
console.log(`[calendar] ${fromYear}~${toYear} 완료 → ${OUT_DIR}/`);

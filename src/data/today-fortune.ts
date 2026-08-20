// ============================================================
// 오늘의 운세 — 계산 엔진
//
// 두 단계로 나눈다.
//  1) 규칙 계산: 만세력·오행·십성·지지 관계를 규칙으로 먼저 계산한다.
//  2) 문장 선택: 계산 결과에 묶인 문구만 고른다.
//
// 문장을 그때그때 지어내지 않으므로 같은 사람·같은 날이면 결과가 항상 같다.
// (백엔드가 없는 정적 앱이라 실행 중 문장 생성은 하지 않는다. 나중에 서버가
//  생기면 아래 문구 풀 자리만 바꾸면 되고, 계산부는 그대로 쓴다.)
//
// 지키는 것
//  · 계산에서 나오지 않은 내용은 문장에 넣지 않는다.
//  · `무조건 ~한다` 같은 단정은 쓰지 않는다.
//  · 의료·투자·계약을 대신 결정해주지 않는다. 참고로만 말한다.
//  · 태어난 시를 모르면 시주(時柱)를 빼고 푼다.
// ============================================================

import {
  getSaju,
  getSajuDetail,
  getOheng,
  getAnimal,
  isSamjae,
  JIJI,
  type SajuResult,
  type Oheng,
  type OhengScore,
  type CheonGan,
} from './saju';
import { getYongsin, getSipseongGroup, type SipseongGroup } from './yongsin';
import { getTodayTalisman } from './saju-talisman-match';
import { getBranchRelation, type BranchRelation } from '@/lib/good-day/branch-relations';
import {
  TIER_KEY,
  HEADLINE,
  AREA_WORK,
  AREA_MONEY,
  AREA_RELATION,
  AREA_MIND,
  DO_THIS,
  AVOID_THIS,
  type TierKey,
  type EnergyRole,
} from './today-fortune-phrases';

// ─── 타입 ──────────────────────────────────────────────────

export type FortuneTier =
  | '흐름이 좋은 날'
  | '차분히 나아갈 날'
  | '신중함이 필요한 날'
  | '잠시 쉬어갈 날';

export type FortuneAreaKey = 'work' | 'money' | 'relation' | 'mind';

/** 규칙으로 계산한 값들 — 화면의 `풀이 기준 보기`가 이걸 그대로 보여준다 */
export interface FortuneBasis {
  /** 오늘의 일진 (예: 병인 / 丙寅) */
  todayGanji: string;
  todayGanjiHanja: string;
  /** 오늘의 월주·연주 — 일운이 월운·세운 위에 겹친다 */
  todayMonthGanji: string;
  todayYearGanji: string;
  /** 나의 일간 */
  myIlgan: string;
  myIlganHanja: string;
  myIlganOheng: Oheng;
  /** 오늘 천간이 나에게 어떤 결로 들어오는가 (십성 그룹) */
  sipseong: SipseongGroup;
  /** 오늘 들어오는 오행 */
  incomingOheng: Oheng;
  /** 그 오행이 나에게 필요한 기운인지 */
  incomingRole: EnergyRole;
  /** 나의 일지와 오늘 일지의 관계 */
  branchRelation: BranchRelation;
  /** 사주에서 가장 두터운/옅은 기운 */
  strongOheng: Oheng;
  weakOheng: Oheng;
  /** 시주를 빼고 풀었는지 */
  hourExcluded: boolean;
  /** 흐름 점수 — 등급의 근거 (화면에 숫자로는 내보내지 않는다) */
  tierScore: number;
}

export interface TodayFortune {
  /** YYYY-MM-DD (기기 자정 기준) */
  date: string;
  /** ① 오늘의 한마디 */
  headline: string;
  /** 등급 — 숫자 점수 대신 쓴다 */
  tier: FortuneTier;
  /** ② 오늘 들어오는 기운 (쉬운 말 두 문장) */
  energy: string;
  /** ③ 분야별 운세 */
  areas: Record<FortuneAreaKey, string>;
  /** ④ 오늘의 작은 실천 */
  doThis: string;
  /** 오늘 피하면 좋은 것 */
  avoidThis: string;
  /** ⑤ 오늘의 추천 부적 */
  talismanId: string;
  talismanName: string;
  talismanReason: string;
  basis: FortuneBasis;
}

export interface TodayFortuneInput {
  year: number;
  month: number;
  day: number;
  /** null = 태어난 시 모름 → 시주를 빼고 푼다 */
  hour: number | null;
  /** 오늘 날짜 — 넘기지 않으면 기기의 오늘 */
  today?: Date;
  /** 최근 14일 안에 이미 쓴 문구 키들 (연속 중복 방지) */
  recentKeys?: string[];
}

// ─── 결정적 선택 ────────────────────────────────────────────

function hashSeed(...parts: string[]): number {
  const str = parts.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * 풀에서 하나를 고른다. 최근에 쓴 문구는 건너뛴다.
 * 같은 상태가 자주 돌아오면 그 칸의 문구를 다 써버릴 수 있는데,
 * 그때는 처음으로 되돌아가지 않고 `가장 오래전에 쓴 것`을 고른다.
 * (되돌아가면 며칠 만에 같은 문장이 다시 나온다)
 */
function pick(
  pool: string[],
  seed: number,
  poolName: string,
  recent: Map<string, number>
): string {
  const start = seed % pool.length;
  let oldestIdx = start;
  let oldestAt = Infinity;

  for (let i = 0; i < pool.length; i++) {
    const idx = (start + i) % pool.length;
    const at = recent.get(`${poolName}:${idx}`);
    if (at === undefined) return pool[idx];
    if (at < oldestAt) {
      oldestAt = at;
      oldestIdx = idx;
    }
  }
  return pool[oldestIdx];
}

/** pick 이 고른 문구의 키 — 다음 날들의 중복 방지 기록에 남긴다 */
function keyOf(pool: string[], text: string, poolName: string): string {
  return `${poolName}:${pool.indexOf(text)}`;
}

// ─── 오행/십성 계산 ─────────────────────────────────────────

const branchIndexOf = (name: string) => JIJI.findIndex((j) => j.name === name);

/** 시주를 뺄 수 있는 오행 집계 (getOheng 과 같은 방식) */
function ohengOf(saju: SajuResult, excludeHour: boolean): OhengScore {
  if (!excludeHour) return getOheng(saju);
  const counts: OhengScore = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const els: Oheng[] = [
    saju.yearStem.oheng,
    saju.yearBranch.oheng,
    saju.monthStem.oheng,
    saju.monthBranch.oheng,
    saju.dayStem.oheng,
    saju.dayBranch.oheng,
  ];
  for (const el of els) counts[el] += 1;
  const max = Math.max(...Object.values(counts), 1);
  return {
    목: Math.round((counts.목 / max) * 100),
    화: Math.round((counts.화 / max) * 100),
    토: Math.round((counts.토 / max) * 100),
    금: Math.round((counts.금 / max) * 100),
    수: Math.round((counts.수 / max) * 100),
  };
}

function ganjiOf(stem: CheonGan, branch: { name: string; hanja: string }) {
  return {
    ko: `${stem.name}${branch.name}`,
    hanja: `${stem.hanja}${branch.hanja}`,
  };
}

// ─── 등급 계산 ──────────────────────────────────────────────
//
// 흐름 점수는 두 가지만 본다 — 어느 쪽도 임의로 만든 기준이 아니다.
//   · 오늘 들어오는 기운이 나에게 필요한 기운인가 (용신·희신·기신)
//   · 나의 일지와 오늘 일지의 관계 (합이면 순하고, 충·형이면 어긋난다)

const ROLE_POINT: Record<EnergyRole, number> = {
  용신: 2,
  희신: 1,
  보통: 0,
  기신: -2,
};

const RELATION_POINT: Record<BranchRelation, number> = {
  samhap: 2,
  yukhap: 2,
  none: 0,
  hae: -1,
  pa: -1,
  hyeong: -2,
  chung: -2,
};

// 경계는 실제 분포를 보고 잡았다. 지지 관계는 형(刑)·충(沖) 쪽 자리가
// 합(合)보다 많아, 경계를 0 에 두면 열흘 중 예닐곱이 `신중` 으로 쏠린다.
// 흐름을 사실대로 전하되 겁주는 화면이 되지 않도록 아래로 한 칸 내렸다.
function tierOf(score: number): FortuneTier {
  if (score >= 2) return '흐름이 좋은 날';
  if (score >= 0) return '차분히 나아갈 날';
  if (score >= -2) return '신중함이 필요한 날';
  return '잠시 쉬어갈 날';
}

// ─── ② 오늘 들어오는 기운 — 오행을 쉬운 말로 ────────────────

const OHENG_PLAIN: Record<Oheng, { word: string; act: string }> = {
  목: { word: '나무', act: '생각을 말이나 글로 구체화할수록' },
  화: { word: '불', act: '마음을 밝게 표현하고 사람을 만날수록' },
  토: { word: '흙', act: '벌여둔 것을 한자리에 모아 정리할수록' },
  금: { word: '쇠', act: '기준을 세우고 덜어낼 것을 덜어낼수록' },
  수: { word: '물', act: '서두르지 않고 한 박자 늦춰 살필수록' },
};

const ENERGY_TAIL: Record<TierKey, Record<EnergyRole, string[]>> = {
  // `~할수록` 뒤에 붙으므로 모두 `결과`로 끝난다. 조언은 분야·실천 칸의 몫이다.
  good: {
    용신: ['흐름이 한결 좋아져요.', '평소보다 훨씬 수월하게 풀려요.', '하려던 것이 술술 이어져요.', '막힌 데가 쉽게 뚫려요.'],
    희신: ['흐름이 부드럽게 이어져요.', '무리 없이 나아갈 수 있어요.', '애쓴 만큼 잘 따라와요.', '하루가 매끄럽게 흘러가요.'],
    보통: ['오늘의 속도를 그대로 지킬 수 있어요.', '하던 대로 해도 잘 돼요.', '제자리를 잘 찾아가요.', '무리 없이 흘러가요.'],
    기신: ['한결 가벼워져요.', '욕심을 줄인 만큼 편안해져요.', '오히려 잘 풀려요.', '부담이 덜해져요.'],
  },
  calm: {
    용신: ['흐름이 좋아질 수 있어요.', '한결 수월하게 풀릴 수 있어요.', '하던 일이 제 속도로 나아가요.', '조금씩이라도 앞으로 가요.'],
    희신: ['흐름이 부드러워질 수 있어요.', '차분하게 나아갈 수 있어요.', '무리 없이 이어갈 수 있어요.', '어긋나는 일 없이 지나가요.'],
    보통: ['평소의 속도를 지킬 수 있어요.', '있는 자리를 잘 다지게 돼요.', '무리 없이 편안해져요.', '하루가 조용히 흘러가요.'],
    기신: ['한 박자 늦춰져 편안해져요.', '조금씩 덜어지며 가벼워져요.', '욕심이 줄며 마음이 놓여요.', '무거움이 조금 풀려요.'],
  },
  careful: {
    용신: ['서두르지만 않으면 잘 풀려요.', '확인하는 만큼 무리가 없어요.', '한결 안전하게 지나가요.', '어긋날 일이 줄어요.'],
    희신: ['천천히 가는 만큼 어긋나지 않아요.', '무리 없이 지나갈 수 있어요.', '실수가 줄어들어요.', '마음이 한결 놓여요.'],
    보통: ['오늘 하루가 무리 없이 흘러가요.', '어긋나는 일 없이 지나가요.', '헛걸음이 줄어들어요.', '차분하게 마무리돼요.'],
    기신: ['부담이 한결 덜어져요.', '무거움이 조금 가벼워져요.', '지치는 일이 줄어들어요.', '마음이 조금 편해져요.'],
  },
  rest: {
    용신: ['쉬는 만큼 금방 돌아와요.', '무리만 없으면 잘 회복돼요.', '기운이 다시 차올라요.', '한결 나아져요.'],
    희신: ['천천히 가도 충분해요.', '멈춰도 늦지 않아요.', '조용히 회복돼요.', '마음이 가라앉아요.'],
    보통: ['하루가 조용히 지나가요.', '무리 없이 흘러가요.', '아무 일 없이 지나가요.', '마음이 편안해져요.'],
    기신: ['한결 가벼워져요.', '무거움이 조금 풀려요.', '지친 마음이 놓여요.', '부담이 덜해져요.'],
  },
};

// ============================================================
// 본체
// ============================================================

/** 기기 자정 기준 오늘 (UTC 로 밀리지 않도록 로컬 값으로 만든다) */
export function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 이 결과를 만드는 데 쓴 문구 키들 — 최근 14일 중복 방지 기록용 */
export interface TodayFortuneWithKeys {
  fortune: TodayFortune;
  usedKeys: string[];
}

export function computeTodayFortune(
  input: TodayFortuneInput
): TodayFortuneWithKeys {
  const now = input.today ?? new Date();
  const date = localDateString(now);
  const hourExcluded = input.hour === null || input.hour < 0;

  // ── 1) 규칙 계산 ────────────────────────────────────────
  const saju = getSaju(
    input.year,
    input.month,
    input.day,
    hourExcluded ? 12 : (input.hour as number)
  );
  const oheng = ohengOf(saju, hourExcluded);
  const yongsin = getYongsin(saju, oheng);

  // 오늘의 사주 — 일운이 월운·세운 위에 겹친다
  const today = getSaju(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    12
  );

  const incomingOheng = today.dayStem.oheng;
  const incomingRole: FortuneBasis['incomingRole'] =
    incomingOheng === yongsin.yongsin
      ? '용신'
      : incomingOheng === yongsin.huisin
        ? '희신'
        : incomingOheng === yongsin.gisin
          ? '기신'
          : '보통';

  const sipseong = getSipseongGroup(saju.dayStem.oheng, incomingOheng);
  const branchRelation = getBranchRelation(
    branchIndexOf(saju.dayBranch.name),
    branchIndexOf(today.dayBranch.name)
  );

  const sortedOheng = (Object.entries(oheng) as [Oheng, number][]).sort(
    (a, b) => a[1] - b[1]
  );
  const weakOheng = sortedOheng[0][0];
  const strongOheng = sortedOheng[sortedOheng.length - 1][0];

  const tierScore = ROLE_POINT[incomingRole] + RELATION_POINT[branchRelation];
  const tier = tierOf(tierScore);

  const basis: FortuneBasis = {
    todayGanji: ganjiOf(today.dayStem, today.dayBranch).ko,
    todayGanjiHanja: ganjiOf(today.dayStem, today.dayBranch).hanja,
    todayMonthGanji: ganjiOf(today.monthStem, today.monthBranch).hanja,
    todayYearGanji: ganjiOf(today.yearStem, today.yearBranch).hanja,
    myIlgan: saju.dayStem.name,
    myIlganHanja: saju.dayStem.hanja,
    myIlganOheng: saju.dayStem.oheng,
    sipseong,
    incomingOheng,
    incomingRole,
    branchRelation,
    strongOheng,
    weakOheng,
    hourExcluded,
    tierScore,
  };

  // ── 2) 계산 결과에 묶인 문장 고르기 ──────────────────────
  // 오래된 것부터 들어오므로 마지막 자리가 곧 `가장 최근에 쓴 때`가 된다
  const recent = new Map<string, number>();
  (input.recentKeys ?? []).forEach((k, i) => recent.set(k, i));
  const sajuKey = `${saju.dayStem.name}${saju.dayBranch.name}${saju.monthStem.name}${saju.monthBranch.name}`;
  const seed = (salt: string) => hashSeed(date, sajuKey, salt);
  const usedKeys: string[] = [];

  const take = (pool: string[], salt: string, name: string) => {
    const text = pick(pool, seed(salt), name, recent);
    usedKeys.push(keyOf(pool, text, name));
    return text;
  };

  const tk: TierKey = TIER_KEY[tier];

  const headline = take(
    HEADLINE[tk][sipseong],
    'headline',
    `headline:${tk}:${sipseong}`
  );

  const plain = OHENG_PLAIN[incomingOheng];
  const tail = take(
    ENERGY_TAIL[tk][incomingRole],
    'energy',
    `energy:${tk}:${incomingRole}`
  );
  const needLine =
    incomingRole === '용신' || incomingRole === '희신'
      ? `사주에 부족했던 ${plain.word}의 기운이 들어옵니다`
      : incomingRole === '기신'
        ? `이미 두터운 ${plain.word}의 기운이 더해집니다`
        : `${plain.word}의 기운이 들어옵니다`;
  const energy = `오늘은 ${needLine}. ${plain.act} ${tail}`;

  const areas: Record<FortuneAreaKey, string> = {
    work: take(AREA_WORK[tk][sipseong], 'work', `work:${tk}:${sipseong}`),
    money: take(AREA_MONEY[tk][sipseong], 'money', `money:${tk}:${sipseong}`),
    relation: take(
      AREA_RELATION[tk][branchRelation],
      'relation',
      `relation:${tk}:${branchRelation}`
    ),
    mind: take(AREA_MIND[tk][incomingRole], 'mind', `mind:${tk}:${incomingRole}`),
  };

  const doThis = take(
    DO_THIS[tk][incomingOheng],
    'do',
    `do:${tk}:${incomingOheng}`
  );
  const avoidThis = take(
    AVOID_THIS[incomingRole][branchRelation],
    'avoid',
    `avoid:${incomingRole}:${branchRelation}`
  );

  // ── 오늘의 추천 부적 — 이미 있는 사주 매칭 엔진을 그대로 쓴다 ──
  const detail = getSajuDetail(
    input.year,
    input.month,
    input.day,
    hourExcluded ? 12 : (input.hour as number)
  );
  const match = getTodayTalisman(
    {
      saju,
      oheng,
      animal: getAnimal(input.year, input.month, input.day),
      // 삼재는 올해 기준 — 입춘을 넘긴 사주 연도로 본다
      samjae: isSamjae(now.getFullYear(), detail.sajuYear),
      yongsin,
    },
    now
  );

  return {
    fortune: {
      date,
      headline,
      tier,
      energy,
      areas,
      doThis,
      avoidThis,
      talismanId: match.talisman.id,
      talismanName: match.talisman.name,
      talismanReason: match.headline,
      basis,
    },
    usedKeys,
  };
}

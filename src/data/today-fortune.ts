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
  incomingRole: '용신' | '희신' | '기신' | '보통';
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
 * 전부 최근에 썼으면 그냥 첫 후보를 쓴다 (무한히 미루지 않는다).
 */
function pick(
  pool: string[],
  seed: number,
  poolName: string,
  recent: Set<string>
): string {
  const start = seed % pool.length;
  for (let i = 0; i < pool.length; i++) {
    const idx = (start + i) % pool.length;
    if (!recent.has(`${poolName}:${idx}`)) return pool[idx];
  }
  return pool[start];
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

const ROLE_POINT: Record<FortuneBasis['incomingRole'], number> = {
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

// ============================================================
// 문구 풀
//
// 모든 문구는 위에서 계산한 값에 묶여 있다. 계산에 없는 사실을 새로
// 말하지 않는다. 단정("무조건 ~한다")과 의료·투자·계약 지시는 쓰지 않는다.
// ============================================================

// ① 오늘의 한마디 — 등급 × 오늘 들어오는 결(십성)
const HEADLINE: Record<FortuneTier, string[]> = {
  '흐름이 좋은 날': [
    '오늘은 미뤄둔 일을 꺼내어\n한 걸음 나아가기 좋은 날입니다.',
    '오늘은 마음먹은 것을\n밖으로 꺼내 보기 좋은 날입니다.',
    '오늘은 흐름이 순하니\n망설이던 일을 시작해도 좋은 날입니다.',
    '오늘은 주변의 도움이 닿기 쉬워\n혼자 안고 있던 일을 나누기 좋은 날입니다.',
  ],
  '차분히 나아갈 날': [
    '오늘은 새로운 것을 벌이기보다\n이미 시작한 일을 단단히 다듬기 좋은 날입니다.',
    '오늘은 서두르지 않아도\n하던 일이 제 속도로 나아가는 날입니다.',
    '오늘은 큰 결정보다\n작은 정리가 더 잘 풀리는 날입니다.',
    '오늘은 조용히 손에 익은 일을\n이어가기 좋은 날입니다.',
  ],
  '신중함이 필요한 날': [
    '오늘은 결정을 서두르기보다\n한 번 더 확인하고 가면 좋은 날입니다.',
    '오늘은 말을 얹기보다\n먼저 듣는 편이 편안한 날입니다.',
    '오늘은 새로 벌이는 것보다\n지금 있는 것을 지키기 좋은 날입니다.',
    '오늘은 급한 마음이 앞설 수 있으니\n한 박자 늦춰가면 좋은 날입니다.',
  ],
  '잠시 쉬어갈 날': [
    '오늘은 밀어붙이기보다\n한숨 고르며 힘을 아끼기 좋은 날입니다.',
    '오늘은 애써 맞추려 하지 말고\n나를 먼저 돌보아도 좋은 날입니다.',
    '오늘은 되지 않는 일을 붙잡기보다\n내일로 미뤄두어도 괜찮은 날입니다.',
    '오늘은 조용한 자리에서\n마음을 쉬게 해주면 좋은 날입니다.',
  ],
};

/** ② 오늘 들어오는 기운 — 오행을 쉬운 말로 */
const OHENG_PLAIN: Record<Oheng, { word: string; act: string }> = {
  목: { word: '나무', act: '생각을 말이나 글로 구체화할수록' },
  화: { word: '불', act: '마음을 밝게 표현하고 사람을 만날수록' },
  토: { word: '흙', act: '벌여둔 것을 한자리에 모아 정리할수록' },
  금: { word: '쇠', act: '기준을 세우고 덜어낼 것을 덜어낼수록' },
  수: { word: '물', act: '서두르지 않고 한 박자 늦춰 살필수록' },
};

const ENERGY_ROLE_TAIL: Record<FortuneBasis['incomingRole'], string[]> = {
  용신: [
    '흐름이 좋아질 수 있어요.',
    '한결 수월하게 풀릴 수 있어요.',
    '평소보다 손에 잘 잡힐 수 있어요.',
  ],
  희신: [
    '흐름이 부드러워질 수 있어요.',
    '무리 없이 이어갈 수 있어요.',
    '차분하게 나아갈 수 있어요.',
  ],
  보통: [
    '평소의 속도를 지키기 좋아요.',
    '무리하지 않는 만큼 편안해요.',
    '있는 자리를 다지기 좋아요.',
  ],
  기신: [
    '한 박자 늦추는 편이 편안해요.',
    '조금 덜어내는 편이 나아요.',
    '욕심을 줄이면 한결 가벼워져요.',
  ],
};

/** ③ 분야별 — 일·학업: 오늘 들어오는 결(십성 그룹) 기준 */
const AREA_WORK: Record<SipseongGroup, string[]> = {
  비겁: [
    '혼자 끌어안기보다 곁의 사람과 나눠 들면 가벼워지는 흐름이에요. 경쟁하는 마음이 올라오면 잠시 내려두세요.',
    '내 몫을 지키려는 힘이 강해지는 날이에요. 밀어붙이기보다 속도를 맞추면 좋겠어요.',
  ],
  식상: [
    '떠오른 생각을 밖으로 꺼내기 좋은 흐름이에요. 다만 말이 앞서면 오해가 생길 수 있으니 한 번 정리하고 꺼내보세요.',
    '표현하고 만들어내는 힘이 살아나는 날이에요. 기록으로 남겨두면 나중에 쓰임이 있어요.',
  ],
  재성: [
    '벌여둔 일을 실제 결과로 만들기 좋은 흐름이에요. 마무리 기한을 다시 확인해두면 좋겠어요.',
    '눈에 보이는 성과 쪽으로 마음이 기우는 날이에요. 욕심을 조금만 덜면 더 잘 잡혀요.',
  ],
  관성: [
    '맡은 책임이 또렷해지는 흐름이에요. 정해진 절차를 지키는 쪽이 편안합니다.',
    '평가나 점검이 마음에 걸릴 수 있어요. 미리 정리해두면 부담이 덜해요.',
    '규칙과 기한을 챙기기 좋은 날이에요. 무리한 약속은 미루는 편이 좋겠어요.',
  ],
  인성: [
    '배우고 익히기 좋은 흐름이에요. 새로 벌이기보다 이미 있는 자료를 깊게 보는 쪽이 잘 맞아요.',
    '집중이 안으로 모이는 날이에요. 조용한 자리에서 하던 공부를 이어가면 좋겠어요.',
  ],
};

/** 재물 — 십성 그룹 기준. 투자·계약을 대신 결정해주지 않는다 */
const AREA_MONEY: Record<SipseongGroup, string[]> = {
  비겁: [
    '나가는 돈이 늘어나기 쉬운 흐름이에요. 함께 쓰는 자리에서 한도를 미리 정해두면 편해요.',
    '주변과 얽힌 금전 이야기가 나올 수 있어요. 서로의 몫을 분명히 해두는 편이 좋겠어요.',
  ],
  식상: [
    '쓰고 싶은 마음이 앞설 수 있는 날이에요. 사고 싶은 것이 있다면 하루 미뤄두고 다시 보세요.',
    '새로운 것에 눈이 가는 흐름이에요. 지금 꼭 필요한 것인지 한 번 더 따져보면 좋겠어요.',
  ],
  재성: [
    '금전 판단이 또렷해지는 흐름이에요. 다만 큰 결정은 조건을 문서로 확인한 뒤에 정하시길 권해요.',
    '들어오고 나가는 것을 정리하기 좋은 날이에요. 미뤄둔 정산이 있다면 오늘 살펴보세요.',
  ],
  관성: [
    '약속과 조건을 꼼꼼히 볼 흐름이에요. 서명이 필요한 일이라면 기한과 책임 범위를 먼저 확인하세요.',
    '지출을 관리하기 좋은 날이에요. 고정으로 나가는 것부터 점검해보면 좋겠어요.',
  ],
  인성: [
    '당장의 수익보다 배움에 쓰는 돈이 어울리는 흐름이에요. 급한 결정은 미뤄두어도 괜찮아요.',
    '금전은 크게 움직이지 않는 날이에요. 계획을 다시 세워두기 좋아요.',
  ],
};

/** 관계 — 나의 일지와 오늘 일지의 관계 기준 */
const AREA_RELATION: Record<BranchRelation, string[]> = {
  yukhap: [
    '사람과 마음이 잘 맞물리는 흐름이에요. 미뤄둔 연락이 있다면 오늘 건네보면 좋겠어요.',
    '대화가 부드럽게 이어지는 날이에요. 하고 싶던 말을 꺼내기 좋아요.',
  ],
  samhap: [
    '여럿이 함께할 때 힘이 나는 흐름이에요. 도움을 청하면 생각보다 쉽게 닿아요.',
    '사람을 통해 일이 풀리는 날이에요. 혼자 애쓰기보다 곁을 살펴보세요.',
  ],
  none: [
    '관계는 잔잔하게 흐르는 날이에요. 무리해서 자리를 만들기보다 편한 사람과 지내면 좋겠어요.',
    '특별한 굴곡 없이 지나가는 흐름이에요. 평소의 인사만으로 충분해요.',
  ],
  hae: [
    '작은 오해가 생기기 쉬운 흐름이에요. 짧게 답하기보다 한 문장 더 설명해두면 편안해요.',
    '서운함이 스칠 수 있는 날이에요. 마음을 넘겨짚기보다 물어보는 편이 나아요.',
  ],
  pa: [
    '하던 이야기가 어긋나기 쉬운 흐름이에요. 약속은 시간과 장소를 다시 확인해두세요.',
    '이야기가 중간에 끊길 수 있는 날이에요. 중요한 말은 글로 남겨두면 좋겠어요.',
  ],
  hyeong: [
    '말이 날카로워지기 쉬운 흐름이에요. 감정이 올라오면 잠시 자리를 옮겨보세요.',
    '부딪히는 자리가 생길 수 있어요. 이기려 하기보다 한 걸음 물러서면 편안합니다.',
  ],
  chung: [
    '마음이 흔들리기 쉬운 흐름이에요. 오늘 하는 말은 한 번 더 고르면 좋겠어요.',
    '감정의 폭이 커질 수 있는 날이에요. 급한 답장은 조금 미뤄두세요.',
  ],
};

/** 마음·건강 — 오늘 들어오는 기운의 역할 기준. 의료 판단은 하지 않는다 */
const AREA_MIND: Record<FortuneBasis['incomingRole'], string[]> = {
  용신: [
    '마음이 가벼워지는 흐름이에요. 몸도 따라 가벼우니 미뤄둔 산책이라도 걸어보세요.',
    '기운이 도는 날이에요. 좋아하는 일에 조금 시간을 내어주면 좋겠어요.',
  ],
  희신: [
    '컨디션이 무난하게 이어지는 날이에요. 늘 하던 리듬을 지키면 편안합니다.',
    '큰 기복 없이 흐르는 흐름이에요. 잠자는 시간만 지켜도 충분해요.',
  ],
  보통: [
    '평소와 비슷한 컨디션이에요. 무리하지 않는 선에서 하던 대로 지내면 좋겠어요.',
    '몸도 마음도 잔잔한 날이에요. 쉬는 시간을 조금 앞당겨보세요.',
  ],
  기신: [
    '쉽게 지칠 수 있는 흐름이에요. 할 일을 하나 덜어두면 마음이 한결 편해져요.',
    '마음이 무거워질 수 있는 날이에요. 애써 기운 내려 하지 말고 쉬어도 괜찮아요.',
  ],
};

/** ④ 오늘의 작은 실천 — 오늘 들어오는 기운의 오행 기준 */
const DO_THIS: Record<Oheng, string[]> = {
  목: [
    '미뤄두었던 연락 한 건을 차분히 마무리해 보세요.',
    '머릿속에 맴돌던 생각을 세 줄로 적어보세요.',
    '오늘 할 일 중 하나만 골라 끝까지 마쳐보세요.',
  ],
  화: [
    '고맙다는 말을 한 사람에게 전해보세요.',
    '오래 못 본 사람에게 짧은 안부를 남겨보세요.',
    '오늘 좋았던 순간 하나를 기록해 두세요.',
  ],
  토: [
    '책상 위나 가방 속을 한 번 정리해 보세요.',
    '흩어진 일정을 한 곳에 모아 적어보세요.',
    '오래 미뤄둔 작은 정리 하나를 끝내보세요.',
  ],
  금: [
    '더 이상 쓰지 않는 것 하나를 정리해 보세요.',
    '해야 할 일 목록에서 하나를 지워보세요.',
    '거절해야 할 일이 있다면 정중히 말해보세요.',
  ],
  수: [
    '평소보다 삼십 분 일찍 잠자리에 들어보세요.',
    '결정을 하루 미뤄두고 내일 다시 보세요.',
    '조용한 곳에서 잠깐 숨을 고르는 시간을 가져보세요.',
  ],
};

/** 오늘 피하면 좋은 것 — 지지 관계 기준 */
const AVOID_THIS: Record<BranchRelation, string[]> = {
  yukhap: [
    '분위기에 밀려 그 자리에서 큰 약속을 정하는 일',
    '좋은 흐름을 믿고 확인 없이 일을 넘기는 것',
  ],
  samhap: [
    '여럿의 말에 휩쓸려 내 몫을 넘겨버리는 일',
    '자리가 좋다고 예정에 없던 지출을 늘리는 것',
  ],
  none: [
    '한 번에 여러 가지를 붙잡으려 하는 일',
    '피곤한데도 일정을 더 얹는 것',
  ],
  hae: [
    '짧은 답장으로 오해를 그냥 두는 일',
    '서운한 마음을 말없이 담아두는 것',
  ],
  pa: [
    '약속 시간과 장소를 확인 없이 넘기는 일',
    '중요한 이야기를 말로만 주고받는 것',
  ],
  hyeong: [
    '감정이 올라온 상태에서 바로 답장을 보내는 일',
    '지지 않으려고 대화를 끝까지 끌고 가는 것',
  ],
  chung: [
    '감정이 올라온 상태에서 바로 답장을 보내는 일',
    '오늘 안에 결론을 내야 한다고 스스로 몰아붙이는 것',
  ],
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
  const recent = new Set(input.recentKeys ?? []);
  const sajuKey = `${saju.dayStem.name}${saju.dayBranch.name}${saju.monthStem.name}${saju.monthBranch.name}`;
  const seed = (salt: string) => hashSeed(date, sajuKey, salt);
  const usedKeys: string[] = [];

  const take = (pool: string[], salt: string, name: string) => {
    const text = pick(pool, seed(salt), name, recent);
    usedKeys.push(keyOf(pool, text, name));
    return text;
  };

  const headline = take(HEADLINE[tier], 'headline', `headline:${tier}`);

  const plain = OHENG_PLAIN[incomingOheng];
  const tail = take(
    ENERGY_ROLE_TAIL[incomingRole],
    'energy',
    `energy:${incomingRole}`
  );
  const needLine =
    incomingRole === '용신' || incomingRole === '희신'
      ? `사주에 부족했던 ${plain.word}의 기운이 들어옵니다`
      : incomingRole === '기신'
        ? `이미 두터운 ${plain.word}의 기운이 더해집니다`
        : `${plain.word}의 기운이 들어옵니다`;
  const energy = `오늘은 ${needLine}. ${plain.act} ${tail}`;

  const areas: Record<FortuneAreaKey, string> = {
    work: take(AREA_WORK[sipseong], 'work', `work:${sipseong}`),
    money: take(AREA_MONEY[sipseong], 'money', `money:${sipseong}`),
    relation: take(
      AREA_RELATION[branchRelation],
      'relation',
      `relation:${branchRelation}`
    ),
    mind: take(AREA_MIND[incomingRole], 'mind', `mind:${incomingRole}`),
  };

  const doThis = take(DO_THIS[incomingOheng], 'do', `do:${incomingOheng}`);
  const avoidThis = take(
    AVOID_THIS[branchRelation],
    'avoid',
    `avoid:${branchRelation}`
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

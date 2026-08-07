// ============================================================
// 오늘의 운세 (日運) 생성 모듈
// 사주 기반 일일 운세, 행운 정보, 주문(呪文) 생성
// ============================================================

import type { SajuResult, OhengScore, Oheng, JiJi } from './saju';
import { getOheng, getSaju, JIJI } from './saju';
import { getLoveSinsal } from './sinsal-love';

/** 관계 상태 — 애정운 조언 맞춤용 (user_profile.loveStatus) */
export type LoveStatus = 'single' | 'crush' | 'dating' | 'married' | 'private';

/**
 * 사주 기반 애정운 상세
 * — 오늘의 일진(日辰) 지지와 내 일지(日支, 배우자궁)의 합·충 관계로 읽는다.
 */
export interface LoveFortuneDetail {
  score: 1 | 2 | 3 | 4 | 5;
  /** 근거 기반 문장 (기존 풀 문장과 결합) */
  text: string;
  /** 왜 이런 운세인지 — 명리 근거 한 줄 */
  basis: string;
  /** 오늘 실천해보면 좋은 행동 힌트 */
  luckyAction: string;
}

/** 오늘의 운세 결과 */
export interface DailyFortune {
  date: string; // YYYY-MM-DD
  overall: string;
  money: string;
  love: string;
  health: string;
  study: string;
  luckyColor: string;
  luckyDirection: string;
  luckyNumber: number;
  dailyMantra: string;
  score: 1 | 2 | 3 | 4 | 5;
  /** 사주 기반 애정운 상세 (love 는 이 text 와 동일한 문자열을 유지) */
  loveDetail: LoveFortuneDetail;
}

// ─── 운세 텍스트 풀 (카테고리별 20개 이상) ─────────────────────

const OVERALL_FORTUNES: string[] = [
  '오늘은 기운이 밝게 빛나는 날입니다. 자신감을 갖고 나아가세요.',
  '조용히 내면의 소리에 귀 기울이면 좋은 기회가 찾아옵니다.',
  '주변 사람들과의 조화가 빛나는 하루가 될 것입니다.',
  '작은 변화가 큰 행운의 시작이 됩니다. 새로운 것을 시도해보세요.',
  '오늘은 쉬어가는 것도 지혜입니다. 무리하지 마세요.',
  '활기찬 에너지가 감도는 날입니다. 적극적으로 행동하세요.',
  '오래된 인연이 다시 찾아올 수 있는 날입니다.',
  '마음을 비우면 복이 들어옵니다. 욕심을 내려놓으세요.',
  '뜻밖의 좋은 소식이 찾아올 수 있습니다.',
  '차분하게 계획을 세우면 모든 일이 순조롭습니다.',
  '하늘의 기운이 당신을 돕고 있습니다. 믿고 나아가세요.',
  '오늘은 결단력이 필요한 날입니다. 망설이지 마세요.',
  '주변의 따뜻한 말 한마디가 큰 힘이 되는 날입니다.',
  '인내의 열매를 맺을 수 있는 시기입니다.',
  '직감을 믿으세요. 오늘 당신의 감이 정확합니다.',
  '작은 친절이 큰 복으로 돌아오는 날입니다.',
  '오늘 시작한 일은 좋은 결실을 맺을 것입니다.',
  '과거를 내려놓고 새로운 시작을 할 좋은 때입니다.',
  '조급해하지 마세요. 때가 되면 자연스럽게 풀립니다.',
  '당신의 성실함이 빛을 발하는 날입니다.',
  '예상치 못한 곳에서 도움의 손길이 찾아옵니다.',
  '오늘은 감사의 마음을 표현하면 복이 배로 옵니다.',
];

const MONEY_FORTUNES: string[] = [
  '재물운이 좋습니다. 기대하지 않았던 수입이 생길 수 있어요.',
  '소비를 줄이고 절약하는 것이 현명한 날입니다.',
  '투자보다는 저축에 집중하면 좋은 결과가 있습니다.',
  '금전적인 거래에서 신중함이 필요합니다.',
  '작은 돈이라도 소중히 여기면 큰 복이 됩니다.',
  '오늘은 돈보다 사람에게 투자하세요.',
  '부수입의 기회가 엿보입니다. 주변을 잘 살피세요.',
  '불필요한 지출을 점검할 좋은 때입니다.',
  '금전 문제로 고민이 있다면 오늘 해결의 실마리를 찾을 수 있어요.',
  '재물이 모이는 기운이 강합니다. 계획적으로 관리하세요.',
  '뜻밖의 선물이나 보너스가 있을 수 있습니다.',
  '큰 지출은 내일로 미루는 것이 현명합니다.',
  '재물운이 서서히 상승하고 있습니다. 조금만 기다리세요.',
  '오늘 아끼는 만큼 내일의 풍요가 됩니다.',
  '동쪽에서 재물의 기운이 불어옵니다.',
  '기부나 나눔이 재물운을 더 높여줍니다.',
  '정직한 거래가 큰 이익을 가져다줍니다.',
  '가까운 사람과의 금전 거래는 피하세요.',
  '새로운 수입원을 탐색하기 좋은 시기입니다.',
  '재물 관련 문서를 꼼꼼히 확인하세요.',
  '오늘의 작은 투자가 미래의 큰 수확이 될 수 있습니다.',
];

const LOVE_FORTUNES: string[] = [
  '사랑하는 사람에게 따뜻한 말 한마디를 건네보세요.',
  '새로운 만남의 기운이 감돌고 있습니다.',
  '연인과의 작은 다툼은 이해와 양보로 풀어보세요.',
  '오늘은 혼자만의 시간도 소중합니다.',
  '진심을 담은 표현이 상대의 마음을 움직입니다.',
  '오래된 친구에게 연락해보세요. 뜻밖의 기쁨이 있습니다.',
  '사랑의 기운이 높아지는 날입니다. 적극적으로 다가가세요.',
  '상대방의 입장에서 생각해보면 관계가 더 깊어집니다.',
  '가족에게 감사의 마음을 전하면 행복이 배가 됩니다.',
  '인연의 실이 움직이고 있습니다. 마음을 열어두세요.',
  '서두르지 않는 것이 더 좋은 인연을 만듭니다.',
  '솔직한 대화가 관계를 더 단단하게 만듭니다.',
  '오늘 만나는 사람 중 귀인이 있을 수 있습니다.',
  '상대의 작은 변화를 눈여겨보세요. 사랑의 신호일 수 있어요.',
  '과거의 상처를 치유할 수 있는 날입니다.',
  '따뜻한 차 한 잔을 나누면 마음이 가까워집니다.',
  '사랑은 기다림 속에서 영글어갑니다. 조급해하지 마세요.',
  '당신의 매력이 빛나는 날입니다. 자신감을 가지세요.',
  '작은 서프라이즈가 큰 감동을 줄 수 있습니다.',
  '마음속 진심을 표현할 용기를 내보세요.',
  '관계에서 주는 것이 더 큰 행복으로 돌아옵니다.',
];

const HEALTH_FORTUNES: string[] = [
  '오늘은 가벼운 산책이 몸과 마음을 모두 풀어줍니다.',
  '충분한 수면이 건강의 비결입니다. 일찍 쉬세요.',
  '따뜻한 음식으로 기운을 보충하세요.',
  '스트레칭으로 몸의 긴장을 풀어주세요.',
  '건강이 최고의 재산입니다. 무리하지 마세요.',
  '오늘은 물을 충분히 마시는 것이 좋습니다.',
  '기름진 음식보다는 담백한 식사가 몸에 좋은 날입니다.',
  '명상이나 심호흡으로 마음의 안정을 찾으세요.',
  '허리와 목 건강에 신경 쓰세요.',
  '신선한 과일과 채소를 섭취하면 기운이 회복됩니다.',
  '자연 속에서 시간을 보내면 치유의 효과가 있습니다.',
  '과로를 피하고 규칙적인 생활을 유지하세요.',
  '오늘은 소화기관에 부담을 주지 않는 것이 좋습니다.',
  '따뜻한 족욕이 피로를 풀어줍니다.',
  '눈의 피로를 줄이기 위해 잠시 먼 곳을 바라보세요.',
  '가벼운 운동이 하루의 활력을 높여줍니다.',
  '기분 전환이 건강에도 도움이 됩니다.',
  '체온을 따뜻하게 유지하는 것이 중요한 날입니다.',
  '충분한 휴식이 최고의 보약입니다.',
  '좋은 사람들과 함께하면 면역력도 올라갑니다.',
  '오늘의 한 끼는 정성을 담아 천천히 드세요.',
];

const STUDY_FORTUNES: string[] = [
  '집중력이 높아지는 시간입니다. 중요한 공부를 시작하세요.',
  '새로운 분야에 대한 호기심이 좋은 결과를 만듭니다.',
  '암기보다는 이해 중심의 학습이 효과적인 날입니다.',
  '조용한 환경에서 공부하면 효율이 두 배가 됩니다.',
  '오늘 배운 것이 미래에 큰 힘이 됩니다.',
  '독서의 기운이 좋은 날입니다. 책을 한 권 펼쳐보세요.',
  '스터디 그룹이나 토론이 학습 효과를 높여줍니다.',
  '어려운 문제도 끈기 있게 도전하면 풀립니다.',
  '잠깐의 낮잠이 오히려 학습 효율을 높여줍니다.',
  '필기와 정리가 기억력을 높여주는 날입니다.',
  '시험 준비에 좋은 기운이 함께합니다.',
  '창의적인 아이디어가 떠오르는 날입니다. 메모하세요.',
  '오늘은 복습에 집중하면 큰 효과가 있습니다.',
  '배움에는 끝이 없습니다. 꾸준함이 답입니다.',
  '선생님이나 멘토의 조언에 귀 기울여보세요.',
  '새로운 기술이나 자격증에 도전하기 좋은 날입니다.',
  '학습 계획을 다시 점검하고 조정해보세요.',
  '오늘의 노력이 내일의 성과를 만듭니다.',
  '마음을 차분히 하고 한 가지에 집중하세요.',
  '목표를 작게 나누면 달성이 쉬워집니다.',
  '동료와 함께 공부하면 시너지가 생기는 날입니다.',
];

// ─── 행운의 색상 (오행별) ─────────────────────────────────────
const LUCKY_COLORS: Record<Oheng, string[]> = {
  목: ['청색', '초록색', '연두색'],
  화: ['적색', '분홍색', '주황색'],
  토: ['황색', '갈색', '베이지색'],
  금: ['백색', '은색', '금색'],
  수: ['흑색', '남색', '보라색'],
};

// ─── 행운의 방위 ──────────────────────────────────────────────
const LUCKY_DIRECTIONS: Record<Oheng, string> = {
  목: '동쪽',
  화: '남쪽',
  토: '중앙',
  금: '서쪽',
  수: '북쪽',
};

// ─── 일일 주문 (呪文) — 전통 주문풍 격려 문구 ──────────────────
const DAILY_MANTRAS: string[] = [
  '급급여율령(急急如律令) — 모든 일이 빠르게 풀리리라',
  '천지신명이 당신의 길을 밝히리니 두려움을 내려놓으소서',
  '부디 오늘 하루, 복덕(福德)이 가득하소서',
  '삼재팔난(三災八難)이 물러가고 길한 기운만 머무소서',
  '천상천하 유아독존(天上天下 唯我獨尊) — 오늘의 주인공은 당신입니다',
  '만사형통(萬事亨通) — 모든 일이 뜻대로 이루어지소서',
  '대길대복(大吉大福) — 큰 길함과 큰 복이 함께하소서',
  '마음을 고요히 하면 하늘의 뜻이 보이리라',
  '가는 길에 꽃이 피고, 머무는 곳에 별이 빛나소서',
  '지성이면 감천(至誠感天) — 정성을 다하면 하늘도 감동하리라',
  '태풍이 지나면 맑은 하늘이 옵니다. 견뎌내소서',
  '운명은 바꿀 수 있습니다. 오늘부터 시작하세요',
  '음덕(陰德)을 쌓으면 양복(陽福)이 찾아옵니다',
  '오늘의 고생이 내일의 보물이 되리라',
  '비바람 뒤에 무지개가 뜨듯, 좋은 날이 오고 있습니다',
  '하늘이 내린 복은 스스로 걷는 자에게 찾아옵니다',
  '인과응보(因果應報) — 좋은 씨앗을 뿌리면 좋은 열매를 거둡니다',
  '천리길도 한 걸음부터, 오늘의 한 걸음이 위대합니다',
];

// ─── 해시 기반 시드 생성 (날짜+사주 조합) ─────────────────────
function hashSeed(dateStr: string, sajuKey: string): number {
  const str = dateStr + sajuKey;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function pickFromPool<T>(pool: T[], rng: () => number): T {
  return pool[Math.floor(rng() * pool.length)];
}

// ─── 애정운: 일진(日辰) × 일지(배우자궁) 관계 ─────────────────
// 전통 근거:
//  · 일지(日支) = 배우자궁 — 인연의 바탕 자리
//  · 오늘의 일진 지지가 내 일지와 육합/삼합이면 인연이 닿기 좋은 날,
//    충(沖)이면 감정 기복이 있는 날 (단, 절망 진술 금지 — 재해석)
//  · 오늘 지지가 내 도화지(桃花支)와 일치하면 매력이 빛나는 날

/** 지지육합 6합 — index 쌍 (자축·인해·묘술·진유·사신·오미) */
const LOVE_YUKHAP: [number, number][] = [
  [0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7],
];

/** 삼합 4국 — index 3개 (인오술·사유축·신자진·해묘미) */
const LOVE_SAMHAP: number[][] = [
  [2, 6, 10],
  [5, 9, 1],
  [8, 0, 4],
  [11, 3, 7],
];

/** 도화지 조견표 — 삼합 그룹 기준 (신자진→유 / 인오술→묘 / 사유축→오 / 해묘미→자) */
const LOVE_DOHWA_TARGET: Record<string, string> = {
  신: '유', 자: '유', 진: '유',
  인: '묘', 오: '묘', 술: '묘',
  사: '오', 유: '오', 축: '오',
  해: '자', 묘: '자', 미: '자',
};

function branchIndex(b: JiJi): number {
  return JIJI.findIndex((j) => j.name === b.name && j.hanja === b.hanja);
}

type LoveRelation = 'yukhap' | 'samhap' | 'chung' | 'none';

function getLoveRelation(myDay: JiJi, todayBranch: JiJi): LoveRelation {
  const a = branchIndex(myDay);
  const b = branchIndex(todayBranch);
  if (LOVE_YUKHAP.some(([x, y]) => (x === a && y === b) || (x === b && y === a)))
    return 'yukhap';
  if (
    a !== b &&
    LOVE_SAMHAP.some((g) => g.includes(a) && g.includes(b))
  )
    return 'samhap';
  if ((a + 6) % 12 === b) return 'chung';
  return 'none';
}

// 관계별 근거 문장 · 실천 힌트
const LOVE_TEXT: Record<LoveRelation, string[]> = {
  yukhap: [
    '인연이 자연스럽게 가까워지는 날이에요. 마음이 가는 사람이 있다면 오늘을 놓치지 마세요.',
    '인연이 자연스럽게 가까워지는 날이에요. 작은 대화 하나가 깊은 연결로 이어질 수 있어요.',
  ],
  samhap: [
    '함께하는 자리에서 좋은 기운이 흐르는 날이에요. 사람들 속에 있을 때 인연의 문이 열립니다.',
    '함께하는 자리에서 좋은 기운이 모이는 날이에요. 여럿이 어울리는 시간이 뜻밖의 설렘을 데려와요.',
  ],
  chung: [
    '감정의 파도가 있는 날이에요. 답장을 재촉하기보다 한 호흡 쉬어가면 부드럽게 지나갑니다.',
    '감정의 파도가 오갈 수 있는 날이에요. 말을 아끼고 들어주는 쪽을 택하면 오히려 마음이 가까워져요.',
  ],
  none: [
    '잔잔하게 흐르는 하루예요.',
    '큰 파도 없이 평온한 인연의 날이에요.',
  ],
};

const LOVE_ACTION: Record<LoveRelation, string[]> = {
  yukhap: ['먼저 연락해보기 좋은 날', '따뜻한 안부 한마디 건네보기'],
  samhap: ['모임이나 함께하는 자리에 나가보기', '같이 밥 한 끼 하자고 청해보기'],
  chung: ['말하기 전에 한 호흡 쉬어가기', '답장을 재촉하지 않고 기다려주기'],
  none: ['좋아하는 사람의 안부를 가만히 떠올려보기', '나를 돌보는 시간 갖기'],
};

const LOVE_DOHWA_ACTION = [
  '평소 좋아하는 옷차림으로 나서보기',
  '사람 많은 자리에 얼굴 비춰보기',
];

// ── 관계 상태별 실천 힌트 (private/미설정은 기존 중립 문구 유지) ──
// 사주 근거(육합·삼합·충·도화) 판정은 동일 — 조언 어조만 상태에 맞춘다.
type LoveTone = 'good' | 'chung' | 'none';

const STATUS_LOVE_ACTION: Record<
  Exclude<LoveStatus, 'private'>,
  Record<LoveTone, string[]>
> = {
  single: {
    good: ['새로운 사람들 속에 나가보기 좋은 날', '모임·약속을 만들어보세요'],
    chung: ['서두르지 않아도 괜찮은 날 — 나를 돌보는 시간'],
    none: ['일상 속 작은 설렘을 놓치지 마세요'],
  },
  crush: {
    good: ['먼저 말 걸어보기 좋은 날', '가벼운 안부 한 마디부터'],
    chung: ['고백은 오늘 말고 마음만 차분히'],
    none: ['자연스러운 자리에서 눈인사부터'],
  },
  dating: {
    good: ['연인에게 먼저 연락해보기 좋은 날'],
    chung: ['말 한마디 조심 — 다툴 날엔 먼저 안아주기'],
    none: ['소소한 데이트가 기억에 남는 날'],
  },
  married: {
    good: ['배우자와 따뜻한 대화 나누기 좋은 날'],
    chung: ['서로의 하루를 물어봐 주세요'],
    none: ['감사 표현 한 번이 복을 부릅니다'],
  },
};

function relationTone(relation: LoveRelation): LoveTone {
  if (relation === 'yukhap' || relation === 'samhap') return 'good';
  if (relation === 'chung') return 'chung';
  return 'none';
}

/**
 * 사주 기반 애정운 상세 산출
 * @param saju 내 사주
 * @param todayBranch 오늘 일진의 지지
 * @param rng 결정적 난수 (같은 날+같은 사주 = 같은 결과)
 * @param loveStatus 관계 상태 — 조언 어조 맞춤 (미설정/private 은 중립 문구)
 */
function computeLoveDetail(
  saju: SajuResult,
  todayBranch: JiJi,
  rng: () => number,
  loveStatus?: LoveStatus
): LoveFortuneDetail {
  // private/미설정은 기존 중립 로직 그대로
  const status =
    loveStatus && loveStatus !== 'private' ? loveStatus : undefined;
  const myDay = saju.dayBranch; // 일지 = 배우자궁
  const relation = getLoveRelation(myDay, todayBranch);

  // 도화지: 년지·일지 삼합 그룹 기준 목표 지지
  const dohwaTargets = new Set<string>([
    LOVE_DOHWA_TARGET[saju.yearBranch.name],
    LOVE_DOHWA_TARGET[saju.dayBranch.name],
  ]);
  const dohwaToday = dohwaTargets.has(todayBranch.name);
  const natalDohwa = getLoveSinsal(saju).dohwa.present;

  // ── 점수 ──
  let score: number;
  switch (relation) {
    case 'yukhap':
      score = rng() < 0.5 ? 4 : 5;
      break;
    case 'samhap':
      score = 4;
      break;
    case 'chung':
      score = rng() < 0.5 ? 2 : 3;
      break;
    default:
      score = 3;
  }
  if (dohwaToday) score = Math.min(5, score + 1);

  // ── 근거(basis) ──
  const myLabel = `${myDay.name}(${myDay.hanja})`;
  const todayLabel = `${todayBranch.name}(${todayBranch.hanja})`;
  let basis: string;
  switch (relation) {
    case 'yukhap':
      basis = `오늘의 기운 ${todayLabel}이 당신의 인연 자리(일지 ${myLabel})와 육합을 이뤘어요.`;
      break;
    case 'samhap':
      basis = `오늘의 기운 ${todayLabel}이 당신의 인연 자리(일지 ${myLabel})와 삼합으로 뭉치는 날이에요.`;
      break;
    case 'chung':
      basis = `오늘의 기운 ${todayLabel}이 당신의 인연 자리(일지 ${myLabel})와 마주 보는 충(沖)의 자리예요. 부딪힘은 마음을 여는 힘이기도 합니다.`;
      break;
    default:
      basis = `오늘의 기운 ${todayLabel}이 당신의 인연 자리(일지 ${myLabel})와 무리 없이 어우러지는 날이에요.`;
  }
  if (dohwaToday) {
    basis += ' 오늘 지지가 당신의 도화(桃花) 자리와 겹쳐 매력이 한층 빛나요.';
  }

  // ── 본문(text) — 근거 기반 문장 + (중립일 때) 기존 풀 문장 결합 ──
  let text = pickFromPool(LOVE_TEXT[relation], rng);
  if (dohwaToday) {
    // 솔로는 도화일 문구를 첫 만남 어조로
    text =
      status === 'single'
        ? `오늘 만나는 사람이 당신을 오래 기억할 거예요. ${text}`
        : `오늘은 당신의 매력이 평소보다 빛나는 날이에요. ${text}`;
  }
  if (relation === 'none') {
    text = `${text} ${pickFromPool(LOVE_FORTUNES, rng)}`;
  }

  // ── 실천 힌트 ──
  // 도화가 든 날은 매력을 살리는 행동을, 그 외엔 관계별 힌트를 권한다.
  // 사주에 도화살이 있으면(타고난 매력) 적극적인 첫 번째 힌트를 우선.
  let luckyAction: string;
  if (dohwaToday && relation !== 'chung') {
    luckyAction = pickFromPool(LOVE_DOHWA_ACTION, rng);
  } else if (natalDohwa && relation !== 'chung') {
    luckyAction = LOVE_ACTION[relation][0];
  } else {
    luckyAction = pickFromPool(LOVE_ACTION[relation], rng);
  }

  // 관계 상태가 설정돼 있으면 실천 힌트를 상태 맞춤 문구로 교체.
  // (기존 rng 소비 순서는 그대로 유지 — 점수·근거·본문 결정성 보존)
  if (status) {
    const pool = STATUS_LOVE_ACTION[status][relationTone(relation)];
    luckyAction = pool.length === 1 ? pool[0] : pickFromPool(pool, rng);
  }

  return {
    score: score as 1 | 2 | 3 | 4 | 5,
    text,
    basis,
    luckyAction,
  };
}

// ─── 지배 오행 결정 ─────────────────────────────────────────
function getDominantOheng(score: OhengScore): Oheng {
  const entries = Object.entries(score) as [Oheng, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function getWeakOheng(score: OhengScore): Oheng {
  const entries = Object.entries(score) as [Oheng, number][];
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0];
}

/**
 * 일일 운세 생성
 * @param saju 사주팔자 결과
 * @param date 날짜 (Date 객체 또는 YYYY-MM-DD 문자열)
 * @param options.loveStatus 관계 상태 — 애정운 조언 어조 맞춤 (선택)
 */
export function getDailyFortune(
  saju: SajuResult,
  date: Date | string,
  options?: { loveStatus?: LoveStatus }
): DailyFortune {
  const dateStr =
    typeof date === 'string'
      ? date
      : date.toISOString().slice(0, 10);

  // 사주 기반 키 생성
  const sajuKey = [
    saju.yearStem.name,
    saju.yearBranch.name,
    saju.monthStem.name,
    saju.monthBranch.name,
    saju.dayStem.name,
    saju.dayBranch.name,
    saju.hourStem.name,
    saju.hourBranch.name,
  ].join('');

  const seed = hashSeed(dateStr, sajuKey);
  const rng = seededRandom(seed);

  // 오행 점수
  const oheng = getOheng(saju);
  const weakEl = getWeakOheng(oheng);
  const dominantEl = getDominantOheng(oheng);

  // 운세 텍스트 선택
  const overall = pickFromPool(OVERALL_FORTUNES, rng);
  const money = pickFromPool(MONEY_FORTUNES, rng);
  // 기존 rng 흐름 유지를 위해 한 번 소비 (다른 항목의 결정성 보존)
  pickFromPool(LOVE_FORTUNES, rng);
  const health = pickFromPool(HEALTH_FORTUNES, rng);
  const study = pickFromPool(STUDY_FORTUNES, rng);

  // ── 애정운: 오늘의 일진(日辰) × 내 일지(배우자궁) ──
  // 별도 시드 rng — 같은 날+같은 사주면 항상 같은 결과
  const [ty, tm, td] = dateStr.split('-').map(Number);
  const todaySaju = getSaju(ty, tm, td, 12);
  const loveRng = seededRandom(hashSeed(dateStr, sajuKey + '::love'));
  const loveDetail = computeLoveDetail(
    saju,
    todaySaju.dayBranch,
    loveRng,
    options?.loveStatus
  );
  const love = loveDetail.text;

  // 행운의 색상: 부족한 오행 기반
  const colorPool = LUCKY_COLORS[weakEl];
  const luckyColor = pickFromPool(colorPool, rng);

  // 행운의 방위: 지배 오행 기반
  const luckyDirection = LUCKY_DIRECTIONS[dominantEl];

  // 행운의 숫자: 1-99
  const luckyNumber = Math.floor(rng() * 99) + 1;

  // 일일 주문
  const dailyMantra = pickFromPool(DAILY_MANTRAS, rng);

  // 총 점수 (1-5): 오행 균형도 기반
  const values = Object.values(oheng);
  const avg = values.reduce((a, b) => a + b, 0) / 5;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / 5;
  const balance = Math.max(0, 100 - Math.sqrt(variance));
  // 날짜 변동 추가
  const dateVariation = rng() * 40 - 20; // -20 ~ +20
  const rawScore = balance + dateVariation;
  const score = Math.max(1, Math.min(5, Math.round(rawScore / 20))) as
    | 1
    | 2
    | 3
    | 4
    | 5;

  return {
    date: dateStr,
    overall,
    money,
    love,
    health,
    study,
    luckyColor,
    luckyDirection,
    luckyNumber,
    dailyMantra,
    score,
    loveDetail,
  };
}

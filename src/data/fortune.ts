// ============================================================
// 오늘의 운세 (日運) 생성 모듈
// 사주 기반 일일 운세, 행운 정보, 주문(呪文) 생성
// ============================================================

import type { SajuResult, OhengScore, Oheng } from './saju';
import { getOheng } from './saju';

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
 */
export function getDailyFortune(
  saju: SajuResult,
  date: Date | string
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
  const love = pickFromPool(LOVE_FORTUNES, rng);
  const health = pickFromPool(HEALTH_FORTUNES, rng);
  const study = pickFromPool(STUDY_FORTUNES, rng);

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
  };
}

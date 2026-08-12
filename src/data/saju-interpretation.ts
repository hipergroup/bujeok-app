// ============================================================
// 사주 해석 데이터 (四柱 解釋)
// 계산된 사주 원국을 "사주를 전혀 모르는 사람"도 읽을 수 있는
// 따뜻한 한국어 설명으로 바꿔주는 모듈.
//
// 원칙
//  1. 단정하지 않는다 — 운명이 정해졌다고 말하지 않는다.
//  2. 겁주지 않는다 — 약점은 "여기를 돌보면 더 좋아져요" 로 표현한다.
//  3. 전문용어는 반드시 괄호로 풀이한다.
//  4. 누구나 자기 이야기로 읽을 수 있게, 넉넉하게 쓴다.
// ============================================================

import type {
  Oheng,
  CheonGan,
  JiJi,
  SajuResult,
  OhengScore,
  AnimalInfo,
} from './saju';

// ─── 한글 조사 헬퍼 ────────────────────────────────────────
/**
 * 마지막 한글 음절에 받침이 있는지.
 * '금(金)' 처럼 뒤에 한자·괄호가 붙어도 읽는 소리('금') 기준으로 판정한다.
 */
function hasJongseong(word: string): boolean {
  for (let i = word.length - 1; i >= 0; i--) {
    const code = word.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      return (code - 0xac00) % 28 !== 0;
    }
  }
  return false;
}

/** 이/가 */
function iGa(word: string): string {
  return word + (hasJongseong(word) ? '이' : '가');
}

/** 을/를 */
function eulReul(word: string): string {
  return word + (hasJongseong(word) ? '을' : '를');
}

// ============================================================
// 1. 일간(日干) 성격 해설 — 10종
//    일간 = 태어난 날의 천간. 사주 여덟 글자 중 "나 자신"을 뜻하는 글자로,
//    성격을 볼 때 가장 먼저 보는 자리입니다.
// ============================================================

/** 일간(日干, 태어난 날의 천간 = 나 자신) 프로필 */
export interface IlganProfile {
  /** 천간 이름 (예: '갑') */
  gan: string;
  /** 한자 (예: '甲') */
  hanja: string;
  /** 오행 */
  oheng: Oheng;
  /** 자연물 비유 (예: '큰 나무') */
  symbol: string;
  /** 대표 이모지 */
  emoji: string;
  /** 한 단어 키워드 */
  keyword: string;
  /** 성격 해설 (2~3문장) */
  personality: string;
  /** 강점 3가지 */
  strength: string[];
  /** 돌보면 좋은 점 2가지 */
  caution: string[];
}

export const ILGAN_PROFILES: Record<string, IlganProfile> = {
  갑: {
    gan: '갑',
    hanja: '甲',
    oheng: '목',
    symbol: '큰 나무',
    emoji: '🌳',
    keyword: '우직함',
    personality:
      '곧게 뻗은 큰 나무처럼 신념이 분명하고 리더십이 있습니다. 한번 정한 방향은 쉽게 흔들리지 않고 끝까지 밀고 나가는 힘이 있어요. 주변 사람들이 은근히 기대고 싶어 하는, 그늘이 넓은 사람입니다.',
    strength: ['책임감이 강함', '앞장서는 추진력', '정직하고 꾸밈이 없음'],
    caution: [
      '유연하게 구부리기 어려울 때가 있어요. 한 걸음 물러서 보면 길이 더 넓어집니다',
      '혼자 다 짊어지려 할 수 있어요. 나눠 들면 훨씬 멀리 갈 수 있습니다',
    ],
  },
  을: {
    gan: '을',
    hanja: '乙',
    oheng: '목',
    symbol: '화초와 넝쿨',
    emoji: '🌱',
    keyword: '유연함',
    personality:
      '바람이 불면 눕고 다시 일어서는 화초처럼 상황에 맞춰 부드럽게 움직이는 사람입니다. 겉으로는 순해 보여도 어떤 환경에서든 뿌리를 내리는 끈질긴 생명력이 있어요. 사람 사이의 공기를 잘 읽고 분위기를 편안하게 만들어 줍니다.',
    strength: ['섬세한 감각과 배려', '어떤 환경에도 적응하는 힘', '오래 버티는 끈기'],
    caution: [
      '마음속 이야기를 늦게 꺼내는 편이에요. 조금 일찍 말해도 괜찮습니다',
      '주변에 맞추다 내 기준이 흐려질 수 있어요. 가끔은 내 쪽으로 기울여도 좋아요',
    ],
  },
  병: {
    gan: '병',
    hanja: '丙',
    oheng: '화',
    symbol: '한낮의 태양',
    emoji: '☀️',
    keyword: '밝음',
    personality:
      '숨김없이 빛을 내주는 태양처럼 솔직하고 시원시원한 사람입니다. 있는 자리를 환하게 만들고, 처음 만난 사람에게도 금세 온기를 전해요. 계산 없이 마음을 먼저 내주는 넉넉함이 큰 매력입니다.',
    strength: ['분위기를 밝히는 에너지', '거짓 없는 솔직함', '베푸는 것을 아까워하지 않음'],
    caution: [
      '감정이 그대로 얼굴에 드러날 때가 있어요. 한 박자 쉬면 마음이 더 잘 전해집니다',
      '한꺼번에 크게 타올랐다 지칠 수 있어요. 쉬는 시간도 일정에 넣어두면 좋아요',
    ],
  },
  정: {
    gan: '정',
    hanja: '丁',
    oheng: '화',
    symbol: '촛불과 등불',
    emoji: '🕯️',
    keyword: '따뜻함',
    personality:
      '어두운 방 안을 조용히 밝히는 촛불 같은 사람입니다. 크게 드러내지 않아도 곁에 있는 사람의 마음을 살뜰히 살피는 다정함이 있어요. 오래 지켜본 사람일수록 이 사람의 깊이를 알아봅니다.',
    strength: ['속 깊은 배려심', '한 가지를 오래 지키는 정성', '섬세한 표현력'],
    caution: [
      '남을 챙기다 내 마음이 뒷전이 될 수 있어요. 나를 먼저 데워도 괜찮습니다',
      '서운함을 안에 오래 담아둘 수 있어요. 가볍게 꺼내 놓으면 더 편해집니다',
    ],
  },
  무: {
    gan: '무',
    hanja: '戊',
    oheng: '토',
    symbol: '넓은 산',
    emoji: '⛰️',
    keyword: '든든함',
    personality:
      '쉽게 움직이지 않는 큰 산처럼 중심이 단단한 사람입니다. 급한 상황에서도 표정이 크게 흔들리지 않아, 곁에 있으면 이상하게 마음이 놓여요. 말보다 행동으로 신뢰를 쌓아가는 편입니다.',
    strength: ['흔들리지 않는 안정감', '약속을 지키는 신용', '넓은 포용력'],
    caution: [
      '변화를 받아들이는 데 시간이 걸려요. 작은 것부터 바꿔보면 한결 수월합니다',
      '속마음을 잘 표현하지 않아요. 한마디만 더 해주면 오해가 줄어듭니다',
    ],
  },
  기: {
    gan: '기',
    hanja: '己',
    oheng: '토',
    symbol: '기름진 밭',
    emoji: '🌾',
    keyword: '포용력',
    personality:
      '무엇을 심어도 잘 키워내는 밭 같은 사람입니다. 자기를 앞세우기보다 곁에 있는 사람이 잘 되도록 조용히 거들어 주는 마음이 커요. 실속 있게 챙기는 현실 감각도 함께 갖추고 있습니다.',
    strength: ['사람을 키워주는 마음', '꼼꼼한 현실 감각', '갈등을 부드럽게 푸는 재주'],
    caution: [
      '이것저것 다 품다 보면 지칠 수 있어요. 덜어내는 연습도 도움이 됩니다',
      '고민을 오래 굴리는 편이에요. 일단 한 걸음 떼면 답이 빨리 보입니다',
    ],
  },
  경: {
    gan: '경',
    hanja: '庚',
    oheng: '금',
    symbol: '바위와 무쇠',
    emoji: '⚔️',
    keyword: '결단력',
    personality:
      '단단한 무쇠처럼 맺고 끊는 것이 분명한 사람입니다. 옳다고 생각하면 주저 없이 움직이고, 어려운 결정도 미루지 않는 뚝심이 있어요. 의리가 있어서 한번 내 사람이라 여기면 끝까지 지켜줍니다.',
    strength: ['빠르고 분명한 판단', '강한 의리와 정의감', '어려움을 견디는 강단'],
    caution: [
      '말이 직선적이라 뜻보다 세게 들릴 수 있어요. 한 겹 부드럽게 감싸면 좋아요',
      '내 기준이 뚜렷한 만큼 타인의 속도가 답답할 수 있어요. 조금 기다려 주면 관계가 편해집니다',
    ],
  },
  신: {
    gan: '신',
    hanja: '辛',
    oheng: '금',
    symbol: '잘 깎은 보석',
    emoji: '💎',
    keyword: '섬세함',
    personality:
      '작지만 빛나는 보석처럼 감각이 예민하고 안목이 높은 사람입니다. 남들이 지나치는 디테일을 정확히 짚어내고, 자기만의 기준으로 깔끔하게 마무리해요. 조용히 있어도 존재감이 또렷합니다.',
    strength: ['뛰어난 미적 감각', '정확하고 깔끔한 마무리', '자기 기준이 분명함'],
    caution: [
      '스스로에게 잣대가 엄격해요. 60점짜리 하루도 충분히 잘한 날입니다',
      '작은 말에도 오래 마음이 쓰여요. 흘려보내는 연습이 큰 힘이 됩니다',
    ],
  },
  임: {
    gan: '임',
    hanja: '壬',
    oheng: '수',
    symbol: '큰 바다와 강',
    emoji: '🌊',
    keyword: '너그러움',
    personality:
      '무엇이든 받아 안는 큰 바다 같은 사람입니다. 생각의 폭이 넓어 사람과 상황을 잘 이해하고, 웬만한 일에는 크게 동요하지 않아요. 자유롭게 흐르면서도 결국 자기 방향을 찾아가는 힘이 있습니다.',
    strength: ['넓은 이해심과 포용', '상황을 크게 보는 통찰', '어디서든 어울리는 사교성'],
    caution: [
      '관심이 여러 갈래로 흐를 수 있어요. 한 곳에 물길을 모으면 힘이 세집니다',
      '속이 깊어 감정을 잘 안 보여줘요. 가까운 사람에게는 조금 열어두면 좋아요',
    ],
  },
  계: {
    gan: '계',
    hanja: '癸',
    oheng: '수',
    symbol: '이슬과 빗방울',
    emoji: '💧',
    keyword: '지혜로움',
    personality:
      '조용히 스며드는 이슬처럼 사려 깊고 눈치가 밝은 사람입니다. 말수가 많지 않아도 상황의 흐름을 정확히 읽어내고, 필요한 순간에 딱 맞는 한마디를 건네요. 상상력과 직감이 남다른 편입니다.',
    strength: ['깊이 있는 관찰력', '뛰어난 직감과 상상력', '조용한 성실함'],
    caution: [
      '생각이 많아 시작이 늦어질 때가 있어요. 작게 먼저 해보면 길이 열립니다',
      '주변 기분에 쉽게 물들어요. 나만의 회복 시간을 챙기면 훨씬 단단해집니다',
    ],
  },
};

// ============================================================
// 2. 사주 네 기둥(四柱)의 의미
//    사주 = 태어난 연 · 월 · 일 · 시를 각각 두 글자로 적은 것.
//    기둥 네 개라서 '사주(四柱)', 글자가 여덟 개라 '팔자(八字)'입니다.
// ============================================================

/** 사주 네 기둥 각각의 의미 */
export interface PillarMeaning {
  key: 'year' | 'month' | 'day' | 'hour';
  /** 표시 이름 (예: '년주(年柱)') */
  label: string;
  /** 담당하는 인생 영역 */
  lifeArea: string;
  /** 대략의 나이대 */
  ageRange: string;
  /** 무엇을 뜻하는 자리인지 */
  represents: string;
  /** 초보자를 위한 한 줄 설명 */
  simple: string;
}

export const PILLAR_MEANINGS: PillarMeaning[] = [
  {
    key: 'year',
    label: '년주(年柱)',
    lifeArea: '조상 · 초년',
    ageRange: '0~15세',
    represents: '가문과 뿌리, 어린 시절의 환경',
    simple: '내가 어떤 배경에서 출발했는지를 보여주는 자리예요. 태어난 해의 기운입니다.',
  },
  {
    key: 'month',
    label: '월주(月柱)',
    lifeArea: '부모 · 청년',
    ageRange: '16~30세',
    represents: '부모와 형제, 공부와 사회생활의 바탕',
    simple:
      '사회에 나가 어떤 자리에서 힘을 내는지 보여주는 자리예요. 직업운을 볼 때 특히 많이 봅니다.',
  },
  {
    key: 'day',
    label: '일주(日柱)',
    lifeArea: '나 자신 · 배우자',
    ageRange: '31~45세',
    represents: '나의 성격과 가장 가까운 사람과의 인연',
    simple:
      '사주에서 가장 중요한 자리예요. 윗글자(일간, 日干)가 곧 "나 자신"을 뜻합니다.',
  },
  {
    key: 'hour',
    label: '시주(時柱)',
    lifeArea: '자녀 · 말년',
    ageRange: '46세 이후',
    represents: '내가 남기는 결실과 나이 들어서의 생활',
    simple:
      '삶의 후반부와 내가 키워낸 것들을 보여주는 자리예요. 태어난 시각의 기운입니다.',
  },
];

/** key 로 바로 찾고 싶을 때 */
export const PILLAR_MEANING_MAP: Record<PillarMeaning['key'], PillarMeaning> = {
  year: PILLAR_MEANINGS[0],
  month: PILLAR_MEANINGS[1],
  day: PILLAR_MEANINGS[2],
  hour: PILLAR_MEANINGS[3],
};

// ============================================================
// 3. 오행(五行) 기본 해설
//    오행 = 세상을 이루는 다섯 가지 기운(나무·불·흙·쇠·물).
//    사주 여덟 글자가 어떤 기운으로 이루어졌는지를 봅니다.
// ============================================================

/** 오행 한 가지에 대한 해설 */
export interface OhengInfo {
  oheng: Oheng;
  hanja: string;
  emoji: string;
  /** 한지 팔레트와 어울리는 표시 색 (밝은 배경에서도 읽히도록 명도 조정) */
  color: string;
  season: string;
  direction: string;
  /** 이 기운이 상징하는 것 */
  meaning: string;
  /** 이 기운이 강한 사람의 특징 */
  trait: string;
  /** 이 기운이 많을 때 (2문장) */
  whenStrong: string;
  /** 이 기운이 적을 때 (2문장) */
  whenWeak: string;
  /** 보강하는 방법 3가지 */
  boostBy: string[];
}

export const OHENG_INFO: Record<Oheng, OhengInfo> = {
  목: {
    oheng: '목',
    hanja: '木',
    emoji: '🌱',
    color: '#3D8B40',
    season: '봄',
    direction: '동쪽',
    meaning: '성장과 시작',
    trait:
      '새로운 일을 벌이고 키워내는 힘이 좋습니다. 인정이 많고 남의 가능성을 잘 알아봅니다.',
    whenStrong:
      '아이디어가 계속 솟아나고 무엇이든 일단 시작해보는 추진력이 넉넉합니다. 다만 벌여놓은 일이 많아질 수 있으니, 하나를 끝까지 키우는 데 마음을 모으면 결실이 더 커져요.',
    whenWeak:
      '새로 시작하는 일 앞에서 한 번 더 재보게 되고, 결정이 늦어질 수 있습니다. 아주 작은 일부터 시작해 성공 경험을 쌓으면 시작하는 힘이 금세 자라납니다.',
    boostBy: [
      '초록색·연둣빛 소품이나 옷을 곁에 두기',
      '화분 기르기, 숲길 산책처럼 살아 있는 것과 가까이 지내기',
      '아침에 창을 열고 동쪽 빛을 쬐며 새 일 계획 세우기',
    ],
  },
  화: {
    oheng: '화',
    hanja: '火',
    emoji: '🔥',
    color: '#C0392B',
    season: '여름',
    direction: '남쪽',
    meaning: '열정과 표현',
    trait:
      '마음을 밝게 내보이고 사람을 끌어당깁니다. 예의 바르고 분위기를 살리는 재주가 있습니다.',
    whenStrong:
      '표현이 시원하고 사람들 앞에서 빛나는 순간이 많습니다. 대신 한꺼번에 크게 타오르다 지칠 수 있으니, 쉬는 시간을 미리 정해두면 열정이 오래갑니다.',
    whenWeak:
      '속마음을 드러내기보다 안에 담아두는 편이라, 오해를 살 때가 있습니다. 좋아하는 것을 소리 내어 말해보는 것만으로도 기운이 살아나요.',
    boostBy: [
      '붉은색·주홍빛(한지 인주색) 포인트를 몸에 지니기',
      '햇볕 잘 드는 곳에서 20분쯤 걷기, 촛불이나 따뜻한 조명 켜두기',
      '좋아하는 사람들과 이야기 나누며 웃는 시간 만들기',
    ],
  },
  토: {
    oheng: '토',
    hanja: '土',
    emoji: '⛰️',
    color: '#C08A12',
    season: '환절기(계절과 계절 사이)',
    direction: '중앙',
    meaning: '안정과 신뢰',
    trait:
      '중심을 잘 잡고 약속을 지킵니다. 사람들 사이에서 믿음을 주는 자리에 자주 서게 됩니다.',
    whenStrong:
      '어떤 일이 있어도 쉽게 흔들리지 않는 든든함이 있습니다. 다만 익숙한 자리에 오래 머물 수 있으니, 가끔 낯선 길로 한 걸음 나가보면 세상이 더 넓어져요.',
    whenWeak:
      '마음이 자주 바뀌고 한 자리에 오래 머무는 것이 답답할 수 있습니다. 잠자리·식사 시간처럼 작은 규칙을 하나 정해두면 중심이 금세 잡힙니다.',
    boostBy: [
      '황토색·베이지 등 흙빛 계열을 가까이 두기',
      '흙과 도자기, 돌처럼 단단한 물건을 만지는 취미 갖기',
      '매일 같은 시간에 하는 작은 습관 하나 만들기',
    ],
  },
  금: {
    oheng: '금',
    hanja: '金',
    emoji: '⚔️',
    color: '#8D8778',
    season: '가을',
    direction: '서쪽',
    meaning: '결단과 정리',
    trait:
      '맺고 끊는 것이 분명하고 마무리가 깔끔합니다. 원칙과 의리를 소중히 여깁니다.',
    whenStrong:
      '판단이 빠르고 해야 할 일을 미루지 않는 실행력이 있습니다. 대신 기준이 뚜렷한 만큼 말이 세게 전해질 수 있으니, 한 겹 부드럽게 감싸면 관계가 훨씬 편해져요.',
    whenWeak:
      '거절이 어렵고 결정을 미루다 마음이 무거워질 때가 있습니다. 작은 일부터 "예/아니오"를 분명히 말해보면 훨씬 가벼워집니다.',
    boostBy: [
      '흰색·은빛 소품이나 금속 액세서리 지니기',
      '서랍 한 칸 비우기처럼 정리·정돈으로 하루 마무리하기',
      '맑은 소리가 나는 물건(풍경, 종)을 곁에 두기',
    ],
  },
  수: {
    oheng: '수',
    hanja: '水',
    emoji: '💧',
    color: '#1F6FB5',
    season: '겨울',
    direction: '북쪽',
    meaning: '지혜와 유연함',
    trait:
      '깊이 생각하고 상황에 맞게 흐릅니다. 눈치가 밝고 배우는 것을 즐깁니다.',
    whenStrong:
      '생각이 깊고 어디에서든 잘 적응하는 유연함이 있습니다. 다만 고민이 길어질 수 있으니, 생각을 글로 적어 밖에 꺼내두면 결정이 한결 쉬워져요.',
    whenWeak:
      '한번 정한 방식을 바꾸기 어렵고, 쉬는 것에 서툴 수 있습니다. 물을 자주 마시고 잠을 넉넉히 자는 것만으로도 여유가 돌아옵니다.',
    boostBy: [
      '검정·짙은 남색(한지 남색) 계열을 가까이 두기',
      '따뜻한 물 자주 마시기, 반신욕이나 물가 산책하기',
      '자기 전 10분, 오늘 생각을 노트에 적어 흘려보내기',
    ],
  },
};

/** 표시 순서용 오행 목록 */
export const OHENG_ORDER: Oheng[] = ['목', '화', '토', '금', '수'];

// ============================================================
// 4. 오행 균형 분석
// ============================================================

/** 오행 균형 분석 결과 */
export interface OhengAnalysis {
  /** 가장 강한 기운 */
  dominant: Oheng;
  /** 부족한 기운 (없거나 현저히 낮은 것) */
  lacking: Oheng[];
  /** balanced=고르게 / concentrated=한쪽으로 모임 / polarized=크게 치우침 */
  balance: 'balanced' | 'concentrated' | 'polarized';
  /** 한 문단 종합 해석 */
  summary: string;
  /** 조언 1~2문장 */
  advice: string;
}

/** 부족하다고 볼 기준선 (최고 기운 대비 비율 점수) */
const LACKING_THRESHOLD = 35;

/**
 * 오행 균형 분석
 *
 * getOheng() 이 돌려주는 점수는 "가장 많은 기운 = 100" 으로 환산한 상대 점수입니다.
 * 따라서 다섯 점수의 합이 클수록 고르게 퍼져 있다는 뜻이 됩니다.
 *  - 다섯 개가 모두 같으면 합계 500 (완전히 고름)
 *  - 하나만 있으면 합계 100 (완전히 치우침)
 */
export function analyzeOheng(score: OhengScore): OhengAnalysis {
  // 가장 강한 기운 (동점이면 목→화→토→금→수 순서로 앞선 것)
  let dominant: Oheng = OHENG_ORDER[0];
  for (const o of OHENG_ORDER) {
    if (score[o] > score[dominant]) dominant = o;
  }

  const zeros = OHENG_ORDER.filter((o) => score[o] <= 0);
  const lacking: Oheng[] =
    zeros.length > 0
      ? zeros
      : OHENG_ORDER.filter((o) => o !== dominant && score[o] <= LACKING_THRESHOLD);

  // 고르게 퍼진 정도 0~1
  const total = OHENG_ORDER.reduce((sum, o) => sum + Math.max(0, score[o]), 0);
  const evenness = Math.min(1, Math.max(0, (total - 100) / 400));

  let balance: OhengAnalysis['balance'];
  if (zeros.length >= 2 || evenness < 0.35) {
    balance = 'polarized';
  } else if (zeros.length === 1 || evenness < 0.6) {
    balance = 'concentrated';
  } else {
    balance = 'balanced';
  }

  const dom = OHENG_INFO[dominant];
  const lackNames = lacking.map((o) => `${o}(${OHENG_INFO[o].hanja})`).join(' · ');

  // ── 종합 해석 ──────────────────────────────────────────
  const head = `사주 여덟 글자를 다섯 기운(오행, 五行)으로 나눠 보면 ${iGa(
    `${dominant}(${dom.hanja})`
  )} 가장 도드라집니다. ${eulReul(dom.meaning)} 뜻하는 기운이라, ${dom.trait}`;

  let body: string;
  let advice: string;

  if (balance === 'balanced') {
    body =
      ' 다섯 기운이 어느 한쪽으로 크게 쏠리지 않고 비교적 고르게 자리 잡고 있어요. 상황에 따라 꺼내 쓸 수 있는 카드가 여러 장 있는 셈이라, 낯선 자리에서도 곧잘 균형을 잡습니다.';
    advice = `이미 균형이 잘 잡혀 있으니 특별히 무리해서 채울 것은 없어요. 그중 ${dominant}(${dom.hanja}) 기운을 가장 편하게 쓸 수 있으니, 잘하고 싶은 일이 있다면 그쪽 방식으로 풀어보세요.`;
  } else if (balance === 'concentrated') {
    body = lacking.length
      ? ` 한 기운 쪽에 힘이 모여 있는 편이고, 상대적으로 ${lackNames} 기운은 옅게 나타납니다. 잘하는 방식이 뚜렷하다는 뜻이라 장점이 되지만, 늘 같은 카드만 쓰게 되면 조금 지칠 수 있어요.`
      : ' 한 기운 쪽에 힘이 모여 있는 편이라, 잘하는 방식이 뚜렷합니다. 다만 늘 같은 카드만 쓰게 되면 조금 지칠 수 있어요.';
    advice = lacking.length
      ? `${eulReul(
          `옅은 ${lackNames} 기운`
        )} 생활 속에서 조금씩 채워보세요. ${OHENG_INFO[lacking[0]].boostBy[0]} 같은 작은 것부터면 충분합니다.`
      : `${dominant}(${dom.hanja}) 기운을 마음껏 쓰되, 가끔은 익숙하지 않은 방식도 한 번씩 시도해보세요.`;
  } else {
    body = lacking.length
      ? ` 반면 ${lackNames} 기운은 원국(原局, 타고난 사주 여덟 글자)에 거의 드러나지 않아요. 이런 사주는 잘하는 분야가 아주 분명하다는 뜻이라, 약점이라기보다 "색이 진한 사람"에 가깝습니다.`
      : ' 기운이 한쪽으로 뚜렷하게 몰려 있어요. 약점이라기보다 색이 진한 사람에 가깝습니다.';
    advice = lacking.length
      ? `없는 기운은 사람과 환경으로도 채워집니다. ${eulReul(
          `${lackNames} 기운`
        )} 가진 사람과 가까이 지내거나, ${
          OHENG_INFO[lacking[0]].boostBy[1]
        } 같은 습관을 하나 들여보세요.`
      : `잘하는 방식을 밀고 나가되, 나와 다른 결을 가진 사람 곁에 있으면 부족한 자리가 자연스럽게 채워집니다.`;
  }

  return {
    dominant,
    lacking,
    balance,
    summary: head + body,
    advice,
  };
}

// ============================================================
// 5. 띠(12지, 十二支) 해설
// ============================================================

/** 띠 동물 해설 */
export interface AnimalProfile {
  animal: string;
  emoji: string;
  hanja: string;
  /** 대표 성향 3가지 */
  traits: string[];
  /** 2문장 설명 */
  description: string;
}

export const ANIMAL_PROFILES: Record<string, AnimalProfile> = {
  쥐: {
    animal: '쥐',
    emoji: '🐭',
    hanja: '子',
    traits: ['눈치가 빠름', '알뜰함', '재주가 많음'],
    description:
      '상황을 빠르게 읽고 필요한 것을 잘 챙기는 야무진 기운입니다. 어디에 있어도 자기 자리를 잘 만들고, 위기에서 오히려 기지를 발휘하는 편이에요.',
  },
  소: {
    animal: '소',
    emoji: '🐮',
    hanja: '丑',
    traits: ['성실함', '인내심', '믿음직함'],
    description:
      '한 걸음씩 꾸준히 밀고 나가는 든든한 기운입니다. 서두르지 않지만 결국 해내는 사람이라, 시간이 지날수록 주변의 신뢰가 두터워집니다.',
  },
  호랑이: {
    animal: '호랑이',
    emoji: '🐯',
    hanja: '寅',
    traits: ['용감함', '리더십', '정의감'],
    description:
      '앞장서서 길을 여는 씩씩한 기운입니다. 불의를 보면 참지 못하고, 어려운 일일수록 오히려 힘이 나는 기질이 있어요.',
  },
  토끼: {
    animal: '토끼',
    emoji: '🐰',
    hanja: '卯',
    traits: ['온화함', '섬세함', '눈치가 밝음'],
    description:
      '부드럽고 다정해서 사람들이 편안해하는 기운입니다. 분위기를 잘 살피고 상대를 배려하는 마음이 커서, 어디서든 미움받지 않는 편이에요.',
  },
  용: {
    animal: '용',
    emoji: '🐲',
    hanja: '辰',
    traits: ['포부가 큼', '카리스마', '상상력'],
    description:
      '남다른 스케일로 꿈을 그리는 기운입니다. 평범한 길보다 자기만의 길을 만들어가는 편이고, 결정적인 순간에 존재감이 크게 드러납니다.',
  },
  뱀: {
    animal: '뱀',
    emoji: '🐍',
    hanja: '巳',
    traits: ['통찰력', '집중력', '신중함'],
    description:
      '조용히 지켜보다 핵심을 정확히 짚어내는 기운입니다. 말수가 많지 않아도 생각이 깊고, 한번 마음먹은 일은 조용히 끝까지 해냅니다.',
  },
  말: {
    animal: '말',
    emoji: '🐴',
    hanja: '午',
    traits: ['활동적임', '솔직함', '자유로움'],
    description:
      '한자리에 머물기보다 나아가며 힘을 내는 기운입니다. 마음이 밝고 솔직해서 사람들이 금세 가까워지고, 시작하는 속도가 남다릅니다.',
  },
  양: {
    animal: '양',
    emoji: '🐑',
    hanja: '未',
    traits: ['다정함', '예술 감각', '평화로움'],
    description:
      '주변을 부드럽게 만드는 온순한 기운입니다. 아름다운 것을 알아보는 감각이 좋고, 다투기보다 함께 잘 지내는 쪽을 택합니다.',
  },
  원숭이: {
    animal: '원숭이',
    emoji: '🐵',
    hanja: '申',
    traits: ['영리함', '재치', '손재주'],
    description:
      '머리 회전이 빠르고 요령을 잘 찾아내는 기운입니다. 새로운 것을 배우는 속도가 빠르고, 딱딱한 자리도 재치로 풀어내는 재주가 있어요.',
  },
  닭: {
    animal: '닭',
    emoji: '🐔',
    hanja: '酉',
    traits: ['꼼꼼함', '부지런함', '표현력'],
    description:
      '하루를 일찍 열고 빈틈없이 챙기는 야무진 기운입니다. 자기 기준이 뚜렷하고 맡은 일은 정확하게 마무리해서 어디서든 인정받는 편이에요.',
  },
  개: {
    animal: '개',
    emoji: '🐶',
    hanja: '戌',
    traits: ['의리', '정직함', '책임감'],
    description:
      '내 사람을 끝까지 지키는 따뜻하고 곧은 기운입니다. 거짓을 싫어하고 약속을 소중히 여겨서, 오래 볼수록 더 믿음이 가는 사람입니다.',
  },
  돼지: {
    animal: '돼지',
    emoji: '🐷',
    hanja: '亥',
    traits: ['너그러움', '복이 많음', '진솔함'],
    description:
      '마음이 넉넉하고 사람을 잘 품는 기운입니다. 욕심 없이 베푸는 편이라 주변에 사람이 모이고, 그 인연이 다시 복으로 돌아옵니다.',
  },
};

// ============================================================
// 6. 종합 해석
// ============================================================

/** 한 사람의 사주를 한눈에 읽을 수 있게 묶은 결과 */
export interface SajuReading {
  /** 나 자신을 뜻하는 일간 해설 */
  ilgan: IlganProfile;
  /** 오행 균형 분석 */
  oheng: OhengAnalysis;
  /** 띠 해설 */
  animal: AnimalProfile;
  /** 네 기둥 (년 → 월 → 일 → 시) */
  pillars: Array<{ meaning: PillarMeaning; gan: CheonGan; ji: JiJi }>;
  /** 한 줄 요약 */
  headline: string;
}

/** 일간 프로필 조회 (모르는 값이면 갑 기준으로 안전하게 대체) */
export function getIlganProfile(gan: CheonGan | string): IlganProfile {
  const name = typeof gan === 'string' ? gan : gan.name;
  return ILGAN_PROFILES[name] ?? ILGAN_PROFILES['갑'];
}

/** 띠 프로필 조회 (모르는 값이면 쥐 기준으로 안전하게 대체) */
export function getAnimalProfile(animal: AnimalInfo | string): AnimalProfile {
  const name = typeof animal === 'string' ? animal : animal.name;
  return ANIMAL_PROFILES[name] ?? ANIMAL_PROFILES['쥐'];
}

/** 균형 상태를 한마디로 (한 줄 요약 뒷부분) */
const BALANCE_PHRASE: Record<OhengAnalysis['balance'], string> = {
  balanced: '고르게 어우러져 있어요',
  concentrated: '넉넉하게 흐르고 있어요',
  polarized: '아주 선명하게 살아 있어요',
};

/** 균형 상태를 한 단어로 (뱃지·라벨용) */
export const BALANCE_LABEL: Record<OhengAnalysis['balance'], string> = {
  balanced: '고른 사주',
  concentrated: '한쪽으로 모인 사주',
  polarized: '색이 진한 사주',
};

/**
 * 사주 종합 해석
 *
 * @param saju   getSaju() 결과 (사주 여덟 글자)
 * @param oheng  getOheng() 결과 (오행 점수)
 * @param animal getAnimal() 결과 (띠)
 */
export function getSajuReading(
  saju: SajuResult,
  oheng: OhengScore,
  animal: AnimalInfo
): SajuReading {
  const ilgan = getIlganProfile(saju.dayStem);
  const ohengAnalysis = analyzeOheng(oheng);
  const animalProfile = getAnimalProfile(animal);
  const dom = OHENG_INFO[ohengAnalysis.dominant];

  const pillars: SajuReading['pillars'] = [
    { meaning: PILLAR_MEANING_MAP.year, gan: saju.yearStem, ji: saju.yearBranch },
    { meaning: PILLAR_MEANING_MAP.month, gan: saju.monthStem, ji: saju.monthBranch },
    { meaning: PILLAR_MEANING_MAP.day, gan: saju.dayStem, ji: saju.dayBranch },
    { meaning: PILLAR_MEANING_MAP.hour, gan: saju.hourStem, ji: saju.hourBranch },
  ];

  // 한지 톤에 맞춰 이모지 없이 — 글자와 한자만으로 읽히게 한다
  const headline = `${ilgan.symbol}처럼 ${iGa(
    ilgan.keyword
  )} 돋보이는 사람, ${ohengAnalysis.dominant}(${dom.hanja})의 기운이 ${
    BALANCE_PHRASE[ohengAnalysis.balance]
  }`;

  return {
    ilgan,
    oheng: ohengAnalysis,
    animal: animalProfile,
    pillars,
    headline,
  };
}

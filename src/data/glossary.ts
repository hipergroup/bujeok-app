/**
 * 사주 용어 사전 (Saju Glossary)
 * ─────────────────────────────────────────────────────────────
 * 사주를 처음 접하는 사람도 이해할 수 있게 쓴 용어 풀이 모음.
 *
 * 작성 원칙
 *  1. 어려운 한자어 대신 비유로 설명한다. (약방·저울·계절 등)
 *  2. 단정하거나 겁을 주는 표현을 쓰지 않는다. ("~하면 나쁘다" 금지)
 *  3. 기신(忌神)처럼 부정적으로 오해되기 쉬운 말은
 *     "나쁜 기운"이 아니라 "지금은 과한 기운"으로 설명한다.
 *  4. plain 은 UI 라벨을 그대로 대체할 수 있는 쉬운 우리말이다.
 */

export type GlossaryCategory = '기초' | '오행' | '용신' | '십성' | '기타';

export interface GlossaryEntry {
  /** 영문 식별자 (컴포넌트 termKey로 사용) */
  key: string;
  /** 한글 용어 */
  term: string;
  /** 한자 */
  hanja: string;
  /** 한 줄 정의 — 툴팁용, 20자 내외 */
  short: string;
  /** 자세한 풀이 — 2~3문장, 비유 사용 */
  full: string;
  /** UI 라벨을 대체할 쉬운 우리말 */
  plain: string;
  /** 분류 */
  category: GlossaryCategory;
  /** 함께 보면 좋은 용어 키 */
  related?: string[];
}

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  '기초',
  '오행',
  '용신',
  '십성',
  '기타',
];

/* ────────────────────────────────────────────────────────────
   기초
   ──────────────────────────────────────────────────────────── */

const 기초: GlossaryEntry[] = [
  {
    key: 'sajuPalja',
    term: '사주팔자',
    hanja: '四柱八字',
    short: '태어난 때를 적은 여덟 글자',
    full: '태어난 해·달·날·시간을 각각 두 글자씩 적으면 모두 여덟 글자가 됩니다. 이 여덟 글자를 사주팔자라고 불러요. 태어난 순간의 날씨를 적어 둔 짧은 메모라고 생각하면 쉽습니다.',
    plain: '태어난 때의 여덟 글자',
    category: '기초',
    related: ['cheongan', 'jiji', 'ilgan'],
  },
  {
    key: 'cheongan',
    term: '천간',
    hanja: '天干',
    short: '사주 위쪽에 놓이는 글자',
    full: '사주를 표로 그리면 위아래 두 줄이 되는데, 그중 위쪽 줄에 오는 글자를 천간이라고 합니다. 밖으로 드러나는 성격이나 겉모습에 가까운 자리예요. 하늘을 올려다보듯 눈에 잘 보이는 부분이라고 이해하면 됩니다.',
    plain: '위쪽 글자',
    category: '기초',
    related: ['jiji', 'ilgan', 'sajuPalja'],
  },
  {
    key: 'jiji',
    term: '지지',
    hanja: '地支',
    short: '사주 아래쪽에 놓이는 글자',
    full: '사주 표의 아래쪽 줄에 오는 글자로, 열두 동물(띠)과 짝을 이룹니다. 겉으로 드러나기보다 생활 습관이나 환경처럼 뿌리에 가까운 자리예요. 땅에 내린 뿌리를 떠올리면 이해가 쉽습니다.',
    plain: '아래쪽 글자',
    category: '기초',
    related: ['cheongan', 'jijanggan', 'tti'],
  },
  {
    key: 'ilgan',
    term: '일간',
    hanja: '日干',
    short: '나 자신을 뜻하는 한 글자',
    full: '태어난 날의 위쪽 글자로, 여덟 글자 중에서 "나"를 가리키는 자리입니다. 사주 풀이는 이 한 글자를 기준으로 나머지 일곱 글자와의 관계를 살펴봐요. 사진 속 한가운데 서 있는 사람이 나라고 보면 됩니다.',
    plain: '나를 나타내는 글자',
    category: '기초',
    related: ['ilju', 'cheongan', 'sipseong'],
  },
  {
    key: 'nyeonju',
    term: '년주',
    hanja: '年柱',
    short: '태어난 해를 적은 두 글자',
    full: '태어난 해를 나타내는 위아래 두 글자를 묶어 년주라고 합니다. 뿌리·집안·어린 시절처럼 나를 둘러싼 배경을 살필 때 참고해요. 내 이야기가 시작되는 첫 장면이라고 생각하면 됩니다.',
    plain: '태어난 해 기둥',
    category: '기초',
    related: ['wolju', 'ilju', 'siju'],
  },
  {
    key: 'wolju',
    term: '월주',
    hanja: '月柱',
    short: '태어난 달을 적은 두 글자',
    full: '태어난 달을 나타내는 두 글자입니다. 사주에서는 계절과 온도를 알려 주는 자리라서 특히 눈여겨봐요. 내가 어떤 계절의 공기 속에서 자랐는지 알려 주는 칸입니다.',
    plain: '태어난 달 기둥',
    category: '기초',
    related: ['johu', 'nyeonju', 'ilju'],
  },
  {
    key: 'ilju',
    term: '일주',
    hanja: '日柱',
    short: '태어난 날을 적은 두 글자',
    full: '태어난 날을 나타내는 두 글자로, 위쪽 글자가 바로 "나"인 일간입니다. 나의 기본 성향과 가까운 사람과의 관계를 살필 때 자주 봅니다. 사주에서 가장 자기 자신에 가까운 칸이에요.',
    plain: '태어난 날 기둥',
    category: '기초',
    related: ['ilgan', 'wolju', 'siju'],
  },
  {
    key: 'siju',
    term: '시주',
    hanja: '時柱',
    short: '태어난 시간을 적은 두 글자',
    full: '태어난 시각을 나타내는 두 글자입니다. 하루의 마무리 시간대처럼, 앞으로의 방향이나 취향을 살필 때 참고해요. 태어난 시간을 모르면 이 칸은 비워 두고 나머지로도 충분히 볼 수 있습니다.',
    plain: '태어난 시간 기둥',
    category: '기초',
    related: ['nyeonju', 'wolju', 'ilju'],
  },
  {
    key: 'jijanggan',
    term: '지장간',
    hanja: '地藏干',
    short: '아래 글자 안에 숨은 기운',
    full: '아래쪽 글자(지지) 하나에는 겉으로 보이지 않는 기운이 두세 가지 숨어 있습니다. 이 숨은 기운을 지장간이라고 불러요. 서랍을 열어 보면 안에 물건이 여러 개 들어 있는 것과 비슷합니다.',
    plain: '아래글자 속에 숨은 기운',
    category: '기초',
    related: ['jiji', 'ohaeng', 'yongsin'],
  },
];

/* ────────────────────────────────────────────────────────────
   오행
   ──────────────────────────────────────────────────────────── */

const 오행: GlossaryEntry[] = [
  {
    key: 'ohaeng',
    term: '오행',
    hanja: '五行',
    short: '나무·불·흙·쇠·물 다섯 기운',
    full: '세상의 흐름을 나무(목)·불(화)·흙(토)·쇠(금)·물(수) 다섯 가지 기운으로 나눠 본 것이 오행입니다. 사주의 여덟 글자도 모두 이 다섯 중 하나에 속해요. 다섯 가지 색으로 그린 그림이라고 생각하면 이해가 쉽습니다.',
    plain: '다섯 가지 기운',
    category: '오행',
    related: ['sangsaeng', 'sanggeuk', 'yongsin'],
  },
  {
    key: 'sangsaeng',
    term: '상생',
    hanja: '相生',
    short: '앞 기운이 뒤 기운을 돕는 흐름',
    full: '나무가 타서 불을 지피고, 불이 남긴 재가 흙이 되는 것처럼 다섯 기운은 서로를 밀어 줍니다. 이렇게 이어 주는 관계를 상생이라고 해요. 이어달리기에서 다음 주자에게 바통을 건네는 모습과 닮았습니다.',
    plain: '서로 돕는 관계',
    category: '오행',
    related: ['ohaeng', 'sanggeuk', 'tonggwan'],
  },
  {
    key: 'sanggeuk',
    term: '상극',
    hanja: '相剋',
    short: '한 기운이 다른 기운을 누름',
    full: '물이 불을 끄고 쇠가 나무를 다듬듯, 한 기운이 다른 기운의 기세를 눌러 주는 관계입니다. 나쁜 관계라기보다 지나치게 넘치지 않도록 잡아 주는 브레이크에 가까워요. 브레이크가 있어야 차가 안전하게 달리는 것과 같습니다.',
    plain: '서로 누르는 관계',
    category: '오행',
    related: ['ohaeng', 'sangsaeng', 'eokbu'],
  },
];

/* ────────────────────────────────────────────────────────────
   용신
   ──────────────────────────────────────────────────────────── */

const 용신: GlossaryEntry[] = [
  {
    key: 'yongsin',
    term: '용신',
    hanja: '用神',
    short: '나에게 가장 필요한 기운',
    full: '사주를 살펴보면 어떤 기운은 넘치고 어떤 기운은 모자랍니다. 그 균형을 맞춰 줄 가장 필요한 기운이 용신이에요. 약방에서 내 몸에 맞는 약을 골라 주는 것과 비슷합니다.',
    plain: '나에게 필요한 기운',
    category: '용신',
    related: ['huisin', 'gisin', 'eokbu', 'johu'],
  },
  {
    key: 'huisin',
    term: '희신',
    hanja: '喜神',
    short: '용신을 도와주는 기운',
    full: '용신이 힘을 잘 쓰도록 옆에서 거들어 주는 기운을 희신이라고 합니다. 약을 먹을 때 함께 챙기는 따뜻한 물 같은 역할이에요. 있으면 한결 편안해지는 기운입니다.',
    plain: '같이 있으면 좋은 기운',
    category: '용신',
    related: ['yongsin', 'gisin', 'ohaeng'],
  },
  {
    key: 'gisin',
    term: '기신',
    hanja: '忌神',
    short: '지금은 조금 과한 기운',
    full: '나쁜 기운이라는 뜻이 아니라, 지금 내 사주에는 이미 넉넉해서 더 보태지 않아도 되는 기운입니다. 설탕이 이미 충분한 음료에 설탕을 더 넣지 않는 것과 같아요. 때가 바뀌면 이 기운이 오히려 반가워지기도 합니다.',
    plain: '지금은 과한 기운',
    category: '용신',
    related: ['yongsin', 'huisin', 'junghwa'],
  },
  {
    key: 'singang',
    term: '신강',
    hanja: '身強',
    short: '내 기운이 넉넉한 상태',
    full: '나를 뜻하는 글자를 도와주는 기운이 많아 힘이 넉넉한 사주를 신강이라고 합니다. 배터리가 가득 찬 상태와 비슷해요. 이럴 때는 힘을 채우기보다 밖으로 잘 쓰는 쪽이 편안합니다.',
    plain: '힘이 넘치는 사주',
    category: '용신',
    related: ['sinyak', 'junghwa', 'eokbu'],
  },
  {
    key: 'sinyak',
    term: '신약',
    hanja: '身弱',
    short: '내 기운을 채우면 좋은 상태',
    full: '나를 도와주는 기운보다 힘을 쓰는 자리가 많아 에너지를 채워 두면 좋은 사주입니다. 약하다는 뜻이 아니라 충전이 필요한 상태에 가까워요. 쉬어 가며 도와줄 사람과 함께할 때 힘이 잘 붙습니다.',
    plain: '힘을 채워야 하는 사주',
    category: '용신',
    related: ['singang', 'junghwa', 'inseong'],
  },
  {
    key: 'junghwa',
    term: '중화',
    hanja: '中和',
    short: '기운이 고르게 놓인 상태',
    full: '어느 한쪽으로 크게 치우치지 않고 기운이 고르게 나뉜 사주를 중화라고 합니다. 양쪽 접시가 나란히 멈춘 저울을 떠올리면 됩니다. 큰 굴곡보다 꾸준함이 어울리는 흐름이에요.',
    plain: '균형 잡힌 사주',
    category: '용신',
    related: ['singang', 'sinyak', 'yongsin'],
  },
  {
    key: 'johu',
    term: '조후',
    hanja: '調候',
    short: '사주의 온도를 맞추는 방식',
    full: '태어난 계절 때문에 사주가 너무 춥거나 더울 때, 온도부터 알맞게 맞추는 방식을 조후라고 합니다. 겨울에는 난로를, 한여름에는 시원한 물 한 잔을 먼저 챙기는 것과 같아요. 온도가 맞아야 나머지도 편해집니다.',
    plain: '계절과 온도 조절',
    category: '용신',
    related: ['yongsin', 'wolju', 'eokbu'],
  },
  {
    key: 'eokbu',
    term: '억부',
    hanja: '抑扶',
    short: '넘치면 덜고 모자라면 채움',
    full: '기운이 넘치면 조금 덜어 내고, 모자라면 보태서 균형을 잡는 방식입니다. 용신을 고르는 가장 기본이 되는 방법이에요. 저울 양쪽에 추를 옮겨 수평을 맞추는 모습과 같습니다.',
    plain: '넘치면 덜고 부족하면 채우기',
    category: '용신',
    related: ['yongsin', 'singang', 'sinyak'],
  },
  {
    key: 'tonggwan',
    term: '통관',
    hanja: '通關',
    short: '부딪히는 기운을 이어 주기',
    full: '두 기운이 정면으로 맞부딪힐 때, 그 사이를 이어 주는 세 번째 기운을 쓰는 방식입니다. 마주 선 두 사람 사이에서 말을 전해 주는 중재자와 비슷해요. 다리를 놓아 주면 부딪힘이 흐름으로 바뀝니다.',
    plain: '맞부딪히는 기운 사이 다리 놓기',
    category: '용신',
    related: ['yongsin', 'sanggeuk', 'sangsaeng'],
  },
  {
    key: 'jeonwang',
    term: '전왕',
    hanja: '專旺',
    short: '가장 센 흐름을 따라가기',
    full: '한 가지 기운이 사주 전체를 압도할 만큼 강할 때는, 억지로 누르기보다 그 흐름을 따라가는 편이 순합니다. 이런 방식을 전왕이라고 해요. 물살이 센 강에서는 노를 거스르지 않고 방향만 잡는 것과 같습니다.',
    plain: '한 기운이 압도적일 때 그걸 따르기',
    category: '용신',
    related: ['yongsin', 'eokbu', 'singang'],
  },
];

/* ────────────────────────────────────────────────────────────
   십성
   ──────────────────────────────────────────────────────────── */

const 십성: GlossaryEntry[] = [
  {
    key: 'sipseong',
    term: '십성',
    hanja: '十星',
    short: '나와의 관계로 나눈 기운',
    full: '사주의 다른 글자들이 "나"와 어떤 사이인지에 따라 이름을 붙인 것이 십성입니다. 나를 돕는지, 내가 쓰는지, 내가 다루는지에 따라 크게 다섯 묶음으로 나눠 봐요. 사람 관계도를 그려 보는 것과 비슷합니다.',
    plain: '나와의 관계로 본 기운',
    category: '십성',
    related: ['ilgan', 'bigyeop', 'inseong', 'siksang'],
  },
  {
    key: 'bigyeop',
    term: '비겁',
    hanja: '比劫',
    short: '나와 어깨를 나란히 한 힘',
    full: '나와 같은 기운으로, 형제나 친구·동료처럼 나란히 선 사람들을 뜻합니다. 함께하면 든든하고, 같은 것을 두고 겨루기도 하는 사이예요. 같은 팀이면서 같은 자리를 노리는 동기 같은 힘입니다.',
    plain: '나와 같은 힘',
    category: '십성',
    related: ['sipseong', 'singang', 'jaeseong'],
  },
  {
    key: 'inseong',
    term: '인성',
    hanja: '印星',
    short: '나를 도와 채워 주는 힘',
    full: '나를 낳고 길러 주는 기운으로 부모·배움·자격증이나 문서와 이어집니다. 밖으로 나서기보다 안을 채우는 시간에 가까워요. 마음이 지칠 때 기대어 쉬는 자리라고 보면 됩니다.',
    plain: '나를 돕는 힘',
    category: '십성',
    related: ['sipseong', 'sinyak', 'siksang'],
  },
  {
    key: 'siksang',
    term: '식상',
    hanja: '食傷',
    short: '내가 밖으로 꺼내 쓰는 힘',
    full: '내 안에 있는 것을 말·글·솜씨로 꺼내 보이는 기운입니다. 표현력과 재능, 그리고 내가 돌보는 아이와도 이어져요. 만들어 낸 것을 세상에 내놓는 손길이라고 생각하면 됩니다.',
    plain: '내가 쓰는 힘',
    category: '십성',
    related: ['sipseong', 'jaeseong', 'inseong'],
  },
  {
    key: 'jaeseong',
    term: '재성',
    hanja: '財星',
    short: '내가 다루고 거두는 힘',
    full: '내가 손에 쥐고 다루는 기운으로 돈이나 성과, 결과와 이어집니다. 씨를 뿌린 뒤 거두는 수확에 가까워요. 무엇을 얼마나 챙길지 스스로 정하는 자리이기도 합니다.',
    plain: '내가 다루는 힘',
    category: '십성',
    related: ['sipseong', 'siksang', 'gwanseong'],
  },
  {
    key: 'gwanseong',
    term: '관성',
    hanja: '官星',
    short: '나를 붙잡아 주는 힘',
    full: '나를 눌러 자리를 잡게 하는 기운으로 직장·규칙·명예와 이어집니다. 답답하게 느껴질 수도 있지만, 방향을 잃지 않게 잡아 주는 난간 같은 역할이에요. 틀이 있어야 편해지는 일도 많습니다.',
    plain: '나를 잡아주는 힘',
    category: '십성',
    related: ['sipseong', 'jaeseong', 'inseong'],
  },
];

/* ────────────────────────────────────────────────────────────
   기타
   ──────────────────────────────────────────────────────────── */

const 기타: GlossaryEntry[] = [
  {
    key: 'samjae',
    term: '삼재',
    hanja: '三災',
    short: '12년마다 오는 3년 구간',
    full: '띠에 따라 열두 해마다 한 번씩 찾아오는 3년 동안의 기간을 삼재라고 부릅니다. 나쁜 일이 정해져 있다는 뜻이 아니라, 잠시 속도를 늦추고 살펴보라는 신호로 여겨 왔어요. 새로 벌이기보다 정리하며 지나가면 편안한 시기입니다.',
    plain: '12년에 한 번 오는 3년',
    category: '기타',
    related: ['tti', 'jiji'],
  },
  {
    key: 'ipchun',
    term: '입춘',
    hanja: '立春',
    short: '사주에서 한 해가 바뀌는 날',
    full: '사주는 1월 1일이 아니라 봄이 시작되는 입춘(2월 4일 무렵)을 기준으로 해가 바뀝니다. 그래서 1월이나 2월 초에 태어난 분은 띠와 년주가 달라질 수 있어요. 달력이 아니라 계절을 기준 삼는 셈입니다.',
    plain: '사주에서 한 해의 시작',
    category: '기타',
    related: ['manseryeok', 'nyeonju', 'tti'],
  },
  {
    key: 'manseryeok',
    term: '만세력',
    hanja: '萬歲曆',
    short: '사주를 뽑을 때 쓰는 달력',
    full: '해와 달의 움직임을 오랜 기간 계산해 둔 달력으로, 태어난 날을 사주 여덟 글자로 바꿀 때 사용합니다. 이 앱도 만세력을 바탕으로 사주를 뽑아요. 날짜를 글자로 옮겨 주는 변환표라고 생각하면 됩니다.',
    plain: '사주 계산용 달력',
    category: '기타',
    related: ['sajuPalja', 'ipchun'],
  },
  {
    key: 'tti',
    term: '띠',
    hanja: '十二支',
    short: '태어난 해를 나타내는 동물',
    full: '쥐·소·호랑이처럼 열두 동물로 태어난 해를 나타낸 것이 띠입니다. 사주에서는 태어난 해의 아래쪽 글자와 짝을 이뤄요. 사주 전체 중 한 글자일 뿐이라서, 띠만으로 모든 것을 말하지는 않습니다.',
    plain: '태어난 해의 동물',
    category: '기타',
    related: ['jiji', 'samjae', 'ipchun'],
  },
];

/* ────────────────────────────────────────────────────────────
   집계
   ──────────────────────────────────────────────────────────── */

/** 사전 등재 순서 (카테고리 순 → 등록 순) */
export const GLOSSARY_LIST: GlossaryEntry[] = [
  ...기초,
  ...오행,
  ...용신,
  ...십성,
  ...기타,
];

export const GLOSSARY: Record<string, GlossaryEntry> = GLOSSARY_LIST.reduce(
  (acc, entry) => {
    acc[entry.key] = entry;
    return acc;
  },
  {} as Record<string, GlossaryEntry>
);

/** 키로 용어 하나 찾기 (없으면 undefined) */
export function getGlossary(key: string): GlossaryEntry | undefined {
  return GLOSSARY[key];
}

export const GLOSSARY_BY_CATEGORY: Record<string, GlossaryEntry[]> = {
  기초,
  오행,
  용신,
  십성,
  기타,
};

/** 한글 용어명으로 찾기 (예: '용신' → yongsin) */
export function findGlossaryByTerm(term: string): GlossaryEntry | undefined {
  return GLOSSARY_LIST.find((e) => e.term === term);
}

/** 검색: 용어·한자·쉬운말·한 줄 풀이에서 찾는다 */
export function searchGlossary(query: string): GlossaryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return GLOSSARY_LIST;
  return GLOSSARY_LIST.filter(
    (e) =>
      e.term.toLowerCase().includes(q) ||
      e.hanja.includes(q) ||
      e.plain.toLowerCase().includes(q) ||
      e.short.toLowerCase().includes(q) ||
      e.key.toLowerCase().includes(q)
  );
}

export const GLOSSARY_COUNT = GLOSSARY_LIST.length;

// ============================================================
// 위기 신호 감지 (Crisis Detection)
// ------------------------------------------------------------
// ⚠️ 안전 최우선 모듈입니다.
//
// 원칙
//  1. 사용자가 입력한 텍스트는 이 모듈 밖으로 절대 나가지 않습니다.
//     (console.log / 네트워크 전송 / localStorage 저장 모두 금지)
//  2. 반환값은 "레벨"과 "매칭된 사전 키워드"뿐입니다.
//     matchedKeywords 는 아래 사전에 정의된 고정 문자열이며
//     사용자 원문 조각이 아닙니다.
//  3. 감지는 진단이 아닙니다. 오직 "전문가 연결 안내를 보여줄지" 판단용입니다.
//  4. 애매하면 안내를 보여주는 쪽이 안전하지만,
//     명백한 관용 표현("배고파 죽겠다")은 반드시 걸러냅니다.
// ============================================================

export type CrisisLevel = 'none' | 'concern' | 'high';

export interface CrisisResult {
  level: CrisisLevel;
  matchedKeywords: string[];
}

/** 위기상담 전화 */
export interface Hotline {
  /** 표시용 이름 */
  name: string;
  /** 실제 전화번호 (tel: 링크에 사용) */
  number: string;
  /** 부가 설명 */
  desc: string;
}

/**
 * 24시간 운영 상담 전화.
 * - 109 : 자살예방상담전화 (2024년부터 통합된 번호)
 * - 1577-0199 : 정신건강위기상담전화
 * - 1388 : 청소년전화
 */
export const CRISIS_HOTLINES: Hotline[] = [
  { name: '자살예방상담전화', number: '109', desc: '24시간 · 통화료 무료' },
  { name: '정신건강위기상담전화', number: '1577-0199', desc: '24시간 · 전국 어디서나' },
  { name: '청소년전화', number: '1388', desc: '24시간 · 청소년 상담' },
];

/** tel: 링크용 문자열 (하이픈 제거) */
export function telHref(number: string): string {
  return `tel:${number.replace(/[^0-9+]/g, '')}`;
}

/* ───────────────────── 정규화 ───────────────────── */

/**
 * 매칭용 정규화.
 * - 소문자화 + NFC 정규화
 * - 공백/개행/구두점/이모지/낱자모(ㅠㅜㅋ) 제거
 *   → "죽고 싶다", "죽고싶어요", "죽고싶다ㅠㅠ" 가 모두 같은 형태로 매칭됨
 *
 * ⚠️ 이 결과 역시 로깅·저장하지 않습니다.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^가-힣a-z0-9]/g, '');
}

/* ───────────────────── 사전 ───────────────────── */

interface KeywordEntry {
  /** 정규화된 형태(공백 없음)로 작성 */
  term: string;
  level: Exclude<CrisisLevel, 'none'>;
  /**
   * 관용 표현으로 오탐이 날 수 있는 표현인지 여부.
   * true 인 경우에만 아래 문맥 배제 규칙들을 적용한다.
   */
  ambiguous?: boolean;
  /** 이 단어 바로 앞에 오면 위기 신호가 아니라고 볼 표현들 (정규화 형태) */
  notWhenPrecededBy?: string[];
  /** 이 단어 바로 뒤에 오면 위기 신호가 아니라고 볼 표현들 (정규화 형태) */
  notWhenFollowedBy?: string[];
}

/**
 * 강조 어법으로 쓰이는 관용 표현 앞머리.
 * "배고파 죽겠다", "웃겨 죽겠어", "귀여워 죽겠다" 같은 경우를 걸러낸다.
 * (ambiguous 키워드 바로 앞 CONTEXT_WINDOW 글자 안에 있을 때만 적용)
 */
const IDIOM_PREFIXES = [
  '배고파', '배고프', '배불러', '배부르',
  '웃겨', '웃기', '웃어', '개웃',
  '귀여워', '귀엽', '깜찍',
  '예뻐', '예쁘', '이뻐', '이쁘',
  '멋있', '멋져', '멋지',
  '좋아', '좋다', '좋은데', '너무좋',
  '맛있', '맛나',
  '재밌', '재미있', '재미',
  '신나', '신기',
  '행복해', '행복하',
  '더워', '덥', '추워', '춥',
  '졸려', '졸리', '피곤',
  '보고싶어', '보고파',
  '심심', '지루',
  '부러워', '부럽',
  '고마워', '감사',
  '설레', '떨려',
  '놀라', '신박',
  '대박', '쩐다',
];

/** ambiguous 키워드 앞뒤 몇 글자까지 문맥을 살펴볼지 */
const CONTEXT_WINDOW = 7;

/**
 * 관용 표현과 키워드 사이에 끼어들 수 있는 연결어미·부사.
 * "맛있어서 죽겠어요" 의 "어서" 처럼 붙어 있는 경우만 관용 표현으로 본다.
 *
 * ⚠️ 이 목록은 짧게 유지해야 한다.
 *    너무 넓게 잡으면 "행복하고 싶은데 죽고싶어" 같은 진짜 신호를 놓친다.
 */
const IDIOM_CONNECTIVES = [
  '어서', '아서', '여서', '워서', '해서', '라서', '나서', '서',
  '너무', '진짜', '정말', '완전', '개',
];

/** "일 끝내고 싶다" 처럼 대상이 앞에 오는 일상 표현 */
const TASK_NOUNS = [
  '일', '일을', '이일', '이거', '이걸', '그거', '그걸',
  '숙제', '공부', '게임', '시험', '프로젝트', '업무', '과제',
  '알바', '수업', '회의', '방학', '학기', '작업', '드라마', '책',
  '대화', '싸움', '다툼', '논쟁', '이야기',
  '빨리', '얼른', '어서', '오늘', '이번주', '얼렁',
];

const KEYWORDS: KeywordEntry[] = [
  /* ── HIGH: 즉시 전문가 연결 안내 ── */
  { term: '자살', level: 'high' },
  { term: '죽고싶', level: 'high', ambiguous: true },
  { term: '죽고파', level: 'high', ambiguous: true },
  { term: '죽어버리고싶', level: 'high', ambiguous: true },
  { term: '자해', level: 'high' },
  {
    term: '목숨',
    level: 'high',
    ambiguous: true,
    // "목숨 걸고 좋아해", "목숨 바쳐 응원" 같은 강조 표현 배제
    notWhenFollowedBy: ['걸', '을걸', '바쳐', '을바쳐', '건', '을건'],
  },
  { term: '목매', level: 'high' },
  { term: '뛰어내리', level: 'high' },
  { term: '극단적선택', level: 'high' },
  { term: '삶을포기', level: 'high' },
  { term: '세상을떠나', level: 'high' },
  { term: '없어지고싶', level: 'high', ambiguous: true },
  { term: '사라지고싶', level: 'high', ambiguous: true },
  {
    term: '끝내고싶',
    level: 'high',
    ambiguous: true,
    // "이 일 빨리 끝내고 싶다" 같은 일상 표현 배제
    notWhenPrecededBy: TASK_NOUNS,
  },
  {
    term: '끝내버리고싶',
    level: 'high',
    ambiguous: true,
    notWhenPrecededBy: TASK_NOUNS,
  },
  { term: '그만살고', level: 'high' },
  { term: '유서', level: 'high' },
  { term: '마지막인사', level: 'high' },

  /* ── CONCERN: 부드러운 지지 메시지 ── */
  { term: '우울', level: 'concern' },
  { term: '절망', level: 'concern' },
  { term: '무기력', level: 'concern' },
  { term: '희망이없', level: 'concern' },
  { term: '희망도없', level: 'concern' },
  { term: '아무의미없', level: 'concern' },
  { term: '아무런의미없', level: 'concern' },
  { term: '살기싫', level: 'concern' },
  { term: '힘들어죽겠', level: 'concern', ambiguous: true },
  {
    term: '혼자',
    level: 'concern',
    ambiguous: true,
    // 일상적인 "혼자 ~하다" 표현은 위기 신호로 보지 않는다
    notWhenFollowedBy: [
      '여행', '공부', '먹', '놀', '가', '보', '듣', '읽', '만들',
      '하는게편', '있는게좋', '서도', '만의', '해낼', '할수있',
      '해도', '살아도', '해냈', '했어', '한다', '해요', '하는것도',
    ],
  },
  { term: '외롭', level: 'concern' },
  { term: '외로워', level: 'concern' },
  { term: '외로움', level: 'concern' },
  { term: '버림받', level: 'concern' },
  { term: '아무도없', level: 'concern' },
  { term: '쓸모없', level: 'concern' },
  { term: '짐이되', level: 'concern' },
  { term: '짐만되', level: 'concern' },
  { term: '불면', level: 'concern' },
  { term: '잠이안', level: 'concern' },
  { term: '잠을못', level: 'concern' },
  { term: '식욕이없', level: 'concern' },
  {
    term: '눈물이',
    level: 'concern',
    ambiguous: true,
    notWhenFollowedBy: ['날정도로웃', '나게웃', '핑돌만큼기', '날만큼웃'],
  },
];

/* ───────────────────── 판정 ───────────────────── */

/**
 * 관용적 강조 표현인지 판단한다.
 *
 * 핵심 규칙: 관용 표현은 키워드에 "바로 붙어" 있어야 한다.
 *  · "배고파 죽겠다"        → 배제 (바로 앞)
 *  · "맛있어서 죽겠어요"     → 배제 (연결어미 '어서'만 사이에 있음)
 *  · "행복하고 싶은데 죽고싶어" → 배제하지 않음 (실제 신호일 수 있음)
 *
 * 단순 포함(includes) 검사를 쓰면 위 세 번째 같은 문장을 놓치므로 쓰지 않는다.
 */
function isIdiomatic(normalized: string, index: number): boolean {
  let before = normalized.slice(Math.max(0, index - CONTEXT_WINDOW), index);

  // 키워드 바로 앞의 연결어미/강조 부사를 최대 2번까지 벗겨낸다
  for (let i = 0; i < 2; i++) {
    const stripped = IDIOM_CONNECTIVES.find((c) => before.endsWith(c));
    if (!stripped) break;
    before = before.slice(0, before.length - stripped.length);
  }

  return IDIOM_PREFIXES.some((p) => before.endsWith(p));
}

function isExcludedByPreceding(
  normalized: string,
  index: number,
  entry: KeywordEntry
): boolean {
  if (!entry.notWhenPrecededBy?.length) return false;
  const before = normalized.slice(Math.max(0, index - CONTEXT_WINDOW), index);
  return entry.notWhenPrecededBy.some((s) => before.endsWith(s));
}

function isExcludedByFollowing(
  normalized: string,
  endIndex: number,
  entry: KeywordEntry
): boolean {
  if (!entry.notWhenFollowedBy?.length) return false;
  const after = normalized.slice(endIndex, endIndex + CONTEXT_WINDOW);
  return entry.notWhenFollowedBy.some((s) => after.startsWith(s));
}

/**
 * 텍스트에서 위기 신호를 감지한다.
 *
 * @param text 사용자가 입력한 원문 (이 함수 밖으로 유출되지 않음)
 * @returns level 과 매칭된 사전 키워드 목록
 */
export function detectCrisis(text: string): CrisisResult {
  const none: CrisisResult = { level: 'none', matchedKeywords: [] };

  if (typeof text !== 'string') return none;
  const normalized = normalize(text);
  if (!normalized) return none;

  const high: string[] = [];
  const concern: string[] = [];

  for (const entry of KEYWORDS) {
    let from = 0;
    let hit = false;

    for (;;) {
      const idx = normalized.indexOf(entry.term, from);
      if (idx === -1) break;
      from = idx + 1;

      if (entry.ambiguous) {
        if (isIdiomatic(normalized, idx)) continue;
        if (isExcludedByPreceding(normalized, idx, entry)) continue;
        if (isExcludedByFollowing(normalized, idx + entry.term.length, entry)) continue;
      }

      hit = true;
      break;
    }

    if (!hit) continue;
    if (entry.level === 'high') high.push(entry.term);
    else concern.push(entry.term);
  }

  if (high.length > 0) {
    return { level: 'high', matchedKeywords: [...new Set(high)] };
  }
  if (concern.length > 0) {
    return { level: 'concern', matchedKeywords: [...new Set(concern)] };
  }
  return none;
}

/** 안전 고지 문구 (결과 화면 · 마이페이지 공통) */
export const SAFETY_DISCLAIMER =
  '수호부적은 정서적 위로와 응원을 위한 서비스입니다.\n' +
  '의료·법률·금융 조언을 제공하지 않으며,\n' +
  '전문적인 도움이 필요할 때는 전문가와 상담해 주세요.';

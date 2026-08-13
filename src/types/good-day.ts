// ============================================================
// 좋은 날 고르기 — 공용 타입
//
// 원칙: 공식 달력 사실(음양력·일진·공휴일)과 수호부의 해석(점수·이유)을
// 타입 수준에서 분리한다. 화면에서 둘을 섞어 보여주지 않기 위함이다.
// ============================================================

/** 택일 목적 — 확장 가능하게 두되 1차 버전은 네 가지만 노출한다 */
export type GoodDayPurpose = 'move' | 'contract' | 'confession' | 'wedding';

export const PURPOSE_LABEL: Record<GoodDayPurpose, string> = {
  move: '이사',
  contract: '계약',
  confession: '고백·중요한 대화',
  wedding: '결혼 날 받기',
};

/** 이사 방향 — 손의 방향과 맞춰 본다 */
export type MoveDirection = 'east' | 'west' | 'south' | 'north' | 'unknown';

export const DIRECTION_LABEL: Record<MoveDirection, string> = {
  east: '동쪽',
  west: '서쪽',
  south: '남쪽',
  north: '북쪽',
  unknown: '모름',
};

/** 손이 있는 방향 — 'none' 이면 손 없는 날 */
export type SonDirection = 'east' | 'south' | 'west' | 'north' | 'none';

// ── 공식 달력 데이터 (한국천문연구원) ────────────────────────

/**
 * 하루치 공식 달력 정보.
 * 이 값들은 전부 외부 공식 데이터에서 온 사실이며, 앱이 만들어내지 않는다.
 */
export interface CalendarDay {
  /** 양력 YYYY-MM-DD */
  solar: string;
  /** 음력 연·월·일 */
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  /** 윤달 여부 */
  leapMonth: boolean;
  /** 0=일 … 6=토 */
  weekday: number;
  /** 세차(년주)·월건(월주)·일진(일주) 한자 — 공식 데이터 제공값 */
  secha?: string;
  wolgeon?: string;
  iljin?: string;
  /** 그날 시작하는 24절기 이름 (없으면 undefined) */
  solarTerm?: string;
  /** 공휴일 여부와 이름 */
  holiday: boolean;
  holidayName?: string;
}

/** 연도별 달력 JSON — 출처와 생성 시점을 함께 기록한다 */
export interface CalendarYearFile {
  meta: {
    year: number;
    source: string;
    generatedAt: string;
    /** 데이터 스키마 버전 — 저장된 추천과 대조할 때 쓴다 */
    version: string;
  };
  days: CalendarDay[];
}

// ── 사용자 입력 ──────────────────────────────────────────────

/** 상대방 정보 — 고백은 선택, 결혼은 필수 */
export interface PartnerInput {
  year: number;
  month: number;
  day: number;
  /** 태어난 시(0-23). 모르면 null — 시주를 빼고 계산한다 */
  hour: number | null;
  gender: 'M' | 'F';
  /** 음력 입력 여부 — 음력이면 달력 데이터로 양력을 찾아 계산한다 */
  calendar: 'solar' | 'lunar';
  leapMonth?: boolean;
}

export interface DateConditions {
  /** 조회 시작·종료일 (YYYY-MM-DD) */
  from: string;
  to: string;
  /** 고를 수 있는 요일 (0=일 … 6=토). 비면 전체 허용 */
  weekdays: number[];
  /** 주말을 우선해서 점수를 올린다 */
  preferWeekend: boolean;
  /** 공휴일을 후보에 포함할지 */
  includeHolidays: boolean;
  /** 이사 — 이동 방향 */
  moveDirection?: MoveDirection;
  /** 이사 — 손 없는 날만 볼지 */
  onlySonEomneunNal?: boolean;
  /** 계약 — 평일만 */
  weekdaysOnly?: boolean;
  /** 상대방 (고백은 선택, 결혼은 필수) */
  partner?: PartnerInput;
}

// ── 계산 결과 ────────────────────────────────────────────────

/** 점수에 기여한 항목 하나 — 근거 화면에서 그대로 보여준다 */
export interface ScoreFactor {
  /** 규칙 식별자 — 테스트와 조정에 쓴다 */
  rule: string;
  /** 사람이 읽는 설명 */
  label: string;
  /** 가감점 */
  delta: number;
  /** 공식 달력 사실인지, 수호부의 해석인지 */
  kind: 'calendar' | 'interpretation';
}

export type GoodDayTier = 'best' | 'fine' | 'convenient';

export const TIER_LABEL: Record<GoodDayTier, string> = {
  best: '가장 잘 맞는 날',
  fine: '무난하게 고를 수 있는 날',
  convenient: '일정에 맞추기 좋은 날',
};

/** 후보 날짜 하나의 평가 결과 */
export interface DayCandidate {
  /** 양력 YYYY-MM-DD */
  date: string;
  calendar: CalendarDay;
  /** 손의 방향 ('none' 이면 손 없는 날) */
  son: SonDirection;
  /** 최종 점수 */
  score: number;
  /** 상대가 있을 때 두 사람 각각의 점수 */
  myScore?: number;
  partnerScore?: number;
  /** 추천 등급 — 제외된 날짜는 candidates 에 담기지 않는다 */
  tier: GoodDayTier;
  /** 점수를 만든 항목들 */
  factors: ScoreFactor[];
  /** 이 날짜에만 해당하는 설명 (모든 날에 같은 문구를 반복하지 않는다) */
  reasons: string[];
  /** 한 가지 주의할 점 */
  caution?: string;
}

export interface RecommendationResult {
  purpose: GoodDayPurpose;
  conditions: DateConditions;
  candidates: DayCandidate[];
  /** 방향 충돌 등으로 후보에서 뺀 날짜 수 — 화면에 정직하게 알린다 */
  excludedCount: number;
  /** 시주를 빼고 계산했는지 (태어난 시간 미상) */
  hourUnknown: { me: boolean; partner: boolean };
  /** 규칙 버전 — 저장된 추천이 어떤 기준으로 계산됐는지 남긴다 */
  rulesVersion: string;
  calendarSource: string;
}

/** 저장한 날짜 */
export interface SavedGoodDay {
  id: string;
  purpose: GoodDayPurpose;
  date: string;
  profileKey: string;
  partner?: PartnerInput;
  score: number;
  reasons: string[];
  rulesVersion: string;
  calendarSource: string;
  calendarVersion: string;
  savedAt: string;
}

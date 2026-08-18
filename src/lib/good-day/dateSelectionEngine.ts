// ============================================================
// 좋은 날 추천 엔진
//
// 후보 날짜마다 네 가지를 따로 계산해 합친다.
//   1) 공식 달력 정보 (음양력·일진·공휴일)  — 외부 데이터, 사실
//   2) 손 없는 날 여부                      — 음력에서 유도, 사실
//   3) 사주와의 관계                        — 수호부의 해석
//   4) 현실적인 일정 조건                    — 사용자가 고른 조건
//
// 사주 계산은 기존 엔진(getSaju/getOheng/getYongsin)만 쓴다.
// 새로운 해석 체계를 여기서 만들지 않는다.
// ============================================================

import { getSaju, getOheng, JIJI, type SajuResult } from '@/data/saju';
import { getYongsin, type YongsinResult } from '@/data/yongsin';
import {
  getCalendarDay,
  getCalendarSource,
  eachDate,
} from '@/lib/calendar/calendarAdapter';
import { getSonDirection, conflictsWithMove } from '@/lib/calendar/sonnal';
import {
  animalOfBranch,
  isDaeriwol,
  isGochoil,
  isSalbuDaegiwol,
  isSipakDaepaeil,
  isWolgiil,
} from '@/lib/calendar/sal';
import { getBranchRelation, RELATION_LABEL } from './branch-relations';
import { isFilteredOut } from './purposeRules';
import {
  BASE_SCORE,
  OHENG_SCORE,
  RELATION_SCORE,
  DAERIWOL_SCORE,
  RULES_VERSION,
  SAL_SCORE,
  SAL_WEIGHT,
  SCHEDULE_SCORE,
  SON_SCORE,
  TIER_THRESHOLD,
  WEDDING_BLEND,
} from './date-selection-rules';
import type {
  CalendarDay,
  DateConditions,
  DayCandidate,
  GoodDayPurpose,
  GoodDayTier,
  PartnerInput,
  RecommendationResult,
  ScoreFactor,
} from '@/types/good-day';

/** 사주 계산에 넣을 사람 한 명 */
export interface PersonSaju {
  saju: SajuResult;
  yongsin: YongsinResult;
  /** 태어난 시간을 몰라 시주를 뺐는지 */
  hourUnknown: boolean;
  /** 가취월·살부대기월은 신부(여성) 띠로 보므로 성별이 필요하다 */
  gender?: 'M' | 'F';
}

/** 생년월일시로 사주·용신을 만든다. 시간을 모르면 정오로 계산하고 표시만 남긴다 */
export function buildPersonSaju(
  year: number,
  month: number,
  day: number,
  hour: number | null,
  gender?: 'M' | 'F'
): PersonSaju {
  const hourUnknown = hour === null || hour < 0;
  const saju = getSaju(year, month, day, hourUnknown ? 12 : hour);
  const oheng = getOheng(saju);
  return { saju, yongsin: getYongsin(saju, oheng), hourUnknown, gender };
}

/** 두 사람 중 신부(여성)의 띠. 성별을 모르면 undefined — 그 경우 관련 규칙을 건너뛴다 */
function findBrideAnimal(
  me: PersonSaju,
  partner?: PersonSaju
): string | undefined {
  const bride = [me, partner].find((p) => p?.gender === 'F');
  if (!bride) return undefined;
  return animalOfBranch(bride.saju.yearBranch.hanja);
}

const branchIndex = (name: string) => JIJI.findIndex((j) => j.name === name);

/** 한 사람 기준으로 그날의 사주 점수와 근거를 만든다 */
function scoreForPerson(
  person: PersonSaju,
  dayBranchName: string,
  dayBranchOheng: string,
  who: '회원님' | '상대방' = '회원님'
): { score: number; factors: ScoreFactor[]; relation: string } {
  const factors: ScoreFactor[] = [];
  let score = 0;

  const myJi = branchIndex(person.saju.dayBranch.name);
  const dJi = branchIndex(dayBranchName);
  const relation = getBranchRelation(myJi, dJi);

  if (relation !== 'none') {
    const delta = RELATION_SCORE[relation];
    score += delta;
    factors.push({
      rule: `relation:${relation}`,
      label: `${who}의 일지와 그날 지지가 ${RELATION_LABEL[relation]}`,
      delta,
      kind: 'interpretation',
    });
  }

  // 기존 엔진이 계산한 용신·희신·기신만 쓴다 (임의 추정 없음)
  if (dayBranchOheng === person.yongsin.yongsin) {
    score += OHENG_SCORE.yongsin;
    factors.push({
      rule: 'oheng:yongsin',
      label: `${who}에게 필요한 ${person.yongsin.yongsin} 기운이 드는 날`,
      delta: OHENG_SCORE.yongsin,
      kind: 'interpretation',
    });
  } else if (dayBranchOheng === person.yongsin.huisin) {
    score += OHENG_SCORE.huisin;
    factors.push({
      rule: 'oheng:huisin',
      label: `${who}의 용신을 돕는 ${person.yongsin.huisin} 기운이 드는 날`,
      delta: OHENG_SCORE.huisin,
      kind: 'interpretation',
    });
  } else if (dayBranchOheng === person.yongsin.gisin) {
    score += OHENG_SCORE.gisin;
    factors.push({
      rule: 'oheng:gisin',
      label: `${who}에게는 이미 넉넉한 ${person.yongsin.gisin} 기운이 강한 날`,
      delta: OHENG_SCORE.gisin,
      kind: 'interpretation',
    });
  }

  return { score, factors, relation };
}

export interface RecommendInput {
  purpose: GoodDayPurpose;
  conditions: DateConditions;
  me: PersonSaju;
  partner?: PersonSaju;
  partnerInput?: PartnerInput;
  /**
   * 하루치 달력을 읽는 함수. 기본값은 공식 데이터 어댑터다.
   * 테스트에서 고정 달력을 넣어 검증하기 위해 주입식으로 둔다.
   */
  getDay?: (date: string) => CalendarDay;
  /** 출처 표기 — 주입한 달력을 쓸 때 함께 넘긴다 */
  source?: string;
}

/**
 * 후보 날짜를 모두 평가한다.
 * 달력 데이터는 호출 전에 loadCalendarRange 로 읽어둬야 한다.
 */
export function recommendDates(input: RecommendInput): RecommendationResult {
  const { purpose, conditions, me, partner } = input;
  const readDay = input.getDay ?? getCalendarDay;
  // 가취월·살부대기월은 신부(여성) 띠로 본다. 성별을 모르면 건너뛴다.
  const brideAnimal = findBrideAnimal(me, partner);
  const candidates: DayCandidate[] = [];
  let excludedCount = 0;

  for (const date of eachDate(conditions.from, conditions.to)) {
    const cal = readDay(date);

    // 1차 거르기 — 요일·공휴일·평일만 조건
    if (isFilteredOut(conditions, cal.weekday, cal.holiday)) {
      excludedCount++;
      continue;
    }

    const son = getSonDirection(cal.lunarDay);

    // 이사 — 방향이 부딪히는 날은 추천에서 아예 뺀다
    if (
      purpose === 'move' &&
      conditions.moveDirection &&
      conflictsWithMove(cal.lunarDay, conditions.moveDirection)
    ) {
      excludedCount++;
      continue;
    }
    // 손 없는 날만 보기
    if (conditions.onlySonEomneunNal && son !== 'none') {
      excludedCount++;
      continue;
    }

    const factors: ScoreFactor[] = [];
    const reasons: string[] = [];
    /** 손 없는 날 설명 — 사주 근거 뒤에 붙이려고 따로 담아 둔다 */
    let sonReason: string | undefined;

    // 그날의 일진 — 공식 데이터에 있으면 그 값을, 없으면 만세력으로 구한다
    const [y, m, d] = date.split('-').map(Number);
    const iljin = getSaju(y, m, d, 12);
    const dayBranch = iljin.dayBranch;

    // ── 사주 해석 ──
    const mine = scoreForPerson(me, dayBranch.name, dayBranch.oheng);
    factors.push(...mine.factors);

    let score = BASE_SCORE + mine.score;
    let myScore: number | undefined;
    let partnerScore: number | undefined;

    if (partner) {
      const theirs = scoreForPerson(
        partner,
        dayBranch.name,
        dayBranch.oheng,
        '상대방'
      );
      factors.push(...theirs.factors);

      myScore = BASE_SCORE + mine.score;
      partnerScore = BASE_SCORE + theirs.score;

      // 한쪽만 좋은 날보다 둘 다 무리 없는 날을 앞세운다
      const avg = (myScore + partnerScore) / 2;
      const min = Math.min(myScore, partnerScore);
      score =
        avg * WEDDING_BLEND.averageWeight + min * WEDDING_BLEND.minWeight;

      if (mine.relation === 'chung' || theirs.relation === 'chung') {
        score += WEDDING_BLEND.eitherChungPenalty;
        factors.push({
          rule: 'wedding:eitherChung',
          label: '두 분 중 한 분과 충(沖)이 겹치는 날',
          delta: WEDDING_BLEND.eitherChungPenalty,
          kind: 'interpretation',
        });
      }
    }

    // ── 손 없는 날 ──
    if (son === 'none') {
      const delta = SON_SCORE[purpose];
      if (delta !== 0) {
        score += delta;
        factors.push({
          rule: 'son:none',
          label: '손 없는 날 (음력 끝수 9·0)',
          delta,
          kind: 'calendar',
        });
      }
      // 손 없는 날 문구는 카드 배지로도 보이므로 맨 뒤에 붙인다 —
      // 앞자리는 이 날짜에만 해당하는 사주 근거에 내준다.
      sonReason =
        purpose === 'move'
          ? conditions.moveDirection && conditions.moveDirection !== 'unknown'
            ? `손 없는 날에 해당하며, 선택하신 ${directionLabel(conditions.moveDirection)} 이사 방향과도 충돌하지 않습니다.`
            : '손 없는 날에 해당해 이사 날로 많이 고르는 날입니다.'
          : '손 없는 날에 해당합니다.';
    }

    // ── 살(煞) ──
    // 표는 출처가 있는 것만 쓴다. 대공망일은 묘지·장사용 길일이라 넣지 않는다.
    const salBase = SAL_SCORE[purpose];
    const addSal = (rule: string, label: string, weight: number) => {
      const delta = Math.round(salBase * weight);
      score += delta;
      factors.push({ rule, label, delta, kind: 'calendar' });
    };

    if (isWolgiil(cal.lunarDay)) {
      addSal('sal:wolgiil', '월기일 (음력 5·14·23일)', SAL_WEIGHT.wolgiil);
    }
    if (isGochoil(cal.lunarMonth, dayBranch.hanja)) {
      addSal(
        'sal:gochoil',
        `고초일 (음력 ${cal.lunarMonth}월의 ${dayBranch.hanja}일)`,
        SAL_WEIGHT.gochoil
      );
    }
    if (cal.iljin && isSipakDaepaeil(cal.iljin)) {
      addSal(
        'sal:sipakDaepae',
        `십악대패일 (${cal.iljin})`,
        SAL_WEIGHT.sipakDaepae
      );
    }

    // ── 신부 띠로 보는 달 — 혼인에만 쓴다 ──
    if (purpose === 'wedding' && brideAnimal) {
      if (isSalbuDaegiwol(brideAnimal, cal.lunarMonth)) {
        addSal(
          'sal:salbuDaegiwol',
          `살부대기월 (${brideAnimal}띠 · 음력 ${cal.lunarMonth}월)`,
          SAL_WEIGHT.salbuDaegiwol
        );
      }
      if (isDaeriwol(brideAnimal, cal.lunarMonth)) {
        score += DAERIWOL_SCORE;
        factors.push({
          rule: 'sal:daeriwol',
          label: `대리월 (${brideAnimal}띠에게 혼인이 이로운 음력 ${cal.lunarMonth}월)`,
          delta: DAERIWOL_SCORE,
          kind: 'calendar',
        });
        reasons.push(
          `신부 ${brideAnimal}띠 기준으로 혼인에 이롭다고 보는 대리월(大利月)에 듭니다.`
        );
      }
    }

    // ── 일정 조건 ──
    if (conditions.weekdays.length > 0 && conditions.weekdays.includes(cal.weekday)) {
      score += SCHEDULE_SCORE.preferredWeekday;
      factors.push({
        rule: 'schedule:weekday',
        label: '고르신 요일에 해당',
        delta: SCHEDULE_SCORE.preferredWeekday,
        kind: 'calendar',
      });
    }
    const isWeekend = cal.weekday === 0 || cal.weekday === 6;
    if (conditions.preferWeekend && isWeekend) {
      score += SCHEDULE_SCORE.weekendWhenPreferred;
      factors.push({
        rule: 'schedule:weekend',
        label: '주말',
        delta: SCHEDULE_SCORE.weekendWhenPreferred,
        kind: 'calendar',
      });
    }
    if (cal.holiday) {
      score += SCHEDULE_SCORE.holiday;
      factors.push({
        rule: 'schedule:holiday',
        label: `공휴일${cal.holidayName ? ` (${cal.holidayName})` : ''}`,
        delta: SCHEDULE_SCORE.holiday,
        kind: 'calendar',
      });
    }

    // ── 이 날짜에만 해당하는 설명 ──
    if (mine.relation === 'yukhap' || mine.relation === 'samhap') {
      reasons.push(
        `회원님의 일지와 ${RELATION_LABEL[mine.relation]}을 이루어, 흐름이 순조로운 날로 해석됩니다.`
      );
    }
    const yongsinHit = factors.some((f) => f.rule === 'oheng:yongsin');
    if (yongsinHit) {
      reasons.push(
        `회원님의 사주에서 보완이 필요한 ${me.yongsin.yongsin}의 흐름을 채워주는 날입니다.`
      );
    }
    if (partner && myScore !== undefined && partnerScore !== undefined) {
      if (Math.abs(myScore - partnerScore) <= 8) {
        reasons.push('두 분 모두에게 치우침이 적어 무난한 날입니다.');
      }
    }
    // 사주 근거가 하나도 없을 때만 손 없는 날을 앞세운다
    if (sonReason) reasons.push(sonReason);

    let caution: string | undefined;
    if (mine.relation === 'chung') {
      caution = '회원님의 일지와 충(沖)이 되는 날이라, 무리한 일정은 피하시는 게 좋습니다.';
    } else if (mine.relation === 'hyeong' || mine.relation === 'pa' || mine.relation === 'hae') {
      caution = `회원님의 일지와 ${RELATION_LABEL[mine.relation]} 관계라, 서두르지 않는 편이 좋습니다.`;
    } else if (son !== 'none' && purpose === 'move') {
      caution = `이날은 ${directionLabel(son)}에 손이 있다고 보는 날입니다.`;
    }

    const rounded = Math.round(score * 10) / 10;
    candidates.push({
      date,
      calendar: cal,
      son,
      score: rounded,
      myScore,
      partnerScore,
      tier: toTier(rounded),
      factors,
      reasons,
      caution,
    });
  }

  // 점수 내림차순 → 같으면 날짜순 (같은 입력이면 항상 같은 순서)
  candidates.sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.date.localeCompare(b.date)
  );

  return {
    purpose,
    conditions,
    candidates,
    excludedCount,
    hourUnknown: { me: me.hourUnknown, partner: partner?.hourUnknown ?? false },
    rulesVersion: RULES_VERSION,
    calendarSource: input.source ?? getCalendarSource(),
  };
}

function toTier(score: number): GoodDayTier {
  if (score >= TIER_THRESHOLD.best) return 'best';
  if (score >= TIER_THRESHOLD.fine) return 'fine';
  return 'convenient';
}

function directionLabel(d: string): string {
  return { east: '동쪽', west: '서쪽', south: '남쪽', north: '북쪽', none: '없음', unknown: '' }[
    d
  ] ?? '';
}

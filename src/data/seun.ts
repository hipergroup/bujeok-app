// ============================================================
// 세운(歲運) · 월운(月運) — 올해와 이번 달의 흐름
//
// 대운(10년)이 인생의 계절이라면, 세운은 "올해의 날씨",
// 월운은 "이번 달의 날씨"다.
//  - 올해의 간지: 입춘 기준 (getSaju 가 이미 입춘 보정을 함)
//  - 월의 간지: 12절(節) 절입 기준 (getSaju 의 월주 계산 재사용)
//  - 길흉 판정: 대운과 동일하게 용신 대입, 지지(환경) 우선
//
// 해석 원칙 — 겁주지 않는다, 단정하지 않는다 ("~예요" 체)
// ============================================================

import {
  getSaju,
  type CheonGan,
  type JiJi,
  type Oheng,
} from './saju';
import type { YongsinResult } from './yongsin';

export type SeunRelation = 'yongsin' | 'huisin' | 'gisin' | 'neutral';

/** 한 달의 흐름 */
export interface MonthFlow {
  /** 양력 월 (1-12) — 표기는 양력, 간지는 절기 기준 */
  month: number;
  gan: CheonGan;
  ji: JiJi;
  relation: SeunRelation;
  /** 한 줄 흐름 */
  short: string;
}

/** 올해의 흐름 전체 */
export interface SeunResult {
  /** 세운 연도 (입춘 기준) */
  year: number;
  gan: CheonGan;
  ji: JiJi;
  relation: SeunRelation;
  /** 올해 총평 한 줄 */
  headline: string;
  /** 올해 해설 문단 */
  reading: string;
  /** 12개월 흐름 */
  months: MonthFlow[];
  /** 힘이 실리는 달 (양력 월) */
  bestMonths: number[];
  /** 쉬어가면 좋은 달 (양력 월) */
  carefulMonths: number[];
  /** 현재 월 (양력) */
  currentMonth: number;
}

// ─── 판정 ──────────────────────────────────────────────────

function classify(o: Oheng, y: YongsinResult): SeunRelation {
  if (o === y.yongsin) return 'yongsin';
  if (o === y.huisin) return 'huisin';
  if (o === y.gisin) return 'gisin';
  return 'neutral';
}

/** 지지 우선, 지지가 중립이면 천간으로 */
function classifyPillar(
  gan: CheonGan,
  ji: JiJi,
  y: YongsinResult
): SeunRelation {
  const jiRel = classify(ji.oheng, y);
  return jiRel !== 'neutral' ? jiRel : classify(gan.oheng, y);
}

// ─── 문구 ──────────────────────────────────────────────────

const YEAR_HEADLINE: Record<SeunRelation, string> = {
  yongsin: '올해는 필요한 기운이 들어오는 해 — 마음먹은 일을 펼치기 좋아요',
  huisin: '올해는 뒤에서 밀어주는 해 — 쌓아온 것이 빛을 보기 쉬워요',
  gisin: '올해는 다지는 해 — 크게 벌리기보다 내실을 쌓기 좋아요',
  neutral: '올해는 잔잔하게 흐르는 해 — 평소의 리듬이 가장 큰 무기예요',
};

const YEAR_READING: Record<SeunRelation, string> = {
  yongsin:
    '나에게 필요한 기운(용신)이 한 해의 날씨로 들어와요. 미뤄왔던 시작, 새로운 도전에 힘이 실리는 흐름이니 마음이 가는 일이 있다면 올해 안에 첫걸음을 떼어보세요.',
  huisin:
    '용신을 돕는 기운이 함께하는 해예요. 화려한 대박보다는 꾸준히 해온 일이 인정받고 무르익는 쪽에 가까워요. 지금 하는 일을 믿고 한 단계씩 올라가기 좋아요.',
  gisin:
    '올해는 기운이 나를 시험하는 해라, 무리한 확장이나 큰 결정은 한 템포 쉬어가는 게 결이 맞아요. 그 대신 실력을 다지고 곁을 정리하면, 다음 흐름에서 크게 쓰일 바탕이 돼요. 미리 겁낼 일은 아니에요.',
  neutral:
    '크게 밀어주지도 막지도 않는 무난한 해예요. 이런 해일수록 스스로 만든 루틴과 작은 습관이 성과를 좌우해요. 담담하게, 그러나 꾸준하게가 올해의 열쇠예요.',
};

const MONTH_SHORT: Record<SeunRelation, string[]> = {
  yongsin: [
    '힘이 실리는 달 — 시작·도전에 좋아요',
    '기회가 들어오는 달 — 먼저 움직여보세요',
    '흐름을 타는 달 — 미룬 일을 꺼내기 좋아요',
  ],
  huisin: [
    '밀어주는 달 — 하던 일이 무르익어요',
    '도움이 닿는 달 — 사람을 만나보세요',
    '쌓은 것이 빛나는 달이에요',
  ],
  gisin: [
    '쉬어가는 달 — 큰 결정은 한 템포 뒤로',
    '다지는 달 — 정리와 점검에 좋아요',
    '속도를 늦추면 오히려 얻는 달이에요',
  ],
  neutral: [
    '잔잔한 달 — 리듬을 지키면 충분해요',
    '무난한 달 — 일상을 돌보기 좋아요',
    '평온한 달 — 작은 습관을 만들어보세요',
  ],
};

// ─── 메인 ──────────────────────────────────────────────────

/**
 * 올해의 세운 + 12개월 월운
 *
 * @param yongsin getYongsin() 결과
 * @param now     기준 시점 (기본 오늘)
 */
export function getSeun(
  yongsin: YongsinResult,
  now: Date = new Date()
): SeunResult {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();

  // 올해의 간지 — getSaju 의 년주는 입춘 보정이 되어 있다
  const today = getSaju(y, m, d, 12);
  const gan = today.yearStem;
  const ji = today.yearBranch;
  const relation = classifyPillar(gan, ji, yongsin);

  // 세운 연도 표기 — 입춘 전(1월~2월 초)이면 앞 해의 세운
  // 간지로 역추적하기보다, 입춘 보정된 년주가 곧 올해 세운이므로 연도는 표기용으로만 쓴다
  const seunYear =
    m === 1 || (m === 2 && today.yearBranch !== getSaju(y, 3, 1, 12).yearBranch)
      ? y - 1
      : y;

  // 12개월 월운 — 각 달의 15일(절기 경계에서 안전)로 월주를 뽑는다
  const months: MonthFlow[] = [];
  for (let mm = 1; mm <= 12; mm++) {
    const s = getSaju(y, mm, 15, 12);
    const rel = classifyPillar(s.monthStem, s.monthBranch, yongsin);
    const pool = MONTH_SHORT[rel];
    // 월별로 결정적으로 다른 문구 (같은 relation 이라도 달마다 표현이 달라지게)
    const short = pool[mm % pool.length];
    months.push({
      month: mm,
      gan: s.monthStem,
      ji: s.monthBranch,
      relation: rel,
      short,
    });
  }

  const bestMonths = months
    .filter((x) => x.relation === 'yongsin' || x.relation === 'huisin')
    .map((x) => x.month);
  const carefulMonths = months
    .filter((x) => x.relation === 'gisin')
    .map((x) => x.month);

  return {
    year: seunYear,
    gan,
    ji,
    relation,
    headline: YEAR_HEADLINE[relation],
    reading: YEAR_READING[relation],
    months,
    bestMonths,
    carefulMonths,
    currentMonth: m,
  };
}

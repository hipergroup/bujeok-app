// ─────────────────────────────────────────────
// 연애 관련 신살 — 도화살(桃花煞) · 홍염살(紅豔煞)
//
// 신살 전체 시스템이 아니라 "매력·인연" 관련 2종만 다룬다.
// (기본 화면 오염 금지 원칙 — 필요한 만큼만)
//
// 근거: 사주_자료/01_사주분석_항목_전체.md §6 (신살)
// - 도화살: 년지 또는 일지의 삼합 그룹에서 정해진 지지 (子·午·卯·酉).
// - 홍염살: 일간별 지정 지지.
// - 실무 원칙: "신살만으로 단정하는 진술은 하지 않는다."
//   → 해설은 현대적 해석(매력·인기·표현력)만, 따뜻한 톤으로 쓴다.
// ─────────────────────────────────────────────

import type { SajuResult } from './saju';

/** 사주 네 기둥의 지지 자리 이름 */
export type BranchPosition = '년지' | '월지' | '일지' | '시지';

export interface LoveSinsalResult {
  dohwa: { present: boolean; count: number; positions: BranchPosition[] };
  hongyeom: { present: boolean; positions: BranchPosition[] };
  /** 종합 매력 지수 0-100 (경쟁 점수가 아니라 결의 진하기) */
  charmScore: number;
  /** 초보자용 해설 2-3문장, 따뜻하고 긍정적 */
  reading: string;
  /** 한 줄 요약 */
  headline: string;
  /** 도화가 놓인 자리에 대한 짧은 덧말 (없으면 null) */
  positionNote: string | null;
}

// ── 도화살 조견표 ─────────────────────────────
// 삼합 그룹 기준 (년지·일지 둘 다 확인)
//   申子辰 → 酉 / 寅午戌 → 卯 / 巳酉丑 → 午 / 亥卯未 → 子
const DOHWA_TARGET: Record<string, string> = {
  신: '유', 자: '유', 진: '유',
  인: '묘', 오: '묘', 술: '묘',
  사: '오', 유: '오', 축: '오',
  해: '자', 묘: '자', 미: '자',
};

// ── 홍염살 조견표 (일간 기준) ──────────────────
// 甲→午 乙→午 丙→寅 丁→未 戊→辰 己→辰 庚→戌 辛→酉 壬→子 癸→申
const HONGYEOM_TARGET: Record<string, string> = {
  갑: '오', 을: '오',
  병: '인', 정: '미',
  무: '진', 기: '진',
  경: '술', 신: '유',
  임: '자', 계: '신',
};

/** 자리별 도화 풀이 (문서 §6-2 (1) 위치별 해석) */
const DOHWA_POSITION_NOTE: Record<BranchPosition, string> = {
  년지: '매력의 기운이 년지(뿌리 자리)에 있어 어릴 때부터 자연스럽게 사랑받는 결이에요.',
  월지: '매력의 기운이 월지(사회 자리)에 있어 일터와 사람들 속에서 특히 빛나요.',
  일지: '매력의 기운이 일지(배우자 자리)에 있어 연인에게 특히 빛나요.',
  시지: '매력의 기운이 시지(말년 자리)에 있어 나이 들수록 오히려 더 매력적인 결이에요.',
};

export function getLoveSinsal(saju: SajuResult): LoveSinsalResult {
  const branches: Array<{ pos: BranchPosition; name: string }> = [
    { pos: '년지', name: saju.yearBranch.name },
    { pos: '월지', name: saju.monthBranch.name },
    { pos: '일지', name: saju.dayBranch.name },
    { pos: '시지', name: saju.hourBranch.name },
  ];

  // ── 도화살: 년지 기준·일지 기준 목표 지지가 네 기둥 어디에든 있으면 성립 ──
  const dohwaTargets = new Set<string>([
    DOHWA_TARGET[saju.yearBranch.name],
    DOHWA_TARGET[saju.dayBranch.name],
  ]);
  const dohwaPositions = branches
    .filter((b) => dohwaTargets.has(b.name))
    .map((b) => b.pos);
  const dohwa = {
    present: dohwaPositions.length > 0,
    count: dohwaPositions.length,
    positions: dohwaPositions,
  };

  // ── 홍염살: 일간이 지정한 지지가 네 기둥 어디에든 있으면 성립 ──
  const hongyeomTarget = HONGYEOM_TARGET[saju.dayStem.name];
  const hongyeomPositions = branches
    .filter((b) => b.name === hongyeomTarget)
    .map((b) => b.pos);
  const hongyeom = {
    present: hongyeomPositions.length > 0,
    positions: hongyeomPositions,
  };

  // ── 매력 지수 ──────────────────────────────
  // 없어도 40 아래로 내려가지 않는다 — "매력 없음"은 존재하지 않는 결론.
  const charmScore = Math.min(
    98,
    40 + dohwa.count * 18 + hongyeom.positions.length * 12
  );

  // ── 자리 덧말 (도화가 있을 때, 가장 안쪽 자리 우선: 일지 > 월지 > 시지 > 년지) ──
  const notePriority: BranchPosition[] = ['일지', '월지', '시지', '년지'];
  const notePos = notePriority.find((p) => dohwaPositions.includes(p)) ?? null;
  const positionNote = notePos ? DOHWA_POSITION_NOTE[notePos] : null;

  // ── 해설 · 요약 ────────────────────────────
  let headline: string;
  let reading: string;

  if (dohwa.count >= 2) {
    headline = '매력이 강해 인연이 많이 스치는 사주예요';
    reading =
      '도화의 기운이 두 자리 이상에 담겨 있어, 가만히 있어도 사람이 먼저 다가오는 편이에요. ' +
      '인연이 많이 스치는 만큼, 고를 줄 아는 마음이 함께하면 그 매력이 온전히 복이 됩니다.' +
      (hongyeom.present
        ? ' 여기에 홍염의 따뜻한 매력까지 더해져 곁을 내어주고 싶은 사람으로 기억돼요.'
        : '');
  } else if (dohwa.present && hongyeom.present) {
    headline = '끌어당기는 힘과 따뜻함을 함께 지닌 매력이에요';
    reading =
      '사람을 끌어당기는 도화의 매력과, 곁에 있으면 편안해지는 홍염의 온기가 함께 있어요. ' +
      '처음 만나는 자리에서도, 오래 본 사이에서도 좋은 인상을 남기는 결입니다.';
  } else if (dohwa.present) {
    headline = '사람을 끌어당기는 매력이 사주에 담겨 있어요';
    reading =
      '도화의 기운이 있어 표현력과 심미안이 좋고, 사람들 속에서 자연스럽게 눈에 띄는 편이에요. ' +
      '옛날에는 조심하라는 뜻으로도 읽었지만, 지금은 이 매력이 곧 자산이 되는 시대입니다.';
  } else if (hongyeom.present) {
    headline = '사람을 끌어당기는 따뜻한 매력이 있어요';
    reading =
      '홍염의 기운이 있어 화려하게 드러나기보다, 함께 있으면 마음이 놓이는 은근한 매력이 있어요. ' +
      '예술적 감성이 좋아 취향으로 사람의 마음을 여는 결입니다.';
  } else {
    headline = '천천히 스며드는 은은한 매력이에요';
    reading =
      '눈에 띄는 도화의 기운 대신, 오래 볼수록 좋아지는 은은한 매력을 지닌 사주예요. ' +
      '첫눈에 반하게 하기보다 곁에 두고 싶어지는 사람 — 깊은 인연과 잘 맞는 결입니다.';
  }

  return { dohwa, hongyeom, charmScore, reading, headline, positionNote };
}

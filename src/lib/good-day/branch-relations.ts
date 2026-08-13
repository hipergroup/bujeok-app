// ============================================================
// 지지(地支) 관계 — 합·충·형·파·해
//
// 육합·삼합·충 조견표는 data/taegil.ts 와 같은 값을 쓴다(같은 전통 표).
// 형·파·해는 기존에 없어 여기서 추가한다.
//
// 지지 index 는 data/saju.ts 의 JIJI 배열 순서를 따른다:
//   0 자 1 축 2 인 3 묘 4 진 5 사 6 오 7 미 8 신 9 유 10 술 11 해
// ============================================================

/** 육합 — 자축 인해 묘술 진유 사신 오미 */
const YUKHAP: [number, number][] = [
  [0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7],
];

/** 삼합 그룹 — 0 신자진 / 1 인오술 / 2 사유축 / 3 해묘미 */
const SAMHAP_GROUP: number[] = [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3];

/** 충 — 마주 보는 자리 (index 차 6) */
const isChung = (a: number, b: number) => (a + 6) % 12 === b;

/** 형(刑) — 삼형(인사신·축술미), 상형(자묘), 자형(진진·오오·유유·해해) */
const SAMHYEONG: number[][] = [
  [2, 5, 8],
  [1, 10, 7],
];
const SANGHYEONG: [number, number][] = [[0, 3]];
const JAHYEONG = [4, 6, 9, 11];

/** 파(破) — 자유 축진 인해 묘오 사신 미술 */
const PA: [number, number][] = [
  [0, 9], [1, 4], [2, 11], [3, 6], [5, 8], [7, 10],
];

/** 해(害) — 자미 축오 인사 묘진 신해 유술 */
const HAE: [number, number][] = [
  [0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10],
];

const inPairs = (pairs: [number, number][], a: number, b: number) =>
  pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

export type BranchRelation =
  | 'yukhap'
  | 'samhap'
  | 'chung'
  | 'hyeong'
  | 'pa'
  | 'hae'
  | 'none';

export const RELATION_LABEL: Record<BranchRelation, string> = {
  yukhap: '육합(六合)',
  samhap: '삼합(三合)',
  chung: '충(沖)',
  hyeong: '형(刑)',
  pa: '파(破)',
  hae: '해(害)',
  none: '특별한 관계 없음',
};

/**
 * 두 지지의 관계. 여러 관계가 겹칠 수 있으나 택일에서 무게가 큰 순서로
 * 하나만 돌려준다 — 충 > 형 > 파 > 해 > 육합 > 삼합.
 * (감점 요인을 합 때문에 덮어쓰지 않기 위해 흉을 먼저 본다)
 */
export function getBranchRelation(a: number, b: number): BranchRelation {
  if (isChung(a, b)) return 'chung';
  if (
    SAMHYEONG.some((g) => g.includes(a) && g.includes(b) && a !== b) ||
    inPairs(SANGHYEONG, a, b) ||
    (a === b && JAHYEONG.includes(a))
  )
    return 'hyeong';
  if (inPairs(PA, a, b)) return 'pa';
  if (inPairs(HAE, a, b)) return 'hae';
  if (inPairs(YUKHAP, a, b)) return 'yukhap';
  if (a !== b && SAMHAP_GROUP[a] === SAMHAP_GROUP[b]) return 'samhap';
  return 'none';
}

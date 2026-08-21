// ============================================================
// 원형 부적 레지스트리
//
// 부적 데이터의 원천은 talismans.ts(47종), 이미지 연결은 talisman-assets.ts
// (prebuild 자동 생성)가 이미 맡고 있다. 이 파일은 그 위에 "개인화에 필요한
// 정보"만 얹는다 — 이름 인장을 놓아도 되는 자리(stampAnchor)와
// 부적 번호에 쓰는 카테고리 코드(serialCode).
//
// 기존 데이터를 복제하지 않는다. id 로 두 원천을 가리키기만 한다.
// ============================================================

import { TalismanCategory, getTalismanById, type TalismanType } from './talismans';
import { getTalismanAsset } from './talisman-assets';

/** 이름 인장의 자리 — 이미지 비율에 대한 상대 좌표 (0~1, 인장 중심 기준) */
export interface StampAnchor {
  x: number;
  y: number;
  /** 인장 한 변의 길이 (이미지 너비에 대한 비율) */
  size: number;
}

/**
 * 기본 인장 자리 — 오른쪽 아래.
 * 원형 부적들의 상단 勅令, 중앙 글자·문양, 하단 急急如律令을 피하는 자리다.
 * (이미지 규칙 문서: 아래쪽 15%는 비워둔다)
 */
export const DEFAULT_STAMP_ANCHOR: StampAnchor = { x: 0.79, y: 0.82, size: 0.13 };

/**
 * 이미지가 없어 코드로 그리는 원형(29종)의 기본 인장 자리.
 * 이 원형들은 하단에 주문(眞言) 글줄이 지나가므로 인장을 그 위쪽에 둔다.
 */
export const DEFAULT_STAMP_ANCHOR_GENERATED: StampAnchor = { x: 0.78, y: 0.68, size: 0.13 };

/**
 * 부적별 인장 자리 — 47종 그림을 스캔해 자동 산출했다.
 * 규칙: 중앙 글자·상단 勅令·하단 急急如律令은 절대 가리지 않는다.
 * 가장자리 장식과 살짝 겹치는 것은 실제 낙관처럼 허용한다.
 * (재산출: 그림을 바꾼 뒤 화첩 지침의 스캔 스크립트를 다시 돌린다)
 */
const STAMP_ANCHOR_OVERRIDES: Record<string, StampAnchor> = {
  'family-01': { x: 0.78, y: 0.809, size: 0.13 }, // 부부화합부
  'family-02': { x: 0.72, y: 0.847, size: 0.13 }, // 화목부
  'family-03': { x: 0.78, y: 0.809, size: 0.13 }, // 진택부
  'family-04': { x: 0.72, y: 0.847, size: 0.13 }, // 출입문부
  'family-05': { x: 0.72, y: 0.847, size: 0.13 }, // 불화방지부
  'family-06': { x: 0.78, y: 0.809, size: 0.13 }, // 구설방지부
  'family-07': { x: 0.78, y: 0.809, size: 0.13 }, // 잡인퇴거부
  'health-01': { x: 0.19, y: 0.847, size: 0.13 }, // 치병부
  'health-02': { x: 0.15, y: 0.847, size: 0.13 }, // 소아부
  'health-03': { x: 0.74, y: 0.712, size: 0.13 }, // 수명장수부
  'health-04': { x: 0.72, y: 0.809, size: 0.13 }, // 안태부
  'health-05': { x: 0.74, y: 0.597, size: 0.13 }, // 두통부
  'health-06': { x: 0.72, y: 0.847, size: 0.13 }, // 눈병부
  'health-07': { x: 0.78, y: 0.828, size: 0.13 }, // 마마부
  'health-08': { x: 0.78, y: 0.847, size: 0.13 }, // 불면부
  'love-01': { x: 0.27, y: 0.809, size: 0.13 }, // 인연부
  'love-02': { x: 0.76, y: 0.809, size: 0.13 }, // 애정부
  'love-03': { x: 0.74, y: 0.847, size: 0.13 }, // 상사부
  'love-04': { x: 0.72, y: 0.809, size: 0.13 }, // 화합부
  'other-01': { x: 0.78, y: 0.847, size: 0.13 }, // 작명부
  'other-02': { x: 0.72, y: 0.77, size: 0.13 }, // 여행부
  'other-03': { x: 0.78, y: 0.809, size: 0.13 }, // 해몽부
  'other-04': { x: 0.78, y: 0.847, size: 0.13 }, // 기우부
  'other-05': { x: 0.78, y: 0.847, size: 0.13 }, // 택일부
  'other-06': { x: 0.78, y: 0.809, size: 0.13 }, // 방화부
  'other-07': { x: 0.72, y: 0.847, size: 0.13 }, // 정승부
  'other-08': { x: 0.72, y: 0.828, size: 0.13 }, // 도난방지부
  'protect-01': { x: 0.72, y: 0.847, size: 0.13 }, // 벽사부
  'protect-02': { x: 0.84, y: 0.616, size: 0.13 }, // 오방신장부
  'protect-03': { x: 0.78, y: 0.847, size: 0.13 }, // 천왕부
  'protect-04': { x: 0.741, y: 0.78, size: 0.13 }, // 호신부
  'protect-05': { x: 0.78, y: 0.809, size: 0.13 }, // 수살막이부
  'protect-06': { x: 0.72, y: 0.809, size: 0.13 }, // 삼재부
  'protect-07': { x: 0.15, y: 0.731, size: 0.13 }, // 부도옹부
  'protect-08': { x: 0.82, y: 0.577, size: 0.13 }, // 경면주사부
  'study-01': { x: 0.72, y: 0.847, size: 0.13 }, // 과거급제부
  'study-02': { x: 0.78, y: 0.809, size: 0.13 }, // 합격부
  'study-03': { x: 0.72, y: 0.809, size: 0.13 }, // 총명부
  'study-04': { x: 0.74, y: 0.828, size: 0.13 }, // 문창부
  'study-05': { x: 0.84, y: 0.847, size: 0.13 }, // 집중부
  'wealth-01': { x: 0.78, y: 0.809, size: 0.13 }, // 초복부
  'wealth-02': { x: 0.8, y: 0.828, size: 0.13 }, // 재물부
  'wealth-03': { x: 0.78, y: 0.847, size: 0.13 }, // 매매부
  'wealth-04': { x: 0.84, y: 0.828, size: 0.13 }, // 승진부
  'wealth-05': { x: 0.72, y: 0.751, size: 0.13 }, // 개업대길부
  'wealth-06': { x: 0.78, y: 0.828, size: 0.13 }, // 횡재부
  'wealth-07': { x: 0.19, y: 0.712, size: 0.13 }, // 사업번창부
};

export function getStampAnchor(talismanId: string, hasImage: boolean): StampAnchor {
  return (
    STAMP_ANCHOR_OVERRIDES[talismanId] ??
    (hasImage ? DEFAULT_STAMP_ANCHOR : DEFAULT_STAMP_ANCHOR_GENERATED)
  );
}

/** 부적 번호의 카테고리 코드 — 예: 財-20260820-017 */
export const SERIAL_CODE: Record<TalismanCategory, string> = {
  [TalismanCategory.Protection]: '護',
  [TalismanCategory.Wealth]: '財',
  [TalismanCategory.Health]: '健',
  [TalismanCategory.Family]: '家',
  [TalismanCategory.Study]: '學',
  [TalismanCategory.Love]: '緣',
  [TalismanCategory.Other]: '願',
};

/** 원형 부적 한 장의 개인화 정보 묶음 */
export interface OriginTalisman {
  talisman: TalismanType;
  /** 미리 그려 둔 원형 이미지 경로 (없으면 코드 생성 SVG 가 원형이다) */
  imagePath?: string;
  stampAnchor: StampAnchor;
  serialCode: string;
}

export function getOriginTalisman(id: string): OriginTalisman | undefined {
  const talisman = getTalismanById(id);
  if (!talisman) return undefined;
  const imagePath = getTalismanAsset(talisman.name, 'traditional');
  return {
    talisman,
    imagePath,
    stampAnchor: getStampAnchor(id, !!imagePath),
    serialCode: SERIAL_CODE[talisman.category] ?? '願',
  };
}

/** 염원 적기의 추천 문장 — 카테고리별 3개 */
export const WISH_SUGGESTIONS: Record<TalismanCategory, string[]> = {
  [TalismanCategory.Wealth]: [
    '올해는 경제적으로 안정되기를 바라요.',
    '하는 일마다 좋은 결실이 따르기를 바라요.',
    '불필요한 지출이 줄고 재물이 모이기를 바라요.',
  ],
  [TalismanCategory.Love]: [
    '좋은 인연과 자연스럽게 마음이 이어지기를 바라요.',
    '그 사람과 다시 따뜻한 연락이 닿기를 바라요.',
    '서로의 진심을 알아볼 수 있기를 바라요.',
  ],
  [TalismanCategory.Health]: [
    '몸과 마음이 편안하게 회복되기를 바라요.',
    '우리 가족이 아프지 않고 평안하기를 바라요.',
    '매일 건강한 기운으로 생활할 수 있기를 바라요.',
  ],
  [TalismanCategory.Protection]: [
    '나쁜 기운이 비켜 가고 평안이 깃들기를 바라요.',
    '오가는 길마다 무탈하고 안전하기를 바라요.',
    '걱정하던 일이 조용히 지나가기를 바라요.',
  ],
  [TalismanCategory.Family]: [
    '우리 가족이 서로에게 다정하기를 바라요.',
    '집안에 웃음과 평안이 머물기를 바라요.',
    '소중한 사람들과 오래 함께하기를 바라요.',
  ],
  [TalismanCategory.Study]: [
    '노력한 만큼의 결과가 따르기를 바라요.',
    '흔들리지 않는 집중력이 함께하기를 바라요.',
    '준비한 시험에서 실력을 다 보여주기를 바라요.',
  ],
  [TalismanCategory.Other]: [
    '마음에 품은 일이 잘 풀리기를 바라요.',
    '좋은 기회가 제때에 닿기를 바라요.',
    '올해는 웃는 날이 더 많기를 바라요.',
  ],
};

/** 서비스 콘셉트 문구 — 화면 여러 곳에서 같은 말을 쓰기 위해 모아둔다 */
export const ORIGIN_CONCEPT_LINES = {
  main:
    '아무에게나 같은 부적을 건네지 않습니다.\n미리 정성껏 만든 원형 부적에\n당신의 사주와 이름, 지금의 염원을 담아\n한 사람을 위한 한 장으로 완성합니다.',
  sub:
    '소원은 같아도, 염원은 모두 다르니까.\n수호부는 당신의 사주와 지금의 마음을 살펴\n한 사람을 위한 부적을 정성껏 지어드립니다.',
  notice:
    '수호부는 전통 부적의 상징과 구성을 바탕으로 만든 디지털 기원 콘텐츠입니다. 개인의 마음을 다독이고 염원을 기억하기 위한 용도로 이용해주세요.',
} as const;

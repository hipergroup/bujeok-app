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
 * 부적별 인장 자리 조정 — 문양 배치가 다른 부적만 여기서 손본다.
 * (id 기준. 없는 부적은 DEFAULT_STAMP_ANCHOR)
 */
const STAMP_ANCHOR_OVERRIDES: Record<string, StampAnchor> = {
  // 호신부 — 急急如律令이 아래쪽에 가로로 있어 인장을 조금 위로 올린다
  'protect-04': { x: 0.8, y: 0.76, size: 0.12 },
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

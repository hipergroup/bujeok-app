// ─── Talisman types ───
// 부적 데이터의 단일 원천(single source of truth)은 `src/data/talismans.ts` 이다.
// 이 파일은 UI 레이어에서 쓰는 파생 타입과 표시용 상수만 담당한다.

import { TalismanCategory, type TalismanType } from '@/data/talismans';

export { TalismanCategory };
export type { TalismanType };

/**
 * 도감·수집함 UI에서 사용하는 부적 정보.
 * 전통 부적 카탈로그(TalismanType)와 동일한 구조이다.
 */
export type TalismanInfo = TalismanType;

/** 사용자가 수집(수령)한 부적 */
export interface SavedTalisman extends TalismanType {
  /** 수령 일시 (ISO date string) */
  savedAt: string;
  note?: string;
  /** 직접 만든 부적의 SVG 마크업 (있으면 썸네일 대신 렌더링) */
  svg?: string;
  /** 선물로 받은 부적의 출처 표식 — 같은 선물을 두 번 담지 않도록 */
  giftKey?: string;
}

/** 카테고리 표시 색상 */
export const CATEGORY_COLORS: Record<TalismanCategory, string> = {
  수호: '#E63946',
  재물: '#F4A261',
  건강: '#2A9D8F',
  가정: '#E76F51',
  학업: '#457B9D',
  기타: '#6C757D',
  연애: '#C25B78', // 연지빛 — 전통 연지(臙脂) 계열의 장밋빛
};

/** 도감 탭 목록 */
export const CATEGORY_LIST: Array<{
  label: string;
  value: TalismanCategory | '전체';
}> = [
  { label: '전체', value: '전체' },
  { label: '수호', value: TalismanCategory.Protection },
  { label: '재물', value: TalismanCategory.Wealth },
  { label: '건강', value: TalismanCategory.Health },
  { label: '가정', value: TalismanCategory.Family },
  { label: '학업', value: TalismanCategory.Study },
  { label: '연애', value: TalismanCategory.Love },
  { label: '기타', value: TalismanCategory.Other },
];

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

/**
 * 개인 부적 기록 — 원형 부적(도감 47종) 위에 얹는 개인화 정보.
 *
 * 이미지 전체를 복사해 저장하지 않는다. 원형 부적은 sourceId 로 가리키고,
 * 여기 담긴 값만으로 화면을 열 때마다 다시 합성한다. (저장 용량 보호)
 */
export interface PersonalMeta {
  /** 부적을 청한 사람 (온보딩 이름, 없으면 '') */
  ownerName: string;
  /** 사용자가 직접 적은 염원 (최대 50자) */
  wishText: string;
  /** 이 부적이 권해진 까닭 — 화면에 그대로 보여준다 */
  recommendationReason: string;
  /** 사용자에게 보이는 부적 번호 — 예: 財-20260820-017 (기기 안에서만 유일) */
  serialNumber: string;
  /** 인장에 새길 이름 (빈 이름이면 '수호부') */
  stampText: string;
  /** 인장 회전 (도, -2 ~ 2) — visualSeed 에서 한 번 정해 고정 */
  stampRotation: number;
  /** 인장 먹 농도 (0.88 ~ 0.98) */
  stampOpacity: number;
  /** 미세 개인화의 씨앗 — 다시 열어도 같은 모습을 유지하는 근거 */
  visualSeed: number;
  /** 홈 화면(위젯)에 모신 대표 부적인지 */
  isPlacedOnHome?: boolean;
}

/** 사용자가 수집(수령)한 부적 */
export interface SavedTalisman extends TalismanType {
  /**
   * 원본 부적(도감 47종)의 id.
   * 부적함에서는 id 를 새로 매기므로, 도감 수집 판정은 이 값으로 한다.
   */
  sourceId?: string;
  /** 수령 일시 (ISO date string) */
  savedAt: string;
  note?: string;
  /** 직접 만든 부적의 SVG 마크업 (있으면 썸네일 대신 렌더링) */
  svg?: string;
  /** 선물로 받은 부적의 출처 표식 — 같은 선물을 두 번 담지 않도록 */
  giftKey?: string;
  /** 개인 부적 기록 — 있으면 원형 이미지 + 이름 인장으로 다시 합성해 그린다 */
  personal?: PersonalMeta;
  /** 연락기원부(雁書符) 전용 기록 — 있으면 기러기 전용 화면으로 그린다 */
  anseo?: AnseoMeta;
}

/**
 * 연락기원부 기록.
 * 봉인한 한마디(sealedText)는 완성 순간에 한 번 보여준 뒤 다시 펼치지 않는다 —
 * 화면 어디에도 본문을 표시하지 않는 것이 이 부적의 약속이다.
 */
export interface AnseoMeta {
  /** 소식을 기다리는 상대 — 이니셜이나 나만 아는 별칭 */
  recipientAlias: string;
  /** 봉인한 한마디 (완성 후에는 표시하지 않는다) */
  sealedText: string;
  /** 사용자가 직접 그은 마지막 획 — 360×560 좌표계의 SVG path d */
  strokePath: string;
  /** 소식이 닿은 날 (ISO). 있으면 붉은 도착인이 찍힌다 */
  arrivedAt?: string;
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

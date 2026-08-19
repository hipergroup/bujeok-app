// 부적함(bujeok-collection) 읽기 + "이 부적이 도감의 어느 종인가" 판정.
//
// 부적함에 담을 때는 같은 부적을 여러 번 담아도 구분되도록 id를 새로 매긴다
// (`custom-1712…` / `gift-…`). 그래서 저장된 부적의 id 만으로는 도감의 47종 중
// 무엇인지 알 수 없다 → 아래 규칙으로 원본을 되찾는다.

import { TALISMANS } from '@/data/talismans';
import type { SavedTalisman } from '@/lib/types';

const STORAGE_KEY = 'bujeok-collection';

const CATALOG_IDS = new Set(TALISMANS.map((t) => t.id));
const ID_BY_NAME = new Map(TALISMANS.map((t) => [t.name, t.id]));

/** 온보딩 선물 호신부의 고정 id */
export const GIFT_ID = 'hosinbu-gift';

export function loadCollection(): SavedTalisman[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedTalisman[]) : [];
  } catch {
    return [];
  }
}

/**
 * 저장된 부적이 도감의 어느 종인지. 못 찾으면 undefined.
 * sourceId(원본 표식) → id 자체가 도감 id인 경우 → 이름 순으로 찾는다.
 * 이름 경로는 sourceId 가 없던 시절에 담은 부적을 위한 것이다.
 */
export function catalogIdOf(saved: SavedTalisman): string | undefined {
  if (saved.sourceId && CATALOG_IDS.has(saved.sourceId)) return saved.sourceId;
  if (CATALOG_IDS.has(saved.id)) return saved.id;
  return ID_BY_NAME.get(saved.name);
}

/** 도감에서 "수집함"으로 표시할 종류들 (같은 부적을 여러 번 담아도 1종) */
export function collectedCatalogIds(): Set<string> {
  const ids = new Set<string>();
  for (const saved of loadCollection()) {
    const id = catalogIdOf(saved);
    if (id) ids.add(id);
  }
  return ids;
}

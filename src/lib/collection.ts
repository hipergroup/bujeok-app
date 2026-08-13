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

// 호신부(hosinbu-gift)는 사흘만 머문다 — 위젯의 agingDays: 3 (사흘에 걸쳐
// 낡아간다)과 같은 컨셉. 사흘이 지나면 읽는 시점에 부적함에서 비우되,
// 떠난 흔적(GIFT_EXPIRED_KEY)을 남겨 부적함이 "다시 모시기" 안내를 띄운다.
export const GIFT_ID = 'hosinbu-gift';
export const GIFT_LIFETIME_MS = 3 * 24 * 60 * 60 * 1000;
export const GIFT_EXPIRED_KEY = 'bujeok-gift-expired-at';

function pruneExpiredGift(list: SavedTalisman[]): SavedTalisman[] {
  const now = Date.now();
  const kept = list.filter((t) => {
    if (t.id !== GIFT_ID) return true;
    const savedAt = new Date(t.savedAt).getTime();
    // savedAt 이 깨진 옛 데이터는 만료 판정을 못 하므로 남겨둔다
    return Number.isNaN(savedAt) || now - savedAt < GIFT_LIFETIME_MS;
  });
  if (kept.length !== list.length) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
      localStorage.setItem(GIFT_EXPIRED_KEY, new Date(now).toISOString());
    } catch {
      // 저장 실패해도 화면에서는 만료된 것으로 취급
    }
  }
  return kept;
}

/** 호신부가 떠났고 아직 새로 모시지 않았는가 — 부적함의 "다시 모시기" 안내용 */
export function giftDeparted(collection: SavedTalisman[]): boolean {
  if (typeof window === 'undefined') return false;
  if (collection.some((t) => t.id === GIFT_ID)) return false;
  try {
    return localStorage.getItem(GIFT_EXPIRED_KEY) !== null;
  } catch {
    return false;
  }
}

/** 호신부를 새로 모셨을 때 떠난 흔적을 지운다 */
export function clearGiftDeparted(): void {
  try {
    localStorage.removeItem(GIFT_EXPIRED_KEY);
  } catch {
    // ignore
  }
}

export function loadCollection(): SavedTalisman[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? pruneExpiredGift(JSON.parse(raw) as SavedTalisman[]) : [];
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

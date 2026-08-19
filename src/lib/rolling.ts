// ============================================================
// 롤링 부적 — 여러 명이 기원을 겹쳐 쓰는 릴레이 부적
// ------------------------------------------------------------
// 롤링페이퍼 × 부적. 시작한 사람이 받는 이와 일(수능·생일·면접…)을 정하고
// 첫 기원을 쓰면, 링크가 다음 사람 손을 거칠 때마다 기원이 한 줄씩 쌓인다.
// 서버 없이 기원 전체를 URL(/rolling/?d=base64url)에 담아 넘긴다.
// 한 명당 ~100바이트 → 12명이어도 URL 2KB 안쪽.
// ============================================================

import { ENERGIES } from '@/data/energies';
import {
  toBase64Url,
  fromBase64Url,
  sanitizeText,
  GIFT_NAME_MAX,
} from '@/lib/gift';

export const ROLLING_MESSAGE_MAX = 60;
export const ROLLING_EVENT_MAX = 12;
/** 기원은 최대 12갈피 — URL 길이(2KB 안쪽)를 지키는 상한 */
export const ROLLING_MAX_WISHES = 12;

export interface RollingWish {
  /** 쓴 사람 이름 (빈 값 허용) */
  f: string;
  /** 기원 한 줄 */
  m: string;
}

/** 롤링 부적 페이로드 (v1) */
export interface RollingPayload {
  v: 1;
  /** 받는 사람 이름 */
  to: string;
  /** 앞둔 일 (수능, 생일, 면접 …) */
  ev: string;
  /** 기운 id — ENERGIES 중 하나 */
  e: string;
  /** 쌓인 기원들 (시작한 사람이 첫 갈피) */
  ms: RollingWish[];
}

function cleanWish(w: RollingWish): RollingWish {
  return {
    f: sanitizeText(w.f, GIFT_NAME_MAX),
    m: sanitizeText(w.m, ROLLING_MESSAGE_MAX),
  };
}

export function encodeRolling(p: RollingPayload): string {
  const clean: RollingPayload = {
    v: 1,
    to: sanitizeText(p.to, GIFT_NAME_MAX),
    ev: sanitizeText(p.ev, ROLLING_EVENT_MAX),
    e: p.e,
    ms: p.ms.slice(0, ROLLING_MAX_WISHES).map(cleanWish),
  };
  return toBase64Url(new TextEncoder().encode(JSON.stringify(clean)));
}

export function decodeRolling(s: string): RollingPayload | null {
  if (!s || typeof s !== 'string' || s.length > 4000) return null;
  const bytes = fromBase64Url(s);
  if (!bytes) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  if (o.v !== 1) return null;
  const energy = ENERGIES.find((e) => e.id === o.e);
  if (!energy) return null;
  if (!Array.isArray(o.ms) || o.ms.length === 0) return null;

  const ms: RollingWish[] = [];
  for (const raw of o.ms.slice(0, ROLLING_MAX_WISHES)) {
    if (!raw || typeof raw !== 'object') continue;
    const w = cleanWish(raw as RollingWish);
    if (w.m) ms.push(w);
  }
  if (ms.length === 0) return null;

  return {
    v: 1,
    to: sanitizeText(o.to, GIFT_NAME_MAX),
    ev: sanitizeText(o.ev, ROLLING_EVENT_MAX),
    e: energy.id,
    ms,
  };
}

/** 공유용 절대 URL — basePath 감지는 gift.ts 와 동일한 이유 */
export function buildRollingUrl(p: RollingPayload): string {
  const d = encodeRolling(p);
  if (typeof window === 'undefined') {
    return `https://hipergroup.github.io/bujeok-app/rolling/?d=${d}`;
  }
  const basePath = window.location.pathname.startsWith('/bujeok-app')
    ? '/bujeok-app'
    : '';
  return `${window.location.origin}${basePath}/rolling/?d=${d}`;
}

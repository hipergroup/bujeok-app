// ============================================================
// 부적 청하기 — "나를 위해 부적 한 장 써줄래?"
// ------------------------------------------------------------
// 부적은 예로부터 남이 나를 위해 써주는 것. 내가 기운(마음의 방향)만
// 골라 링크를 보내면, 친구가 기원 문구를 써서 부적을 돌려보내는 루프.
// 정적 사이트라 청 데이터도 URL(/cheong/?d=base64url)에 담는다.
// ============================================================

import { ENERGIES } from '@/data/energies';
import {
  toBase64Url,
  fromBase64Url,
  sanitizeText,
  GIFT_NAME_MAX,
} from '@/lib/gift';

/** 청 페이로드 (v1) */
export interface CheongPayload {
  /** 스키마 버전 */
  v: 1;
  /** 청한 사람 이름 (최대 12자, 빈 값 허용) */
  f: string;
  /** 기운 id — ENERGIES 중 하나 */
  e: string;
}

export function encodeCheong(p: CheongPayload): string {
  const clean: CheongPayload = {
    v: 1,
    f: sanitizeText(p.f, GIFT_NAME_MAX),
    e: p.e,
  };
  return toBase64Url(new TextEncoder().encode(JSON.stringify(clean)));
}

export function decodeCheong(s: string): CheongPayload | null {
  if (!s || typeof s !== 'string' || s.length > 500) return null;
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
  return { v: 1, f: sanitizeText(o.f, GIFT_NAME_MAX), e: energy.id };
}

/** 공유용 절대 URL — basePath 감지는 gift.ts 와 동일한 이유 */
export function buildCheongUrl(p: CheongPayload): string {
  const d = encodeCheong(p);
  if (typeof window === 'undefined') {
    return `https://hipergroup.github.io/bujeok-app/cheong/?d=${d}`;
  }
  const basePath = window.location.pathname.startsWith('/bujeok-app')
    ? '/bujeok-app'
    : '';
  return `${window.location.origin}${basePath}/cheong/?d=${d}`;
}

// ============================================================
// 부적 선물하기 — URL 인코딩/디코딩
// ------------------------------------------------------------
// 정적 사이트(GitHub Pages)라 서버가 없으므로 선물 데이터는
// URL 쿼리(?d=base64url)에 통째로 담는다. 페이로드는 수십 바이트라
// URL 길이 제한과 무관하다.
//
// 보안 원칙:
//  - decodeGift 는 알 수 없는 부적 id·초과 길이·HTML 흔적을 모두 거른다.
//  - 메시지/이름은 항상 "평문"으로만 취급한다 (React 텍스트 노드 렌더링,
//    SVG 삽입 시에도 generator 쪽 escapeXml 이 한 번 더 방어).
// ============================================================

import { TALISMANS } from '@/data/talismans';

/** 선물 페이로드 (v1) */
export interface GiftPayload {
  /** 스키마 버전 */
  v: 1;
  /** 부적 id — TALISMANS 카탈로그의 id 여야 함 */
  t: string;
  /** 보내는 메시지 (최대 80자) */
  m: string;
  /** 보낸 사람 이름 (최대 12자) */
  f: string;
  /** 생성 시각 (ISO string) */
  c: string;
}

export const GIFT_MESSAGE_MAX = 80;
export const GIFT_NAME_MAX = 12;

/* ── base64url (한글 안전: TextEncoder/TextDecoder 경유) ── */

export function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(s: string): Uint8Array | null {
  try {
    const b64 =
      s.replace(/-/g, '+').replace(/_/g, '/') +
      '='.repeat((4 - (s.length % 4)) % 4);
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** HTML/제어문자 흔적을 제거하고 평문만 남긴다 */
export function sanitizeText(raw: unknown, maxLen: number): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/<[^>]*>/g, '') // 태그 형태 제거
    .replace(/[<>]/g, '') // 잔여 꺾쇠 제거
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '') // 제어문자 제거
    .trim()
    .slice(0, maxLen);
}

/** 페이로드 → base64url 문자열 */
export function encodeGift(p: GiftPayload): string {
  const clean: GiftPayload = {
    v: 1,
    t: p.t,
    m: sanitizeText(p.m, GIFT_MESSAGE_MAX),
    f: sanitizeText(p.f, GIFT_NAME_MAX),
    c: p.c,
  };
  return toBase64Url(new TextEncoder().encode(JSON.stringify(clean)));
}

/** base64url 문자열 → 검증된 페이로드 (실패 시 null) */
export function decodeGift(s: string): GiftPayload | null {
  if (!s || typeof s !== 'string' || s.length > 2000) return null;
  const bytes = fromBase64Url(s);
  if (!bytes) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as Record<string, unknown>;

  // 버전·부적 id 검증 — 카탈로그(43종)에 없는 id 는 거부
  if (obj.v !== 1) return null;
  if (typeof obj.t !== 'string') return null;
  const talisman = TALISMANS.find((t) => t.id === obj.t);
  if (!talisman) return null;

  // 생성 시각: 문자열이 아니거나 날짜로 해석 불가하면 빈 값으로
  const c =
    typeof obj.c === 'string' && !Number.isNaN(new Date(obj.c).getTime())
      ? obj.c.slice(0, 40)
      : '';

  return {
    v: 1,
    t: talisman.id,
    m: sanitizeText(obj.m, GIFT_MESSAGE_MAX),
    f: sanitizeText(obj.f, GIFT_NAME_MAX),
    c,
  };
}

/**
 * 공유용 전체 https URL 생성.
 * GitHub Pages 에서는 basePath(/bujeok-app)가 pathname 에 이미 포함돼 있으므로
 * 현재 pathname 에서 basePath 를 감지해 붙인다. (라우팅에는 쓰지 않는
 * 외부 공유 전용 절대 URL — AGENTS.md Rule 4 의 내부 앵커 제한과 무관)
 */
export function buildGiftUrl(p: GiftPayload): string {
  const d = encodeGift(p);
  if (typeof window === 'undefined') {
    return `https://hipergroup.github.io/bujeok-app/gift/?d=${d}`;
  }
  const basePath = window.location.pathname.startsWith('/bujeok-app')
    ? '/bujeok-app'
    : '';
  return `${window.location.origin}${basePath}/gift/?d=${d}`;
}

/**
 * 페이로드 중복 저장 방지용 간단 해시 (djb2).
 * 같은 선물 링크를 여러 번 열어도 부적함에 한 번만 담기게 한다.
 */
export function giftHash(encoded: string): string {
  let h = 5381;
  for (let i = 0; i < encoded.length; i++) {
    h = ((h << 5) + h + encoded.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

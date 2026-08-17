// ============================================================
// 인연 초대 링크 — "내 사주를 실은 궁합 초대장"
// ------------------------------------------------------------
// 사주도령의 귀인지도처럼, 내 링크를 받은 친구가 자기 생년월일만
// 넣으면 나와의 궁합·삼재를 바로 보는 바이럴 루프.
// 정적 사이트(GitHub Pages)라 서버 없이 초대자의 프로필을
// URL 쿼리(/gunghap/?i=base64url)에 통째로 담는다 (gift.ts 와 같은 방식).
//
// 담기는 것: 이름(선택)·생년월일시뿐. 사주 해석은 여는 쪽에서 계산한다.
// ============================================================

import {
  toBase64Url,
  fromBase64Url,
  sanitizeText,
  GIFT_NAME_MAX,
} from '@/lib/gift';

/** 초대 페이로드 (v1) */
export interface InvitePayload {
  /** 스키마 버전 */
  v: 1;
  /** 초대한 사람 이름 (최대 12자, 빈 값 허용) */
  f: string;
  /** 생년 (1930 ~ 올해) */
  y: number;
  /** 생월 1-12 */
  mo: number;
  /** 생일 1-31 */
  d: number;
  /** 태어난 시 0-23, -1 = 모름 */
  h: number;
}

export function encodeInvite(p: InvitePayload): string {
  const clean: InvitePayload = {
    v: 1,
    f: sanitizeText(p.f, GIFT_NAME_MAX),
    y: p.y,
    mo: p.mo,
    d: p.d,
    h: p.h,
  };
  return toBase64Url(new TextEncoder().encode(JSON.stringify(clean)));
}

/** base64url → 검증된 초대 페이로드 (실패 시 null) */
export function decodeInvite(s: string): InvitePayload | null {
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
  const y = Number(o.y);
  const mo = Number(o.mo);
  const d = Number(o.d);
  const h = Number(o.h);
  const thisYear = new Date().getFullYear();
  if (!Number.isInteger(y) || y < 1930 || y > thisYear) return null;
  if (!Number.isInteger(mo) || mo < 1 || mo > 12) return null;
  if (!Number.isInteger(d) || d < 1 || d > 31) return null;
  if (!Number.isInteger(h) || h < -1 || h > 23) return null;

  return { v: 1, f: sanitizeText(o.f, GIFT_NAME_MAX), y, mo, d, h };
}

/** 공유용 절대 URL — basePath 감지는 gift.ts buildGiftUrl 과 동일한 이유 */
export function buildInviteUrl(p: InvitePayload): string {
  const i = encodeInvite(p);
  if (typeof window === 'undefined') {
    return `https://hipergroup.github.io/bujeok-app/gunghap/?i=${i}`;
  }
  const basePath = window.location.pathname.startsWith('/bujeok-app')
    ? '/bujeok-app'
    : '';
  return `${window.location.origin}${basePath}/gunghap/?i=${i}`;
}

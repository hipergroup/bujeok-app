// ============================================================
// 부적 선물 링크
// 서버 없이 링크 하나로 부적을 전한다 — 부적의 "생성 재료"만
// URL에 실어 보내면 받는 사람 기기에서 같은 부적이 다시 그려진다.
// (SVG 원본을 통째로 싣지 않으므로 링크가 짧다)
// ============================================================

export interface GiftPayload {
  /** 43종 카탈로그의 부적 id */
  t: string;
  /** 화풍 */
  s: 'traditional' | 'modern';
  /** 바탕 종이 (BackgroundPreset.id) */
  b: string;
  /** 기운 포인트 색 */
  c: string;
  /** 수호 동물 (없으면 생략) */
  a?: string;
  /** 기원 문구 */
  m: string;
  /** 보낸 사람 이름 */
  f?: string;
}

/** UTF-8 문자열 → URL-safe base64 */
function encodeBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** URL-safe base64 → UTF-8 문자열 */
function decodeBase64Url(encoded: string): string {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** 부적 선물 링크 생성 (절대 URL) */
export function createGiftLink(payload: GiftPayload): string {
  const code = encodeBase64Url(JSON.stringify(payload));
  const { origin, pathname } = window.location;
  // basePath(/bujeok-app) 유지 — 현재 경로에서 앱 루트를 추론한다
  const base = pathname.replace(/\/(talisman|collection|mypage|encyclopedia|gift|onboarding)\/?.*$/, '');
  return `${origin}${base}/gift/?g=${code}`;
}

/** 선물 링크의 코드 → 부적 재료. 형식이 어긋나면 null */
export function parseGiftCode(code: string | null): GiftPayload | null {
  if (!code) return null;
  try {
    const data = JSON.parse(decodeBase64Url(code)) as Partial<GiftPayload>;
    if (!data.t || !data.s || !data.b || !data.c || typeof data.m !== 'string') {
      return null;
    }
    return data as GiftPayload;
  } catch {
    return null;
  }
}

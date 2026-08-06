// ============================================================
// iOS 위젯 브리지
// 네이티브 래퍼(WKWebView) 안에서 실행될 때, 방금 만든 부적을
// 홈 화면 위젯이 읽을 수 있도록 네이티브로 전달한다.
// 웹클립·브라우저에서는 핸들러가 없으므로 조용히 아무 일도 하지 않는다.
// ============================================================

import { composeShareImage } from './share-card';

interface WidgetTalisman {
  name: string;
  hanja?: string;
  note?: string;
  savedAt: string; // ISO
  /** 위젯에서 종이가 낡아가는 기간(일). 미지정 시 45일 — 선물 호신부는 3일 */
  agingDays?: number;
}

interface WidgetMessageHandler {
  postMessage: (body: unknown) => void;
}

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        widgetBridge?: WidgetMessageHandler;
      };
    };
    /** 네이티브가 주입: 홈 화면에 수호부 위젯이 놓여 있는지 */
    __bujeokWidgetInstalled?: boolean;
  }
}

/** 홈 화면 위젯 설치 여부 변경 알림 (네이티브가 앱 진입마다 주입) */
export const WIDGET_STATE_EVENT = 'bujeok-widget-state';

/**
 * 홈 화면에 위젯이 놓여 있는지.
 * 네이티브가 알려주기 전(undefined)에는 '모름'이므로 안내를 띄우지 않는다.
 */
export function isWidgetInstalled(): boolean | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.__bujeokWidgetInstalled;
}

/** 설치 여부가 갱신될 때 호출 — 해제 함수를 반환한다 */
export function onWidgetStateChange(fn: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(WIDGET_STATE_EVENT, fn);
  return () => window.removeEventListener(WIDGET_STATE_EVENT, fn);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.slice(dataUrl.indexOf(',') + 1));
    };
    reader.onerror = () => reject(new Error('base64 변환 실패'));
    reader.readAsDataURL(blob);
  });
}

/** 네이티브 앱 안에서 실행 중인지 */
export function hasWidgetBridge(): boolean {
  return typeof window !== 'undefined' && !!window.webkit?.messageHandlers?.widgetBridge;
}

/** 네이티브 앱 시스템 로그(os_log)로 진단 메시지 전송 — 웹에선 no-op */
export function debugToNative(msg: string): void {
  try {
    window.webkit?.messageHandlers?.widgetBridge?.postMessage({ debug: msg });
  } catch {
    // no-op
  }
}

/**
 * 부적 SVG를 PNG로 합성해 위젯으로 보낸다. 실패해도 앱 흐름에 영향 없음.
 */
/** 위젯 표시 해상도(대형 위젯 3배율 기준)를 넘는 원본은 축소해 전송 부담을 줄인다 */
async function downscaleForWidget(blob: Blob, maxHeight: number): Promise<Blob> {
  const bmp = await createImageBitmap(blob);
  if (bmp.height <= maxHeight) return blob;
  const width = Math.round((bmp.width * maxHeight) / bmp.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = maxHeight;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, width, maxHeight);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('위젯 이미지 축소 실패'))),
      'image/png'
    );
  });
}

export async function pushTalismanToWidget(
  svg: string,
  meta: WidgetTalisman
): Promise<void> {
  const bridge = window.webkit?.messageHandlers?.widgetBridge;
  if (!bridge) return;
  try {
    const blob = await composeShareImage(svg, 'original', {
      name: meta.name,
      hanja: meta.hanja,
    });
    const png = await blobToBase64(await downscaleForWidget(blob, 1120));
    bridge.postMessage({ ...meta, png });
    debugToNative(`push-ok: ${meta.name} (${png.length} chars)`);
  } catch (e) {
    // 위젯 전달 실패는 앱 흐름을 막지 않되, 네이티브 로그에는 남긴다
    debugToNative(`push-fail: ${e instanceof Error ? e.message : String(e)}`);
  }
}

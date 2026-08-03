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
  }
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

/**
 * 부적 SVG를 PNG로 합성해 위젯으로 보낸다. 실패해도 앱 흐름에 영향 없음.
 */
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
    const png = await blobToBase64(blob);
    bridge.postMessage({ ...meta, png });
  } catch {
    // 위젯 전달 실패는 무시
  }
}

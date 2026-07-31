'use client';

import { useEffect } from 'react';

/** 서비스 워커 등록 — 재방문 시 정적 자산을 캐시에서 즉시 로드 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const base = window.location.pathname.startsWith('/bujeok-app')
      ? '/bujeok-app'
      : '';
    navigator.serviceWorker.register(`${base}/sw.js`).catch(() => {
      // 미지원/실패 시 조용히 무시 — 앱 동작에는 영향 없음
    });
  }, []);
  return null;
}

/**
 * public/ 자산의 URL을 만든다.
 *
 * GitHub Pages 는 /bujeok-app 하위에서 서빙되므로 접두어가 필요하다.
 * (next.config.ts 의 basePath 는 next/link·next/image 에만 붙고,
 *  <video src> 나 fetch 처럼 직접 쓰는 경로에는 붙지 않는다)
 *
 * ⚠ window 를 읽으므로 서버 렌더에서는 접두어 없는 경로를 돌려준다.
 *   서버에서도 그려지는 자리에 쓰면 하이드레이션이 어긋날 수 있으니,
 *   클릭 이후에만 그려지는 요소에 쓰거나 useSyncExternalStore 로 감싼다.
 */
export function assetPath(path: string): string {
  if (typeof window === 'undefined') return path;
  const base = window.location.pathname.startsWith('/bujeok-app')
    ? '/bujeok-app'
    : '';
  return base + path;
}

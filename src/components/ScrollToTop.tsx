'use client';

// ============================================================
// 화면을 새로 들어가면 맨 위에서 시작한다.
// 긴 화면(부적 만들기 목록 등) 아래쪽에서 다른 화면으로 넘어가면
// 스크롤이 내려간 채 열리는 문제를 전역에서 막는다.
// 단, 뒤로가기(popstate)로 돌아온 경우에는 브라우저의 위치 복원을
// 존중해 건드리지 않는다.
// ============================================================

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();
  const isPop = useRef(false);

  useEffect(() => {
    const onPop = () => {
      isPop.current = true;
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (isPop.current) {
      isPop.current = false; // 뒤로가기 — 브라우저 복원에 맡긴다
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

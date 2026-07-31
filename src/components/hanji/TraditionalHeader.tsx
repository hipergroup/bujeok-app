'use client';

import { SealLogo } from './motifs';

/**
 * 상단 헤더 — 좌/우 아이콘 슬롯, 중앙엔 제목 또는 낙관 로고
 */
export default function TraditionalHeader({
  left,
  right,
  title,
  showSeal = false,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  title?: string;
  showSeal?: boolean;
}) {
  return (
    <header className="flex items-center justify-between px-4 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))]">
      <div className="flex h-10 w-10 items-center justify-center text-[var(--color-meok)]">
        {left}
      </div>
      <div className="flex items-center gap-2">
        {showSeal && <SealLogo size={30} />}
        {title && (
          <h1 className="font-serif-kr text-base font-bold tracking-wide text-[var(--color-meok)]">
            {title}
          </h1>
        )}
      </div>
      <div className="flex h-10 w-10 items-center justify-center text-[var(--color-meok)]">
        {right}
      </div>
    </header>
  );
}

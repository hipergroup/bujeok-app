'use client';

import Image from 'next/image';
import { SealLogo } from './motifs';
import wordmarkMark from '../../../public/brand/wordmark-mark.png';

/**
 * 상단 헤더 — 좌/우 아이콘 슬롯, 중앙엔 제목·낙관 로고 또는 붓글씨 워드마크
 */
export default function TraditionalHeader({
  left,
  right,
  title,
  showSeal = false,
  wordmark = false,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  title?: string;
  showSeal?: boolean;
  /** 수호부 붓글씨 워드마크(守護符印 낙관 포함) — title·showSeal 대신 사용 */
  wordmark?: boolean;
}) {
  return (
    <header className="flex items-center justify-between px-4 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))]">
      <div className="flex h-10 w-10 items-center justify-center text-[var(--color-meok)]">
        {left}
      </div>
      <div className="flex items-center gap-2">
        {wordmark && (
          <Image
            src={wordmarkMark}
            alt="수호부"
            priority
            className="h-8 w-auto"
          />
        )}
        {!wordmark && showSeal && <SealLogo size={30} />}
        {!wordmark && title && (
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

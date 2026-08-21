'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { getGlossary, type GlossaryEntry } from '@/data/glossary';

/**
 * 사주 용어에 점선 밑줄 + 물음표 아이콘을 붙이고,
 * 누르면 아래에서 올라오는 시트로 쉬운 풀이를 보여 준다.
 *
 * 한지 디자인 시스템만 사용 (다크테마 색 #0a0a1a·#D4A853 금지).
 */
export interface GlossaryTermProps {
  /** src/data/glossary.ts 의 key */
  termKey: string;
  /** 화면에 보일 텍스트 (없으면 용어명 그대로) */
  children?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export default function GlossaryTerm({
  termKey,
  children,
  size = 'md',
  className = '',
}: GlossaryTermProps) {
  /** 시트에 떠 있는 용어 키 (연관 용어로 이동 가능) */
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const entry = getGlossary(termKey);

  const close = useCallback(() => setActiveKey(null), []);

  // 용어가 사전에 없으면 그냥 텍스트만 보여 준다.
  if (!entry) return <>{children ?? termKey}</>;

  const textSize = size === 'sm' ? 'text-[13px]' : 'text-[15px]';
  const iconSize = size === 'sm' ? 12 : 13;

  return (
    <>
      <button
        type="button"
        onClick={() => setActiveKey(termKey)}
        aria-label={`${entry.term} 뜻 보기`}
        className={`inline-flex items-baseline gap-[3px] align-baseline font-medium text-[var(--color-meok)] transition-colors hover:text-[var(--color-juhong)] ${textSize} ${className}`}
        style={{
          textDecorationLine: 'underline',
          textDecorationStyle: 'dotted',
          textDecorationColor: 'rgba(167, 43, 33, 0.55)',
          textUnderlineOffset: '3px',
        }}
      >
        <span>{children ?? entry.term}</span>
        <InfoIcon size={iconSize} />
      </button>

      <AnimatePresence>
        {activeKey && (
          <GlossarySheet
            entryKey={activeKey}
            onNavigate={setActiveKey}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── 하단 시트 ─────────────────────────────────────── */

function GlossarySheet({
  entryKey,
  onNavigate,
  onClose,
}: {
  entryKey: string;
  onNavigate: (key: string) => void;
  onClose: () => void;
}) {
  const entry = getGlossary(entryKey);

  // ESC 로 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const dragControls = useDragControls();

  if (!entry) return null;

  const related = (entry.related ?? [])
    .map((k) => getGlossary(k))
    .filter((e): e is GlossaryEntry => Boolean(e));

  return (
    <motion.div
      key="glossary-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 backdrop-blur-[2px]"
    >
      <motion.div
        key={`glossary-sheet-${entry.key}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${entry.term} 용어 설명`}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 600) onClose();
        }}
        className="hanji-surface relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 text-[var(--color-meok)]"
        style={{ borderTop: '1px solid rgba(122, 74, 52, 0.4)' }}
      >
        {/* 손잡이 — 잡고 끌어내리면 닫힌다 */}
        <div
          className="mb-3 flex cursor-grab justify-center py-1.5"
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="h-1 w-10 rounded-full bg-[var(--color-galsaek)] opacity-30" />
        </div>

        {/* 용어 + 한자 */}
        <div className="flex items-baseline gap-2">
          <h2 className="font-serif-kr text-xl font-bold tracking-wide">
            {entry.term}
          </h2>
          <span className="font-serif-kr text-sm text-[var(--color-galsaek)] opacity-70">
            {entry.hanja}
          </span>
          <span
            className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium text-[var(--color-juhong)]"
            style={{
              border: '1px solid rgba(167,43,33,0.35)',
              backgroundColor: 'rgba(167,43,33,0.06)',
            }}
          >
            {entry.category}
          </span>
        </div>

        {/* 쉬운 말 (크게) */}
        <p className="mt-3 font-serif-kr text-[19px] font-bold leading-[1.5] text-[var(--color-juhong)]">
          {entry.plain}
        </p>

        {/* 자세한 풀이 */}
        <div
          className="hanji-card mt-3 rounded-2xl px-4 py-3.5"
          style={{ border: '1px solid rgba(122,74,52,0.28)' }}
        >
          <p className="text-[14px] leading-[1.85] text-[var(--color-meok)] opacity-90">
            {entry.full}
          </p>
        </div>

        {/* 연관 용어 */}
        {related.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-medium text-[var(--color-galsaek)] opacity-70">
              함께 보면 좋은 말
            </p>
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => onNavigate(r.key)}
                  className="rounded-full px-3 py-1.5 text-[12px] text-[var(--color-galsaek)] transition hover:text-[var(--color-juhong)]"
                  style={{
                    border: '1px solid rgba(122,74,52,0.3)',
                    backgroundColor: 'rgba(246,237,217,0.6)',
                  }}
                >
                  {r.term}
                  <span className="ml-1 opacity-50">{r.hanja}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl py-3 font-serif-kr text-sm font-bold text-[var(--color-galsaek)] transition hover:text-[var(--color-juhong)]"
          style={{
            border: '1px solid rgba(122,74,52,0.35)',
            backgroundColor: 'rgba(246,237,217,0.55)',
          }}
        >
          닫기
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── 물음표 아이콘 ─────────────────────────────────── */

function InfoIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0 self-center text-[var(--color-juhong)] opacity-70"
    >
      <circle cx="8" cy="8" r="6.6" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M6.4 6.2a1.7 1.7 0 1 1 2.2 1.7c-.4.15-.6.45-.6.9v.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.4" r="0.75" fill="currentColor" />
    </svg>
  );
}

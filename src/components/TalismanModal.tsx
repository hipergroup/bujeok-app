'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedTalisman, TalismanInfo } from '@/lib/types';
import { getEnergyByCategory } from '@/data/energies';
import TalismanThumbnail from './TalismanThumbnail';

interface TalismanModalProps {
  talisman: (SavedTalisman | TalismanInfo) | null;
  onClose: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  /** Extra CTA shown at the bottom (e.g. "이 부적 받기") */
  actionButton?: React.ReactNode;
}

function isSaved(t: SavedTalisman | TalismanInfo): t is SavedTalisman {
  return 'savedAt' in t;
}

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: '1px solid rgba(122,74,52,0.2)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <span className="font-serif-kr text-sm font-bold text-[var(--color-galsaek)]">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-[var(--color-galsaek)] opacity-60"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed text-[var(--color-galsaek)]">{children}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TalismanModal({
  talisman,
  onClose,
  onShare,
  onDelete,
  actionButton,
}: TalismanModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!talisman) return null;

  const color = getEnergyByCategory(talisman.category).color;
  const saved = isSaved(talisman);
  const dateStr = saved
    ? new Date(talisman.savedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${talisman.name} (${talisman.hanja})`,
          text: talisman.description,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      // fallback: copy to clipboard
      await navigator.clipboard.writeText(
        `${talisman.name} (${talisman.hanja})\n${talisman.description}`
      );
      alert('클립보드에 복사되었습니다.');
    }
    onShare?.();
  };

  const handleDownload = () => {
    // grab the SVG element from the modal and download it
    const svgEl = document.querySelector('#talisman-modal-svg svg') as SVGSVGElement | null;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${talisman.name}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete?.();
    setConfirmDelete(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="hanji-surface relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl pb-[max(2rem,env(safe-area-inset-bottom))]"
          style={{ borderTop: '1px solid rgba(122,74,52,0.4)' }}
        >
          {/* Drag handle */}
          <div className="hanji-surface sticky top-0 z-10 flex justify-center pb-2 pt-3">
            <div className="h-1 w-10 rounded-full bg-[var(--color-galsaek)] opacity-30" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-3 rounded-full p-1.5 text-[var(--color-galsaek)] transition hover:text-[var(--color-juhong)]"
            style={{ border: '1px solid rgba(122,74,52,0.3)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="flex flex-col items-center px-6 pt-2">
            {/* Talisman SVG */}
            <div id="talisman-modal-svg">
              {saved && talisman.svg ? (
                <div
                  style={{ width: 200, aspectRatio: '360 / 560' }}
                  className="overflow-hidden rounded-xl"
                  dangerouslySetInnerHTML={{ __html: talisman.svg }}
                />
              ) : (
                <TalismanThumbnail id={talisman.id} category={talisman.category} size={200} />
              )}
            </div>

            {/* Name + Hanja */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h2 className="font-serif-kr text-xl font-bold text-[var(--color-meok)]">{talisman.name}</h2>
            </div>
            <p className="mt-1 text-sm text-[var(--color-galsaek)]">{talisman.hanja}</p>

            {dateStr && (
              <p className="mt-2 text-xs text-[var(--color-galsaek)] opacity-70">{dateStr} 수령</p>
            )}

            {/* Description */}
            <p className="mt-4 text-center text-sm leading-relaxed text-[var(--color-meok)] opacity-90">
              {talisman.description}
            </p>

            {/* 내가 담은 문구 */}
            {saved && talisman.note && (
              <p
                className="mt-3 w-full rounded-xl px-4 py-2.5 text-center font-serif-kr text-sm text-[var(--color-juhong)]"
                style={{
                  border: '1px solid rgba(167,43,33,0.3)',
                  backgroundColor: 'rgba(167,43,33,0.06)',
                }}
              >
                &ldquo;{talisman.note}&rdquo;
              </p>
            )}

            {/* Expandable sections */}
            <div className="mt-6 w-full">
              <Section title="이 부적의 의미" defaultOpen>
                {talisman.description}
              </Section>
              <Section title="사용 상황">{talisman.whenToUse}</Section>
              <Section title="문양 설명">{talisman.symbolsExplained}</Section>
              <Section title="사용법">{talisman.howToUse}</Section>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex w-full flex-col gap-3">
              {actionButton}

              {saved && (
                <div className="flex w-full gap-3">
                  <button
                    onClick={handleShare}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[var(--color-galsaek)] transition active:scale-95"
                    style={{
                      border: '1px solid rgba(122,74,52,0.4)',
                      backgroundColor: 'rgba(246,237,217,0.7)',
                    }}
                  >
                    <span>📤</span> 공유
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[var(--color-galsaek)] transition active:scale-95"
                    style={{
                      border: '1px solid rgba(122,74,52,0.4)',
                      backgroundColor: 'rgba(246,237,217,0.7)',
                    }}
                  >
                    <span>⬇️</span> 다운로드
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition ${
                      confirmDelete
                        ? 'border-red-500/60 bg-red-900/40 text-red-300'
                        : 'border-red-900/30 bg-red-900/10 text-red-400 hover:bg-red-900/20'
                    }`}
                  >
                    <span>🗑️</span> {confirmDelete ? '정말 삭제?' : '삭제'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

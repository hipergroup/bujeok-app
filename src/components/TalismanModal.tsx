'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedTalisman, TalismanInfo, CATEGORY_COLORS } from '@/lib/types';
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

/** 문자열 배열을 점 목록으로 표시 */
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-[0.35rem] inline-block h-1 w-1 shrink-0 rounded-full bg-amber-600/70" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
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
    <div className="border-t border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <span className="text-sm font-semibold text-amber-200/80">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-zinc-500"
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
            <div className="pb-4 text-sm leading-relaxed text-zinc-400">{children}</div>
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

  const color = CATEGORY_COLORS[talisman.category];
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
          className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t border-white/[0.08] bg-[#0D0B12] pb-[max(2rem,env(safe-area-inset-bottom))]"
        >
          {/* Drag handle */}
          <div className="sticky top-0 z-10 flex justify-center bg-[#0D0B12] pb-2 pt-3">
            <div className="h-1 w-10 rounded-full bg-white/20" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-3 rounded-full bg-white/10 p-1.5 text-zinc-400 transition hover:text-white"
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
              <TalismanThumbnail id={talisman.id} category={talisman.category} size={200} />
            </div>

            {/* Name + Hanja */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h2 className="text-xl font-bold text-amber-100">{talisman.name}</h2>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{talisman.hanja}</p>

            {dateStr && (
              <p className="mt-2 text-xs text-zinc-500">{dateStr} 수령</p>
            )}

            {/* Description */}
            <p className="mt-4 text-center text-sm leading-relaxed text-zinc-300">
              {talisman.description}
            </p>

            {/* Expandable sections */}
            <div className="mt-6 w-full">
              <Section title="이 부적의 의미" defaultOpen>
                <BulletList items={talisman.meaning} />
              </Section>
              <Section title="사용 상황">
                <BulletList items={talisman.situations} />
              </Section>
              <Section title="문양 설명">
                <div className="flex flex-col gap-2">
                  <p>
                    <span className="text-amber-200/70">중앙 글자</span>{' '}
                    <span className="font-semibold text-amber-100">
                      {talisman.design.centerText}
                    </span>
                  </p>
                  {talisman.design.patterns.length > 0 && (
                    <p>
                      <span className="text-amber-200/70">문양</span>{' '}
                      {talisman.design.patterns.join(', ')}
                    </p>
                  )}
                  {talisman.design.symbols.length > 0 && (
                    <p>
                      <span className="text-amber-200/70">상징</span>{' '}
                      {talisman.design.symbols.join(', ')}
                    </p>
                  )}
                  <p>
                    <span className="text-amber-200/70">먹·종이</span>{' '}
                    {talisman.design.inkColor} / {talisman.design.paperColor}
                  </p>
                  <p className="text-zinc-500">{talisman.design.notes}</p>
                </div>
              </Section>
              <Section title="사용법">
                <div className="flex flex-col gap-3">
                  <BulletList items={talisman.usage} />
                  <p>
                    <span className="text-amber-200/70">부착 위치</span>{' '}
                    {talisman.placement}
                  </p>
                  <p>
                    <span className="text-amber-200/70">교체 주기</span>{' '}
                    {talisman.replacement}
                  </p>
                </div>
              </Section>
              <Section title="주문(眞言)">
                <p className="text-center font-medium tracking-wide text-amber-200/90">
                  {talisman.mantra}
                </p>
              </Section>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex w-full flex-col gap-3">
              {actionButton}

              {saved && (
                <div className="flex w-full gap-3">
                  <button
                    onClick={handleShare}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-800/40 bg-amber-900/20 py-3 text-sm font-medium text-amber-300 transition hover:bg-amber-900/30"
                  >
                    <span>📤</span> 공유
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-800/40 bg-amber-900/20 py-3 text-sm font-medium text-amber-300 transition hover:bg-amber-900/30"
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

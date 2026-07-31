'use client';

import { motion } from 'framer-motion';
import { SavedTalisman, TalismanInfo } from '@/lib/types';
import { getEnergyByCategory } from '@/data/energies';
import TalismanThumbnail from './TalismanThumbnail';

interface TalismanCardProps {
  talisman: SavedTalisman | TalismanInfo;
  onClick?: () => void;
  size?: 'small' | 'large';
}

function isSaved(t: SavedTalisman | TalismanInfo): t is SavedTalisman {
  return 'savedAt' in t;
}

/** 직접 만든 부적(svg 보유)이면 실제 모습, 아니면 장식 썸네일 */
export function TalismanVisual({
  talisman,
  width,
}: {
  talisman: SavedTalisman | TalismanInfo;
  /** 픽셀 값 또는 '100%' 등 CSS 폭 */
  width: number | string;
}) {
  const customSvg = isSaved(talisman) ? talisman.svg : undefined;
  if (customSvg) {
    return (
      <div
        style={{ width, aspectRatio: '360 / 560' }}
        className="overflow-hidden rounded-lg"
        dangerouslySetInnerHTML={{ __html: customSvg }}
      />
    );
  }
  return (
    <TalismanThumbnail
      id={talisman.id}
      category={talisman.category}
      size={typeof width === 'number' ? width : 160}
    />
  );
}

export default function TalismanCard({ talisman, onClick, size = 'small' }: TalismanCardProps) {
  const color = getEnergyByCategory(talisman.category).color;
  const saved = isSaved(talisman);
  const dateStr = saved
    ? new Date(talisman.savedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  if (size === 'large') {
    return (
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        className="hanji-card relative flex w-full flex-col items-center gap-4 rounded-xl p-6 text-left"
      >
        <span
          className="pointer-events-none absolute inset-[4px] rounded-lg"
          style={{ border: '1px solid rgba(122, 74, 52, 0.15)' }}
        />
        <TalismanVisual talisman={talisman} width={160} />

        <div className="flex w-full flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h3 className="font-serif-kr text-lg font-bold text-[var(--color-meok)]">
              {talisman.name}
            </h3>
          </div>
          <p className="text-sm text-[var(--color-galsaek)]">{talisman.hanja}</p>
          <p className="mt-1 line-clamp-2 text-center text-sm leading-relaxed text-[var(--color-galsaek)] opacity-80">
            {talisman.description}
          </p>
          {dateStr && (
            <p className="mt-2 text-xs text-[var(--color-galsaek)] opacity-60">
              {dateStr} 수령
            </p>
          )}
        </div>
      </motion.button>
    );
  }

  // ── Small (thumbnail grid card) ──
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="hanji-card relative flex w-full flex-col items-center gap-2 rounded-xl p-3 text-center"
    >
      <span
        className="pointer-events-none absolute inset-[3px] rounded-lg"
        style={{ border: '1px solid rgba(122, 74, 52, 0.15)' }}
      />
      <TalismanVisual talisman={talisman} width={92} />

      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h4 className="font-serif-kr text-sm font-bold text-[var(--color-meok)]">
            {talisman.name}
          </h4>
        </div>
      </div>
    </motion.button>
  );
}

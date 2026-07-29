'use client';

import { motion } from 'framer-motion';
import { SavedTalisman, TalismanInfo, CATEGORY_COLORS } from '@/lib/types';
import TalismanThumbnail from './TalismanThumbnail';

interface TalismanCardProps {
  talisman: SavedTalisman | TalismanInfo;
  onClick?: () => void;
  size?: 'small' | 'large';
}

function isSaved(t: SavedTalisman | TalismanInfo): t is SavedTalisman {
  return 'savedAt' in t;
}

export default function TalismanCard({ talisman, onClick, size = 'small' }: TalismanCardProps) {
  const color = CATEGORY_COLORS[talisman.category];
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
        className="relative flex w-full flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-6 text-left backdrop-blur-sm"
      >
        {/* Shimmer */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <motion.div
            className="absolute -inset-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
            style={{ width: '50%' }}
          />
        </div>

        <TalismanThumbnail id={talisman.id} category={talisman.category} size={160} />

        <div className="flex w-full flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h3 className="text-lg font-bold text-amber-100">{talisman.name}</h3>
          </div>
          <p className="text-sm text-zinc-400">{talisman.hanja}</p>
          <p className="mt-1 line-clamp-2 text-center text-sm leading-relaxed text-zinc-500">
            {talisman.description}
          </p>
          {dateStr && (
            <p className="mt-2 text-xs text-zinc-600">{dateStr} 수령</p>
          )}
        </div>
      </motion.button>
    );
  }

  // ── Small (thumbnail grid card) ──
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="group relative flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-3 text-center backdrop-blur-sm"
    >
      {/* Shimmer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <motion.div
          className="absolute -inset-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 5, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
          style={{ width: '50%' }}
        />
      </div>

      <TalismanThumbnail id={talisman.id} category={talisman.category} size={80} />

      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h4 className="text-sm font-semibold text-amber-100">{talisman.name}</h4>
        </div>
        {dateStr && (
          <p className="text-[10px] text-zinc-500">{dateStr}</p>
        )}
      </div>
    </motion.button>
  );
}

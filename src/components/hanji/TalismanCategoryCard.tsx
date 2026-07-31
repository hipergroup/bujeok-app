'use client';

import { motion } from 'framer-motion';
import type { Energy } from '@/data/energies';
import { MOTIF_COMPONENTS } from './motifs';

/**
 * 홈 2열 그리드의 마음 카테고리 카드 — 얇은 전통 테두리의 한지 카드
 */
export default function TalismanCategoryCard({
  energy,
  onClick,
}: {
  energy: Energy;
  onClick?: () => void;
}) {
  const Motif = MOTIF_COMPONENTS[energy.motif];
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="hanji-card relative flex flex-col items-center gap-2 rounded-xl px-3 pb-4 pt-5 text-center"
    >
      {/* 안쪽 이중 선 */}
      <span
        className="pointer-events-none absolute inset-[4px] rounded-lg"
        style={{ border: '1px solid rgba(122, 74, 52, 0.18)' }}
      />
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          color: energy.color,
          border: `1.5px solid ${energy.color}55`,
        }}
      >
        <Motif size={28} />
      </span>
      <span className="font-serif-kr text-[15px] font-bold text-[var(--color-meok)]">
        {energy.title}
      </span>
      <span className="text-[11px] leading-tight text-[var(--color-galsaek)] opacity-80">
        {energy.subtitle}
      </span>
    </motion.button>
  );
}

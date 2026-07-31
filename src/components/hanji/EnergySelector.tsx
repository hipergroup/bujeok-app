'use client';

import { motion } from 'framer-motion';
import { ENERGIES, type Energy } from '@/data/energies';
import { MOTIF_COMPONENTS } from './motifs';

/**
 * 기운 선택 — 원형 전통 문양 + 텍스트, 가로 스크롤.
 * 선택된 항목은 주홍(해당 기운 색)으로 강조.
 */
export default function EnergySelector({
  selectedId,
  onSelect,
  energies = ENERGIES,
}: {
  selectedId: string;
  onSelect: (energy: Energy) => void;
  energies?: Energy[];
}) {
  return (
    <div className="energy-scroll">
      {energies.map((energy) => {
        const Motif = MOTIF_COMPONENTS[energy.motif];
        const active = energy.id === selectedId;
        return (
          <motion.button
            key={energy.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelect(energy)}
            className="flex w-[64px] flex-col items-center gap-1.5"
          >
            <span
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full transition-colors"
              style={{
                color: active ? '#F6EDD9' : energy.color,
                backgroundColor: active ? energy.color : 'transparent',
                border: active
                  ? `1.5px solid ${energy.color}`
                  : '1.5px solid rgba(122, 74, 52, 0.35)',
              }}
            >
              <Motif size={26} />
            </span>
            <span
              className={`text-[11px] leading-tight ${
                active
                  ? 'font-bold text-[var(--color-juhong)]'
                  : 'text-[var(--color-galsaek)]'
              }`}
            >
              {energy.title}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

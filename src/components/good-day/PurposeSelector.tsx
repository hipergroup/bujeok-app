'use client';

import { motion } from 'framer-motion';
import { PURPOSE_SPECS } from '@/lib/good-day/purposeRules';
import type { GoodDayPurpose } from '@/types/good-day';

const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';

export default function PurposeSelector({
  onSelect,
}: {
  onSelect: (p: GoodDayPurpose) => void;
}) {
  return (
    <div>
      <h2
        className="font-serif-kr text-center"
        style={{ fontSize: 20, lineHeight: 1.5, color: MEOK }}
      >
        어떤 일을 앞두고 있나요?
      </h2>
      <p
        className="text-center"
        style={{ marginTop: 7, fontSize: 11.5, color: `${GALSAEK}AA` }}
      >
        목적에 따라 살펴보는 것이 달라져요
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {PURPOSE_SPECS.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="rounded-xl text-left"
            style={{
              padding: '16px 18px',
              background: 'rgba(255,253,248,0.82)',
              border: '1px solid rgba(122,74,52,0.2)',
            }}
            whileTap={{ scale: 0.985 }}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
          >
            <span
              className="font-serif-kr block"
              style={{ fontSize: 16, color: MEOK }}
            >
              {p.title}
            </span>
            <span
              className="mt-1 block"
              style={{ fontSize: 12, color: `${GALSAEK}CC` }}
            >
              {p.desc}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

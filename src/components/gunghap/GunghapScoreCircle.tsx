'use client';

// 궁합 점수 원형 표시 — 두 사람의 인연(/gunghap)과 결혼 날 받기(/days)가 함께 쓴다.
// 같은 점수를 두 화면에서 다르게 보여주지 않으려고 한 군데로 모았다.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { GunghapGrade } from '@/data/gunghap';

const JUHONG = '#A72B21';
const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';
const SSUK = '#6B7D63';
const HWANG = '#DAA017';
const NAMSAEK = '#1F3E63';

export const GRADE_COLOR: Record<GunghapGrade, string> = {
  천생연분: JUHONG,
  '서로 밝혀주는 사이': HWANG,
  '맞춰가는 재미': SSUK,
  '다름이 동력': NAMSAEK,
};

export default function GunghapScoreCircle({
  score,
  grade,
  size = 136,
}: {
  score: number;
  grade: GunghapGrade;
  /** 지름(px) — 결혼 날 받기 단계에서는 조금 작게 쓴다 */
  size?: number;
}) {
  const [display, setDisplay] = useState(50);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const DURATION = 1300;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(50 + (score - 50) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const R = 54;
  const CIRC = 2 * Math.PI * R;
  const color = GRADE_COLOR[grade];
  const scale = size / 136;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ height: size, width: size }}>
        <svg viewBox="0 0 136 136" className="h-full w-full -rotate-90">
          <circle
            cx="68"
            cy="68"
            r={R}
            fill="none"
            stroke="rgba(122,74,52,0.15)"
            strokeWidth="8"
          />
          <motion.circle
            cx="68"
            cy="68"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: CIRC * (1 - score / 100) }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-serif-kr font-bold"
            style={{ color: MEOK, fontSize: 36 * scale }}
          >
            {display}
          </span>
          <span style={{ color: `${GALSAEK}99`, fontSize: 10 * scale }}>
            / 100
          </span>
        </div>
      </div>
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-2 rounded-full px-4 py-1 font-serif-kr text-sm font-bold"
        style={{ color, background: `${color}14`, border: `1px solid ${color}44` }}
      >
        {grade}
      </motion.span>
    </div>
  );
}

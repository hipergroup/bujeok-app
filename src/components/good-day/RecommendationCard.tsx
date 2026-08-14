'use client';

import { motion } from 'framer-motion';
import { TIER_LABEL } from '@/types/good-day';
import type { DayCandidate } from '@/types/good-day';

const JUHONG = '#A72B21';
const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';

const WD = ['일', '월', '화', '수', '목', '금', '토'];

export function formatDate(c: DayCandidate): string {
  const [y, m, d] = c.date.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일 (${WD[c.calendar.weekday]})`;
}

export function formatLunar(c: DayCandidate): string {
  const { lunarMonth, lunarDay, leapMonth } = c.calendar;
  return `음력 ${leapMonth ? '윤' : ''}${lunarMonth}월 ${lunarDay}일`;
}

export default function RecommendationCard({
  candidate,
  rank,
  onClick,
}: {
  candidate: DayCandidate;
  rank: number;
  onClick: () => void;
}) {
  const isSonFree = candidate.son === 'none';
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl text-left"
      style={{
        padding: '16px 18px',
        background: 'rgba(255,253,248,0.82)',
        border:
          rank === 0
            ? '1px solid rgba(167,43,33,0.45)'
            : '1px solid rgba(122,74,52,0.2)',
      }}
      whileTap={{ scale: 0.985 }}
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.06 * rank, duration: 0.3 }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="rounded-full"
          style={{
            padding: '2px 9px',
            fontSize: 10.5,
            color: JUHONG,
            background: 'rgba(167,43,33,0.08)',
            border: '1px solid rgba(167,43,33,0.3)',
          }}
        >
          {TIER_LABEL[candidate.tier]}
        </span>
        {isSonFree && (
          <span
            className="rounded-full"
            style={{
              padding: '2px 9px',
              fontSize: 10.5,
              color: GALSAEK,
              border: '1px solid rgba(122,74,52,0.26)',
            }}
          >
            손 없는 날
          </span>
        )}
        {candidate.calendar.holiday && (
          <span
            className="rounded-full"
            style={{
              padding: '2px 9px',
              fontSize: 10.5,
              color: GALSAEK,
              border: '1px solid rgba(122,74,52,0.26)',
            }}
          >
            {candidate.calendar.holidayName}
          </span>
        )}
      </div>

      <p
        className="font-serif-kr"
        style={{ marginTop: 10, fontSize: 18, color: MEOK }}
      >
        {formatDate(candidate)}
      </p>
      <p style={{ marginTop: 4, fontSize: 11.5, color: `${GALSAEK}CC` }}>
        {formatLunar(candidate)}
        {candidate.calendar.iljin ? ` · 일진 ${candidate.calendar.iljin}` : ''}
      </p>

      {candidate.reasons[0] && (
        <p
          style={{
            marginTop: 10,
            fontSize: 12.5,
            lineHeight: 1.75,
            color: `${MEOK}CC`,
          }}
        >
          {candidate.reasons[0]}
        </p>
      )}
    </motion.button>
  );
}

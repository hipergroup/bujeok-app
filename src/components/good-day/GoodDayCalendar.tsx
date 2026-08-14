'use client';

import { useMemo, useState } from 'react';
import type { DayCandidate } from '@/types/good-day';

const JUHONG = '#A72B21';
const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';
const WD = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 월간 달력.
 *   진한 주홍 원   — 추천
 *   옅은 주홍 테두리 — 무난
 *   회색 점        — 신중
 *   ◦ 표시         — 손 없는 날
 */
export default function GoodDayCalendar({
  candidates,
  onPick,
}: {
  candidates: DayCandidate[];
  onPick: (c: DayCandidate) => void;
}) {
  const byDate = useMemo(() => {
    const m = new Map<string, DayCandidate>();
    for (const c of candidates) m.set(c.date, c);
    return m;
  }, [candidates]);

  const months = useMemo(() => {
    const set = new Set<string>();
    for (const c of candidates) set.add(c.date.slice(0, 7));
    return [...set].sort();
  }, [candidates]);

  const [monthIdx, setMonthIdx] = useState(0);
  if (months.length === 0) return null;

  const ym = months[Math.min(monthIdx, months.length - 1)];
  const [year, month] = ym.split('-').map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const lead = first.getUTCDay();
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: (number | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ];

  return (
    <div
      className="rounded-xl"
      style={{
        padding: '16px 14px',
        background: 'rgba(255,253,248,0.82)',
        border: '1px solid rgba(122,74,52,0.2)',
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
          disabled={monthIdx === 0}
          style={{ fontSize: 16, color: GALSAEK, opacity: monthIdx === 0 ? 0.3 : 1 }}
          aria-label="이전 달"
        >
          ‹
        </button>
        <span className="font-serif-kr" style={{ fontSize: 15, color: MEOK }}>
          {year}년 {month}월
        </span>
        <button
          type="button"
          onClick={() => setMonthIdx((i) => Math.min(months.length - 1, i + 1))}
          disabled={monthIdx >= months.length - 1}
          style={{
            fontSize: 16,
            color: GALSAEK,
            opacity: monthIdx >= months.length - 1 ? 0.3 : 1,
          }}
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7">
        {WD.map((w) => (
          <div
            key={w}
            className="text-center"
            style={{ fontSize: 10.5, color: `${GALSAEK}AA`, paddingBottom: 6 }}
          >
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const c = byDate.get(iso);
          const tier = c?.tier;
          return (
            <button
              key={iso}
              type="button"
              disabled={!c}
              onClick={() => c && onPick(c)}
              className="flex flex-col items-center justify-center"
              style={{ padding: '5px 0', opacity: c ? 1 : 0.3 }}
            >
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 30,
                  height: 30,
                  fontSize: 12.5,
                  color: tier === 'best' ? '#F6EDD9' : MEOK,
                  background:
                    tier === 'best'
                      ? JUHONG
                      : tier === 'fine'
                        ? 'transparent'
                        : 'transparent',
                  border:
                    tier === 'fine' ? '1px solid rgba(167,43,33,0.35)' : '1px solid transparent',
                }}
              >
                {d}
              </span>
              <span style={{ height: 8, fontSize: 8, lineHeight: '8px', color: GALSAEK }}>
                {c?.son === 'none' ? '◦' : tier === 'convenient' ? '·' : ''}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {[
          ['추천', JUHONG, true],
          ['무난', 'transparent', false],
        ].map(([label, bg, filled]) => (
          <span key={String(label)} className="flex items-center gap-1">
            <span
              className="inline-block rounded-full"
              style={{
                width: 10,
                height: 10,
                background: bg as string,
                border: filled ? 'none' : '1px solid rgba(167,43,33,0.35)',
              }}
            />
            <span style={{ fontSize: 10.5, color: `${GALSAEK}CC` }}>{label}</span>
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span style={{ fontSize: 10, color: GALSAEK }}>·</span>
          <span style={{ fontSize: 10.5, color: `${GALSAEK}CC` }}>신중</span>
        </span>
        <span className="flex items-center gap-1">
          <span style={{ fontSize: 10, color: GALSAEK }}>◦</span>
          <span style={{ fontSize: 10.5, color: `${GALSAEK}CC` }}>손 없는 날</span>
        </span>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomTab from '@/components/BottomTab';
import TalismanCard from '@/components/TalismanCard';
import TalismanModal from '@/components/TalismanModal';
import { SavedTalisman, CATEGORY_COLORS } from '@/lib/types';
import { TOTAL_TALISMAN_COUNT } from '@/lib/talisman-data';

// ── Progress ring component ──
function ProgressRing({ collected, total }: { collected: number; total: number }) {
  const pct = total > 0 ? collected / total : 0;
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="88" height="88" className="-rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <motion.circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#e8c36a"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute text-lg font-bold text-amber-200">
        {collected}
      </span>
    </div>
  );
}

export default function CollectionPage() {
  const [collection, setCollection] = useState<SavedTalisman[]>([]);
  const [selected, setSelected] = useState<SavedTalisman | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bujeok-collection');
      if (stored) {
        setCollection(JSON.parse(stored) as SavedTalisman[]);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDelete = () => {
    if (!selected) return;
    const next = collection.filter((t) => t.id !== selected.id);
    setCollection(next);
    localStorage.setItem('bujeok-collection', JSON.stringify(next));
    setSelected(null);
  };

  const isEmpty = collection.length === 0;

  return (
    <div className="flex min-h-dvh flex-col bg-[#0D0B12] text-white">
      {/* Header */}
      <header className="px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="text-2xl font-bold text-amber-100">나의 부적함</h1>
      </header>

      {/* Stats bar */}
      <div className="flex items-center gap-5 px-5 pb-5">
        <ProgressRing collected={collection.length} total={TOTAL_TALISMAN_COUNT} />
        <div>
          <p className="text-base font-semibold text-amber-200">
            {collection.length}개의 부적을 모았어요
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            전체 {TOTAL_TALISMAN_COUNT}종 중 {collection.length}종 수집
          </p>
          {/* Category breakdown */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.entries(CATEGORY_COLORS) as [string, string][]).map(([cat, clr]) => {
              const count = collection.filter((t) => t.category === cat).length;
              if (count === 0) return null;
              return (
                <span
                  key={cat}
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: `${clr}20`, color: clr }}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: clr }} />
                  {cat} {count}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-24">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            /* ── Empty State ── */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col items-center justify-center pt-20 text-center"
            >
              <div className="text-6xl">📜</div>
              <p className="mt-4 text-lg font-medium text-zinc-300">
                아직 부적이 없어요
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                첫 부적을 받으러 가볼까요?
              </p>
              <a
                href="/talisman"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700/80 px-6 py-3 text-sm font-semibold text-amber-100 shadow-lg shadow-amber-900/30 transition hover:bg-amber-700"
              >
                부적 받기 →
              </a>
            </motion.div>
          ) : (
            /* ── Grid ── */
            <motion.div
              key="grid"
              className="grid grid-cols-2 gap-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07 } },
              }}
            >
              {collection.map((talisman) => (
                <motion.div
                  key={talisman.id}
                  variants={{
                    hidden: { opacity: 0, y: 24, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <TalismanCard
                    talisman={talisman}
                    size="small"
                    onClick={() => setSelected(talisman)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      {selected && (
        <TalismanModal
          talisman={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}

      <BottomTab />
    </div>
  );
}

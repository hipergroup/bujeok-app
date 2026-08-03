'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomTab from '@/components/BottomTab';
import TalismanModal from '@/components/TalismanModal';
import TalismanThumbnail from '@/components/TalismanThumbnail';
import {
  TalismanInfo,
  TalismanCategory,
  CATEGORY_COLORS,
  CATEGORY_LIST,
} from '@/lib/types';
import { TALISMANS, TOTAL_TALISMAN_COUNT } from '@/data/talismans';

export default function EncyclopediaPage() {
  const [activeTab, setActiveTab] = useState<TalismanCategory | '전체'>('전체');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<TalismanInfo | null>(null);
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
  const tabsRef = useRef<HTMLDivElement>(null);

  // load collected IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bujeok-collection');
      if (stored) {
        const parsed = JSON.parse(stored) as Array<{ id: string }>;
        setCollectedIds(new Set(parsed.map((t) => t.id)));
      }
    } catch {
      // fallback demo
      setCollectedIds(
        new Set(['protect-01', 'wealth-01', 'study-02', 'family-02', 'health-03'])
      );
    }
  }, []);

  const collectedCount = collectedIds.size;

  const filtered = useMemo(() => {
    let list: TalismanInfo[] = TALISMANS;
    if (activeTab !== '전체') {
      list = list.filter((t) => t.category === activeTab);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.hanja.includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, search]);

  const progressPct = (collectedCount / TOTAL_TALISMAN_COUNT) * 100;

  return (
    <div className="flex min-h-dvh flex-col bg-[#0D0B12] text-white">
      {/* Header */}
      <header className="px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold text-amber-100">부적 도감</h1>
          <span className="text-xs text-zinc-400">전통 부적 {TOTAL_TALISMAN_COUNT}종</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{TOTAL_TALISMAN_COUNT}종 중 {collectedCount}종 수집</span>
            <span className="text-amber-400">{Math.round(progressPct)}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="부적 이름 또는 한자 검색..."
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-amber-700/50 focus:ring-1 focus:ring-amber-700/30"
          />
        </div>
      </header>

      {/* Category Tabs (horizontal scroll) */}
      <div
        ref={tabsRef}
        className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-3"
      >
        {CATEGORY_LIST.map(({ label, value }) => {
          const isActive = activeTab === value;
          const color = value !== '전체' ? CATEGORY_COLORS[value as TalismanCategory] : undefined;
          return (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition ${
                isActive
                  ? 'bg-amber-800/50 text-amber-200 shadow-inner'
                  : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]'
              }`}
            >
              {color && (
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
              {label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <motion.div
          className="flex flex-col gap-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } },
          }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((talisman) => {
              const isCollected = collectedIds.has(talisman.id);
              const color = CATEGORY_COLORS[talisman.category];
              return (
                <motion.button
                  key={talisman.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(talisman)}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 text-left transition hover:bg-white/[0.05]"
                >
                  {/* Thumbnail */}
                  <div className="relative shrink-0">
                    <TalismanThumbnail
                      id={talisman.id}
                      category={talisman.category}
                      size={48}
                      grayed={!isCollected}
                    />
                    {isCollected && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white shadow">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <h3
                        className={`truncate text-sm font-semibold ${
                          isCollected ? 'text-amber-100' : 'text-zinc-500'
                        }`}
                      >
                        {talisman.name}
                      </h3>
                      <span className={`text-xs ${isCollected ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {talisman.hanja}
                      </span>
                    </div>
                    <p
                      className={`mt-0.5 line-clamp-1 text-xs ${
                        isCollected ? 'text-zinc-400' : 'text-zinc-600'
                      }`}
                    >
                      {talisman.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <span className="shrink-0 text-xs text-zinc-600">›</span>
                </motion.button>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              <span className="text-4xl">🔍</span>
              <p className="mt-3 text-sm text-zinc-500">
                검색 결과가 없습니다
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <TalismanModal
          talisman={selected}
          onClose={() => setSelected(null)}
          actionButton={
            <a
              href={`/talisman?category=${encodeURIComponent(selected.category)}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700/80 py-3.5 text-sm font-semibold text-amber-100 shadow-lg shadow-amber-900/30 transition hover:bg-amber-700"
            >
              이 부적 받기 →
            </a>
          }
        />
      )}

      {/* hide scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <BottomTab />
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import BottomTab from '@/components/BottomTab';
import TalismanModal from '@/components/TalismanModal';
import TalismanThumbnail from '@/components/TalismanThumbnail';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import { BackIcon, SearchMotif } from '@/components/hanji/motifs';
import { getEnergyByCategory } from '@/data/energies';
import { TalismanInfo, TalismanCategory, CATEGORY_LIST } from '@/lib/types';
import { TALISMANS, TOTAL_TALISMAN_COUNT } from '@/data/talismans';

export default function EncyclopediaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TalismanCategory | '전체'>('전체');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<TalismanInfo | null>(null);
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());

  // load collected IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bujeok-collection');
      if (stored) {
        const parsed = JSON.parse(stored) as Array<{ id: string }>;
        setCollectedIds(new Set(parsed.map((t) => t.id)));
      }
    } catch {
      // ignore
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
    <HanjiBackground>
      <TraditionalHeader
        left={
          <button onClick={() => router.push('/mypage')} aria-label="뒤로가기">
            <BackIcon size={20} />
          </button>
        }
        title="부적 도감"
      />

      <div className="mx-auto w-full max-w-md flex-1 px-5 pb-28">
        {/* 수집 진행도 */}
        <div className="hanji-card rounded-xl px-4 py-3">
          <div className="flex items-center justify-between text-xs text-[var(--color-galsaek)]">
            <span>
              전통 부적 {TOTAL_TALISMAN_COUNT}종 중{' '}
              <b className="text-[var(--color-meok)]">{collectedCount}종</b> 수집
            </span>
            <span className="font-bold text-[var(--color-juhong)]">
              {Math.round(progressPct)}%
            </span>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full"
            style={{ backgroundColor: 'rgba(122,74,52,0.15)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-hwang), var(--color-juhong))',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* 검색 */}
        <div className="relative mt-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-galsaek)] opacity-60">
            <SearchMotif size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="부적 이름 또는 한자 검색..."
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm text-[var(--color-meok)] placeholder-[var(--color-galsaek)]/50 outline-none"
            style={{
              border: '1px solid rgba(122,74,52,0.35)',
              backgroundColor: 'rgba(246,237,217,0.8)',
            }}
          />
        </div>

        {/* 카테고리 탭 */}
        <div className="energy-scroll mt-3">
          {CATEGORY_LIST.map(({ label, value }) => {
            const isActive = activeTab === value;
            const color =
              value !== '전체'
                ? getEnergyByCategory(value as TalismanCategory).color
                : undefined;
            return (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
                  isActive
                    ? 'font-bold text-[var(--color-juhong)]'
                    : 'text-[var(--color-galsaek)] opacity-80'
                }`}
                style={
                  isActive
                    ? { border: '1.5px solid var(--color-juhong)' }
                    : { border: '1px solid transparent' }
                }
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

        {/* 목록 */}
        <motion.div
          className="mt-2 flex flex-col gap-2"
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
              const color = getEnergyByCategory(talisman.category).color;
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
                  className="hanji-card flex items-center gap-3 rounded-xl p-3 text-left"
                  style={isCollected ? undefined : { opacity: 0.75 }}
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
                      <span
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-[#F6EDD9]"
                        style={{ backgroundColor: 'var(--color-ssuk)' }}
                      >
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
                        className={`truncate font-serif-kr text-sm font-bold ${
                          isCollected
                            ? 'text-[var(--color-meok)]'
                            : 'text-[var(--color-galsaek)]'
                        }`}
                      >
                        {talisman.name}
                      </h3>
                      <span className="text-xs text-[var(--color-galsaek)] opacity-70">
                        {talisman.hanja}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-[var(--color-galsaek)]">
                      {talisman.description}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-[var(--color-galsaek)] opacity-50">
                    ›
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center text-[var(--color-galsaek)]">
              <SearchMotif size={36} className="opacity-40" />
              <p className="mt-3 text-sm">검색 결과가 없습니다</p>
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
            <Link
              href={`/talisman?energy=${getEnergyByCategory(selected.category).id}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-juhong)] py-3.5 font-serif-kr text-sm font-bold text-[#F6EDD9] transition active:scale-[0.98]"
              style={{ border: '1px solid rgba(220,201,165,0.9)' }}
            >
              이 부적 받기 →
            </Link>
          }
        />
      )}

      <BottomTab />
    </HanjiBackground>
  );
}

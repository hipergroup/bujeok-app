'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import BottomTab from '@/components/BottomTab';
import { TalismanVisual } from '@/components/TalismanCard';
import TalismanModal from '@/components/TalismanModal';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import TraditionalButton from '@/components/hanji/TraditionalButton';
import CollectionSegment from '@/components/hanji/CollectionSegment';
import { BackIcon, GearIcon } from '@/components/hanji/motifs';
import { SavedTalisman } from '@/lib/types';
import { loadCollection } from '@/lib/collection';
import { ENERGIES } from '@/data/energies';

/** 필터 칩 — 전체 + 기운(카테고리 중복 제거) */
const FILTERS: { id: string; label: string; category: string | null }[] = [
  { id: 'all', label: '전체', category: null },
  ...ENERGIES.filter(
    (e, i, arr) => arr.findIndex((x) => x.category === e.category) === i
  ).map((e) => ({ id: e.id, label: e.title, category: e.category as string })),
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export default function CollectionPage() {
  const router = useRouter();
  const [collection, setCollection] = useState<SavedTalisman[]>([]);
  const [selected, setSelected] = useState<SavedTalisman | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setCollection(loadCollection());
  }, []);

  const handleDelete = () => {
    if (!selected) return;
    const next = collection.filter((t) => t.id !== selected.id);
    setCollection(next);
    localStorage.setItem('bujeok-collection', JSON.stringify(next));
    setSelected(null);
  };

  const activeCategory = FILTERS.find((f) => f.id === filter)?.category ?? null;
  const filtered = activeCategory
    ? collection.filter((t) => t.category === activeCategory)
    : collection;

  return (
    <HanjiBackground>
      <TraditionalHeader
        left={
          <button onClick={() => router.push('/')} aria-label="뒤로가기">
            <BackIcon size={20} />
          </button>
        }
        title="내 부적함"
        right={
          <button
            onClick={() => alert('설정은 준비 중이에요')}
            aria-label="설정"
          >
            <GearIcon size={20} />
          </button>
        }
      />

      <CollectionSegment />

      <div className="mx-auto w-full max-w-md flex-1 px-5 pb-32">
        <p className="mb-4 whitespace-pre-line text-center font-serif-kr text-xs leading-[1.9] text-[var(--color-galsaek)]">
          {'당신이 품었던 마음들이\n한 장씩 이곳에 머물러 있습니다.'}
        </p>

        {/* 필터 */}
        <div className="energy-scroll mb-4">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                  active
                    ? 'font-bold text-[var(--color-juhong)]'
                    : 'text-[var(--color-galsaek)] opacity-80'
                }`}
                style={
                  active
                    ? { border: '1.5px solid var(--color-juhong)' }
                    : { border: '1px solid transparent' }
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            /* ── Empty State ── */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center pt-16 text-center"
            >
              <p className="font-serif-kr text-base font-bold text-[var(--color-meok)]">
                {filter === 'all'
                  ? '아직 부적이 없어요'
                  : '이 종류의 부적이 아직 없어요'}
              </p>
              <p className="mt-1 text-xs text-[var(--color-galsaek)]">
                마음을 담아 첫 부적을 지어 볼까요?
              </p>
              <div className="mt-6 w-full max-w-[220px]">
                <TraditionalButton onClick={() => router.push('/talisman')}>
                  부적 지으러 가기
                </TraditionalButton>
              </div>
            </motion.div>
          ) : (
            /* ── Grid ── */
            <motion.div
              key={`grid-${filter}`}
              className="grid grid-cols-2 gap-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
            >
              {filtered.map((talisman) => (
                <motion.div
                  key={talisman.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.96 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {/* 시안: 부적이 곧 카드 — 풀블리드 + 이름·날짜 왼쪽 정렬 */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelected(talisman)}
                    className="block w-full overflow-hidden rounded-lg text-left"
                    style={{
                      boxShadow:
                        '0 1px 2px rgba(122,74,52,0.15), 0 4px 12px rgba(122,74,52,0.12)',
                    }}
                  >
                    <TalismanVisual talisman={talisman} width="100%" />
                  </motion.button>
                  <p className="mt-2 font-serif-kr text-[13px] font-bold text-[var(--color-meok)]">
                    {talisman.name}
                  </p>
                  {talisman.personal?.wishText && (
                    <p className="mt-0.5 truncate font-serif-kr text-[11px] text-[var(--color-galsaek)]">
                      “{talisman.personal.wishText}”
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-[var(--color-galsaek)] opacity-70">
                    {formatDate(talisman.savedAt)}
                    {talisman.personal?.serialNumber && (
                      <span className="ml-1.5">{talisman.personal.serialNumber}</span>
                    )}
                  </p>
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
    </HanjiBackground>
  );
}

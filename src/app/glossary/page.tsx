'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import BottomTab from '@/components/BottomTab';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import { BackIcon } from '@/components/hanji/motifs';
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_LIST,
  getGlossary,
  type GlossaryCategory,
  type GlossaryEntry,
} from '@/data/glossary';

type Tab = '전체' | GlossaryCategory;

const TABS: Tab[] = ['전체', ...GLOSSARY_CATEGORIES];

export default function GlossaryPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('전체');
  const [search, setSearch] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list: GlossaryEntry[] = GLOSSARY_LIST;
    if (tab !== '전체') list = list.filter((e) => e.category === tab);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.term.toLowerCase().includes(q) ||
          e.hanja.includes(q) ||
          e.plain.toLowerCase().includes(q) ||
          e.short.toLowerCase().includes(q) ||
          e.full.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tab, search]);

  return (
    <HanjiBackground decorated>
      <TraditionalHeader
        title="사주 용어 사전"
        left={
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로"
            className="flex h-10 w-10 items-center justify-center"
          >
            <BackIcon size={22} />
          </button>
        }
      />

      <div className="mx-auto w-full max-w-lg flex-1 px-5 pb-28">
        <p className="text-[13px] leading-[1.8] text-[var(--color-galsaek)] opacity-80">
          어려운 사주 말을 쉬운 우리말로 풀었어요.
          <br />
          모르는 말이 나오면 여기서 찾아보세요.
        </p>

        {/* 검색 */}
        <div className="relative mt-4">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-galsaek)] opacity-50">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="용어·한자로 찾기 (예: 용신, 用神)"
            className="hanji-card w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--color-meok)] outline-none placeholder:text-[var(--color-galsaek)] placeholder:opacity-50 focus:border-[rgba(167,43,33,0.45)]"
          />
        </div>

        {/* 분류 탭 */}
        <div className="energy-scroll mt-3">
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setOpenKey(null);
                }}
                className={`rounded-full px-4 py-1.5 font-serif-kr text-[13px] transition ${
                  active
                    ? 'bg-[var(--color-juhong)] font-bold text-[#F6EDD9]'
                    : 'text-[var(--color-galsaek)]'
                }`}
                style={
                  active
                    ? { border: '1px solid rgba(167,43,33,0.6)' }
                    : {
                        border: '1px solid rgba(122,74,52,0.3)',
                        backgroundColor: 'rgba(246,237,217,0.6)',
                      }
                }
              >
                {t}
              </button>
            );
          })}
        </div>

        <p className="mt-1 text-[11px] text-[var(--color-galsaek)] opacity-60">
          {filtered.length}개의 용어
        </p>

        {/* 목록 */}
        <div className="mt-3 flex flex-col gap-2.5">
          {filtered.map((entry, i) => (
            <TermCard
              key={entry.key}
              entry={entry}
              index={i}
              open={openKey === entry.key}
              onToggle={() =>
                setOpenKey((prev) => (prev === entry.key ? null : entry.key))
              }
              onNavigate={(k) => setOpenKey(k)}
            />
          ))}

          {filtered.length === 0 && (
            <div className="hanji-card mt-6 rounded-2xl px-5 py-10 text-center">
              <p className="font-serif-kr text-sm text-[var(--color-meok)]">
                찾는 말이 없어요
              </p>
              <p className="mt-1.5 text-[12px] text-[var(--color-galsaek)] opacity-70">
                다른 낱말로 찾아보시겠어요?
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomTab />
    </HanjiBackground>
  );
}

/* ── 용어 카드 (아코디언) ───────────────────────────── */

function TermCard({
  entry,
  index,
  open,
  onToggle,
  onNavigate,
}: {
  entry: GlossaryEntry;
  index: number;
  open: boolean;
  onToggle: () => void;
  onNavigate: (key: string) => void;
}) {
  const related = (entry.related ?? [])
    .map((k) => getGlossary(k))
    .filter((e): e is GlossaryEntry => Boolean(e));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 8) * 0.03 }}
      className="hanji-card overflow-hidden rounded-2xl"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif-kr text-base font-bold text-[var(--color-meok)]">
              {entry.term}
            </span>
            <span className="font-serif-kr text-[12px] text-[var(--color-galsaek)] opacity-60">
              {entry.hanja}
            </span>
            <span className="ml-auto shrink-0 text-[10px] text-[var(--color-galsaek)] opacity-50">
              {entry.category}
            </span>
          </div>
          <p className="mt-1 font-serif-kr text-[17px] font-bold leading-snug text-[var(--color-juhong)]">
            {entry.plain}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-galsaek)] opacity-80">
            {entry.short}
          </p>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1 shrink-0 text-[var(--color-galsaek)] opacity-50"
        >
          <ChevronIcon />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="mx-4 mb-4 rounded-xl px-3.5 py-3"
              style={{
                border: '1px solid rgba(122,74,52,0.22)',
                backgroundColor: 'rgba(242,230,204,0.55)',
              }}
            >
              <p className="text-[13.5px] leading-[1.9] text-[var(--color-meok)] opacity-90">
                {entry.full}
              </p>

              {related.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-[11px] text-[var(--color-galsaek)] opacity-70">
                    함께 보면 좋은 말
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {related.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => onNavigate(r.key)}
                        className="rounded-full px-2.5 py-1 text-[11.5px] text-[var(--color-galsaek)] transition hover:text-[var(--color-juhong)]"
                        style={{
                          border: '1px solid rgba(122,74,52,0.3)',
                          backgroundColor: 'rgba(246,237,217,0.75)',
                        }}
                      >
                        {r.term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── 아이콘 ────────────────────────────────────────── */

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M10.6 10.6L14 14"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

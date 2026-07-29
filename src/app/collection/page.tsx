'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomTab from '@/components/BottomTab';
import TalismanCard from '@/components/TalismanCard';
import TalismanModal from '@/components/TalismanModal';
import { SavedTalisman, CATEGORY_COLORS } from '@/lib/types';
import { TOTAL_TALISMAN_COUNT } from '@/lib/talisman-data';

// ── Demo seed data (in production this would come from localStorage / backend) ──
const DEMO_COLLECTION: SavedTalisman[] = [
  {
    id: 'byeoksa', name: '벽사부', hanja: '辟邪符', category: '수호',
    description: '사악한 기운을 물리치고 나쁜 것들을 쫓아내는 부적입니다.',
    whenToUse: '불길한 일이 연이어 일어나거나, 집안에 나쁜 기운이 느껴질 때 사용합니다.',
    symbolsExplained: '호랑이 문양과 팔괘가 결합되어 강력한 벽사의 힘을 나타냅니다.',
    howToUse: '대문이나 현관 위에 붙여두면 나쁜 기운이 들어오는 것을 막아줍니다.',
    svgKey: 'byeoksa', savedAt: '2025-01-15T09:30:00Z',
  },
  {
    id: 'chobok', name: '초복부', hanja: '招福符', category: '재물',
    description: '복을 불러오고 행운이 가득하게 해주는 부적입니다.',
    whenToUse: '새해가 시작되거나, 새로운 출발을 할 때 사용합니다.',
    symbolsExplained: '박쥐 문양(福)과 구름 문양이 하늘의 복을 의미합니다.',
    howToUse: '거실이나 자주 머무는 공간에 붙여둡니다.',
    svgKey: 'chobok', savedAt: '2025-02-03T14:00:00Z',
  },
  {
    id: 'hapgyeok', name: '합격부', hanja: '合格符', category: '학업',
    description: '시험에 합격하고 좋은 결과를 얻도록 돕는 부적입니다.',
    whenToUse: '수능, 자격증, 면접 등 중요한 시험을 앞두고 있을 때 사용합니다.',
    symbolsExplained: '문(門)을 여는 열쇠 문양이 합격의 문이 열리는 것을 상징합니다.',
    howToUse: '시험장에 가져가거나 수험표와 함께 둡니다.',
    svgKey: 'hapgyeok', savedAt: '2025-03-20T10:15:00Z',
  },
  {
    id: 'gajeong', name: '가정화목부', hanja: '家庭和睦符', category: '가정',
    description: '가족 간의 화합과 평화를 가져다주는 부적입니다.',
    whenToUse: '가족 간 갈등이 있거나 화목한 가정을 원할 때 사용합니다.',
    symbolsExplained: '원형 문양 안에 가족을 상징하는 네 방위가 조화를 이룹니다.',
    howToUse: '가족이 모이는 거실이나 식탁 근처에 붙입니다.',
    svgKey: 'gajeong', savedAt: '2025-04-01T08:00:00Z',
  },
  {
    id: 'mubyeong', name: '무병장수부', hanja: '無病長壽符', category: '건강',
    description: '병 없이 오래 건강하게 살도록 돕는 부적입니다.',
    whenToUse: '어르신께 드리거나, 건강이 염려될 때 사용합니다.',
    symbolsExplained: '십장생 문양이 영원한 생명과 건강을 상징합니다.',
    howToUse: '침실이나 거실에 붙여두고 매일 아침 한 번씩 바라봅니다.',
    svgKey: 'mubyeong', savedAt: '2025-04-10T11:20:00Z',
  },
];

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
    // try localStorage first, fall back to demo
    try {
      const stored = localStorage.getItem('bujeok-collection');
      if (stored) {
        const parsed = JSON.parse(stored) as SavedTalisman[];
        if (parsed.length > 0) {
          setCollection(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setCollection(DEMO_COLLECTION);
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

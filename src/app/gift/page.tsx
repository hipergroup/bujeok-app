'use client';

// ============================================================
// 부적 선물 받기 — /gift/?d={base64url}
// 보자기에 싸인 선물을 펼쳐 부적을 받는 경험.
// 정적 사이트라 선물 데이터는 전부 URL 에 담겨 온다 (src/lib/gift.ts).
// ============================================================

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TALISMANS } from '@/data/talismans';
import { decodeGift, giftHash } from '@/lib/gift';
import { generateTalismanSVG } from '@/lib/talisman-generator';
import type { SavedTalisman } from '@/lib/types';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import TraditionalButton from '@/components/hanji/TraditionalButton';
import { BackIcon, KnotMotif, CornerMotif, BrushStroke } from '@/components/hanji/motifs';

/** 부적함 저장 항목 — 선물 출처 표시를 덧붙인 SavedTalisman */
interface GiftedTalisman extends SavedTalisman {
  source: 'gift';
  fromName?: string;
}

function GiftReceive() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encoded = searchParams.get('d') ?? '';

  /* 페이로드 해석 — 잘못된 링크면 null */
  const payload = useMemo(() => decodeGift(encoded), [encoded]);
  const talisman = useMemo(
    () => (payload ? TALISMANS.find((t) => t.id === payload.t) ?? null : null),
    [payload]
  );

  /* 같은 링크는 부적함에 한 번만 담기도록 페이로드 해시로 id 를 만든다 */
  const savedId = useMemo(
    () => (encoded ? `gift-${giftHash(encoded)}` : ''),
    [encoded]
  );

  const [stage, setStage] = useState<'wrapped' | 'opened'>('wrapped');
  const [saved, setSaved] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState(false);

  /* 부적 SVG — 보낸 이의 메시지를 기원 문구로 담아 렌더링 */
  const svg = useMemo(() => {
    if (!payload || !talisman) return '';
    return generateTalismanSVG({
      type: talisman.id,
      style: 'traditional',
      background: 'hwangji',
      accent: talisman.colors[2],
      title: talisman.name,
      hanja: talisman.hanja,
      message: payload.m,
      mantra: talisman.mantra,
      symbols: [...talisman.design.patterns, ...talisman.design.symbols],
    });
  }, [payload, talisman]);

  /* 이미 간직한 선물인지 확인 */
  useEffect(() => {
    if (!savedId) return;
    try {
      const existing: SavedTalisman[] = JSON.parse(
        localStorage.getItem('bujeok-collection') || '[]'
      );
      if (existing.some((t) => t.id === savedId)) setAlreadySaved(true);
    } catch {
      // ignore
    }
  }, [savedId]);

  const handleKeep = () => {
    if (!payload || !talisman || alreadySaved || saved) return;
    const item: GiftedTalisman = {
      ...talisman,
      id: savedId,
      savedAt: new Date().toISOString(),
      note: payload.m || undefined,
      svg,
      source: 'gift',
      fromName: payload.f || undefined,
    };
    try {
      const existing: SavedTalisman[] = JSON.parse(
        localStorage.getItem('bujeok-collection') || '[]'
      );
      if (existing.some((t) => t.id === savedId)) {
        setAlreadySaved(true);
        return;
      }
      existing.unshift(item);
      localStorage.setItem('bujeok-collection', JSON.stringify(existing));
      setSaved(true);
    } catch {
      // storage full 등 — 조용히 무시
    }
  };

  return (
    <HanjiBackground>
      <TraditionalHeader
        left={
          <button onClick={() => router.push('/')} aria-label="홈으로">
            <BackIcon size={20} />
          </button>
        }
        title="부적 선물"
      />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pb-16">
        {!payload || !talisman ? (
          /* ── 잘못된/빈 링크: 따뜻한 빈 상태 ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center pt-16 text-center"
          >
            <KnotMotif size={56} className="mb-4 text-[var(--color-galsaek)] opacity-50" />
            <p className="font-serif-kr text-base font-bold text-[var(--color-meok)]">
              선물 보자기가 풀려 있어요
            </p>
            <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-[var(--color-galsaek)]">
              링크가 잘못되었거나 오래된 선물이에요.
              <br />
              대신, 소중한 사람에게 보낼 부적을
              <br />
              직접 만들어 보는 건 어떨까요?
            </p>
            <div className="mt-6 w-full max-w-[220px]">
              <TraditionalButton onClick={() => router.push('/talisman')}>
                나만의 부적 만들기
              </TraditionalButton>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {stage === 'wrapped' ? (
              /* ── Stage 1: 보자기에 싸인 선물 ── */
              <motion.div
                key="wrapped"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.06, rotate: 1.5 }}
                transition={{ duration: 0.45 }}
                className="flex w-full flex-col items-center pt-8"
              >
                <p className="mb-6 text-center font-serif-kr text-sm leading-relaxed text-[var(--color-galsaek)]">
                  {payload.f ? (
                    <>
                      <span className="font-bold text-[var(--color-meok)]">
                        {payload.f}
                      </span>
                      님이 당신을 위해
                      <br />
                      부적을 보냈어요
                    </>
                  ) : (
                    <>
                      누군가가 당신을 위해
                      <br />
                      부적을 보냈어요
                    </>
                  )}
                </p>

                {/* 보자기 카드 — 한지 봉투 + 매듭 */}
                <motion.button
                  onClick={() => setStage('opened')}
                  whileTap={{ scale: 0.96 }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                  className="relative flex h-[300px] w-[230px] flex-col items-center justify-center rounded-xl"
                  style={{
                    background:
                      'linear-gradient(160deg, #B93A32 0%, #A72B21 55%, #8E241C 100%)',
                    boxShadow:
                      '0 6px 24px rgba(122,74,52,0.35), inset 0 0 0 1px rgba(242,230,204,0.35)',
                  }}
                  aria-label="선물 열어보기"
                >
                  {/* 봉투 접힌 선 */}
                  <span
                    className="pointer-events-none absolute inset-3 rounded-lg"
                    style={{ border: '1px dashed rgba(242,230,204,0.5)' }}
                  />
                  <CornerMotif className="absolute left-4 top-4 text-[#F2E7CE] opacity-60" size={22} />
                  <CornerMotif className="absolute right-4 top-4 rotate-90 text-[#F2E7CE] opacity-60" size={22} />
                  <CornerMotif className="absolute bottom-4 left-4 -rotate-90 text-[#F2E7CE] opacity-60" size={22} />
                  <CornerMotif className="absolute bottom-4 right-4 rotate-180 text-[#F2E7CE] opacity-60" size={22} />

                  <KnotMotif size={64} className="text-[#F2E7CE]" />
                  <span className="mt-4 font-serif-kr text-lg font-bold tracking-widest text-[#F6EDD9]">
                    福
                  </span>
                </motion.button>

                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="mt-6 text-xs text-[var(--color-galsaek)]"
                >
                  살짝 눌러 보자기를 풀어보세요
                </motion.p>
              </motion.div>
            ) : (
              /* ── Stage 2·3: 부적 공개 + 메시지 ── */
              <motion.div
                key="opened"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex w-full flex-col items-center pt-2"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.7, type: 'spring', damping: 16 }}
                  className="mb-5 w-[220px] overflow-hidden rounded-lg"
                  style={{
                    aspectRatio: '360 / 560',
                    boxShadow:
                      '0 0 40px rgba(232,195,106,0.5), 0 4px 16px rgba(122,74,52,0.25)',
                  }}
                  /* svg 는 카탈로그 데이터 + 검증·이스케이프된 텍스트로만 생성됨 */
                  dangerouslySetInnerHTML={{ __html: svg }}
                />

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-5 w-full text-center"
                >
                  <h2 className="font-serif-kr text-xl font-bold text-[var(--color-meok)]">
                    「{talisman.name}」
                    <span className="ml-1.5 text-sm font-normal text-[var(--color-galsaek)]">
                      {talisman.hanja}
                    </span>
                  </h2>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-galsaek)]">
                    {talisman.description}
                  </p>

                  {/* 보낸 이의 메시지 카드 */}
                  {(payload.m || payload.f) && (
                    <div
                      className="mx-auto mt-4 max-w-xs rounded-lg px-4 py-3"
                      style={{
                        border: '1px solid rgba(122,74,52,0.35)',
                        backgroundColor: 'rgba(246,237,217,0.8)',
                      }}
                    >
                      {payload.m && (
                        <p className="font-serif-kr text-sm leading-relaxed text-[var(--color-meok)]">
                          “{payload.m}”
                        </p>
                      )}
                      {payload.f && (
                        <p className="mt-1.5 text-[11px] text-[var(--color-galsaek)] opacity-80">
                          보낸 이: {payload.f}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex justify-center text-[var(--color-meok)] opacity-50">
                    <BrushStroke width={90} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex w-full max-w-xs flex-col gap-3"
                >
                  {alreadySaved ? (
                    <div
                      className="w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]"
                      style={{ border: '1px solid rgba(107,125,99,0.5)' }}
                    >
                      이미 간직한 부적이에요
                    </div>
                  ) : saved ? (
                    <div
                      className="w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]"
                      style={{ border: '1px solid rgba(107,125,99,0.5)' }}
                    >
                      ✓ 부적함에 간직했어요
                    </div>
                  ) : (
                    <TraditionalButton onClick={handleKeep}>
                      내 부적함에 간직하기
                    </TraditionalButton>
                  )}

                  <TraditionalButton
                    variant="ghost"
                    onClick={() => router.push('/talisman')}
                  >
                    나도 부적 보내기
                  </TraditionalButton>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </HanjiBackground>
  );
}

export default function GiftPage() {
  return (
    <Suspense fallback={null}>
      <GiftReceive />
    </Suspense>
  );
}

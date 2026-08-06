'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import TraditionalButton from '@/components/hanji/TraditionalButton';
import TalismanPreview from '@/components/TalismanPreview';
import { SealLogo, KnotMotif } from '@/components/hanji/motifs';
import { parseGiftCode } from '@/lib/gift-link';
import { getTalismanById } from '@/data/talismans';
import { generateTalismanSVG } from '@/lib/talisman-generator';
import { pushTalismanToWidget } from '@/lib/widget-bridge';
import type { SavedTalisman } from '@/lib/types';

function GiftView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saved, setSaved] = useState(false);

  const gift = useMemo(() => parseGiftCode(searchParams.get('g')), [searchParams]);
  const talisman = useMemo(
    () => (gift ? getTalismanById(gift.t) : undefined),
    [gift]
  );

  /* 받은 부적이 이미 부적함에 있는지 (같은 문구·같은 종류면 중복으로 본다) */
  useEffect(() => {
    if (!gift || !talisman) return;
    try {
      const existing: SavedTalisman[] = JSON.parse(
        localStorage.getItem('bujeok-collection') || '[]'
      );
      if (existing.some((t) => t.giftKey === `${gift.t}|${gift.m}`)) {
        setSaved(true);
      }
    } catch {
      // ignore
    }
  }, [gift, talisman]);

  const params = gift && talisman
    ? {
        type: talisman.id,
        style: gift.s,
        background: gift.b,
        accent: gift.c,
        animal: gift.a,
        title: talisman.name,
        hanja: talisman.hanja,
        message: gift.m,
        mantra: talisman.mantra,
      }
    : null;

  const handleReceive = () => {
    if (!gift || !talisman || !params || saved) return;
    const svg = generateTalismanSVG(params);
    const received: SavedTalisman = {
      ...talisman,
      id: `gift-${Date.now()}`,
      savedAt: new Date().toISOString(),
      note: gift.m || undefined,
      // 같은 선물을 두 번 담지 않도록 표식을 남긴다
      giftKey: `${gift.t}|${gift.m}`,
      svg,
    };
    try {
      const existing: SavedTalisman[] = JSON.parse(
        localStorage.getItem('bujeok-collection') || '[]'
      );
      existing.unshift(received);
      localStorage.setItem('bujeok-collection', JSON.stringify(existing));
      setSaved(true);
      void pushTalismanToWidget(svg, {
        name: received.name,
        hanja: received.hanja,
        note: received.note,
        savedAt: received.savedAt,
      });
    } catch {
      // storage full 등
    }
  };

  /* ── 링크가 깨졌을 때 ── */
  if (!gift || !talisman || !params) {
    return (
      <HanjiBackground decorated>
        <TraditionalHeader title="부적 선물" showSeal />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-8 pb-20 text-center">
          <SealLogo size={48} />
          <p className="font-serif-kr text-base font-bold text-[var(--color-meok)]">
            부적을 펼칠 수 없어요
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-galsaek)]">
            링크가 온전하지 않은 것 같아요.
            <br />
            보내주신 분께 다시 받아보시겠어요?
          </p>
          <div className="mt-4 w-full max-w-[220px]">
            <TraditionalButton onClick={() => router.push('/')}>
              수호부 둘러보기
            </TraditionalButton>
          </div>
        </div>
      </HanjiBackground>
    );
  }

  const sender = gift.f?.trim();

  return (
    <HanjiBackground decorated>
      <TraditionalHeader title="부적 선물" showSeal />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pb-16">
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-1 text-center font-serif-kr text-sm text-[var(--color-galsaek)]"
        >
          {sender ? `${sender}님이 마음을 담아 보냈어요` : '누군가 마음을 담아 보냈어요'}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5 text-center font-brush text-[22px] text-[var(--color-meok)]"
        >
          당신을 위한 부적이 도착했습니다
        </motion.h1>

        {/* 매듭 장식 — 선물 매듭 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-2 text-[var(--color-juhong)]"
        >
          <KnotMotif size={34} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, type: 'spring', damping: 18 }}
          className="mb-5"
        >
          <TalismanPreview
            type={talisman.id}
            style={gift.s}
            message={gift.m}
            background={gift.b}
            accent={gift.c}
            animal={gift.a}
            title={talisman.name}
            hanja={talisman.hanja}
            mantra={talisman.mantra}
            size="lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6 text-center"
        >
          <h2 className="font-serif-kr text-lg font-bold text-[var(--color-meok)]">
            「{talisman.name}」
            <span className="ml-1.5 text-sm font-normal text-[var(--color-galsaek)]">
              {talisman.hanja}
            </span>
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-galsaek)]">
            {talisman.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex w-full max-w-xs flex-col gap-3"
        >
          {saved ? (
            <>
              <div
                className="w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]"
                style={{ border: '1px solid rgba(107,125,99,0.5)' }}
              >
                ✓ 부적함에 담았습니다
              </div>
              <TraditionalButton onClick={() => router.push('/collection')}>
                내 부적함 열기
              </TraditionalButton>
            </>
          ) : (
            <TraditionalButton onClick={handleReceive}>
              부적 받기
            </TraditionalButton>
          )}

          <button
            onClick={() => router.push('/talisman')}
            className="mt-1 text-center text-xs text-[var(--color-galsaek)] underline underline-offset-2 opacity-70"
          >
            나도 부적 만들어 보기
          </button>
        </motion.div>
      </div>
    </HanjiBackground>
  );
}

export default function GiftPage() {
  return (
    <Suspense fallback={null}>
      <GiftView />
    </Suspense>
  );
}

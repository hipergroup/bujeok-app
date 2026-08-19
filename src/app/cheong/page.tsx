'use client';

// ============================================================
// 부적 청하기 — /cheong
// ------------------------------------------------------------
// 부적은 남이 나를 위해 써줄 때 가장 영험하다는 전통을 루프로 만든다.
//  · ?d 없음  → 청하기: 기운을 골라 "부적 써줄래?" 링크를 만들어 공유
//  · ?d 있음  → 써주기: 친구가 기원 문구를 쓰고 낙관을 찍어 부적을
//               만들어 돌려보낸다 (기존 /gift 링크로 전달)
// 끝에는 "너도 부적 청해볼래?" 로 루프가 순환한다.
// ============================================================

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import TraditionalButton from '@/components/hanji/TraditionalButton';
import { BackIcon, KnotMotif, BrushStroke } from '@/components/hanji/motifs';
import { ENERGIES } from '@/data/energies';
import { getTalismanRecommendation } from '@/data/talismans';
import { generateTalismanSVG } from '@/lib/talisman-generator';
import { decodeCheong, buildCheongUrl } from '@/lib/cheong';
import { buildGiftUrl, GIFT_MESSAGE_MAX, GIFT_NAME_MAX } from '@/lib/gift';

const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';

/** 써주는 쪽에 제안하는 기원 문구 — 카테고리 공통, 붓을 드는 부담을 줄인다 */
const MESSAGE_HINTS = [
  '네 하루하루가 평안하기를',
  '바라는 일, 꼭 이루어지기를',
  '나쁜 기운은 비켜 가기를',
  '늘 건강하게, 오래 보자',
  '네 곁에 좋은 일만 머물기를',
];

function loadMyName(): string {
  try {
    const raw = localStorage.getItem('bujeok-user');
    if (raw) {
      const n = (JSON.parse(raw)?.name || '').trim();
      if (n) return n;
    }
    const p = localStorage.getItem('user_profile');
    if (p) return ((JSON.parse(p)?.name || '') as string).trim();
  } catch {
    // ignore
  }
  return '';
}

// ─── 청하기 (만드는 쪽) ─────────────────────────────────────

function CheongCreate() {
  const router = useRouter();
  const [name, setName] = useState(loadMyName);
  const [energyId, setEnergyId] = useState<string | null>(null);
  const [status, setStatus] = useState<'shared' | 'copied' | null>(null);

  const handleShare = async () => {
    if (!energyId) return;
    const url = buildCheongUrl({ v: 1, f: name.trim(), e: energyId });
    const energy = ENERGIES.find((e) => e.id === energyId);
    const text = `${name.trim() || '친구'}의 부탁 — 나를 위해 ${energy?.title ?? ''} 부적 한 장 써줄래? 🙏`;
    try {
      if (navigator.share) {
        await navigator.share({ title: '수호부 — 부적 청하기', text, url });
        setStatus('shared');
        return;
      }
    } catch {
      return; // 공유 시트 닫음
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      prompt('링크를 복사해 친구에게 보내주세요', url);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 text-center"
      >
        <p className="font-serif-kr text-[20px] leading-relaxed" style={{ color: MEOK }}>
          부적은 남이 써줄 때
          <br />
          가장 영험하다고 해요
        </p>
        <p className="mt-2 text-[12px] leading-relaxed" style={{ color: `${GALSAEK}BB` }}>
          예로부터 부적은 나를 아끼는 사람이 써주던 것.
          <br />
          어떤 마음의 부적을 청할지 고르고, 링크를 보내보세요.
        </p>
        <div className="mt-3 flex justify-center" style={{ color: `${MEOK}55` }}>
          <BrushStroke width={90} />
        </div>
      </motion.div>

      {/* 내 이름 */}
      <div className="hanji-card mt-5 rounded-2xl px-4 py-4">
        <label
          className="mb-1 block text-[11px] font-bold"
          style={{ color: `${GALSAEK}CC` }}
        >
          내 이름 — 청하는 사람
        </label>
        <input
          type="text"
          value={name}
          maxLength={GIFT_NAME_MAX}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 또는 별명"
          className="w-full rounded-lg border bg-transparent px-3 py-2 text-[13px] outline-none"
          style={{
            borderColor: 'rgba(122,74,52,0.30)',
            color: MEOK,
            background: 'rgba(255,255,255,0.35)',
          }}
        />
      </div>

      {/* 기운 선택 */}
      <div className="hanji-card mt-3 rounded-2xl px-4 py-4">
        <p className="mb-2.5 text-[11px] font-bold" style={{ color: `${GALSAEK}CC` }}>
          어떤 마음의 부적을 청할까요?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ENERGIES.map((e) => {
            const on = energyId === e.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setEnergyId(e.id)}
                className="rounded-xl px-3 py-2.5 text-left"
                style={{
                  border: on
                    ? `1.5px solid ${e.color}`
                    : '1px solid rgba(122,74,52,0.22)',
                  background: on ? `${e.color}0D` : 'rgba(255,255,255,0.3)',
                }}
              >
                <span
                  className="font-serif-kr text-[13px] font-bold"
                  style={{ color: on ? e.color : MEOK }}
                >
                  {e.title}
                  <span className="ml-1 text-[10px] font-normal opacity-60">
                    {e.hanja}
                  </span>
                </span>
                <span
                  className="mt-0.5 block text-[10.5px]"
                  style={{ color: `${GALSAEK}99` }}
                >
                  {e.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <TraditionalButton
          onClick={energyId ? handleShare : undefined}
          disabled={!energyId}
          className="rounded-lg"
        >
          🙏 부적 써달라고 청하기
        </TraditionalButton>
        <p
          className="mt-2 text-center text-[10.5px]"
          style={{ color: `${GALSAEK}88` }}
        >
          {status === 'copied'
            ? '링크를 복사했어요 — 친구에게 붙여넣어 보내주세요'
            : status === 'shared'
              ? '청을 보냈어요. 친구가 써준 부적이 곧 도착할 거예요'
              : '친구가 기원 문구를 써서 부적을 만들어 보내줘요'}
        </p>
      </div>

      <button
        onClick={() => router.push('/')}
        className="mt-6 text-center text-[11px] underline"
        style={{ color: `${GALSAEK}99` }}
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}

// ─── 써주기 (친구 쪽) ───────────────────────────────────────

function CheongWrite({ encoded }: { encoded: string }) {
  const router = useRouter();
  const payload = useMemo(() => decodeCheong(encoded), [encoded]);
  const energy = useMemo(
    () => (payload ? ENERGIES.find((e) => e.id === payload.e) ?? null : null),
    [payload]
  );

  const [myName, setMyName] = useState(loadMyName);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  /* 청한 기운에 맞는 부적 1종 — 카테고리 대표 추천 */
  const talisman = useMemo(
    () => (energy ? getTalismanRecommendation(energy.category, []) : null),
    [energy]
  );

  /* 부적 미리보기 — 친구의 기원 문구가 그대로 부적에 얹힌다 */
  const svg = useMemo(() => {
    if (!talisman || !energy) return '';
    return generateTalismanSVG({
      type: talisman.id,
      style: 'traditional',
      background: energy.paper,
      accent: energy.color,
      title: talisman.name,
      hanja: talisman.hanja,
      message: message.trim() || MESSAGE_HINTS[0],
      mantra: talisman.mantra,
      symbols: [...talisman.design.patterns, ...talisman.design.symbols],
    });
  }, [talisman, energy, message]);

  if (!payload || !energy || !talisman) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pt-16 text-center">
        <KnotMotif size={56} className="mb-4 text-[var(--color-galsaek)] opacity-50" />
        <p className="font-serif-kr text-base font-bold" style={{ color: MEOK }}>
          청하는 편지가 닿지 않았어요
        </p>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: GALSAEK }}>
          링크가 잘못되었거나 오래된 청이에요.
        </p>
        <div className="mt-6 w-full max-w-[220px]">
          <TraditionalButton onClick={() => router.push('/cheong')}>
            나도 부적 청해보기
          </TraditionalButton>
        </div>
      </div>
    );
  }

  const requester = payload.f || '친구';

  const handleSend = async () => {
    const url = buildGiftUrl({
      v: 1,
      t: talisman.id,
      m: (message.trim() || MESSAGE_HINTS[0]).slice(0, GIFT_MESSAGE_MAX),
      f: myName.trim().slice(0, GIFT_NAME_MAX),
      c: new Date().toISOString(),
    });
    const text = `${requester}님이 청한 부적을 써서 보냅니다 — 「${talisman.name}」 🙏`;
    try {
      if (navigator.share) {
        await navigator.share({ title: '수호부 — 부적 선물', text, url });
        setSent(true);
        return;
      }
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setSent(true);
      alert('부적 링크를 복사했어요. 청한 친구에게 붙여넣어 보내주세요!');
    } catch {
      prompt('링크를 복사해 친구에게 보내주세요', url);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2 text-center"
      >
        <p className="font-serif-kr text-[19px] leading-relaxed" style={{ color: MEOK }}>
          <span className="font-bold">{requester}</span>님이 당신에게
          <br />
          부적 한 장을 청했어요
        </p>
        <p className="mt-2 text-[12px]" style={{ color: `${GALSAEK}BB` }}>
          바라는 마음 — <b style={{ color: energy.color }}>{energy.title}</b>{' '}
          <span className="opacity-60">{energy.hanja}</span>
        </p>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: `${GALSAEK}88` }}>
          부적은 아끼는 사람이 써줄 때 가장 영험하대요.
          <br />한 줄의 기원이 부적이 됩니다.
        </p>
      </motion.div>

      {/* 부적 미리보기 */}
      <div className="mt-5 flex justify-center">
        <div
          className="w-[190px] overflow-hidden rounded-lg"
          style={{
            aspectRatio: '360 / 560',
            boxShadow: '0 4px 18px rgba(122,74,52,0.28)',
          }}
          /* svg 는 카탈로그 데이터 + 검증·이스케이프된 텍스트로만 생성됨 */
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {/* 기원 문구 쓰기 */}
      <div className="hanji-card mt-5 rounded-2xl px-4 py-4">
        <label className="mb-1 block text-[11px] font-bold" style={{ color: `${GALSAEK}CC` }}>
          {requester}님을 위한 기원 한 줄
        </label>
        <input
          type="text"
          value={message}
          maxLength={GIFT_MESSAGE_MAX}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={MESSAGE_HINTS[0]}
          className="w-full rounded-lg border bg-transparent px-3 py-2 text-[13px] outline-none"
          style={{
            borderColor: 'rgba(122,74,52,0.30)',
            color: MEOK,
            background: 'rgba(255,255,255,0.35)',
          }}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {MESSAGE_HINTS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setMessage(h)}
              className="rounded-full px-2.5 py-1 text-[10.5px]"
              style={{
                border: '1px solid rgba(122,74,52,0.25)',
                color: GALSAEK,
              }}
            >
              {h}
            </button>
          ))}
        </div>

        <label
          className="mb-1 mt-3 block text-[11px] font-bold"
          style={{ color: `${GALSAEK}CC` }}
        >
          내 이름 — 낙관으로 찍혀요 (선택)
        </label>
        <input
          type="text"
          value={myName}
          maxLength={GIFT_NAME_MAX}
          onChange={(e) => setMyName(e.target.value)}
          placeholder="이름 또는 별명"
          className="w-full rounded-lg border bg-transparent px-3 py-2 text-[13px] outline-none"
          style={{
            borderColor: 'rgba(122,74,52,0.30)',
            color: MEOK,
            background: 'rgba(255,255,255,0.35)',
          }}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {sent ? (
          <div
            className="w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]"
            style={{ border: '1px solid rgba(107,125,99,0.5)' }}
          >
            ✓ 부적을 보냈어요
          </div>
        ) : (
          <TraditionalButton onClick={handleSend} className="rounded-lg">
            ✍️ 이 부적 써서 보내기
          </TraditionalButton>
        )}
        <TraditionalButton variant="ghost" onClick={() => router.push('/cheong')}>
          나도 부적 청해보기
        </TraditionalButton>
      </div>

      <p className="mt-4 text-center text-[10.5px] leading-relaxed" style={{ color: `${GALSAEK}77` }}>
        보내기를 누르면 부적이 담긴 링크가 만들어져요.
        <br />
        {requester}님에게 그 링크를 보내면 부적함에 간직할 수 있어요.
      </p>
    </div>
  );
}

// ─── 라우트 ────────────────────────────────────────────────

function CheongPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encoded = searchParams.get('d') ?? '';

  return (
    <HanjiBackground>
      <TraditionalHeader
        left={
          <button onClick={() => router.push('/')} aria-label="홈으로">
            <BackIcon size={20} />
          </button>
        }
        title="부적 청하기"
      />
      {encoded ? <CheongWrite encoded={encoded} /> : <CheongCreate />}
    </HanjiBackground>
  );
}

export default function CheongPage() {
  return (
    <Suspense fallback={null}>
      <CheongPageInner />
    </Suspense>
  );
}

'use client';

// ============================================================
// 롤링 부적 — /rolling
// ------------------------------------------------------------
// 롤링페이퍼 × 부적. 수능·생일·면접을 앞둔 사람을 위해 여러 명이
// 한 부적에 기원을 겹쳐 쓴다. 링크가 손을 거칠수록 부적이 진해진다.
//  · ?d 없음 → 시작하기: 받는 이·앞둔 일·첫 기원을 쓰고 링크를 만든다
//  · ?d 있음 → 이어쓰기: 기원을 보태 다음 사람에게 넘기거나,
//              받는 이 본인이면 부적함에 간직한다
// 서버 없이 기원 전체가 URL 에 실려 다닌다 (src/lib/rolling.ts).
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
import { giftHash, GIFT_NAME_MAX } from '@/lib/gift';
import {
  decodeRolling,
  buildRollingUrl,
  ROLLING_MESSAGE_MAX,
  ROLLING_EVENT_MAX,
  ROLLING_MAX_WISHES,
  type RollingPayload,
} from '@/lib/rolling';
import type { SavedTalisman } from '@/lib/types';

const JUHONG = '#A72B21';
const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';

const EVENT_HINTS = ['수능', '생일', '면접', '이사', '출산', '개업', '여행'];

const inputStyle: React.CSSProperties = {
  borderColor: 'rgba(122,74,52,0.30)',
  color: MEOK,
  background: 'rgba(255,255,255,0.35)',
};
const inputCls =
  'w-full rounded-lg border bg-transparent px-3 py-2 text-[13px] outline-none';

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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="mb-1 block text-[11px] font-bold"
      style={{ color: `${GALSAEK}CC` }}
    >
      {children}
    </label>
  );
}

/** 공유 — navigator.share 우선, 클립보드 폴백. 성공 여부를 돌려준다 */
async function shareUrl(text: string, url: string): Promise<'shared' | 'copied' | null> {
  try {
    if (navigator.share) {
      await navigator.share({ title: '수호부 — 롤링 부적', text, url });
      return 'shared';
    }
  } catch {
    return null; // 공유 시트 닫음
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    prompt('링크를 복사해 보내주세요', url);
    return null;
  }
}

/** 부적 SVG — 받는 이와 쌓인 마음 수가 기원 문구가 된다 */
function useRollingSvg(p: RollingPayload | null) {
  return useMemo(() => {
    if (!p) return { svg: '', talisman: null as ReturnType<typeof getTalismanRecommendation> | null };
    const energy = ENERGIES.find((e) => e.id === p.e)!;
    const talisman = getTalismanRecommendation(
      energy.category,
      p.ev ? [p.ev] : []
    );
    const svg = generateTalismanSVG({
      type: talisman.id,
      style: 'traditional',
      background: energy.paper,
      accent: energy.color,
      title: talisman.name,
      hanja: talisman.hanja,
      message: `${p.to || '너'}의 ${p.ev || '앞날'}을 위해 ${p.ms.length}명의 마음을 모아`,
      mantra: talisman.mantra,
      symbols: [...talisman.design.patterns, ...talisman.design.symbols],
    });
    return { svg, talisman };
  }, [p]);
}

// ─── 시작하기 ──────────────────────────────────────────────

function RollingStart() {
  const router = useRouter();
  const [to, setTo] = useState('');
  const [ev, setEv] = useState('');
  const [energyId, setEnergyId] = useState(ENERGIES[0].id);
  const [myName, setMyName] = useState(loadMyName);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'shared' | 'copied' | null>(null);

  const canGo = to.trim() && message.trim();

  const handleShare = async () => {
    if (!canGo) return;
    const url = buildRollingUrl({
      v: 1,
      to: to.trim(),
      ev: ev.trim(),
      e: energyId,
      ms: [{ f: myName.trim(), m: message.trim() }],
    });
    const r = await shareUrl(
      `${to.trim()}의 ${ev.trim() || '앞날'}을 위한 롤링 부적 — 기원 한 줄 보태줄래? 🙏`,
      url
    );
    if (r) setStatus(r);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 text-center"
      >
        <p className="font-serif-kr text-[20px] leading-relaxed" style={{ color: MEOK }}>
          여럿의 마음을 모아
          <br />한 장의 부적으로
        </p>
        <p className="mt-2 text-[12px] leading-relaxed" style={{ color: `${GALSAEK}BB` }}>
          큰일을 앞둔 사람에게, 친구들의 기원을 겹쳐 쓴
          <br />
          롤링 부적을 만들어 보내요. 손을 거칠수록 진해져요.
        </p>
        <div className="mt-3 flex justify-center" style={{ color: `${MEOK}55` }}>
          <BrushStroke width={90} />
        </div>
      </motion.div>

      <div className="hanji-card mt-5 rounded-2xl px-4 py-4">
        <Label>누구를 위한 부적인가요?</Label>
        <input
          type="text"
          value={to}
          maxLength={GIFT_NAME_MAX}
          onChange={(e) => setTo(e.target.value)}
          placeholder="받는 사람 이름"
          className={inputCls}
          style={inputStyle}
        />

        <div className="mt-3">
          <Label>앞둔 일</Label>
          <input
            type="text"
            value={ev}
            maxLength={ROLLING_EVENT_MAX}
            onChange={(e) => setEv(e.target.value)}
            placeholder="수능, 생일, 면접 …"
            className={inputCls}
            style={inputStyle}
          />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {EVENT_HINTS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setEv(h)}
                className="rounded-full px-2.5 py-1 text-[10.5px]"
                style={{
                  border:
                    ev === h
                      ? `1px solid ${JUHONG}`
                      : '1px solid rgba(122,74,52,0.25)',
                  color: ev === h ? JUHONG : GALSAEK,
                }}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <Label>담을 기운</Label>
          <div className="flex flex-wrap gap-1.5">
            {ENERGIES.map((e) => {
              const on = energyId === e.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setEnergyId(e.id)}
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{
                    border: on
                      ? `1.5px solid ${e.color}`
                      : '1px solid rgba(122,74,52,0.25)',
                    color: on ? e.color : GALSAEK,
                    background: on ? `${e.color}0D` : 'transparent',
                  }}
                >
                  {e.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hanji-card mt-3 rounded-2xl px-4 py-4">
        <Label>첫 기원 한 줄 — 내가 시작해요</Label>
        <input
          type="text"
          value={message}
          maxLength={ROLLING_MESSAGE_MAX}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="네 앞길에 좋은 일만 가득하기를"
          className={inputCls}
          style={inputStyle}
        />
        <div className="mt-2">
          <Label>내 이름 (선택)</Label>
          <input
            type="text"
            value={myName}
            maxLength={GIFT_NAME_MAX}
            onChange={(e) => setMyName(e.target.value)}
            placeholder="이름 또는 별명"
            className={inputCls}
            style={inputStyle}
          />
        </div>
      </div>

      <div className="mt-5">
        <TraditionalButton
          onClick={canGo ? handleShare : undefined}
          disabled={!canGo}
          className="rounded-lg"
        >
          📜 롤링 부적 시작하기
        </TraditionalButton>
        <p className="mt-2 text-center text-[10.5px]" style={{ color: `${GALSAEK}88` }}>
          {status === 'copied'
            ? '링크를 복사했어요 — 다음 사람에게 붙여넣어 넘겨주세요'
            : status === 'shared'
              ? '넘겼어요! 링크가 돌수록 부적이 진해져요'
              : '만든 링크를 친구들에게 차례로 넘기고, 마지막에 받는 이에게 전달해요'}
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

// ─── 이어쓰기 / 전달 / 간직 ─────────────────────────────────

function RollingChain({ encoded }: { encoded: string }) {
  const router = useRouter();
  const payload = useMemo(() => decodeRolling(encoded), [encoded]);
  const { svg, talisman } = useRollingSvg(payload);

  const [myName, setMyName] = useState(loadMyName);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isRecipient, setIsRecipient] = useState(false);

  const savedId = useMemo(() => `rolling-${giftHash(encoded)}`, [encoded]);

  // Suspense 안에서 클라이언트 전용으로 렌더되므로 초기값에서 바로 읽는다
  const [alreadySaved, setAlreadySaved] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const existing: SavedTalisman[] = JSON.parse(
        localStorage.getItem('bujeok-collection') || '[]'
      );
      return existing.some((t) => t.id === `rolling-${giftHash(encoded)}`);
    } catch {
      return false;
    }
  });

  if (!payload || !talisman) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pt-16 text-center">
        <KnotMotif size={56} className="mb-4 text-[var(--color-galsaek)] opacity-50" />
        <p className="font-serif-kr text-base font-bold" style={{ color: MEOK }}>
          두루마리가 풀려 있어요
        </p>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: GALSAEK }}>
          링크가 잘못되었거나 오래된 롤링 부적이에요.
        </p>
        <div className="mt-6 w-full max-w-[220px]">
          <TraditionalButton onClick={() => router.push('/rolling')}>
            새 롤링 부적 시작하기
          </TraditionalButton>
        </div>
      </div>
    );
  }

  const full = payload.ms.length >= ROLLING_MAX_WISHES;

  const handleAdd = async () => {
    if (!message.trim() || full) return;
    const next: RollingPayload = {
      ...payload,
      ms: [...payload.ms, { f: myName.trim(), m: message.trim() }],
    };
    const url = buildRollingUrl(next);
    const r = await shareUrl(
      `${payload.to}의 ${payload.ev || '앞날'}을 위한 롤링 부적 — 이제 ${next.ms.length}명의 마음이 담겼어요. 기원 보태줄래? 🙏`,
      url
    );
    if (r)
      setStatus(
        r === 'copied'
          ? '내 기원을 보탠 새 링크를 복사했어요 — 다음 사람에게 붙여넣어 주세요'
          : '기원을 보태 넘겼어요!'
      );
  };

  const handleDeliver = async () => {
    const url = buildRollingUrl(payload);
    const r = await shareUrl(
      `${payload.to}에게 — ${payload.ms.length}명의 마음이 담긴 부적이 도착했어요 📜`,
      url
    );
    if (r)
      setStatus(
        r === 'copied'
          ? `링크를 복사했어요 — ${payload.to}님에게 붙여넣어 전해주세요`
          : `${payload.to}님에게 전달했어요`
      );
  };

  const handleKeep = () => {
    if (saved || alreadySaved) return;
    try {
      const item: SavedTalisman & { source: string; fromName?: string } = {
        ...talisman,
        id: savedId,
        sourceId: talisman.id,
        savedAt: new Date().toISOString(),
        note: payload.ms
          .map((w) => (w.f ? `${w.m} — ${w.f}` : w.m))
          .join(' · '),
        svg,
        source: 'rolling',
        fromName: payload.ms[0]?.f || undefined,
      };
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
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2 text-center"
      >
        <p className="font-serif-kr text-[19px] leading-relaxed" style={{ color: MEOK }}>
          <span className="font-bold">{payload.to}</span>
          {payload.ev ? `의 ${payload.ev}` : ''}을 위한
          <br />
          롤링 부적이 돌고 있어요
        </p>
        <p className="mt-1.5 text-[12px]" style={{ color: `${GALSAEK}BB` }}>
          지금까지 <b style={{ color: JUHONG }}>{payload.ms.length}명</b>의 마음이
          담겼어요
        </p>
      </motion.div>

      {/* 부적 미리보기 */}
      <div className="mt-4 flex justify-center">
        <div
          className="w-[180px] overflow-hidden rounded-lg"
          style={{
            aspectRatio: '360 / 560',
            boxShadow: '0 4px 18px rgba(122,74,52,0.28)',
          }}
          /* svg 는 카탈로그 데이터 + 검증·이스케이프된 텍스트로만 생성됨 */
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {/* 쌓인 기원들 */}
      <div className="hanji-card mt-4 rounded-2xl px-4 py-4">
        <p className="mb-2 text-[11px] font-bold" style={{ color: `${GALSAEK}CC` }}>
          쌓인 기원 {payload.ms.length}갈피
        </p>
        <div className="flex flex-col gap-1.5">
          {payload.ms.map((w, i) => (
            <p key={i} className="font-serif-kr text-[12.5px] leading-relaxed" style={{ color: MEOK }}>
              “{w.m}”
              {w.f && (
                <span className="ml-1 text-[10.5px]" style={{ color: `${GALSAEK}99` }}>
                  — {w.f}
                </span>
              )}
            </p>
          ))}
        </div>
      </div>

      {/* 기원 보태기 */}
      {!isRecipient && (
        <div className="hanji-card mt-3 rounded-2xl px-4 py-4">
          <Label>{full ? '기원이 가득 찼어요 (12갈피)' : '나도 기원 한 줄 보태기'}</Label>
          {!full && (
            <>
              <input
                type="text"
                value={message}
                maxLength={ROLLING_MESSAGE_MAX}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`${payload.to}를 위한 한 마디`}
                className={inputCls}
                style={inputStyle}
              />
              <input
                type="text"
                value={myName}
                maxLength={GIFT_NAME_MAX}
                onChange={(e) => setMyName(e.target.value)}
                placeholder="내 이름 (선택)"
                className={`${inputCls} mt-2`}
                style={inputStyle}
              />
            </>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2.5">
        {!isRecipient && !full && (
          <TraditionalButton
            onClick={message.trim() ? handleAdd : undefined}
            disabled={!message.trim()}
            className="rounded-lg"
          >
            ✍️ 기원 보태고 다음 사람에게 넘기기
          </TraditionalButton>
        )}
        {!isRecipient && (
          <TraditionalButton variant="ghost" onClick={handleDeliver}>
            📜 이대로 {payload.to}님에게 전달하기
          </TraditionalButton>
        )}

        {/* 받는 이 본인의 길 */}
        {!isRecipient ? (
          <button
            onClick={() => setIsRecipient(true)}
            className="mt-1 text-center text-[11px] underline"
            style={{ color: `${GALSAEK}99` }}
          >
            내가 {payload.to}이에요
          </button>
        ) : alreadySaved ? (
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
            ✓ {payload.ms.length}명의 마음을 부적함에 간직했어요
          </div>
        ) : (
          <TraditionalButton onClick={handleKeep} className="rounded-lg">
            🙏 {payload.ms.length}명의 마음, 부적함에 간직하기
          </TraditionalButton>
        )}

        {status && (
          <p className="text-center text-[10.5px]" style={{ color: `${GALSAEK}99` }}>
            {status}
          </p>
        )}

        <TraditionalButton variant="ghost" onClick={() => router.push('/rolling')}>
          나도 롤링 부적 시작하기
        </TraditionalButton>
      </div>
    </div>
  );
}

// ─── 라우트 ────────────────────────────────────────────────

function RollingPageInner() {
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
        title="롤링 부적"
      />
      {encoded ? <RollingChain encoded={encoded} /> : <RollingStart />}
    </HanjiBackground>
  );
}

export default function RollingPage() {
  return (
    <Suspense fallback={null}>
      <RollingPageInner />
    </Suspense>
  );
}

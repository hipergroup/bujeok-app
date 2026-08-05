'use client';

/**
 * 약장(藥欌) — 용신(用神) 처방 애니메이션
 *
 * 전통 한약방의 나무 서랍장을 SVG로 옮긴 컴포넌트.
 * 다섯 칸의 서랍이 오행(木火土金水)이고, 그중 내 용신 서랍만 열리며
 * 그 기운이 피어오른다.
 *
 * 팔레트는 한지 디자인 시스템(globals.css 한지 토큰)만 사용한다.
 *  - 갈색 #7A4A34 / 베이지 #DCC9A5 / 한지 #F2E6CC / 먹 #2E2E2E / 황 #DAA017
 *  - 다크테마 색(#0a0a1a, #D4A853)은 쓰지 않는다.
 *
 * 순수 SVG + framer-motion 만 사용 (외부 애니메이션 라이브러리 없음).
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from 'framer-motion';
import type { Oheng } from '@/data/saju';
import { OHENG_INFO, OHENG_ORDER } from '@/data/saju-interpretation';

// ─────────────────────────────────────────────
// 한지 팔레트
// ─────────────────────────────────────────────
const GALSAEK = '#7A4A34'; // 짙은 갈색 (나무 프레임)
const GALSAEK_DARK = '#5E3826'; // 그늘진 나무
const GALSAEK_DEEP = '#3B2317'; // 서랍 안쪽 (가장 어두운 곳)
const BEIGE = '#DCC9A5'; // 서랍 앞면
const BEIGE_DARK = '#C9B48D'; // 서랍 앞면 아래쪽
const HANJI = '#F2E6CC'; // 라벨 한지
const MEOK = '#2E2E2E'; // 먹 (한자)
const HWANG = '#DAA017'; // 황동 손잡이

// ─────────────────────────────────────────────
// 도면 좌표 (viewBox 220 × 296)
// ─────────────────────────────────────────────
const VB_W = 220;
const VB_H = 296;

const DRAWER_X = 25;
const DRAWER_W = 170;
const DRAWER_H = 30;
const DRAWER_GAP = 3.4;
const DRAWER_Y0 = 86;

/** 서랍 i(0=위)의 윗변 y */
const drawerY = (i: number) => DRAWER_Y0 + i * (DRAWER_H + DRAWER_GAP);

/** 열린 서랍이 앞(아래)으로 빠져나오는 정도 */
const OPEN_DY = 11;
const OPEN_SCALE = 1.06;

/** 큰 한자가 떠오를 자리 */
const HANJA_CX = 110;
const HANJA_CY = 32;

// ─────────────────────────────────────────────
// 타임라인 (초)
// ─────────────────────────────────────────────
const T_ENTER = 0;
const T_SCAN = 0.6;
const T_OPEN = 1.8;
const T_PARTICLE = 2.4;
const T_HANJA = 3.0;

// ─────────────────────────────────────────────
// 빛 입자 — 서버/클라이언트 동일하도록 고정 테이블 (8개)
// ─────────────────────────────────────────────
const PARTICLES = [
  { ox: -52, dx: -18, rise: -54, r: 2.2, delay: 0.0, dur: 1.5 },
  { ox: -30, dx: 10, rise: -72, r: 1.6, delay: 0.18, dur: 1.7 },
  { ox: -8, dx: -12, rise: -62, r: 2.6, delay: 0.06, dur: 1.4 },
  { ox: 12, dx: 16, rise: -80, r: 1.8, delay: 0.3, dur: 1.8 },
  { ox: 34, dx: -8, rise: -58, r: 2.4, delay: 0.12, dur: 1.5 },
  { ox: 54, dx: 20, rise: -68, r: 1.5, delay: 0.36, dur: 1.6 },
  { ox: -66, dx: -6, rise: -44, r: 1.4, delay: 0.44, dur: 1.3 },
  { ox: 68, dx: 8, rise: -48, r: 1.7, delay: 0.52, dur: 1.4 },
] as const;

// ─────────────────────────────────────────────
export interface YongsinCabinetProps {
  /** 용신 오행 — 이 서랍이 열린다 */
  yongsin: Oheng;
  /** 자동 재생 여부 (기본 true, 화면에 들어올 때 시작) */
  autoPlay?: boolean;
  /** 애니메이션 완료 콜백 */
  onComplete?: () => void;
  /** 가로 크기 (px) */
  width?: number;
  className?: string;
}

export default function YongsinCabinet({
  yongsin,
  autoPlay = true,
  onComplete,
  width = 240,
  className = '',
}: YongsinCabinetProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const reduced = useReducedMotion() ?? false;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(false);
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  const [started, setStarted] = useState(!autoPlay);
  const [runId, setRunId] = useState(0);

  // ── 화면에 들어오면 재생 ──────────────────────
  useEffect(() => {
    if (!autoPlay || started) return;
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      // 구형 환경 폴백 — 바로 재생
      const t = setTimeout(() => setStarted(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoPlay, started]);

  // ── 모션 최소화: 최종 상태만 보여주고 바로 완료 통보 ──
  useEffect(() => {
    if (!reduced || !started || doneRef.current) return;
    doneRef.current = true;
    completeRef.current?.();
  }, [reduced, started]);

  const handleFinish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    completeRef.current?.();
  }, []);

  const replay = useCallback(() => {
    if (reduced) return;
    doneRef.current = false;
    setRunId((n) => n + 1);
    setStarted(true);
  }, [reduced]);

  // ── 용신 정보 ────────────────────────────────
  const info = OHENG_INFO[yongsin];
  const color = info.color;
  const openIndex = Math.max(0, OHENG_ORDER.indexOf(yongsin));
  const openY = drawerY(openIndex);
  const openCy = openY + DRAWER_H / 2;

  /** 전환 헬퍼 — 모션 최소화면 즉시 최종 상태 */
  const T = (t: Record<string, unknown>): Transition =>
    (reduced ? { duration: 0 } : t) as Transition;

  const state = started ? 'show' : 'hidden';
  const height = Math.round((width * VB_H) / VB_W);

  // ── 변주 정의 ────────────────────────────────
  const cabinetV: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: T({ delay: T_ENTER, duration: 0.6, ease: [0.22, 1, 0.36, 1] }),
    },
  };

  const scanV: Variants = {
    hidden: { y: -46, opacity: 0 },
    show: {
      y: VB_H,
      opacity: [0, 0.9, 0.9, 0],
      transition: T({
        delay: T_SCAN,
        duration: 1.2,
        ease: 'easeInOut',
        opacity: { delay: T_SCAN, duration: 1.2, times: [0, 0.12, 0.8, 1] },
      }),
    },
  };

  const dimV: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 0.16,
      transition: T({ delay: T_OPEN + 0.05, duration: 0.5, ease: 'easeOut' }),
    },
  };

  const openDrawerV: Variants = {
    hidden: { y: 0, scale: 1 },
    show: {
      y: OPEN_DY,
      scale: OPEN_SCALE,
      transition: T({ delay: T_OPEN, duration: 0.75, ease: [0.16, 1, 0.3, 1] }),
    },
  };

  const cavityV: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: T({ delay: T_OPEN + 0.15, duration: 0.5 }),
    },
  };

  const glowV: Variants = {
    hidden: { opacity: 0, scale: 0.6 },
    show: {
      opacity: 0.55,
      scale: 1,
      transition: T({ delay: T_OPEN + 0.2, duration: 0.7, ease: 'easeOut' }),
    },
  };

  const hanjaV: Variants = {
    hidden: { opacity: 0, scale: 0.55, y: openCy - HANJA_CY },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: T({ delay: T_HANJA, duration: 0.7, ease: [0.16, 1, 0.3, 1] }),
    },
  };

  const hanjaGlowV: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    show: {
      opacity: 0.32,
      scale: 1,
      transition: T({ delay: T_HANJA + 0.05, duration: 0.8, ease: 'easeOut' }),
    },
  };

  // ── 서랍 하나 그리기 ─────────────────────────
  const renderDrawer = (o: Oheng, i: number, isOpen: boolean) => {
    const dy = drawerY(i);
    const cy = dy + DRAWER_H / 2;
    const oi = OHENG_INFO[o];

    /** 진맥 빛이 이 서랍을 훑고 지나가는 시각 */
    const flashV: Variants = {
      hidden: { opacity: 0 },
      show: {
        opacity: [0, 0.5, 0],
        transition: reduced
          ? { duration: 0 }
          : { delay: T_SCAN + 0.1 + i * 0.2, duration: 0.55, ease: 'easeInOut' },
      },
    };

    return (
      <motion.g
        key={o}
        variants={isOpen ? openDrawerV : undefined}
        style={
          isOpen
            ? { transformBox: 'fill-box', transformOrigin: 'center' }
            : undefined
        }
        filter={isOpen ? `url(#${uid}-liftShadow)` : undefined}
      >
        {/* 서랍 앞면 */}
        <rect
          x={DRAWER_X}
          y={dy}
          width={DRAWER_W}
          height={DRAWER_H}
          rx={2.5}
          fill={`url(#${uid}-drawerFace)`}
          stroke={GALSAEK_DARK}
          strokeWidth={0.9}
        />
        {/* 앞면 미세한 나무결 */}
        <path
          d={`M${DRAWER_X + 6} ${dy + 7.5}H${DRAWER_X + DRAWER_W - 6}
              M${DRAWER_X + 6} ${dy + 22.5}H${DRAWER_X + DRAWER_W - 6}`}
          stroke={GALSAEK}
          strokeWidth={0.4}
          strokeOpacity={0.13}
        />

        {/* 한지 라벨 */}
        <rect
          x={DRAWER_X + 14}
          y={dy + 6}
          width={34}
          height={18}
          rx={1.5}
          fill={HANJI}
          stroke={GALSAEK}
          strokeWidth={0.6}
          strokeOpacity={0.4}
        />
        <text
          x={DRAWER_X + 31}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-serif-kr"
          fontSize={13}
          fontWeight={700}
          fill={MEOK}
          fillOpacity={isOpen ? 1 : 0.86}
        >
          {oi.hanja}
        </text>

        {/* 손잡이 — 황동 */}
        <circle cx={110} cy={cy} r={7.6} fill={GALSAEK_DARK} fillOpacity={0.5} />
        <circle
          cx={110}
          cy={cy}
          r={4.6}
          fill={`url(#${uid}-brass)`}
          stroke={GALSAEK_DEEP}
          strokeWidth={0.5}
          strokeOpacity={0.5}
        />
        <circle cx={108.6} cy={cy - 1.4} r={1.2} fill={HANJI} fillOpacity={0.5} />

        {/* 오행 이름 (작게) */}
        <text
          x={DRAWER_X + DRAWER_W - 20}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={8}
          fill={MEOK}
          fillOpacity={0.42}
        >
          {o}
        </text>

        {/* 진맥 빛이 훑을 때 라벨이 잠깐 밝아짐 */}
        {!reduced && (
          <motion.rect
            variants={flashV}
            x={DRAWER_X + 14}
            y={dy + 6}
            width={34}
            height={18}
            rx={1.5}
            fill={HWANG}
          />
        )}
      </motion.g>
    );
  };

  const svg = (
    <motion.svg
      key={runId}
      width={width}
      height={height}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      initial="hidden"
      animate={state}
      role="img"
      aria-label="약장에서 나에게 맞는 기운을 고르는 모습"
      className={className}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        {/* 나무 프레임 */}
        <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={GALSAEK_DARK} />
          <stop offset="18%" stopColor={GALSAEK} />
          <stop offset="72%" stopColor={GALSAEK} />
          <stop offset="100%" stopColor={GALSAEK_DARK} />
        </linearGradient>
        {/* 서랍 앞면 */}
        <linearGradient id={`${uid}-drawerFace`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={HANJI} />
          <stop offset="42%" stopColor={BEIGE} />
          <stop offset="100%" stopColor={BEIGE_DARK} />
        </linearGradient>
        {/* 서랍장 안쪽 그늘 */}
        <linearGradient id={`${uid}-recess`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GALSAEK_DEEP} />
          <stop offset="100%" stopColor={GALSAEK_DARK} />
        </linearGradient>
        {/* 황동 손잡이 */}
        <radialGradient id={`${uid}-brass`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#F0CF6B" />
          <stop offset="55%" stopColor={HWANG} />
          <stop offset="100%" stopColor="#A67810" />
        </radialGradient>
        {/* 진맥 빛띠 */}
        <linearGradient id={`${uid}-scan`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={HANJI} stopOpacity="0" />
          <stop offset="50%" stopColor={HANJI} stopOpacity="0.5" />
          <stop offset="100%" stopColor={HANJI} stopOpacity="0" />
        </linearGradient>
        {/* 열린 서랍 안쪽 기운 */}
        <radialGradient id={`${uid}-inner`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={color} stopOpacity="0.85" />
          <stop offset="55%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={GALSAEK_DEEP} stopOpacity="0.9" />
        </radialGradient>
        {/* 피어오르는 광채 */}
        <radialGradient id={`${uid}-bloom`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="45%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>

        <clipPath id={`${uid}-bodyClip`}>
          <rect x={14} y={74} width={192} height={192} rx={4} />
        </clipPath>

        <filter id={`${uid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter
          id={`${uid}-liftShadow`}
          x="-20%"
          y="-40%"
          width="140%"
          height="200%"
        >
          <feDropShadow
            dx="0"
            dy="2.5"
            stdDeviation="2.2"
            floodColor={GALSAEK_DEEP}
            floodOpacity="0.4"
          />
        </filter>
      </defs>

      <motion.g variants={cabinetV}>
        {/* 바닥 그림자 */}
        <ellipse
          cx={110}
          cy={287}
          rx={84}
          ry={4.5}
          fill={MEOK}
          opacity={0.13}
          filter={`url(#${uid}-soft)`}
        />

        {/* ── 장 몸체 ───────────────────────── */}
        {/* 갓돌(윗판) */}
        <rect x={6} y={60} width={208} height={4} rx={2} fill={GALSAEK_DARK} />
        <rect
          x={9}
          y={63}
          width={202}
          height={11}
          rx={2}
          fill={`url(#${uid}-wood)`}
        />

        {/* 몸통 */}
        <rect
          x={14}
          y={74}
          width={192}
          height={192}
          rx={4}
          fill={`url(#${uid}-wood)`}
          stroke={GALSAEK_DEEP}
          strokeWidth={1}
          strokeOpacity={0.55}
        />
        {/* 나무결 (아주 미세하게) */}
        <g stroke={GALSAEK_DEEP} strokeOpacity={0.12} strokeWidth={0.5}>
          <path d="M17.5 80V260" />
          <path d="M202.5 80V260" />
          <path d="M14 168H21" />
          <path d="M199 168H206" />
        </g>

        {/* 서랍이 들어앉는 안쪽 */}
        <rect
          x={21}
          y={81}
          width={178}
          height={178}
          rx={2.5}
          fill={`url(#${uid}-recess)`}
        />

        {/* 다리 · 아래 받침 */}
        <rect x={14} y={266} width={192} height={7} rx={2} fill={GALSAEK_DARK} />
        <rect x={26} y={273} width={16} height={11} rx={2} fill={GALSAEK_DARK} />
        <rect x={178} y={273} width={16} height={11} rx={2} fill={GALSAEK_DARK} />

        {/* ── 열릴 칸의 안쪽 (서랍 뒤) ─────────── */}
        <motion.g variants={cavityV}>
          <rect
            x={DRAWER_X}
            y={openY}
            width={DRAWER_W}
            height={DRAWER_H}
            rx={2}
            fill={`url(#${uid}-inner)`}
          />
          <rect
            x={DRAWER_X}
            y={openY}
            width={DRAWER_W}
            height={3}
            fill={GALSAEK_DEEP}
            opacity={0.7}
          />
        </motion.g>

        {/* ── 닫힌 서랍들 ──────────────────────── */}
        {OHENG_ORDER.map((o, i) =>
          i === openIndex ? null : renderDrawer(o, i, false)
        )}

        {/* 다른 서랍은 살짝 어두워짐 */}
        <motion.rect
          variants={dimV}
          x={21}
          y={81}
          width={178}
          height={178}
          rx={2.5}
          fill={MEOK}
        />

        {/* ── 열리는 서랍 (가장 앞) ─────────────── */}
        {renderDrawer(yongsin, openIndex, true)}

        {/* ── 진맥 — 위에서 아래로 훑는 빛 ──────── */}
        {!reduced && (
          <g clipPath={`url(#${uid}-bodyClip)`}>
            <motion.rect
              variants={scanV}
              x={14}
              y={28}
              width={192}
              height={46}
              fill={`url(#${uid}-scan)`}
            />
          </g>
        )}

        {/* ── 기운이 피어오름 ─────────────────── */}
        <motion.ellipse
          variants={glowV}
          cx={110}
          cy={openY + 4}
          rx={78}
          ry={30}
          fill={`url(#${uid}-bloom)`}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />

        {!reduced &&
          PARTICLES.map((p, i) => (
            <motion.circle
              key={i}
              cx={110 + p.ox}
              cy={openY + 6}
              r={p.r}
              fill={color}
              variants={{
                hidden: { opacity: 0, scale: 0.3, x: 0, y: 0 },
                show: {
                  opacity: [0, 0.85, 0.6, 0],
                  scale: [0.3, 1, 0.9, 0.4],
                  x: [0, p.dx * 0.45, p.dx],
                  y: [0, p.rise * 0.5, p.rise],
                  transition: {
                    delay: T_PARTICLE + p.delay,
                    duration: p.dur,
                    ease: 'easeOut',
                  },
                },
              }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          ))}
      </motion.g>

      {/* ── 처방 완료 — 오행 한자가 떠오름 ─────── */}
      <motion.circle
        variants={hanjaGlowV}
        cx={HANJA_CX}
        cy={HANJA_CY}
        r={30}
        fill={`url(#${uid}-bloom)`}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
      <motion.g
        variants={hanjaV}
        onAnimationComplete={(def) => {
          if (def === 'show') handleFinish();
        }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <text
          x={HANJA_CX}
          y={HANJA_CY}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-serif-kr"
          fontSize={40}
          fontWeight={700}
          fill={color}
        >
          {info.hanja}
        </text>
        <text
          x={HANJA_CX}
          y={HANJA_CY + 26}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9.5}
          fill={MEOK}
          fillOpacity={0.5}
          letterSpacing={2}
        >
          {yongsin} · 용신
        </text>
      </motion.g>
    </motion.svg>
  );

  if (reduced) {
    return (
      <div ref={wrapRef} className="inline-flex">
        {svg}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="inline-flex">
      <button
        type="button"
        onClick={replay}
        aria-label="약장 처방 장면 다시 보기"
        className="cursor-pointer bg-transparent p-0 leading-none"
        style={{ border: 'none' }}
      >
        {svg}
      </button>
    </div>
  );
}

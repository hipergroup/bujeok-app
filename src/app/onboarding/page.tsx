'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import TraditionalButton from '@/components/hanji/TraditionalButton';
import {
  MountainMotif,
  KnotMotif,
  LotusMotif,
} from '@/components/hanji/motifs';
import { getTalismanById } from '@/data/talismans';
import { hasWidgetBridge, pushTalismanToWidget } from '@/lib/widget-bridge';
import hosinbuGift from '../../../public/talismans/hosinbu-gift.png';
import wordmarkFull from '../../../public/brand/wordmark.png';

// 만세력(24절기) 기반 정확한 사주 모듈
import {
  getSaju,
  getSajuYear,
  getOheng,
  getAnimal,
  isSamjae,
  type SajuResult,
  type Oheng,
} from '@/data/saju';
// 초보자용 사주 해석 데이터 (일간·오행·기둥 의미)
import {
  getSajuReading,
  PILLAR_MEANINGS,
  OHENG_INFO,
  type SajuReading,
} from '@/data/saju-interpretation';
// 용신(用神) — 나에게 필요한 기운
import { getYongsin, ohengLabel } from '@/data/yongsin';
import { saveProfile } from '@/lib/store';

// ─────────────────────────────────────────────
// Constants & Data
// ─────────────────────────────────────────────

// 한지 테마 팔레트 — 기존 변수명을 유지한 채 색만 교체 (알파 접미사 호환)
const GOLD = '#A72B21'; // 주홍 (포인트)
const GOLD_LIGHT = '#C4544A';
const GOLD_DARK = '#8A231B';
const BG_DARK = '#F2E6CC'; // 한지 바탕
const BG_CARD = '#F6EDD9';

/**
 * 12지시 선택지.
 * `value` 는 24시간제 실제 "시(hour)" 값이며, 각 지시(支時)의 대표 시각이다.
 * (사주 모듈은 23:00~00:59 를 자시로 처리하므로 자시는 0시로 둔다)
 * -1 = 시간 모름
 */
const HOUR_UNKNOWN = -1;
/** 시간을 모를 때 계산에 사용하는 기본 시각 (오시 정중앙) */
const DEFAULT_HOUR = 12;

const HOURS = [
  { label: '자시 (23:00~01:00)', value: 0 },
  { label: '축시 (01:00~03:00)', value: 2 },
  { label: '인시 (03:00~05:00)', value: 4 },
  { label: '묘시 (05:00~07:00)', value: 6 },
  { label: '진시 (07:00~09:00)', value: 8 },
  { label: '사시 (09:00~11:00)', value: 10 },
  { label: '오시 (11:00~13:00)', value: 12 },
  { label: '미시 (13:00~15:00)', value: 14 },
  { label: '신시 (15:00~17:00)', value: 16 },
  { label: '유시 (17:00~19:00)', value: 18 },
  { label: '술시 (19:00~21:00)', value: 20 },
  { label: '해시 (21:00~23:00)', value: 22 },
  { label: '모르겠어요', value: HOUR_UNKNOWN },
] as const;

/** 시간 미상이면 기본 시각으로 대체 */
function effectiveHour(hour: number): number {
  return hour === HOUR_UNKNOWN || hour < 0 ? DEFAULT_HOUR : hour;
}

// 밝은 한지 배경에서 읽히도록 명도를 낮춘 오행색
const OHENG_COLORS: Record<string, string> = {
  '목': '#3D8B40',
  '화': '#C0392B',
  '토': '#C08A12',
  '금': '#8D8778',
  '수': '#1F6FB5',
};

// ─────────────────────────────────────────────
// 한지 디자인 토큰 (globals.css의 --color-* 와 동일 값)
// ※ 다크테마 색(#0a0a1a, #D4A853)은 사용하지 않는다.
// ─────────────────────────────────────────────
const JUHONG = '#A72B21'; // --color-juhong 주홍·인주
const MEOK = '#2E2E2E'; // --color-meok 먹
const GALSAEK = '#7A4A34'; // --color-galsaek 짙은 갈색
const SSUK = '#6B7D63'; // --color-ssuk 쑥·세이지
const HWANG = '#DAA017'; // --color-hwang 겨자·황

/** 오행별 이모지 + 한 단어 의미 태그 (초보자용) */
const OHENG_META: Record<Oheng, { emoji: string; tag: string }> = {
  '목': { emoji: '🌱', tag: '성장' },
  '화': { emoji: '🔥', tag: '열정' },
  '토': { emoji: '⛰️', tag: '안정' },
  '금': { emoji: '⚔️', tag: '결단' },
  '수': { emoji: '💧', tag: '지혜' },
};

/** 기둥 의미 — 값이 비면 PILLAR_MEANINGS(년→월→일→시 순)에서 채운다 */
type PillarMeaningLike = (typeof PILLAR_MEANINGS)[number];

function pillarMeaningOf(
  meaning: PillarMeaningLike | undefined,
  index: number
): PillarMeaningLike | undefined {
  return meaning ?? PILLAR_MEANINGS[index];
}

/** 오행 균형 상태를 한 단어 한국어 태그로 */
const BALANCE_TAG: Record<'balanced' | 'concentrated' | 'polarized', string> = {
  balanced: '고르게 어우러짐',
  concentrated: '한쪽에 모임',
  polarized: '뚜렷하게 치우침',
};

/** 부족한 오행을 보충하는 방법 3가지 (해석 데이터에서 읽되, 없으면 기본 문구) */
const OHENG_BOOST_FALLBACK: Record<string, string[]> = {
  '목': ['초록색 소품이나 화분을 곁에 두기', '아침 산책으로 나무·숲의 기운 쐬기', '새로 배우는 일을 하나 시작하기'],
  '화': ['햇볕을 자주 쬐고 밝은 색 옷 입기', '사람들과 어울리는 자리를 만들기', '따뜻한 음식과 차를 챙겨 먹기'],
  '토': ['생활 리듬과 잠자는 시간을 일정하게', '집·책상 정리로 내 자리를 안정시키기', '흙을 만지는 취미(화분·도예) 갖기'],
  '금': ['금속 소품이나 흰색 계열 활용하기', '해야 할 일을 목록으로 정리해 끝내기', '규칙적인 운동으로 몸을 단단히'],
  '수': ['물을 자주 마시고 물가를 산책하기', '검정·남색 계열 소품 곁에 두기', '책을 읽고 생각을 글로 정리하기'],
};

function ohengBoostBy(name: string): string[] {
  const info = (OHENG_INFO as unknown as Record<string, { boostBy?: string[] } | undefined>)[name];
  const fromData = info?.boostBy;
  if (fromData && fromData.length > 0) return fromData;
  return OHENG_BOOST_FALLBACK[name] ?? [];
}

/** 섹션 머리표 — 번호 뱃지 + 제목 + 한자 부제 */
function SectionLabel({
  index,
  title,
  sub,
  term,
}: {
  index: number;
  title: string;
  /** 부연 설명 (쉬운 말) */
  sub?: string;
  /** 전문 용어 — 작고 흐리게 곁들임 */
  term?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
        style={{ background: JUHONG, color: '#F6EDD9' }}
      >
        {index}
      </span>
      <h2 className="font-serif-kr text-[15px] font-bold" style={{ color: MEOK }}>
        {title}
      </h2>
      {term && (
        <span className="text-[10px] opacity-50" style={{ color: MEOK }}>
          {term}
        </span>
      )}
      {sub && (
        <span className="text-[10.5px]" style={{ color: `${GALSAEK}99` }}>
          {sub}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Floating Particles Component
// ─────────────────────────────────────────────

function FloatingParticles({ count = 30 }: { count?: number }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.6 + 0.2,
    })), [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${GOLD_LIGHT}, ${GOLD}88)`,
            boxShadow: `0 0 ${p.size * 2}px ${GOLD}66`,
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity, p.opacity * 0.7, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Progress Indicator
// ─────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex items-center gap-2 px-6 pt-[max(1rem,env(safe-area-inset-top))]">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full overflow-hidden"
          style={{ background: `${GOLD}22` }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})` }}
            initial={{ width: '0%' }}
            animate={{ width: i < step ? '100%' : i === step ? '50%' : '0%' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      ))}
      <span
        className="ml-2 text-xs font-medium tabular-nums"
        style={{ color: `${GOLD}99` }}
      >
        {step + 1}/{total}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Scroll Wheel Picker
// ─────────────────────────────────────────────

function ScrollPicker({
  items,
  value,
  onChange,
  label,
  suffix = '',
}: {
  items: { label: string; value: number }[];
  value: number;
  onChange: (v: number) => void;
  label: string;
  suffix?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 40;
  const VISIBLE_ITEMS = 5;
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedIdx = items.findIndex(i => i.value === value);

  useEffect(() => {
    if (containerRef.current && selectedIdx >= 0) {
      containerRef.current.scrollTop = selectedIdx * ITEM_HEIGHT;
    }
  }, []);

  const handleScroll = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!containerRef.current) return;
      const idx = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      containerRef.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
      if (items[clamped]) onChange(items[clamped].value);
    }, 100);
  };

  return (
    <div className="flex flex-col items-center">
      <span className="mb-2 text-xs" style={{ color: `${GOLD}88` }}>{label}</span>
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          height: ITEM_HEIGHT * VISIBLE_ITEMS,
          width: '100%',
          background: `${GOLD}08`,
          border: `1px solid ${GOLD}18`,
        }}
      >
        {/* Selection highlight */}
        <div
          className="pointer-events-none absolute left-1 right-1 z-10 rounded-lg"
          style={{
            top: ITEM_HEIGHT * 2,
            height: ITEM_HEIGHT,
            background: `${GOLD}15`,
            border: `1px solid ${GOLD}30`,
          }}
        />
        {/* Fade masks */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20"
          style={{
            height: ITEM_HEIGHT * 2,
            background: `linear-gradient(to bottom, ${BG_DARK}, transparent)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
          style={{
            height: ITEM_HEIGHT * 2,
            background: `linear-gradient(to top, ${BG_DARK}, transparent)`,
          }}
        />
        <div
          ref={containerRef}
          className="h-full overflow-y-auto scrollbar-hide"
          style={{ scrollSnapType: 'y mandatory', paddingTop: ITEM_HEIGHT * 2, paddingBottom: ITEM_HEIGHT * 2 }}
          onScroll={handleScroll}
        >
          {items.map((item, i) => {
            const isSelected = item.value === value;
            return (
              <div
                key={i}
                className="flex items-center justify-center cursor-pointer transition-all duration-200"
                style={{
                  height: ITEM_HEIGHT,
                  scrollSnapAlign: 'center',
                  color: isSelected ? GOLD : `${GOLD}44`,
                  fontSize: isSelected ? '18px' : '14px',
                  fontWeight: isSelected ? 600 : 400,
                }}
                onClick={() => {
                  onChange(item.value);
                  containerRef.current?.scrollTo({
                    top: i * ITEM_HEIGHT,
                    behavior: 'smooth',
                  });
                }}
              >
                {item.label}{suffix}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Talisman SVG Component
// ─────────────────────────────────────────────

function HosinbuTalisman() {
  // 황지·주사 실사 호신부 (public/talismans/hosinbu-gift.png, 찢긴 가장자리 투명 처리)
  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: 220 }}
      initial={{ scale: 0.3, opacity: 0, rotateY: 90 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* 은은한 주홍빛 */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at center, ${GOLD}30 0%, transparent 70%)`,
          filter: 'blur(26px)',
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.04, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Image
        src={hosinbuGift}
        alt="호신부 부적"
        priority
        className="relative h-auto w-full"
        style={{
          filter:
            'drop-shadow(0 2px 6px rgba(122,74,52,0.35)) drop-shadow(0 10px 24px rgba(122,74,52,0.25))',
        }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Step 1: Welcome
// ─────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  const features = [
    {
      Motif: MountainMotif,
      color: '#1F3E63',
      text: '만세력 기반 정확한 사주 풀이',
    },
    {
      Motif: KnotMotif,
      color: '#A72B21',
      text: '마음을 담아 만드는 나만의 부적',
    },
    {
      Motif: LotusMotif,
      color: '#6B7D63',
      text: '오늘의 마음을 나누는 다정한 상담',
    },
  ];

  return (
    <motion.div
      className="flex min-h-full flex-col items-center justify-center px-6 py-[max(3rem,env(safe-area-inset-top))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <FloatingParticles count={24} />

      {/* 붓글씨 워드마크 (수호부 + 守護符印 낙관 + 태그라인) */}
      <motion.div
        className="relative z-10 mb-10 flex w-full flex-col items-center"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src={wordmarkFull}
          alt="수호부 — 오늘의 마음을 지키는 부적"
          priority
          className="w-[82%] max-w-[330px]"
        />
      </motion.div>

      {/* Features */}
      <div className="relative z-10 mb-12 flex w-full max-w-xs flex-col gap-3">
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="hanji-card flex items-center gap-4 rounded-xl px-5 py-4"
            initial={{ x: -32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{ color: f.color }}>
              <f.Motif size={26} />
            </span>
            <span className="font-serif-kr text-sm font-medium text-[var(--color-meok)]">
              {f.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.div
        className="relative z-10 w-full max-w-xs"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <TraditionalButton onClick={onNext}>시작하기</TraditionalButton>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Step 2: Birth Info
// ─────────────────────────────────────────────

interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  name: string;
}

function StepBirthInfo({
  info,
  onChange,
  onNext,
}: {
  info: BirthInfo;
  onChange: (info: BirthInfo) => void;
  onNext: () => void;
}) {
  const years = useMemo(() =>
    Array.from({ length: 61 }, (_, i) => ({
      label: `${1950 + i}`,
      value: 1950 + i,
    })), []);
  const months = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      label: `${i + 1}월`,
      value: i + 1,
    })), []);
  const days = useMemo(() =>
    Array.from({ length: 31 }, (_, i) => ({
      label: `${i + 1}일`,
      value: i + 1,
    })), []);

  // 입춘(立春) 기준 정확한 띠 — 만세력 모듈 사용
  const animal = useMemo(
    () => getAnimal(info.year, info.month, info.day, effectiveHour(info.hour)),
    [info.year, info.month, info.day, info.hour]
  );

  // 사주 기준 연도 (입춘 전 출생이면 전년도)
  const sajuYear = useMemo(
    () => getSajuYear(info.year, info.month, info.day, effectiveHour(info.hour)),
    [info.year, info.month, info.day, info.hour]
  );

  // Dynamic background hue based on selection
  const bgHue = useMemo(() => {
    const hueMap: Record<string, number> = { '목': 120, '화': 0, '토': 40, '금': 45, '수': 210 };
    return hueMap[animal.element] ?? 0;
  }, [animal.element]);

  return (
    <motion.div
      className="relative flex min-h-full flex-col px-6 pb-8 pt-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background overlay — 밝은 한지 위 은은한 오행빛 */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          background: `radial-gradient(ellipse at 50% 80%, hsla(${bgHue}, 45%, 55%, 0.12) 0%, transparent 60%)`,
        }}
        transition={{ duration: 1 }}
      />

      <FloatingParticles count={15} />

      <motion.h1
        className="relative z-10 mb-2 text-center text-2xl font-bold"
        style={{ color: GOLD }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        태어난 날을 알려주세요
      </motion.h1>
      <motion.p
        className="relative z-10 mb-6 text-center text-sm"
        style={{ color: `${GOLD}66` }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        정확한 사주 풀이를 위해 생년월일시를 입력하세요
      </motion.p>

      {/* Date pickers row */}
      <motion.div
        className="relative z-10 mb-4 grid grid-cols-3 gap-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <ScrollPicker
          items={years}
          value={info.year}
          onChange={(v) => onChange({ ...info, year: v })}
          label="년"
        />
        <ScrollPicker
          items={months}
          value={info.month}
          onChange={(v) => onChange({ ...info, month: v })}
          label="월"
        />
        <ScrollPicker
          items={days}
          value={info.day}
          onChange={(v) => onChange({ ...info, day: v })}
          label="일"
        />
      </motion.div>

      {/* Hour picker - full width */}
      <motion.div
        className="relative z-10 mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div
          className="rounded-2xl p-4"
          style={{
            background: `${GOLD}06`,
            border: `1px solid ${GOLD}12`,
          }}
        >
          <span className="mb-2 block text-center text-xs" style={{ color: `${GOLD}88` }}>
            태어난 시간
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {HOURS.map((h) => (
              <button
                key={h.value}
                className="rounded-lg px-3 py-1.5 text-xs transition-all duration-200"
                style={{
                  background: info.hour === h.value ? `${GOLD}25` : 'transparent',
                  color: info.hour === h.value ? GOLD : `${GOLD}55`,
                  border: `1px solid ${info.hour === h.value ? `${GOLD}40` : `${GOLD}10`}`,
                }}
                onClick={() => onChange({ ...info, hour: h.value })}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Name input */}
      <motion.div
        className="relative z-10 mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div
          className="rounded-2xl p-4"
          style={{ background: `${GOLD}06`, border: `1px solid ${GOLD}12` }}
        >
          <label className="mb-2 block text-center text-xs" style={{ color: `${GOLD}88` }}>
            이름 (선택사항 · 인장에 사용됩니다)
          </label>
          <input
            type="text"
            value={info.name}
            onChange={(e) => onChange({ ...info, name: e.target.value })}
            placeholder="이름을 입력하세요"
            className="w-full rounded-xl border bg-transparent px-4 py-3 text-center text-sm outline-none transition-colors duration-200"
            style={{
              borderColor: `${GOLD}20`,
              color: GOLD,
              caretColor: GOLD,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = `${GOLD}50`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = `${GOLD}20`;
            }}
          />
        </div>
      </motion.div>

      {/* Animal preview */}
      <motion.div
        className="relative z-10 mb-6 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-center gap-2" style={{ color: `${GOLD}77` }}>
          <span className="text-2xl">{animal.emoji}</span>
          <span className="text-sm">{sajuYear}년 {animal.name}띠</span>
        </div>
        {sajuYear !== info.year && (
          <p className="mt-1 text-[11px]" style={{ color: `${GOLD}55` }}>
            입춘(立春) 전 출생이라 사주상 {sajuYear}년생으로 봅니다
          </p>
        )}
      </motion.div>

      {/* Next button */}
      <motion.button
        className="relative z-10 mt-auto w-full rounded-2xl px-8 py-4 text-base font-bold tracking-wider"
        style={{
          background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
          color: '#F6EDD9',
          boxShadow: `0 4px 30px ${GOLD}40`,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        사주 풀이 보기
      </motion.button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Step 3: Saju Result
// ─────────────────────────────────────────────

function StepSajuResult({
  info,
  onNext,
}: {
  info: BirthInfo;
  onNext: () => void;
}) {
  const hourKnown = info.hour !== HOUR_UNKNOWN;
  const hour = effectiveHour(info.hour);

  // ── 만세력(24절기) 기반 정확한 사주팔자 ──
  const saju: SajuResult = useMemo(
    () => getSaju(info.year, info.month, info.day, hour),
    [info.year, info.month, info.day, hour]
  );

  // 입춘 기준 사주 연도 & 띠
  const sajuYear = useMemo(
    () => getSajuYear(info.year, info.month, info.day, hour),
    [info.year, info.month, info.day, hour]
  );
  const animal = useMemo(
    () => getAnimal(info.year, info.month, info.day, hour),
    [info.year, info.month, info.day, hour]
  );

  // ── 오행 균형 (0-100 점수) ──
  const oheng = useMemo(() => getOheng(saju), [saju]);
  const ohengEntries = Object.entries(oheng) as [Oheng, number][];
  const maxOheng = Math.max(...ohengEntries.map(([, v]) => v), 1);

  // ── 초보자용 해석 ──
  const reading: SajuReading = useMemo(
    () => getSajuReading(saju, oheng, animal),
    [saju, oheng, animal]
  );

  // ── 용신 (나에게 필요한 기운) — 요약만 노출 ──
  const yongsin = useMemo(() => getYongsin(saju, oheng), [saju, oheng]);
  const yongsinColor = OHENG_COLORS[yongsin.yongsin] ?? JUHONG;
  const yongsinInfo = OHENG_INFO[yongsin.yongsin];

  // ── 삼재 판별 (사주 기준 연도로 판정) ──
  const currentYear = new Date().getFullYear();
  const samjae = useMemo(() => isSamjae(currentYear, sajuYear), [currentYear, sajuYear]);

  // 기둥 상세 펼침 (탭한 기둥의 인덱스)
  const [openPillar, setOpenPillar] = useState<number | null>(null);
  const openPillarMeaning =
    openPillar !== null
      ? pillarMeaningOf(reading.pillars[openPillar]?.meaning, openPillar)
      : null;

  const ilgan = reading.ilgan;
  const ilganColor = OHENG_COLORS[ilgan.oheng] ?? JUHONG;

  // 부족한 오행 → 보충 방법
  const lacking = reading.oheng.lacking ?? [];
  const primaryLack = lacking[0];
  const boostBy = primaryLack ? ohengBoostBy(primaryLack) : [];

  return (
    <motion.div
      className="relative mx-auto flex min-h-full w-full max-w-md flex-col px-5 pb-8 pt-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <FloatingParticles count={12} />

      {/* Title */}
      <motion.div
        className="relative z-10 mb-5 flex flex-col items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <span className="mb-1 block" style={{ color: `${JUHONG}66` }}>
          <LotusMotif size={30} />
        </span>
        <h1 className="font-serif-kr text-2xl font-bold" style={{ color: JUHONG }}>
          당신의 사주 풀이
        </h1>
        <p className="mt-1 text-[11px]" style={{ color: `${GALSAEK}AA` }}>
          어려운 말은 빼고, 쉽게 풀어드릴게요
        </p>
      </motion.div>

      {/* ── 1. 헤드라인 카드 ───────────────────────── */}
      <motion.section
        className="hanji-card relative z-10 mb-5 overflow-hidden rounded-2xl px-5 py-6"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span
          className="pointer-events-none absolute -right-4 -top-3 block opacity-[0.07]"
          style={{ color: GALSAEK }}
        >
          <MountainMotif size={110} />
        </span>
        <div className="relative flex flex-col items-center text-center">
          <motion.span
            className="text-6xl"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 4 }}
          >
            {reading.animal.emoji || animal.emoji}
          </motion.span>
          <span
            className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold"
            style={{
              background: `${JUHONG}14`,
              color: JUHONG,
              border: `1px solid ${JUHONG}33`,
            }}
          >
            {reading.animal.animal || animal.name}띠 {reading.animal.hanja}
          </span>

          <p
            className="font-serif-kr mt-4 text-[19px] font-bold leading-[1.55]"
            style={{ color: MEOK }}
          >
            {reading.headline}
          </p>

          {(reading.animal.traits?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              {(reading.animal.traits ?? []).slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{
                    background: `${GALSAEK}12`,
                    color: GALSAEK,
                    border: `1px solid ${GALSAEK}22`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <p
            className="mt-3 text-[12.5px] leading-relaxed"
            style={{ color: `${MEOK}BB` }}
          >
            {reading.animal.description}
          </p>

          <div className="mt-4 h-px w-16" style={{ background: `${GALSAEK}33` }} />
          <p className="mt-3 text-[11px]" style={{ color: `${GALSAEK}99` }}>
            {sajuYear}년 {saju.yearStem.name}
            {saju.yearBranch.name}년생
            {sajuYear !== info.year && ' · 입춘(立春) 전 출생이라 사주상 전년도로 봅니다'}
          </p>
        </div>
      </motion.section>

      {/* ── 2. 나를 나타내는 글자 (일간) ─────────────── */}
      <motion.section
        className="hanji-card relative z-10 mb-5 rounded-2xl px-5 py-5"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        <SectionLabel index={1} title="나를 나타내는 글자" term="일간(日干)" />

        <div className="mt-4 flex flex-col items-center">
          <div
            className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl"
            style={{
              background: `${ilganColor}12`,
              border: `1.5px solid ${ilganColor}44`,
            }}
          >
            <span
              className="font-serif-kr text-[40px] font-bold leading-none"
              style={{ color: ilganColor }}
            >
              {ilgan.hanja}
            </span>
            <span className="mt-1 text-[11px]" style={{ color: `${MEOK}88` }}>
              {ilgan.gan} · {ilgan.oheng}
            </span>
          </div>

          <p
            className="font-serif-kr mt-4 text-center text-[17px] font-bold leading-snug"
            style={{ color: MEOK }}
          >
            당신은 <span style={{ color: ilganColor }}>{ilgan.emoji} {ilgan.symbol}</span> 같은 사람이에요
          </p>
          <span
            className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold"
            style={{
              background: `${ilganColor}18`,
              color: ilganColor,
              border: `1px solid ${ilganColor}33`,
            }}
          >
            #{ilgan.keyword}
          </span>

          <p
            className="mt-4 text-[13px] leading-[1.75]"
            style={{ color: `${MEOK}CC` }}
          >
            {ilgan.personality}
          </p>
        </div>

        {/* 강점 */}
        {(ilgan.strength?.length ?? 0) > 0 && (
          <div
            className="mt-5 rounded-xl px-4 py-3.5"
            style={{ background: `${SSUK}12`, border: `1px solid ${SSUK}2E` }}
          >
            <p className="mb-2.5 text-xs font-bold" style={{ color: SSUK }}>
              이런 점이 강해요
            </p>
            <ul className="flex flex-col gap-2">
              {(ilgan.strength ?? []).slice(0, 3).map((s, i) => (
                <motion.li
                  key={s}
                  className="flex items-start gap-2 text-[13px] leading-snug"
                  style={{ color: `${MEOK}DD` }}
                  initial={{ x: -8, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <span className="mt-[1px] shrink-0 font-bold" style={{ color: SSUK }}>
                    ✓
                  </span>
                  <span>{s}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* 주의 — 부드러운 톤 */}
        {(ilgan.caution?.length ?? 0) > 0 && (
          <div
            className="mt-3 rounded-xl px-4 py-3.5"
            style={{ background: `${HWANG}14`, border: `1px solid ${HWANG}33` }}
          >
            <p className="mb-2.5 text-xs font-bold" style={{ color: '#9A6F0F' }}>
              여기를 돌보면 더 좋아져요
            </p>
            <ul className="flex flex-col gap-2">
              {(ilgan.caution ?? []).slice(0, 2).map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-2 text-[13px] leading-snug"
                  style={{ color: `${MEOK}DD` }}
                >
                  <span className="mt-[1px] shrink-0" style={{ color: '#9A6F0F' }}>
                    ·
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.section>

      {/* ── 3. 사주팔자 네 기둥 ─────────────────────── */}
      <motion.section
        className="hanji-card relative z-10 mb-5 rounded-2xl px-4 py-5"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="px-1">
          <SectionLabel index={2} title="내 인생의 네 기둥" term="사주팔자(四柱八字)" />
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: `${MEOK}99` }}>
            태어난 해·달·날·시각을 각각 두 글자로 나타낸 거예요.
            기둥마다 인생의 다른 시기를 담당합니다. <strong>기둥을 눌러보세요.</strong>
          </p>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {reading.pillars.map((p, i) => {
            const m = pillarMeaningOf(p.meaning, i);
            const isDay = m?.key === 'day';
            const estimated = m?.key === 'hour' && !hourKnown;
            const open = openPillar === i;
            return (
              <motion.button
                key={m?.label ?? i}
                type="button"
                onClick={() => setOpenPillar(open ? null : i)}
                className="flex flex-col items-center gap-1.5 rounded-xl px-1 pb-2 pt-2.5 text-center"
                style={{
                  background: open ? `${JUHONG}0E` : 'transparent',
                  border: `1px solid ${open ? `${JUHONG}44` : 'transparent'}`,
                }}
                whileTap={{ scale: 0.96 }}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.75 + i * 0.1 }}
              >
                <div
                  className="relative flex w-full flex-col items-center gap-1 rounded-lg py-2.5"
                  style={{
                    background: isDay ? `${JUHONG}12` : `${GALSAEK}0D`,
                    border: `1.5px solid ${isDay ? `${JUHONG}66` : `${GALSAEK}26`}`,
                    opacity: estimated ? 0.5 : 1,
                  }}
                >
                  {isDay && (
                    <span
                      className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-[1px] text-[8.5px] font-bold"
                      style={{ background: JUHONG, color: '#F6EDD9' }}
                    >
                      나 자신
                    </span>
                  )}
                  <span
                    className="font-serif-kr text-xl font-bold leading-none"
                    style={{ color: OHENG_COLORS[p.gan.oheng] }}
                  >
                    {p.gan.name}
                  </span>
                  <div className="h-px w-5" style={{ background: `${GALSAEK}33` }} />
                  <span
                    className="font-serif-kr text-xl font-bold leading-none"
                    style={{ color: OHENG_COLORS[p.ji.oheng] }}
                  >
                    {p.ji.name}
                  </span>
                </div>
                <span
                  className="text-[11px] font-bold leading-none"
                  style={{ color: isDay ? JUHONG : `${MEOK}AA` }}
                >
                  {m?.label}
                  {estimated ? '*' : ''}
                </span>
                <span
                  className="text-[9.5px] leading-tight"
                  style={{ color: `${GALSAEK}AA` }}
                >
                  {m?.lifeArea}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* 기둥 상세 (탭 시 확장) */}
        <AnimatePresence initial={false} mode="wait">
          {openPillar !== null && openPillarMeaning && (
            <motion.div
              key={openPillar}
              className="mt-3 overflow-hidden rounded-xl px-4 py-3.5"
              style={{ background: `${JUHONG}0B`, border: `1px solid ${JUHONG}26` }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[13px] font-bold" style={{ color: JUHONG }}>
                  {openPillarMeaning.label}
                </span>
                <span
                  className="rounded-full px-2 py-[2px] text-[10px] font-medium"
                  style={{ background: `${JUHONG}18`, color: JUHONG }}
                >
                  {openPillarMeaning.ageRange}
                </span>
                <span className="text-[11px]" style={{ color: `${GALSAEK}CC` }}>
                  {openPillarMeaning.represents}
                </span>
              </div>
              <p
                className="mt-2 text-[13px] leading-relaxed"
                style={{ color: `${MEOK}CC` }}
              >
                {openPillarMeaning.simple}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-3 px-1 text-[10.5px] leading-relaxed" style={{ color: `${GALSAEK}99` }}>
          {hourKnown
            ? '24절기(만세력) 기준으로 산출되었습니다'
            : '* 태어난 시간을 몰라 오시(11~13시) 기준으로 추정했어요. 시주는 참고만 해주세요'}
        </p>
      </motion.section>

      {/* ── 4. 오행 균형 ────────────────────────────── */}
      <motion.section
        className="hanji-card relative z-10 mb-5 rounded-2xl px-4 py-5"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.75 }}
      >
        <div className="px-1">
          <SectionLabel index={3} title="내 안의 다섯 기운" term="오행(五行)" />
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: `${MEOK}99` }}>
            세상 모든 것은 나무·불·흙·쇠·물 다섯 기운으로 이루어져 있어요.
            내 사주에 어떤 기운이 많고 적은지 봅니다.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-5 gap-1.5">
          {ohengEntries.map(([name, score], i) => {
            const meta = OHENG_META[name];
            const isDominant = name === reading.oheng.dominant;
            const isLacking = lacking.includes(name);
            return (
              <div key={name} className="flex min-w-0 flex-col items-center gap-1">
                <span className="text-lg leading-none">{meta.emoji}</span>
                <span
                  className="text-[11px] font-bold tabular-nums"
                  style={{ color: OHENG_COLORS[name] }}
                >
                  {score}
                </span>
                <div className="flex h-[92px] w-full items-end justify-center">
                  <motion.div
                    className="w-full max-w-[36px] rounded-t-md"
                    style={{
                      background: `linear-gradient(to top, ${OHENG_COLORS[name]}DD, ${OHENG_COLORS[name]}77)`,
                      border: isDominant ? `1.5px solid ${OHENG_COLORS[name]}` : 'none',
                    }}
                    initial={{ height: 6 }}
                    animate={{ height: Math.max((score / maxOheng) * 88, 6) }}
                    transition={{ delay: 0.9 + i * 0.09, duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <span
                  className="font-serif-kr text-[13px] font-bold leading-none"
                  style={{ color: OHENG_COLORS[name] }}
                >
                  {name}
                </span>
                <span
                  className="rounded-full px-1.5 py-[1px] text-[9.5px] font-medium leading-tight"
                  style={{
                    background: `${OHENG_COLORS[name]}16`,
                    color: OHENG_COLORS[name],
                  }}
                >
                  {meta.tag}
                </span>
                {(isDominant || isLacking) && (
                  <span
                    className="text-[9px] font-bold leading-none"
                    style={{ color: isDominant ? JUHONG : `${GALSAEK}AA` }}
                  >
                    {isDominant ? '가장 강함' : '부족'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 요약 */}
        <div
          className="mt-5 rounded-xl px-4 py-3.5"
          style={{ background: `${GALSAEK}0D`, border: `1px solid ${GALSAEK}22` }}
        >
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-full px-2.5 py-[3px] text-[11px] font-bold"
              style={{
                background: `${OHENG_COLORS[reading.oheng.dominant] ?? JUHONG}1E`,
                color: OHENG_COLORS[reading.oheng.dominant] ?? JUHONG,
              }}
            >
              {OHENG_META[reading.oheng.dominant as Oheng]?.emoji} {reading.oheng.dominant} 기운 우세
            </span>
            <span
              className="rounded-full px-2.5 py-[3px] text-[11px] font-medium"
              style={{ background: `${MEOK}0E`, color: `${MEOK}AA` }}
            >
              균형 · {BALANCE_TAG[reading.oheng.balance] ?? '고르게 어우러짐'}
            </span>
          </div>
          <p className="text-[13px] leading-[1.75]" style={{ color: `${MEOK}CC` }}>
            {reading.oheng.summary}
          </p>
          {reading.oheng.advice && (
            <p
              className="mt-2 border-t pt-2 text-[12.5px] leading-relaxed"
              style={{ borderColor: `${GALSAEK}22`, color: `${MEOK}AA` }}
            >
              💡 {reading.oheng.advice}
            </p>
          )}
        </div>

        {/* 부족한 기운 보충 */}
        {primaryLack && (
          <motion.div
            className="mt-3 rounded-xl px-4 py-3.5"
            style={{
              background: `${OHENG_COLORS[primaryLack] ?? JUHONG}0E`,
              border: `1px solid ${OHENG_COLORS[primaryLack] ?? JUHONG}33`,
            }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <p
              className="text-[13px] font-bold"
              style={{ color: OHENG_COLORS[primaryLack] ?? JUHONG }}
            >
              ⚡ {lacking.slice(0, 2).join('·')} 기운을 보충하면 좋아요
            </p>
            {boostBy.length > 0 && (
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {boostBy.slice(0, 3).map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-[12.5px] leading-snug"
                    style={{ color: `${MEOK}CC` }}
                  >
                    <span
                      className="mt-[2px] shrink-0 text-[10px]"
                      style={{ color: OHENG_COLORS[primaryLack] ?? JUHONG }}
                    >
                      ●
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </motion.section>

      {/* ── 5. 용신 요약 (자세한 풀이는 사주 풀이 화면에서) ── */}
      <motion.section
        className="relative z-10 mb-5 rounded-2xl px-4 py-4"
        style={{
          background: `${yongsinColor}0D`,
          border: `1px solid ${yongsinColor}3D`,
        }}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.85 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full"
            style={{ background: yongsinColor }}
          >
            <span
              className="font-serif-kr text-[24px] font-bold leading-none"
              style={{ color: '#F6EDD9' }}
            >
              {yongsinInfo.hanja}
            </span>
            <span
              className="mt-[1px] text-[9.5px] font-bold leading-none"
              style={{ color: '#F6EDD9CC' }}
            >
              {yongsin.yongsin}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="rounded-full px-2 py-[2px] text-[10px] font-bold"
                style={{ background: `${yongsinColor}1E`, color: yongsinColor }}
              >
                나에게 필요한 기운
              </span>
              <span className="text-[10px] opacity-50" style={{ color: MEOK }}>
                용신(用神)
              </span>
              <span className="text-[10.5px]" style={{ color: `${GALSAEK}AA` }}>
                {yongsinInfo.season} · {yongsinInfo.direction}
              </span>
            </div>
            <p
              className="font-serif-kr mt-1.5 text-[14.5px] font-bold leading-snug"
              style={{ color: MEOK }}
            >
              지금 나에게 가장 잘 맞는 기운은{' '}
              <span style={{ color: yongsinColor }}>{ohengLabel(yongsin.yongsin)}</span>
              이에요
            </p>
          </div>
        </div>

        <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: `${MEOK}BB` }}>
          {yongsin.headline}
        </p>

        <p className="mt-2.5 text-[11px] leading-relaxed" style={{ color: `${GALSAEK}AA` }}>
          내 기운의 세기와 계절·온도까지 살핀 자세한 풀이, 생활 속에서 이 기운을 채우는
          방법은 <strong>내 사주 풀이</strong>에 담아뒀어요.
        </p>
      </motion.section>

      {/* ── 6. 삼재 경고 ────────────────────────────── */}
      {samjae.is && (
        <motion.section
          className="relative z-10 mb-5 rounded-2xl px-4 py-4"
          style={{
            background: 'rgba(167, 43, 33, 0.07)',
            border: `1px solid ${JUHONG}3D`,
          }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-start gap-3">
            <motion.span
              className="text-2xl leading-none"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
            >
              ⚠️
            </motion.span>
            <div>
              <p className="mb-1 text-sm font-bold" style={{ color: JUHONG }}>
                올해는 삼재(三災)의 해입니다
                {samjae.type ? ` · ${samjae.type}` : ''}
              </p>
              <p className="text-[12.5px] leading-relaxed" style={{ color: `${MEOK}AA` }}>
                삼재는 9년에 한 번, 3년간 조심해야 하는 시기예요. 너무 걱정하진 마세요.
                삼재의 기운을 막아주는 <strong>삼재부</strong>를 부적함에서 확인해보세요.
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── 7. 하단 안내 ────────────────────────────── */}
      <motion.div
        className="relative z-10 mb-5 flex items-center justify-center gap-2 rounded-xl px-4 py-3"
        style={{ background: `${GALSAEK}0D`, border: `1px dashed ${GALSAEK}33` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="block shrink-0" style={{ color: `${GALSAEK}99` }}>
          <KnotMotif size={18} />
        </span>
        <p className="text-[12px] leading-snug" style={{ color: `${GALSAEK}CC` }}>
          더 자세한 풀이는 <strong>마이페이지</strong>에서 언제든 다시 볼 수 있어요
        </p>
      </motion.div>

      {/* Next button */}
      <motion.button
        className="relative z-10 mt-auto w-full rounded-2xl px-8 py-4 text-base font-bold tracking-wider"
        style={{
          background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
          color: '#F6EDD9',
          boxShadow: `0 4px 20px ${GOLD}33`,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        첫 부적 받기
      </motion.button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Step 4: First Talisman Gift
// ─────────────────────────────────────────────

function StepTalismanGift({
  info,
  onComplete,
}: {
  info: BirthInfo;
  onComplete: () => void;
}) {
  const [saved, setSaved] = useState(false);
  /* 네이티브 앱에서만: 저장 후 "위젯에도 담을까요?" 질문 단계 */
  const [askWidget, setAskWidget] = useState(false);
  const [widgetDone, setWidgetDone] = useState(false);
  const giftSvgRef = useRef<string | null>(null);

  const handleSave = useCallback(async () => {
    const hour = effectiveHour(info.hour);
    const hourKnown = info.hour !== HOUR_UNKNOWN;

    // 만세력 기반 사주 산출 (홈 화면 등에서 재사용)
    const saju = getSaju(info.year, info.month, info.day, hour);
    const sajuYear = getSajuYear(info.year, info.month, info.day, hour);
    const animal = getAnimal(info.year, info.month, info.day, hour);
    const oheng = getOheng(saju);
    const samjae = isSamjae(new Date().getFullYear(), sajuYear);
    const now = new Date().toISOString();
    const displayName = info.name.trim() || '수호자';

    const userData = {
      birth: {
        year: info.year,
        month: info.month,
        day: info.day,
        hour, // 0-23 실제 시각
        hourKnown,
      },
      name: info.name,
      animal: animal.name,
      animalEmoji: animal.emoji,
      sajuYear,
      saju: {
        year: saju.yearStem.name + saju.yearBranch.name,
        month: saju.monthStem.name + saju.monthBranch.name,
        day: saju.dayStem.name + saju.dayBranch.name,
        hour: saju.hourStem.name + saju.hourBranch.name,
      },
      oheng,
      samjae,
      onboardingCompleted: true,
      firstTalisman: {
        type: 'hosinbu',
        name: '호신부',
        receivedAt: now,
      },
      talismans: [
        {
          id: 'hosinbu-gift',
          type: 'hosinbu',
          name: '호신부 (護身符)',
          description: '몸과 마음을 보호하는 부적',
          receivedAt: now,
          isGift: true,
        },
      ],
    };
    localStorage.setItem('bujeok-user', JSON.stringify(userData));

    // 홈 화면(src/app/page.tsx)이 참조하는 키
    localStorage.setItem(
      'user_profile',
      JSON.stringify({
        name: displayName,
        animal: animal.name,
        animalEmoji: animal.emoji,
        element: animal.element,
        birthYear: info.year,
        birthMonth: info.month,
        birthDay: info.day,
        birthHour: hour,
        birthHourKnown: hourKnown,
        sajuYear,
        saju: userData.saju,
        oheng,
        samjae,
      })
    );
    localStorage.setItem('onboarding_completed', 'true');

    // 선물 호신부를 부적함(bujeok-collection)에도 저장 — 수집 카운트·위젯에 반영.
    // 이미지는 data URI로 인라인해 재배포 후에도 깨지지 않게 한다.
    try {
      const list: { id?: string; svg?: string }[] = JSON.parse(
        localStorage.getItem('bujeok-collection') || '[]'
      );
      const existing = list.find((t) => t.id === 'hosinbu-gift');
      if (existing) {
        // 재온보딩: 이미 담긴 호신부를 재사용해 위젯 질문은 그대로 보여준다
        giftSvgRef.current = existing.svg ?? null;
      } else {
        const catalog = getTalismanById('protect-04'); // 43종 카탈로그의 호신부
        const blob = await (await fetch(hosinbuGift.src)).blob();
        const dataUri = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result as string);
          fr.onerror = () => reject(fr.error);
          fr.readAsDataURL(blob);
        });
        const giftSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 560"><image href="${dataUri}" x="0" y="0" width="360" height="560" preserveAspectRatio="xMidYMid meet"/></svg>`;
        const entry = {
          ...catalog,
          id: 'hosinbu-gift',
          savedAt: now,
          note: '몸과 마음의 평안을 지켜드릴게요',
          svg: giftSvg,
        };
        localStorage.setItem(
          'bujeok-collection',
          JSON.stringify([entry, ...list])
        );
        giftSvgRef.current = giftSvg; // 위젯 담기 질문에서 사용
      }
    } catch {
      // 부적함 저장이 실패해도 온보딩 완료는 막지 않는다
    }

    // 공용 스토어(bujeok_app_v1)에도 프로필 반영
    saveProfile({
      name: displayName,
      birthYear: info.year,
      birthMonth: info.month,
      birthDay: info.day,
      birthHour: hour,
      birthHourKnown: hourKnown,
      animal: animal.name,
      completedOnboarding: true,
    });

    setSaved(true);

    // 네이티브 앱(위젯 브릿지 존재)이면 위젯 담기를 물어보고, 아니면 바로 홈으로
    if (hasWidgetBridge() && giftSvgRef.current) {
      setTimeout(() => setAskWidget(true), 900);
    } else {
      setTimeout(() => {
        onComplete();
      }, 1200);
    }
  }, [info, onComplete]);

  /* 위젯에 담기 / 나중에 하기 */
  const handleWidgetYes = useCallback(() => {
    if (giftSvgRef.current) {
      void pushTalismanToWidget(giftSvgRef.current, {
        name: '호신부',
        hanja: '護身符',
        savedAt: new Date().toISOString(),
      });
    }
    setWidgetDone(true);
    setTimeout(() => {
      onComplete();
    }, 2600);
  }, [onComplete]);

  const handleWidgetLater = useCallback(() => {
    setTimeout(() => {
      onComplete();
    }, 250);
  }, [onComplete]);

  return (
    <motion.div
      className="relative flex min-h-full flex-col items-center justify-center px-6 pb-8 pt-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <FloatingParticles count={35} />

      {/* Title */}
      <motion.div
        className="relative z-10 mb-2 text-center"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-2xl font-bold" style={{ color: GOLD }}>
          환영합니다!
        </h1>
      </motion.div>
      <motion.p
        className="relative z-10 mb-8 text-center text-base"
        style={{ color: `${GOLD}AA` }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        첫 부적을 선물합니다
      </motion.p>

      {/* Talisman with effects */}
      <motion.div
        className="relative z-10 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {/* Radial light rays */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 400,
            height: 400,
            background: `conic-gradient(from 0deg, transparent, ${GOLD}15, transparent, ${GOLD}10, transparent, ${GOLD}15, transparent)`,
            borderRadius: '50%',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <HosinbuTalisman />
      </motion.div>

      {/* Talisman name */}
      <motion.div
        className="relative z-10 mb-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-lg font-bold" style={{ color: GOLD }}>
          호신부 (護身符)
        </p>
        <p className="mt-1 text-xs" style={{ color: `${GOLD}77` }}>
          몸과 마음을 보호하여 재앙을 막아주는 부적
        </p>
      </motion.div>

      <div className="flex-1" />

      {/* Save button ↔ 위젯 담기 질문 카드 */}
      <AnimatePresence mode="wait">
        {!askWidget ? (
          <motion.button
            key="save-btn"
            className="relative z-10 w-full max-w-xs rounded-2xl px-8 py-4 text-base font-bold tracking-wider"
            style={{
              background: saved
                ? `linear-gradient(135deg, #4CAF50, #388E3C)`
                : `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
              color: '#F6EDD9',
              boxShadow: saved ? `0 4px 30px #4CAF5040` : `0 4px 30px ${GOLD}40`,
            }}
            whileHover={!saved ? { scale: 1.02 } : {}}
            whileTap={!saved ? { scale: 0.97 } : {}}
            onClick={!saved ? handleSave : undefined}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ delay: saved ? 0 : 1.8 }}
            disabled={saved}
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  ✓ 부적함에 담았습니다
                </motion.span>
              ) : (
                <motion.span
                  key="save"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  부적함에 담기
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ) : (
          <motion.div
            key="widget-ask"
            className="hanji-card relative z-10 w-full max-w-xs rounded-2xl px-6 py-5 text-center"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {!widgetDone ? (
              <>
                <p className="font-serif-kr text-base font-bold text-[var(--color-meok)]">
                  홈 화면 위젯에도 담아드릴까요?
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-galsaek)]">
                  부적은 몸에 지니고 다닐 때 힘을 낸다고 해요.
                  <br />
                  위젯에 담아두면 휴대폰을 열 때마다
                  <br />
                  호신부가 당신의 하루를 지켜드려요.
                </p>
                <button
                  className="mt-4 w-full rounded-xl px-6 py-3 text-sm font-bold tracking-wider"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
                    color: '#F6EDD9',
                    boxShadow: `0 4px 20px ${GOLD}40`,
                  }}
                  onClick={handleWidgetYes}
                >
                  위젯에 담기
                </button>
                <button
                  className="mt-2 w-full py-2 text-xs text-[var(--color-galsaek)] opacity-80"
                  onClick={handleWidgetLater}
                >
                  나중에 할게요
                </button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-serif-kr text-base font-bold text-[var(--color-meok)]">
                  ✓ 위젯에 담았어요
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-galsaek)]">
                  홈 화면을 길게 눌러 &lsquo;수호부&rsquo; 위젯을 추가하면
                  <br />
                  바로 만날 수 있어요. 시간이 흐르면 종이가
                  <br />
                  조금씩 낡아가요 — 당신을 지켜온 흔적이에요.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Main Onboarding Page
// ─────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [birthInfo, setBirthInfo] = useState<BirthInfo>({
    year: 1990,
    month: 1,
    day: 1,
    hour: -1,
    name: '',
  });

  const totalSteps = 4;

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }, []);

  // window.location.href = '/'는 GitHub Pages(basePath) 밖으로 나가 404가 난다.
  // 홈(/)에 임베드된 경우엔 같은 경로라 replace가 무반응이므로 reload로 홈을 다시 그린다.
  const handleComplete = useCallback(() => {
    if (window.location.pathname.includes('/onboarding')) {
      router.replace('/');
    } else {
      window.location.reload();
    }
  }, [router]);

  return (
    <div
      className="hanji-surface relative flex min-h-dvh flex-col overflow-x-hidden text-[var(--color-meok)]"
    >
      {/* Progress bar — hidden on step 0 (welcome) */}
      {step > 0 && <ProgressBar step={step} total={totalSteps} />}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          className="flex min-h-dvh flex-col"
        >
          {step === 0 && <StepWelcome onNext={goNext} />}
          {step === 1 && (
            <StepBirthInfo
              info={birthInfo}
              onChange={setBirthInfo}
              onNext={goNext}
            />
          )}
          {step === 2 && <StepSajuResult info={birthInfo} onNext={goNext} />}
          {step === 3 && (
            <StepTalismanGift info={birthInfo} onComplete={handleComplete} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Scrollbar hide style */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

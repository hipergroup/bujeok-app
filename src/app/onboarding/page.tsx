'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────
// Constants & Data
// ─────────────────────────────────────────────

const GOLD = '#D4A853';
const GOLD_LIGHT = '#E8C97A';
const GOLD_DARK = '#B8912F';
const BG_DARK = '#0A0A12';
const BG_CARD = '#13131F';

const ANIMALS = [
  { name: '쥐', emoji: '🐀', element: '수' },
  { name: '소', emoji: '🐂', element: '토' },
  { name: '호랑이', emoji: '🐅', element: '목' },
  { name: '토끼', emoji: '🐇', element: '목' },
  { name: '용', emoji: '🐉', element: '토' },
  { name: '뱀', emoji: '🐍', element: '화' },
  { name: '말', emoji: '🐎', element: '화' },
  { name: '양', emoji: '🐑', element: '토' },
  { name: '원숭이', emoji: '🐒', element: '금' },
  { name: '닭', emoji: '🐓', element: '금' },
  { name: '개', emoji: '🐕', element: '토' },
  { name: '돼지', emoji: '🐖', element: '수' },
] as const;

const HOURS = [
  { label: '자시 (23:00~01:00)', value: 0 },
  { label: '축시 (01:00~03:00)', value: 1 },
  { label: '인시 (03:00~05:00)', value: 2 },
  { label: '묘시 (05:00~07:00)', value: 3 },
  { label: '진시 (07:00~09:00)', value: 4 },
  { label: '사시 (09:00~11:00)', value: 5 },
  { label: '오시 (11:00~13:00)', value: 6 },
  { label: '미시 (13:00~15:00)', value: 7 },
  { label: '신시 (15:00~17:00)', value: 8 },
  { label: '유시 (17:00~19:00)', value: 9 },
  { label: '술시 (19:00~21:00)', value: 10 },
  { label: '해시 (21:00~23:00)', value: 11 },
  { label: '모르겠어요', value: -1 },
] as const;

const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;

const OHENG_COLORS: Record<string, string> = {
  '목': '#4CAF50',
  '화': '#F44336',
  '토': '#FFC107',
  '금': '#E0E0E0',
  '수': '#2196F3',
};

const OHENG_DESCRIPTIONS: Record<string, string> = {
  '목': '성장과 인자함의 기운이 강합니다. 창의적이고 온화한 성품을 지녔으며, 새로운 시작에 대한 에너지가 넘칩니다.',
  '화': '열정과 예의의 기운이 강합니다. 밝고 활기찬 에너지를 가졌으며, 리더십과 표현력이 뛰어납니다.',
  '토': '안정과 신의의 기운이 강합니다. 중심을 잘 잡고 포용력이 넓으며, 사람들에게 신뢰를 줍니다.',
  '금': '결단과 의리의 기운이 강합니다. 정의감이 강하고 깔끔한 성격이며, 집중력과 실행력이 뛰어납니다.',
  '수': '지혜와 유연의 기운이 강합니다. 깊은 사고력을 지녔으며, 적응력이 뛰어나고 섬세합니다.',
};

// 삼재 years by animal group
const SAMJAE_GROUPS: number[][] = [
  [0, 4, 8],   // 쥐, 용, 원숭이 → 인묘진 (2022,2023,2024 / 2034,2035,2036 ...)
  [1, 5, 9],   // 소, 뱀, 닭 → 사오미
  [2, 6, 10],  // 호랑이, 말, 개 → 신유술
  [3, 7, 11],  // 토끼, 양, 돼지 → 해자축
];

// ─────────────────────────────────────────────
// Saju Calculation Utilities
// ─────────────────────────────────────────────

function getAnimalIndex(year: number): number {
  return (year - 4) % 12;
}

function getCheonganIndex(year: number): number {
  return (year - 4) % 10;
}

function calcMonthPillar(yearGanIdx: number, month: number) {
  const baseGan = (yearGanIdx % 5) * 2 + 2;
  const monthGanIdx = (baseGan + month - 1) % 10;
  const monthJiIdx = (month + 1) % 12;
  return { gan: CHEONGAN[monthGanIdx], ji: JIJI[monthJiIdx] };
}

function calcDayPillar(year: number, month: number, day: number) {
  // Simplified day pillar calculation
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000);
  const ganIdx = (diffDays + 6) % 10;
  const jiIdx = diffDays % 12;
  return {
    gan: CHEONGAN[ganIdx < 0 ? ganIdx + 10 : ganIdx],
    ji: JIJI[jiIdx < 0 ? jiIdx + 12 : jiIdx],
  };
}

function calcHourPillar(dayGan: string, hourIdx: number) {
  if (hourIdx < 0) return { gan: '?', ji: '?' };
  const dayGanIdx = CHEONGAN.indexOf(dayGan as typeof CHEONGAN[number]);
  const baseGan = (dayGanIdx % 5) * 2;
  const ganIdx = (baseGan + hourIdx) % 10;
  return { gan: CHEONGAN[ganIdx], ji: JIJI[hourIdx] };
}

function ganToOheng(gan: string): string {
  const map: Record<string, string> = {
    '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
    '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
  };
  return map[gan] || '토';
}

function jiToOheng(ji: string): string {
  const map: Record<string, string> = {
    '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토', '사': '화',
    '오': '화', '미': '토', '신': '금', '유': '금', '술': '토', '해': '수',
  };
  return map[ji] || '토';
}

function checkSamjae(animalIdx: number, currentYear: number): boolean {
  const group = SAMJAE_GROUPS.find(g => g.includes(animalIdx));
  if (!group) return false;
  const groupIdx = SAMJAE_GROUPS.indexOf(group);
  const samjaeStartJiIdx = [2, 5, 8, 11][groupIdx]; // 인, 사, 신, 해
  const currentJiIdx = getAnimalIndex(currentYear);
  return (
    currentJiIdx === samjaeStartJiIdx ||
    currentJiIdx === (samjaeStartJiIdx + 1) % 12 ||
    currentJiIdx === (samjaeStartJiIdx + 2) % 12
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
    <div className="absolute top-0 left-0 right-0 z-50 flex items-center gap-2 px-6 pt-4">
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
  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: 220, height: 320 }}
      initial={{ scale: 0.3, opacity: 0, rotateY: 90 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at center, ${GOLD}40 0%, transparent 70%)`,
          filter: 'blur(30px)',
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Talisman body */}
      <div
        className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-2xl p-4"
        style={{
          background: `linear-gradient(170deg, #1a0505 0%, #2a0808 40%, #1a0505 100%)`,
          border: `2px solid ${GOLD}60`,
          boxShadow: `0 0 40px ${GOLD}30, inset 0 0 40px ${GOLD}08`,
        }}
      >
        {/* Top border decoration */}
        <div className="flex w-full items-center justify-center gap-1">
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}60)` }} />
          <span style={{ color: GOLD, fontSize: 12 }}>☰</span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${GOLD}60, transparent)` }} />
        </div>

        {/* Header characters */}
        <div className="flex gap-3" style={{ color: GOLD }}>
          <span className="text-lg font-bold">勅</span>
          <span className="text-lg font-bold">令</span>
        </div>

        {/* Central symbol area */}
        <div className="flex flex-col items-center gap-2">
          {/* Outer circle */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 100,
              height: 100,
              border: `2px solid ${GOLD}50`,
              background: `radial-gradient(circle, ${GOLD}10, transparent)`,
            }}
          >
            <motion.div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 70,
                height: 70,
                border: `1.5px solid ${GOLD}40`,
                background: `radial-gradient(circle, ${GOLD}15, transparent)`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <span style={{ color: GOLD, fontSize: 28 }}>護</span>
            </motion.div>
          </div>

          {/* Vertical text */}
          <div className="flex flex-col items-center gap-0.5" style={{ color: GOLD, fontSize: 14 }}>
            <span>護</span>
            <span>身</span>
            <span>大</span>
            <span>吉</span>
          </div>
        </div>

        {/* Trigram symbols */}
        <div className="flex w-full justify-around" style={{ color: `${GOLD}70`, fontSize: 11 }}>
          <span>☰</span>
          <span>☵</span>
          <span>☲</span>
          <span>☷</span>
        </div>

        {/* Bottom decoration */}
        <div className="flex w-full items-center justify-center gap-1">
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40)` }} />
          <span style={{ color: `${GOLD}60`, fontSize: 10 }}>急急如律令</span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Step 1: Welcome
// ─────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  const features = [
    { icon: '🔮', text: '사주 기반 맞춤 운세' },
    { icon: '🎴', text: '전통 부적 43종 수록' },
    { icon: '✨', text: 'AI 맞춤형 부적 생성' },
  ];

  return (
    <motion.div
      className="flex min-h-full flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <FloatingParticles count={40} />

      {/* Logo area */}
      <motion.div
        className="relative z-10 mb-4 flex flex-col items-center"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Glow behind logo */}
        <div
          className="absolute -inset-10 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${GOLD}50 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />
        <motion.div
          className="relative text-6xl font-black tracking-widest"
          style={{
            color: GOLD,
            textShadow: `0 0 30px ${GOLD}60, 0 0 60px ${GOLD}30, 0 2px 4px rgba(0,0,0,0.8)`,
            fontFamily: 'serif',
          }}
          animate={{
            textShadow: [
              `0 0 30px ${GOLD}60, 0 0 60px ${GOLD}30`,
              `0 0 40px ${GOLD}80, 0 0 80px ${GOLD}50`,
              `0 0 30px ${GOLD}60, 0 0 60px ${GOLD}30`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          수호부적
        </motion.div>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        className="relative z-10 mb-12 text-center text-base tracking-wide"
        style={{ color: `${GOLD}99` }}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        당신만을 위한 맞춤형 디지털 부적
      </motion.p>

      {/* Features */}
      <div className="relative z-10 mb-14 flex w-full max-w-xs flex-col gap-4">
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-4 rounded-2xl px-5 py-4"
            style={{
              background: `linear-gradient(135deg, ${GOLD}08, ${GOLD}04)`,
              border: `1px solid ${GOLD}15`,
              backdropFilter: 'blur(10px)',
            }}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-2xl">{f.icon}</span>
            <span className="text-sm font-medium" style={{ color: `${GOLD}DD` }}>
              {f.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.button
        className="relative z-10 w-full max-w-xs rounded-2xl px-8 py-4 text-lg font-bold tracking-wider"
        style={{
          background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
          color: '#0A0A12',
          boxShadow: `0 4px 30px ${GOLD}40, 0 0 60px ${GOLD}20`,
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        whileHover={{ scale: 1.03, boxShadow: `0 4px 40px ${GOLD}60` }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
      >
        시작하기
      </motion.button>
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

  // Dynamic background hue based on selection
  const bgHue = useMemo(() => {
    const animalIdx = getAnimalIndex(info.year);
    const element = ANIMALS[animalIdx].element;
    const hueMap: Record<string, number> = { '목': 120, '화': 0, '토': 40, '금': 45, '수': 210 };
    return hueMap[element] ?? 0;
  }, [info.year]);

  return (
    <motion.div
      className="relative flex min-h-full flex-col px-6 pb-8 pt-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          background: `radial-gradient(ellipse at 50% 80%, hsla(${bgHue}, 60%, 15%, 0.3) 0%, transparent 60%)`,
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
        {(() => {
          const animal = ANIMALS[getAnimalIndex(info.year)];
          return (
            <div className="flex items-center justify-center gap-2" style={{ color: `${GOLD}77` }}>
              <span className="text-2xl">{animal.emoji}</span>
              <span className="text-sm">{info.year}년 {animal.name}띠</span>
            </div>
          );
        })()}
      </motion.div>

      {/* Next button */}
      <motion.button
        className="relative z-10 mt-auto w-full rounded-2xl px-8 py-4 text-base font-bold tracking-wider"
        style={{
          background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
          color: '#0A0A12',
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
  const animalIdx = getAnimalIndex(info.year);
  const animal = ANIMALS[animalIdx];

  const yearGanIdx = getCheonganIndex(info.year);
  const yearGan = CHEONGAN[yearGanIdx];
  const yearJi = JIJI[animalIdx];

  const monthPillar = calcMonthPillar(yearGanIdx, info.month);
  const dayPillar = calcDayPillar(info.year, info.month, info.day);
  const hourPillar = calcHourPillar(dayPillar.gan, info.hour);

  const pillars = [
    { label: '시주', gan: hourPillar.gan, ji: hourPillar.ji },
    { label: '일주', gan: dayPillar.gan, ji: dayPillar.ji },
    { label: '월주', gan: monthPillar.gan, ji: monthPillar.ji },
    { label: '년주', gan: yearGan, ji: yearJi },
  ];

  // Calculate 오행 balance
  const ohengCount: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  for (const p of pillars) {
    if (p.gan !== '?') ohengCount[ganToOheng(p.gan)]++;
    if (p.ji !== '?') ohengCount[jiToOheng(p.ji)]++;
  }
  const maxOheng = Math.max(...Object.values(ohengCount));
  const dominantOheng = Object.entries(ohengCount).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  const currentYear = new Date().getFullYear();
  const isSamjae = checkSamjae(animalIdx, currentYear);

  return (
    <motion.div
      className="relative flex min-h-full flex-col px-6 pb-8 pt-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <FloatingParticles count={15} />

      {/* Title */}
      <motion.h1
        className="relative z-10 mb-6 text-center text-2xl font-bold"
        style={{ color: GOLD }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        당신의 사주 풀이
      </motion.h1>

      {/* Animal display */}
      <motion.div
        className="relative z-10 mb-6 flex flex-col items-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      >
        <motion.span
          className="text-7xl"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 3 }}
        >
          {animal.emoji}
        </motion.span>
        <p className="mt-2 text-lg font-medium" style={{ color: GOLD }}>
          당신은 <strong>{animal.name}띠</strong>입니다
        </p>
      </motion.div>

      {/* 천간지지 Four Pillars */}
      <motion.div
        className="relative z-10 mb-6 rounded-2xl p-4"
        style={{ background: `${GOLD}06`, border: `1px solid ${GOLD}15` }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="mb-3 text-center text-xs font-medium" style={{ color: `${GOLD}88` }}>
          사주팔자 · 천간지지
        </p>
        <div className="grid grid-cols-4 gap-2">
          {pillars.map((p, i) => (
            <motion.div
              key={p.label}
              className="flex flex-col items-center gap-1"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 + i * 0.15 }}
            >
              <span className="text-[10px]" style={{ color: `${GOLD}66` }}>{p.label}</span>
              <div
                className="flex w-full flex-col items-center gap-1 rounded-xl py-3"
                style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}18` }}
              >
                <span
                  className="text-xl font-bold"
                  style={{ color: p.gan !== '?' ? OHENG_COLORS[ganToOheng(p.gan)] : `${GOLD}44` }}
                >
                  {p.gan}
                </span>
                <div className="h-px w-6" style={{ background: `${GOLD}25` }} />
                <span
                  className="text-xl font-bold"
                  style={{ color: p.ji !== '?' ? OHENG_COLORS[jiToOheng(p.ji)] : `${GOLD}44` }}
                >
                  {p.ji}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 오행 Chart */}
      <motion.div
        className="relative z-10 mb-6 rounded-2xl p-4"
        style={{ background: `${GOLD}06`, border: `1px solid ${GOLD}15` }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="mb-3 text-center text-xs font-medium" style={{ color: `${GOLD}88` }}>
          오행 균형
        </p>
        <div className="flex items-end justify-center gap-3">
          {Object.entries(ohengCount).map(([name, count], i) => (
            <motion.div
              key={name}
              className="flex flex-col items-center gap-1"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.4 + i * 0.1, duration: 0.5 }}
              style={{ originY: 1 }}
            >
              <span className="text-xs font-bold" style={{ color: `${GOLD}CC` }}>
                {count}
              </span>
              <div
                className="w-10 rounded-lg transition-all"
                style={{
                  height: maxOheng > 0 ? (count / maxOheng) * 80 + 8 : 8,
                  background: `linear-gradient(to top, ${OHENG_COLORS[name]}CC, ${OHENG_COLORS[name]}66)`,
                  boxShadow: `0 0 10px ${OHENG_COLORS[name]}40`,
                  minHeight: 8,
                }}
              />
              <span className="text-xs font-medium" style={{ color: OHENG_COLORS[name] }}>
                {name}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Personality description */}
      <motion.div
        className="relative z-10 mb-4 rounded-2xl p-4"
        style={{ background: `${GOLD}06`, border: `1px solid ${GOLD}15` }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <div className="mb-2 flex items-center justify-center gap-2">
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{
              background: `${OHENG_COLORS[dominantOheng]}25`,
              color: OHENG_COLORS[dominantOheng],
              border: `1px solid ${OHENG_COLORS[dominantOheng]}40`,
            }}
          >
            {dominantOheng} 기운 우세
          </span>
        </div>
        <p className="text-center text-sm leading-relaxed" style={{ color: `${GOLD}BB` }}>
          {OHENG_DESCRIPTIONS[dominantOheng]}
        </p>
      </motion.div>

      {/* 삼재 Warning */}
      {isSamjae && (
        <motion.div
          className="relative z-10 mb-4 rounded-2xl p-4"
          style={{
            background: 'rgba(244, 67, 54, 0.08)',
            border: '1px solid rgba(244, 67, 54, 0.25)',
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.1 }}
        >
          <div className="flex items-start gap-3">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              ⚠️
            </motion.span>
            <div>
              <p className="mb-1 text-sm font-bold" style={{ color: '#F44336' }}>
                올해는 삼재(三災)의 해입니다
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#F4433699' }}>
                삼재의 기운을 막아주는 <strong>삼재부</strong>를 권장합니다.
                부적함에서 삼재부를 확인하세요.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Next button */}
      <motion.button
        className="relative z-10 mt-auto w-full rounded-2xl px-8 py-4 text-base font-bold tracking-wider"
        style={{
          background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
          color: '#0A0A12',
          boxShadow: `0 4px 30px ${GOLD}40`,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.3 }}
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

  const handleSave = useCallback(() => {
    // Save to localStorage
    const userData = {
      birth: {
        year: info.year,
        month: info.month,
        day: info.day,
        hour: info.hour,
      },
      name: info.name,
      onboardingCompleted: true,
      firstTalisman: {
        type: 'hosinbu',
        name: '호신부',
        receivedAt: new Date().toISOString(),
      },
      talismans: [
        {
          id: 'hosinbu-gift',
          type: 'hosinbu',
          name: '호신부 (護身符)',
          description: '몸과 마음을 보호하는 부적',
          receivedAt: new Date().toISOString(),
          isGift: true,
        },
      ],
    };
    localStorage.setItem('bujeok-user', JSON.stringify(userData));
    setSaved(true);
    setTimeout(() => {
      onComplete();
    }, 1200);
  }, [info, onComplete]);

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

      {/* Save button */}
      <motion.button
        className="relative z-10 w-full max-w-xs rounded-2xl px-8 py-4 text-base font-bold tracking-wider"
        style={{
          background: saved
            ? `linear-gradient(135deg, #4CAF50, #388E3C)`
            : `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
          color: saved ? '#fff' : '#0A0A12',
          boxShadow: saved ? `0 4px 30px #4CAF5040` : `0 4px 30px ${GOLD}40`,
        }}
        whileHover={!saved ? { scale: 1.02 } : {}}
        whileTap={!saved ? { scale: 0.97 } : {}}
        onClick={!saved ? handleSave : undefined}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.8 }}
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

  const handleComplete = useCallback(() => {
    window.location.href = '/';
  }, []);

  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-hidden"
      style={{ background: BG_DARK }}
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

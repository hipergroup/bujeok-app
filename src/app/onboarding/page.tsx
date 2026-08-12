'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import TraditionalButton from '@/components/hanji/TraditionalButton';
import { KnotMotif } from '@/components/hanji/motifs';
import AnimalMotif from '@/components/hanji/AnimalMotif';
import { getTalismanById } from '@/data/talismans';
import {
  debugToNative,
  hasWidgetBridge,
  pushTalismanToWidget,
} from '@/lib/widget-bridge';
import hosinbuGift from '../../../public/talismans/hosinbu-gift.png';
import hanjiBg from '../../../public/brand/hanji-bg.jpg';
import wordmarkMark from '../../../public/brand/wordmark-mark.png';
import cloudTrigramImg from '../../../public/brand/cloud-trigram.png';
import dividerImg from '../../../public/brand/divider.png';

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
const GOLD_DARK = '#8A231B';

/**
 * 12지시의 실제 "시(hour)" 값은 아래 HOUR_CELLS 가 갖는다.
 * (사주 모듈은 23:00~00:59 를 자시로 처리하므로 자시는 0시로 둔다)
 * -1 = 시간 모름
 */
const HOUR_UNKNOWN = -1;
/** 시간을 모를 때 계산에 사용하는 기본 시각 (오시 정중앙) */
const DEFAULT_HOUR = 12;

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

/** 오행별 한 단어 의미 태그 (초보자용) */
const OHENG_META: Record<Oheng, { tag: string }> = {
  '목': { tag: '성장' },
  '화': { tag: '열정' },
  '토': { tag: '안정' },
  '금': { tag: '결단' },
  '수': { tag: '지혜' },
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
// Progress Indicator
// ─────────────────────────────────────────────

/** 지나온·현재 단계는 긴 획, 남은 단계는 점 하나 (SPEC §0) */
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div
      className="absolute left-0 right-0 top-0 z-50 flex items-center pt-[max(1rem,env(safe-area-inset-top))]"
      style={{ paddingLeft: 26, paddingRight: 26, gap: 5 }}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="transition-all duration-300"
          style={{
            width: i <= step ? 22 : 5,
            height: 3,
            background: i <= step ? JUHONG : 'rgba(122,74,52,0.3)',
          }}
        />
      ))}
      <span
        className="ml-auto tabular-nums"
        style={{ fontSize: 11, color: 'rgba(46,46,46,0.35)' }}
      >
        {step + 1} / {total}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Talisman SVG Component
// ─────────────────────────────────────────────

function HosinbuTalisman() {
  // 황지·주사 실사 호신부 (public/talismans/hosinbu-gift.png, 찢긴 가장자리 투명 처리)
  // 종이는 가만히 두고 뒤의 숨빛만 천천히 쉰다 — 앱이 드리는 기성 부적이라 낙관은 없다.
  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: 214 }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="pointer-events-none absolute"
        style={{
          inset: -14,
          background:
            'radial-gradient(ellipse at center, rgba(167,43,33,0.22) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
        animate={{ opacity: [0.45, 0.9, 0.45], scale: [0.97, 1.03, 0.97] }}
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

function StepWelcome({
  onNext,
  totalSteps,
}: {
  onNext: () => void;
  totalSteps: number;
}) {
  // 壹·貳·參 = 1·2·3의 갖은자(격식체 숫자)
  const features = [
    { hanja: '壹', text: '만세력 기반 정확한 사주 풀이' },
    { hanja: '貳', text: '마음을 담아 만드는 나만의 부적' },
    { hanja: '參', text: '오늘의 마음을 나누는 다정한 상담' },
  ];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* 한지 배경 — body의 safe-area 패딩(노치·홈바 띠) 바깥까지 뷰포트 전체를 덮는다.
          background-position 22% 92%는 배경 무늬(구름·낙관)를 피해 평평한 결만 보이는 값 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: `#F2E7CE url(${hanjiBg.src}) 22% 92% / 190% auto no-repeat`,
        }}
      />
      {/* 프레임 — 390 기준 절대 좌표의 기준면 */}
      <div
        className="relative mx-auto flex w-full max-w-[430px] flex-1 flex-col"
        style={{ padding: '64px 30px 34px' }}
      >
        {/* 구름·팔괘 (오른쪽 위) */}
        <Image
          src={cloudTrigramImg}
          alt=""
          priority
          className="pointer-events-none absolute h-auto select-none"
          style={{ top: 30, right: -46, width: 295 }}
        />

        {/* 본문 */}
        <div
          className="relative z-10 flex flex-1 flex-col items-center justify-center"
          style={{ animation: 'inkin .7s ease both' }}
        >
          <Image
            src={wordmarkMark}
            alt="수호부"
            priority
            className="block h-auto"
            style={{ width: 248 }}
          />
          <p
            style={{
              marginTop: 22,
              fontSize: 14,
              color: 'rgba(46, 46, 46, 0.55)',
              letterSpacing: '.04em',
            }}
          >
            오늘의 마음을 지키는 부적
          </p>
          <Image
            src={dividerImg}
            alt=""
            priority
            className="block h-auto"
            style={{ width: 250, marginTop: 20, opacity: 0.85 }}
          />

          {/* 소개 3줄 */}
          <div
            className="flex w-full flex-col"
            style={{ marginTop: 54, paddingLeft: 34, gap: 14 }}
          >
            {features.map((f) => (
              <div
                key={f.hanja}
                className="flex items-center text-left"
                style={{ gap: 12 }}
              >
                <span
                  className="font-brush flex-none text-center"
                  style={{ fontSize: 16, color: '#7A4A34', width: 20 }}
                >
                  {f.hanja}
                </span>
                <span
                  className="flex-none"
                  style={{ width: 1, height: 16, background: 'rgba(122, 74, 52, 0.35)' }}
                />
                <span
                  style={{
                    fontSize: 13.5,
                    color: 'rgba(46, 46, 46, 0.72)',
                    letterSpacing: '-.02em',
                  }}
                >
                  {f.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA + 페이지 인디케이터 */}
        <div className="relative z-10" style={{ marginTop: 24 }}>
          <TraditionalButton onClick={onNext}>시작하기</TraditionalButton>
          <div className="flex justify-center" style={{ gap: 5, marginTop: 16 }}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <span
                key={i}
                className="transition-all duration-300"
                style={{
                  width: i === 0 ? 18 : 5,
                  height: 5,
                  background: i === 0 ? '#A72B21' : 'rgba(122, 74, 52, 0.3)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
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
  /** 대운의 순행·역행 판정에 쓴다 — /saju 와 같은 'M' | 'F' 표기 */
  gender: 'M' | 'F' | null;
}

// ─────────────────────────────────────────────
// 한지 카드 조각 (2·3단계 공통)
// ─────────────────────────────────────────────

/** 카드 바탕·테두리 */
const CARD_STYLE = {
  background: 'rgba(255,253,248,0.82)',
  border: '1px solid rgba(122,74,52,0.2)',
} as const;

/** 카드 머리 — 한자 머리표 + 보조 설명 (+ 오른쪽 슬롯) */
function CardHead({
  hanja,
  sub,
  right,
}: {
  hanja: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-2"
      style={{
        padding: '10px 16px',
        background: 'rgba(122,74,52,0.06)',
        borderBottom: '1px solid rgba(122,74,52,0.16)',
      }}
    >
      <span className="flex items-baseline gap-2">
        <span
          className="font-serif-kr"
          style={{ fontSize: 12, color: GALSAEK, letterSpacing: '0.14em' }}
        >
          {hanja}
        </span>
        {sub && (
          <span style={{ fontSize: 11, color: 'rgba(46,46,46,0.42)' }}>{sub}</span>
        )}
      </span>
      {right}
    </div>
  );
}

/** 그 달의 말일 */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 밑줄 숫자 입력.
 * 타이핑 중에는 적는 대로 두고, 범위를 벗어난 값은 포커스가 빠질 때 되돌린다.
 * 부모가 값을 바꾸는 경우(월이 바뀌어 말일이 줄 때)는 key 로 다시 마운트해 맞춘다.
 */
function UnderlineNumber({
  value,
  min,
  max,
  unit,
  label,
  onCommit,
}: {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  return (
    <label
      className="flex items-baseline gap-1"
      style={{
        borderBottom: '1.5px solid rgba(122,74,52,0.32)',
        paddingBottom: 8,
      }}
    >
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={draft}
        min={min}
        max={max}
        onChange={(e) => {
          const s = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
          setDraft(s);
          const n = Number(s);
          if (s && n >= min && n <= max) onCommit(n);
        }}
        onBlur={() => {
          const n = draft
            ? Math.min(max, Math.max(min, Number(draft)))
            : value;
          setDraft(String(n));
          onCommit(n);
        }}
        className="w-full min-w-0 bg-transparent tabular-nums outline-none"
        style={{ fontSize: 22, color: MEOK }}
      />
      <span
        className="shrink-0"
        style={{ fontSize: 12, color: 'rgba(46,46,46,0.4)' }}
      >
        {unit}
      </span>
    </label>
  );
}

/** 12지시 격자 — value 는 기존 HOURS 와 같은 시(hour) 값 */
const HOUR_CELLS: { hanja: string; range: string; value: number }[] = [
  { hanja: '子', range: '23-01', value: 0 },
  { hanja: '丑', range: '01-03', value: 2 },
  { hanja: '寅', range: '03-05', value: 4 },
  { hanja: '卯', range: '05-07', value: 6 },
  { hanja: '辰', range: '07-09', value: 8 },
  { hanja: '巳', range: '09-11', value: 10 },
  { hanja: '午', range: '11-13', value: 12 },
  { hanja: '未', range: '13-15', value: 14 },
  { hanja: '申', range: '15-17', value: 16 },
  { hanja: '酉', range: '17-19', value: 18 },
  { hanja: '戌', range: '19-21', value: 20 },
  { hanja: '亥', range: '21-23', value: 22 },
];

const GENDERS: { value: 'F' | 'M'; hanja: string; label: string }[] = [
  { value: 'F', hanja: '坤', label: '여자' },
  { value: 'M', hanja: '乾', label: '남자' },
];

function StepBirthInfo({
  info,
  onChange,
  onNext,
}: {
  info: BirthInfo;
  onChange: (info: BirthInfo) => void;
  onNext: () => void;
}) {
  const thisYear = new Date().getFullYear();

  /** 년·월이 바뀌면 말일을 넘긴 일자도 함께 줄인다 */
  const patch = (p: Partial<BirthInfo>) => {
    const next = { ...info, ...p };
    const limit = daysInMonth(next.year, next.month);
    if (next.day > limit) next.day = limit;
    onChange(next);
  };

  const hour = effectiveHour(info.hour);

  // 입춘(立春) 기준 정확한 띠 — 만세력 모듈 사용
  const animal = useMemo(
    () => getAnimal(info.year, info.month, info.day, hour),
    [info.year, info.month, info.day, hour]
  );

  // 사주 기준 연도 (입춘 전 출생이면 전년도)
  const sajuYear = useMemo(
    () => getSajuYear(info.year, info.month, info.day, hour),
    [info.year, info.month, info.day, hour]
  );

  // 연주 간지 — 미리보기에 `丙子년` 으로 보여준다
  const ganji = useMemo(() => {
    const s = getSaju(info.year, info.month, info.day, hour);
    return `${s.yearStem.hanja}${s.yearBranch.hanja}`;
  }, [info.year, info.month, info.day, hour]);

  return (
    <motion.div
      className="flex min-h-full flex-col"
      style={{ padding: '56px 26px 40px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h1
        className="font-serif-kr"
        style={{ marginTop: 26, fontSize: 25, lineHeight: 1.5, color: MEOK }}
      >
        태어난 날을
        <br />
        알려주세요
      </h1>
      <p
        style={{
          marginTop: 10,
          fontSize: 12.5,
          lineHeight: 1.8,
          color: 'rgba(46,46,46,0.45)',
        }}
      >
        만세력(萬歲曆)으로 정확히 풀어드릴게요.
        <br />
        입력한 정보는 이 기기에만 저장됩니다.
      </p>

      {/* 生年月日 */}
      <div className="mt-6 overflow-hidden rounded-xl" style={CARD_STYLE}>
        <CardHead
          hanja="生年月日"
          right={
            <span
              className="inline-flex overflow-hidden"
              style={{
                borderRadius: 6,
                border: '1px solid rgba(122,74,52,0.24)',
              }}
            >
              <span
                style={{
                  padding: '4px 10px',
                  fontSize: 10.5,
                  background: JUHONG,
                  color: '#FBF3E0',
                }}
              >
                양력
              </span>
              {/* 음→양 변환이 아직 없어 고를 수 없다 — 되는 척하지 않는다 */}
              <button
                type="button"
                disabled
                title="준비 중"
                style={{
                  padding: '4px 10px',
                  fontSize: 10.5,
                  color: 'rgba(122,74,52,0.45)',
                  cursor: 'not-allowed',
                }}
              >
                음력 (준비 중)
              </button>
            </span>
          }
        />
        <div
          className="grid gap-[10px]"
          style={{
            padding: '18px 16px',
            gridTemplateColumns: '1.5fr 1fr 1fr',
          }}
        >
          <UnderlineNumber
            label="태어난 해"
            value={info.year}
            min={1900}
            max={thisYear}
            unit="年"
            onCommit={(v) => patch({ year: v })}
          />
          <UnderlineNumber
            label="태어난 달"
            value={info.month}
            min={1}
            max={12}
            unit="月"
            onCommit={(v) => patch({ month: v })}
          />
          <UnderlineNumber
            key={`${info.year}-${info.month}`}
            label="태어난 날"
            value={info.day}
            min={1}
            max={daysInMonth(info.year, info.month)}
            unit="日"
            onCommit={(v) => patch({ day: v })}
          />
        </div>
      </div>

      {/* 時辰 */}
      <div className="mt-3 overflow-hidden rounded-xl" style={CARD_STYLE}>
        <CardHead hanja="時辰" sub="태어난 시각" />
        <div
          className="grid grid-cols-4"
          style={{ gap: 1, background: 'rgba(122,74,52,0.14)' }}
        >
          {HOUR_CELLS.map((c) => {
            const on = info.hour === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => patch({ hour: c.value })}
                className="flex flex-col items-center justify-center"
                style={{
                  padding: '10px 0',
                  background: on
                    ? 'rgba(167,43,33,0.08)'
                    : 'rgba(255,253,248,0.9)',
                  boxShadow: on ? 'inset 0 0 0 1.5px #A72B21' : undefined,
                }}
              >
                <span
                  className="font-serif-kr"
                  style={{ fontSize: 17, color: on ? JUHONG : MEOK }}
                >
                  {c.hanja}
                </span>
                <span
                  style={{
                    marginTop: 2,
                    fontSize: 9.5,
                    color: 'rgba(46,46,46,0.4)',
                  }}
                >
                  {c.range}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => patch({ hour: HOUR_UNKNOWN })}
          className="w-full text-center"
          style={{
            borderTop: '1px solid rgba(122,74,52,0.14)',
            padding: 12,
            fontSize: 12.5,
            color: info.hour === HOUR_UNKNOWN ? JUHONG : 'rgba(46,46,46,0.55)',
            background:
              info.hour === HOUR_UNKNOWN ? 'rgba(167,43,33,0.05)' : undefined,
          }}
        >
          시각을 모르겠어요
        </button>
      </div>

      {/* 性別 — 대운의 순행·역행을 가른다 */}
      <div className="mt-3 overflow-hidden rounded-xl" style={CARD_STYLE}>
        <CardHead hanja="性別" sub="대운의 방향이 달라져요" />
        <div
          className="grid grid-cols-2 gap-[10px]"
          style={{ padding: '18px 16px' }}
        >
          {GENDERS.map((g) => {
            const on = info.gender === g.value;
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => patch({ gender: g.value })}
                className="flex items-center justify-center gap-[9px]"
                style={{
                  padding: '14px 0',
                  borderRadius: 9,
                  border: on
                    ? '1px solid rgba(167,43,33,0.45)'
                    : '1px solid rgba(122,74,52,0.24)',
                  background: on
                    ? 'rgba(167,43,33,0.06)'
                    : 'rgba(255,253,248,0.7)',
                }}
              >
                <span
                  className="font-serif-kr"
                  style={{
                    fontSize: 19,
                    color: on ? JUHONG : 'rgba(122,74,52,0.65)',
                  }}
                >
                  {g.hanja}
                </span>
                <span
                  style={{ fontSize: 14, color: on ? JUHONG : MEOK }}
                >
                  {g.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 姓名 */}
      <div className="mt-3 overflow-hidden rounded-xl" style={CARD_STYLE}>
        <CardHead hanja="姓名" />
        <div style={{ padding: '18px 16px' }}>
          <input
            type="text"
            value={info.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="이름 (선택 · 낙관에 새겨져요)"
            className="w-full bg-transparent outline-none"
            style={{
              borderBottom: '1px solid rgba(122,74,52,0.28)',
              paddingBottom: 8,
              fontSize: 15,
              color: MEOK,
            }}
          />
        </div>
      </div>

      {/* 띠 미리보기 */}
      <div
        className="flex items-center"
        style={{
          marginTop: 20,
          gap: 14,
          padding: '14px 16px',
          borderRadius: 12,
          border: '1px solid rgba(143,107,20,0.35)',
          background: 'rgba(255,250,236,0.55)',
        }}
      >
        <AnimalMotif animal={animal.name} size={46} />
        <div className="min-w-0">
          <p className="font-serif-kr" style={{ fontSize: 16, color: MEOK }}>
            {ganji}년 · {animal.name}띠
          </p>
          <p
            style={{
              marginTop: 3,
              fontSize: 11,
              lineHeight: 1.6,
              color: 'rgba(46,46,46,0.45)',
            }}
          >
            {sajuYear === info.year
              ? `입춘(立春) 이후 출생이라 사주 연도도 ${info.year}년입니다`
              : `입춘(立春) 전 출생이라 사주상 ${sajuYear}년생으로 봅니다`}
          </p>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <TraditionalButton
          onClick={onNext}
          disabled={!info.gender}
          className="rounded-lg"
        >
          사주 풀이 보기
        </TraditionalButton>
      </div>
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

  // 기둥 상세 — 접히지 않고 늘 하나는 열려 있다 (처음엔 일주)
  const dayPillarIndex = reading.pillars.findIndex(
    (p, i) => pillarMeaningOf(p.meaning, i)?.key === 'day'
  );
  const [openPillar, setOpenPillar] = useState(
    dayPillarIndex >= 0 ? dayPillarIndex : 0
  );
  const openPillarMeaning = pillarMeaningOf(
    reading.pillars[openPillar]?.meaning,
    openPillar
  );

  const ilgan = reading.ilgan;
  const ilganColor = OHENG_COLORS[ilgan.oheng] ?? JUHONG;

  return (
    <motion.div
      className="mx-auto flex min-h-full w-full max-w-md flex-col"
      style={{ padding: '56px 22px 40px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 제목 */}
      <div className="flex flex-col items-center text-center">
        <h1 className="font-serif-kr" style={{ fontSize: 24, color: MEOK }}>
          당신의 사주 풀이
        </h1>
        <p style={{ marginTop: 7, fontSize: 11.5, color: `${GALSAEK}AA` }}>
          어려운 말은 빼고, 쉽게 풀어드릴게요
        </p>
      </div>

      {/* ── 헤드라인 ─────────────────────────────── */}
      <section
        className="mt-[14px] overflow-hidden rounded-xl"
        style={{ ...CARD_STYLE, padding: '22px 18px' }}
      >
        <div className="flex flex-col items-center text-center">
          <AnimalMotif
            animal={reading.animal.animal || animal.name}
            size={112}
          />
          <span
            className="inline-block rounded-full"
            style={{
              marginTop: 6,
              padding: '3px 10px',
              fontSize: 11.5,
              color: JUHONG,
              background: 'rgba(167,43,33,0.07)',
              border: '1px solid rgba(167,43,33,0.32)',
            }}
          >
            {reading.animal.animal || animal.name}띠 {reading.animal.hanja}
          </span>

          <p
            className="font-serif-kr"
            style={{ marginTop: 14, fontSize: 19, lineHeight: 1.6, color: MEOK }}
          >
            {reading.headline}
          </p>

          {(reading.animal.traits?.length ?? 0) > 0 && (
            <div
              className="flex flex-wrap items-center justify-center gap-1.5"
              style={{ marginTop: 12 }}
            >
              {(reading.animal.traits ?? []).slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full"
                  style={{
                    padding: '3px 9px',
                    fontSize: 11,
                    color: GALSAEK,
                    background: 'rgba(122,74,52,0.07)',
                    border: '1px solid rgba(122,74,52,0.22)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <p
            style={{
              marginTop: 14,
              fontSize: 12.5,
              lineHeight: 1.85,
              color: `${MEOK}BB`,
            }}
          >
            {reading.animal.description}
          </p>

          <div
            style={{
              marginTop: 16,
              width: 64,
              height: 1,
              background: 'rgba(122,74,52,0.24)',
            }}
          />
          <p
            style={{ marginTop: 12, fontSize: 11, color: 'rgba(46,46,46,0.38)' }}
          >
            {sajuYear}년 {saju.yearStem.hanja}
            {saju.yearBranch.hanja}년생 · {saju.hourBranch.name}시(
            {saju.hourBranch.hanja})
          </p>
        </div>
      </section>

      {/* ── ① 나를 나타내는 글자 (일간) ─────────────── */}
      <section
        className="mt-[14px] rounded-xl"
        style={{ ...CARD_STYLE, padding: '18px 16px' }}
      >
        <SectionLabel index={1} title="나를 나타내는 글자" term="일간(日干)" />

        <div className="mt-4 flex flex-col items-center text-center">
          <div
            className="flex flex-col items-center justify-center"
            style={{
              width: 92,
              height: 92,
              borderRadius: 14,
              background: `${ilganColor}14`,
              border: `1.5px solid ${ilganColor}61`,
            }}
          >
            <span
              className="font-serif-kr leading-none"
              style={{ fontSize: 40, color: ilganColor }}
            >
              {ilgan.hanja}
            </span>
            <span
              style={{ marginTop: 5, fontSize: 10.5, color: `${MEOK}88` }}
            >
              {ilgan.gan} · {ilgan.oheng}
            </span>
          </div>

          <p
            className="font-serif-kr"
            style={{ marginTop: 14, fontSize: 17, lineHeight: 1.5, color: MEOK }}
          >
            당신은 <span style={{ color: ilganColor }}>{ilgan.symbol}</span> 같은
            사람이에요
          </p>
          <span
            className="inline-block rounded-full"
            style={{
              marginTop: 8,
              padding: '3px 10px',
              fontSize: 11,
              color: ilganColor,
              background: `${ilganColor}18`,
              border: `1px solid ${ilganColor}33`,
            }}
          >
            #{ilgan.keyword}
          </span>

          <p
            style={{
              marginTop: 12,
              fontSize: 12.5,
              lineHeight: 1.75,
              color: `${MEOK}CC`,
            }}
          >
            {ilgan.personality}
          </p>
        </div>

        {/* 강점 */}
        {(ilgan.strength?.length ?? 0) > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 14px',
              borderRadius: 10,
              background: 'rgba(107,125,99,0.09)',
              border: '1px solid rgba(107,125,99,0.28)',
            }}
          >
            <p
              className="font-bold"
              style={{ fontSize: 11.5, color: '#5C7350' }}
            >
              이런 점이 강해요
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {(ilgan.strength ?? []).slice(0, 3).map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-2"
                  style={{ fontSize: 12.5, lineHeight: 1.7, color: `${MEOK}DD` }}
                >
                  <span className="shrink-0" style={{ color: '#5C7350' }}>
                    ✓
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 주의 — 문장으로 이어 쓴다 */}
        {(ilgan.caution?.length ?? 0) > 0 && (
          <div
            style={{
              marginTop: 10,
              padding: '12px 14px',
              borderRadius: 10,
              background: 'rgba(218,160,23,0.1)',
              border: '1px solid rgba(218,160,23,0.34)',
            }}
          >
            <p
              className="font-bold"
              style={{ fontSize: 11.5, color: '#9A6F0F' }}
            >
              여기를 돌보면 더 좋아져요
            </p>
            <p
              style={{
                marginTop: 6,
                fontSize: 12.5,
                lineHeight: 1.7,
                color: `${MEOK}DD`,
              }}
            >
              {(ilgan.caution ?? [])
                .slice(0, 2)
                .map((c) => {
                  const t = c.trim();
                  return /[.!?]$/.test(t) ? t : `${t}.`;
                })
                .join(' ')}
            </p>
          </div>
        )}
      </section>

      {/* ── ② 내 인생의 네 기둥 ─────────────────────── */}
      <section
        className="mt-[14px] rounded-xl"
        style={{ ...CARD_STYLE, padding: '18px 14px' }}
      >
        <div className="px-1">
          <SectionLabel
            index={2}
            title="내 인생의 네 기둥"
            term="사주팔자(四柱八字)"
          />
          <p
            style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.7, color: `${MEOK}99` }}
          >
            기둥마다 인생의 다른 시기를 맡고 있어요. 눌러보세요.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {reading.pillars.map((p, i) => {
            const m = pillarMeaningOf(p.meaning, i);
            const isDay = m?.key === 'day';
            const estimated = m?.key === 'hour' && !hourKnown;
            const open = openPillar === i;
            return (
              <button
                key={m?.label ?? i}
                type="button"
                onClick={() => setOpenPillar(i)}
                className="flex flex-col items-center gap-1.5 text-center"
                style={{
                  padding: '6px 2px 6px',
                  borderRadius: 10,
                  background: open ? 'rgba(167,43,33,0.06)' : 'transparent',
                  boxShadow: open
                    ? 'inset 0 0 0 1px rgba(167,43,33,0.28)'
                    : undefined,
                }}
              >
                <div
                  className="relative flex w-full flex-col items-center gap-1"
                  style={{
                    padding: '11px 0',
                    borderRadius: 8,
                    background: isDay
                      ? 'rgba(167,43,33,0.08)'
                      : 'rgba(122,74,52,0.05)',
                    border: isDay
                      ? '1.5px solid rgba(167,43,33,0.42)'
                      : '1.5px solid rgba(122,74,52,0.16)',
                    opacity: estimated ? 0.5 : 1,
                  }}
                >
                  {isDay && (
                    <span
                      className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full font-bold"
                      style={{
                        padding: '1px 6px',
                        fontSize: 8.5,
                        background: JUHONG,
                        color: '#F6EDD9',
                      }}
                    >
                      나 자신
                    </span>
                  )}
                  <span
                    className="font-serif-kr leading-none"
                    style={{ fontSize: 20, color: OHENG_COLORS[p.gan.oheng] }}
                  >
                    {p.gan.name}
                  </span>
                  <div
                    style={{
                      width: 18,
                      height: 1,
                      background: 'rgba(122,74,52,0.33)',
                    }}
                  />
                  <span
                    className="font-serif-kr leading-none"
                    style={{ fontSize: 20, color: OHENG_COLORS[p.ji.oheng] }}
                  >
                    {p.ji.name}
                  </span>
                </div>
                <span
                  className="font-bold leading-none"
                  style={{ fontSize: 11, color: isDay ? JUHONG : `${MEOK}AA` }}
                >
                  {m?.label}
                  {estimated ? '*' : ''}
                </span>
                <span
                  className="leading-tight"
                  style={{ fontSize: 9, color: 'rgba(122,74,52,0.6)' }}
                >
                  {m?.lifeArea}
                </span>
              </button>
            );
          })}
        </div>

        {/* 고른 기둥 풀이 — 늘 하나는 열려 있다 */}
        {openPillarMeaning && (
          <div
            style={{
              marginTop: 12,
              padding: '12px 14px',
              borderRadius: 10,
              background: 'rgba(167,43,33,0.05)',
              border: '1px solid rgba(167,43,33,0.22)',
            }}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold" style={{ fontSize: 13, color: JUHONG }}>
                {openPillarMeaning.label}
              </span>
              <span
                className="rounded-full"
                style={{
                  padding: '2px 8px',
                  fontSize: 10,
                  background: `${JUHONG}18`,
                  color: JUHONG,
                }}
              >
                {openPillarMeaning.ageRange}
              </span>
              <span style={{ fontSize: 11, color: `${GALSAEK}CC` }}>
                {openPillarMeaning.represents}
              </span>
            </div>
            <p
              style={{
                marginTop: 8,
                fontSize: 12.5,
                lineHeight: 1.75,
                color: `${MEOK}CC`,
              }}
            >
              {openPillarMeaning.simple}
            </p>
          </div>
        )}

        <p
          className="px-1"
          style={{ marginTop: 12, fontSize: 10.5, lineHeight: 1.7, color: `${GALSAEK}99` }}
        >
          {hourKnown
            ? '24절기(만세력) 기준으로 산출되었습니다'
            : '* 태어난 시간을 몰라 오시(11~13시) 기준으로 추정했어요. 시주는 참고만 해주세요'}
        </p>
      </section>

      {/* ── ③ 내 안의 다섯 기운 ─────────────────────── */}
      <section
        className="mt-[14px] rounded-xl"
        style={{ ...CARD_STYLE, padding: '18px 14px' }}
      >
        <div className="px-1">
          <SectionLabel index={3} title="내 안의 다섯 기운" term="오행(五行)" />
          <p
            style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.7, color: `${MEOK}99` }}
          >
            세상 모든 것은 나무·불·흙·쇠·물 다섯 기운으로 이루어져 있어요. 내
            사주에 어떤 기운이 많고 적은지 봅니다.
          </p>
        </div>

        <div
          className="mt-5 grid grid-cols-5 gap-1.5"
          style={{ alignItems: 'end' }}
        >
          {ohengEntries.map(([name, score]) => {
            const color = OHENG_COLORS[name];
            const top = score === maxOheng;
            return (
              <div key={name} className="flex min-w-0 flex-col items-center gap-1">
                <span
                  className="font-bold tabular-nums leading-none"
                  style={{ fontSize: 11, color }}
                >
                  {score}
                </span>
                <div className="flex h-[92px] w-full items-end justify-center">
                  <div
                    className="w-full"
                    style={{
                      maxWidth: 34,
                      height: Math.max((score / maxOheng) * 88, 6),
                      borderTopLeftRadius: 5,
                      borderTopRightRadius: 5,
                      background: `linear-gradient(to top, ${color}DD, ${color}77)`,
                      boxShadow: top ? `0 0 0 1.5px ${color}` : undefined,
                    }}
                  />
                </div>
                <span
                  className="font-serif-kr leading-none"
                  style={{ fontSize: 13, color }}
                >
                  {name}
                </span>
                <span
                  className="rounded-full leading-tight"
                  style={{
                    padding: '1px 6px',
                    fontSize: 9.5,
                    background: `${color}16`,
                    color,
                  }}
                >
                  {OHENG_META[name].tag}
                </span>
              </div>
            );
          })}
        </div>

        {/* 요약 */}
        <div
          style={{
            marginTop: 18,
            padding: '12px 14px',
            borderRadius: 10,
            background: `${GALSAEK}0D`,
            border: `1px solid ${GALSAEK}22`,
          }}
        >
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-full font-bold"
              style={{
                padding: '3px 10px',
                fontSize: 11,
                background: `${OHENG_COLORS[reading.oheng.dominant] ?? JUHONG}1E`,
                color: OHENG_COLORS[reading.oheng.dominant] ?? JUHONG,
              }}
            >
              {reading.oheng.dominant} 기운 우세
            </span>
            <span
              className="rounded-full"
              style={{
                padding: '3px 10px',
                fontSize: 11,
                background: `${MEOK}0E`,
                color: `${MEOK}AA`,
              }}
            >
              균형 · {BALANCE_TAG[reading.oheng.balance] ?? '고르게 어우러짐'}
            </span>
          </div>
          <p style={{ fontSize: 12.5, lineHeight: 1.8, color: `${MEOK}CC` }}>
            {reading.oheng.summary}
          </p>
        </div>
      </section>

      {/* ── 용신 ─────────────────────────────────── */}
      <section
        className="mt-[14px] rounded-xl"
        style={{
          padding: 16,
          background: `${yongsinColor}0F`,
          border: `1px solid ${yongsinColor}52`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex shrink-0 flex-col items-center justify-center rounded-full"
            style={{ width: 56, height: 56, background: yongsinColor }}
          >
            <span
              className="font-serif-kr leading-none"
              style={{ fontSize: 23, color: '#F6EDD9' }}
            >
              {yongsinInfo.hanja}
            </span>
            <span
              className="font-bold leading-none"
              style={{ marginTop: 2, fontSize: 9, color: '#F6EDD9CC' }}
            >
              {yongsin.yongsin}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="rounded-full font-bold"
                style={{
                  padding: '2px 8px',
                  fontSize: 10,
                  background: `${yongsinColor}1E`,
                  color: yongsinColor,
                }}
              >
                나에게 필요한 기운
              </span>
              <span style={{ fontSize: 10, color: `${MEOK}80` }}>용신(用神)</span>
              <span style={{ fontSize: 10, color: `${GALSAEK}AA` }}>
                {yongsinInfo.season} · {yongsinInfo.direction}
              </span>
            </div>
            <p
              className="font-serif-kr"
              style={{ marginTop: 6, fontSize: 14.5, lineHeight: 1.5, color: MEOK }}
            >
              지금 가장 잘 맞는 기운은{' '}
              <span style={{ color: yongsinColor }}>
                {ohengLabel(yongsin.yongsin)}
              </span>
              이에요
            </p>
          </div>
        </div>

        <p
          style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.8, color: `${MEOK}BB` }}
        >
          {yongsin.headline}
        </p>

        <p
          style={{ marginTop: 10, fontSize: 11, lineHeight: 1.7, color: `${GALSAEK}AA` }}
        >
          내 기운의 세기와 계절·온도까지 살핀 자세한 풀이, 생활 속에서 이 기운을
          채우는 방법은 <strong>내 사주 풀이</strong>에 담아뒀어요.
        </p>
      </section>

      {/* ── 삼재 (해당 시에만) ───────────────────────── */}
      {samjae.is && (
        <section
          className="mt-[14px] flex items-start rounded-xl"
          style={{
            gap: 13,
            padding: 16,
            background: 'rgba(167,43,33,0.06)',
            border: '1px solid rgba(167,43,33,0.34)',
          }}
        >
          <span
            className="flex shrink-0 items-center justify-center font-serif-kr"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid rgba(167,43,33,0.35)',
              fontSize: 16,
              color: JUHONG,
            }}
          >
            災
          </span>
          <div className="min-w-0">
            <p className="font-bold" style={{ fontSize: 13, color: JUHONG }}>
              올해는 삼재(三災)의 해입니다
              {samjae.type ? ` · ${samjae.type}` : ''}
            </p>
            <p
              style={{
                marginTop: 7,
                fontSize: 12.5,
                lineHeight: 1.8,
                color: `${MEOK}AA`,
              }}
            >
              큰일이 난다는 뜻이 아니라, 벌였던 일을 정리하고 지키는 해라는
              뜻이에요. 삼재의 기운을 다독이는 <strong>삼재부</strong>를
              부적함에서 확인해보세요.
            </p>
          </div>
        </section>
      )}

      {/* ── 하단 안내 ───────────────────────────────── */}
      <div
        className="mt-[14px] flex items-center justify-center gap-2 rounded-xl"
        style={{
          padding: '12px 16px',
          background: `${GALSAEK}0D`,
          border: `1px dashed ${GALSAEK}33`,
        }}
      >
        <span className="block shrink-0" style={{ color: `${GALSAEK}99` }}>
          <KnotMotif size={18} />
        </span>
        <p style={{ fontSize: 12, lineHeight: 1.5, color: `${GALSAEK}CC` }}>
          더 자세한 풀이는 <strong>마이페이지</strong>에서 언제든 다시 볼 수
          있어요
        </p>
      </div>

      <div style={{ marginTop: 24 }}>
        <TraditionalButton onClick={onNext} className="rounded-lg">
          첫 부적 받기
        </TraditionalButton>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Step 4: Love Status (마음 상태) — 애정운 개인화용, 선택은 자유
// ─────────────────────────────────────────────

/** user_profile.loveStatus 저장 계약 — 다른 화면(운세/홈)에서 읽는다 */
type LoveStatus = 'single' | 'crush' | 'dating' | 'married' | 'private';

const LOVE_STATUS_OPTIONS: {
  value: LoveStatus;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  { value: 'single', emoji: '🌱', label: '솔로', desc: '좋은 인연을 기다려요' },
  { value: 'crush', emoji: '🌸', label: '짝사랑·썸', desc: '마음에 둔 사람이 있어요' },
  { value: 'dating', emoji: '💕', label: '연애 중', desc: '연인과 함께하고 있어요' },
  { value: 'married', emoji: '🏡', label: '기혼', desc: '배우자와 함께해요' },
  { value: 'private', emoji: '🔒', label: '비공개', desc: '말하지 않을래요' },
];

function StepLoveStatus({
  value,
  onChange,
  onNext,
}: {
  value: LoveStatus | null;
  onChange: (v: LoveStatus) => void;
  onNext: () => void;
}) {
  const handleSkip = () => {
    onChange('private');
    onNext();
  };

  return (
    <motion.div
      className="relative flex min-h-full flex-col px-6 pb-8 pt-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >

      <motion.h1
        className="relative z-10 mb-2 text-center text-2xl font-bold"
        style={{ color: GOLD }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        지금 마음은 어떤가요?
      </motion.h1>
      <motion.p
        className="relative z-10 mb-8 text-center text-sm"
        style={{ color: `${GOLD}66` }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        애정운을 당신에게 맞게 전해드려요 · 나만 볼 수 있어요
      </motion.p>

      {/* 5개 칩 — 2열 그리드 + 비공개는 한 줄 전체 */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        {LOVE_STATUS_OPTIONS.map((opt, i) => {
          const selected = value === opt.value;
          const fullWidth = opt.value === 'private';
          return (
            <motion.button
              key={opt.value}
              type="button"
              className={`flex flex-col items-center gap-1.5 rounded-2xl px-3 py-5 text-center transition-colors duration-200 ${
                fullWidth ? 'col-span-2' : ''
              }`}
              style={{
                background: selected ? `${GOLD}14` : `${GOLD}06`,
                border: `1.5px solid ${selected ? `${GOLD}66` : `${GOLD}14`}`,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(opt.value)}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <span className="text-2xl leading-none">{opt.emoji}</span>
              <span
                className="font-serif-kr text-[15px] font-bold leading-tight"
                style={{ color: selected ? GOLD : MEOK }}
              >
                {opt.label}
              </span>
              <span
                className="text-[11px] leading-snug"
                style={{ color: `${GALSAEK}AA` }}
              >
                {opt.desc}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* 다음 */}
      <motion.button
        className="relative z-10 mt-8 w-full rounded-2xl px-8 py-4 text-base font-bold tracking-wider"
        style={{
          background: value
            ? `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`
            : `${GOLD}22`,
          color: value ? '#F6EDD9' : `${GOLD}77`,
          boxShadow: value ? `0 4px 30px ${GOLD}40` : 'none',
        }}
        whileHover={value ? { scale: 1.02 } : {}}
        whileTap={value ? { scale: 0.97 } : {}}
        onClick={value ? onNext : undefined}
        disabled={!value}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        다음
      </motion.button>

      {/* 건너뛰기 = 비공개로 존중 */}
      <motion.button
        type="button"
        className="relative z-10 mt-3 w-full py-2 text-xs"
        style={{ color: `${GALSAEK}AA` }}
        onClick={handleSkip}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        건너뛰기
      </motion.button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Step 5: First Talisman Gift
// ─────────────────────────────────────────────

function StepTalismanGift({
  info,
  loveStatus,
  onComplete,
}: {
  info: BirthInfo;
  loveStatus: LoveStatus | null;
  onComplete: () => void;
}) {
  const [saved, setSaved] = useState(false);
  /* 네이티브 앱에서만: 저장 후 "위젯에도 담을까요?" 질문 단계 */
  const [askWidget, setAskWidget] = useState(false);
  const [widgetDone, setWidgetDone] = useState(false);
  /* 질문을 못 띄울 때 이유를 보여주는 안내 (웹 안내 겸 진단) */
  const [widgetNote, setWidgetNote] = useState('');
  const giftSvgRef = useRef<string | null>(null);
  const saveErrorRef = useRef<string | null>(null);

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
      // 대운의 순행·역행 판정용 — /saju 가 읽는 표기와 같아야 한다
      gender: info.gender ?? undefined,
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
      loveStatus: loveStatus ?? 'private',
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
          description: '몸을 보호하기 위해 늘 지니는 부적',
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
        gender: info.gender ?? undefined,
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
        loveStatus: loveStatus ?? 'private',
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
    } catch (e) {
      // 부적함 저장이 실패해도 온보딩 완료는 막지 않는다
      saveErrorRef.current = e instanceof Error ? e.message : String(e);
      debugToNative(`gift-error: ${saveErrorRef.current}`);
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
    debugToNative(
      `gift-save: bridge=${hasWidgetBridge()} svgReady=${!!giftSvgRef.current}`
    );
    if (hasWidgetBridge() && giftSvgRef.current) {
      setTimeout(() => setAskWidget(true), 900);
    } else {
      if (hasWidgetBridge()) {
        // 브릿지는 있는데 부적 준비가 안 됨 — 원인을 화면에 남긴다
        setWidgetNote(
          `위젯 담기를 준비하지 못했어요 (${saveErrorRef.current ?? '부적 데이터 없음'})`
        );
      } else {
        setWidgetNote('홈 화면 위젯은 수호부 앱에서 지원돼요');
      }
      setTimeout(() => {
        onComplete();
      }, 2200);
    }
  }, [info, loveStatus, onComplete]);

  /* 위젯에 담기 / 나중에 하기 */
  const handleWidgetYes = useCallback(() => {
    if (giftSvgRef.current) {
      void pushTalismanToWidget(giftSvgRef.current, {
        name: '호신부',
        hanja: '護身符',
        savedAt: new Date().toISOString(),
        agingDays: 3, // 서비스로 드리는 부적 — 사흘에 걸쳐 낡아간다
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

  // 삼재의 해면 첫 인사 문구가 달라진다
  const samjaeNow = isSamjae(
    new Date().getFullYear(),
    getSajuYear(info.year, info.month, info.day, effectiveHour(info.hour))
  ).is;

  return (
    <motion.div
      className="flex min-h-full flex-col"
      style={{ padding: '56px 26px 40px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p
          style={{
            fontSize: 12,
            letterSpacing: '0.14em',
            color: 'rgba(46,46,46,0.45)',
          }}
        >
          첫 만남의 선물
        </p>
        <h1
          className="font-serif-kr"
          style={{ marginTop: 12, fontSize: 25, lineHeight: 1.55, color: MEOK }}
        >
          {samjaeNow ? (
            <>
              삼재를 지나는 당신께
              <br />
              호신부를 드립니다
            </>
          ) : (
            <>
              오늘부터 당신 곁에
              <br />
              호신부를 드립니다
            </>
          )}
        </h1>

        <div style={{ marginTop: 30 }}>
          <HosinbuTalisman />
        </div>

        <p
          className="font-serif-kr"
          style={{ marginTop: 26, fontSize: 18, color: MEOK }}
        >
          호신부{' '}
          <span style={{ fontSize: 12, color: 'rgba(122,74,52,0.7)' }}>
            護身符
          </span>
        </p>

        <p
          style={{
            marginTop: 12,
            maxWidth: 290,
            fontSize: 13,
            lineHeight: 2.05,
            color: `${MEOK}BB`,
          }}
        >
          몸과 마음을 지키는 부적이에요. 예로부터 먼 길을 떠나는 이의 품에 넣어
          보내던 것으로, 삼재의 해를 지날 때 곁에 두었습니다.
        </p>

        <div
          className="flex flex-wrap items-center justify-center gap-1.5"
          style={{ marginTop: 20 }}
        >
          {['삼재의 해', '몸과 마음', '늘 지니는 부적'].map((t) => (
            <span
              key={t}
              className="rounded-full"
              style={{
                padding: '3px 10px',
                fontSize: 11.5,
                color: GALSAEK,
                border: '1px solid rgba(122,74,52,0.26)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* 부적함에 모시기 ↔ (네이티브) 위젯 담기 질문 */}
      <div style={{ marginTop: 24 }}>
        <AnimatePresence mode="wait">
          {!askWidget ? (
            <motion.div
              key="save"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <TraditionalButton
                onClick={!saved ? handleSave : undefined}
                disabled={saved}
                className="rounded-lg"
              >
                {saved ? '부적함에 모셨습니다' : '부적함에 모시기'}
              </TraditionalButton>
              {saved && widgetNote && (
                <p
                  className="text-center"
                  style={{ marginTop: 12, fontSize: 12, color: `${GALSAEK}CC` }}
                >
                  {widgetNote}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="widget"
              className="rounded-xl text-center"
              style={{ ...CARD_STYLE, padding: '20px 18px' }}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {!widgetDone ? (
                <>
                  <p
                    className="font-serif-kr"
                    style={{ fontSize: 16, color: MEOK }}
                  >
                    홈 화면 위젯에도 담아드릴까요?
                  </p>
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      lineHeight: 1.9,
                      color: `${GALSAEK}CC`,
                    }}
                  >
                    부적은 몸에 지니고 다닐 때 힘을 낸다고 해요. 위젯에 담아두면
                    휴대폰을 열 때마다 호신부가 당신의 하루를 지켜드려요.
                  </p>
                  <div style={{ marginTop: 16 }}>
                    <TraditionalButton
                      onClick={handleWidgetYes}
                      className="rounded-lg"
                    >
                      위젯으로 두기
                    </TraditionalButton>
                  </div>
                  <button
                    type="button"
                    className="w-full"
                    style={{
                      marginTop: 10,
                      padding: '6px 0',
                      fontSize: 12,
                      color: `${GALSAEK}CC`,
                    }}
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
                  <p
                    className="font-serif-kr"
                    style={{ fontSize: 16, color: MEOK }}
                  >
                    위젯에 담았어요
                  </p>
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      lineHeight: 1.9,
                      color: `${GALSAEK}CC`,
                    }}
                  >
                    홈 화면을 길게 눌러 &lsquo;수호부&rsquo; 위젯을 추가하면 바로
                    만날 수 있어요. 선물 부적은 사흘에 걸쳐 조금씩 낡아가요 — 새
                    부적으로 마음을 다시 채워보세요.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
    gender: null,
  });
  const [loveStatus, setLoveStatus] = useState<LoveStatus | null>(null);

  const totalSteps = 5;

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }, []);

  // 웰컴(0단계)은 고정 화면 — 실기기 iOS 사파리는 내용이 화면에 맞아도
  // 러버밴드 바운스·툴바 접기 스크롤이 생기므로 body 자체를 고정해 차단한다.
  useEffect(() => {
    if (step !== 0) return;
    const html = document.documentElement.style;
    const body = document.body.style;
    html.overflow = 'hidden';
    html.overscrollBehavior = 'none';
    body.position = 'fixed';
    body.inset = '0';
    body.width = '100%';
    body.overflow = 'hidden';
    return () => {
      html.overflow = '';
      html.overscrollBehavior = '';
      body.position = '';
      body.inset = '';
      body.width = '';
      body.overflow = '';
    };
  }, [step]);

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
      className={`hanji-surface relative flex flex-col overflow-x-hidden text-[var(--color-meok)] ${
        step === 0 ? 'overflow-y-hidden' : 'min-h-dvh'
      }`}
      style={
        // 웰컴은 스크롤 없는 고정 화면 — body의 safe-area 패딩을 뺀 정확한 뷰포트 높이
        step === 0
          ? {
              height:
                'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
            }
          : undefined
      }
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
          className={`flex flex-col ${step === 0 ? 'h-full' : 'min-h-dvh'}`}
        >
          {step === 0 && <StepWelcome onNext={goNext} totalSteps={totalSteps} />}
          {step === 1 && (
            <StepBirthInfo
              info={birthInfo}
              onChange={setBirthInfo}
              onNext={goNext}
            />
          )}
          {step === 2 && <StepSajuResult info={birthInfo} onNext={goNext} />}
          {step === 3 && (
            <StepLoveStatus
              value={loveStatus}
              onChange={setLoveStatus}
              onNext={goNext}
            />
          )}
          {step === 4 && (
            <StepTalismanGift
              info={birthInfo}
              loveStatus={loveStatus}
              onComplete={handleComplete}
            />
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
        /* 생년월일 밑줄 입력 — 숫자 증감 화살표는 붓글씨 톤과 어울리지 않는다 */
        input[type='number']::-webkit-outer-spin-button,
        input[type='number']::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      `}</style>
    </div>
  );
}

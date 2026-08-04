'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import BottomTab from '@/components/BottomTab';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import { BackIcon, KnotMotif, LotusMotif } from '@/components/hanji/motifs';
import {
  getSajuDetail,
  getOheng,
  getAnimal,
  isSamjae,
  type Oheng,
  type CheonGan,
  type JiJi,
} from '@/data/saju';
import {
  getSajuReading,
  PILLAR_MEANING_MAP,
  OHENG_INFO,
  OHENG_ORDER,
  BALANCE_LABEL,
  type PillarMeaning,
} from '@/data/saju-interpretation';

// ─────────────────────────────────────────────
// 한지 디자인 토큰 (globals.css의 --color-* 와 동일 값)
// ※ 다크테마 색(#0a0a1a, #D4A853)은 사용하지 않는다.
// ─────────────────────────────────────────────
const JUHONG = '#A72B21'; // --color-juhong 주홍·인주
const MEOK = '#2E2E2E'; // --color-meok 먹
const GALSAEK = '#7A4A34'; // --color-galsaek 짙은 갈색
const SSUK = '#6B7D63'; // --color-ssuk 쑥·세이지
const HWANG = '#DAA017'; // --color-hwang 겨자·황

/** 밝은 한지 배경에서 읽히도록 명도를 낮춘 오행색 (OHENG_INFO.color 와 동일) */
const OHENG_COLORS: Record<Oheng, string> = {
  목: OHENG_INFO['목'].color,
  화: OHENG_INFO['화'].color,
  토: OHENG_INFO['토'].color,
  금: OHENG_INFO['금'].color,
  수: OHENG_INFO['수'].color,
};

/** 오행 한 단어 태그 */
const OHENG_TAG: Record<Oheng, string> = {
  목: '성장',
  화: '열정',
  토: '안정',
  금: '결단',
  수: '지혜',
};

/** 12지시 표기 (지지 index 기준) */
const HOUR_RANGE_LABEL: string[] = [
  '23:00~01:00',
  '01:00~03:00',
  '03:00~05:00',
  '05:00~07:00',
  '07:00~09:00',
  '09:00~11:00',
  '11:00~13:00',
  '13:00~15:00',
  '15:00~17:00',
  '17:00~19:00',
  '19:00~21:00',
  '21:00~23:00',
];

// ─────────────────────────────────────────────
// 저장된 프로필 로드 (SSR 안전 — useEffect 안에서만 호출)
// ─────────────────────────────────────────────

interface SajuProfile {
  name: string;
  birth: { year: number; month: number; day: number; hour: number };
  hourKnown: boolean;
}

function loadSajuProfile(): SajuProfile | null {
  try {
    const raw = localStorage.getItem('bujeok-user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.birth?.year) {
        return {
          name: (u.name || '').trim(),
          birth: {
            year: u.birth.year,
            month: u.birth.month ?? 1,
            day: u.birth.day ?? 1,
            hour: u.birth.hour ?? 12,
          },
          hourKnown: u.birth.hourKnown !== false,
        };
      }
    }
    const p = localStorage.getItem('user_profile');
    if (p) {
      const u = JSON.parse(p);
      if (u?.birthYear) {
        return {
          name: (u.name || '').trim(),
          birth: {
            year: u.birthYear,
            month: u.birthMonth ?? 1,
            day: u.birthDay ?? 1,
            hour: u.birthHour ?? 12,
          },
          hourKnown: u.birthHourKnown !== false,
        };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// ─────────────────────────────────────────────
// 공통 조각
// ─────────────────────────────────────────────

function SectionLabel({
  index,
  title,
  sub,
}: {
  index: number;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
        style={{ background: `${JUHONG}16`, color: JUHONG }}
      >
        {index}
      </span>
      <h2 className="font-serif-kr text-[15px] font-bold" style={{ color: MEOK }}>
        {title}
      </h2>
      {sub && (
        <span className="text-[11px]" style={{ color: `${GALSAEK}AA` }}>
          {sub}
        </span>
      )}
    </div>
  );
}

function Section({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      className="hanji-card rounded-2xl px-4 py-5"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.section>
  );
}

/** 기둥 한 칸 (천간·지지 세로 배치) */
function PillarColumn({
  meaning,
  gan,
  ji,
  highlight,
  faded,
}: {
  meaning: PillarMeaning;
  gan: CheonGan;
  ji: JiJi;
  highlight: boolean;
  faded: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <span
        className="text-[11px] font-bold leading-none"
        style={{ color: highlight ? JUHONG : `${MEOK}AA` }}
      >
        {meaning.label.replace(/\(.*\)/, '')}
        {faded ? '*' : ''}
      </span>
      <div
        className="relative flex w-full flex-col items-center gap-1 rounded-xl px-1 py-3"
        style={{
          background: highlight ? `${JUHONG}12` : `${GALSAEK}0D`,
          border: `1.5px solid ${highlight ? `${JUHONG}66` : `${GALSAEK}26`}`,
          opacity: faded ? 0.55 : 1,
        }}
      >
        {highlight && (
          <span
            className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-[1px] text-[8.5px] font-bold"
            style={{ background: JUHONG, color: '#F6EDD9' }}
          >
            나 자신
          </span>
        )}

        {/* 천간 */}
        <span
          className="font-serif-kr text-[34px] font-bold leading-none"
          style={{ color: OHENG_COLORS[gan.oheng] }}
        >
          {gan.hanja}
        </span>
        <span className="text-[11px] leading-none" style={{ color: `${MEOK}AA` }}>
          {gan.name}
        </span>
        <span
          className="rounded-full px-1.5 py-[1px] text-[9px] font-medium leading-tight"
          style={{
            background: `${OHENG_COLORS[gan.oheng]}16`,
            color: OHENG_COLORS[gan.oheng],
          }}
        >
          {gan.oheng} · {gan.yin ? '음' : '양'}
        </span>

        <div className="my-1 h-px w-6" style={{ background: `${GALSAEK}33` }} />

        {/* 지지 */}
        <span
          className="font-serif-kr text-[34px] font-bold leading-none"
          style={{ color: OHENG_COLORS[ji.oheng] }}
        >
          {ji.hanja}
        </span>
        <span className="text-[11px] leading-none" style={{ color: `${MEOK}AA` }}>
          {ji.name}
        </span>
        <span
          className="rounded-full px-1.5 py-[1px] text-[9px] font-medium leading-tight"
          style={{
            background: `${OHENG_COLORS[ji.oheng]}16`,
            color: OHENG_COLORS[ji.oheng],
          }}
        >
          {ji.oheng} · {ji.yin ? '음' : '양'}
        </span>
        <span className="text-[10px] leading-none" style={{ color: `${GALSAEK}AA` }}>
          {ji.emoji} {ji.animal}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 페이지
// ─────────────────────────────────────────────

export default function SajuDetailPage() {
  const router = useRouter();
  // localStorage 는 클라이언트에만 존재하므로 마운트 후에 한 번 읽는다 (SSR 안전)
  const [loaded, setLoaded] = useState<{ profile: SajuProfile | null } | null>(null);

  useEffect(() => {
    setLoaded({ profile: loadSajuProfile() });
  }, []);

  const ready = loaded !== null;
  const profile = loaded?.profile ?? null;

  const data = useMemo(() => {
    if (!profile) return null;
    const { year, month, day, hour } = profile.birth;

    const detail = getSajuDetail(year, month, day, hour);
    const animal = getAnimal(year, month, day, hour);
    const oheng = getOheng(detail);
    const reading = getSajuReading(detail, oheng, animal);

    const currentYear = new Date().getFullYear();
    const samjae = isSamjae(currentYear, detail.sajuYear);

    // 내 띠의 삼재 3년 찾기 (들삼재가 시작하는 해부터 3년 연속)
    let samjaeStart: number | null = null;
    for (let y = currentYear - 2; y <= currentYear + 13; y++) {
      if (isSamjae(y, detail.sajuYear).type === '들삼재') {
        samjaeStart = y;
        break;
      }
    }
    const samjaeYears =
      samjaeStart === null
        ? []
        : ([
            { year: samjaeStart, type: '들삼재' },
            { year: samjaeStart + 1, type: '눌삼재' },
            { year: samjaeStart + 2, type: '날삼재' },
          ] as const);

    return {
      detail,
      animal,
      oheng,
      reading,
      currentYear,
      samjae,
      samjaeYears,
    };
  }, [profile]);

  /* ── 정보 없음 ─────────────────────────────── */
  if (ready && !data) {
    return (
      <HanjiBackground>
        <TraditionalHeader
          left={
            <button onClick={() => router.back()} aria-label="뒤로가기">
              <BackIcon size={20} />
            </button>
          }
          title="내 사주 풀이"
        />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 pb-32">
          <div className="hanji-card flex w-full flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center">
            <span className="block" style={{ color: `${JUHONG}66` }}>
              <LotusMotif size={34} />
            </span>
            <p className="font-serif-kr text-base font-bold" style={{ color: MEOK }}>
              생년월일을 먼저 입력해주세요
            </p>
            <p className="text-[12.5px] leading-relaxed" style={{ color: `${GALSAEK}CC` }}>
              태어난 날짜와 시각을 알려주시면
              <br />
              사주팔자와 오행을 풀어드릴게요.
            </p>
            <Link
              href="/onboarding"
              className="mt-2 rounded-full px-6 py-2.5 text-[13px] font-bold"
              style={{ background: JUHONG, color: '#F6EDD9' }}
            >
              사주 입력하러 가기
            </Link>
          </div>
        </div>
        <BottomTab />
      </HanjiBackground>
    );
  }

  /* ── 로딩 ──────────────────────────────────── */
  if (!data || !profile) {
    return (
      <HanjiBackground>
        <TraditionalHeader
          left={
            <button onClick={() => router.back()} aria-label="뒤로가기">
              <BackIcon size={20} />
            </button>
          }
          title="내 사주 풀이"
        />
        <div className="mx-auto w-full max-w-md flex-1 px-5 pb-32" />
        <BottomTab />
      </HanjiBackground>
    );
  }

  const { detail, animal, oheng, reading, currentYear, samjae, samjaeYears } = data;
  const { birth, hourKnown, name } = profile;
  const ilgan = reading.ilgan;
  const ilganColor = OHENG_COLORS[ilgan.oheng] ?? JUHONG;
  const maxOheng = Math.max(...OHENG_ORDER.map((o) => oheng[o]), 1);
  const lacking = reading.oheng.lacking ?? [];

  // 시·일·월·년 순
  const pillars: Array<{ meaning: PillarMeaning; gan: CheonGan; ji: JiJi }> = [
    { meaning: PILLAR_MEANING_MAP.hour, gan: detail.hourStem, ji: detail.hourBranch },
    { meaning: PILLAR_MEANING_MAP.day, gan: detail.dayStem, ji: detail.dayBranch },
    { meaning: PILLAR_MEANING_MAP.month, gan: detail.monthStem, ji: detail.monthBranch },
    { meaning: PILLAR_MEANING_MAP.year, gan: detail.yearStem, ji: detail.yearBranch },
  ];

  const hourBranchIdx = Math.floor(((birth.hour + 1) % 24) / 2);

  return (
    <HanjiBackground>
      <TraditionalHeader
        left={
          <button onClick={() => router.back()} aria-label="뒤로가기">
            <BackIcon size={20} />
          </button>
        }
        title="내 사주 풀이"
      />

      <div className="mx-auto w-full max-w-md flex-1 space-y-4 overflow-y-auto px-5 pb-32 pt-1">
        {/* ── 1. 기본 정보 ─────────────────────────── */}
        <Section delay={0}>
          <SectionLabel index={1} title="기본 정보" sub="생년월일시" />

          <div className="mt-4 flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-4xl"
              style={{ border: `1.5px solid ${JUHONG}59` }}
            >
              {animal.emoji}
            </div>
            <div className="min-w-0 flex-1">
              {name && (
                <p className="font-serif-kr text-lg font-bold" style={{ color: MEOK }}>
                  {name}
                </p>
              )}
              <p className="text-[13px] leading-relaxed" style={{ color: `${MEOK}CC` }}>
                양력 {birth.year}년 {birth.month}월 {birth.day}일
              </p>
              <p className="text-[12px] leading-relaxed" style={{ color: `${GALSAEK}CC` }}>
                {hourKnown
                  ? `${detail.hourBranch.name}시 (${HOUR_RANGE_LABEL[hourBranchIdx]})`
                  : '태어난 시각 모름 · 오시(11~13시) 기준 추정'}
              </p>
            </div>
          </div>

          {/* 입춘 안내 */}
          {detail.sajuYear !== birth.year && (
            <p
              className="mt-3 rounded-xl px-3.5 py-2.5 text-[12px] leading-relaxed"
              style={{
                background: `${HWANG}14`,
                border: `1px solid ${HWANG}33`,
                color: `${MEOK}CC`,
              }}
            >
              🌸 입춘(立春) 전 출생이라 사주상 <strong>{detail.sajuYear}년생</strong>으로
              봅니다. 사주에서 한 해는 양력 1월 1일이 아니라 입춘에 시작해요.
            </p>
          )}

          {/* 띠 + 일간 요약 */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div
              className="flex flex-col items-center gap-1 rounded-xl py-3"
              style={{ background: `${GALSAEK}0D`, border: `1px solid ${GALSAEK}26` }}
            >
              <span className="text-[10px]" style={{ color: `${GALSAEK}AA` }}>
                띠 (십이지)
              </span>
              <span className="font-serif-kr text-base font-bold" style={{ color: MEOK }}>
                {animal.emoji} {animal.name}띠
              </span>
              <span className="text-[10.5px]" style={{ color: `${GALSAEK}CC` }}>
                {detail.sajuYear}년 {detail.yearStem.name}
                {detail.yearBranch.name}년생
              </span>
            </div>
            <div
              className="flex flex-col items-center gap-1 rounded-xl py-3"
              style={{ background: `${ilganColor}12`, border: `1px solid ${ilganColor}33` }}
            >
              <span className="text-[10px]" style={{ color: `${GALSAEK}AA` }}>
                일간 (나 자신)
              </span>
              <span
                className="font-serif-kr text-base font-bold"
                style={{ color: ilganColor }}
              >
                {ilgan.emoji} {ilgan.hanja} {ilgan.gan}
              </span>
              <span className="text-[10.5px]" style={{ color: `${GALSAEK}CC` }}>
                {ilgan.oheng} · {ilgan.symbol}
              </span>
            </div>
          </div>

          <p
            className="font-serif-kr mt-4 text-center text-[15px] font-bold leading-[1.6]"
            style={{ color: MEOK }}
          >
            {reading.headline}
          </p>
        </Section>

        {/* ── 2. 사주팔자 상세 ─────────────────────── */}
        <Section delay={0.06}>
          <SectionLabel index={2} title="사주팔자 상세" sub="四柱八字" />
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: `${MEOK}99` }}>
            태어난 연·월·일·시를 각각 두 글자로 적은 것이 사주팔자예요. 기둥 네 개라
            사주(四柱), 글자가 여덟 개라 팔자(八字)입니다. 전통 방식대로 오른쪽이 년주,
            왼쪽이 시주입니다.
          </p>

          <div className="mt-5 grid grid-cols-4 gap-1.5">
            {pillars.map((p) => (
              <PillarColumn
                key={p.meaning.key}
                meaning={p.meaning}
                gan={p.gan}
                ji={p.ji}
                highlight={p.meaning.key === 'day'}
                faded={p.meaning.key === 'hour' && !hourKnown}
              />
            ))}
          </div>

          {/* 기둥별 설명 (전부 펼침) */}
          <div className="mt-5 flex flex-col gap-2.5">
            {pillars.map((p) => {
              const isDay = p.meaning.key === 'day';
              return (
                <div
                  key={p.meaning.key}
                  className="rounded-xl px-4 py-3.5"
                  style={{
                    background: isDay ? `${JUHONG}0B` : `${GALSAEK}0A`,
                    border: `1px solid ${isDay ? `${JUHONG}33` : `${GALSAEK}22`}`,
                  }}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="font-serif-kr text-[13.5px] font-bold"
                      style={{ color: isDay ? JUHONG : MEOK }}
                    >
                      {p.meaning.label}
                    </span>
                    <span
                      className="rounded-full px-2 py-[2px] text-[10px] font-bold"
                      style={{
                        background: `${OHENG_COLORS[p.gan.oheng]}16`,
                        color: OHENG_COLORS[p.gan.oheng],
                      }}
                    >
                      {p.gan.name}
                      {p.ji.name}
                    </span>
                    <span
                      className="rounded-full px-2 py-[2px] text-[10px] font-medium"
                      style={{
                        background: isDay ? `${JUHONG}16` : `${MEOK}0E`,
                        color: isDay ? JUHONG : `${MEOK}AA`,
                      }}
                    >
                      {p.meaning.ageRange}
                    </span>
                    <span className="text-[11px]" style={{ color: `${GALSAEK}CC` }}>
                      {p.meaning.lifeArea}
                    </span>
                  </div>
                  <p
                    className="mt-2 text-[12.5px] leading-relaxed"
                    style={{ color: `${MEOK}BB` }}
                  >
                    <strong>담당하는 자리</strong> · {p.meaning.represents}
                  </p>
                  <p
                    className="mt-1.5 text-[13px] leading-[1.75]"
                    style={{ color: `${MEOK}CC` }}
                  >
                    {p.meaning.simple}
                  </p>
                </div>
              );
            })}
          </div>

          <p
            className="mt-3 text-[10.5px] leading-relaxed"
            style={{ color: `${GALSAEK}99` }}
          >
            {hourKnown
              ? '24절기(만세력) 기준으로 산출되었습니다.'
              : '* 태어난 시간을 몰라 오시(11~13시) 기준으로 추정했어요. 시주는 참고만 해주세요.'}
          </p>
        </Section>

        {/* ── 3. 일간 상세 해설 ────────────────────── */}
        <Section delay={0.12}>
          <SectionLabel index={3} title="나를 나타내는 글자" sub="일간(日干)" />
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: `${MEOK}99` }}>
            일간은 태어난 날의 천간, 사주 여덟 글자 중 &ldquo;나 자신&rdquo;을 뜻하는
            자리예요. 성격을 볼 때 가장 먼저 봅니다.
          </p>

          <div className="mt-5 flex flex-col items-center">
            <div
              className="flex h-28 w-28 flex-col items-center justify-center rounded-2xl"
              style={{
                background: `${ilganColor}12`,
                border: `1.5px solid ${ilganColor}44`,
              }}
            >
              <span
                className="font-serif-kr text-[48px] font-bold leading-none"
                style={{ color: ilganColor }}
              >
                {ilgan.hanja}
              </span>
              <span className="mt-1.5 text-[11.5px]" style={{ color: `${MEOK}88` }}>
                {ilgan.gan} · {ilgan.oheng}({OHENG_INFO[ilgan.oheng].hanja})
              </span>
            </div>

            <p
              className="font-serif-kr mt-4 text-center text-[17px] font-bold leading-snug"
              style={{ color: MEOK }}
            >
              {name ? `${name}님은 ` : '당신은 '}
              <span style={{ color: ilganColor }}>
                {ilgan.emoji} {ilgan.symbol}
              </span>{' '}
              같은 사람이에요
            </p>
            <span
              className="mt-2.5 inline-block rounded-full px-3.5 py-1 text-[12px] font-bold"
              style={{
                background: `${ilganColor}18`,
                color: ilganColor,
                border: `1px solid ${ilganColor}33`,
              }}
            >
              #{ilgan.keyword}
            </span>

            <p
              className="mt-4 text-[13.5px] leading-[1.85]"
              style={{ color: `${MEOK}CC` }}
            >
              {ilgan.personality}
            </p>
          </div>

          {/* 강점 */}
          <div
            className="mt-5 rounded-xl px-4 py-4"
            style={{ background: `${SSUK}12`, border: `1px solid ${SSUK}2E` }}
          >
            <p className="mb-3 text-[12.5px] font-bold" style={{ color: SSUK }}>
              이런 점이 강해요
            </p>
            <ul className="flex flex-col gap-2.5">
              {ilgan.strength.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-2 text-[13.5px] leading-relaxed"
                  style={{ color: `${MEOK}DD` }}
                >
                  <span className="mt-[1px] shrink-0 font-bold" style={{ color: SSUK }}>
                    ✓
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 돌보면 좋은 점 */}
          <div
            className="mt-3 rounded-xl px-4 py-4"
            style={{ background: `${HWANG}14`, border: `1px solid ${HWANG}33` }}
          >
            <p className="mb-3 text-[12.5px] font-bold" style={{ color: '#9A6F0F' }}>
              여기를 돌보면 더 좋아져요
            </p>
            <ul className="flex flex-col gap-2.5">
              {ilgan.caution.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-2 text-[13.5px] leading-relaxed"
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
        </Section>

        {/* ── 4. 오행 상세 ─────────────────────────── */}
        <Section delay={0.18}>
          <SectionLabel index={4} title="내 안의 다섯 기운" sub="오행(五行)" />
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: `${MEOK}99` }}>
            세상 모든 것은 나무·불·흙·쇠·물 다섯 기운으로 이루어져 있어요. 사주 여덟
            글자에 어떤 기운이 많고 적은지 봅니다.
          </p>

          {/* 막대그래프 */}
          <div className="mt-5 grid grid-cols-5 gap-1.5">
            {OHENG_ORDER.map((o, i) => {
              const score = oheng[o];
              const info = OHENG_INFO[o];
              const isDominant = o === reading.oheng.dominant;
              const isLacking = lacking.includes(o);
              return (
                <div key={o} className="flex min-w-0 flex-col items-center gap-1">
                  <span className="text-lg leading-none">{info.emoji}</span>
                  <span
                    className="text-[11px] font-bold tabular-nums"
                    style={{ color: OHENG_COLORS[o] }}
                  >
                    {score}
                  </span>
                  <div className="flex h-[92px] w-full items-end justify-center">
                    <motion.div
                      className="w-full max-w-[36px] rounded-t-md"
                      style={{
                        background: `linear-gradient(to top, ${OHENG_COLORS[o]}DD, ${OHENG_COLORS[o]}77)`,
                        border: isDominant ? `1.5px solid ${OHENG_COLORS[o]}` : 'none',
                      }}
                      initial={{ height: 6 }}
                      animate={{ height: Math.max((score / maxOheng) * 88, 6) }}
                      transition={{ delay: 0.3 + i * 0.09, duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <span
                    className="font-serif-kr text-[13px] font-bold leading-none"
                    style={{ color: OHENG_COLORS[o] }}
                  >
                    {o}
                  </span>
                  <span
                    className="rounded-full px-1.5 py-[1px] text-[9.5px] font-medium leading-tight"
                    style={{
                      background: `${OHENG_COLORS[o]}16`,
                      color: OHENG_COLORS[o],
                    }}
                  >
                    {OHENG_TAG[o]}
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

          {/* 오행별 카드 5개 */}
          <div className="mt-6 flex flex-col gap-3">
            {OHENG_ORDER.map((o) => {
              const info = OHENG_INFO[o];
              const score = oheng[o];
              const color = OHENG_COLORS[o];
              const state: 'strong' | 'weak' | 'mid' =
                score >= 60 ? 'strong' : score <= 35 ? 'weak' : 'mid';

              return (
                <div
                  key={o}
                  className="rounded-xl px-4 py-4"
                  style={{ background: `${color}0B`, border: `1px solid ${color}33` }}
                >
                  {/* 헤더 */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl leading-none">{info.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-serif-kr text-[15px] font-bold leading-tight"
                        style={{ color }}
                      >
                        {o}({info.hanja}) · {info.meaning}
                      </p>
                      <p className="text-[11px] leading-tight" style={{ color: `${GALSAEK}CC` }}>
                        {info.season} · {info.direction}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums"
                      style={{ background: `${color}1E`, color }}
                    >
                      {score}
                    </span>
                  </div>

                  <p
                    className="mt-3 text-[13px] leading-[1.75]"
                    style={{ color: `${MEOK}CC` }}
                  >
                    {info.trait}
                  </p>

                  {/* 많을 때 / 적을 때 */}
                  <div className="mt-3 flex flex-col gap-2">
                    <div
                      className="rounded-lg px-3 py-2.5"
                      style={{
                        background: state === 'strong' ? `${color}16` : `${MEOK}07`,
                        border:
                          state === 'strong'
                            ? `1px solid ${color}4D`
                            : `1px solid ${GALSAEK}1A`,
                      }}
                    >
                      <p
                        className="mb-1 text-[11px] font-bold"
                        style={{ color: state === 'strong' ? color : `${GALSAEK}AA` }}
                      >
                        이 기운이 많을 때
                        {state === 'strong' && ' · 내 사주가 여기예요'}
                      </p>
                      <p
                        className="text-[12.5px] leading-relaxed"
                        style={{
                          color: state === 'strong' ? `${MEOK}DD` : `${MEOK}8A`,
                        }}
                      >
                        {info.whenStrong}
                      </p>
                    </div>

                    <div
                      className="rounded-lg px-3 py-2.5"
                      style={{
                        background: state === 'weak' ? `${color}16` : `${MEOK}07`,
                        border:
                          state === 'weak'
                            ? `1px solid ${color}4D`
                            : `1px solid ${GALSAEK}1A`,
                      }}
                    >
                      <p
                        className="mb-1 text-[11px] font-bold"
                        style={{ color: state === 'weak' ? color : `${GALSAEK}AA` }}
                      >
                        이 기운이 적을 때
                        {state === 'weak' && ' · 내 사주가 여기예요'}
                      </p>
                      <p
                        className="text-[12.5px] leading-relaxed"
                        style={{
                          color: state === 'weak' ? `${MEOK}DD` : `${MEOK}8A`,
                        }}
                      >
                        {info.whenWeak}
                      </p>
                    </div>
                  </div>

                  {/* 보강 방법 */}
                  <div className="mt-3">
                    <p className="mb-1.5 text-[11px] font-bold" style={{ color }}>
                      ⚡ {o} 기운 보강하기
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {info.boostBy.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 text-[12.5px] leading-snug"
                          style={{ color: `${MEOK}BB` }}
                        >
                          <span className="mt-[3px] shrink-0 text-[8px]" style={{ color }}>
                            ●
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 종합 분석 */}
          <div
            className="mt-5 rounded-xl px-4 py-4"
            style={{ background: `${GALSAEK}0D`, border: `1px solid ${GALSAEK}22` }}
          >
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
              <span
                className="rounded-full px-2.5 py-[3px] text-[11px] font-bold"
                style={{
                  background: `${OHENG_COLORS[reading.oheng.dominant]}1E`,
                  color: OHENG_COLORS[reading.oheng.dominant],
                }}
              >
                {OHENG_INFO[reading.oheng.dominant].emoji} {reading.oheng.dominant} 기운
                우세
              </span>
              <span
                className="rounded-full px-2.5 py-[3px] text-[11px] font-medium"
                style={{ background: `${MEOK}0E`, color: `${MEOK}AA` }}
              >
                {BALANCE_LABEL[reading.oheng.balance]}
              </span>
            </div>
            <p className="text-[13.5px] leading-[1.85]" style={{ color: `${MEOK}CC` }}>
              {reading.oheng.summary}
            </p>
            <p
              className="mt-3 border-t pt-3 text-[13px] leading-[1.8]"
              style={{ borderColor: `${GALSAEK}22`, color: `${MEOK}AA` }}
            >
              💡 {reading.oheng.advice}
            </p>
          </div>
        </Section>

        {/* ── 5. 삼재 ──────────────────────────────── */}
        <Section delay={0.24}>
          <SectionLabel index={5} title="삼재 보기" sub="三災" />

          <div
            className="mt-4 rounded-xl px-4 py-4"
            style={{
              background: samjae.is ? `${JUHONG}12` : `${SSUK}12`,
              border: `1px solid ${samjae.is ? `${JUHONG}3D` : `${SSUK}2E`}`,
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none">{samjae.is ? '⚠️' : '🍃'}</span>
              <div className="min-w-0 flex-1">
                <p
                  className="font-serif-kr text-[14.5px] font-bold"
                  style={{ color: samjae.is ? JUHONG : SSUK }}
                >
                  {samjae.is
                    ? `${currentYear}년은 삼재의 해예요${samjae.type ? ` · ${samjae.type}` : ''}`
                    : `${currentYear}년은 삼재가 아니에요`}
                </p>
                <p
                  className="mt-1.5 text-[12.5px] leading-relaxed"
                  style={{ color: `${MEOK}BB` }}
                >
                  {samjae.is
                    ? '조금 더 신중하게 지내면 좋은 해예요. 너무 걱정하지 마시고, 큰 결정 앞에서 한 번 더 살펴보는 정도면 충분합니다.'
                    : '올해는 삼재의 기운이 비껴가 있어요. 하고 싶던 일을 시작해보기 좋은 때입니다.'}
                </p>
              </div>
            </div>
          </div>

          {/* 삼재란 */}
          <div
            className="mt-3 rounded-xl px-4 py-4"
            style={{ background: `${GALSAEK}0A`, border: `1px solid ${GALSAEK}22` }}
          >
            <p className="text-[12.5px] font-bold" style={{ color: GALSAEK }}>
              삼재(三災)가 뭔가요?
            </p>
            <p
              className="mt-2 text-[13px] leading-[1.8]"
              style={{ color: `${MEOK}CC` }}
            >
              삼재는 수재(水災)·화재(火災)·풍재(風災) 세 가지 재앙을 뜻해요. 띠에 따라{' '}
              <strong>12년 주기 중 3년</strong> 동안 든다고 보며, 들어오는 해가
              들삼재(入三災), 머무는 해가 눌삼재(留三災), 나가는 해가 날삼재(出三災)입니다.
              나쁜 일이 정해졌다는 뜻이 아니라 &ldquo;조금 더 조심하며 지내자&rdquo;는
              옛 어른들의 당부에 가깝습니다.
            </p>
          </div>

          {/* 내 띠의 삼재 3년 */}
          {samjaeYears.length > 0 && (
            <div className="mt-3">
              <p
                className="mb-2 text-[12px] font-bold"
                style={{ color: `${GALSAEK}CC` }}
              >
                {animal.emoji} {animal.name}띠의 삼재 3년
              </p>
              <div className="grid grid-cols-3 gap-2">
                {samjaeYears.map((s) => {
                  const isNow = s.year === currentYear;
                  return (
                    <div
                      key={s.year}
                      className="flex flex-col items-center gap-1 rounded-xl py-3"
                      style={{
                        background: isNow ? `${JUHONG}12` : `${GALSAEK}0A`,
                        border: `1px solid ${isNow ? `${JUHONG}59` : `${GALSAEK}22`}`,
                      }}
                    >
                      <span
                        className="font-serif-kr text-[15px] font-bold tabular-nums leading-none"
                        style={{ color: isNow ? JUHONG : MEOK }}
                      >
                        {s.year}
                      </span>
                      <span
                        className="text-[11px] leading-none"
                        style={{ color: isNow ? JUHONG : `${GALSAEK}CC` }}
                      >
                        {s.type}
                      </span>
                      {isNow && (
                        <span
                          className="rounded-full px-1.5 py-[1px] text-[9px] font-bold"
                          style={{ background: JUHONG, color: '#F6EDD9' }}
                        >
                          올해
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p
                className="mt-2 text-[11px] leading-relaxed"
                style={{ color: `${GALSAEK}99` }}
              >
                삼재는 사주 기준 연도(입춘 기준)로 판정합니다.
              </p>
            </div>
          )}
        </Section>

        {/* ── 6. 하단 고지 ─────────────────────────── */}
        <motion.div
          className="flex items-start gap-2 rounded-xl px-4 py-3.5"
          style={{ background: `${GALSAEK}0D`, border: `1px dashed ${GALSAEK}33` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="mt-[1px] block shrink-0" style={{ color: `${GALSAEK}99` }}>
            <KnotMotif size={18} />
          </span>
          <p className="text-[11.5px] leading-[1.8]" style={{ color: `${GALSAEK}CC` }}>
            이 풀이는 전통 명리학을 바탕으로 한 참고 자료이며, 정해진 운명을 뜻하지
            않습니다.
          </p>
        </motion.div>

        <Link
          href="/onboarding"
          className="flex w-full items-center justify-center rounded-xl py-3 text-[12.5px] font-medium"
          style={{ border: `1px solid ${JUHONG}59`, color: JUHONG }}
        >
          사주 정보 수정하기
        </Link>
      </div>

      <BottomTab />
    </HanjiBackground>
  );
}

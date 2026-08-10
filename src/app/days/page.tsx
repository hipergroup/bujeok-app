'use client';

// ============================================================
// 좋은 날 고르기 (택일 擇日)
// 나의 사주와 그날의 일진(日辰)을 맞춰 한 달의 흐름을 달력으로 본다.
// 전통 택일 관습을 참고한 재미·참고용 정보 — 겁주지 않는다.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import BottomTab from '@/components/BottomTab';
import { getSaju, getOheng, type SajuResult } from '@/data/saju';
import { getYongsin, type YongsinResult } from '@/data/yongsin';
import {
  getMonthRatings,
  TAEGIL_PURPOSES,
  LEVEL_LABEL,
  type TaegilPurpose,
  type DayRating,
} from '@/data/taegil';

// 한지 팔레트 (사주 페이지와 동일)
const JUHONG = '#A72B21';
const MEOK = '#2B2B2B';
const GALSAEK = '#7A4A34';
const NAMSAEK = '#1F4E5F';
const SSUK = '#5C7350';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface Profile {
  name: string;
  birth: { year: number; month: number; day: number; hour: number };
}

function loadProfile(): Profile | null {
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
        };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export default function DaysPage() {
  const [loaded, setLoaded] = useState<{ profile: Profile | null } | null>(
    null
  );
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1-12
  const [purpose, setPurpose] = useState<TaegilPurpose>('전체');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    setLoaded({ profile: loadProfile() });
  }, []);

  // 내 사주 · 용신 (프로필 있을 때만)
  const my = useMemo(() => {
    if (!loaded?.profile) return null;
    const b = loaded.profile.birth;
    const saju: SajuResult = getSaju(b.year, b.month, b.day, b.hour);
    const yongsin: YongsinResult = getYongsin(saju, getOheng(saju));
    return { saju, yongsin };
  }, [loaded]);

  // 한 달치 등급
  const ratings: DayRating[] = useMemo(() => {
    if (!my) return [];
    return getMonthRatings(my.saju, my.yongsin, viewYear, viewMonth, purpose);
  }, [my, viewYear, viewMonth, purpose]);

  const best3 = useMemo(() => {
    const isThisMonth =
      viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1;
    return [...ratings]
      .filter((r) => !isThisMonth || r.date.getDate() >= today.getDate())
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter((r) => r.score >= 2)
      .sort((a, b) => a.date.getDate() - b.date.getDate());
  }, [ratings, viewYear, viewMonth, today]);

  const selected =
    selectedDay !== null
      ? (ratings.find((r) => r.date.getDate() === selectedDay) ?? null)
      : null;

  const firstWeekday = new Date(viewYear, viewMonth - 1, 1).getDay();

  const moveMonth = (delta: number) => {
    let y = viewYear;
    let m = viewMonth + delta;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    // 만세력 데이터 범위 보호 (1900~2100)
    if (y < 1901 || y > 2099) return;
    setViewYear(y);
    setViewMonth(m);
    setSelectedDay(null);
  };

  const levelStyle = (r: DayRating, isToday: boolean, isSel: boolean) => {
    const base: React.CSSProperties = {
      border: `1.2px solid ${
        isSel ? NAMSAEK : isToday ? JUHONG : `${GALSAEK}1A`
      }`,
    };
    switch (r.level) {
      case 'best':
        return { ...base, background: `${JUHONG}14`, color: JUHONG };
      case 'good':
        return { ...base, background: `${SSUK}14`, color: SSUK };
      case 'normal':
        return { ...base, background: `${GALSAEK}06`, color: `${MEOK}99` };
      case 'careful':
        return { ...base, background: `${MEOK}08`, color: `${MEOK}55` };
    }
  };

  return (
    <HanjiBackground>
      <div className="mx-auto min-h-dvh max-w-lg pb-32">
        <TraditionalHeader title="좋은 날 고르기" showSeal />

        <main className="px-5">
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: GALSAEK }}
          >
            전통 택일(擇日) 관습을 참고해, 나의 사주와 그날의
            일진(日辰)이 맞는 날을 찾아드려요.
          </p>

          {/* 프로필 없음 → 온보딩 유도 */}
          {loaded && !loaded.profile && (
            <div
              className="hanji-card mt-5 rounded-2xl px-5 py-6 text-center"
              style={{ border: `1px solid ${GALSAEK}30` }}
            >
              <p className="text-[28px]">📅</p>
              <p
                className="mt-2 font-serif-kr text-[15px] font-bold"
                style={{ color: MEOK }}
              >
                내 사주를 알아야 날을 고를 수 있어요
              </p>
              <p
                className="mt-1.5 text-[12px] leading-relaxed"
                style={{ color: `${MEOK}99` }}
              >
                생년월일을 알려주시면 나에게 맞는
                <br />
                좋은 날을 달력으로 보여드려요.
              </p>
              <Link
                href="/onboarding"
                className="mt-4 inline-block rounded-full px-6 py-2.5 text-[13px] font-bold"
                style={{ background: JUHONG, color: '#F6EDD9' }}
              >
                사주 입력하러 가기
              </Link>
            </div>
          )}

          {my && (
            <>
              {/* 목적 필터 */}
              <div className="-mx-5 mt-4 overflow-x-auto px-5">
                <div className="flex w-max gap-1.5">
                  {TAEGIL_PURPOSES.map((p) => {
                    const on = p === purpose;
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setPurpose(p);
                          setSelectedDay(null);
                        }}
                        className="rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all active:scale-95"
                        style={{
                          background: on ? JUHONG : `${GALSAEK}0E`,
                          color: on ? '#F6EDD9' : GALSAEK,
                          border: `1px solid ${on ? JUHONG : `${GALSAEK}26`}`,
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 이번 달 베스트 */}
              {best3.length > 0 && (
                <div
                  className="mt-4 rounded-xl px-4 py-3"
                  style={{
                    background: `${JUHONG}0A`,
                    border: `1px solid ${JUHONG}2A`,
                  }}
                >
                  <p
                    className="text-[11.5px] font-bold"
                    style={{ color: JUHONG }}
                  >
                    ⭐ {viewMonth}월의 좋은 날
                    {purpose !== '전체' ? ` · ${purpose}` : ''}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {best3.map((r) => (
                      <button
                        key={r.date.getDate()}
                        onClick={() => setSelectedDay(r.date.getDate())}
                        className="rounded-full px-3 py-1 text-[12px] font-bold active:scale-95"
                        style={{
                          background: `${JUHONG}14`,
                          color: JUHONG,
                          border: `1px solid ${JUHONG}30`,
                        }}
                      >
                        {r.date.getDate()}일 ·{' '}
                        {r.iljinGan.name}
                        {r.iljinJi.name}일
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 달력 헤더 */}
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() => moveMonth(-1)}
                  aria-label="이전 달"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[16px] active:scale-90"
                  style={{ background: `${GALSAEK}0E`, color: GALSAEK }}
                >
                  ◀
                </button>
                <p
                  className="font-serif-kr text-[16px] font-bold"
                  style={{ color: MEOK }}
                >
                  {viewYear}년 {viewMonth}월
                </p>
                <button
                  onClick={() => moveMonth(1)}
                  aria-label="다음 달"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[16px] active:scale-90"
                  style={{ background: `${GALSAEK}0E`, color: GALSAEK }}
                >
                  ▶
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="mt-3 grid grid-cols-7 gap-1">
                {WEEKDAYS.map((w, i) => (
                  <p
                    key={w}
                    className="text-center text-[10.5px] font-bold"
                    style={{
                      color:
                        i === 0 ? JUHONG : i === 6 ? NAMSAEK : `${GALSAEK}AA`,
                    }}
                  >
                    {w}
                  </p>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: firstWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {ratings.map((r) => {
                  const d = r.date.getDate();
                  const isToday =
                    viewYear === today.getFullYear() &&
                    viewMonth === today.getMonth() + 1 &&
                    d === today.getDate();
                  const isSel = selectedDay === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(isSel ? null : d)}
                      className="flex aspect-square flex-col items-center justify-center rounded-lg transition-transform active:scale-90"
                      style={levelStyle(r, isToday, isSel)}
                    >
                      <span className="text-[12.5px] font-bold tabular-nums leading-none">
                        {d}
                      </span>
                      <span className="mt-0.5 text-[8px] leading-none">
                        {r.level === 'best'
                          ? '★'
                          : r.level === 'good'
                            ? '●'
                            : r.level === 'careful'
                              ? '—'
                              : '·'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 범례 */}
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                {(
                  [
                    ['best', '★ 아주 좋음', JUHONG],
                    ['good', '● 좋음', SSUK],
                    ['normal', '· 무난', `${MEOK}88`],
                    ['careful', '— 쉬어가기', `${MEOK}55`],
                  ] as const
                ).map(([k, label, color]) => (
                  <span
                    key={k}
                    className="text-[10.5px] font-medium"
                    style={{ color }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* 선택한 날 상세 */}
              <AnimatePresence mode="wait">
                {selected && (
                  <motion.div
                    key={`${viewMonth}-${selected.date.getDate()}-${purpose}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="hanji-card mt-4 rounded-2xl px-5 py-4"
                    style={{ border: `1px solid ${GALSAEK}30` }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className="font-serif-kr text-[15px] font-bold"
                        style={{ color: MEOK }}
                      >
                        {viewMonth}월 {selected.date.getDate()}일
                      </p>
                      <span
                        className="rounded-full px-2 py-[2px] text-[10.5px] font-bold"
                        style={{
                          background: `${NAMSAEK}10`,
                          color: NAMSAEK,
                        }}
                      >
                        {selected.iljinGan.name}
                        {selected.iljinJi.name}(
                        {selected.iljinGan.hanja}
                        {selected.iljinJi.hanja})일
                      </span>
                      <span
                        className="rounded-full px-2 py-[2px] text-[10.5px] font-bold"
                        style={{
                          background:
                            selected.level === 'best'
                              ? `${JUHONG}14`
                              : selected.level === 'good'
                                ? `${SSUK}14`
                                : selected.level === 'careful'
                                  ? `${MEOK}0C`
                                  : `${GALSAEK}10`,
                          color:
                            selected.level === 'best'
                              ? JUHONG
                              : selected.level === 'good'
                                ? SSUK
                                : selected.level === 'careful'
                                  ? `${MEOK}77`
                                  : GALSAEK,
                        }}
                      >
                        {LEVEL_LABEL[selected.level]}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1.5">
                      {selected.reasons.map((reason, i) => (
                        <li
                          key={i}
                          className="flex gap-1.5 text-[12.5px] leading-relaxed"
                          style={{ color: `${MEOK}CC` }}
                        >
                          <span style={{ color: `${GALSAEK}88` }}>·</span>
                          {reason}
                        </li>
                      ))}
                    </ul>

                    {(selected.level === 'best' ||
                      selected.level === 'good') && (
                      <Link
                        href="/talisman"
                        className="mt-4 block rounded-full py-2.5 text-center text-[12.5px] font-bold active:scale-[0.98]"
                        style={{
                          background: JUHONG,
                          color: '#F6EDD9',
                        }}
                      >
                        ✨ 이 날을 위한 부적 준비하기
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <p
                className="mt-4 text-[10.5px] leading-relaxed"
                style={{ color: `${GALSAEK}88` }}
              >
                전통 택일 관습을 참고한 재미·참고용 정보예요. 중요한 결정은
                여러 사정을 두루 살펴 정하시길 바라요.
              </p>
            </>
          )}
        </main>
      </div>
      <BottomTab />
    </HanjiBackground>
  );
}

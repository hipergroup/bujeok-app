'use client';

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import BottomTab from '@/components/BottomTab';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import { TOTAL_TALISMAN_COUNT } from '@/data/talismans';
import { getSaju, getOheng, type SajuResult } from '@/data/saju';
import { getDailyFortune } from '@/data/fortune';
import { CRISIS_HOTLINES, SAFETY_DISCLAIMER, telHref } from '@/lib/crisis-detection';
import {
  ScrollMotif,
  BookMotif,
  FlameMotif,
  BellIcon,
  TrashMotif,
  InfoMotif,
  PhoneMotif,
  BrushTabIcon,
} from '@/components/hanji/motifs';
import AnimalMotif from '@/components/hanji/AnimalMotif';

/* ── 온보딩이 저장한 프로필 로드 ───────────────────── */

interface Profile {
  name: string;
  animal: string;
  animalEmoji: string;
  birth: { year: number; month: number; day: number; hour: number };
  sajuText?: { year: string; month: string; day: string; hour: string };
  samjae?: { is: boolean; type: string | null };
}

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem('bujeok-user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.birth?.year) {
        return {
          name: u.name || '수호자',
          animal: u.animal || '',
          animalEmoji: u.animalEmoji || '✨',
          birth: {
            year: u.birth.year,
            month: u.birth.month ?? 1,
            day: u.birth.day ?? 1,
            hour: u.birth.hour ?? 12,
          },
          sajuText: u.saju,
          samjae: u.samjae,
        };
      }
    }
    const p = localStorage.getItem('user_profile');
    if (p) {
      const u = JSON.parse(p);
      if (u?.birthYear) {
        return {
          name: u.name || '수호자',
          animal: u.animal || '',
          animalEmoji: u.animalEmoji || '✨',
          birth: {
            year: u.birthYear,
            month: u.birthMonth ?? 1,
            day: u.birthDay ?? 1,
            hour: u.birthHour ?? 12,
          },
          sajuText: u.saju,
          samjae: u.samjae,
        };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/* ── 연속 방문 계산 (방문일 기록 기반) ─────────────── */

function trackVisitStreak(): number {
  try {
    const key = 'bujeok-visit-log';
    const today = new Date();
    const dateStr = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const log: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (!log.includes(dateStr(today))) log.push(dateStr(today));
    // 최근 60일만 유지
    const trimmed = log.slice(-60);
    localStorage.setItem(key, JSON.stringify(trimmed));

    let streak = 0;
    const cursor = new Date(today);
    while (trimmed.includes(dateStr(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  } catch {
    return 1;
  }
}

/* ── 운세 히스토리 미니 차트 ───────────────────────── */

function FortuneChart({
  scores,
  labels,
}: {
  scores: number[];
  labels: string[];
}) {
  const maxH = 48;
  return (
    <div className="flex items-end justify-between gap-1.5 px-2">
      {scores.map((score, i) => {
        const h = Math.max(8, (score / 100) * maxH);
        const isToday = i === scores.length - 1;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-[var(--color-galsaek)] opacity-70">
              {score}
            </span>
            <motion.div
              className="w-5 rounded-sm"
              style={{
                backgroundColor: isToday
                  ? 'var(--color-juhong)'
                  : 'rgba(218, 160, 23, 0.55)',
              }}
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            />
            <span
              className={`text-[10px] ${
                isToday
                  ? 'font-bold text-[var(--color-juhong)]'
                  : 'text-[var(--color-galsaek)] opacity-70'
              }`}
            >
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── 오행 미니 차트 (밝은 배경용 색) ────────────────── */

function OhaengChart({
  values,
}: {
  values: { 목: number; 화: number; 토: number; 금: number; 수: number };
}) {
  const elements: { name: keyof typeof values; color: string; label: string }[] = [
    { name: '목', color: '#3D8B40', label: '木' },
    { name: '화', color: '#C0392B', label: '火' },
    { name: '토', color: '#C08A12', label: '土' },
    { name: '금', color: '#8D8778', label: '金' },
    { name: '수', color: '#1F6FB5', label: '水' },
  ];
  const max = Math.max(...Object.values(values), 1);

  return (
    <div className="flex items-end justify-between gap-2">
      {elements.map((el) => {
        const val = values[el.name] ?? 0;
        const pct = (val / max) * 100;
        return (
          <div key={el.name} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] text-[var(--color-galsaek)] opacity-70">
              {val}
            </span>
            <motion.div
              className="w-full rounded-sm"
              style={{ backgroundColor: el.color }}
              initial={{ height: 0 }}
              animate={{ height: Math.max(6, pct * 0.4) }}
              transition={{ duration: 0.6 }}
            />
            <span className="text-[10px] font-bold" style={{ color: el.color }}>
              {el.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── 설정 행 ───────────────────────────────────────── */

function SettingsRow({
  icon,
  label,
  href,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const cls = `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
    danger
      ? 'text-red-800 hover:bg-red-900/5'
      : 'text-[var(--color-meok)] hover:bg-[rgba(122,74,52,0.06)]'
  }`;
  const inner = (
    <>
      <span className="flex h-5 w-5 items-center justify-center opacity-80">{icon}</span>
      <span className="flex-1 text-sm">{label}</span>
      <span className="text-xs text-[var(--color-galsaek)] opacity-50">›</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

/* ── 서비스 안내 (안전 고지 + 상담 전화) ────────────── */

function ServiceInfoSheet({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-info-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#132433]/75 backdrop-blur-md sm:items-center"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-[#e6ded3] bg-[#fbf8f4] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:rounded-3xl"
      >
        <h2
          id="service-info-title"
          className="text-center text-[17px] font-semibold text-[#2b3d4e]"
        >
          서비스 안내
        </h2>

        <p className="mt-4 whitespace-pre-line text-center text-[13px] leading-[1.9] text-[#5a6b7a]">
          {SAFETY_DISCLAIMER}
        </p>

        <div className="mt-6">
          <p className="mb-2.5 text-center text-[12px] font-medium text-[#7b93a8]">
            24시간 상담 전화
          </p>
          <div className="flex flex-col gap-2.5">
            {CRISIS_HOTLINES.map((h) => (
              <a
                key={h.number}
                href={telHref(h.number)}
                className="flex items-center gap-3 rounded-2xl border border-[#c9dcec] bg-[#eef4fa] px-4 py-3.5 text-[#22384d] shadow-sm transition-all duration-200 hover:bg-[#e2edf7] active:scale-[0.98]"
              >
                <span className="leading-none text-[#4d677f]" aria-hidden="true">
                  <PhoneMotif size={20} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col items-start">
                  <span className="text-[13px] leading-tight text-[#4d677f]">{h.name}</span>
                  <span className="mt-0.5 text-[11px] leading-tight text-[#7b93a8]">
                    {h.desc}
                  </span>
                </span>
                <span className="text-lg font-semibold tabular-nums tracking-tight">
                  {h.number}
                </span>
              </a>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-[11.5px] leading-[1.8] text-[#8d8275]">
          혼자 감당하기 어려운 순간에는 언제든 전화해 주세요.
          <br />
          이야기를 들어줄 사람이 24시간 기다리고 있어요.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full border border-[#dcd5cb] py-3 text-[13.5px] font-medium text-[#6f7f8d] transition-all duration-200 hover:bg-[#f2ede6] active:scale-[0.98]"
        >
          닫기
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════ 마이페이지 ══════════════════ */

export default function MyPage() {
  const [showServiceInfo, setShowServiceInfo] = useState(false);
  const [collectedCount, setCollectedCount] = useState(0);
  const [streakDays, setStreakDays] = useState(1);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setStreakDays(trackVisitStreak());
    try {
      const stored = localStorage.getItem('bujeok-collection');
      if (stored) {
        setCollectedCount((JSON.parse(stored) as Array<{ id: string }>).length);
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  /* 온보딩 생년월일 → 사주·오행·최근 7일 운세 (실데이터) */
  const saju: SajuResult | null = useMemo(() => {
    if (!profile) return null;
    const b = profile.birth;
    return getSaju(b.year, b.month, b.day, b.hour);
  }, [profile]);

  const ohaeng = useMemo(() => (saju ? getOheng(saju) : null), [saju]);

  const fortuneHistory = useMemo(() => {
    if (!saju) return null;
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const scores: number[] = [];
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      scores.push(getDailyFortune(saju, d).score * 20);
      labels.push(i === 0 ? '오늘' : days[d.getDay()]);
    }
    return { scores, labels };
  }, [saju]);

  const handleDataReset = () => {
    if (window.confirm('모든 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <HanjiBackground>
      <TraditionalHeader title="마이페이지" />

      <div className="mx-auto w-full max-w-md flex-1 space-y-4 overflow-y-auto px-5 pb-28 pt-1">
        {/* ── Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="hanji-card rounded-2xl p-5"
        >
          {ready && !profile ? (
            /* 온보딩 전 상태 */
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <p className="font-serif-kr text-sm font-bold text-[var(--color-meok)]">
                아직 사주 정보가 없어요
              </p>
              <p className="text-xs text-[var(--color-galsaek)]">
                생년월일을 알려주시면 사주와 운세를 보여드려요.
              </p>
              <Link
                href="/onboarding"
                className="rounded-full bg-[var(--color-juhong)] px-5 py-2 text-xs font-bold text-[#F6EDD9]"
              >
                사주 입력하러 가기
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-[var(--color-juhong)]"
                  style={{ border: '1.5px solid rgba(167,43,33,0.35)' }}
                >
                  <AnimalMotif animal={profile?.animal} size={36} />
                </div>
                <div className="flex-1">
                  <h2 className="font-serif-kr text-lg font-bold text-[var(--color-meok)]">
                    {profile?.name ?? '수호자'}
                  </h2>
                  <p className="text-sm text-[var(--color-galsaek)]">
                    {profile?.animal ? `${profile.animal}띠` : ''}
                    {profile?.samjae?.is && (
                      <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-[var(--color-juhong)]" style={{ border: '1px solid rgba(167,43,33,0.4)' }}>
                        {profile.samjae.type ?? '삼재'} 해
                      </span>
                    )}
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="rounded-lg px-3 py-1.5 text-xs text-[var(--color-juhong)] transition"
                  style={{ border: '1px solid rgba(167,43,33,0.35)' }}
                >
                  사주 다시보기
                </Link>
              </div>

              {/* 사주팔자 네 기둥 */}
              {profile?.sajuText && (
                <div className="mt-4 grid grid-cols-4 gap-1.5">
                  {(
                    [
                      ['년주', profile.sajuText.year],
                      ['월주', profile.sajuText.month],
                      ['일주', profile.sajuText.day],
                      ['시주', profile.sajuText.hour],
                    ] as const
                  ).map(([label, value]) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-0.5 rounded-lg py-2"
                      style={{ border: '1px solid rgba(122,74,52,0.25)' }}
                    >
                      <span className="text-[9px] text-[var(--color-galsaek)] opacity-70">
                        {label}
                      </span>
                      <span className="font-serif-kr text-sm font-bold text-[var(--color-meok)]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Ohaeng mini chart */}
              {ohaeng && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold text-[var(--color-galsaek)]">
                    오행 분포
                  </p>
                  <OhaengChart values={ohaeng} />
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: '받은 부적', value: `${collectedCount}개`, icon: <ScrollMotif size={20} /> },
            { label: '수집 종류', value: `${collectedCount}/${TOTAL_TALISMAN_COUNT}`, icon: <BookMotif size={20} /> },
            { label: '연속 방문', value: `${streakDays}일`, icon: <FlameMotif size={20} /> },
          ].map((stat) => (
            <div
              key={stat.label}
              className="hanji-card flex flex-col items-center gap-1 rounded-xl p-4"
            >
              <span className="flex h-6 items-center text-[var(--color-juhong)] opacity-80">{stat.icon}</span>
              <span className="font-serif-kr text-base font-bold text-[var(--color-meok)]">
                {stat.value}
              </span>
              <span className="text-[10px] text-[var(--color-galsaek)] opacity-80">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* ── Fortune History ── */}
        {fortuneHistory && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hanji-card rounded-2xl p-5"
          >
            <h3 className="mb-4 font-serif-kr text-sm font-bold text-[var(--color-meok)]">
              운세 흐름 (최근 7일)
            </h3>
            <FortuneChart scores={fortuneHistory.scores} labels={fortuneHistory.labels} />
          </motion.div>
        )}

        {/* ── Settings ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="hanji-card rounded-2xl py-1"
        >
          <SettingsRow icon="🔮" label="내 사주 풀이" href="/saju" />
          <SettingsRow icon={<BookMotif size={18} />} label="부적 도감" href="/encyclopedia" />
          <SettingsRow icon="📚" label="사주 용어 사전" href="/glossary" />
          <SettingsRow icon={<BrushTabIcon size={18} />} label="사주 정보 수정" href="/onboarding" />
          <SettingsRow
            icon={<BellIcon size={18} />}
            label="알림 설정"
            onClick={() => alert('알림 설정은 준비 중이에요 🙏')}
          />
          <SettingsRow icon={<TrashMotif size={18} />} label="데이터 초기화" danger onClick={handleDataReset} />
          <SettingsRow
            icon={<InfoMotif size={18} />}
            label="서비스 안내"
            onClick={() => setShowServiceInfo(true)}
          />
        </motion.div>

        {/* Safety disclaimer */}
        <p className="whitespace-pre-line text-center text-[10px] leading-[1.7] text-[var(--color-galsaek)] opacity-60">
          {SAFETY_DISCLAIMER}
        </p>

        {/* App version */}
        <p className="text-center text-[10px] text-[var(--color-galsaek)] opacity-40">
          수호부 v1.1
        </p>
      </div>

      <AnimatePresence>
        {showServiceInfo && <ServiceInfoSheet onClose={() => setShowServiceInfo(false)} />}
      </AnimatePresence>

      <BottomTab />
    </HanjiBackground>
  );
}

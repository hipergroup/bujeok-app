'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import BottomTab from '@/components/BottomTab';
import { TOTAL_TALISMAN_COUNT } from '@/lib/talisman-data';
import { CRISIS_HOTLINES, SAFETY_DISCLAIMER, telHref } from '@/lib/crisis-detection';

// ── Mini chart for fortune history ──
function FortuneChart({ scores }: { scores: number[] }) {
  const maxH = 48;
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div className="flex items-end justify-between gap-1.5 px-2">
      {scores.map((score, i) => {
        const h = Math.max(8, (score / 100) * maxH);
        const isToday = i === scores.length - 1;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-zinc-500">{score}</span>
            <motion.div
              className={`w-5 rounded-sm ${isToday ? 'bg-amber-500' : 'bg-amber-800/60'}`}
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            />
            <span className={`text-[10px] ${isToday ? 'font-bold text-amber-300' : 'text-zinc-600'}`}>
              {days[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Ohaeng (Five Elements) mini chart ──
function OhaengChart({ values }: { values: Record<string, number> }) {
  const elements = [
    { name: '목', color: '#4ade80', label: '木' },
    { name: '화', color: '#f87171', label: '火' },
    { name: '토', color: '#fbbf24', label: '土' },
    { name: '금', color: '#e5e7eb', label: '金' },
    { name: '수', color: '#60a5fa', label: '水' },
  ];
  const max = Math.max(...Object.values(values), 1);

  return (
    <div className="flex items-end justify-between gap-2">
      {elements.map((el) => {
        const val = values[el.name] ?? 0;
        const pct = (val / max) * 100;
        return (
          <div key={el.name} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] text-zinc-500">{val}</span>
            <motion.div
              className="w-full rounded-sm"
              style={{ backgroundColor: el.color }}
              initial={{ height: 0 }}
              animate={{ height: Math.max(6, pct * 0.4) }}
              transition={{ duration: 0.6 }}
            />
            <span className="text-[10px] text-zinc-400" style={{ color: el.color }}>
              {el.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Settings row ──
function SettingsRow({
  icon,
  label,
  href,
  danger,
  onClick,
}: {
  icon: string;
  label: string;
  href?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const cls = `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
    danger ? 'text-red-400 hover:bg-red-900/10' : 'text-zinc-300 hover:bg-white/[0.04]'
  }`;
  const inner = (
    <>
      <span className="text-base">{icon}</span>
      <span className="flex-1 text-sm">{label}</span>
      <span className="text-xs text-zinc-600">›</span>
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

// ── 서비스 안내 (안전 고지 + 상담 전화) ──
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
        <h2 id="service-info-title" className="text-center text-[17px] font-semibold text-[#2b3d4e]">
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
                <span className="text-xl leading-none" aria-hidden="true">
                  📞
                </span>
                <span className="flex min-w-0 flex-1 flex-col items-start">
                  <span className="text-[13px] leading-tight text-[#4d677f]">{h.name}</span>
                  <span className="mt-0.5 text-[11px] leading-tight text-[#7b93a8]">{h.desc}</span>
                </span>
                <span className="text-lg font-semibold tabular-nums tracking-tight">{h.number}</span>
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

export default function MyPage() {
  const [showServiceInfo, setShowServiceInfo] = useState(false);
  const [collectedCount, setCollectedCount] = useState(0);
  const [streakDays, setStreakDays] = useState(3);

  // demo data
  const userName = '홍길동';
  const animalEmoji = '🐉';
  const animalDdi = '용띠';
  const ohaeng = { 목: 3, 화: 5, 토: 2, 금: 4, 수: 1 };
  const fortuneScores = [72, 85, 60, 90, 78, 65, 88];

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bujeok-collection');
      if (stored) {
        const parsed = JSON.parse(stored) as Array<{ id: string }>;
        setCollectedCount(parsed.length);
      } else {
        setCollectedCount(5); // demo
      }
    } catch {
      setCollectedCount(5);
    }
  }, []);

  const handleDataReset = () => {
    if (window.confirm('모든 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#0D0B12] text-white">
      {/* Header */}
      <header className="px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="text-2xl font-bold text-amber-100">마이페이지</h1>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-28 pt-2">
        {/* ── Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-amber-950/30 to-transparent p-5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-900/40 text-3xl">
              {animalEmoji}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-amber-100">{userName}</h2>
              <p className="text-sm text-zinc-400">
                {animalEmoji} {animalDdi}
              </p>
            </div>
            <Link
              href="/onboarding"
              className="rounded-lg border border-amber-800/30 px-3 py-1.5 text-xs text-amber-400 transition hover:bg-amber-900/20"
            >
              사주 다시보기
            </Link>
          </div>

          {/* Ohaeng mini chart */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-zinc-500">오행 분포</p>
            <OhaengChart values={ohaeng} />
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: '받은 부적', value: `${collectedCount}개`, icon: '📜' },
            { label: '수집 종류', value: `${collectedCount}/${TOTAL_TALISMAN_COUNT}`, icon: '📖' },
            { label: '연속 방문', value: `${streakDays}일`, icon: '🔥' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4"
            >
              <span className="text-xl">{stat.icon}</span>
              <span className="text-base font-bold text-amber-200">{stat.value}</span>
              <span className="text-[10px] text-zinc-500">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Fortune History ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
        >
          <h3 className="mb-4 text-sm font-semibold text-amber-200/80">
            운세 히스토리 (최근 7일)
          </h3>
          <FortuneChart scores={fortuneScores} />
        </motion.div>

        {/* ── Settings ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-1"
        >
          <SettingsRow icon="📝" label="사주 정보 수정" href="/onboarding" />
          <SettingsRow
            icon="🔔"
            label="알림 설정"
            onClick={() => alert('알림 설정은 준비 중이에요 🙏')}
          />
          <SettingsRow icon="🗑️" label="데이터 초기화" danger onClick={handleDataReset} />
          <SettingsRow
            icon="ℹ️"
            label="서비스 안내"
            onClick={() => setShowServiceInfo(true)}
          />
        </motion.div>

        {/* Safety disclaimer */}
        <p className="whitespace-pre-line text-center text-[10px] leading-[1.7] text-zinc-600">
          {SAFETY_DISCLAIMER}
        </p>

        {/* App version */}
        <p className="text-center text-[10px] text-zinc-700">부적앱 v0.1.0</p>
      </div>

      <AnimatePresence>
        {showServiceInfo && <ServiceInfoSheet onClose={() => setShowServiceInfo(false)} />}
      </AnimatePresence>

      <BottomTab />
    </div>
  );
}

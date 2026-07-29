'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BottomTab from '@/components/BottomTab';
import { TOTAL_TALISMAN_COUNT } from '@/lib/talisman-data';

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

export default function MyPage() {
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
              href="/saju"
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
          <SettingsRow icon="📝" label="사주 정보 수정" href="/saju/edit" />
          <SettingsRow icon="🔔" label="알림 설정" href="/settings/notifications" />
          <SettingsRow icon="🗑️" label="데이터 초기화" danger onClick={handleDataReset} />
          <SettingsRow icon="ℹ️" label="서비스 안내" href="/about" />
        </motion.div>

        {/* App version */}
        <p className="text-center text-[10px] text-zinc-700">부적앱 v0.1.0</p>
      </div>

      <BottomTab />
    </div>
  );
}

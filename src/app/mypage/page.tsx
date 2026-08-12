'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  DownloadMotif,
  BoxTabIcon,
} from '@/components/hanji/motifs';
import AnimalMotif from '@/components/hanji/AnimalMotif';
import { downloadBackup, restoreFromFile } from '@/lib/backup';
import { collectedCatalogIds, loadCollection } from '@/lib/collection';

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

/* ── 마음 상태 (loveStatus) ─────────────────────────
 * user_profile.loveStatus 저장 계약: 'single' | 'crush' | 'dating' | 'married' | 'private'
 * 다른 화면(운세/홈)에서 읽으므로 값·키를 바꾸지 말 것. */

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

function isLoveStatus(v: unknown): v is LoveStatus {
  return (
    typeof v === 'string' &&
    LOVE_STATUS_OPTIONS.some((o) => o.value === v)
  );
}

function loveStatusLabel(v: LoveStatus | null): string {
  return LOVE_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? '미설정';
}

function loadLoveStatus(): LoveStatus | null {
  try {
    for (const key of ['user_profile', 'bujeok-user']) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      if (isLoveStatus(obj?.loveStatus)) return obj.loveStatus;
    }
  } catch {
    // ignore
  }
  return null;
}

/** 기존 필드는 그대로 두고 loveStatus 만 병합 저장 (saju의 gender 저장 방식과 동일) */
function saveLoveStatus(value: LoveStatus) {
  try {
    for (const key of ['user_profile', 'bujeok-user']) {
      const raw = localStorage.getItem(key);
      if (!raw) {
        // 온보딩 전이라도 선택은 존중해 보관 (다른 화면은 값이 없으면 무시)
        if (key === 'user_profile') {
          localStorage.setItem(key, JSON.stringify({ loveStatus: value }));
        }
        continue;
      }
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        obj.loveStatus = value;
        localStorage.setItem(key, JSON.stringify(obj));
      }
    }
  } catch {
    // ignore
  }
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

/* ── 데이터 초기화 확인 모달 ────────────── */

function ResetConfirmSheet({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-confirm-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#132433]/75 backdrop-blur-md sm:items-center"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-t-3xl border border-[#e6ded3] bg-[#fbf8f4] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:rounded-3xl"
      >
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-900/8 text-red-800">
          <TrashMotif size={22} />
        </div>
        <h2
          id="reset-confirm-title"
          className="text-center text-[17px] font-semibold text-[#2b3d4e]"
        >
          모든 데이터를 초기화할까요?
        </h2>
        <p className="mt-3 text-center text-[13px] leading-[1.9] text-[#5a6b7a]">
          사주 정보 · 부적함 · 도감 수집 기록이 모두 사라져요.
          <br />
          <b className="text-red-800">이 작업은 되돌릴 수 없어요.</b>
        </p>
        <p className="mt-3 rounded-xl bg-[#f2ede6] px-4 py-2.5 text-center text-[11.5px] leading-[1.7] text-[#8d8275]">
          소중한 기록은 초기화 전에
          <br />
          「데이터 지키기 → 내보내기」로 백업해 두세요.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            className="w-full rounded-full bg-red-800 py-3 text-[13.5px] font-semibold text-[#F6EDD9] transition-all duration-200 hover:bg-red-900 active:scale-[0.98]"
          >
            초기화할게요
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-full border border-[#dcd5cb] py-3 text-[13.5px] font-medium text-[#6f7f8d] transition-all duration-200 hover:bg-[#f2ede6] active:scale-[0.98]"
          >
            취소
          </button>
        </div>
      </motion.div>
    </motion.div>
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

/* ── 데이터 불러오기 확인 모달 (한지 스타일) ─────────── */

function RestoreConfirmSheet({
  fileName,
  onConfirm,
  onCancel,
}: {
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-confirm-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#132433]/70 px-6 backdrop-blur-sm"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="hanji-card w-full max-w-sm rounded-2xl p-6"
      >
        <h2
          id="restore-confirm-title"
          className="text-center font-serif-kr text-base font-bold text-[var(--color-meok)]"
        >
          이 파일의 기록으로 되찾을까요?
        </h2>
        <p className="mt-2 break-all text-center text-[11px] text-[var(--color-galsaek)] opacity-70">
          {fileName}
        </p>
        <p className="mt-3 text-center text-xs leading-[1.8] text-[var(--color-galsaek)]">
          지금 이 기기에 있는 내용이
          <br />
          파일 속 내용으로 바뀌어요.
          <br />
          걱정된다면 먼저 지금 데이터를 내보내 두세요.
        </p>
        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full py-2.5 text-[13px] font-medium text-[var(--color-galsaek)] transition active:scale-[0.98]"
            style={{ border: '1px solid rgba(122,74,52,0.3)' }}
          >
            다음에 할게요
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full bg-[var(--color-juhong)] py-2.5 text-[13px] font-bold text-[#F6EDD9] transition active:scale-[0.98]"
          >
            네, 되찾을게요
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── 마음 상태 선택 바텀시트 (한지 스타일) ──────────── */

function LoveStatusSheet({
  current,
  onSelect,
  onClose,
}: {
  current: LoveStatus | null;
  onSelect: (v: LoveStatus) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="love-status-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#132433]/70 backdrop-blur-sm sm:items-center"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="hanji-card w-full max-w-md rounded-t-3xl px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:rounded-2xl"
      >
        <h2
          id="love-status-title"
          className="text-center font-serif-kr text-base font-bold text-[var(--color-meok)]"
        >
          지금 마음은 어떤가요?
        </h2>
        <p className="mt-1.5 text-center text-[11.5px] leading-[1.7] text-[var(--color-galsaek)] opacity-80">
          애정운을 당신에게 맞게 전해드려요 · 나만 볼 수 있어요
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {LOVE_STATUS_OPTIONS.map((opt) => {
            const selected = current === opt.value;
            const fullWidth = opt.value === 'private';
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelect(opt.value)}
                className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-4 text-center transition active:scale-[0.98] ${
                  fullWidth ? 'col-span-2' : ''
                }`}
                style={{
                  background: selected
                    ? 'rgba(167,43,33,0.08)'
                    : 'rgba(122,74,52,0.04)',
                  border: `1.5px solid ${
                    selected ? 'rgba(167,43,33,0.4)' : 'rgba(122,74,52,0.15)'
                  }`,
                }}
              >
                <span className="text-xl leading-none">{opt.emoji}</span>
                <span
                  className={`font-serif-kr text-[14px] font-bold leading-tight ${
                    selected
                      ? 'text-[var(--color-juhong)]'
                      : 'text-[var(--color-meok)]'
                  }`}
                >
                  {opt.label}
                </span>
                <span className="text-[10.5px] leading-snug text-[var(--color-galsaek)] opacity-80">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full py-2.5 text-[13px] font-medium text-[var(--color-galsaek)] transition active:scale-[0.98]"
          style={{ border: '1px solid rgba(122,74,52,0.3)' }}
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [collectedCount, setCollectedCount] = useState(0);
  /** 도감 47종 중 몇 종을 모았는지 — 같은 부적을 여러 번 담아도 1종 */
  const [collectedKinds, setCollectedKinds] = useState(0);
  const [streakDays, setStreakDays] = useState(1);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  /* ── 마음 상태 ── */
  const [loveStatus, setLoveStatus] = useState<LoveStatus | null>(null);
  const [showLoveSheet, setShowLoveSheet] = useState(false);

  const handleLoveStatusSelect = (v: LoveStatus) => {
    saveLoveStatus(v); // 기존 프로필 필드 보존 병합 저장
    setLoveStatus(v);
    setShowLoveSheet(false);
  };

  /* ── 데이터 지키기 (백업/복원) ── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [backupToast, setBackupToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, thenReload = false) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setBackupToast(message);
    toastTimerRef.current = setTimeout(() => {
      setBackupToast(null);
      if (thenReload) window.location.reload();
    }, thenReload ? 1800 : 2600);
  };

  const handleExport = () => {
    try {
      downloadBackup();
      showToast('백업 파일을 내려받았어요. 안전한 곳에 보관해 주세요 🙂');
    } catch {
      showToast('내보내기에 실패했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = ''; // 같은 파일 재선택 허용
    if (file) setPendingFile(file);
  };

  const handleRestoreConfirm = async () => {
    const file = pendingFile;
    setPendingFile(null);
    if (!file) return;
    const result = await restoreFromFile(file);
    if (result.ok) {
      showToast(
        `${result.restoredKeys.length}가지 기록을 되찾았어요. 화면을 새로 단장할게요 ✨`,
        true
      );
    } else {
      showToast(result.error ?? '불러오기에 실패했어요. 다시 한번 시도해 주세요.');
    }
  };

  useEffect(() => {
    setProfile(loadProfile());
    setLoveStatus(loadLoveStatus());
    setStreakDays(trackVisitStreak());
    setCollectedCount(loadCollection().length);
    setCollectedKinds(collectedCatalogIds().size);
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
    setShowResetConfirm(true);
  };

  const confirmDataReset = () => {
    localStorage.clear();
    window.location.reload();
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
                <div className="flex h-16 w-16 shrink-0 items-center justify-center text-[var(--color-juhong)]">
                  <AnimalMotif animal={profile?.animal} size={64} />
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
            { label: '수집 종류', value: `${collectedKinds}/${TOTAL_TALISMAN_COUNT}`, icon: <BookMotif size={20} /> },
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
          <SettingsRow icon="💕" label="두 사람의 인연" href="/gunghap" />
          {/* 마음 상태 — 현재 값 표시 + 탭하면 시트로 수정 */}
          <button
            onClick={() => setShowLoveSheet(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[var(--color-meok)] transition hover:bg-[rgba(122,74,52,0.06)]"
          >
            <span className="flex h-5 w-5 items-center justify-center opacity-80">
              💗
            </span>
            <span className="flex-1 text-sm">마음 상태</span>
            <span className="text-xs text-[var(--color-galsaek)] opacity-80">
              {loveStatusLabel(loveStatus)}
            </span>
            <span className="text-xs text-[var(--color-galsaek)] opacity-50">›</span>
          </button>
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

        {/* ── 데이터 지키기 (백업/복원) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="hanji-card rounded-2xl py-1"
        >
          <p className="px-4 pb-1 pt-3 text-xs font-bold text-[var(--color-galsaek)]">
            데이터 지키기
          </p>
          <p className="px-4 pb-1 text-[11px] leading-[1.7] text-[var(--color-galsaek)] opacity-80">
            부적함과 사주 정보를 파일로 보관해두면, 기기를 바꿔도 그대로 되찾을 수
            있어요
          </p>
          <SettingsRow
            icon={<DownloadMotif size={18} />}
            label="내 데이터 내보내기"
            onClick={handleExport}
          />
          <SettingsRow
            icon={<BoxTabIcon size={18} />}
            label="데이터 불러오기"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFilePicked}
            className="hidden"
            aria-hidden="true"
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
        {showResetConfirm && (
          <ResetConfirmSheet
            onConfirm={confirmDataReset}
            onClose={() => setShowResetConfirm(false)}
          />
        )}
        {showLoveSheet && (
          <LoveStatusSheet
            key="love-status-sheet"
            current={loveStatus}
            onSelect={handleLoveStatusSelect}
            onClose={() => setShowLoveSheet(false)}
          />
        )}
        {pendingFile && (
          <RestoreConfirmSheet
            key="restore-confirm"
            fileName={pendingFile.name}
            onConfirm={handleRestoreConfirm}
            onCancel={() => setPendingFile(null)}
          />
        )}
        {backupToast && (
          <motion.div
            key="backup-toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 left-1/2 z-50 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2"
          >
            <div className="hanji-card rounded-xl px-4 py-3 text-center text-xs leading-[1.6] text-[var(--color-meok)] shadow-lg">
              {backupToast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomTab />
    </HanjiBackground>
  );
}

'use client';

// ============================================================
// 궁합 (宮合) — 두 사람의 인연
// 점수만 주고 끝나는 궁합이 아니라,
// "두 사람을 위한 부적" 하나로 마무리되는 궁합.
// 상대방(B)의 생년월일은 저장하지 않는다 — 세션에서만 사용.
// ============================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import BottomTab from '@/components/BottomTab';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import { BackIcon, KnotMotif } from '@/components/hanji/motifs';
import { getAnimal } from '@/data/saju';
import {
  getGunghap,
  type GunghapResult,
  type GunghapAspectKind,
  type GunghapGrade,
} from '@/data/gunghap';

// ─── 한지 디자인 토큰 (globals.css --color-* 와 동일) ────────
const JUHONG = '#A72B21';
const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';
const SSUK = '#6B7D63';
const HWANG = '#DAA017';
const NAMSAEK = '#1F3E63';

// ─── 표시 상수 ─────────────────────────────────────────────

const ASPECT_ICON: Record<GunghapAspectKind, string> = {
  'cheongan-hap': '🤝',
  'ji-yukhap': '🪢',
  'ji-samhap': '🔗',
  'ji-chung': '⚡',
  'ilgan-oheng': '☯️',
  'yongsin-complement': '🧩',
  animal: '🐾',
};

const GRADE_COLOR: Record<GunghapGrade, string> = {
  천생연분: JUHONG,
  '서로 밝혀주는 사이': HWANG,
  '맞춰가는 재미': SSUK,
  '다름이 동력': NAMSAEK,
};

const HOURS: { value: number; label: string }[] = [
  { value: -1, label: '태어난 시 모름' },
  ...Array.from({ length: 24 }, (_, h) => ({
    value: h,
    label: `${String(h).padStart(2, '0')}시`,
  })),
];

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1929 }, (_, i) => THIS_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

// ─── 저장된 내 프로필 (saju 페이지와 동일 로직 축약) ─────────

interface BirthForm {
  name: string;
  year: number;
  month: number;
  day: number;
  /** -1 = 모름 (정오 12시로 계산) */
  hour: number;
}

const EMPTY_FORM: BirthForm = { name: '', year: 1995, month: 1, day: 1, hour: -1 };

function loadMyProfile(): BirthForm | null {
  try {
    const raw = localStorage.getItem('bujeok-user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.birth?.year) {
        return {
          name: (u.name || '').trim(),
          year: u.birth.year,
          month: u.birth.month ?? 1,
          day: u.birth.day ?? 1,
          hour: u.birth.hourKnown === false ? -1 : (u.birth.hour ?? 12),
        };
      }
    }
    const p = localStorage.getItem('user_profile');
    if (p) {
      const u = JSON.parse(p);
      if (u?.birthYear) {
        return {
          name: (u.name || '').trim(),
          year: u.birthYear,
          month: u.birthMonth ?? 1,
          day: u.birthDay ?? 1,
          hour: u.birthHourKnown === false ? -1 : (u.birthHour ?? 12),
        };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// ─── 공용 조각 ─────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[11px] font-bold" style={{ color: `${GALSAEK}CC` }}>
      {children}
    </label>
  );
}

const selectCls =
  'w-full appearance-none rounded-lg border bg-transparent px-2.5 py-2 text-[13px] outline-none';
const selectStyle: React.CSSProperties = {
  borderColor: 'rgba(122,74,52,0.30)',
  color: MEOK,
  background: 'rgba(255,255,255,0.35)',
};

/** 생년월일시 입력 폼 한 벌 */
function BirthFields({
  form,
  onChange,
  namePlaceholder,
}: {
  form: BirthForm;
  onChange: (f: BirthForm) => void;
  namePlaceholder: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <FieldLabel>이름 (선택)</FieldLabel>
        <input
          type="text"
          value={form.name}
          maxLength={10}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder={namePlaceholder}
          className="w-full rounded-lg border bg-transparent px-3 py-2 text-[13px] outline-none"
          style={selectStyle}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <FieldLabel>년</FieldLabel>
          <select
            value={form.year}
            onChange={(e) => onChange({ ...form, year: Number(e.target.value) })}
            className={selectCls}
            style={selectStyle}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>월</FieldLabel>
          <select
            value={form.month}
            onChange={(e) => onChange({ ...form, month: Number(e.target.value) })}
            className={selectCls}
            style={selectStyle}
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>일</FieldLabel>
          <select
            value={form.day}
            onChange={(e) => onChange({ ...form, day: Number(e.target.value) })}
            className={selectCls}
            style={selectStyle}
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}일
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <FieldLabel>태어난 시</FieldLabel>
        <select
          value={form.hour}
          onChange={(e) => onChange({ ...form, hour: Number(e.target.value) })}
          className={selectCls}
          style={selectStyle}
        >
          {HOURS.map((h) => (
            <option key={h.value} value={h.value}>
              {h.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/** 점수 원 — 카운트업 + 링 애니메이션 */
function ScoreCircle({ score, grade }: { score: number; grade: GunghapGrade }) {
  const [display, setDisplay] = useState(50);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const DURATION = 1300;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(50 + (score - 50) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const R = 54;
  const CIRC = 2 * Math.PI * R;
  const color = GRADE_COLOR[grade];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[136px] w-[136px]">
        <svg viewBox="0 0 136 136" className="h-full w-full -rotate-90">
          <circle
            cx="68"
            cy="68"
            r={R}
            fill="none"
            stroke="rgba(122,74,52,0.15)"
            strokeWidth="8"
          />
          <motion.circle
            cx="68"
            cy="68"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: CIRC * (1 - score / 100) }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif-kr text-4xl font-bold" style={{ color: MEOK }}>
            {display}
          </span>
          <span className="text-[10px]" style={{ color: `${GALSAEK}99` }}>
            / 100
          </span>
        </div>
      </div>
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-2 rounded-full px-4 py-1 font-serif-kr text-sm font-bold"
        style={{
          color,
          background: `${color}14`,
          border: `1px solid ${color}44`,
        }}
      >
        {grade}
      </motion.span>
    </div>
  );
}

// ─── 페이지 ────────────────────────────────────────────────

export default function GunghapPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [editingA, setEditingA] = useState(false);
  const [formA, setFormA] = useState<BirthForm>(EMPTY_FORM);
  const [formB, setFormB] = useState<BirthForm>({ ...EMPTY_FORM, year: 1995 });
  const [result, setResult] = useState<GunghapResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = loadMyProfile();
    if (p) {
      setFormA(p);
      setHasProfile(true);
    } else {
      setEditingA(true);
    }
    setReady(true);
  }, []);

  const animalA = useMemo(
    () => getAnimal(formA.year, formA.month, formA.day),
    [formA.year, formA.month, formA.day]
  );

  const handleSubmit = () => {
    // B 의 생년월일은 저장하지 않는다 (개인정보) — 이 화면 안에서만 사용
    const r = getGunghap({
      a: {
        name: formA.name || undefined,
        birth: {
          year: formA.year,
          month: formA.month,
          day: formA.day,
          hour: formA.hour < 0 ? 12 : formA.hour,
        },
      },
      b: {
        name: formB.name || undefined,
        birth: {
          year: formB.year,
          month: formB.month,
          day: formB.day,
          hour: formB.hour < 0 ? 12 : formB.hour,
        },
      },
    });
    setResult(r);
    // 결과로 부드럽게 스크롤
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  if (!ready) {
    return (
      <HanjiBackground>
        <div className="flex flex-1 items-center justify-center" />
      </HanjiBackground>
    );
  }

  return (
    <HanjiBackground>
      <TraditionalHeader
        left={
          <button onClick={() => router.back()} aria-label="뒤로가기">
            <BackIcon size={22} />
          </button>
        }
        title="두 사람의 인연"
      />

      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-32 pt-1">
        <p className="mb-5 text-center text-[11px]" style={{ color: `${GALSAEK}99` }}>
          궁합(宮合) — 여덟 글자로 두 사람의 결을 읽어요
        </p>

        {/* ── 나 (A) ── */}
        <motion.section
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="hanji-card mb-4 rounded-2xl px-4 py-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-serif-kr text-[14px] font-bold" style={{ color: MEOK }}>
              나의 사주
            </h2>
            {hasProfile && (
              <button
                onClick={() => setEditingA((v) => !v)}
                className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ color: JUHONG, border: `1px solid ${JUHONG}44` }}
              >
                {editingA ? '입력 닫기' : '수정'}
              </button>
            )}
          </div>

          {!editingA ? (
            <div
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(122,74,52,0.06)' }}
            >
              <span className="text-2xl" aria-hidden>
                {animalA.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold" style={{ color: MEOK }}>
                  {formA.name ? `${formA.name}님` : '나'}
                  <span className="ml-1.5 text-[11px] font-normal" style={{ color: GALSAEK }}>
                    {animalA.name}띠
                  </span>
                </p>
                <p className="text-[11px]" style={{ color: `${GALSAEK}AA` }}>
                  {formA.year}년 {formA.month}월 {formA.day}일 ·{' '}
                  {formA.hour < 0 ? '시 모름' : `${formA.hour}시`}
                </p>
              </div>
            </div>
          ) : (
            <BirthFields form={formA} onChange={setFormA} namePlaceholder="내 이름" />
          )}
        </motion.section>

        {/* ── 상대 (B) ── */}
        <motion.section
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="hanji-card mb-4 rounded-2xl px-4 py-4"
        >
          <h2 className="mb-2 font-serif-kr text-[14px] font-bold" style={{ color: MEOK }}>
            상대의 사주
          </h2>
          <BirthFields form={formB} onChange={setFormB} namePlaceholder="상대 이름" />
          <p className="mt-2.5 text-[10.5px] leading-relaxed" style={{ color: `${GALSAEK}88` }}>
            상대방의 생년월일은 저장되지 않고, 이 화면에서만 사용돼요.
          </p>
        </motion.section>

        {/* ── 인연 보기 버튼 ── */}
        <motion.button
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-serif-kr text-[15px] font-bold text-white"
          style={{ background: JUHONG }}
        >
          <KnotMotif size={20} /> 인연 보기
        </motion.button>

        {/* ── 결과 ── */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={`${result.score}-${result.grade}-${result.summary.length}`}
              ref={resultRef}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col gap-4 scroll-mt-4"
            >
              {/* 점수 */}
              <section className="hanji-card rounded-2xl px-4 py-6">
                <ScoreCircle score={result.score} grade={result.grade} />
              </section>

              {/* 인연의 결 (aspects) */}
              <section className="hanji-card rounded-2xl px-4 py-5">
                <h3 className="mb-3 font-serif-kr text-[14px] font-bold" style={{ color: MEOK }}>
                  두 사람 사이에 흐르는 기운
                </h3>
                <div className="flex flex-col gap-2.5">
                  {result.aspects.map((asp, i) => (
                    <motion.div
                      key={asp.kind + asp.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.1 }}
                      className="rounded-xl px-3.5 py-3"
                      style={{
                        background:
                          asp.score >= 0 ? 'rgba(107,125,99,0.08)' : 'rgba(31,62,99,0.07)',
                        border:
                          asp.score >= 0
                            ? '1px solid rgba(107,125,99,0.22)'
                            : '1px solid rgba(31,62,99,0.20)',
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px]" aria-hidden>
                          {ASPECT_ICON[asp.kind]}
                        </span>
                        <span className="text-[13px] font-bold" style={{ color: MEOK }}>
                          {asp.title}
                        </span>
                      </div>
                      <p
                        className="mt-1 text-[12px] leading-relaxed"
                        style={{ color: GALSAEK }}
                      >
                        {asp.detail}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* 요약 */}
              <section className="hanji-card rounded-2xl px-4 py-5">
                <h3 className="mb-2 font-serif-kr text-[14px] font-bold" style={{ color: MEOK }}>
                  두 사람의 이야기
                </h3>
                <p className="text-[12.5px] leading-relaxed" style={{ color: GALSAEK }}>
                  {result.summary}
                </p>
              </section>

              {/* 두 사람을 위한 부적 */}
              <section
                className="hanji-card rounded-2xl px-4 py-5"
                style={{ borderColor: 'rgba(167,43,33,0.45)' }}
              >
                <h3 className="mb-3 font-serif-kr text-[14px] font-bold" style={{ color: JUHONG }}>
                  💕 두 사람을 위한 부적
                </h3>
                <div className="mb-3 flex items-start gap-3">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg font-serif-kr text-xl font-bold leading-none"
                    style={{
                      color: JUHONG,
                      border: '1.5px solid rgba(167,43,33,0.35)',
                      background: 'rgba(167,43,33,0.06)',
                    }}
                  >
                    {result.sharedTalisman.talisman.hanja.slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif-kr text-[15px] font-bold" style={{ color: MEOK }}>
                      {result.sharedTalisman.talisman.name}
                      <span
                        className="ml-1.5 text-[11px] font-normal opacity-60"
                        style={{ color: GALSAEK }}
                      >
                        {result.sharedTalisman.talisman.hanja}
                      </span>
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed" style={{ color: GALSAEK }}>
                      {result.sharedTalisman.reason}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    router.push(`/talisman?recommended=${result.sharedTalisman.talisman.id}`)
                  }
                  className="w-full rounded-xl py-3 font-serif-kr text-[14px] font-bold text-white"
                  style={{ background: JUHONG }}
                >
                  이 부적 받기 →
                </motion.button>
              </section>

              {/* 디스클레이머 */}
              <p
                className="px-2 pb-2 text-center text-[10.5px] leading-relaxed"
                style={{ color: `${GALSAEK}88` }}
              >
                궁합은 두 사람의 결을 읽는 전통적 놀이일 뿐,
                <br />
                인연의 답은 두 사람이 만들어가는 것이에요.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomTab />
    </HanjiBackground>
  );
}

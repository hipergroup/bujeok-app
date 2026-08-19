'use client';

// ============================================================
// 궁합 (宮合) — 두 사람의 인연
// 점수만 주고 끝나는 궁합이 아니라,
// "두 사람을 위한 부적" 하나로 마무리되는 궁합.
// 상대방(B)의 생년월일은 저장하지 않는다 — 세션에서만 사용.
// ============================================================

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import GunghapScoreCircle from '@/components/gunghap/GunghapScoreCircle';
import BottomTab from '@/components/BottomTab';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import { BackIcon, KnotMotif } from '@/components/hanji/motifs';
import { getAnimal, getSajuYear, isSamjae } from '@/data/saju';
import { decodeInvite, buildInviteUrl } from '@/lib/inyeon';
import {
  getGunghap,
  type GunghapResult,
  type GunghapAspectKind,
  type RelationType,
} from '@/data/gunghap';

// ─── 한지 디자인 토큰 (globals.css --color-* 와 동일) ────────
const JUHONG = '#A72B21';
const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';
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
  'dohwa-spark': '🌸',
};

/** 관계 유형 선택 칩 — 저장하지 않고 화면 상태로만 사용 */
const RELATION_CHIPS: { value: RelationType; label: string }[] = [
  { value: '연인', label: '연인' },
  { value: '썸', label: '썸·짝사랑' },
  { value: '부부', label: '부부' },
  { value: '친구', label: '친구' },
  { value: '동료', label: '동료·파트너' },
];

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
// ─── 페이지 ────────────────────────────────────────────────

function GunghapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* 초대 링크(?i=) — 초대자의 이름·생년월일시가 링크에 실려 온다 */
  const invite = useMemo(
    () => decodeInvite(searchParams.get('i') ?? ''),
    [searchParams]
  );

  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [editingA, setEditingA] = useState(false);
  const [formA, setFormA] = useState<BirthForm>(EMPTY_FORM);
  const [formB, setFormB] = useState<BirthForm>({ ...EMPTY_FORM, year: 1995 });
  const [relation, setRelation] = useState<RelationType>(
    invite ? '친구' : '연인'
  );
  const [result, setResult] = useState<GunghapResult | null>(null);
  const [inviteStatus, setInviteStatus] = useState<'shared' | 'copied' | null>(
    null
  );
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!invite) {
      const p = loadMyProfile();
      if (p) {
        setFormA(p);
        setHasProfile(true);
      } else {
        setEditingA(true);
      }
    }
    setReady(true);
  }, [invite]);

  /* A = 초대 모드면 링크에 실려 온 초대자, 아니면 내 프로필/입력 */
  const aForm: BirthForm = invite
    ? {
        name: invite.f,
        year: invite.y,
        month: invite.mo,
        day: invite.d,
        hour: invite.h,
      }
    : formA;

  /* 초대 모드에서 결과가 나오면, 문 여는 사람(B)의 올해 삼재도 짚어준다 */
  const samjaeB = useMemo(() => {
    if (!invite || !result) return null;
    return isSamjae(
      new Date().getFullYear(),
      getSajuYear(
        formB.year,
        formB.month,
        formB.day,
        formB.hour < 0 ? 12 : formB.hour
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invite, result]);

  /* 내 사주를 실은 초대 링크 공유 (프로필 있는 사용자용) */
  const handleInviteShare = async () => {
    const url = buildInviteUrl({
      v: 1,
      f: formA.name,
      y: formA.year,
      mo: formA.month,
      d: formA.day,
      h: formA.hour,
    });
    const text = `${formA.name || '친구'}님과 나의 인연 궁합, 열어볼래요?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: '수호부 — 두 사람의 인연', text, url });
        setInviteStatus('shared');
        return;
      }
    } catch {
      // 공유 시트 닫힘 등 — 클립보드로 폴백하지 않고 조용히 종료
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setInviteStatus('copied');
    } catch {
      prompt('링크를 복사해 친구에게 보내주세요', url);
    }
  };

  const animalA = useMemo(
    () => getAnimal(aForm.year, aForm.month, aForm.day),
    [aForm.year, aForm.month, aForm.day]
  );

  const handleSubmit = () => {
    // B 의 생년월일은 저장하지 않는다 (개인정보) — 이 화면 안에서만 사용
    const r = getGunghap({
      a: {
        name: aForm.name || undefined,
        birth: {
          year: aForm.year,
          month: aForm.month,
          day: aForm.day,
          hour: aForm.hour < 0 ? 12 : aForm.hour,
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
      relation,
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
        {invite ? (
          <p
            className="mb-5 text-center font-serif-kr text-[14px] leading-relaxed"
            style={{ color: MEOK }}
          >
            <span className="font-bold">{invite.f || '누군가'}</span>님이
            당신과의 인연 풀이를 청했어요
            <br />
            <span className="text-[11px]" style={{ color: `${GALSAEK}99` }}>
              생년월일을 넣으면 두 사람의 결을 읽어드려요
            </span>
          </p>
        ) : (
          <p className="mb-5 text-center text-[11px]" style={{ color: `${GALSAEK}99` }}>
            궁합(宮合) — 여덟 글자로 두 사람의 결을 읽어요
          </p>
        )}

        {/* ── 나 (A) / 초대 모드에서는 초대한 사람 ── */}
        <motion.section
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="hanji-card mb-4 rounded-2xl px-4 py-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-serif-kr text-[14px] font-bold" style={{ color: MEOK }}>
              {invite ? '초대한 사람' : '나의 사주'}
            </h2>
            {!invite && hasProfile && (
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
                  {aForm.name ? `${aForm.name}님` : invite ? '초대한 분' : '나'}
                  <span className="ml-1.5 text-[11px] font-normal" style={{ color: GALSAEK }}>
                    {animalA.name}띠
                  </span>
                </p>
                <p className="text-[11px]" style={{ color: `${GALSAEK}AA` }}>
                  {aForm.year}년 {aForm.month}월 {aForm.day}일 ·{' '}
                  {aForm.hour < 0 ? '시 모름' : `${aForm.hour}시`}
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
            {invite ? '나의 사주' : '상대의 사주'}
          </h2>

          {/* 관계 유형 선택 — 해석의 언어가 달라져요 */}
          <div className="mb-3">
            <FieldLabel>어떤 사이인가요?</FieldLabel>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="관계 유형 선택">
              {RELATION_CHIPS.map((chip) => {
                const active = relation === chip.value;
                return (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setRelation(chip.value)}
                    aria-pressed={active}
                    className="rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors"
                    style={
                      active
                        ? {
                            color: '#fff',
                            background: JUHONG,
                            border: `1px solid ${JUHONG}`,
                          }
                        : {
                            color: GALSAEK,
                            background: 'rgba(255,255,255,0.35)',
                            border: '1px solid rgba(122,74,52,0.30)',
                          }
                    }
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          <BirthFields
            form={formB}
            onChange={setFormB}
            namePlaceholder={invite ? '내 이름' : '상대 이름'}
          />
          <p className="mt-2.5 text-[10.5px] leading-relaxed" style={{ color: `${GALSAEK}88` }}>
            {invite
              ? '입력한 생년월일은 저장되지 않고, 이 화면에서만 사용돼요.'
              : '상대방의 생년월일은 저장되지 않고, 이 화면에서만 사용돼요.'}
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

        {/* ── 인연 초대장 — 내 사주를 실은 링크를 친구에게 (초대 모드에선 숨김) ── */}
        {!invite && hasProfile && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="-mt-2 mb-6"
          >
            <button
              onClick={handleInviteShare}
              className="w-full rounded-xl py-3 font-serif-kr text-[13px] font-bold"
              style={{
                color: JUHONG,
                border: `1.5px solid ${JUHONG}55`,
                background: 'rgba(167,43,33,0.05)',
              }}
            >
              💌 친구에게 인연 풀이 청하기
            </button>
            <p
              className="mt-1.5 text-center text-[10.5px]"
              style={{ color: `${GALSAEK}88` }}
            >
              {inviteStatus === 'copied'
                ? '링크를 복사했어요 — 친구에게 붙여넣어 보내주세요'
                : inviteStatus === 'shared'
                  ? '초대장을 보냈어요'
                  : '내 사주를 실은 링크가 만들어져요. 친구는 생년월일만 넣으면 돼요.'}
            </p>
          </motion.div>
        )}

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
                <GunghapScoreCircle score={result.score} grade={result.grade} />
                {result.aspects.some((a) => a.kind === 'dohwa-spark') && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="mt-3 text-center text-[11.5px]"
                    style={{ color: `${GALSAEK}BB` }}
                  >
                    두 분의 매력 궁합도 함께 보았어요 🌸
                  </motion.p>
                )}
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

              {/* 초대받은 사람의 올해 삼재 — 부적으로 이어지는 다리 */}
              {invite && samjaeB && (
                <section
                  className="hanji-card rounded-2xl px-4 py-5"
                  style={
                    samjaeB.is
                      ? { borderColor: 'rgba(31,62,99,0.45)' }
                      : undefined
                  }
                >
                  <h3
                    className="mb-2 font-serif-kr text-[14px] font-bold"
                    style={{ color: samjaeB.is ? NAMSAEK : MEOK }}
                  >
                    {samjaeB.is
                      ? `⚠️ 올해 당신은 ${samjaeB.type ?? '삼재'}의 해`
                      : '🌿 올해 당신은 삼재가 아니에요'}
                  </h3>
                  <p className="text-[12px] leading-relaxed" style={{ color: GALSAEK }}>
                    {samjaeB.is
                      ? '삼재의 해에는 예로부터 몸과 마음을 지키는 부적을 곁에 두었어요. 사주 풀이와 함께 나만의 부적을 만들어 보세요.'
                      : '평온한 흐름이에요. 소중한 사람과 나눌 부적 하나로 이 인연을 붙들어 보세요.'}
                  </p>
                </section>
              )}

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
                  {invite
                    ? `이 부적 만들어 ${invite.f ? `${invite.f}님께` : '친구에게'} 보내기 →`
                    : '이 부적 받기 →'}
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

export default function GunghapPage() {
  // useSearchParams 는 정적 내보내기에서 Suspense 경계가 필요하다 (gift 페이지와 동일)
  return (
    <Suspense fallback={null}>
      <GunghapContent />
    </Suspense>
  );
}

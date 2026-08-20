'use client';

// ============================================================
// 좋은 날 고르기 — 생활 택일
//
// 목적 고르기 → 조건 넣기 → (결혼이면 궁합) → 추천 보기 → 상세·근거
// 공식 달력(음양력·공휴일)과 앱의 만세력 해석을 나눠서 보여준다.
// ============================================================

import { useCallback, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import TraditionalButton from '@/components/hanji/TraditionalButton';
import BottomTab from '@/components/BottomTab';
import { BackIcon } from '@/components/hanji/motifs';
import PurposeSelector from '@/components/good-day/PurposeSelector';
import DateConditionForm from '@/components/good-day/DateConditionForm';
import { hourLabel } from '@/lib/birth-hour';
import RecommendationCard, {
  formatDate,
  formatLunar,
} from '@/components/good-day/RecommendationCard';
import GoodDayCalendar from '@/components/good-day/GoodDayCalendar';
import ReasonSheet from '@/components/good-day/ReasonSheet';
import { SON_DIRECTION_LABEL } from '@/lib/calendar/sonnal';
import { APPLIED_SAL, SAL_EXCLUDED, SAL_SOURCES } from '@/lib/calendar/sal';
import { CalendarDataMissingError } from '@/lib/calendar/calendarAdapter';
import {
  buildPersonSaju,
  recommendDates,
} from '@/lib/good-day/dateSelectionEngine';
import { saveGoodDay } from '@/lib/good-day/savedDays';
import { getGunghap, type GunghapResult } from '@/data/gunghap';
import GunghapScoreCircle from '@/components/gunghap/GunghapScoreCircle';
import { PURPOSE_LABEL } from '@/types/good-day';
import type {
  DateConditions,
  DayCandidate,
  GoodDayPurpose,
  RecommendationResult,
} from '@/types/good-day';

const JUHONG = '#A72B21';
const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';

interface Profile {
  name: string;
  birth: { year: number; month: number; day: number; hour: number | null };
  /** 가취월·살부대기월은 신부 띠로 보므로 성별이 필요하다 */
  gender?: 'M' | 'F';
}

/** 온보딩이 저장한 사주 프로필을 그대로 재사용한다 (다시 묻지 않는다) */
function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem('bujeok-user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.birth?.year) {
        return {
          name: (u.name || '').trim(),
          gender: u.gender === 'M' || u.gender === 'F' ? u.gender : undefined,
          birth: {
            year: u.birth.year,
            month: u.birth.month ?? 1,
            day: u.birth.day ?? 1,
            hour: u.birth.hourKnown === false ? null : (u.birth.hour ?? 12),
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
          gender: u.gender === 'M' || u.gender === 'F' ? u.gender : undefined,
          birth: {
            year: u.birthYear,
            month: u.birthMonth ?? 1,
            day: u.birthDay ?? 1,
            hour: u.birthHourKnown === false ? null : (u.birthHour ?? 12),
          },
        };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// localStorage 는 서버에 없다. 첫 렌더(서버)는 null 로 그리고, 마운트 뒤에
// 실제 값으로 다시 그린다 — useSyncExternalStore 로 하이드레이션 불일치를 피한다.
let cachedProfile: Profile | null | undefined;

function readProfile(): Profile | null {
  if (cachedProfile === undefined) cachedProfile = loadProfile();
  return cachedProfile;
}

function subscribeProfile(onChange: () => void) {
  // 마운트 시 다시 읽는다 (온보딩을 막 마치고 돌아온 경우 대비)
  cachedProfile = undefined;
  onChange();
  const handler = () => {
    cachedProfile = undefined;
    onChange();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

// 결혼은 날짜를 정하기 전에 두 사람이 어떤 결인지 먼저 본다 —
// 같은 생년월일을 이미 받아놓고 궁합을 건너뛰면 순서가 거꾸로다.
type Phase = 'purpose' | 'conditions' | 'gunghap' | 'result';

export default function DaysPage() {
  const [phase, setPhase] = useState<Phase>('purpose');
  const [purpose, setPurpose] = useState<GoodDayPurpose | null>(null);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [detail, setDetail] = useState<DayCandidate | null>(null);
  const [showReason, setShowReason] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedDate, setSavedDate] = useState<string | null>(null);
  /** 결혼 흐름에서 조건 입력을 마친 뒤 잠시 들고 있는 값 (궁합 단계를 거쳐 추천으로 넘긴다) */
  const [pending, setPending] = useState<DateConditions | null>(null);
  const [gunghap, setGunghap] = useState<GunghapResult | null>(null);

  const profile = useSyncExternalStore(subscribeProfile, readProfile, () => null);

  /** 조건 → 추천 계산. 실패하면 에러만 세우고 화면은 그대로 둔다. */
  const recommend = useCallback(
    (conditions: DateConditions) => {
      if (!profile || !purpose) return;
      setError(null);
      try {
        // 첫 번째 사람 — 직접 넣었으면 그 사람, 아니면 저장된 내 사주
        const first = conditions.self ?? {
          year: profile.birth.year,
          month: profile.birth.month,
          day: profile.birth.day,
          hour: profile.birth.hour,
          gender: profile.gender,
        };
        const me = buildPersonSaju(
          first.year,
          first.month,
          first.day,
          first.hour,
          first.gender
        );
        const partner = conditions.partner
          ? buildPersonSaju(
              conditions.partner.year,
              conditions.partner.month,
              conditions.partner.day,
              conditions.partner.hour,
              conditions.partner.gender
            )
          : undefined;
        setResult(recommendDates({ purpose, conditions, me, partner }));
        setPhase('result');
      } catch (e) {
        setError(
          e instanceof CalendarDataMissingError
            ? e.message
            : e instanceof Error
              ? e.message
              : String(e)
        );
      }
    },
    [profile, purpose]
  );

  const run = useCallback(
    (conditions: DateConditions) => {
      if (!profile) return;
      // 결혼이면 날짜보다 궁합이 먼저다. 상대 정보가 없으면(선택 해제) 그냥 넘어간다.
      if (purpose === 'wedding' && conditions.partner) {
        const p = conditions.partner;
        const s = conditions.self;
        setGunghap(
          getGunghap({
            a: {
              name: s ? undefined : profile.name || undefined,
              // 궁합 계산은 시(時)를 반드시 받는다 — 모르면 정오로 두고 아래에 밝힌다
              birth: {
                year: s ? s.year : profile.birth.year,
                month: s ? s.month : profile.birth.month,
                day: s ? s.day : profile.birth.day,
                hour: (s ? s.hour : profile.birth.hour) ?? 12,
              },
            },
            b: {
              birth: {
                year: p.year,
                month: p.month,
                day: p.day,
                hour: p.hour ?? 12,
              },
            },
            relation: '부부',
          })
        );
        setPending(conditions);
        setError(null);
        setPhase('gunghap');
        return;
      }
      recommend(conditions);
    },
    [profile, purpose, recommend]
  );

  const top3 = result?.candidates.slice(0, 3) ?? [];

  const handleSave = (c: DayCandidate) => {
    if (!purpose || !profile) return;
    saveGoodDay(purpose, c, `${profile.birth.year}${profile.birth.month}${profile.birth.day}`, result?.conditions.partner);
    setSavedDate(c.date);
  };

  const back = () => {
    if (phase === 'result') setPhase(pending ? 'gunghap' : 'conditions');
    else if (phase === 'gunghap') setPhase('conditions');
    else if (phase === 'conditions') {
      setPhase('purpose');
      setPurpose(null);
      setPending(null);
      setGunghap(null);
    }
  };

  return (
    <HanjiBackground>
      <div className="mx-auto min-h-dvh w-full max-w-lg pb-32">
        <TraditionalHeader
          title="좋은 날 고르기"
          showSeal
          left={
            phase === 'purpose' ? undefined : (
              <button onClick={back} aria-label="뒤로가기">
                <BackIcon size={20} />
              </button>
            )
          }
        />

        <main className="px-5">
          {/* 사주가 없으면 온보딩으로 */}
          {!profile ? (
            <div
              className="rounded-xl text-center"
              style={{
                marginTop: 20,
                padding: '24px 20px',
                background: 'rgba(255,253,248,0.82)',
                border: '1px solid rgba(122,74,52,0.2)',
              }}
            >
              <p className="font-serif-kr" style={{ fontSize: 15, color: MEOK }}>
                내 사주를 알아야 날을 고를 수 있어요
              </p>
              <p
                style={{ marginTop: 8, fontSize: 12, lineHeight: 1.8, color: `${MEOK}99` }}
              >
                생년월일을 한 번만 알려주시면
                <br />
                그 뒤로는 다시 묻지 않습니다.
              </p>
              <Link
                href="/onboarding"
                className="mt-4 inline-block rounded-lg"
                style={{
                  padding: '11px 22px',
                  fontSize: 13,
                  background: JUHONG,
                  color: '#FBF3E0',
                }}
              >
                사주 입력하러 가기
              </Link>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* ── 목적 고르기 ── */}
              {phase === 'purpose' && (
                <motion.div
                  key="purpose"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ paddingTop: 8 }}
                >
                  <PurposeSelector
                    onSelect={(p) => {
                      setPurpose(p);
                      setPhase('conditions');
                    }}
                  />
                  <Link
                    href="/days/month"
                    className="mt-5 block text-center"
                    style={{ fontSize: 12.5, color: `${GALSAEK}CC` }}
                  >
                    목적 없이 이번 달 흐름만 볼래요
                  </Link>
                </motion.div>
              )}

              {/* ── 조건 넣기 ── */}
              {phase === 'conditions' && purpose && (
                <motion.div
                  key="conditions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ paddingTop: 8 }}
                >
                  <h2
                    className="font-serif-kr"
                    style={{ fontSize: 18, color: MEOK, marginBottom: 14 }}
                  >
                    {PURPOSE_LABEL[purpose]} — 언제쯤 보실까요?
                  </h2>

                  {/* 결혼은 전통 택일의 살(煞)을 다 보지 못하므로 미리 밝힌다 */}
                  {purpose === 'wedding' && (
                    <div
                      className="rounded-xl"
                      style={{
                        marginBottom: 14,
                        padding: '13px 15px',
                        background: 'rgba(218,160,23,0.1)',
                        border: '1px solid rgba(218,160,23,0.34)',
                      }}
                    >
                      <p className="font-bold" style={{ fontSize: 11.5, color: '#9A6F0F' }}>
                        먼저 알려드려요
                      </p>
                      <p
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          lineHeight: 1.75,
                          color: `${MEOK}CC`,
                        }}
                      >
                        예식장에서 받아오는 정식 혼인택일과는 다릅니다. 두 분의
                        사주가 크게 부딪히지 않는 날을 고르고, 예로부터 혼인에
                        꺼리던 날 {APPLIED_SAL.length}가지를 함께 봅니다.
                      </p>
                      <ul className="mt-2.5 flex flex-col gap-1">
                        {SAL_SOURCES.map((s) => (
                          <li
                            key={s.name}
                            style={{ fontSize: 11, lineHeight: 1.65, color: `${GALSAEK}CC` }}
                          >
                            <b style={{ color: `${MEOK}AA` }}>{s.name}</b> —{' '}
                            {s.meaning}
                            <span style={{ opacity: 0.75 }}> · {s.source}</span>
                            {s.note ? ` (${s.note})` : ''}
                          </li>
                        ))}
                        {SAL_EXCLUDED.map((s) => (
                          <li
                            key={s.name}
                            style={{ fontSize: 11, lineHeight: 1.65, color: `${GALSAEK}AA` }}
                          >
                            <b>{s.name}</b> · 넣지 않음 — {s.reason}
                          </li>
                        ))}
                      </ul>
                      <p
                        style={{ marginTop: 8, fontSize: 11, lineHeight: 1.65, color: `${GALSAEK}AA` }}
                      >
                        가취월·살부대기월은 신부(여성) 띠로 봅니다. 두 분의 성별을
                        모두 넣어주셔야 반영돼요.
                      </p>
                    </div>
                  )}
                  <DateConditionForm
                    purpose={purpose}
                    onSubmit={run}
                    myName={profile.name || undefined}
                    mySummary={`${profile.birth.year}년 ${profile.birth.month}월 ${profile.birth.day}일 · ${hourLabel(profile.birth.hour)}`}
                  />
                  {error && (
                    <p
                      className="rounded-lg"
                      style={{
                        marginTop: 12,
                        padding: '12px 14px',
                        fontSize: 12,
                        lineHeight: 1.7,
                        color: JUHONG,
                        background: 'rgba(167,43,33,0.06)',
                        border: '1px solid rgba(167,43,33,0.25)',
                      }}
                    >
                      {error}
                    </p>
                  )}
                </motion.div>
              )}

              {/* ── 궁합 (결혼 전용) — 날짜를 고르기 전에 두 분의 결부터 ── */}
              {phase === 'gunghap' && gunghap && pending && (
                <motion.div
                  key="gunghap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ paddingTop: 8 }}
                >
                  <h2
                    className="font-serif-kr"
                    style={{ fontSize: 18, color: MEOK, marginBottom: 4 }}
                  >
                    먼저, 두 분의 결을 봅니다
                  </h2>
                  <p
                    style={{
                      fontSize: 12,
                      lineHeight: 1.75,
                      color: `${GALSAEK}CC`,
                      marginBottom: 18,
                    }}
                  >
                    날을 받기 전에 두 분이 서로 어떤 결인지 먼저 보는 것이
                    순서예요.
                  </p>

                  <div
                    className="rounded-2xl"
                    style={{
                      padding: '22px 18px',
                      background: 'rgba(255,253,248,0.82)',
                      border: '1px solid rgba(122,74,52,0.2)',
                    }}
                  >
                    <GunghapScoreCircle
                      score={gunghap.score}
                      grade={gunghap.grade}
                      size={116}
                    />
                    <p
                      style={{
                        marginTop: 16,
                        fontSize: 13,
                        lineHeight: 1.85,
                        color: MEOK,
                      }}
                    >
                      {gunghap.summary}
                    </p>

                    {gunghap.aspects.length > 0 && (
                      <ul
                        className="flex flex-col"
                        style={{ marginTop: 14, gap: 9 }}
                      >
                        {gunghap.aspects.slice(0, 3).map((a) => (
                          <li
                            key={a.kind + a.title}
                            className="flex items-start"
                            style={{ gap: 7 }}
                          >
                            <span
                              className="shrink-0"
                              style={{
                                marginTop: 6,
                                fontSize: 6,
                                color: JUHONG,
                                opacity: 0.7,
                              }}
                            >
                              ●
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                lineHeight: 1.7,
                                color: `${MEOK}CC`,
                              }}
                            >
                              <b style={{ color: MEOK }}>{a.title}</b> —{' '}
                              {a.detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* 시(時)를 모르면 궁합도 정오 기준 어림이라는 걸 밝힌다 */}
                  {(profile.birth.hour === null ||
                    pending.partner?.hour === null) && (
                    <p
                      style={{
                        marginTop: 10,
                        fontSize: 11,
                        lineHeight: 1.7,
                        color: `${GALSAEK}AA`,
                      }}
                    >
                      태어난 시각을 모르는 분이 있어 정오(12시) 기준으로 어림해
                      본 결과예요.
                    </p>
                  )}

                  <Link
                    href="/gunghap"
                    className="flex items-center justify-center rounded-xl"
                    style={{
                      marginTop: 12,
                      padding: '11px 0',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: JUHONG,
                      border: `1px solid ${JUHONG}44`,
                      background: 'rgba(167,43,33,0.05)',
                    }}
                  >
                    두 사람의 인연에서 자세히 보기 →
                  </Link>

                  <div style={{ marginTop: 18 }}>
                    <TraditionalButton
                      onClick={() => recommend(pending)}
                      className="rounded-lg"
                    >
                      이제 좋은 날 고르기
                    </TraditionalButton>
                  </div>
                  {error && (
                    <p
                      className="rounded-lg"
                      style={{
                        marginTop: 12,
                        padding: '12px 14px',
                        fontSize: 12,
                        lineHeight: 1.7,
                        color: JUHONG,
                        background: 'rgba(167,43,33,0.06)',
                        border: '1px solid rgba(167,43,33,0.25)',
                      }}
                    >
                      {error}
                    </p>
                  )}
                </motion.div>
              )}

              {/* ── 결과 ── */}
              {phase === 'result' && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ paddingTop: 8 }}
                >
                  {result.candidates.length === 0 ? (
                    <div
                      className="rounded-xl text-center"
                      style={{
                        padding: '24px 20px',
                        background: 'rgba(255,253,248,0.82)',
                        border: '1px solid rgba(122,74,52,0.2)',
                      }}
                    >
                      <p style={{ fontSize: 13.5, lineHeight: 1.8, color: MEOK }}>
                        고르신 조건에 맞는 날이 없어요.
                        <br />
                        기간을 늘리거나 조건을 조금 풀어보세요.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2.5">
                        {top3.map((c, i) => (
                          <RecommendationCard
                            key={c.date}
                            candidate={c}
                            rank={i}
                            onClick={() => setDetail(c)}
                          />
                        ))}
                      </div>

                      <div style={{ marginTop: 16 }}>
                        <GoodDayCalendar
                          candidates={result.candidates}
                          onPick={setDetail}
                        />
                      </div>

                      {result.excludedCount > 0 && (
                        <p
                          style={{
                            marginTop: 10,
                            fontSize: 11.5,
                            lineHeight: 1.7,
                            color: `${GALSAEK}AA`,
                          }}
                        >
                          조건에 맞지 않아 {result.excludedCount}일은 후보에서
                          제외했어요.
                        </p>
                      )}
                      {(result.hourUnknown.me || result.hourUnknown.partner) && (
                        <p
                          style={{
                            marginTop: 6,
                            fontSize: 11.5,
                            lineHeight: 1.7,
                            color: `${GALSAEK}AA`,
                          }}
                        >
                          태어난 시간을 모르셔서 시주(時柱)는 빼고 계산했습니다.
                        </p>
                      )}
                    </>
                  )}

                  {/* 안내 */}
                  <p
                    style={{
                      marginTop: 20,
                      fontSize: 11,
                      lineHeight: 1.8,
                      color: `${GALSAEK}99`,
                    }}
                  >
                    좋은 날 고르기는 전통 민속과 명리 해석을 바탕으로 날짜 선택을
                    돕는 참고 기능입니다. 특정한 결과나 효험을 보장하지 않으며,
                    계약·이사·결혼과 관련한 현실적인 조건도 함께 확인해 주세요.
                  </p>
                  <p
                    style={{ marginTop: 6, fontSize: 10.5, color: `${GALSAEK}99` }}
                  >
                    달력 출처 · {result.calendarSource}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* ── 날짜 상세 ── */}
      <AnimatePresence>
        {detail && result && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(46,46,46,0.35)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetail(null)}
          >
            <motion.div
              className="max-h-[82dvh] w-full overflow-y-auto"
              style={{
                background: '#FDFAF0',
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                padding: '20px 20px 34px',
              }}
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="mx-auto mb-4"
                style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(122,74,52,0.25)' }}
              />
              <p className="font-serif-kr" style={{ fontSize: 19, color: MEOK }}>
                {formatDate(detail)}
              </p>
              <p style={{ marginTop: 5, fontSize: 12, color: `${GALSAEK}CC` }}>
                {formatLunar(detail)}
                {detail.calendar.iljin ? ` · 일진 ${detail.calendar.iljin}` : ''}
                {detail.calendar.solarTerm ? ` · ${detail.calendar.solarTerm}` : ''}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span
                  className="rounded-full"
                  style={{
                    padding: '3px 10px',
                    fontSize: 11,
                    color: detail.son === 'none' ? JUHONG : GALSAEK,
                    border: `1px solid ${detail.son === 'none' ? 'rgba(167,43,33,0.3)' : 'rgba(122,74,52,0.26)'}`,
                  }}
                >
                  {detail.son === 'none'
                    ? '손 없는 날'
                    : `${SON_DIRECTION_LABEL[detail.son]}에 손`}
                </span>
                {detail.calendar.holiday && (
                  <span
                    className="rounded-full"
                    style={{
                      padding: '3px 10px',
                      fontSize: 11,
                      color: GALSAEK,
                      border: '1px solid rgba(122,74,52,0.26)',
                    }}
                  >
                    {detail.calendar.holidayName}
                  </span>
                )}
              </div>

              {detail.reasons.length > 0 && (
                <ul className="mt-4 flex flex-col gap-2">
                  {detail.reasons.map((r) => (
                    <li
                      key={r}
                      style={{ fontSize: 13, lineHeight: 1.85, color: `${MEOK}CC` }}
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              )}

              {detail.caution && (
                <div
                  className="rounded-lg"
                  style={{
                    marginTop: 12,
                    padding: '12px 14px',
                    background: 'rgba(218,160,23,0.1)',
                    border: '1px solid rgba(218,160,23,0.34)',
                  }}
                >
                  <p className="font-bold" style={{ fontSize: 11.5, color: '#9A6F0F' }}>
                    한 가지만 살펴두세요
                  </p>
                  <p
                    style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.7, color: `${MEOK}DD` }}
                  >
                    {detail.caution}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowReason(true)}
                className="mt-4 w-full rounded-lg"
                style={{
                  padding: '12px 0',
                  fontSize: 13,
                  color: JUHONG,
                  border: '1px solid rgba(167,43,33,0.35)',
                }}
              >
                왜 이 날인가요?
              </button>

              <div style={{ marginTop: 10 }}>
                <TraditionalButton
                  onClick={() => handleSave(detail)}
                  disabled={savedDate === detail.date}
                  className="rounded-lg"
                >
                  {savedDate === detail.date ? '이 날로 정했어요' : '이 날로 정하기'}
                </TraditionalButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 근거 보기 ── */}
      <AnimatePresence>
        {showReason && detail && result && (
          <ReasonSheet
            candidate={detail}
            source={result.calendarSource}
            rulesVersion={result.rulesVersion}
            onClose={() => setShowReason(false)}
          />
        )}
      </AnimatePresence>

      <BottomTab />
    </HanjiBackground>
  );
}

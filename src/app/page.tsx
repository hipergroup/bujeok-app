"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomTab from "@/components/BottomTab";
import { getUpcomingLine } from "@/lib/good-day/savedDays";
import HanjiBackground from "@/components/hanji/HanjiBackground";
import TraditionalHeader from "@/components/hanji/TraditionalHeader";
import {
  MenuIcon,
  BellIcon,
  SealLogo,
  BrushStroke,
} from "@/components/hanji/motifs";
import { getSaju, getSajuDetail, getOheng, getAnimal, isSamjae } from "@/data/saju";
import { getDailyFortune } from "@/data/fortune";
import {
  getTodayTalisman,
  type SajuMatchInput,
  type SajuTalismanMatch,
} from "@/data/saju-talisman-match";
// 첫 실행 사용자 대부분이 온보딩을 보므로 별도 청크 분리(추가 왕복) 대신 함께 번들
import OnboardingPage from "./onboarding/page";

/* ── 오늘의 운세 — 사주 기반(온보딩 완료 시), 없으면 날짜 시드 ── */

// ── 고른 좋은 날 (localStorage) ──
// 서버 렌더에는 없는 값이라 useSyncExternalStore 로 읽어 하이드레이션 불일치를 피한다.
let cachedUpcoming: ReturnType<typeof getUpcomingLine> | undefined;

function readUpcomingGoodDay() {
  if (cachedUpcoming === undefined) cachedUpcoming = getUpcomingLine();
  return cachedUpcoming;
}

function subscribeGoodDays(onChange: () => void) {
  cachedUpcoming = undefined;
  onChange();
  const handler = () => {
    cachedUpcoming = undefined;
    onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

const OHENG_LABEL: Record<string, string> = {
  목: "목(木)", 화: "화(火)", 토: "토(土)", 금: "금(金)", 수: "수(水)",
};

/** 운세 근거 — 만세력이 준 사실만 담는다 (해석 문구는 넣지 않는다) */
interface TodayBasis {
  todayGanji: string;
  todayGanjiHanja: string;
  myDayStem: string;
  myDayStemOheng: string;
  strongEl: string;
  weakEl: string;
}

/** 총운 아래 갈래 — 엔진이 이미 만들고 있던 값을 화면에 꺼내 쓴다 */
const FORTUNE_BRANCHES = [
  { key: "money", label: "재물", icon: "\u{1FA99}" },
  { key: "health", label: "건강", icon: "\u{1F33F}" },
  { key: "study", label: "학업·일", icon: "\u{1F4DA}" },
] as const;

interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
}

function getTodayFortune(birthData?: BirthData) {
  if (birthData) {
    const saju = getSaju(birthData.year, birthData.month, birthData.day, birthData.hour);
    const fortune = getDailyFortune(saju, new Date());
    const oheng = getOheng(saju);
    const sorted = (Object.entries(oheng) as [string, number][]).sort(
      (a, b) => a[1] - b[1]
    );
    const weakEl = sorted[0][0];
    const strongEl = sorted[sorted.length - 1][0];

    // 오늘의 일진(日辰) — 만세력이 주는 사실. 해석을 붙이지 않고 그대로 보여준다.
    const now = new Date();
    const today = getSaju(now.getFullYear(), now.getMonth() + 1, now.getDate(), 12);

    return {
      score: fortune.score,
      overall: fortune.overall,
      money: fortune.money as string | null,
      health: fortune.health as string | null,
      study: fortune.study as string | null,
      luckyColor: fortune.luckyColor,
      colorReason: `부족한 ${OHENG_LABEL[weakEl]} 기운을 채워주는 색`,
      luckyDirection: fortune.luckyDirection as string | null,
      luckyNumber: fortune.luckyNumber as number | null,
      dailyMantra: fortune.dailyMantra as string | null,
      basis: {
        todayGanji: `${today.dayStem.name}${today.dayBranch.name}`,
        todayGanjiHanja: `${today.dayStem.hanja}${today.dayBranch.hanja}`,
        myDayStem: `${saju.dayStem.name}(${saju.dayStem.hanja})`,
        myDayStemOheng: OHENG_LABEL[saju.dayStem.oheng],
        strongEl: OHENG_LABEL[strongEl],
        weakEl: OHENG_LABEL[weakEl],
      } as TodayBasis | null,
    };
  }

  // 사주 정보가 없을 때의 날짜 시드 운세
  const seed = new Date().toDateString();
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const overalls = [
    "오늘은 새로운 시작에 좋은 날입니다. 마음 속 계획을 실행에 옮겨보세요.",
    "평온한 기운이 감싸는 하루입니다. 감사하는 마음으로 주변을 돌아보세요.",
    "활발한 기운이 넘치는 날입니다. 적극적으로 움직이면 좋은 결과가 따릅니다.",
    "차분히 내면을 돌아보기 좋은 날입니다. 산책이나 명상을 권합니다.",
    "행운의 기운이 가득한 날입니다. 중요한 결정을 내리기에 좋습니다.",
  ];
  const colors = ["금색", "붉은색", "쪽빛", "쑥색", "보라색", "흰색"];
  return {
    score: (hash % 5) + 1,
    overall: overalls[hash % overalls.length],
    // 갈래별 운세는 사주가 있어야 나온다 — 없으면 지어내지 않고 감춘다
    money: null as string | null,
    health: null as string | null,
    study: null as string | null,
    luckyColor: colors[hash % colors.length],
    colorReason: null as string | null,
    luckyDirection: null as string | null,
    luckyNumber: null as number | null,
    dailyMantra: null as string | null,
    basis: null as TodayBasis | null,
  };
}

/** 행운색 이름 → 표시용 색 견본 (모르는 색이면 표시 생략) */
const COLOR_SWATCH: Record<string, string> = {
  청색: '#2B5F8E',
  초록색: '#3E7A4C',
  연두색: '#8FB35B',
  적색: '#A72B21',
  붉은색: '#A72B21',
  분홍색: '#D4788C',
  주황색: '#C9752E',
  황색: '#DAA017',
  금색: '#C99A2C',
  갈색: '#7A4A34',
  베이지색: '#DCC9A5',
  백색: '#F4EFE4',
  흰색: '#F4EFE4',
  은색: '#B9BCC1',
  흑색: '#33312D',
  남색: '#1F3E63',
  쪽빛: '#1F3E63',
  보라색: '#6C4A7C',
  쑥색: '#6B7D63',
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

/* ── Component ─────────────────────────── */
export default function HomePage() {
  const router = useRouter();
  // 고른 좋은 날 — localStorage 는 서버에 없으므로 마운트 뒤에 읽는다
  const upcomingDay = useSyncExternalStore(
    subscribeGoodDays,
    readUpcomingGoodDay,
    () => null
  );
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userName, setUserName] = useState("");
  const [birthData, setBirthData] = useState<BirthData | undefined>();
  const [basisOpen, setBasisOpen] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem("onboarding_completed");
    if (!onboarded) {
      setNeedsOnboarding(true);
      setReady(true);
      return;
    }

    try {
      const userData = localStorage.getItem("bujeok-user");
      if (userData) {
        const u = JSON.parse(userData);
        setUserName(u.name || "수호자");
        if (u.birth) {
          setBirthData({
            year: u.birth.year,
            month: u.birth.month,
            day: u.birth.day,
            hour: u.birth.hour ?? 12,
          });
        }
      } else {
        const profile = localStorage.getItem("user_profile");
        if (profile) {
          const p = JSON.parse(profile);
          setUserName(p.name || "수호자");
          if (p.birthYear) {
            setBirthData({
              year: p.birthYear,
              month: p.birthMonth ?? 1,
              day: p.birthDay ?? 1,
              hour: p.birthHour ?? 12,
            });
          }
        } else {
          setUserName("수호자");
        }
      }
    } catch {
      setUserName("수호자");
    }

    // 방문 기록 — 마이페이지 연속 방문 스트릭과 같은 키를 공유
    try {
      const key = "bujeok-visit-log";
      const today = new Date();
      const dateStr = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const log: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      if (!log.includes(dateStr(today))) log.push(dateStr(today));
      localStorage.setItem(key, JSON.stringify(log.slice(-60)));
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  /* ── 오늘 당신에게 필요한 부적 (사주 기반) ──
     생년월일이 없으면 null — 섹션은 안내 카드로 대체된다. */
  const todayMatch: SajuTalismanMatch | null = useMemo(() => {
    if (!birthData) return null;
    try {
      const { year, month, day, hour } = birthData;
      const detail = getSajuDetail(year, month, day, hour);
      const today = new Date();
      const input: SajuMatchInput = {
        saju: detail,
        oheng: getOheng(detail),
        animal: getAnimal(year, month, day, hour),
        samjae: isSamjae(today.getFullYear(), detail.sajuYear),
      };
      return getTodayTalisman(input, today);
    } catch {
      return null;
    }
  }, [birthData]);

  if (!ready) {
    return (
      <HanjiBackground>
        <div className="flex flex-1 items-center justify-center">
          <SealLogo size={44} />
        </div>
      </HanjiBackground>
    );
  }

  if (needsOnboarding) {
    return <OnboardingPage />;
  }

  const fortune = getTodayFortune(birthData);

  return (
    <HanjiBackground decorated>
      <TraditionalHeader
        left={
          <button onClick={() => alert("메뉴는 준비 중이에요")} aria-label="메뉴">
            <MenuIcon size={22} />
          </button>
        }
        wordmark
        right={
          <button onClick={() => alert("알림은 준비 중이에요")} aria-label="알림">
            <BellIcon size={22} />
          </button>
        }
      />

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-md flex-1 px-5 pb-32 pt-2"
      >
        {/* ── 메인 문구 (시안: 중앙 정렬) ── */}
        <motion.section
          variants={fadeUp}
          className="mb-6 flex flex-col items-center text-center"
        >
          {userName && (
            <p className="mb-1.5 text-xs text-[var(--color-galsaek)] opacity-80">
              {userName}님의 하루에 평안이 깃들기를
            </p>
          )}
          <h1 className="font-brush text-[28px] leading-snug text-[var(--color-meok)]">
            오늘,
            <br />
            어떤 마음을
            <br />
            지키고 싶으신가요?
          </h1>
          <div className="mt-2 text-[var(--color-juhong)]">
            <BrushStroke width={110} />
          </div>
          {/* 아래 마음 카테고리 칸을 가리키던 문구였다 — 그 칸을 빼면서
              고르라고 하지 않고 오늘 운세로 이어지는 말로 바꿨다. */}
          <p className="mt-2 font-serif-kr text-sm text-[var(--color-galsaek)]">
            오늘의 기운을 살펴드릴게요.
          </p>
        </motion.section>

        {/* ── 오늘의 운세 (사주 기반) ── */}
        <motion.section variants={fadeUp} className="mb-6">
          <div className="hanji-card rounded-xl px-5 py-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-serif-kr text-sm font-bold text-[var(--color-meok)]">
                오늘의 운세
                {birthData && (
                  <span className="ml-1.5 text-[10px] font-normal text-[var(--color-galsaek)] opacity-70">
                    사주 기반
                  </span>
                )}
              </span>
              <span className="text-xs tracking-widest text-[var(--color-hwang)]">
                {"●".repeat(fortune.score)}
                <span className="opacity-25">{"●".repeat(5 - fortune.score)}</span>
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-[var(--color-galsaek)]">
              {fortune.overall}
            </p>

            {/* ── 갈래별 운세 — 엔진이 이미 뽑아둔 재물·건강·학업을 함께 보여준다 ── */}
            {fortune.money && (
              <ul
                className="mt-3 flex flex-col gap-2.5 border-t pt-3"
                style={{ borderColor: "rgba(122,74,52,0.15)" }}
              >
                {FORTUNE_BRANCHES.map((b) => {
                  const text = fortune[b.key];
                  if (!text) return null;
                  return (
                    <li key={b.key} className="flex items-start gap-2">
                      <span className="mt-[1px] shrink-0 text-[12px] leading-relaxed">
                        {b.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="font-serif-kr text-[11.5px] font-bold text-[var(--color-meok)]">
                          {b.label}
                        </span>
                        <span className="ml-1.5 text-[12.5px] leading-relaxed text-[var(--color-galsaek)]">
                          {text}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* ── 근거 — 만세력이 준 사실만. 해석을 사실인 척 붙이지 않는다 ── */}
            {fortune.basis && (
              <>
                <button
                  onClick={() => setBasisOpen((v) => !v)}
                  className="mt-2.5 w-full text-right text-[10px] text-[var(--color-galsaek)] opacity-60"
                  aria-expanded={basisOpen}
                >
                  {basisOpen ? "접기 ↑" : "왜 이런 운세인가요? ↓"}
                </button>
                {basisOpen && (
                  <div
                    className="mt-1.5 flex flex-col gap-1.5 rounded-lg px-3 py-2.5"
                    style={{ background: "rgba(122,74,52,0.05)" }}
                  >
                    <p className="text-[11px] leading-relaxed text-[var(--color-galsaek)]">
                      오늘의 일진(日辰)은{" "}
                      <b className="text-[var(--color-meok)]">
                        {fortune.basis.todayGanji}({fortune.basis.todayGanjiHanja})
                      </b>
                      , 회원님의 일간(日干)은{" "}
                      <b className="text-[var(--color-meok)]">
                        {fortune.basis.myDayStem}
                      </b>{" "}
                      {fortune.basis.myDayStemOheng} 입니다.
                    </p>
                    <p className="text-[11px] leading-relaxed text-[var(--color-galsaek)]">
                      사주에 {fortune.basis.strongEl} 기운이 가장 두텁고{" "}
                      {fortune.basis.weakEl} 기운이 가장 옅어요. 오늘의 별점은 이
                      다섯 기운이 얼마나 고른지를 보고 매깁니다.
                    </p>
                    <p className="text-[10px] leading-relaxed text-[var(--color-galsaek)] opacity-70">
                      일진과 사주는 만세력에서 계산한 값이고, 그 아래 풀이는 이
                      앱의 해석이에요.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.section>

        {/* ── 오늘의 개운 — 오늘 현실에서 받아가는 것 ── */}
        <motion.section variants={fadeUp} className="mb-6">
          <div className="hanji-card rounded-xl px-5 py-4">
            <div className="mb-2.5 flex items-baseline justify-between">
              <span className="font-serif-kr text-sm font-bold text-[var(--color-meok)]">
                오늘의 개운
                <span className="ml-1.5 text-[11px] font-normal text-[var(--color-galsaek)] opacity-60">
                  開運
                </span>
              </span>
              <span className="text-[10px] text-[var(--color-galsaek)] opacity-60">
                오늘 하루 지니고 가세요
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* 행운색 */}
              <div
                className="flex flex-col items-center rounded-lg py-2.5"
                style={{ background: "rgba(122,74,52,0.05)" }}
              >
                <span className="text-[10px] text-[var(--color-galsaek)] opacity-70">
                  행운색
                </span>
                <span className="mt-1 flex items-center gap-1.5">
                  {COLOR_SWATCH[fortune.luckyColor] && (
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{
                        background: COLOR_SWATCH[fortune.luckyColor],
                        border: "1px solid rgba(46,46,46,0.18)",
                      }}
                    />
                  )}
                  <span className="font-serif-kr text-[13px] font-bold text-[var(--color-meok)]">
                    {fortune.luckyColor}
                  </span>
                </span>
              </div>
              {/* 행운 방위 */}
              <div
                className="flex flex-col items-center rounded-lg py-2.5"
                style={{ background: "rgba(122,74,52,0.05)" }}
              >
                <span className="text-[10px] text-[var(--color-galsaek)] opacity-70">
                  행운 방위
                </span>
                <span className="mt-1 font-serif-kr text-[13px] font-bold text-[var(--color-meok)]">
                  {fortune.luckyDirection ?? "—"}
                </span>
              </div>
              {/* 행운 숫자 */}
              <div
                className="flex flex-col items-center rounded-lg py-2.5"
                style={{ background: "rgba(122,74,52,0.05)" }}
              >
                <span className="text-[10px] text-[var(--color-galsaek)] opacity-70">
                  행운 숫자
                </span>
                <span className="mt-1 font-serif-kr text-[13px] font-bold text-[var(--color-meok)]">
                  {fortune.luckyNumber ?? "—"}
                </span>
              </div>
            </div>

            {fortune.colorReason && (
              <p className="mt-2 text-[10.5px] text-[var(--color-galsaek)] opacity-70">
                {fortune.colorReason} — 옷·소품 하나면 충분해요
              </p>
            )}

            {/* 오늘의 주문 — 한 줄 개운 주문 */}
            {fortune.dailyMantra && (
              <p
                className="mt-3 border-t pt-2.5 text-center font-serif-kr text-[12px] leading-relaxed text-[var(--color-galsaek)]"
                style={{ borderColor: "rgba(122,74,52,0.15)" }}
              >
                {fortune.dailyMantra}
              </p>
            )}

            {!birthData && (
              <p className="mt-2 text-[10.5px] text-[var(--color-galsaek)] opacity-60">
                사주를 입력하면 내 오행에 맞춘 개운법을 드려요
              </p>
            )}
          </div>
        </motion.section>

        {/* 마음 카테고리(액운 막기·인연의 기운…) 칸은 뺐다 —
            눌러도 결국 부적 만들기로 가서 아래 만들기 입구와 겹쳤다. */}

        {/* ── 부적 청하기는 잠시 내렸다. /cheong 경로는 살려둔다 —
            이미 나눠준 "부적 써줄래?" 링크가 열려야 한다. ── */}
        <motion.section variants={fadeUp} className="mb-6">
          <button
            onClick={() => router.push("/rolling")}
            className="hanji-card mt-2.5 w-full rounded-xl px-5 py-3.5 text-left"
          >
            <p className="font-serif-kr text-[13px] font-bold text-[var(--color-meok)]">
              📜 롤링 부적
            </p>
            <p className="mt-0.5 text-[11.5px] text-[var(--color-galsaek)]">
              수능·생일·면접 앞둔 사람에게, 여럿의 기원을 겹쳐 쓴 부적을 →
            </p>
          </button>
        </motion.section>

        {/* ── 오늘 당신에게 필요한 부적 (사주 기반 추천) ── */}
        <motion.section variants={fadeUp} className="mt-4">
          <div className="mb-2 flex items-center gap-1.5 px-0.5">
            <h2 className="font-serif-kr text-sm font-bold text-[var(--color-meok)]">
              오늘 당신에게 필요한 부적
            </h2>
            {todayMatch && (
              <span className="text-[10px] text-[var(--color-galsaek)] opacity-70">
                사주 기반
              </span>
            )}
          </div>

          {todayMatch ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                router.push(`/talisman?recommended=${todayMatch.talisman.id}`)
              }
              className="hanji-card w-full rounded-xl px-5 py-4 text-left"
              aria-label={`${todayMatch.talisman.name} 부적 만들러 가기`}
            >
              <div className="flex items-start gap-3">
                {/* 한자 인장 */}
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-serif-kr text-lg font-bold leading-none text-[var(--color-juhong)]"
                  style={{
                    border: "1.5px solid rgba(167,43,33,0.35)",
                    background: "rgba(167,43,33,0.06)",
                  }}
                >
                  {todayMatch.talisman.hanja.slice(0, 2)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-serif-kr text-base font-bold text-[var(--color-meok)]">
                      {todayMatch.talisman.name}
                    </span>
                    <span
                      className="rounded-full px-2 py-[2px] text-[10px] font-bold text-[var(--color-galsaek)]"
                      style={{
                        background: "rgba(122,74,52,0.10)",
                        border: "1px solid rgba(122,74,52,0.20)",
                      }}
                    >
                      {todayMatch.talisman.category}
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-juhong)]">
                    {todayMatch.headline}
                  </p>
                </div>
              </div>

              {todayMatch.reasons.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {todayMatch.reasons.slice(0, 2).map((r) => (
                    <li
                      key={r.kind + r.text}
                      className="flex items-start gap-1.5 text-[12px] leading-relaxed text-[var(--color-galsaek)]"
                    >
                      <span className="mt-[6px] shrink-0 text-[6px] text-[var(--color-juhong)] opacity-70">
                        ●
                      </span>
                      <span>{r.text}</span>
                    </li>
                  ))}
                </ul>
              )}

              <span className="mt-3 flex items-center justify-end gap-1 text-[11.5px] font-bold text-[var(--color-juhong)]">
                이 부적 만들러 가기 <span aria-hidden>→</span>
              </span>
            </motion.button>
          ) : (
            <div className="hanji-card rounded-xl px-5 py-4">
              <p className="text-[12.5px] leading-relaxed text-[var(--color-galsaek)]">
                생년월일을 입력하면 맞춤 부적을 추천해드려요.
              </p>
              <Link
                href="/onboarding"
                className="mt-2.5 inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[12px] font-bold text-[var(--color-juhong)]"
                style={{ border: "1px solid rgba(167,43,33,0.35)" }}
              >
                사주 입력하러 가기 <span aria-hidden>→</span>
              </Link>
            </div>
          )}
        </motion.section>

        {/* ── 바로가기 — 운세 도구 모음 ── */}
        <motion.section variants={fadeUp} className="mt-5">
          <h2 className="mb-2 px-0.5 font-serif-kr text-sm font-bold text-[var(--color-meok)]">
            더 깊이 보기
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                href: "/saju",
                emoji: "🔮",
                title: "내 사주 풀이",
                desc: "타고난 결 읽기",
              },
              {
                href: "/days",
                emoji: "📅",
                title: "좋은 날 고르기",
                desc: "이사·계약·고백 택일",
              },
              {
                href: "/gunghap",
                emoji: "💕",
                title: "두 사람의 인연",
                desc: "궁합 보기",
              },
              {
                href: "/burn",
                emoji: "🔥",
                title: "걱정 태워보내기",
                desc: "마음 덜어내기",
              },
            ].map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="hanji-card flex flex-col items-start gap-1.5 rounded-xl px-4 py-3.5 transition-transform active:scale-[0.97]"
              >
                <span className="text-xl leading-none" aria-hidden>
                  {s.emoji}
                </span>
                <span className="font-serif-kr text-[13.5px] font-bold leading-tight text-[var(--color-meok)]">
                  {s.title}
                </span>
                <span
                  className="text-[11px] leading-tight opacity-80"
                  style={{
                    color:
                      s.href === '/days' && upcomingDay
                        ? 'var(--color-juhong)'
                        : 'var(--color-galsaek)',
                  }}
                >
                  {/* 고른 날이 있으면 남은 날을 대신 보여준다 */}
                  {s.href === '/days' && upcomingDay ? upcomingDay.line : s.desc}
                </span>
              </Link>
            ))}
          </div>
        </motion.section>
      </motion.main>

      <BottomTab />
    </HanjiBackground>
  );
}

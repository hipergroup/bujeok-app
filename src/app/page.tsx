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
import { getSaju, getOheng } from "@/data/saju";
import { getDailyFortune } from "@/data/fortune";
import { getTodayFortune as loadTodayFortune } from "@/lib/todayFortuneStore";
import { FORTUNE_AREAS, TIER_STYLE } from "@/data/today-fortune-view";
import type { TodayFortune } from "@/data/today-fortune";
import { RELATION_LABEL } from "@/lib/good-day/branch-relations";
import { getPlacedTalisman } from "@/lib/personal-talisman";
import PersonalTalismanView from "@/components/PersonalTalismanView";
import type { SavedTalisman } from "@/lib/types";
import { collectedCatalogIds } from "@/lib/collection";
import { isWidgetInstalled } from "@/lib/widget-bridge";
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

// ── 홈 화면에 모신 대표 부적 (localStorage) ──
let cachedPlaced: SavedTalisman | null | undefined;

function readPlaced(): SavedTalisman | null {
  if (cachedPlaced === undefined) cachedPlaced = getPlacedTalisman();
  return cachedPlaced;
}

function subscribePlaced(onChange: () => void) {
  cachedPlaced = undefined;
  onChange();
  const handler = () => {
    cachedPlaced = undefined;
    onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

const OHENG_LABEL: Record<string, string> = {
  목: "목(木)", 화: "화(火)", 토: "토(土)", 금: "금(金)", 수: "수(水)",
};

interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  /** false = 태어난 시 모름 → 시주를 빼고 푼다 */
  hourKnown?: boolean;
}

/** 오늘의 개운(행운색·방위·숫자·주문) 전용. 본 운세는 today-fortune 엔진이 만든다. */
function getGaeun(birthData?: BirthData) {
  if (birthData) {
    const saju = getSaju(birthData.year, birthData.month, birthData.day, birthData.hour);
    const fortune = getDailyFortune(saju, new Date());
    const oheng = getOheng(saju);
    const weakEl = (Object.entries(oheng) as [string, number][]).sort(
      (a, b) => a[1] - b[1]
    )[0][0];
    return {
      overall: fortune.overall,
      luckyColor: fortune.luckyColor,
      colorReason: `부족한 ${OHENG_LABEL[weakEl]} 기운을 채워주는 색`,
      luckyDirection: fortune.luckyDirection as string | null,
      luckyNumber: fortune.luckyNumber as number | null,
      dailyMantra: fortune.dailyMantra as string | null,
    };
  }

  // 사주가 없을 때 — 날짜 시드로 한 줄만 보여준다
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
    overall: overalls[hash % overalls.length],
    luckyColor: colors[hash % colors.length],
    colorReason: null as string | null,
    luckyDirection: null as string | null,
    luckyNumber: null as number | null,
    dailyMantra: null as string | null,
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
            hourKnown: u.birth.hourKnown !== false,
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
              hourKnown: p.birthHourKnown !== false,
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

  /* ── 오늘의 운세 — 계산 엔진이 만든 결과를 하루 한 번만 만들어 쓴다.
     생년월일이 없으면 null (섹션이 안내 카드로 바뀐다). */
  const today: TodayFortune | null = useMemo(() => {
    if (!birthData) return null;
    try {
      return loadTodayFortune({
        year: birthData.year,
        month: birthData.month,
        day: birthData.day,
        hour: birthData.hourKnown === false ? null : birthData.hour,
      });
    } catch {
      return null;
    }
  }, [birthData]);

  /* 홈 화면에 모신 대표 부적 — 이름 인장이 얹힌 개인 부적을 그대로 보여준다.
     localStorage 는 서버에 없으므로 useSyncExternalStore 로 읽는다. */
  const placedTalisman = useSyncExternalStore(
    subscribePlaced,
    readPlaced,
    () => null
  );

  /* 추천 부적을 이미 부적함에 갖고 있는지 / 위젯을 쓰고 있는지 —
     버튼 문구가 달라진다. 화면에 그릴 때만 필요하므로 함께 계산한다. */
  const talismanState = useMemo(() => {
    if (!today) return null;
    try {
      return {
        owned: collectedCatalogIds().has(today.talismanId),
        widget: isWidgetInstalled() === true,
      };
    } catch {
      return { owned: false, widget: false };
    }
  }, [today]);

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

  const gaeun = getGaeun(birthData);

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

        {/* ── 오늘의 운세 ──
            ① 한마디 → ② 들어오는 기운 → ③ 분야별 → ④ 오늘의 행동
            문구는 today-fortune 엔진이 계산 결과에 맞춰 고른 것만 쓴다. */}
        <motion.section variants={fadeUp} className="mb-6">
          <div className="hanji-card rounded-xl px-5 py-5">
            {today ? (
              <>
                {/* ① 오늘의 한마디 — 가장 먼저, 긴 설명 없이 */}
                <span
                  className="inline-block rounded-full px-2.5 py-[3px] text-[11px] font-bold"
                  style={{
                    color: TIER_STYLE[today.tier].color,
                    background: TIER_STYLE[today.tier].bg,
                  }}
                >
                  {today.tier}
                </span>
                <p className="mt-2.5 whitespace-pre-line font-serif-kr text-[17px] font-bold leading-[1.55] text-[var(--color-meok)]">
                  {today.headline}
                </p>

                {/* ② 오늘 들어오는 기운 */}
                <p
                  className="mt-3.5 border-t pt-3.5 text-[13px] leading-relaxed text-[var(--color-galsaek)]"
                  style={{ borderColor: "rgba(122,74,52,0.15)" }}
                >
                  {today.energy}
                </p>

                {/* 풀이 기준 — 전문 용어는 여기에만 둔다 */}
                <button
                  onClick={() => setBasisOpen((v) => !v)}
                  className="mt-2 w-full text-right text-[10.5px] text-[var(--color-galsaek)] opacity-60"
                  aria-expanded={basisOpen}
                >
                  {basisOpen ? "접기 ↑" : "풀이 기준 보기 ↓"}
                </button>
                {basisOpen && (
                  <div
                    className="mt-1.5 flex flex-col gap-1.5 rounded-lg px-3 py-2.5"
                    style={{ background: "rgba(122,74,52,0.05)" }}
                  >
                    <p className="text-[11px] leading-relaxed text-[var(--color-galsaek)]">
                      오늘의 일진과 일간의 관계, 오행의 흐름, 합·충 관계를 함께
                      살펴보았습니다.
                    </p>
                    <p className="text-[11px] leading-relaxed text-[var(--color-galsaek)]">
                      오늘 일진{" "}
                      <b className="text-[var(--color-meok)]">
                        {today.basis.todayGanji}({today.basis.todayGanjiHanja})
                      </b>
                      , 내 일간{" "}
                      <b className="text-[var(--color-meok)]">
                        {today.basis.myIlgan}({today.basis.myIlganHanja})
                      </b>{" "}
                      {today.basis.myIlganOheng} · 십성 {today.basis.sipseong} ·
                      일지 관계 {RELATION_LABEL[today.basis.branchRelation]}
                    </p>
                    <p className="text-[11px] leading-relaxed text-[var(--color-galsaek)]">
                      들어오는 기운 {today.basis.incomingOheng}(
                      {today.basis.incomingRole}) · 사주에서 가장 두터운 기운{" "}
                      {today.basis.strongOheng} · 가장 옅은 기운{" "}
                      {today.basis.weakOheng}
                    </p>
                    {today.basis.hourExcluded && (
                      <p className="text-[10.5px] leading-relaxed text-[var(--color-galsaek)] opacity-75">
                        태어난 시각을 몰라 시주(時柱)를 빼고 풀었어요.
                      </p>
                    )}
                    <Link
                      href="/unse/kijun"
                      className="mt-0.5 text-[10.5px] font-bold text-[var(--color-juhong)]"
                    >
                      운세 산정 기준 전체 보기 →
                    </Link>
                  </div>
                )}

                {/* ③ 분야별 운세 — 넷만 */}
                <ul
                  className="mt-3.5 flex flex-col gap-3 border-t pt-3.5"
                  style={{ borderColor: "rgba(122,74,52,0.15)" }}
                >
                  {FORTUNE_AREAS.map((area) => (
                    <li key={area.key} className="flex items-start gap-2">
                      <span className="mt-[1px] shrink-0 text-[12px]">
                        {area.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="font-serif-kr text-[11.5px] font-bold text-[var(--color-meok)]">
                          {area.label}
                        </span>
                        <span className="ml-1.5 text-[12.5px] leading-relaxed text-[var(--color-galsaek)]">
                          {today.areas[area.key]}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                {/* ④ 오늘의 행동 — 추상적으로 끝내지 않는다 */}
                <div className="mt-3.5 flex flex-col gap-2">
                  <div
                    className="rounded-lg px-3.5 py-2.5"
                    style={{
                      background: "rgba(167,43,33,0.05)",
                      border: "1px solid rgba(167,43,33,0.22)",
                    }}
                  >
                    <p className="font-serif-kr text-[11px] font-bold text-[var(--color-juhong)]">
                      오늘의 작은 실천
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-meok)]">
                      {today.doThis}
                    </p>
                  </div>
                  <div
                    className="rounded-lg px-3.5 py-2.5"
                    style={{ background: "rgba(122,74,52,0.06)" }}
                  >
                    <p className="font-serif-kr text-[11px] font-bold text-[var(--color-galsaek)]">
                      오늘 피하면 좋은 것
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-galsaek)]">
                      {today.avoidThis}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="font-serif-kr text-sm font-bold text-[var(--color-meok)]">
                  오늘의 운세
                </span>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-galsaek)]">
                  {gaeun.overall}
                </p>
                <Link
                  href="/onboarding"
                  className="mt-2.5 inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[12px] font-bold text-[var(--color-juhong)]"
                  style={{ border: "1px solid rgba(167,43,33,0.35)" }}
                >
                  사주를 넣고 자세히 보기 <span aria-hidden>→</span>
                </Link>
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
                  {COLOR_SWATCH[gaeun.luckyColor] && (
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{
                        background: COLOR_SWATCH[gaeun.luckyColor],
                        border: "1px solid rgba(46,46,46,0.18)",
                      }}
                    />
                  )}
                  <span className="font-serif-kr text-[13px] font-bold text-[var(--color-meok)]">
                    {gaeun.luckyColor}
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
                  {gaeun.luckyDirection ?? "—"}
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
                  {gaeun.luckyNumber ?? "—"}
                </span>
              </div>
            </div>

            {gaeun.colorReason && (
              <p className="mt-2 text-[10.5px] text-[var(--color-galsaek)] opacity-70">
                {gaeun.colorReason} — 옷·소품 하나면 충분해요
              </p>
            )}

            {/* 오늘의 주문 — 한 줄 개운 주문 */}
            {gaeun.dailyMantra && (
              <p
                className="mt-3 border-t pt-2.5 text-center font-serif-kr text-[12px] leading-relaxed text-[var(--color-galsaek)]"
                style={{ borderColor: "rgba(122,74,52,0.15)" }}
              >
                {gaeun.dailyMantra}
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

        {/* ── 내 곁의 수호부 — 홈 화면에 모신 개인 부적 ── */}
        {placedTalisman?.personal && (
          <motion.section variants={fadeUp} className="mt-4">
            <h2 className="mb-2 px-0.5 font-serif-kr text-sm font-bold text-[var(--color-meok)]">
              내 곁의 수호부
            </h2>
            <Link
              href="/collection"
              className="hanji-card flex items-center gap-4 rounded-xl px-5 py-4"
            >
              <div className="w-16 shrink-0 overflow-hidden rounded-md">
                <PersonalTalismanView talisman={placedTalisman} width="100%" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif-kr text-[14px] font-bold text-[var(--color-meok)]">
                  {placedTalisman.name}
                </p>
                {placedTalisman.personal.wishText && (
                  <p className="mt-0.5 truncate font-serif-kr text-[12px] text-[var(--color-galsaek)]">
                    “{placedTalisman.personal.wishText}”
                  </p>
                )}
                <p className="mt-1 text-[10px] text-[var(--color-galsaek)] opacity-70">
                  {placedTalisman.personal.serialNumber}
                </p>
              </div>
              <span aria-hidden className="text-[var(--color-galsaek)] opacity-50">
                →
              </span>
            </Link>
          </motion.section>
        )}

        {/* ── ⑤ 오늘의 추천 부적 ──
            매일 새로 만들게 하면 부적함이 복잡해진다. 43종 중 오늘 맞는
            부적을 권하고, 이미 갖고 있으면 다시 지니게 한다. */}
        <motion.section variants={fadeUp} className="mt-4">
          <div className="mb-2 flex items-center gap-1.5 px-0.5">
            <h2 className="font-serif-kr text-sm font-bold text-[var(--color-meok)]">
              오늘 {userName}님에게 필요한 부적
            </h2>
            {today && (
              <span className="text-[10px] text-[var(--color-galsaek)] opacity-70">
                사주 기반
              </span>
            )}
          </div>

          {today ? (
            <div className="hanji-card rounded-xl px-5 py-4">
              <div className="flex items-start gap-3">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-serif-kr text-lg font-bold leading-none text-[var(--color-juhong)]"
                  style={{
                    border: "1.5px solid rgba(167,43,33,0.35)",
                    background: "rgba(167,43,33,0.06)",
                  }}
                >
                  {today.talismanName.slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-serif-kr text-base font-bold text-[var(--color-meok)]">
                    {today.talismanName}
                  </span>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-juhong)]">
                    {today.talismanReason}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  router.push(`/talisman?recommended=${today.talismanId}`)
                }
                className="mt-3.5 w-full rounded-lg py-3 font-serif-kr text-[13px] font-bold"
                style={{
                  color: "#F6EDD9",
                  background: "var(--color-juhong)",
                  boxShadow: "inset 0 0 0 1px rgba(247,233,207,0.3)",
                }}
              >
                {!talismanState?.owned
                  ? "나만의 부적 짓기"
                  : talismanState.widget
                    ? "위젯에 지니기"
                    : "오늘의 부적으로 지니기"}
              </button>
              {talismanState?.owned && (
                <p className="mt-1.5 text-center text-[10.5px] text-[var(--color-galsaek)] opacity-70">
                  부적함에 이미 있어요 — 새로 만들지 않아도 괜찮아요
                </p>
              )}
            </div>
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

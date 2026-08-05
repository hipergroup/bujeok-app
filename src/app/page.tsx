"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomTab from "@/components/BottomTab";
import HanjiBackground from "@/components/hanji/HanjiBackground";
import TraditionalHeader from "@/components/hanji/TraditionalHeader";
import TalismanCategoryCard from "@/components/hanji/TalismanCategoryCard";
import {
  MenuIcon,
  BellIcon,
  SealLogo,
  BrushStroke,
  KnotMotif,
} from "@/components/hanji/motifs";
import { HOME_ENERGIES } from "@/data/energies";
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

const OHENG_LABEL: Record<string, string> = {
  목: "목(木)", 화: "화(火)", 토: "토(土)", 금: "금(金)", 수: "수(水)",
};

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
    const weakEl = (Object.entries(oheng) as [string, number][]).sort(
      (a, b) => a[1] - b[1]
    )[0][0];
    return {
      score: fortune.score,
      overall: fortune.overall,
      luckyColor: fortune.luckyColor,
      colorReason: `부족한 ${OHENG_LABEL[weakEl]} 기운을 채워주는 색`,
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
    luckyColor: colors[hash % colors.length],
    colorReason: null as string | null,
  };
}

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
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userName, setUserName] = useState("");
  const [birthData, setBirthData] = useState<BirthData | undefined>();

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
          <p className="mt-2 font-serif-kr text-sm text-[var(--color-galsaek)]">
            마음의 방향을 선택해 보세요.
          </p>
        </motion.section>

        {/* ── 마음 카테고리 2열 ── */}
        <motion.section variants={fadeUp} className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {HOME_ENERGIES.map((energy) => (
              <TalismanCategoryCard
                key={energy.id}
                energy={energy}
                onClick={() => router.push(`/talisman?energy=${energy.id}`)}
              />
            ))}
          </div>
        </motion.section>

        {/* ── 나만의 부적 만들기 CTA ── */}
        <motion.section variants={fadeUp} className="mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/talisman")}
            className="hanji-card relative flex w-full items-center gap-4 rounded-xl px-5 py-5 text-left"
            style={{ borderColor: "rgba(167, 43, 33, 0.5)" }}
          >
            <span
              className="pointer-events-none absolute inset-[4px] rounded-lg"
              style={{ border: "1px solid rgba(167, 43, 33, 0.25)" }}
            />
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[var(--color-juhong)]"
              style={{ border: "1.5px solid rgba(167,43,33,0.4)" }}
            >
              <KnotMotif size={30} />
            </span>
            <span className="flex-1">
              <span className="block font-serif-kr text-lg font-bold text-[var(--color-juhong)]">
                나만의 부적 만들기
              </span>
              <span className="mt-0.5 block text-xs text-[var(--color-galsaek)]">
                마음을 담아 부적을 직접 만들어 보세요.
              </span>
            </span>
            <span className="text-[var(--color-juhong)]">→</span>
          </motion.button>
        </motion.section>

        {/* ── 오늘의 운세 (사주 기반) ── */}
        <motion.section variants={fadeUp}>
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
            <p className="mt-2 text-[11px] text-[var(--color-galsaek)] opacity-70">
              오늘의 행운색 · {fortune.luckyColor}
              {fortune.colorReason && ` — ${fortune.colorReason}`}
            </p>
          </div>
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
      </motion.main>

      <BottomTab />
    </HanjiBackground>
  );
}

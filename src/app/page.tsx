"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
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

const OnboardingPage = dynamic(() => import("./onboarding/page"), { ssr: false });

/* ── 오늘의 운세 (기존 기능 유지 — 컴팩트 카드) ────── */
function getTodayFortune() {
  const seed = new Date().toDateString();
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const score = (hash % 5) + 1;

  const overalls = [
    "오늘은 새로운 시작에 좋은 날입니다. 마음 속 계획을 실행에 옮겨보세요.",
    "평온한 기운이 감싸는 하루입니다. 감사하는 마음으로 주변을 돌아보세요.",
    "활발한 기운이 넘치는 날입니다. 적극적으로 움직이면 좋은 결과가 따릅니다.",
    "차분히 내면을 돌아보기 좋은 날입니다. 산책이나 명상을 권합니다.",
    "행운의 기운이 가득한 날입니다. 중요한 결정을 내리기에 좋습니다.",
  ];
  const colors = ["금색", "붉은색", "쪽빛", "쑥색", "보라색", "흰색"];

  return {
    score,
    overall: overalls[hash % overalls.length],
    luckyColor: colors[hash % colors.length],
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

  useEffect(() => {
    const onboarded = localStorage.getItem("onboarding_completed");
    if (!onboarded) {
      setNeedsOnboarding(true);
      setReady(true);
      return;
    }

    try {
      const profile = localStorage.getItem("user_profile");
      if (profile) setUserName(JSON.parse(profile).name || "수호자");
      else setUserName("수호자");
    } catch {
      setUserName("수호자");
    }
    setReady(true);
  }, []);

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

  const fortune = getTodayFortune();

  return (
    <HanjiBackground decorated>
      <TraditionalHeader
        left={
          <button onClick={() => alert("메뉴는 준비 중이에요 🙏")} aria-label="메뉴">
            <MenuIcon size={22} />
          </button>
        }
        wordmark
        right={
          <button onClick={() => alert("알림은 준비 중이에요 🙏")} aria-label="알림">
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

        {/* ── 오늘의 운세 (컴팩트) ── */}
        <motion.section variants={fadeUp}>
          <div className="hanji-card rounded-xl px-5 py-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-serif-kr text-sm font-bold text-[var(--color-meok)]">
                오늘의 운세
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
            </p>
          </div>
        </motion.section>
      </motion.main>

      <BottomTab />
    </HanjiBackground>
  );
}

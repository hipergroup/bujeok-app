"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import BottomTab from "@/components/BottomTab";
import FortuneCard from "@/components/FortuneCard";

const OnboardingPage = dynamic(() => import("./onboarding/page"), { ssr: false });

/* ── Animal Emoji Map ──────────────────── */
const ANIMAL_EMOJI: Record<string, string> = {
  쥐: "🐭",
  소: "🐮",
  호랑이: "🐯",
  토끼: "🐰",
  용: "🐲",
  뱀: "🐍",
  말: "🐴",
  양: "🐑",
  원숭이: "🐵",
  닭: "🐔",
  개: "🐶",
  돼지: "🐷",
};

/* ── Fortune Category Data ─────────────── */
const FORTUNE_CATEGORIES = [
  { key: "wealth", label: "재물운", emoji: "💰", color: "from-yellow-900/30 to-amber-900/20" },
  { key: "love", label: "애정운", emoji: "💕", color: "from-pink-900/30 to-rose-900/20" },
  { key: "health", label: "건강운", emoji: "💪", color: "from-green-900/30 to-emerald-900/20" },
  { key: "study", label: "학업운", emoji: "📚", color: "from-blue-900/30 to-indigo-900/20" },
];

/* ── 오늘의 운세 (사주 기반) ─────────────── */
import { getSaju, getOheng } from "@/data/saju";
import { getDailyFortune } from "@/data/fortune";

const OHENG_LABEL: Record<string, string> = {
  목: "목(木)", 화: "화(火)", 토: "토(土)", 금: "금(金)", 수: "수(水)",
};

function getTodayFortune(birthData?: { year: number; month: number; day: number; hour: number }) {
  if (birthData) {
    const saju = getSaju(birthData.year, birthData.month, birthData.day, birthData.hour);
    const fortune = getDailyFortune(saju, new Date());
    const oheng = getOheng(saju);
    const weakEl = (Object.entries(oheng) as [string, number][]).sort((a, b) => a[1] - b[1])[0][0];
    return {
      score: fortune.score,
      overall: fortune.overall,
      luckyColor: fortune.luckyColor,
      luckyDirection: fortune.luckyDirection,
      luckyNumber: fortune.luckyNumber,
      mantra: fortune.dailyMantra,
      colorReason: `부족한 ${OHENG_LABEL[weakEl]} 기운을 채워주는 색`,
      categories: {
        wealth: fortune.money,
        love: fortune.love,
        health: fortune.health,
        study: fortune.study,
      },
    };
  }

  // 사주 데이터 없을 때 fallback
  const seed = new Date().toDateString();
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    score: (hash % 5) + 1,
    overall: "온보딩을 완료하면 사주 기반 맞춤 운세를 볼 수 있어요.",
    luckyColor: "금색",
    luckyDirection: "동쪽",
    luckyNumber: ((hash * 7) % 99) + 1,
    mantra: "모든 일이 나에게 최선의 방향으로 흘러간다",
    colorReason: undefined as string | undefined,
    categories: {
      wealth: "온보딩을 완료해 보세요",
      love: "온보딩을 완료해 보세요",
      health: "온보딩을 완료해 보세요",
      study: "온보딩을 완료해 보세요",
    },
  };
}

/* ── Stagger Children Variant ──────────── */
const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ── Component ─────────────────────────── */
export default function HomePage() {
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userName, setUserName] = useState("");
  const [animal, setAnimal] = useState("");
  const [birthData, setBirthData] = useState<{ year: number; month: number; day: number; hour: number } | undefined>();

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
        setAnimal(u.animal || "");
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
          setAnimal(p.animal || "");
        } else {
          setUserName("수호자");
        }
      }
    } catch {
      setUserName("수호자");
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-dvh" style={{background:"#0a0a1a"}}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          ☯
        </motion.div>
      </div>
    );
  }

  if (needsOnboarding) {
    return <OnboardingPage />;
  }

  const fortune = getTodayFortune(birthData);
  const animalEmoji = ANIMAL_EMOJI[animal] || "✨";

  return (
    <div className="flex flex-col min-h-dvh">
      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex-1 max-w-md mx-auto w-full px-4 pt-6 pb-28"
      >
        {/* ── Greeting ──────────────────────── */}
        <motion.section variants={fadeUp} className="mb-6">
          <p className="text-sm text-[var(--color-text-muted)] mb-1">
            {new Date().toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
          <h1 className="text-2xl font-bold text-glow">
            {animalEmoji} {userName}님, 안녕하세요!
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            오늘 하루도 좋은 기운과 함께하세요
          </p>
        </motion.section>

        {/* ── Fortune Card ──────────────────── */}
        <motion.section variants={fadeUp} className="mb-6">
          <FortuneCard
            score={fortune.score}
            overall={fortune.overall}
            luckyColor={fortune.luckyColor}
            luckyDirection={fortune.luckyDirection}
            luckyNumber={fortune.luckyNumber}
            mantra={fortune.mantra}
          />
        </motion.section>

        {/* ── Fortune Categories ────────────── */}
        <motion.section variants={fadeUp} className="mb-6">
          <h2 className="text-base font-semibold text-[var(--color-text-secondary)] mb-3">
            카테고리별 운세
          </h2>
          <div className="fortune-scroll">
            {FORTUNE_CATEGORIES.map((cat) => {
              const catText =
                fortune.categories[cat.key as keyof typeof fortune.categories];
              return (
                <motion.div
                  key={cat.key}
                  whileTap={{ scale: 0.96 }}
                  className={`card-glass min-w-[160px] max-w-[200px] p-4 bg-gradient-to-br ${cat.color}`}
                >
                  <span className="text-2xl block mb-2">{cat.emoji}</span>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                    {cat.label}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
                    {catText}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Lucky Elements ────────────────── */}
        <motion.section variants={fadeUp} className="mb-6">
          <h2 className="text-base font-semibold text-[var(--color-text-secondary)] mb-3">
            오늘의 행운 요소
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="card-glass p-3 text-center">
              <p className="text-xl mb-1">🎨</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                행운의 색
              </p>
              <p className="text-sm font-semibold text-[var(--color-gold)]">
                {fortune.luckyColor}
              </p>
              {fortune.colorReason && (
                <p className="text-[9px] text-[var(--color-text-muted)] mt-1 leading-tight">
                  {fortune.colorReason}
                </p>
              )}
            </div>
            <div className="card-glass p-3 text-center">
              <p className="text-xl mb-1">🧭</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                행운의 방위
              </p>
              <p className="text-sm font-semibold text-[var(--color-gold)]">
                {fortune.luckyDirection}
              </p>
            </div>
            <div className="card-glass p-3 text-center">
              <p className="text-xl mb-1">🔢</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                행운의 숫자
              </p>
              <p className="text-sm font-semibold text-[var(--color-gold)]">
                {fortune.luckyNumber}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── Daily Mantra ──────────────────── */}
        <motion.section variants={fadeUp} className="mb-8">
          <div className="relative card-glass p-5 bg-gradient-to-br from-[rgba(212,168,83,0.06)] to-[rgba(178,34,34,0.04)] text-center overflow-hidden">
            {/* Decorative corners */}
            <span className="absolute top-2 left-3 text-[var(--color-gold)] opacity-20 text-2xl">
              ✦
            </span>
            <span className="absolute bottom-2 right-3 text-[var(--color-gold)] opacity-20 text-2xl">
              ✦
            </span>
            <span className="absolute top-2 right-3 text-[var(--color-red-ink)] opacity-15 text-lg">
              ◆
            </span>
            <span className="absolute bottom-2 left-3 text-[var(--color-red-ink)] opacity-15 text-lg">
              ◆
            </span>

            <p className="text-xs text-[var(--color-gold)] opacity-70 mb-2 tracking-wide">
              ✧ 오늘의 한 줄 주문 ✧
            </p>
            <p
              className="text-xl font-bold leading-relaxed"
              style={{
                color: "#F5D896",
                textShadow: "0 1px 3px rgba(0,0,0,0.7)",
              }}
            >
              &ldquo;{fortune.mantra}&rdquo;
            </p>
          </div>
        </motion.section>

        {/* ── CTA Button ───────────────────── */}
        <motion.section variants={fadeUp} className="mb-4">
          <Link href="/talisman" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn-gold text-center text-lg"
            >
              부적 받으러 가기 ✨
            </motion.div>
          </Link>
        </motion.section>
      </motion.main>

      {/* ── Bottom Tab ─────────────────────── */}
      <BottomTab />
    </div>
  );
}

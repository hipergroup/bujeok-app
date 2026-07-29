"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import BottomTab from "@/components/BottomTab";
import FortuneCard from "@/components/FortuneCard";

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

/* ── Mock Fortune Data ─────────────────── */
function getTodayFortune() {
  const seed = new Date().toDateString();
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const score = (hash % 5) + 1;

  const overalls = [
    "오늘은 새로운 시작에 좋은 날입니다. 마음 속 깊이 품었던 계획을 실행에 옮겨보세요.",
    "평온한 에너지가 감싸는 하루입니다. 감사하는 마음으로 주변을 돌아보세요.",
    "활발한 기운이 넘치는 날입니다. 적극적으로 행동하면 좋은 결과가 따릅니다.",
    "차분하게 내면을 돌아보기 좋은 시간입니다. 명상이나 산책을 추천합니다.",
    "행운의 기운이 가득합니다! 중요한 결정을 내리기에 좋은 날이에요.",
  ];

  const mantras = [
    "나는 매 순간 더 나은 나로 성장하고 있다",
    "우주의 풍요로운 에너지가 나에게로 흐른다",
    "나의 마음은 평화롭고 세상은 아름답다",
    "모든 일이 나에게 최선의 방향으로 흘러간다",
    "나는 사랑받기에 충분한 존재이다",
  ];

  const colors = ["금색", "붉은색", "파란색", "초록색", "보라색", "흰색"];
  const directions = ["동쪽", "서쪽", "남쪽", "북쪽", "동남쪽", "북서쪽"];

  return {
    score,
    overall: overalls[hash % overalls.length],
    luckyColor: colors[hash % colors.length],
    luckyDirection: directions[(hash + 1) % directions.length],
    luckyNumber: ((hash * 7) % 99) + 1,
    mantra: mantras[hash % mantras.length],
    categories: {
      wealth: (hash % 5) + 1,
      love: ((hash + 2) % 5) + 1,
      health: ((hash + 3) % 5) + 1,
      study: ((hash + 1) % 5) + 1,
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
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState("");
  const [animal, setAnimal] = useState("");

  useEffect(() => {
    const onboarded = localStorage.getItem("onboarding_completed");
    if (!onboarded) {
      router.replace("/onboarding");
      return;
    }

    const profile = localStorage.getItem("user_profile");
    if (profile) {
      try {
        const p = JSON.parse(profile);
        setUserName(p.name || "수호자");
        setAnimal(p.animal || "");
      } catch {
        setUserName("수호자");
      }
    } else {
      setUserName("수호자");
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-dvh">
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

  const fortune = getTodayFortune();
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
              const catScore =
                fortune.categories[cat.key as keyof typeof fortune.categories];
              return (
                <motion.div
                  key={cat.key}
                  whileTap={{ scale: 0.96 }}
                  className={`card-glass min-w-[140px] p-4 bg-gradient-to-br ${cat.color}`}
                >
                  <span className="text-2xl block mb-2">{cat.emoji}</span>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                    {cat.label}
                  </p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${
                          i < catScore
                            ? "text-[var(--color-gold)]"
                            : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
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

            <p className="text-xs text-[var(--color-text-muted)] mb-2">
              ✧ 오늘의 한 줄 주문 ✧
            </p>
            <p className="text-lg font-semibold text-[var(--color-gold)] text-glow leading-relaxed">
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

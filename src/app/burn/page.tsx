"use client";

// ============================================================
// 걱정 태워보내기 (燒厄) — 걱정을 종이에 적어 태워 보내는 의식
// ------------------------------------------------------------
// ⚠️ 프라이버시 원칙
//  · 사용자가 적은 글은 React 상태(메모리)에만 존재합니다.
//  · localStorage 저장 금지 · 네트워크 전송 금지 · 로깅 금지.
//  · localStorage 에는 오직 횟수와 마지막 날짜만 남습니다.
//    ('bujeok-burn-stats' = { count, lastAt })
//  · 위기 신호가 감지되면 CrisisSupport 로 전문가 연결을 안내합니다.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import HanjiBackground from "@/components/hanji/HanjiBackground";
import TraditionalHeader from "@/components/hanji/TraditionalHeader";
import TraditionalButton from "@/components/hanji/TraditionalButton";
import CrisisSupport from "@/components/CrisisSupport";
import { BackIcon, BrushStroke, FlameMotif } from "@/components/hanji/motifs";
import { detectCrisis } from "@/lib/crisis-detection";

/* ───────── 상수 ───────── */

const MAX_LEN = 200;

/** 태운 뒤 남는 유일한 기록 — 횟수와 마지막 날짜뿐 (내용은 절대 저장하지 않음) */
const STATS_KEY = "bujeok-burn-stats";

interface BurnStats {
  count: number;
  lastAt: string;
}

function recordBurn(): BurnStats {
  let prev: BurnStats = { count: 0, lastAt: "" };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.count === "number" && parsed.count >= 0) {
        prev = { count: parsed.count, lastAt: String(parsed.lastAt ?? "") };
      }
    }
  } catch {
    /* 손상된 값은 새로 시작 */
  }
  const next: BurnStats = { count: prev.count + 1, lastAt: new Date().toISOString() };
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(next));
  } catch {
    /* 저장 실패해도 의식은 계속 */
  }
  return next;
}

/** 마무리 화면의 따뜻한 문장들 — 무작위로 하나 */
const CLOSING_MESSAGES = [
  "걱정은 적는 순간부터 가벼워집니다.\n오늘은 여기까지로 충분해요.",
  "태워 보낸 자리에는\n새 마음이 들어올 자리가 생깁니다.",
  "무거운 마음을 내려놓는 것도 용기예요.\n잘 하셨어요.",
  "재가 된 걱정은 바람이 데려갑니다.\n이제 조금 홀가분해지셨기를.",
  "모든 걱정이 사라지지 않아도 괜찮아요.\n오늘 하나를 보낸 것만으로 충분합니다.",
];

/* ───────── 불꽃 · 재 · 연기 (순수 SVG/CSS + framer-motion) ───────── */

/** 주홍→황 그라데이션 불꽃 한 갈래 */
function Flame({
  left,
  width,
  height,
  delay,
  flickerDuration,
}: {
  left: string;
  width: number;
  height: number;
  delay: number;
  flickerDuration: number;
}) {
  return (
    <motion.div
      aria-hidden
      className="absolute bottom-0"
      style={{ left, width, height, originY: 1, originX: 0.5 }}
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{
        scaleY: [0, 1, 1.22, 0.88, 1.12, 0.95, 1.18, 1],
        scaleX: [1, 1, 0.92, 1.06, 0.95, 1.04, 0.9, 1],
        opacity: [0, 0.95, 1, 0.9, 1, 0.92, 1, 0.95],
      }}
      transition={{
        delay,
        duration: flickerDuration,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
    >
      <svg viewBox="0 0 24 34" className="h-full w-full" preserveAspectRatio="none">
        {/* 겉불꽃: 주홍 → 황 */}
        <path
          d="M12 0 C13 6 22 12 22 21 C22 28.8 17.4 34 12 34 C6.6 34 2 28.8 2 21 C2 12 11 6 12 0 Z"
          fill="url(#burn-flame-grad)"
        />
        {/* 속불꽃: 밝은 황 */}
        <path
          d="M12 12 C12.5 16 17 18.5 17 23.5 C17 28.4 14.7 31 12 31 C9.3 31 7 28.4 7 23.5 C7 18.5 11.5 16 12 12 Z"
          fill="#F3CE6B"
          opacity="0.9"
        />
      </svg>
    </motion.div>
  );
}

/** 위로 떠오르는 불티 */
function Ember({
  left,
  size,
  delay,
  duration,
  drift,
  rise,
  color,
}: {
  left: string;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  rise: number;
  color: string;
}) {
  return (
    <motion.span
      aria-hidden
      className="absolute bottom-0 rounded-full"
      style={{ left, width: size, height: size, backgroundColor: color }}
      initial={{ y: 0, x: 0, opacity: 0 }}
      animate={{ y: [-4, -rise], x: [0, drift], opacity: [0, 1, 0.8, 0] }}
      transition={{ delay, duration, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

/** 흩어지는 연기 */
function Smoke({
  left,
  size,
  delay,
  duration,
}: {
  left: string;
  size: number;
  delay: number;
  duration: number;
}) {
  return (
    <motion.span
      aria-hidden
      className="absolute bottom-6 rounded-full blur-md"
      style={{ left, width: size, height: size, backgroundColor: "#8B8578" }}
      initial={{ y: 0, opacity: 0, scale: 0.6 }}
      animate={{ y: [-20, -150], x: [0, size * 0.4, -size * 0.3], opacity: [0, 0.22, 0], scale: [0.6, 1.9] }}
      transition={{ delay, duration, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

/* ───────── 태우기 애니메이션 (~4초) ───────── */

const IGNITE = 0.7; // 종이가 자리잡은 뒤 불이 붙기까지
const BURN = 2.6; // 종이가 타들어가는 시간
const TOTAL_MS = 4200;

function BurnAnimation({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, TOTAL_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  // 불티 파라미터는 마운트 시 1회 생성 (burn 단계는 클라이언트 상호작용 후에만 렌더됨)
  const embers = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        left: `${8 + Math.random() * 84}%`,
        size: 2 + Math.random() * 3,
        delay: IGNITE + 0.2 + Math.random() * 2,
        duration: 1.1 + Math.random() * 1.1,
        drift: (Math.random() - 0.5) * 44,
        rise: 90 + Math.random() * 110,
        color: i % 3 === 0 ? "#DAA017" : "#A72B21",
      })),
    []
  );

  const burnTransition = { delay: IGNITE, duration: BURN, ease: "easeInOut" as const };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 pb-24">
      {/* 그라데이션 정의 (한 번만) */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <linearGradient id="burn-flame-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#A72B21" />
            <stop offset="55%" stopColor="#DAA017" />
            <stop offset="100%" stopColor="#DAA017" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: TOTAL_MS / 1000, times: [0, 0.15, 0.75, 1] }}
        className="mb-8 font-serif-kr text-sm text-[var(--color-galsaek)]"
      >
        걱정을 태워 보내는 중이에요…
      </motion.p>

      {/* 종이가 중앙으로 떠오른다 */}
      <motion.div
        initial={{ y: 36, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[300px]"
      >
        {/* 연기 */}
        <Smoke left="20%" size={34} delay={IGNITE + 0.6} duration={2.4} />
        <Smoke left="52%" size={46} delay={IGNITE + 1.1} duration={2.8} />
        <Smoke left="72%" size={28} delay={IGNITE + 1.6} duration={2.2} />

        {/* 종이 본체 — 아래에서 위로 타들어가며 사라진다 */}
        <motion.div
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={burnTransition}
          className="hanji-card relative min-h-[220px] rounded-lg px-6 py-8"
        >
          <motion.p
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: IGNITE + 0.4, duration: BURN * 0.7, ease: "easeIn" }}
            className="whitespace-pre-wrap break-words font-serif-kr text-[15px] leading-[1.9] text-[var(--color-meok)]"
          >
            {text}
          </motion.p>
        </motion.div>

        {/* 불선(燃線): 그을린 가장자리 + 불꽃 + 불티 — 종이와 같은 속도로 위로 이동 */}
        <motion.div
          initial={{ bottom: "0%" }}
          animate={{ bottom: "100%" }}
          transition={burnTransition}
          className="pointer-events-none absolute left-0 right-0 h-0"
        >
          {/* 은은한 불빛 */}
          <motion.div
            aria-hidden
            className="absolute -bottom-5 left-1/2 h-16 w-[115%] -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(218,160,23,0.4), rgba(167,43,33,0.18) 55%, transparent 75%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.85, 1] }}
            transition={{ delay: IGNITE - 0.15, duration: 1.2, repeat: Infinity, repeatType: "mirror" }}
          />

          {/* 그을린 종이 가장자리 (짙은 갈색 #3B2317) */}
          <motion.svg
            aria-hidden
            viewBox="0 0 300 20"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 h-5 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: IGNITE - 0.1, duration: 0.4 }}
          >
            <path
              d="M0 20 L0 11 L14 6 L27 13 L42 5 L58 12 L70 7 L88 14 L102 6 L118 12 L134 5 L150 13 L165 7 L181 14 L196 6 L212 12 L228 5 L244 13 L259 7 L274 12 L288 6 L300 11 L300 20 Z"
              fill="#3B2317"
            />
            <path
              d="M0 11 L14 6 L27 13 L42 5 L58 12 L70 7 L88 14 L102 6 L118 12 L134 5 L150 13 L165 7 L181 14 L196 6 L212 12 L228 5 L244 13 L259 7 L274 12 L288 6 L300 11"
              fill="none"
              stroke="#A72B21"
              strokeWidth="1.6"
              opacity="0.75"
            />
          </motion.svg>

          {/* 불꽃들 */}
          <Flame left="6%" width={26} height={44} delay={IGNITE - 0.1} flickerDuration={0.5} />
          <Flame left="24%" width={34} height={62} delay={IGNITE} flickerDuration={0.42} />
          <Flame left="44%" width={40} height={74} delay={IGNITE - 0.05} flickerDuration={0.55} />
          <Flame left="64%" width={32} height={56} delay={IGNITE + 0.08} flickerDuration={0.46} />
          <Flame left="82%" width={24} height={40} delay={IGNITE + 0.04} flickerDuration={0.6} />

          {/* 불티 */}
          {embers.map((e, i) => (
            <Ember key={i} {...e} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ───────── 페이지 ───────── */

type Step = "write" | "burn" | "done";

export default function BurnPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const [step, setStep] = useState<Step>("write");
  // ⚠️ 걱정 텍스트는 이 상태에만 존재한다 — 저장·전송 금지
  const [text, setText] = useState("");
  const [crisisLevel, setCrisisLevel] = useState<"concern" | "high" | null>(null);
  const [stats, setStats] = useState<BurnStats | null>(null);
  const [closingMsg, setClosingMsg] = useState(CLOSING_MESSAGES[0]);
  const burnedRef = useRef(false);

  const finishBurn = useCallback(() => {
    if (!burnedRef.current) {
      burnedRef.current = true;
      setStats(recordBurn());
      setClosingMsg(CLOSING_MESSAGES[Math.floor(Math.random() * CLOSING_MESSAGES.length)]);
    }
    setText(""); // 태운 글은 메모리에서도 지운다
    setStep("done");
  }, []);

  const startBurn = useCallback(() => {
    burnedRef.current = false;
    if (reducedMotion) {
      // 움직임 최소화 설정: 애니메이션 없이 바로 마무리로
      finishBurn();
    } else {
      setStep("burn");
    }
  }, [reducedMotion, finishBurn]);

  /** '태워 보내기' — 태우기 전에 위기 신호를 살핀다 */
  const handleSubmit = useCallback(() => {
    if (!text.trim()) return;
    const result = detectCrisis(text);
    if (result.level !== "none") {
      setCrisisLevel(result.level);
      return;
    }
    startBurn();
  }, [text, startBurn]);

  const resetToWrite = useCallback(() => {
    burnedRef.current = false;
    setText("");
    setStep("write");
  }, []);

  return (
    <HanjiBackground>
      <TraditionalHeader
        left={
          step !== "burn" ? (
            <button onClick={() => router.push("/")} aria-label="홈으로">
              <BackIcon size={22} />
            </button>
          ) : undefined
        }
        title="걱정 태워보내기"
      />

      {/* ── Step 1: 적기 ── */}
      {step === "write" && (
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-4"
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <h1 className="font-brush text-[24px] leading-snug text-[var(--color-meok)]">
              마음에 담아둔
              <br />
              걱정을 꺼내보세요
            </h1>
            <div className="mt-2 text-[var(--color-juhong)]">
              <BrushStroke width={100} />
            </div>
            <p className="mt-2 font-serif-kr text-[12.5px] text-[var(--color-galsaek)]">
              종이에 적어 태우면, 액도 함께 타서 사라진다고 해요.
            </p>
          </div>

          <div className="hanji-card relative rounded-xl px-5 pb-10 pt-5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
              maxLength={MAX_LEN}
              rows={7}
              autoFocus
              aria-label="걱정 적기"
              placeholder={
                "어떤 걱정이든 괜찮아요. 여기 적은 글은 어디에도 저장되지 않아요."
              }
              className="w-full resize-none bg-transparent font-serif-kr text-[15px] leading-[1.9] text-[var(--color-meok)] outline-none placeholder:text-[var(--color-galsaek)] placeholder:opacity-50"
            />
            <span className="absolute bottom-3 right-4 text-[11px] tabular-nums text-[var(--color-galsaek)] opacity-60">
              {text.length}/{MAX_LEN}
            </span>
          </div>

          <p className="mt-2.5 text-center text-[11px] leading-relaxed text-[var(--color-galsaek)] opacity-70">
            적은 글은 저장되거나 전송되지 않고, 태우는 순간 완전히 사라집니다.
          </p>

          <div className="mt-6">
            <TraditionalButton onClick={handleSubmit} disabled={!text.trim()}>
              <span className="inline-flex items-center justify-center gap-1.5">
                <FlameMotif size={18} /> 태워 보내기
              </span>
            </TraditionalButton>
          </div>
        </motion.main>
      )}

      {/* ── Step 2: 태우기 ── */}
      {step === "burn" && <BurnAnimation text={text} onDone={finishBurn} />}

      {/* ── Step 3: 마무리 ── */}
      {step === "done" && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-16 text-center"
        >
          {/* 사그라든 재 위 마지막 온기 */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-full text-[var(--color-juhong)]"
            style={{
              border: "1.5px solid rgba(167,43,33,0.35)",
              background: "rgba(167,43,33,0.06)",
            }}
            aria-hidden
          >
            <FlameMotif size={34} />
          </motion.div>

          <h1 className="font-brush text-[26px] leading-snug text-[var(--color-meok)]">
            훌훌, 태워 보냈어요
          </h1>
          <div className="mt-2 text-[var(--color-juhong)]">
            <BrushStroke width={110} />
          </div>

          <p className="mt-4 whitespace-pre-line font-serif-kr text-[14px] leading-[1.9] text-[var(--color-galsaek)]">
            {closingMsg}
          </p>

          {stats && (
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-5 rounded-full px-4 py-1.5 text-[12px] font-bold text-[var(--color-galsaek)]"
              style={{
                background: "rgba(122,74,52,0.10)",
                border: "1px solid rgba(122,74,52,0.25)",
              }}
            >
              {stats.count}번째 태워 보냈어요
            </motion.span>
          )}

          <div className="mt-9 flex w-full max-w-xs flex-col gap-2.5">
            <TraditionalButton onClick={() => router.push("/talisman")}>
              마음을 지켜줄 부적 받기
            </TraditionalButton>
            <TraditionalButton variant="ghost" onClick={resetToWrite}>
              한 번 더
            </TraditionalButton>
          </div>
        </motion.main>
      )}

      {/* 위기 신호 안내 — 닫으면 머무르고, 계속하면 태우기로 진행 */}
      <AnimatePresence>
        {crisisLevel && (
          <CrisisSupport
            level={crisisLevel}
            onClose={() => setCrisisLevel(null)}
            onContinue={() => {
              setCrisisLevel(null);
              startBurn();
            }}
          />
        )}
      </AnimatePresence>
    </HanjiBackground>
  );
}

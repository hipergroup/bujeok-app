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

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import HanjiBackground from "@/components/hanji/HanjiBackground";
import TraditionalHeader from "@/components/hanji/TraditionalHeader";
import TraditionalButton from "@/components/hanji/TraditionalButton";
import CrisisSupport from "@/components/CrisisSupport";
import { BackIcon, BrushStroke, FlameMotif } from "@/components/hanji/motifs";
import { assetPath } from "@/lib/assetPath";
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

/* ───────── 태우기 애니메이션 (향로 영상, ~6.2초) ───────── */
//
// 영상은 빈 종이가 향로에서 아래부터 타들어가 재와 연기만 남는 8초짜리다.
// 타이밍(초): 0 온전함 · 0.7 발화 · 2 삼분의 일 · 4.5 종이 사라짐 · 이후 연기
//
// 사용자가 쓴 걱정은 영상 속 종이 위에 얹고, 불선이 올라오는 속도에 맞춰
// 아래에서 위로 지워지게 한다 — 자기가 쓴 글이 실제로 타는 것처럼 보이도록.

/** 영상 속 종이의 위치 (프레임 대비 %) — 글자를 이 안에 앉힌다 */
const PAPER = { left: 21, right: 14, top: 20, bottom: 34 };

const IGNITE = 0.7; // 불이 붙는 시각
const BURN = 3.6; // 종이가 다 타는 데 걸리는 시간
const TOTAL_MS = 6200; // 종이가 사라진 뒤 연기를 잠시 보여주고 마무리

function BurnAnimation({ text, onDone }: { text: string; onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t = setTimeout(onDone, TOTAL_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  // 소리와 함께 재생을 시도한다.
  // 브라우저는 소리 있는 자동재생을 막지만, 이 화면은 "태워 보내기" 를 누른
  // 직후에만 뜨므로 그 조작이 재생을 허용해 준다. 그래도 막히는 환경이 있어
  // (설정으로 소리를 끈 브라우저 등) 그때는 무음으로라도 반드시 틀어
  // 영상이 멈춰 서는 일은 없게 한다.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = 0.7;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {
        /* 재생 자체가 막혀도 포스터가 남고 타이머는 그대로 흐른다 */
      });
    });
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: TOTAL_MS / 1000, times: [0, 0.12, 0.7, 1] }}
        className="mb-5 font-serif-kr text-sm text-[var(--color-galsaek)]"
      >
        걱정을 태워 보내는 중이에요…
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[320px] overflow-hidden rounded-xl"
        style={{ aspectRatio: '720 / 1280' }}
      >
        {/* autoPlay·muted 를 두지 않는다 — 위 effect 가 소리와 함께 재생을 건다 */}
        <video
          ref={videoRef}
          src={assetPath('/burn/burn-paper.mp4')}
          poster={assetPath('/burn/burn-paper-poster.jpg')}
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* 내가 쓴 걱정 — 불선을 따라 아래에서 위로 지워진다 */}
        <motion.div
          aria-hidden
          className="absolute flex items-center justify-center overflow-hidden px-2"
          style={{
            left: `${PAPER.left}%`,
            right: `${PAPER.right}%`,
            top: `${PAPER.top}%`,
            bottom: `${PAPER.bottom}%`,
          }}
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ delay: IGNITE, duration: BURN, ease: 'easeInOut' }}
        >
          <p
            className="whitespace-pre-wrap break-words text-center font-serif-kr text-[var(--color-meok)]"
            style={{ fontSize: 12, lineHeight: 1.85, opacity: 0.88 }}
          >
            {text}
          </p>
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

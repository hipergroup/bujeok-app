"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  DIALOGUE_FLOWS,
  extractKeywords,
  type DialogueFlow,
} from "@/data/dialogues";
import {
  TalismanCategory,
  TALISMANS,
  getTalismanRecommendation,
  type TalismanType,
} from "@/data/talismans";
import { JIJI, getAnimal } from "@/data/saju";
import { ENERGIES, getEnergyById, type Energy } from "@/data/energies";
import ChatBubble, { type DialogueOption } from "@/components/ChatBubble";
import TalismanPreview from "@/components/TalismanPreview";
import CrisisSupport from "@/components/CrisisSupport";
import HanjiBackground from "@/components/hanji/HanjiBackground";
import TraditionalHeader from "@/components/hanji/TraditionalHeader";
import TraditionalButton from "@/components/hanji/TraditionalButton";
import EnergySelector from "@/components/hanji/EnergySelector";
import TalismanCategoryCard from "@/components/hanji/TalismanCategoryCard";
import { BackIcon, GearIcon, BrushStroke } from "@/components/hanji/motifs";
import {
  generateTalismanSVG,
  BACKGROUND_PRESETS,
} from "@/lib/talisman-generator";
import { detectCrisis, SAFETY_DISCLAIMER } from "@/lib/crisis-detection";
import {
  composeShareImage,
  shareOrDownload,
  type ShareFormat,
} from "@/lib/share-card";
import type { SavedTalisman } from "@/lib/types";

/* ───────── types ───────── */

type ChatMessage = {
  id: string;
  text: string;
  isBot: boolean;
  options?: DialogueOption[];
};

type Phase = "category" | "chat" | "customize" | "reveal";

/* ───────── constants ───────── */

const ENCOURAGEMENT_MESSAGES: Record<string, string[]> = {
  [TalismanCategory.Protection]: [
    "나쁜 기운은 물러가고 평안만 깃들기를",
    "안전하고 평화로운 하루가 되기를",
    "모든 액운이 사라지기를 기원합니다",
  ],
  [TalismanCategory.Wealth]: [
    "재물과 복이 가득 들어오기를",
    "풍요로운 하루하루가 되기를",
    "하는 일마다 결실을 맺기를",
  ],
  [TalismanCategory.Health]: [
    "몸도 마음도 편안하기를 기원합니다",
    "오늘도 건강하게, 내일도 무탈하게",
    "가족의 건강과 무사함을 기원합니다",
  ],
  [TalismanCategory.Family]: [
    "가족의 평안과 화합을 기원합니다",
    "사랑이 넘치는 가정이 되기를",
    "좋은 인연이 찾아오기를",
  ],
  [TalismanCategory.Study]: [
    "노력한 만큼 좋은 결과가 있기를",
    "흔들림 없는 집중력이 함께하기를",
    "바라는 시험에 반드시 합격하기를",
  ],
  [TalismanCategory.Other]: [
    "간절한 소원이 이루어지기를",
    "행운이 가득한 날들이 되기를",
    "좋은 일만 가득하기를 기원합니다",
  ],
};

/**
 * 마음이 무거운 분께 드리는 부적.
 * 위기 신호가 감지되었을 때 카테고리와 무관하게 이 부적으로 안내합니다.
 */
const SUPPORTIVE_TALISMAN = {
  name: "정신안정부",
  description:
    "불안과 스트레스를 가라앉혀 마음의 평화를 주는 부적입니다.\n오늘 하루, 조금 더 편안해지시길 바라요.",
  messages: [
    "오늘도 잘 버텼어요, 수고했어요",
    "천천히 숨 쉬어도 괜찮아요",
    "당신은 소중한 사람입니다",
    "마음이 편안해지기를 기원합니다",
  ],
};

/** 12지 수호 동물 선택지 (없음 포함) */
const ANIMAL_OPTIONS: { label: string; emoji: string; value: string }[] = [
  { label: "없음", emoji: "🚫", value: "" },
  ...JIJI.map((ji) => ({ label: ji.animal, emoji: ji.emoji, value: ji.animal })),
];

/* ───────── helpers ───────── */

/** 온보딩에서 저장한 사용자 정보 → 이름·띠 동물 */
function loadUserContext(): { name: string; animal: string } {
  try {
    const raw = localStorage.getItem("bujeok-user");
    if (raw) {
      const parsed = JSON.parse(raw);
      const year = parsed?.birth?.year;
      return {
        name: parsed?.name || "",
        // 온보딩이 저장한 띠(입춘 보정 반영)를 우선 사용, 없으면 연도로 계산
        animal:
          parsed?.animal ||
          (typeof year === "number" ? getAnimal(year).name : ""),
      };
    }
    const profile = localStorage.getItem("user_profile");
    if (profile) {
      const parsed = JSON.parse(profile);
      return { name: parsed?.name || "", animal: parsed?.animal || "" };
    }
  } catch {
    // ignore
  }
  return { name: "", animal: "" };
}

/** 3단계 진행 표시 */
function StepDots({ current }: { current: 1 | 2 | 3 }) {
  const labels = ["마음 나누기", "부적 꾸미기", "완성"];
  return (
    <div className="flex items-center justify-center gap-2 pb-3">
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const active = n === current;
        const done = n < current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  active
                    ? "bg-[var(--color-juhong)] text-[#F6EDD9]"
                    : done
                      ? "bg-[var(--color-beige)] text-[var(--color-galsaek)]"
                      : "text-[var(--color-galsaek)] opacity-50"
                }`}
                style={
                  !active && !done
                    ? { border: "1px solid rgba(122,74,52,0.4)" }
                    : undefined
                }
              >
                {n}
              </span>
              <span
                className={`text-[11px] ${
                  active
                    ? "font-bold text-[var(--color-juhong)]"
                    : "text-[var(--color-galsaek)] opacity-70"
                }`}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <span className="h-px w-4 bg-[var(--color-galsaek)] opacity-30" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ───────── component ───────── */

function TalismanFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* shared state */
  const [phase, setPhase] = useState<Phase>("category");
  const [selectedEnergy, setSelectedEnergy] = useState<Energy | null>(null);

  /* chat state */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatDone, setChatDone] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [keywords, setKeywords] = useState<string[]>([]);
  const [recommended, setRecommended] = useState<TalismanType | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* crisis-support state
     ⚠️ 사용자가 입력한 문장은 로그·저장·전송하지 않습니다.
        모달이 열려 있는 동안에만 ref 에 잠시 보관했다가 대화에 반영합니다. */
  const [crisisLevel, setCrisisLevel] = useState<"concern" | "high" | null>(
    null
  );
  const pendingTextRef = useRef<string | null>(null);
  /** 위기 신호가 감지되면 위로 중심의 부적으로 안내 */
  const [supportiveMode, setSupportiveMode] = useState(false);
  /** setTimeout 콜백 안에서 최신 값을 읽기 위한 미러 */
  const supportiveModeRef = useRef(false);

  /* customization state */
  const [talismanStyle, setTalismanStyle] =
    useState<"traditional" | "modern">("traditional");
  const [background, setBackground] = useState("hwangji");
  const [animalChoice, setAnimalChoice] = useState("");
  const [encouragement, setEncouragement] = useState("");
  const [userCtx, setUserCtx] = useState({ name: "", animal: "" });

  /* reveal state */
  const [saved, setSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState<ShareFormat | null>(null);

  /* ── load user profile (인장 이름 + 띠 동물 기본값) ── */
  useEffect(() => {
    const ctx = loadUserContext();
    setUserCtx(ctx);
    setAnimalChoice(ctx.animal);
  }, []);

  /* derived */
  const selectedCategory = selectedEnergy?.category ?? null;
  const dialogue: DialogueFlow | null = selectedCategory
    ? DIALOGUE_FLOWS.find((f) => f.category === selectedCategory) ?? null
    : null;
  const accent = selectedEnergy?.color ?? "#A72B21";
  const talismanName = supportiveMode
    ? SUPPORTIVE_TALISMAN.name
    : recommended
      ? recommended.name
      : dialogue
        ? `${dialogue.label} 부적`
        : "";
  const talismanType = supportiveMode
    ? TalismanCategory.Health
    : selectedCategory ?? "기타";
  const talismanDescription = supportiveMode
    ? SUPPORTIVE_TALISMAN.description
    : recommended?.description ?? dialogue?.description ?? "";

  /* 생성기에 넘길 공통 파라미터 */
  const talismanParams = {
    type: recommended?.id ?? talismanType,
    style: talismanStyle,
    background,
    accent,
    animal: animalChoice || undefined,
    title: talismanName,
    hanja: recommended?.hanja,
    message: encouragement,
    mantra: recommended?.mantra ?? "",
    userName: userCtx.name || undefined,
    symbols: recommended?.symbols,
  };

  /* ── auto-scroll chat ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── initialize encouragement when entering customise ── */
  useEffect(() => {
    if (phase === "customize" && selectedCategory && !encouragement) {
      const pool = supportiveMode
        ? SUPPORTIVE_TALISMAN.messages
        : ENCOURAGEMENT_MESSAGES[selectedCategory];
      setEncouragement(pool[Math.floor(Math.random() * pool.length)]);
    }
  }, [phase, selectedCategory, encouragement, supportiveMode]);

  /* ──────── phase handlers ──────── */

  /* 1. energy(마음) 선택 → chat */
  const handleEnergySelect = useCallback((energy: Energy) => {
    setSelectedEnergy(energy);
    setPhase("chat");
    setResponses({});
    setKeywords([]);
    setRecommended(null);
    const flow = DIALOGUE_FLOWS.find((f) => f.category === energy.category);
    if (!flow) return;
    const firstStep = flow.steps[0];

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const opts: DialogueOption[] | undefined = firstStep.options?.map(
        (o) => ({ label: o, value: o })
      );
      setMessages([
        { id: `bot-0`, text: firstStep.question, isBot: true, options: opts },
      ]);
      setCurrentStep(0);
    }, 1200);
  }, []);

  /* 홈에서 ?energy= 파라미터로 진입하면 해당 마음으로 바로 상담 시작 */
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current) return;
    const id = searchParams.get("energy");
    if (!id) return;
    const energy = getEnergyById(id);
    if (energy) {
      autoStarted.current = true;
      handleEnergySelect(energy);
    }
  }, [searchParams, handleEnergySelect]);

  /* 2. chat option / free-text */
  const advanceChat = useCallback(
    (userText: string) => {
      if (!dialogue) return;

      const step = dialogue.steps[currentStep];
      const nextIdx = currentStep + 1;

      // 응답 기록 (부적 추천용 키워드 추출에 사용)
      const newResponses = { ...responses, [step.id]: userText };
      setResponses(newResponses);

      const userMsg: ChatMessage = {
        id: `user-${nextIdx}`,
        text: userText,
        isBot: false,
      };
      setMessages((prev) => [...prev, userMsg]);

      // step.next === null means this is the last step
      if (step.next === null) {
        // 대화 응답 → 키워드 → 43종 중 맞춤 부적 추천
        const kws = extractKeywords(dialogue, newResponses);
        setKeywords(kws);
        const rec = supportiveModeRef.current
          ? TALISMANS.find((t) => t.name === SUPPORTIVE_TALISMAN.name) ??
            getTalismanRecommendation(TalismanCategory.Health, kws)
          : getTalismanRecommendation(dialogue.category, kws);
        setRecommended(rec);

        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const resultMsg: ChatMessage = {
            id: "result",
            text: supportiveModeRef.current
              ? `당신의 마음을 가만히 담아봤어요 🌿\n\n「${SUPPORTIVE_TALISMAN.name}」\n\n${SUPPORTIVE_TALISMAN.description}`
              : `당신에게 어울리는 부적을 찾았어요 ✨\n\n「${rec.name} (${rec.hanja})」\n\n${rec.description}`,
            isBot: true,
          };
          setMessages((prev) => [...prev, resultMsg]);
          setChatDone(true);
        }, 1500);
        return;
      }

      const nextStep = dialogue.steps[nextIdx];
      if (!nextStep) return;

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const opts: DialogueOption[] | undefined = nextStep.options?.map(
          (o) => ({ label: o, value: o })
        );
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${nextIdx}`,
            text: nextStep.question,
            isBot: true,
            options: opts,
          },
        ]);
        setCurrentStep(nextIdx);
      }, 1200);
    },
    [dialogue, currentStep, responses]
  );

  const handleOptionSelect = useCallback(
    (option: DialogueOption) => advanceChat(option.label),
    [advanceChat]
  );

  /**
   * 사용자가 직접 입력한 문장 처리.
   * 대화를 진행하기 "전에" 위기 신호를 먼저 살펴봅니다.
   *
   * ⚠️ 입력 원문은 절대 로깅·저장·전송하지 않습니다.
   *    감지 결과(level)만 사용하고, 원문은 대화 말풍선에 넣기 위해
   *    ref 에 잠시 보관합니다.
   */
  const submitUserText = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;

      const { level } = detectCrisis(text);

      if (level !== "none") {
        setSupportiveMode(true);
        supportiveModeRef.current = true;
        pendingTextRef.current = text;
        setCrisisLevel(level);
        return; // 안내를 먼저 보여드리고, 이어서 대화를 계속합니다.
      }

      advanceChat(text);
    },
    [advanceChat]
  );

  /** 안내를 닫으면(어떤 버튼이든) 사용자의 답변을 잃지 않고 그대로 이어갑니다. */
  const resumeAfterCrisis = useCallback(() => {
    const pending = pendingTextRef.current;
    pendingTextRef.current = null;
    setCrisisLevel(null);
    if (pending) advanceChat(pending);
  }, [advanceChat]);

  const handleFreeTextSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = userInput.trim();
      if (!text) return;
      setUserInput("");
      submitUserText(text);
    },
    [userInput, submitUserText]
  );

  /* customize 단계에서 기운을 바꾸면 색·추천을 다시 계산 */
  const handleEnergyChange = useCallback(
    (energy: Energy) => {
      setSelectedEnergy(energy);
      if (!supportiveModeRef.current) {
        setRecommended(getTalismanRecommendation(energy.category, keywords));
      }
    },
    [keywords]
  );

  /* 상담 초기화 후 카테고리로 */
  const resetToCategory = useCallback(() => {
    setPhase("category");
    setMessages([]);
    setCurrentStep(0);
    setChatDone(false);
    setIsTyping(false);
    setResponses({});
    setKeywords([]);
    setRecommended(null);
    setCrisisLevel(null);
    pendingTextRef.current = null;
    setSupportiveMode(false);
    supportiveModeRef.current = false;
    setEncouragement("");
    setSaved(false);
  }, []);

  /* 3. save to 부적함 (bujeok-collection) */
  const handleSave = useCallback(() => {
    if (!recommended) return;

    const talisman: SavedTalisman = {
      id: `custom-${Date.now()}`,
      name: recommended.name,
      hanja: recommended.hanja,
      category: recommended.category,
      description: recommended.description,
      whenToUse: encouragement
        ? `「${encouragement}」의 마음을 담아 직접 만든 부적입니다.`
        : "직접 만든 나만의 맞춤 부적입니다.",
      symbolsExplained: recommended.symbols.length
        ? `${recommended.symbols.join(" · ")} 문양이 담겨 있습니다.`
        : "나만의 문양이 담겨 있습니다.",
      howToUse: recommended.usage,
      svgKey: recommended.id,
      savedAt: new Date().toISOString(),
      note: encouragement || undefined,
      svg: generateTalismanSVG(talismanParams),
    };

    try {
      const existing: SavedTalisman[] = JSON.parse(
        localStorage.getItem("bujeok-collection") || "[]"
      );
      existing.unshift(talisman);
      localStorage.setItem("bujeok-collection", JSON.stringify(existing));
      setSaved(true);
    } catch {
      // storage full 등
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommended, encouragement, talismanStyle, background, animalChoice, userCtx, accent]);

  /* 4. 공유 — 원본/스토리(9:16)/정사각(1:1) */
  const handleShare = useCallback(
    async (format: ShareFormat) => {
      const svg = generateTalismanSVG(talismanParams);
      try {
        const blob = await composeShareImage(svg, format, {
          name: talismanName,
          hanja: recommended?.hanja,
        });
        const result = await shareOrDownload(
          blob,
          `수호부_${talismanName}`,
          `✨ 나만의 부적 「${talismanName}」을 만들었어요 🙏`
        );
        if (result !== "cancelled") {
          setShareStatus(format);
          setTimeout(() => setShareStatus(null), 2000);
        }
      } catch {
        // 합성 실패 시 무시 (다음 시도 가능)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [talismanName, recommended, talismanStyle, background, animalChoice, encouragement, userCtx, accent]
  );

  const stepNum: 1 | 2 | 3 =
    phase === "customize" ? 2 : phase === "reveal" ? 3 : 1;

  /* ══════════════════ RENDER ══════════════════ */

  return (
    <HanjiBackground>
      <TraditionalHeader
        left={
          <button
            onClick={() => {
              if (phase === "category") router.push("/");
              else if (phase === "chat") resetToCategory();
              else if (phase === "customize") setPhase("chat");
              else setPhase("customize");
            }}
            aria-label="뒤로가기"
          >
            <BackIcon size={20} />
          </button>
        }
        title="나만의 부적 만들기"
        right={
          <button
            onClick={() => alert("설정은 준비 중이에요 🙏")}
            aria-label="설정"
          >
            <GearIcon size={20} />
          </button>
        }
      />
      <StepDots current={stepNum} />

      <AnimatePresence mode="wait">
        {/* ─── Phase 1: 마음 선택 ─── */}
        {phase === "category" && (
          <motion.div
            key="category"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="mx-auto w-full max-w-md flex-1 px-5 pb-32"
          >
            <h2 className="font-brush mb-1 text-center text-[22px] text-[var(--color-meok)]">
              어떤 마음을 담아볼까요?
            </h2>
            <p className="mb-6 text-center text-xs text-[var(--color-galsaek)]">
              마음의 방향을 고르면 짧은 대화 후 부적을 만들어 드려요.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {ENERGIES.map((energy) => (
                <TalismanCategoryCard
                  key={energy.id}
                  energy={energy}
                  onClick={() => handleEnergySelect(energy)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Phase 2: 상담 대화 ─── */}
        {phase === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="mx-auto flex w-full max-w-lg flex-1 flex-col"
          >
            <div
              className="px-4 pb-2 text-center text-xs text-[var(--color-galsaek)]"
              style={{ borderBottom: "1px solid rgba(122,74,52,0.2)" }}
            >
              {selectedEnergy?.title} · 마음 나누기
            </div>

            {/* messages */}
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((msg, idx) => {
                const isLastBot =
                  msg.isBot && !chatDone && idx === messages.length - 1;
                return (
                  <ChatBubble
                    key={msg.id}
                    message={msg.text}
                    isBot={msg.isBot}
                    options={isLastBot ? msg.options : undefined}
                    onSelect={handleOptionSelect}
                    /* 보기 중에 마음에 드는 게 없어도 직접 이야기할 수 있게 */
                    allowFreeText={
                      isLastBot && !!msg.options && msg.options.length > 0
                    }
                    onFreeTextSubmit={submitUserText}
                    freeTextPlaceholder="편하게 적어주세요..."
                  />
                );
              })}

              {isTyping && <ChatBubble message="" isBot isTyping />}

              {chatDone && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center pt-4"
                >
                  <div className="w-full max-w-[240px]">
                    <TraditionalButton onClick={() => setPhase("customize")}>
                      부적 만들기
                    </TraditionalButton>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* free-text input */}
            {!chatDone && !isTyping && messages.length > 0 && (
              <form
                onSubmit={handleFreeTextSubmit}
                className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
                style={{ borderTop: "1px solid rgba(122,74,52,0.2)" }}
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="직접 입력해도 좋아요..."
                    className="min-w-0 flex-1 rounded-full px-4 py-2.5 text-sm text-[var(--color-meok)] placeholder-[var(--color-galsaek)]/50 focus:outline-none"
                    style={{
                      border: "1px solid rgba(122,74,52,0.4)",
                      backgroundColor: "rgba(246,237,217,0.8)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!userInput.trim()}
                    className="rounded-full px-4 py-2.5 text-sm text-[#F6EDD9] transition-all disabled:opacity-40"
                    style={{ backgroundColor: "var(--color-juhong)" }}
                  >
                    전송
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* ─── Phase 3: 부적 꾸미기 ─── */}
        {phase === "customize" && (
          <motion.div
            key="customize"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="mx-auto w-full max-w-md flex-1 px-5 pb-16"
          >
            <p className="mb-4 text-center font-serif-kr text-sm leading-relaxed text-[var(--color-galsaek)]">
              지금, 마음을 한 줄로 적어보세요.
              <br />
              당신의 마음이 부적이 됩니다.
            </p>

            {/* 기원 문구 입력 — 미리보기에 즉시 반영 */}
            <input
              type="text"
              value={encouragement}
              onChange={(e) => setEncouragement(e.target.value)}
              maxLength={24}
              placeholder="가족의 건강과 무사함을 기원합니다"
              className="mb-1 w-full rounded-lg px-4 py-3 text-center font-serif-kr text-sm text-[var(--color-meok)] placeholder-[var(--color-galsaek)]/40 focus:outline-none"
              style={{
                border: "1px solid rgba(122,74,52,0.4)",
                backgroundColor: "rgba(246,237,217,0.8)",
              }}
            />
            <p className="mb-4 text-right text-[10px] text-[var(--color-galsaek)] opacity-60">
              {encouragement.length}/24
            </p>

            {/* 부적 미리보기 */}
            <div className="relative mb-2 flex justify-center">
              <TalismanPreview
                type={talismanType}
                style={talismanStyle}
                message={encouragement}
                background={background}
                accent={accent}
                animal={animalChoice || undefined}
                symbols={recommended?.symbols}
                userName={userCtx.name || undefined}
                title={talismanName}
                hanja={recommended?.hanja}
                mantra={recommended?.mantra}
                size="md"
              />
            </div>
            <div className="mb-5 flex justify-center text-[var(--color-meok)] opacity-60">
              <BrushStroke width={100} />
            </div>

            {/* 기운 선택 (가로 스크롤) */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-bold text-[var(--color-galsaek)]">
                기운 선택
              </label>
              <EnergySelector
                selectedId={selectedEnergy?.id ?? ""}
                onSelect={handleEnergyChange}
              />
            </div>

            {/* 화풍 · 바탕 종이 */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[var(--color-galsaek)]">
                  화풍
                </label>
                <div className="flex gap-1.5">
                  {(["traditional", "modern"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setTalismanStyle(s)}
                      className={`flex-1 rounded-lg py-2 text-xs transition-colors ${
                        talismanStyle === s
                          ? "bg-[var(--color-juhong)] font-bold text-[#F6EDD9]"
                          : "text-[var(--color-galsaek)]"
                      }`}
                      style={
                        talismanStyle !== s
                          ? { border: "1px solid rgba(122,74,52,0.35)" }
                          : undefined
                      }
                    >
                      {s === "traditional" ? "전통" : "현대"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[var(--color-galsaek)]">
                  바탕 종이
                </label>
                <div className="flex gap-1.5">
                  {BACKGROUND_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setBackground(preset.id)}
                      title={preset.label}
                      className="flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5"
                      style={{
                        border:
                          background === preset.id
                            ? "1.5px solid var(--color-juhong)"
                            : "1px solid rgba(122,74,52,0.3)",
                      }}
                    >
                      <span
                        className="h-5 w-5 rounded-full"
                        style={{
                          backgroundColor: preset.swatch,
                          border: "1px solid rgba(122,74,52,0.35)",
                        }}
                      />
                      <span className="text-[9px] text-[var(--color-galsaek)]">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 수호 동물 */}
            <div className="mb-6">
              <label className="mb-1.5 block text-xs font-bold text-[var(--color-galsaek)]">
                수호 동물
                {userCtx.animal && (
                  <span className="ml-1.5 font-normal opacity-70">
                    (내 띠: {userCtx.animal})
                  </span>
                )}
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {ANIMAL_OPTIONS.map((opt) => {
                  const active = animalChoice === opt.value;
                  return (
                    <button
                      key={opt.value || "none"}
                      onClick={() => setAnimalChoice(opt.value)}
                      title={opt.label}
                      className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors ${
                        active ? "bg-[rgba(167,43,33,0.12)]" : ""
                      }`}
                      style={{
                        border: active
                          ? "1.5px solid var(--color-juhong)"
                          : "1px solid rgba(122,74,52,0.25)",
                      }}
                    >
                      <span className="text-base leading-none">{opt.emoji}</span>
                      <span
                        className={`text-[9px] ${
                          active
                            ? "font-bold text-[var(--color-juhong)]"
                            : "text-[var(--color-galsaek)]"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <TraditionalButton onClick={() => setPhase("reveal")}>
              부적 완성하기
            </TraditionalButton>
          </motion.div>
        )}

        {/* ─── Phase 4: 완성 ─── */}
        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring", damping: 18 }}
              className="mb-5"
            >
              <TalismanPreview
                type={talismanType}
                style={talismanStyle}
                message={encouragement}
                background={background}
                accent={accent}
                animal={animalChoice || undefined}
                symbols={recommended?.symbols}
                userName={userCtx.name || undefined}
                title={talismanName}
                hanja={recommended?.hanja}
                mantra={recommended?.mantra}
                size="lg"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-6 text-center"
            >
              <h2 className="font-serif-kr text-xl font-bold text-[var(--color-meok)]">
                「{talismanName}」
                {recommended && (
                  <span className="ml-1.5 text-sm font-normal text-[var(--color-galsaek)]">
                    {recommended.hanja}
                  </span>
                )}
              </h2>
              <p className="mx-auto mt-2 max-w-xs whitespace-pre-line text-sm leading-relaxed text-[var(--color-galsaek)]">
                {talismanDescription}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex w-full max-w-xs flex-col gap-3"
            >
              {saved ? (
                <div
                  className="w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]"
                  style={{ border: "1px solid rgba(107,125,99,0.5)" }}
                >
                  ✓ 부적함에 담았습니다
                </div>
              ) : (
                <TraditionalButton onClick={handleSave}>
                  부적함에 담기
                </TraditionalButton>
              )}

              <div className="flex gap-2">
                {(
                  [
                    { format: "original", label: "이미지 저장" },
                    { format: "story", label: "스토리 카드" },
                    { format: "square", label: "정사각 카드" },
                  ] as const
                ).map((btn) => (
                  <button
                    key={btn.format}
                    onClick={() => handleShare(btn.format)}
                    className={`flex-1 rounded-full py-2.5 text-xs font-medium transition-all active:scale-95 ${
                      shareStatus === btn.format
                        ? "font-bold text-[var(--color-ssuk)]"
                        : "text-[var(--color-galsaek)]"
                    }`}
                    style={{
                      border:
                        shareStatus === btn.format
                          ? "1px solid rgba(107,125,99,0.6)"
                          : "1px solid rgba(122,74,52,0.4)",
                      backgroundColor: "rgba(246,237,217,0.7)",
                    }}
                  >
                    {shareStatus === btn.format ? "✓ 완료" : btn.label}
                  </button>
                ))}
              </div>
              <p className="text-center text-[10px] text-[var(--color-galsaek)] opacity-60">
                스토리 9:16 · 정사각 1:1 — 인스타·카톡 공유에 맞는 크기예요
              </p>

              <button
                onClick={resetToCategory}
                className="mt-1 text-center text-xs text-[var(--color-galsaek)] underline underline-offset-2 opacity-70"
              >
                새 부적 만들기
              </button>
            </motion.div>

            {/* 안전 고지 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="mt-8 w-full max-w-xs"
            >
              <p className="whitespace-pre-line text-center text-[10px] leading-[1.7] text-[var(--color-galsaek)] opacity-60">
                {SAFETY_DISCLAIMER}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-[var(--color-galsaek)] opacity-70">
                <a href="tel:109" className="underline underline-offset-2">
                  자살예방상담 109
                </a>
                <span className="opacity-50">·</span>
                <a href="tel:15770199" className="underline underline-offset-2">
                  정신건강상담 1577-0199
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 위기 신호 감지 시 전문 도움 안내 ─── */}
      {crisisLevel && (
        <CrisisSupport
          level={crisisLevel}
          onClose={resumeAfterCrisis}
          onContinue={resumeAfterCrisis}
        />
      )}
    </HanjiBackground>
  );
}

export default function TalismanPage() {
  return (
    <Suspense fallback={null}>
      <TalismanFlow />
    </Suspense>
  );
}

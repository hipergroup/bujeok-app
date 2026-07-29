"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DIALOGUE_FLOWS,
  type DialogueFlow,
} from "@/data/dialogues";
import { TalismanCategory } from "@/data/talismans";
import ChatBubble, { type DialogueOption } from "@/components/ChatBubble";
import TalismanPreview from "@/components/TalismanPreview";
import { generateTalismanSVG } from "@/lib/talisman-generator";

/* ───────── types ───────── */

type CategoryId = string;

type ChatMessage = {
  id: string;
  text: string;
  isBot: boolean;
  options?: DialogueOption[];
};

type Phase = "category" | "chat" | "customize" | "reveal";

/* ───────── derived constants from DIALOGUE_FLOWS ───────── */

const CATEGORY_META: Record<
  string,
  { icon: string; color: string; subtitle: string }
> = {
  수호: { icon: "🛡️", color: "#FFD700", subtitle: "액막이·보호" },
  재물: { icon: "💰", color: "#DAA520", subtitle: "재물·사업운" },
  건강: { icon: "🍀", color: "#228B22", subtitle: "건강·치유" },
  가정: { icon: "🏠", color: "#FF69B4", subtitle: "가정·인연" },
  학업: { icon: "📚", color: "#4169E1", subtitle: "학업·시험" },
  기타: { icon: "🌈", color: "#9370DB", subtitle: "소원·행운" },
};

const CATEGORIES = DIALOGUE_FLOWS.map((flow) => {
  const meta = CATEGORY_META[flow.category] ?? {
    icon: "✨",
    color: "#FFD700",
    subtitle: flow.description,
  };
  return {
    id: flow.category as string,
    title: flow.label,
    icon: meta.icon,
    color: meta.color,
    subtitle: meta.subtitle,
  };
});

const ENCOURAGEMENT_MESSAGES: Record<string, string[]> = {
  [TalismanCategory.Protection]: [
    "당신을 지켜줄게요 🛡️",
    "나쁜 기운은 물러가라!",
    "안전하고 평화로운 하루",
    "모든 액운이 사라져요",
  ],
  [TalismanCategory.Wealth]: [
    "부자 되세요 💰",
    "재물이 넘쳐나길!",
    "돈이 들어옵니다",
    "풍요로운 하루하루",
  ],
  [TalismanCategory.Health]: [
    "건강이 최고예요 🍀",
    "오늘도 건강하게!",
    "몸도 마음도 편안하게",
    "쾌유를 빕니다",
  ],
  [TalismanCategory.Family]: [
    "가화만사성 🏠",
    "사랑이 넘치는 가정",
    "좋은 인연이 찾아와요",
    "행복한 우리 가족",
  ],
  [TalismanCategory.Study]: [
    "합격 기원! 📚",
    "집중! 또 집중!",
    "꿈을 향해 달려요",
    "반드시 합격합니다",
  ],
  [TalismanCategory.Other]: [
    "소원이 이루어져요 ✨",
    "행운이 가득하길!",
    "좋은 일만 가득",
    "모든 소원 성취",
  ],
};

/* ───────── constants ───────── */

const BG_COLOR_OPTIONS = [
  { label: "기본", value: "" },
  { label: "심야", value: "#0a0a1a" },
  { label: "심홍", value: "#1a0505" },
  { label: "심록", value: "#051a0a" },
];

/* ───────── helpers ───────── */

function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 2,
  }));
}

/* ───────── component ───────── */

export default function TalismanPage() {
  /* shared state */
  const [phase, setPhase] = useState<Phase>("category");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(
    null
  );

  /* chat state */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatDone, setChatDone] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* customization state */
  const [talismanStyle, setTalismanStyle] =
    useState<"traditional" | "modern">("traditional");
  const [bgColor, setBgColor] = useState("");
  const [encouragement, setEncouragement] = useState("");

  /* reveal state */
  const [particles] = useState(() => generateParticles(40));
  const [saved, setSaved] = useState(false);

  /* derived */
  const dialogue: DialogueFlow | null = selectedCategory
    ? DIALOGUE_FLOWS.find((f) => f.category === selectedCategory) ?? null
    : null;
  const talismanName = dialogue ? `${dialogue.label} 부적` : "";
  const talismanType = dialogue?.category ?? "기타";

  /* ── auto-scroll chat ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── initialize encouragement when entering customise ── */
  useEffect(() => {
    if (phase === "customize" && selectedCategory && !encouragement) {
      const pool = ENCOURAGEMENT_MESSAGES[selectedCategory];
      setEncouragement(pool[Math.floor(Math.random() * pool.length)]);
    }
  }, [phase, selectedCategory, encouragement]);

  /* ──────── phase handlers ──────── */

  /* 1. category → chat */
  const handleCategorySelect = useCallback(
    (catId: CategoryId) => {
      setSelectedCategory(catId);
      setPhase("chat");
      const flow = DIALOGUE_FLOWS.find((f) => f.category === catId);
      if (!flow) return;
      const firstStep = flow.steps[0];

      // show typing then first bot message
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const opts: DialogueOption[] | undefined = firstStep.options?.map(
          (o) => ({ label: o, value: o })
        );
        setMessages([
          {
            id: `bot-0`,
            text: firstStep.question,
            isBot: true,
            options: opts,
          },
        ]);
        setCurrentStep(0);
      }, 1200);
    },
    []
  );

  /* 2. chat option / free-text */
  const advanceChat = useCallback(
    (userText: string) => {
      if (!dialogue) return;

      const step = dialogue.steps[currentStep];
      const nextIdx = currentStep + 1;

      // add user message
      const userMsg: ChatMessage = {
        id: `user-${nextIdx}`,
        text: userText,
        isBot: false,
      };

      setMessages((prev) => [...prev, userMsg]);

      // step.next === null means this is the last step
      if (step.next === null) {
        // show result message
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const resultMsg: ChatMessage = {
            id: "result",
            text: `당신에게 어울리는 부적을 찾았어요! ✨\n\n「${dialogue.label} 부적」\n\n${dialogue.description}`,
            isBot: true,
          };
          setMessages((prev) => [...prev, resultMsg]);
          setChatDone(true);
        }, 1500);
        return;
      }

      // next step
      const nextStep = dialogue.steps[nextIdx];
      if (!nextStep) return;

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const opts: DialogueOption[] | undefined = nextStep.options?.map(
          (o) => ({ label: o, value: o })
        );
        const botMsg: ChatMessage = {
          id: `bot-${nextIdx}`,
          text: nextStep.question,
          isBot: true,
          options: opts,
        };
        setMessages((prev) => [...prev, botMsg]);
        setCurrentStep(nextIdx);
      }, 1200);
    },
    [dialogue, currentStep]
  );

  const handleOptionSelect = useCallback(
    (option: DialogueOption) => advanceChat(option.label),
    [advanceChat]
  );

  const handleFreeTextSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = userInput.trim();
      if (!text) return;
      setUserInput("");
      advanceChat(text);
    },
    [userInput, advanceChat]
  );

  /* 3. save to localStorage */
  const handleSave = useCallback(() => {
    if (!dialogue) return;
    const talisman = {
      id: `talisman-${Date.now()}`,
      name: talismanName,
      type: talismanType,
      style: talismanStyle,
      message: encouragement,
      bgColor,
      createdAt: new Date().toISOString(),
      svg: generateTalismanSVG({
        type: talismanType,
        style: talismanStyle,
        message: encouragement,
        bgColor: bgColor || undefined,
        title: talismanName,
        mantra: "",
      }),
    };

    const existing = JSON.parse(
      localStorage.getItem("bujeok-talismans") || "[]"
    );
    existing.push(talisman);
    localStorage.setItem("bujeok-talismans", JSON.stringify(existing));
    setSaved(true);
  }, [dialogue, talismanName, talismanType, talismanStyle, encouragement, bgColor]);

  /* 4. share / download */
  const handleDownload = useCallback(() => {
    const svg = generateTalismanSVG({
      type: talismanType,
      style: talismanStyle,
      message: encouragement,
      bgColor: bgColor || undefined,
      title: talismanName,
      mantra: "",
    });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${talismanName}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [talismanType, talismanStyle, encouragement, bgColor, talismanName]);

  const handleCopyLink = useCallback(() => {
    const text = `✨ 나만의 부적 「${talismanName}」을 만들었어요! 당신도 만들어보세요 🔮`;
    navigator.clipboard.writeText(text);
  }, [talismanName]);

  /* ══════════════════ RENDER ══════════════════ */

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white flex flex-col">
      {/* ─── Phase 1: Category ─── */}
      <AnimatePresence mode="wait">
        {phase === "category" && (
          <motion.div
            key="category"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center px-5 py-12"
          >
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-semibold text-center mb-2"
            >
              어떤 마음을 담아볼까요?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-white/40 mb-10"
            >
              만들고 싶은 부적의 종류를 골라주세요
            </motion.p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.3 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="relative flex flex-col items-center gap-2 p-5 rounded-2xl cursor-pointer
                    bg-white/[0.04] backdrop-blur-md
                    border border-white/[0.06]
                    hover:bg-white/[0.08] hover:border-white/[0.12]
                    transition-colors duration-200 group"
                >
                  {/* subtle color accent */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(ellipse at center, ${cat.color}10, transparent 70%)`,
                    }}
                  />
                  <span className="text-3xl relative z-10">{cat.icon}</span>
                  <span className="text-base font-medium relative z-10">
                    {cat.title}
                  </span>
                  <span className="text-xs text-white/40 relative z-10">
                    {cat.subtitle}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Phase 2: Chat ─── */}
        {phase === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col max-w-lg mx-auto w-full"
          >
            {/* header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <button
                onClick={() => {
                  setPhase("category");
                  setMessages([]);
                  setCurrentStep(0);
                  setChatDone(false);
                  setIsTyping(false);
                }}
                className="text-white/40 hover:text-white/70 transition-colors text-sm cursor-pointer"
              >
                ← 돌아가기
              </button>
              <div className="flex-1 text-center text-sm font-medium text-white/60">
                {dialogue?.category} 부적 상담
              </div>
              <div className="w-16" />
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, idx) => {
                const isLastBot =
                  msg.isBot &&
                  !chatDone &&
                  idx === messages.length - 1;
                return (
                  <ChatBubble
                    key={msg.id}
                    message={msg.text}
                    isBot={msg.isBot}
                    options={isLastBot ? msg.options : undefined}
                    onSelect={handleOptionSelect}
                  />
                );
              })}

              {/* typing indicator */}
              {isTyping && (
                <ChatBubble message="" isBot isTyping />
              )}

              {/* "부적 만들기" button */}
              {chatDone && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center pt-4"
                >
                  <button
                    onClick={() => setPhase("customize")}
                    className="px-8 py-3 rounded-full text-sm font-medium cursor-pointer
                      bg-gradient-to-r from-amber-500/80 to-amber-600/80
                      text-white shadow-lg shadow-amber-500/20
                      hover:from-amber-500 hover:to-amber-600
                      active:scale-95 transition-all duration-200"
                  >
                    부적 만들기 ✨
                  </button>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* free-text input */}
            {!chatDone && !isTyping && messages.length > 0 && (
              <form
                onSubmit={handleFreeTextSubmit}
                className="px-4 pb-4 pt-2 border-t border-white/[0.06]"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="직접 입력해도 좋아요..."
                    className="flex-1 px-4 py-2.5 rounded-full text-sm
                      bg-white/[0.06] border border-white/[0.08]
                      text-white placeholder-white/30
                      focus:outline-none focus:border-white/20
                      transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!userInput.trim()}
                    className="px-4 py-2.5 rounded-full text-sm cursor-pointer
                      bg-white/[0.08] text-white/70
                      hover:bg-white/[0.14] hover:text-white
                      disabled:opacity-30 disabled:cursor-not-allowed
                      transition-all"
                  >
                    전송
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* ─── Phase 3: Customize ─── */}
        {phase === "customize" && (
          <motion.div
            key="customize"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center px-5 py-8 max-w-lg mx-auto w-full"
          >
            <motion.h2
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold mb-1"
            >
              부적 꾸미기
            </motion.h2>
            <p className="text-xs text-white/40 mb-6">
              스타일과 문구를 선택해보세요
            </p>

            {/* preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <TalismanPreview
                type={talismanType}
                style={talismanStyle}
                message={encouragement}
                bgColor={bgColor || undefined}
                size="md"
              />
            </motion.div>

            {/* style toggle */}
            <div className="w-full space-y-5">
              <div>
                <label className="text-xs text-white/50 mb-2 block">
                  스타일
                </label>
                <div className="flex gap-2">
                  {(["traditional", "modern"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setTalismanStyle(s)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        talismanStyle === s
                          ? "bg-white/[0.12] border border-white/[0.2] text-white"
                          : "bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.08]"
                      }`}
                    >
                      {s === "traditional" ? "전통" : "현대"}
                    </button>
                  ))}
                </div>
              </div>

              {/* bg color */}
              <div>
                <label className="text-xs text-white/50 mb-2 block">
                  배경 색상
                </label>
                <div className="flex gap-2">
                  {BG_COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value || "default"}
                      onClick={() => setBgColor(opt.value)}
                      className={`flex-1 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                        bgColor === opt.value
                          ? "bg-white/[0.12] border border-white/[0.2] text-white"
                          : "bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.08]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* encouragement message */}
              <div>
                <label className="text-xs text-white/50 mb-2 block">
                  응원 문구
                </label>
                <input
                  type="text"
                  value={encouragement}
                  onChange={(e) => setEncouragement(e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-center
                    bg-white/[0.06] border border-white/[0.08]
                    text-white placeholder-white/30
                    focus:outline-none focus:border-white/20
                    transition-colors"
                />
                <p className="text-[10px] text-white/30 text-right mt-1">
                  {encouragement.length}/20
                </p>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPhase("reveal")}
              className="mt-8 w-full py-3.5 rounded-full text-sm font-semibold cursor-pointer
                bg-gradient-to-r from-amber-500 to-amber-600
                text-white shadow-lg shadow-amber-500/25
                hover:shadow-amber-500/40 transition-shadow duration-300"
            >
              부적 완성하기 ✨
            </motion.button>
          </motion.div>
        )}

        {/* ─── Phase 4: Reveal ─── */}
        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex-1 flex flex-col items-center justify-center px-5 py-8 relative overflow-hidden"
          >
            {/* golden particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: p.size,
                  height: p.size,
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  background:
                    "radial-gradient(circle, #ffd700, #ff8c00)",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0.5],
                  y: [0, -40, -80],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* glow backdrop */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255,215,0,0.06) 0%, transparent 60%)",
              }}
            />

            {/* talisman */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.4,
                duration: 0.8,
                type: "spring",
                damping: 15,
              }}
              className="relative z-10 mb-6"
            >
              <TalismanPreview
                type={talismanType}
                style={talismanStyle}
                message={encouragement}
                bgColor={bgColor || undefined}
                size="lg"
              />
            </motion.div>

            {/* name + description */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center relative z-10 mb-8"
            >
              <h2 className="text-xl font-semibold text-amber-200/90 mb-2">
                「{talismanName}」
              </h2>
              <p className="text-sm text-white/50 max-w-xs leading-relaxed">
                {dialogue?.description}
              </p>
            </motion.div>

            {/* action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col gap-3 w-full max-w-xs relative z-10"
            >
              <button
                onClick={handleSave}
                disabled={saved}
                className={`w-full py-3 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${
                  saved
                    ? "bg-green-500/20 border border-green-400/30 text-green-300"
                    : "bg-gradient-to-r from-amber-500/80 to-amber-600/80 text-white shadow-lg shadow-amber-500/20 hover:from-amber-500 hover:to-amber-600 active:scale-95"
                }`}
              >
                {saved ? "✓ 부적함에 담았어요" : "부적함에 담기"}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2.5 rounded-full text-xs font-medium cursor-pointer
                    bg-white/[0.06] border border-white/[0.08]
                    text-white/70 hover:bg-white/[0.12] hover:text-white
                    active:scale-95 transition-all duration-200"
                >
                  공유하기
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 rounded-full text-xs font-medium cursor-pointer
                    bg-white/[0.06] border border-white/[0.08]
                    text-white/70 hover:bg-white/[0.12] hover:text-white
                    active:scale-95 transition-all duration-200"
                >
                  선물하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

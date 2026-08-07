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
import { getAnimal } from "@/data/saju";
import { ENERGIES, getEnergyById, type Energy } from "@/data/energies";
import ChatBubble, { type DialogueOption } from "@/components/ChatBubble";
import TalismanPreview from "@/components/TalismanPreview";
import CrisisSupport from "@/components/CrisisSupport";
import HanjiBackground from "@/components/hanji/HanjiBackground";
import TraditionalHeader from "@/components/hanji/TraditionalHeader";
import TraditionalButton from "@/components/hanji/TraditionalButton";
import TalismanCategoryCard from "@/components/hanji/TalismanCategoryCard";
import {
  BackIcon,
  GearIcon,
  BrushStroke,
  BrushPen,
  FlameMotif,
  KnotMotif,
} from "@/components/hanji/motifs";
import { buildGiftUrl, GIFT_MESSAGE_MAX, GIFT_NAME_MAX } from "@/lib/gift";
import { generateTalismanSVG } from "@/lib/talisman-generator";
import { getTalismanAsset } from "@/data/talisman-assets";
import { detectCrisis, SAFETY_DISCLAIMER } from "@/lib/crisis-detection";
import {
  composeShareImage,
  shareOrDownload,
  type ShareFormat,
} from "@/lib/share-card";
import {
  pushTalismanToWidget,
  hasWidgetBridge,
  isWidgetInstalled,
  onWidgetStateChange,
} from "@/lib/widget-bridge";
import WidgetGuideSheet from "@/components/hanji/WidgetGuideSheet";
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
  [TalismanCategory.Love]: [
    "당신의 마음이 가장 소중해요",
    "좋은 인연은 먼 길을 돌아서도 만나집니다",
    "설레는 마음 그대로 전해지기를",
    "서로에게 다정한 날들이 이어지기를",
    "어떤 마음이든 충분히 아름답습니다",
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

/**
 * 위로 부적에 대응하는 43종 카탈로그 항목(정신안정부).
 * 위기 신호가 감지되면 키워드 기반 추천 대신 이 부적을 사용합니다.
 * (카탈로그가 바뀌어도 앱이 죽지 않도록 건강 계열 → 전체 순으로 폴백)
 */
const SUPPORTIVE_TALISMAN_TYPE: TalismanType =
  TALISMANS.find((t) => t.name === SUPPORTIVE_TALISMAN.name) ??
  TALISMANS.find((t) => t.category === TalismanCategory.Health) ??
  TALISMANS[0];

/** 부적을 간직하는 두 가지 모습 — 담긴 바람은 같고 표현만 다르다 */
const STYLE_OPTIONS = [
  {
    value: "traditional",
    label: "전통 부적",
    desc: "전통 문양과 상징을 담은 본래의 모습",
  },
  {
    value: "modern",
    label: "감성 부적",
    desc: "같은 바람을 일상에 어울리게 풀어낸 모습",
  },
] as const;

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

/** 3단계 진행 표시 — 시안의 미니멀 점 슬라이더 (●─○─○) */
function StepDots({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center gap-0 pb-3">
      {[1, 2, 3].map((n) => {
        const reached = n <= current;
        return (
          <div key={n} className="flex items-center">
            {n > 1 && (
              <span
                className="h-px w-7"
                style={{
                  backgroundColor: reached
                    ? "var(--color-juhong)"
                    : "rgba(122,74,52,0.3)",
                }}
              />
            )}
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={
                n === current
                  ? { backgroundColor: "var(--color-juhong)" }
                  : reached
                    ? {
                        backgroundColor: "rgba(167,43,33,0.4)",
                      }
                    : {
                        border: "1.5px solid rgba(122,74,52,0.4)",
                      }
              }
            />
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

  /** 홈 화면 위젯 안내 — 네이티브 앱에서 아직 위젯을 안 올린 경우만 */
  const [showWidgetGuide, setShowWidgetGuide] = useState(false);
  const [widgetMissing, setWidgetMissing] = useState(false);

  /* gift state — 부적 선물하기 (링크에 부적 데이터를 담아 전달) */
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftFrom, setGiftFrom] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [giftStatus, setGiftStatus] = useState<"shared" | "copied" | null>(
    null
  );

  /* ── 홈 화면 위젯 설치 여부 추적 (네이티브가 알려준다) ── */
  useEffect(() => {
    const sync = () =>
      setWidgetMissing(hasWidgetBridge() && isWidgetInstalled() === false);
    sync();
    return onWidgetStateChange(sync);
  }, []);

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
    symbols: recommended
      ? [...recommended.design.patterns, ...recommended.design.symbols]
      : undefined,
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
    setBackground(energy.paper); // 시안: 기운별 색지 기본 적용 (한지/남색/쑥/황금)
    setPhase("chat");
    setResponses({});
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
    if (id) {
      const energy = getEnergyById(id);
      if (energy) {
        autoStarted.current = true;
        handleEnergySelect(energy);
      }
      return;
    }

    /* 홈의 "오늘 당신에게 필요한 부적"에서 ?recommended= 로 진입한 경우
       해당 부적의 카테고리(마음)를 미리 골라 상담을 시작한다. */
    const recId = searchParams.get("recommended");
    if (!recId) return;
    const talisman = TALISMANS.find((t) => t.id === recId);
    if (!talisman) return;
    const energy = ENERGIES.find((e) => e.category === talisman.category);
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
        const rec = supportiveModeRef.current
          ? SUPPORTIVE_TALISMAN_TYPE
          : getTalismanRecommendation(dialogue.category, kws);
        setRecommended(rec);

        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const resultMsg: ChatMessage = {
            id: "result",
            text: supportiveModeRef.current
              ? `당신의 마음을 가만히 담아봤어요\n\n「${SUPPORTIVE_TALISMAN.name}」\n\n${SUPPORTIVE_TALISMAN.description}`
              : `당신에게 어울리는 부적을 찾았어요\n\n「${rec.name} (${rec.hanja})」\n\n${rec.description}`,
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

  /* 상담 초기화 후 카테고리로 */
  const resetToCategory = useCallback(() => {
    setPhase("category");
    setMessages([]);
    setCurrentStep(0);
    setChatDone(false);
    setIsTyping(false);
    setResponses({});
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

    // 추천 부적의 43종 상세 정보를 그대로 물려받고, 나만의 요소만 덧붙인다
    const talisman: SavedTalisman = {
      ...recommended,
      id: `custom-${Date.now()}`,
      savedAt: new Date().toISOString(),
      note: encouragement || undefined,
      svg: generateTalismanSVG(talismanParams),
    };

    // 네이티브 앱이면 홈 화면 위젯에도 반영 (웹에선 no-op)
    void pushTalismanToWidget(talisman.svg!, {
      name: talisman.name,
      hanja: talisman.hanja,
      note: talisman.note,
      savedAt: talisman.savedAt,
    });

    try {
      const existing: SavedTalisman[] = JSON.parse(
        localStorage.getItem("bujeok-collection") || "[]"
      );
      existing.unshift(talisman);
      localStorage.setItem("bujeok-collection", JSON.stringify(existing));
      setSaved(true);
      // 부적을 막 담은 순간 — 애착이 가장 높을 때 한 번만 안내한다
      if (hasWidgetBridge() && isWidgetInstalled() === false) {
        setTimeout(() => setShowWidgetGuide(true), 700);
      }
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
          `나만의 부적 「${talismanName}」을 만들었어요`
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

  /* 5. 부적 선물 링크 — 정적 사이트라 선물 데이터를 URL 자체에 담는다 */
  const openGiftSheet = useCallback(() => {
    setGiftFrom((prev) => prev || userCtx.name);
    setGiftStatus(null);
    setGiftOpen(true);
  }, [userCtx.name]);

  const handleGiftLink = useCallback(async () => {
    if (!recommended) return;
    const url = buildGiftUrl({
      v: 1,
      t: recommended.id,
      m: giftMessage.trim().slice(0, GIFT_MESSAGE_MAX),
      f: giftFrom.trim().slice(0, GIFT_NAME_MAX),
      c: new Date().toISOString(),
    });
    const text = `${giftFrom.trim() || "누군가"}님이 보낸 부적 「${recommended.name}」이 도착했어요`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "부적 선물", text, url });
        setGiftStatus("shared");
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        // 공유 시트 실패 → 클립보드 복사로 폴백
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setGiftStatus("copied");
    } catch {
      // 클립보드도 막힌 환경 — 직접 복사할 수 있게 보여준다
      window.prompt("링크를 길게 눌러 복사하세요", url);
    }
  }, [recommended, giftFrom, giftMessage]);

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
            onClick={() => alert("설정은 준비 중이에요")}
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

            {/* 부적 미리보기 — 시안: 불꽃 배경 + 붓 장식 */}
            <div className="relative mb-2 flex justify-center">
              <FlameMotif
                size={90}
                className="pointer-events-none absolute -left-1 bottom-2 text-[var(--color-juhong)] opacity-[0.14]"
              />
              <FlameMotif
                size={56}
                className="pointer-events-none absolute right-2 top-4 text-[var(--color-hwang)] opacity-[0.14]"
              />
              <TalismanPreview
                type={talismanType}
                style={talismanStyle}
                message={encouragement}
                background={background}
                accent={accent}
                animal={animalChoice || undefined}
                symbols={
                  recommended
                    ? [...recommended.design.patterns, ...recommended.design.symbols]
                    : undefined
                }
                userName={userCtx.name || undefined}
                title={talismanName}
                hanja={recommended?.hanja}
                mantra={recommended?.mantra}
                size="md"
              />
              <BrushPen
                size={120}
                className="pointer-events-none absolute -right-1 bottom-0 rotate-[24deg] drop-shadow-sm"
              />
            </div>
            <div className="mb-5 flex justify-center text-[var(--color-meok)] opacity-60">
              <BrushStroke width={100} />
            </div>

            {/* 같은 마음, 다른 모습 — 전통 부적 / 감성 부적 */}
            <div className="mb-6">
              <p className="text-center font-brush text-[13px] text-[var(--color-galsaek)]">
                같은 마음, 다른 모습
              </p>
              <h3 className="mt-1 text-center font-serif-kr text-[16px] font-bold text-[var(--color-meok)]">
                어떤 모습으로 간직할까요?
              </h3>
              <p className="mb-3.5 mt-2 text-center text-[11px] leading-relaxed text-[var(--color-galsaek)] opacity-85">
                전통 부적과 감성 부적은 담고 있는 바람은 같아요.
                <br />
                전통의 모습 그대로 간직하거나, 일상에
                <br />
                자연스럽게 어울리는 모습으로 간직해 보세요.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {STYLE_OPTIONS.map(({ value, label, desc }) => {
                  const active = talismanStyle === value;
                  return (
                    <motion.button
                      key={value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setTalismanStyle(value)}
                      className="hanji-card relative rounded-xl px-3 pb-3.5 pt-4 text-center transition-colors"
                      style={{
                        borderColor: active
                          ? "var(--color-juhong)"
                          : "rgba(122,74,52,0.35)",
                        backgroundColor: active
                          ? "rgba(167,43,33,0.06)"
                          : undefined,
                      }}
                    >
                      <span
                        className="pointer-events-none absolute inset-[4px] rounded-lg"
                        style={{
                          border: active
                            ? "1px solid rgba(167,43,33,0.28)"
                            : "1px solid rgba(122,74,52,0.14)",
                        }}
                      />
                      <span
                        className={`block font-serif-kr text-[15px] font-bold ${
                          active
                            ? "text-[var(--color-juhong)]"
                            : "text-[var(--color-meok)]"
                        }`}
                      >
                        {label}
                      </span>
                      <span className="mt-1.5 block text-[11px] leading-relaxed text-[var(--color-galsaek)] opacity-80">
                        {desc}
                      </span>
                    </motion.button>
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
                symbols={
                  recommended
                    ? [...recommended.design.patterns, ...recommended.design.symbols]
                    : undefined
                }
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
                widgetMissing ? (
                  <TraditionalButton onClick={() => setShowWidgetGuide(true)}>
                    홈 화면에 지니기
                  </TraditionalButton>
                ) : (
                  <div
                    className="w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]"
                    style={{ border: "1px solid rgba(107,125,99,0.5)" }}
                  >
                    ✓ 부적함에 담았습니다
                  </div>
                )
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

              {/* 부적 선물하기 — 부적은 원래 남에게 건네는 것 */}
              {recommended && (
                <button
                  onClick={openGiftSheet}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full py-3 font-serif-kr text-sm font-bold text-[var(--color-juhong)] transition-all active:scale-95"
                  style={{
                    border: "1.5px solid var(--color-juhong)",
                    backgroundColor: "rgba(246,237,217,0.7)",
                  }}
                >
                  <KnotMotif size={18} />
                  소중한 사람에게 선물하기
                </button>
              )}

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

      {/* ─── 부적 선물하기 시트 ─── */}
      <AnimatePresence>
        {giftOpen && (
          <motion.div
            key="gift-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ backgroundColor: "rgba(43,24,16,0.45)" }}
            onClick={() => setGiftOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-2xl px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5"
              style={{
                backgroundColor: "#F6EDD9",
                borderTop: "1px solid rgba(122,74,52,0.3)",
                boxShadow: "0 -8px 30px rgba(43,24,16,0.25)",
              }}
            >
              <div className="mb-3 flex items-center justify-center gap-2">
                <KnotMotif size={22} className="text-[var(--color-juhong)]" />
                <h3 className="font-serif-kr text-base font-bold text-[var(--color-meok)]">
                  부적 선물하기
                </h3>
              </div>
              <p className="mb-4 text-center text-xs leading-relaxed text-[var(--color-galsaek)]">
                부적은 원래 소중한 사람에게 건네는 것.
                <br />
                「{talismanName}」을 마음과 함께 보내보세요.
              </p>

              <label className="mb-1 block text-xs font-bold text-[var(--color-galsaek)]">
                보내는 사람
              </label>
              <input
                type="text"
                value={giftFrom}
                onChange={(e) => setGiftFrom(e.target.value)}
                maxLength={GIFT_NAME_MAX}
                placeholder="이름 또는 별명"
                className="mb-3 w-full rounded-lg px-4 py-2.5 text-sm text-[var(--color-meok)] placeholder-[var(--color-galsaek)]/40 focus:outline-none"
                style={{
                  border: "1px solid rgba(122,74,52,0.4)",
                  backgroundColor: "rgba(255,251,240,0.9)",
                }}
              />

              <label className="mb-1 block text-xs font-bold text-[var(--color-galsaek)]">
                전하고 싶은 말
              </label>
              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                maxLength={GIFT_MESSAGE_MAX}
                rows={2}
                placeholder="응원의 마음을 한 줄에 담아주세요"
                className="w-full resize-none rounded-lg px-4 py-2.5 font-serif-kr text-sm text-[var(--color-meok)] placeholder-[var(--color-galsaek)]/40 focus:outline-none"
                style={{
                  border: "1px solid rgba(122,74,52,0.4)",
                  backgroundColor: "rgba(255,251,240,0.9)",
                }}
              />
              <p className="mb-3 text-right text-[10px] text-[var(--color-galsaek)] opacity-60">
                {giftMessage.length}/{GIFT_MESSAGE_MAX}
              </p>

              {/* 미리보기 한 줄 */}
              <p className="mb-4 rounded-lg px-3 py-2 text-center text-[11px] leading-relaxed text-[var(--color-galsaek)]"
                style={{ border: "1px dashed rgba(122,74,52,0.35)" }}
              >
                {giftFrom.trim() || "누군가"}님이 보낸 부적 「{talismanName}」이
                도착했어요
              </p>

              {giftStatus && (
                <p className="mb-3 text-center text-xs font-bold text-[var(--color-ssuk)]">
                  {giftStatus === "shared"
                    ? "✓ 선물 링크를 보냈어요"
                    : "✓ 링크를 복사했어요! 카톡이나 문자로 보내보세요"}
                </p>
              )}

              <TraditionalButton onClick={handleGiftLink}>
                선물 링크 만들기
              </TraditionalButton>
              <button
                onClick={() => setGiftOpen(false)}
                className="mt-3 w-full text-center text-xs text-[var(--color-galsaek)] underline underline-offset-2 opacity-70"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 위기 신호 감지 시 전문 도움 안내 ─── */}
      {/* ─── 홈 화면 위젯 추가 안내 (부적 완성 직후) ─── */}
      <AnimatePresence>
        {showWidgetGuide && (
          <WidgetGuideSheet onClose={() => setShowWidgetGuide(false)} />
        )}
      </AnimatePresence>

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

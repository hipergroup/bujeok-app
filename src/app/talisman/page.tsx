"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  DIALOGUE_FLOWS,
  extractKeywords,
  pickQuestion,
  getOptionReaction,
  getFreeTextReaction,
  getGreeting,
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
import CrisisSupport from "@/components/CrisisSupport";
import HanjiBackground from "@/components/hanji/HanjiBackground";
import TraditionalHeader from "@/components/hanji/TraditionalHeader";
import TraditionalButton from "@/components/hanji/TraditionalButton";
import TalismanCategoryCard from "@/components/hanji/TalismanCategoryCard";
import { BackIcon, GearIcon, KnotMotif } from "@/components/hanji/motifs";
import { buildGiftUrl, GIFT_MESSAGE_MAX, GIFT_NAME_MAX } from "@/lib/gift";
import { generateTalismanSVG } from "@/lib/talisman-generator";
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
import {
  createPersonalTalisman,
  saveToCollection,
  markPlacedOnHome,
  buildPersonalSVG,
} from "@/lib/personal-talisman";
import { WISH_SUGGESTIONS, ORIGIN_CONCEPT_LINES } from "@/data/talisman-origin";
import PersonalTalismanView, { NameStamp } from "@/components/PersonalTalismanView";
import CraftingRitual from "@/components/CraftingRitual";

/* ───────── types ───────── */

type ChatMessage = {
  id: string;
  text: string;
  isBot: boolean;
  options?: DialogueOption[];
};

/* 사주·고민 확인(chat) → 염원 적기(wish) → 짓는 연출(crafting) → 완성(reveal) */
type Phase = "category" | "chat" | "wish" | "crafting" | "reveal";

/* ───────── constants ───────── */

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

/** 2단계 진행 표시 — 시안의 미니멀 점 슬라이더 (●─○) */
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

  /* ── 봇 말풍선 시퀀서 ──
     여러 말풍선을 실제 대화처럼 "타이핑 → 잠깐 쉼 → 다음 말"의
     리듬으로 차례차례 띄운다. 타이핑 시간은 글 길이에 비례. */
  const botTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** 봇이 말하는 중에는 사용자 입력을 받지 않는다 (대화 꼬임 방지) */
  const botBusyRef = useRef(false);
  const clearBotTimers = useCallback(() => {
    botTimersRef.current.forEach(clearTimeout);
    botTimersRef.current = [];
    botBusyRef.current = false;
  }, []);
  useEffect(() => clearBotTimers, [clearBotTimers]);

  const queueBot = useCallback(
    (
      items: { id: string; text: string; options?: DialogueOption[] }[],
      after?: () => void
    ) => {
      botBusyRef.current = true;
      let t = 350; // 첫 타이핑 시작까지 잠깐 숨 고르기
      items.forEach((item, i) => {
        const typingMs = Math.min(600 + item.text.length * 26, 2400);
        if (i === 0) {
          botTimersRef.current.push(
            setTimeout(() => setIsTyping(true), t)
          );
        }
        t += typingMs;
        const isLast = i === items.length - 1;
        botTimersRef.current.push(
          setTimeout(() => {
            setMessages((prev) => [...prev, { ...item, isBot: true }]);
            if (isLast) setIsTyping(false);
          }, t)
        );
        if (!isLast) t += 500; // 말풍선 사이의 쉼
      });
      botTimersRef.current.push(
        setTimeout(() => {
          botBusyRef.current = false;
          after?.();
        }, t + 50)
      );
    },
    []
  );

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

  /* 부적 모습 — 꾸미기 단계를 없애면서 전통 부적으로 고정 */
  const talismanStyle = "traditional" as const;
  const [background, setBackground] = useState("hwangji");
  const [animalChoice, setAnimalChoice] = useState("");
  const [encouragement, setEncouragement] = useState("");
  const [userCtx, setUserCtx] = useState({ name: "", animal: "" });

  /* 염원 적기 + 개인 부적 */
  const [wishText, setWishText] = useState("");
  const [personalResult, setPersonalResult] = useState<SavedTalisman | null>(null);
  const [placed, setPlaced] = useState(false);

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

  /* ──────── phase handlers ──────── */

  /* 상담이 끝나면 염원 적기로 — 부적에 담을 마음을 직접 적는다 */
  const goToWish = useCallback(() => {
    setPhase("wish");
  }, []);

  /** 홈의 사주 추천으로 들어온 경우, 그 추천 이유를 그대로 쓴다 (오늘 캐시) */
  const sajuReasonFor = useCallback((talismanId: string): string | null => {
    try {
      const raw = localStorage.getItem("bujeok-today-fortune");
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (
        cached?.fortune?.talismanId === talismanId &&
        typeof cached.fortune.talismanReason === "string"
      ) {
        return cached.fortune.talismanReason;
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  /* 염원을 담아 부적 짓기 — 개인 부적 기록을 만들고 짓는 연출로 */
  const startCrafting = useCallback(() => {
    const rec = recommended;
    if (!rec || !wishText.trim()) return;
    const reason = supportiveMode
      ? "나눠주신 마음이 무거워 보여, 마음을 다독이는 부적을 먼저 권해드렸어요."
      : sajuReasonFor(rec.id) ??
        `「${selectedEnergy?.title ?? "마음"}」 이야기를 나눈 끝에, 지금의 마음에 가장 맞닿은 부적으로 골랐어요.`;
    setPersonalResult(
      createPersonalTalisman({
        talisman: rec,
        ownerName: userCtx.name,
        wishText: wishText.trim(),
        recommendationReason: reason,
      })
    );
    setSaved(false);
    setPlaced(false);
    setPhase("crafting");
  }, [recommended, wishText, supportiveMode, selectedEnergy, userCtx.name, sajuReasonFor]);

  /* 1. energy(마음) 선택 → chat */
  const handleEnergySelect = useCallback(
    (energy: Energy) => {
      setSelectedEnergy(energy);
      setBackground(energy.paper); // 시안: 기운별 색지 기본 적용 (한지/남색/쑥/황금)
      setPhase("chat");
      setResponses({});
      setRecommended(null);
      const flow = DIALOGUE_FLOWS.find((f) => f.category === energy.category);
      if (!flow) return;
      const firstStep = flow.steps[0];

      clearBotTimers();
      setMessages([]);
      const { name } = loadUserContext();
      const opts: DialogueOption[] | undefined = firstStep.options?.map(
        (o) => ({ label: o, value: o })
      );
      /* 인사 → 첫 질문, 두 말풍선으로 나눠서 */
      queueBot(
        [
          { id: "greet-0", text: getGreeting(energy.category, name) },
          { id: "bot-0", text: pickQuestion(firstStep), options: opts },
        ],
        () => setCurrentStep(0)
      );
    },
    [queueBot, clearBotTimers]
  );

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
      if (botBusyRef.current) return; // 봇이 말하는 중이면 무시

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

      /* 답변에 대한 공감 한마디 — 선택지면 준비된 리액션,
         직접 입력이면 감정을 읽고 맞춤 반응 */
      const wasOption = !!step.options?.includes(userText);
      const reaction = wasOption
        ? getOptionReaction(step, userText)
        : getFreeTextReaction(userText);

      // step.next === null means this is the last step
      if (step.next === null) {
        // 대화 응답 → 키워드 → 47종 중 맞춤 부적 추천
        const kws = extractKeywords(dialogue, newResponses);
        const rec = supportiveModeRef.current
          ? SUPPORTIVE_TALISMAN_TYPE
          : getTalismanRecommendation(dialogue.category, kws);
        setRecommended(rec);

        const { name } = loadUserContext();
        const who = name ? `${name}님` : "당신";
        const seq: { id: string; text: string }[] = [];
        if (reaction) seq.push({ id: `react-${nextIdx}`, text: reaction });
        if (supportiveModeRef.current) {
          seq.push({
            id: "result-intro",
            text: `이야기 나눠보니, 오늘 ${who}께 꼭 필요한 부적이 떠올랐어요.`,
          });
          seq.push({
            id: "result",
            text: `「${SUPPORTIVE_TALISMAN.name}」\n\n${SUPPORTIVE_TALISMAN.description}`,
          });
        } else {
          seq.push({
            id: "result-intro",
            text: `이야기 나눠보니 ${who}의 마음이 어디를 향하는지 알 것 같아요. 딱 맞는 부적이 있어요.`,
          });
          seq.push({
            id: "result",
            text: `「${rec.name} (${rec.hanja})」\n\n${rec.description}`,
          });
        }
        queueBot(seq, () => setChatDone(true));
        return;
      }

      const nextStep = dialogue.steps[nextIdx];
      if (!nextStep) return;

      const opts: DialogueOption[] | undefined = nextStep.options?.map(
        (o) => ({ label: o, value: o })
      );
      const seq: { id: string; text: string; options?: DialogueOption[] }[] =
        [];
      if (reaction) seq.push({ id: `react-${nextIdx}`, text: reaction });
      seq.push({
        id: `bot-${nextIdx}`,
        text: pickQuestion(nextStep),
        options: opts,
      });
      queueBot(seq, () => setCurrentStep(nextIdx));
    },
    [dialogue, currentStep, responses, queueBot]
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
    clearBotTimers();
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
    setWishText("");
    setPersonalResult(null);
    setPlaced(false);
  }, [clearBotTimers]);

  /* 3. 내 수호부에 간직하기 — 개인 부적 기록만 저장한다 (이미지 복사 없음) */
  const handleSave = useCallback(() => {
    if (!personalResult) return;
    if (saveToCollection(personalResult)) setSaved(true);
  }, [personalResult]);

  /* 3-1. 홈 화면에 모시기 — 대표 부적으로 지정하고 위젯에도 보낸다 */
  const handlePlaceHome = useCallback(async () => {
    if (!personalResult) return;
    if (saveToCollection(personalResult)) setSaved(true);
    markPlacedOnHome(personalResult.id);
    setPlaced(true);
    // 네이티브 앱이면 홈 화면 위젯에도 반영 (웹에선 no-op)
    void pushTalismanToWidget(buildPersonalSVG(personalResult), {
      name: personalResult.name,
      hanja: personalResult.hanja,
      note: personalResult.personal?.wishText,
      savedAt: personalResult.savedAt,
    });
    if (widgetMissing) {
      setTimeout(() => setShowWidgetGuide(true), 500);
    }
  }, [personalResult, widgetMissing]);

  /* 4. 공유 — 원본/스토리(9:16)/정사각(1:1) */
  const handleShare = useCallback(
    async (format: ShareFormat) => {
      // 인장까지 얹은 개인 부적으로 합성 — 화면과 같은 모습
      const svg = personalResult
        ? buildPersonalSVG(personalResult)
        : generateTalismanSVG(talismanParams);
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
    [talismanName, recommended, personalResult, talismanStyle, background, animalChoice, encouragement, userCtx, accent]
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
    phase === "crafting" || phase === "reveal" ? 3 : phase === "wish" ? 2 : 1;

  /* ══════════════════ RENDER ══════════════════ */

  return (
    <HanjiBackground>
      <TraditionalHeader
        left={
          <button
            onClick={() => {
              if (phase === "category") router.push("/");
              else if (phase === "chat") resetToCategory();
              else if (phase === "wish") setPhase("chat");
              else if (phase === "reveal") {
                // 완성본을 물리고 염원부터 다시 — 새 기록(새 번호)이 된다
                setPersonalResult(null);
                setSaved(false);
                setPlaced(false);
                setPhase("wish");
              }
              /* crafting 중에는 돌아가지 않는다 — 짧은 의식이 끝나길 기다린다 */
            }}
            aria-label="뒤로가기"
          >
            <BackIcon size={20} />
          </button>
        }
        title="나만의 부적 짓기"
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
            <p className="mb-5 text-center text-xs text-[var(--color-galsaek)]">
              마음의 방향을 고르면 짧은 대화 후 부적을 지어드려요.
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

            {/* 특별한 부적 — 연락기원부 (전용 의식 화면) */}
            <button
              onClick={() => router.push("/yeollak")}
              className="mt-5 w-full rounded-xl px-5 py-4 text-left transition active:scale-[0.99]"
              style={{
                border: "1.5px solid rgba(167,43,33,0.4)",
                background: "rgba(255,251,240,0.8)",
              }}
            >
              <p className="font-serif-kr text-[14px] font-bold text-[var(--color-juhong)]">
                🪶 연락기원부 <span className="text-[11px] font-normal opacity-70">雁書符</span>
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--color-galsaek)]">
                기러기가 기다리던 소식을 전해오는 부적.
                <br />
                두 기러기 사이의 마지막 한 획을 직접 이어 완성해요 →
              </p>
            </button>

            {/* 서비스의 마음 — 원형 부적 위에 한 사람의 염원을 담는다 */}
            <p
              className="mt-8 whitespace-pre-line text-center font-serif-kr text-[11.5px] leading-[1.9] text-[var(--color-galsaek)] opacity-80"
            >
              {ORIGIN_CONCEPT_LINES.main}
            </p>
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
                    <TraditionalButton onClick={goToWish}>
                      내 부적 청하기
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

        {/* ─── Phase 3: 염원 적기 ─── */}
        {phase === "wish" && (
          <motion.div
            key="wish"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16"
          >
            <h2 className="font-brush mb-2 mt-2 text-center text-[21px] leading-snug text-[var(--color-meok)]">
              이 부적에 어떤 마음을
              <br />
              담고 싶으신가요?
            </h2>
            <p className="mb-5 text-center text-xs leading-relaxed text-[var(--color-galsaek)]">
              지금 가장 간절히 바라는 마음을 짧게 적어주세요.
              <br />
              적어주신 염원은 당신의 부적과 함께 간직됩니다.
            </p>

            {/* 어느 부적에 담기는지 */}
            {recommended && (
              <p
                className="mx-auto mb-4 rounded-full px-4 py-1.5 text-center text-[11px] font-bold text-[var(--color-juhong)]"
                style={{
                  border: "1px solid rgba(167,43,33,0.3)",
                  backgroundColor: "rgba(246,237,217,0.7)",
                }}
              >
                {recommended.name} {recommended.hanja}
              </p>
            )}
            {talismanDescription && (
              <p className="mx-auto mb-4 max-w-xs whitespace-pre-line text-center text-[11px] leading-relaxed text-[var(--color-galsaek)] opacity-80">
                {talismanDescription}
              </p>
            )}

            <textarea
              value={wishText}
              onChange={(e) => setWishText(e.target.value.slice(0, 50))}
              maxLength={50}
              rows={3}
              placeholder="예) 올해는 마음먹은 일들이 잘 풀리기를 바라요."
              className="w-full resize-none rounded-xl px-4 py-3.5 font-serif-kr text-[15px] leading-relaxed text-[var(--color-meok)] placeholder-[var(--color-galsaek)]/40 focus:outline-none"
              style={{
                border: "1.5px solid rgba(122,74,52,0.4)",
                backgroundColor: "rgba(255,251,240,0.9)",
              }}
            />
            <p className="mt-1.5 text-right text-[11px] text-[var(--color-galsaek)] opacity-60">
              {wishText.length}/50
            </p>

            {/* 추천 염원 — 누르면 입력창에 담기고, 고쳐 쓸 수 있다 */}
            {selectedCategory && (
              <div className="mt-3">
                <p className="mb-2 text-[11px] font-bold text-[var(--color-galsaek)]">
                  이런 염원은 어떠세요?
                </p>
                <div className="flex flex-col gap-2">
                  {(WISH_SUGGESTIONS[selectedCategory] ?? []).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWishText(w)}
                      className="rounded-lg px-3.5 py-2.5 text-left font-serif-kr text-[12.5px] leading-relaxed text-[var(--color-meok)] transition-colors active:scale-[0.99]"
                      style={{
                        border:
                          wishText === w
                            ? "1.5px solid var(--color-juhong)"
                            : "1px solid rgba(122,74,52,0.3)",
                        backgroundColor:
                          wishText === w
                            ? "rgba(167,43,33,0.06)"
                            : "rgba(246,237,217,0.6)",
                      }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7">
              <TraditionalButton onClick={startCrafting} disabled={!wishText.trim()}>
                염원을 담아 부적 짓기
              </TraditionalButton>
            </div>

            <p className="mt-6 whitespace-pre-line text-center text-[10.5px] leading-[1.9] text-[var(--color-galsaek)] opacity-70">
              {ORIGIN_CONCEPT_LINES.sub}
            </p>
          </motion.div>
        )}

        {/* ─── Phase 3.5: 부적을 짓는 연출 ─── */}
        {phase === "crafting" && personalResult && (
          <motion.div
            key="crafting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pb-16"
          >
            <CraftingRitual
              talisman={personalResult}
              onDone={() => setPhase("reveal")}
            />
          </motion.div>
        )}

        {/* ─── Phase 4: 개인 부적 완성 ─── */}
        {phase === "reveal" && personalResult && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pb-16"
          >
            {/* 완성된 개인 부적 — 원형 이미지 + 이름 인장 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", damping: 20 }}
              className="mb-5 overflow-hidden rounded-xl"
              style={{ boxShadow: "0 10px 30px rgba(43,24,16,0.25)", width: "min(64vw, 250px)" }}
            >
              <PersonalTalismanView talisman={personalResult} width="100%" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-5 text-center"
            >
              <h2 className="font-serif-kr text-lg font-bold leading-relaxed text-[var(--color-meok)]">
                {personalResult.personal?.ownerName
                  ? `${personalResult.personal.ownerName}님의 염원을 담은`
                  : "당신의 염원을 담은"}
                <br />한 장의 수호부가 완성되었습니다.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-galsaek)]">
                이 부적은 지금 품고 있는 마음을 잊지 않도록
                <br />
                당신의 곁에서 함께합니다.
              </p>
            </motion.div>

            {/* 개인 부적 기록 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 w-full max-w-xs rounded-xl px-4 py-4"
              style={{
                border: "1px solid rgba(122,74,52,0.3)",
                backgroundColor: "rgba(255,251,240,0.75)",
              }}
            >
              {(
                [
                  ["부적명", `${personalResult.name} ${personalResult.hanja}`],
                  ["담은 염원", personalResult.personal?.wishText ?? ""],
                  ["추천 이유", personalResult.personal?.recommendationReason ?? ""],
                  [
                    "지은 날",
                    new Date(personalResult.savedAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  ],
                  ["부적 번호", personalResult.personal?.serialNumber ?? ""],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex items-start gap-3 py-1.5">
                  <span className="w-14 shrink-0 pt-px text-[11px] font-bold text-[var(--color-galsaek)]">
                    {label}
                  </span>
                  <span className="min-w-0 flex-1 font-serif-kr text-[12.5px] leading-relaxed text-[var(--color-meok)]">
                    {value}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-3 py-1.5">
                <span className="w-14 shrink-0 text-[11px] font-bold text-[var(--color-galsaek)]">
                  이름 인장
                </span>
                <span className="flex items-center gap-2">
                  <NameStamp
                    text={personalResult.personal?.stampText ?? "수호부"}
                    side={30}
                    rotation={personalResult.personal?.stampRotation ?? 0}
                  />
                  <span className="font-serif-kr text-[12.5px] text-[var(--color-meok)]">
                    {personalResult.personal?.ownerName || "수호부"}
                  </span>
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex w-full max-w-xs flex-col gap-3"
            >
              {saved ? (
                <div
                  className="w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]"
                  style={{ border: "1px solid rgba(107,125,99,0.5)" }}
                >
                  ✓ 내 수호부에 간직했습니다
                </div>
              ) : (
                <TraditionalButton onClick={handleSave}>
                  내 수호부에 간직하기
                </TraditionalButton>
              )}

              <button
                onClick={handlePlaceHome}
                disabled={placed}
                className="w-full rounded-lg py-3 font-serif-kr text-sm font-bold transition-all active:scale-[0.99]"
                style={{
                  color: placed ? "var(--color-ssuk)" : "var(--color-juhong)",
                  border: placed
                    ? "1px solid rgba(107,125,99,0.5)"
                    : "1.5px solid var(--color-juhong)",
                  backgroundColor: "rgba(246,237,217,0.7)",
                }}
              >
                {placed ? "✓ 홈 화면에 모셨습니다" : "홈 화면에 모시기"}
              </button>

              {/* 부적 이야기 나누기 — 인장까지 담긴 모습 그대로 */}
              <p className="mt-1 text-center text-[11px] font-bold text-[var(--color-galsaek)]">
                부적 이야기 나누기
              </p>
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
                새 부적 짓기
              </button>
            </motion.div>

            {/* 안내 + 안전 고지 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="mt-8 w-full max-w-xs"
            >
              <p className="text-center text-[10px] leading-[1.7] text-[var(--color-galsaek)] opacity-60">
                {ORIGIN_CONCEPT_LINES.notice}
              </p>
              <p className="mt-3 whitespace-pre-line text-center text-[10px] leading-[1.7] text-[var(--color-galsaek)] opacity-60">
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

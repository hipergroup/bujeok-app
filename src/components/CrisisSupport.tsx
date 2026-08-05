"use client";

// ============================================================
// CrisisSupport — 전문 도움 연결 안내
// ------------------------------------------------------------
// 톤 가이드
//  · 놀라게 하지 않기 (빨강/경고 아이콘 금지, 부드러운 블루 + 따뜻한 뉴트럴)
//  · 진단하지 않기, 판단하지 않기
//  · 선택권은 언제나 사용자에게 (닫고 계속할 수 있음)
//  · 전화번호는 크게, tel: 링크로 바로 연결
//
// ⚠️ 이 컴포넌트는 사용자가 입력한 텍스트를 받지도, 표시하지도 않습니다.
// ============================================================

import { motion, AnimatePresence } from "framer-motion";
import { PhoneMotif } from "./hanji/motifs";
import { useEffect } from "react";
import { CRISIS_HOTLINES, telHref, type Hotline } from "@/lib/crisis-detection";

export interface CrisisSupportProps {
  level: "concern" | "high";
  /** 모달만 닫기 */
  onClose: () => void;
  /** 부적 흐름을 계속 진행 */
  onContinue: () => void;
}

/* ───────── 레벨별 문구 ───────── */

const HIGH_LINES = [
  "지금 많이 힘드신 것 같아요.",
  "그 마음, 혼자 감당하지 않으셔도 됩니다.",
  "",
  "24시간 언제든 이야기를 들어줄 사람들이 있어요.",
];

const CONCERN_LINES = [
  "마음이 무거우신 것 같아요.",
  "누군가와 이야기를 나누는 것만으로도",
  "조금 나아질 수 있어요.",
];

const HIGH_HOTLINES: Hotline[] = CRISIS_HOTLINES; // 109 · 1577-0199 · 1388
const CONCERN_HOTLINES: Hotline[] = [
  CRISIS_HOTLINES[1], // 정신건강위기상담전화 1577-0199
  CRISIS_HOTLINES[0], // 자살예방상담전화 109
];

/* ───────── 전화 버튼 ───────── */

function HotlineButton({ hotline, delay }: { hotline: Hotline; delay: number }) {
  return (
    <motion.a
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      href={telHref(hotline.number)}
      className="flex items-center gap-3 w-full rounded-2xl px-4 py-3.5
        bg-[#eef4fa] border border-[#c9dcec]
        text-[#22384d] shadow-sm
        hover:bg-[#e2edf7] hover:border-[#a9c8e0]
        active:scale-[0.98] transition-all duration-200"
    >
      <span aria-hidden="true"><PhoneMotif size={20} /></span>
      <span className="flex flex-col items-start min-w-0 flex-1">
        <span className="text-[13px] text-[#4d677f] leading-tight">
          {hotline.name}
        </span>
        <span className="text-[11px] text-[#7b93a8] leading-tight mt-0.5">
          {hotline.desc}
        </span>
      </span>
      <span className="text-lg font-semibold tracking-tight tabular-nums">
        {hotline.number}
      </span>
    </motion.a>
  );
}

/* ───────── 본체 ───────── */

export default function CrisisSupport({
  level,
  onClose,
  onContinue,
}: CrisisSupportProps) {
  const isHigh = level === "high";
  const hotlines = isHigh ? HIGH_HOTLINES : CONCERN_HOTLINES;
  const lines = isHigh ? HIGH_LINES : CONCERN_LINES;

  /* 배경 스크롤 잠금 + ESC 로 닫기 */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="crisis-support"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crisis-support-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6
          bg-[#132433]/80 backdrop-blur-md overscroll-contain"
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md max-h-full overflow-y-auto
            rounded-3xl px-6 py-7
            bg-[#fbf8f4] border border-[#e6ded3]
            shadow-[0_20px_60px_-20px_rgba(19,36,51,0.55)]"
        >
          {/* 부드러운 상징 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center
              rounded-full bg-[#e8f1f8] border border-[#d3e4f0] text-2xl"
            aria-hidden="true"
          >
            {isHigh ? "🌤️" : "🌿"}
          </motion.div>

          {/* 제목 */}
          <h2
            id="crisis-support-title"
            className="text-center text-[19px] font-semibold text-[#2b3d4e] leading-snug"
          >
            {isHigh ? "잠시 멈춰서, 이야기를 나눠요" : "괜찮으신가요?"}
          </h2>

          {/* 본문 */}
          <div className="mt-4 text-center text-[14px] leading-[1.85] text-[#5a6b7a]">
            {lines.map((line, i) =>
              line === "" ? (
                <div key={`sp-${i}`} className="h-3" />
              ) : (
                <p key={line}>{line}</p>
              )
            )}
          </div>

          {/* 전화 버튼들 */}
          <div className="mt-6 flex flex-col gap-2.5">
            {hotlines.map((h, i) => (
              <HotlineButton key={h.number} hotline={h} delay={0.25 + i * 0.08} />
            ))}
          </div>

          {/* 하단 문구 */}
          <div className="mt-6 rounded-2xl bg-[#f3efe8] border border-[#e8e0d4] px-4 py-3.5">
            <p className="text-center text-[12.5px] leading-[1.8] text-[#77685a] whitespace-pre-line">
              {isHigh
                ? "당신은 소중한 사람입니다.\n지금 이 순간에도, 당신을 걱정하는 사람이 있어요."
                : "부적은 마음을 위로하는 도구일 뿐,\n전문적인 도움을 대신할 수 없습니다."}
            </p>
          </div>

          {/* 액션 */}
          <div className="mt-6 flex flex-col gap-2.5">
            <a
              href={telHref(hotlines[0].number)}
              className="w-full rounded-full py-3.5 text-center text-[14px] font-semibold
                bg-[#5a87ad] text-white
                shadow-[0_8px_20px_-8px_rgba(90,135,173,0.9)]
                hover:bg-[#4f7a9d] active:scale-[0.98]
                transition-all duration-200"
            >
              {isHigh ? "상담 전화 걸기" : "도움 받기"}
            </a>
            <button
              type="button"
              onClick={onContinue}
              className="w-full rounded-full py-3 text-center text-[13.5px] font-medium
                text-[#6f7f8d] bg-transparent border border-[#dcd5cb]
                hover:bg-[#f2ede6] hover:text-[#55646f]
                active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              {isHigh ? "부적 계속 받기" : "계속하기"}
            </button>
          </div>

          {/* 닫기 (항상 선택권을 드립니다) */}
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full text-center text-[12px] text-[#a49a8d]
              hover:text-[#8a8074] transition-colors cursor-pointer"
          >
            닫기
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

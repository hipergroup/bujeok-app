"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface FortuneCardProps {
  score: number; // 1-5
  overall: string;
  luckyColor: string;
  luckyDirection: string;
  luckyNumber: number;
  mantra: string;
}

export default function FortuneCard({
  score,
  overall,
  luckyColor,
  luckyDirection,
  luckyNumber,
  mantra,
}: FortuneCardProps) {
  const [expanded, setExpanded] = useState(false);

  const stars = Array.from({ length: 5 }, (_, i) => i < score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="card-glass p-5 cursor-pointer select-none"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* ── Header ──────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] tracking-wide">
          오늘의 운세
        </h3>
        <span className="text-xs text-[var(--color-text-muted)]">
          {expanded ? "접기 ▲" : "자세히 ▼"}
        </span>
      </div>

      {/* ── Star Rating ─────────────────────── */}
      <div className="flex items-center gap-1 mb-3">
        {stars.map((filled, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1 * i + 0.3, type: "spring", stiffness: 300 }}
            className={`text-xl ${
              filled ? "text-[var(--color-gold)]" : "text-[var(--color-text-muted)]"
            }`}
            style={
              filled
                ? {
                    animation: `twinkle 2s ease-in-out ${i * 0.4}s infinite`,
                    filter: "drop-shadow(0 0 4px rgba(212,168,83,0.5))",
                  }
                : {}
            }
          >
            ★
          </motion.span>
        ))}
        <span className="ml-2 text-sm font-bold text-[var(--color-gold)] text-glow">
          {score}점
        </span>
      </div>

      {/* ── Overall Fortune ─────────────────── */}
      <p className="text-base leading-relaxed text-[var(--color-text-primary)] mb-4">
        {overall}
      </p>

      {/* ── Lucky Elements Row ──────────────── */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🎨</span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {luckyColor}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">🧭</span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {luckyDirection}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">🔢</span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {luckyNumber}
          </span>
        </div>
      </div>

      {/* ── Expandable Details ──────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-[var(--color-border-subtle)]">
              {/* ── Mantra ────────────────────── */}
              <div className="relative rounded-xl bg-gradient-to-br from-[rgba(212,168,83,0.08)] to-[rgba(178,34,34,0.06)] p-4 text-center">
                <span className="absolute top-2 left-3 text-[var(--color-gold)] opacity-30 text-lg">
                  ✦
                </span>
                <span className="absolute bottom-2 right-3 text-[var(--color-gold)] opacity-30 text-lg">
                  ✦
                </span>
                <p className="text-xs text-[var(--color-text-muted)] mb-1.5">
                  오늘의 한 줄 주문
                </p>
                <p className="text-base font-semibold text-[var(--color-gold)] text-glow leading-relaxed">
                  &ldquo;{mantra}&rdquo;
                </p>
              </div>

              {/* ── Lucky Detail Grid ────────── */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-3 rounded-lg bg-[var(--color-surface)]">
                  <p className="text-xl mb-1">🎨</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">
                    행운의 색
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {luckyColor}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[var(--color-surface)]">
                  <p className="text-xl mb-1">🧭</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">
                    행운의 방위
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {luckyDirection}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[var(--color-surface)]">
                  <p className="text-xl mb-1">🔢</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">
                    행운의 숫자
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {luckyNumber}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

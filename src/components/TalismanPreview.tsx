"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { generateTalismanSVG } from "@/lib/talisman-generator";

type TalismanPreviewProps = {
  type: string;
  style: "traditional" | "modern";
  message: string;
  userName?: string;
  background?: string; // BackgroundPreset.id
  bgColor?: string;
  animal?: string;
  symbols?: string[];
  size?: "sm" | "md" | "lg";
  title?: string;
  mantra?: string;
};

/** Derive glow / accent colors from talisman type string */
function getTalismanColors(type: string): { glow: string; accent: string } {
  const colorMap: Record<string, { glow: string; accent: string }> = {
    수호: { glow: "#FFD700", accent: "#B22222" },
    재물: { glow: "#FFD700", accent: "#DAA520" },
    건강: { glow: "#90EE90", accent: "#228B22" },
    가정: { glow: "#FFB6C1", accent: "#FF69B4" },
    학업: { glow: "#87CEEB", accent: "#4169E1" },
    기타: { glow: "#DDA0DD", accent: "#9370DB" },
  };
  return colorMap[type] ?? { glow: "#FFD700", accent: "#B22222" };
}

export default function TalismanPreview({
  type,
  style,
  message,
  userName,
  background,
  bgColor,
  animal,
  symbols,
  size = "md",
  title = "",
  mantra = "",
}: TalismanPreviewProps) {
  const svgString = useMemo(
    () =>
      generateTalismanSVG({
        type,
        style,
        message,
        userName,
        background,
        bgColor,
        animal,
        symbols,
        title: title || "부적",
        mantra: mantra || "",
      }),
    [type, style, message, userName, background, bgColor, animal, symbols, title, mantra]
  );

  const colors = getTalismanColors(type);

  const sizeClasses = {
    sm: "w-[160px] h-[240px]",
    md: "w-[220px] h-[330px]",
    lg: "w-[280px] h-[420px]",
  };

  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Glow effect behind talisman */}
      <div
        className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.glow}40, transparent 70%)`,
        }}
      />

      {/* Golden border glow */}
      <div
        className={`relative ${sizeClasses[size]} rounded-2xl overflow-hidden`}
        style={{
          boxShadow: `0 0 30px ${colors.glow}20, 0 0 60px ${colors.glow}10, inset 0 0 30px ${colors.glow}05`,
        }}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            border: `1px solid ${colors.accent}30`,
            boxShadow: `0 0 15px ${colors.glow}15`,
          }}
          animate={{
            boxShadow: [
              `0 0 15px ${colors.glow}15`,
              `0 0 25px ${colors.glow}25`,
              `0 0 15px ${colors.glow}15`,
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* SVG talisman */}
        <div
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: svgString }}
        />
      </div>
    </motion.div>
  );
}

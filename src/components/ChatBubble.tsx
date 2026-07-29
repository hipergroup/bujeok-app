"use client";

import { motion } from "framer-motion";

/** Chat option displayed as a pill button */
export type DialogueOption = {
  label: string;
  value: string;
};

type ChatBubbleProps = {
  message: string;
  isBot: boolean;
  isTyping?: boolean;
  options?: DialogueOption[];
  onSelect?: (option: DialogueOption) => void;
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-2 h-2 rounded-full bg-white/50"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function ChatBubble({
  message,
  isBot,
  isTyping,
  options,
  onSelect,
}: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex w-full ${isBot ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`flex gap-2 max-w-[85%] ${
          isBot ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        {isBot && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-sm mt-1">
            🔮
          </div>
        )}

        <div className="flex flex-col gap-2">
          {/* Bubble */}
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
              isBot
                ? "bg-white/[0.07] backdrop-blur-md border border-white/[0.08] text-white/90 rounded-tl-md"
                : "bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur-md border border-amber-400/15 text-amber-50/90 rounded-tr-md"
            }`}
          >
            {isTyping ? <TypingIndicator /> : message}
          </div>

          {/* Option pills */}
          {isBot && options && options.length > 0 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex flex-wrap gap-2 pb-1"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSelect?.(option)}
                  className="px-3.5 py-1.5 text-xs rounded-full
                    bg-white/[0.06] backdrop-blur-sm
                    border border-white/[0.1]
                    text-white/80 hover:text-white
                    hover:bg-white/[0.12] hover:border-white/[0.2]
                    active:scale-95
                    transition-all duration-200 cursor-pointer"
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

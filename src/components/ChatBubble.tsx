"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  /** 옵션과 별개로 "직접 입력하기"를 허용할지 */
  allowFreeText?: boolean;
  /** 직접 입력 제출 핸들러 */
  onFreeTextSubmit?: (text: string) => void;
  /** 직접 입력 placeholder */
  freeTextPlaceholder?: string;
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

/** 옵션 아래에 붙는 "직접 입력" 영역 */
function InlineFreeText({
  onSubmit,
  placeholder = "편하게 적어주세요...",
}: {
  onSubmit: (text: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    setValue("");
    setOpen(false);
    onSubmit(text);
  };

  return (
    <div className="pb-1">
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button
            key="toggle"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(true)}
            className="px-3.5 py-1.5 text-xs rounded-full
              bg-transparent border border-dashed border-white/[0.16]
              text-white/55 hover:text-white/85
              hover:bg-white/[0.06] hover:border-white/[0.28]
              active:scale-95 transition-all duration-200 cursor-pointer"
          >
            ✏️ 직접 입력할게요
          </motion.button>
        ) : (
          <motion.form
            key="input"
            onSubmit={submit}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex gap-2 w-full"
          >
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              maxLength={200}
              className="flex-1 min-w-0 px-3.5 py-2 rounded-full text-xs
                bg-white/[0.06] border border-white/[0.12]
                text-white placeholder-white/30
                focus:outline-none focus:border-white/25
                transition-colors"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-3.5 py-2 rounded-full text-xs cursor-pointer
                bg-white/[0.1] text-white/75
                hover:bg-white/[0.16] hover:text-white
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all"
            >
              전송
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setValue("");
              }}
              className="px-2.5 py-2 rounded-full text-xs text-white/40
                hover:text-white/70 transition-colors cursor-pointer"
            >
              취소
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChatBubble({
  message,
  isBot,
  isTyping,
  options,
  onSelect,
  allowFreeText,
  onFreeTextSubmit,
  freeTextPlaceholder,
}: ChatBubbleProps) {
  const hasOptions = !!options && options.length > 0;
  const showFreeText = isBot && !isTyping && allowFreeText && !!onFreeTextSubmit;

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

        <div className="flex flex-col gap-2 min-w-0">
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
          {isBot && hasOptions && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex flex-wrap gap-2"
            >
              {options!.map((option) => (
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

          {/* "직접 입력할게요" — 옵션이 있어도 자유롭게 답할 수 있도록 */}
          {showFreeText && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <InlineFreeText
                onSubmit={onFreeTextSubmit!}
                placeholder={freeTextPlaceholder}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SealLogo } from "./hanji/motifs";

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
          className="block h-2 w-2 rounded-full bg-[var(--color-galsaek)] opacity-50"
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
            className="cursor-pointer rounded-full px-3.5 py-1.5 text-xs
              text-[var(--color-galsaek)] transition-all duration-200
              hover:text-[var(--color-juhong)] active:scale-95"
            style={{ border: "1px dashed rgba(122, 74, 52, 0.45)" }}
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
            className="flex w-full gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              maxLength={200}
              className="min-w-0 flex-1 rounded-full px-3.5 py-2 text-xs
                text-[var(--color-meok)] placeholder-[var(--color-galsaek)]/50
                focus:outline-none"
              style={{
                border: "1px solid rgba(122, 74, 52, 0.4)",
                backgroundColor: "rgba(246, 237, 217, 0.85)",
              }}
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="cursor-pointer rounded-full px-3.5 py-2 text-xs text-[#F6EDD9]
                transition-all disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: "var(--color-juhong)" }}
            >
              전송
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setValue("");
              }}
              className="cursor-pointer rounded-full px-2.5 py-2 text-xs
                text-[var(--color-galsaek)] opacity-60 transition-colors hover:opacity-100"
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
        className={`flex max-w-[85%] gap-2 ${
          isBot ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar — 낙관 */}
        {isBot && (
          <div className="mt-1 flex-shrink-0">
            <SealLogo size={30} />
          </div>
        )}

        <div className="flex min-w-0 flex-col gap-2">
          {/* Bubble */}
          <div
            className={`whitespace-pre-line rounded-xl px-4 py-3 text-sm leading-relaxed ${
              isBot
                ? "hanji-card rounded-tl-sm text-[var(--color-meok)]"
                : "rounded-tr-sm bg-[var(--color-juhong)] text-[#F6EDD9] shadow-[0_1px_4px_rgba(167,43,33,0.3)]"
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
                  className="cursor-pointer rounded-full px-3.5 py-1.5 text-xs
                    text-[var(--color-galsaek)] transition-all duration-200
                    hover:text-[var(--color-juhong)] active:scale-95"
                  style={{
                    border: "1px solid rgba(122, 74, 52, 0.4)",
                    backgroundColor: "rgba(246, 237, 217, 0.7)",
                  }}
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

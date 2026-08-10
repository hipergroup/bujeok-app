'use client';

import { motion } from 'framer-motion';

/**
 * 주홍 CTA 버튼 — 인주 바탕에 먹선 테두리, 안쪽 한지색 실선(box-shadow).
 * 한지 디자인 언어: 카드·버튼 모두 각지게(border-radius: 0).
 */
export default function TraditionalButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  className?: string;
}) {
  const style =
    variant === 'primary'
      ? {
          border: '1px solid var(--color-juhong-deep)',
          boxShadow:
            'inset 0 0 0 1px rgba(247, 233, 207, 0.35), 0 8px 22px rgba(167, 43, 33, 0.25)',
        }
      : { border: '1px solid rgba(122, 74, 52, 0.3)' };
  const base =
    variant === 'primary'
      ? 'bg-[var(--color-juhong)] text-[var(--color-juhong-tint)]'
      : 'bg-transparent text-[rgba(46,46,46,0.6)]';
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-[17px] text-center font-serif-kr text-[16px] tracking-[.08em] transition-colors disabled:opacity-50 ${base} ${className}`}
      style={style}
    >
      {children}
    </motion.button>
  );
}

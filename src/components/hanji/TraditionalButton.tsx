'use client';

import { motion } from 'framer-motion';

/**
 * 주홍 CTA 버튼 — 종이 라벨처럼 보이는 베이지 이중 테두리
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
  const base =
    variant === 'primary'
      ? 'bg-[var(--color-juhong)] text-[#F6EDD9] shadow-[0_2px_8px_rgba(167,43,33,0.35)]'
      : 'bg-transparent text-[var(--color-galsaek)]';
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full rounded-lg px-6 py-3.5 font-serif-kr text-base font-bold tracking-wider transition-colors disabled:opacity-50 ${base} ${className}`}
      style={{ border: '1px solid rgba(220, 201, 165, 0.9)' }}
    >
      {/* 안쪽 얇은 라벨 선 */}
      <span
        className="pointer-events-none absolute inset-[3px] rounded-md"
        style={{
          border:
            variant === 'primary'
              ? '1px solid rgba(242, 230, 204, 0.45)'
              : '1px solid rgba(122, 74, 52, 0.3)',
        }}
      />
      {children}
    </motion.button>
  );
}

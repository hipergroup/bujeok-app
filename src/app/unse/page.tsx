'use client';

/* ── 운세 허브 — 사주·궁합·택일·용어를 한 곳에서 ──
   하단 탭 "운세"의 관문. 각 목적지로 한 번에 이동한다. */

import Link from 'next/link';
import { motion } from 'framer-motion';
import BottomTab from '@/components/BottomTab';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import { BrushStroke } from '@/components/hanji/motifs';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/** 허브 카드 */
const ITEMS: {
  href: string;
  emoji: string;
  title: string;
  desc: string;
  primary?: boolean;
}[] = [
  {
    href: '/saju',
    emoji: '🔮',
    title: '내 사주 풀이',
    desc: '여덟 글자 · 오행 · 용신 · 대운 · 올해의 흐름 · 십성 · 신살까지',
    primary: true,
  },
  {
    href: '/days',
    emoji: '📅',
    title: '좋은 날 고르기',
    desc: '이사·계약·고백·시험 — 나에게 맞는 날을 달력에서',
  },
  {
    href: '/gunghap',
    emoji: '💕',
    title: '두 사람의 인연',
    desc: '연인·썸·부부·친구, 두 사람의 결을 읽어드려요',
  },
  {
    href: '/glossary',
    emoji: '📚',
    title: '사주 용어 사전',
    desc: '어려운 말은 여기서 쉽게 — 용신? 십성? 신살?',
  },
];

export default function UnsePage() {
  return (
    <HanjiBackground>
      <TraditionalHeader title="운세 보기" />

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-md flex-1 px-5 pb-32 pt-2"
      >
        <motion.div
          variants={fadeUp}
          className="mb-5 flex flex-col items-center text-center"
        >
          <h1 className="font-brush text-[24px] leading-snug text-[var(--color-meok)]">
            타고난 결을 알면
            <br />
            오늘이 편안해집니다
          </h1>
          <div className="mt-1.5 text-[var(--color-juhong)]">
            <BrushStroke width={96} />
          </div>
        </motion.div>

        <div className="flex flex-col gap-3">
          {ITEMS.map((item) => (
            <motion.div key={item.href} variants={fadeUp}>
              <Link
                href={item.href}
                className="hanji-card flex w-full items-center gap-4 rounded-2xl px-5 text-left transition-transform active:scale-[0.98]"
                style={{
                  paddingTop: item.primary ? '1.4rem' : '1rem',
                  paddingBottom: item.primary ? '1.4rem' : '1rem',
                  ...(item.primary
                    ? { borderColor: 'rgba(167,43,33,0.45)' }
                    : {}),
                }}
              >
                <span
                  className="flex shrink-0 items-center justify-center rounded-full"
                  style={{
                    width: item.primary ? 52 : 44,
                    height: item.primary ? 52 : 44,
                    fontSize: item.primary ? 24 : 20,
                    border: '1.5px solid rgba(167,43,33,0.3)',
                    background: 'rgba(167,43,33,0.05)',
                  }}
                  aria-hidden
                >
                  {item.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block font-serif-kr font-bold text-[var(--color-meok)] ${
                      item.primary ? 'text-[17px]' : 'text-[15px]'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-[var(--color-galsaek)]">
                    {item.desc}
                  </span>
                </span>
                <span className="text-[var(--color-juhong)]" aria-hidden>
                  →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          variants={fadeUp}
          className="mt-5 text-center text-[10.5px] leading-relaxed text-[var(--color-galsaek)] opacity-70"
        >
          모든 풀이는 전통 명리학을 참고한 참고용 정보예요.
          <br />
          정답이 아니라 방향을 비추는 나침반으로 여겨주세요.
        </motion.p>
      </motion.main>

      <BottomTab />
    </HanjiBackground>
  );
}

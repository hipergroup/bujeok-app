'use client';

// ============================================================
// 부적을 짓는 연출 — 약 6.8초
//
// 단순 로딩이 아니라 염원이 원형 부적에 담기는 의식처럼 보여준다.
//  · 원형 부적이 위에서 아래로 붓이 지나가듯 드러난다 (clip-path)
//  · 붉은 먹이 종이에 옅게 스며든다
//  · 종이가 아주 약하게 흔들린다
//  · 마지막에 부적이 온전히 자리를 잡는다 (+ 가능한 기기에서 짧은 진동)
// 금빛·반짝이·마법진 같은 과장은 쓰지 않는다.
// prefers-reduced-motion 환경에서는 단순 페이드로 대체한다.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { SavedTalisman } from '@/lib/types';
import PersonalTalismanView from './PersonalTalismanView';

const STAGES = [
  '마음을 고르고 있습니다',
  '당신에게 필요한 부적을 펼치고 있습니다',
  '염원을 부적에 담고 있습니다',
  '정성을 다해 마무리하고 있습니다',
] as const;

export default function CraftingRitual({
  talisman,
  onDone,
}: {
  talisman: SavedTalisman;
  onDone: () => void;
}) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // 움직임을 줄인 환경에서는 짧게, 아니면 6.8초의 의식으로
    const plan: [number, () => void][] = reduced
      ? [
          [900, () => setStage(1)],
          [1800, () => setStage(2)],
          [2700, () => setStage(3)],
          [4200, onDone],
        ]
      : [
          [1600, () => setStage(1)],
          [3400, () => setStage(2)],
          [5200, () => setStage(3)],
          [5600, () => {
            try {
              navigator.vibrate?.(30); // 지원 기기에서만 — 작고 절제된 진동
            } catch {
              /* noop */
            }
          }],
          [6800, onDone],
        ];
    timers.current = plan.map(([t, fn]) => setTimeout(fn, t));
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div className="flex w-full flex-col items-center pt-6">
      <div
        className={reduced ? 'craft-fade' : 'craft-sway'}
        style={{ width: 'min(64vw, 250px)' }}
      >
        <div className={reduced ? '' : 'craft-reveal'}>
          <div className="relative overflow-hidden rounded-xl shadow-[0_10px_30px_rgba(43,24,16,0.25)]">
            <PersonalTalismanView talisman={talisman} width="100%" />
            {/* 붉은 먹이 스며드는 층 */}
            {!reduced && (
              <div aria-hidden className="craft-ink pointer-events-none absolute inset-0" />
            )}
          </div>
        </div>
      </div>

      {/* 진행 문구 */}
      <div className="mt-8 h-6 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="font-serif-kr text-sm text-[var(--color-galsaek)]"
          >
            {STAGES[stage]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex gap-1.5">
        {STAGES.map((_, i) => (
          <span
            key={i}
            className="h-1 w-1 rounded-full transition-colors duration-500"
            style={{
              backgroundColor:
                i <= stage ? 'var(--color-juhong)' : 'rgba(122,74,52,0.25)',
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        /* 위에서 아래로 붓이 지나가듯 드러난다 */
        .craft-reveal {
          animation: craft-unveil 3.8s cubic-bezier(0.45, 0.05, 0.35, 1) 1.4s both;
        }
        @keyframes craft-unveil {
          from {
            clip-path: inset(0 0 100% 0);
          }
          to {
            clip-path: inset(0 0 0% 0);
          }
        }
        /* 종이가 아주 약하게 움직인다 */
        .craft-sway {
          animation: craft-sway 5.5s ease-in-out infinite alternate;
          transform-origin: 50% 20%;
        }
        @keyframes craft-sway {
          from {
            transform: rotate(-0.4deg);
          }
          to {
            transform: rotate(0.4deg);
          }
        }
        /* 붉은 먹이 종이에 미세하게 스며든다 */
        .craft-ink {
          background: radial-gradient(
            70% 55% at 50% 42%,
            rgba(167, 43, 33, 0.16),
            transparent 75%
          );
          animation: craft-ink 2.2s ease-in-out 3.2s both;
        }
        @keyframes craft-ink {
          0% {
            opacity: 0;
          }
          45% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        /* 인장이 '탁' 찍힌다 */
        [data-stamp] {
          animation: stamp-drop 0.45s cubic-bezier(0.2, 1.5, 0.4, 1) both;
        }
        @keyframes stamp-drop {
          0% {
            transform: translate(-50%, -50%) scale(1.9);
            opacity: 0;
          }
          60% {
            transform: translate(-50%, -50%) scale(0.96);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        .craft-fade {
          animation: craft-simple-fade 1.2s ease both;
        }
        @keyframes craft-simple-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .craft-reveal,
          .craft-sway,
          .craft-ink,
          [data-stamp] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import TraditionalButton from './TraditionalButton';

/* ── 그림 안내용 아이폰 목업 ─────────────────────────
   실제 스크린샷 대신 한지 톤의 단순한 도해로 각 단계를 보여준다. */

const INK = '#7A4A34';
const JUHONG = '#A72B21';
const PAPER = '#F6EDD9';

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <g>
      <rect
        x="26"
        y="6"
        width="88"
        height="148"
        rx="13"
        fill={PAPER}
        stroke={INK}
        strokeWidth="2"
      />
      <rect x="58" y="11" width="24" height="4" rx="2" fill={INK} opacity="0.35" />
      {children}
    </g>
  );
}

/** 1단계 — 홈 화면 빈 곳을 지그시 누르기 */
function StepPressArt() {
  return (
    <svg viewBox="0 0 140 160" className="h-full w-full" aria-hidden>
      <PhoneFrame>
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={35 + col * 18}
              y={26 + row * 22}
              width="13"
              height="13"
              rx="3.5"
              fill="none"
              stroke={INK}
              strokeWidth="1.2"
              opacity="0.45"
            />
          ))
        )}
        {/* 누르는 손끝 + 파장 */}
        <circle cx="70" cy="116" r="9" fill={JUHONG} opacity="0.16" />
        <circle cx="70" cy="116" r="15" fill="none" stroke={JUHONG} strokeWidth="1.4" opacity="0.5" />
        <circle cx="70" cy="116" r="21" fill="none" stroke={JUHONG} strokeWidth="1.1" opacity="0.25" />
        <circle cx="70" cy="116" r="4.5" fill={JUHONG} />
      </PhoneFrame>
    </svg>
  );
}

/** 2단계 — 왼쪽 위 편집 → 위젯 */
function StepEditArt() {
  return (
    <svg viewBox="0 0 140 160" className="h-full w-full" aria-hidden>
      <PhoneFrame>
        {/* 흔들리는 아이콘들 */}
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={35 + col * 18}
              y={44 + row * 22}
              width="13"
              height="13"
              rx="3.5"
              fill="none"
              stroke={INK}
              strokeWidth="1.2"
              opacity="0.3"
              transform={`rotate(${col % 2 === 0 ? -3 : 3} ${41.5 + col * 18} ${50.5 + row * 22})`}
            />
          ))
        )}
        {/* 좌상단 편집 버튼 강조 */}
        <rect x="34" y="22" width="34" height="13" rx="6.5" fill={JUHONG} />
        <text x="51" y="31.5" textAnchor="middle" fontSize="8" fill={PAPER} fontWeight="bold">
          편집
        </text>
        <circle cx="51" cy="28.5" r="17" fill="none" stroke={JUHONG} strokeWidth="1.3" opacity="0.4" />
        {/* 위젯 메뉴 */}
        <rect x="72" y="40" width="38" height="12" rx="3" fill={PAPER} stroke={JUHONG} strokeWidth="1.3" />
        <text x="91" y="48.6" textAnchor="middle" fontSize="7.5" fill={JUHONG} fontWeight="bold">
          위젯
        </text>
        <path d="M62 32 L70 42" stroke={JUHONG} strokeWidth="1.3" strokeDasharray="2 2" />
      </PhoneFrame>
    </svg>
  );
}

/** 3단계 — 수호부 검색 → 크기 고르고 추가 */
function StepAddArt() {
  return (
    <svg viewBox="0 0 140 160" className="h-full w-full" aria-hidden>
      <PhoneFrame>
        {/* 검색창 */}
        <rect x="35" y="24" width="70" height="13" rx="6.5" fill="none" stroke={INK} strokeWidth="1.3" />
        <circle cx="43" cy="30.5" r="3.2" fill="none" stroke={INK} strokeWidth="1.2" />
        <path d="M45.5 33 L48 35.5" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
        <text x="53" y="33.5" fontSize="8" fill={JUHONG} fontWeight="bold">
          수호부
        </text>
        {/* 위젯 미리보기 (부적 한 장) */}
        <rect x="47" y="46" width="46" height="62" rx="6" fill={PAPER} stroke={JUHONG} strokeWidth="1.6" />
        <rect x="51" y="50" width="38" height="54" rx="3" fill="none" stroke={JUHONG} strokeWidth="0.8" opacity="0.6" />
        <path d="M70 56 l4 5 -4 5 -4 -5z" fill="none" stroke={JUHONG} strokeWidth="1.1" />
        <path d="M60 74h20M62 80h16M64 86h12" stroke={INK} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
        <rect x="65" y="92" width="10" height="10" rx="1.6" fill={JUHONG} />
        {/* 위젯 추가 버튼 */}
        <rect x="45" y="118" width="50" height="15" rx="7.5" fill={JUHONG} />
        <text x="70" y="128.5" textAnchor="middle" fontSize="8" fill={PAPER} fontWeight="bold">
          위젯 추가
        </text>
      </PhoneFrame>
    </svg>
  );
}

const STEPS = [
  {
    Art: StepPressArt,
    title: '홈 화면 빈 곳을 꾹 누르세요',
    desc: '아이콘이 흔들리기 시작할 때까지',
  },
  {
    Art: StepEditArt,
    title: '왼쪽 위 ‘편집’에서 ‘위젯’을 여세요',
    desc: '기기에 따라 ‘+’ 버튼일 수도 있어요',
  },
  {
    Art: StepAddArt,
    title: '‘수호부’를 찾아 크기를 고르세요',
    desc: '중간 크기는 기원 문구까지 함께 보여요',
  },
];

/**
 * 홈 화면 위젯 추가 안내 — 부적을 완성한 직후 한 번 보여준다.
 * iOS는 앱이 위젯을 대신 추가할 수 없어, 세 단계를 그림으로 안내한다.
 */
export default function WidgetGuideSheet({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="widget-guide-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/45 backdrop-blur-sm sm:items-center"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="hanji-surface max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:rounded-3xl"
        style={{ borderTop: '1px solid rgba(122,74,52,0.4)' }}
      >
        <div className="mb-4 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-[var(--color-galsaek)] opacity-30" />
        </div>

        <h2
          id="widget-guide-title"
          className="text-center font-brush text-[21px] leading-snug text-[var(--color-meok)]"
        >
          부적은 지니고 있어야 합니다
        </h2>
        <p className="mt-2 text-center font-serif-kr text-sm leading-relaxed text-[var(--color-galsaek)]">
          홈 화면에 두면 앱을 열지 않아도
          <br />
          매일 곁에서 당신을 지켜줍니다.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {STEPS.map(({ Art, title, desc }, i) => (
            <div key={title} className="hanji-card flex items-center gap-4 rounded-xl p-3">
              <div className="h-[92px] w-[80px] shrink-0">
                <Art />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-juhong)] text-[10px] font-bold text-[#F6EDD9]">
                    {i + 1}
                  </span>
                  <p className="font-serif-kr text-[13px] font-bold leading-snug text-[var(--color-meok)]">
                    {title}
                  </p>
                </div>
                <p className="mt-1 pl-7 text-[11px] leading-relaxed text-[var(--color-galsaek)] opacity-80">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--color-galsaek)] opacity-70">
          방금 만든 부적이 이미 담겨 있어요.
          <br />
          위젯을 추가하면 바로 나타납니다.
        </p>

        <div className="mt-5">
          <TraditionalButton onClick={onClose}>알겠어요</TraditionalButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

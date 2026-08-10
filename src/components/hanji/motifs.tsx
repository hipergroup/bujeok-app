/**
 * 수호부 전통 문양 SVG 세트
 * 민화·부적 장식을 단순한 선 문양으로 재구성한 컴포넌트들.
 * 모두 currentColor 기반 — 부모의 color로 색을 제어한다.
 */

type MotifProps = {
  size?: number;
  className?: string;
};

function Svg({
  size = 32,
  className = '',
  viewBox = '0 0 48 48',
  children,
}: MotifProps & { viewBox?: string; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/* ── 전통 매듭 (노리개 매듭) ───────────────────────── */
export function KnotMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M24 6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="16" y="12" width="16" height="16" rx="2" transform="rotate(45 24 20)" stroke="currentColor" strokeWidth="2" />
      <rect x="20" y="16" width="8" height="8" rx="1" transform="rotate(45 24 20)" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 20c-4 0-4 6 0 6M35 20c4 0 4 6 0 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21 31l-2 11M27 31l2 11M24 32v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

/* ── 당초 구름 ─────────────────────────────────────── */
export function CloudMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path
        d="M10 30c-3 0-5-2.5-5-5.5S7.5 19 10.5 19c.5-4 4-7 8-7 3.4 0 6.3 2 7.5 5 .8-.4 1.8-.7 2.8-.7 3.6 0 6.5 2.9 6.5 6.4 0 .4 0 .9-.1 1.3H38c2.8 0 5 2.2 5 5s-2.2 5-5 5H12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M17 25c0-2 1.6-3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M28 29c-1.8 0-3.2-1.4-3.2-3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

/* ── 보주 불꽃 ─────────────────────────────────────── */
export function FlameMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path
        d="M24 5c2 6-6 8-6 15 0 3 2 5 2 5s-6-1-6 6c0 6 5 11 10 11s10-5 10-11c0-7-6-9-6-6 0 0 2-2 2-5 0-7-8-9-6-15z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M24 33c-2 2-2 5 0 7 2-2 2-5 0-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </Svg>
  );
}

/* ── 민화 산수 (겹산 + 해) ─────────────────────────── */
export function MountainMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <circle cx="34" cy="14" r="5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 38l10-16 8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 38l10-20 14 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 30c2-1 4-1 6 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6 42h36" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="4 3" />
    </Svg>
  );
}

/* ── 장승 실루엣 ───────────────────────────────────── */
export function JangseungMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M17 8h14v34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 8v34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 8h20l-3-4H17l-3 4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="21.5" cy="16" r="1.6" fill="currentColor" />
      <circle cx="26.5" cy="16" r="1.6" fill="currentColor" />
      <path d="M22 22h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 27c2.5 2 5.5 2 8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 34h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13 42h22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

/* ── 연꽃 문양 ─────────────────────────────────────── */
export function LotusMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M24 10c-3 5-3 10 0 14 3-4 3-9 0-14z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13 16c0 6 3 10 8 11-1-6-4-9-8-11z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M35 16c0 6-3 10-8 11 1-6 4-9 8-11z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 28c4 6 10 9 16 9s12-3 16-9c-5-1-9 0-11 2-1.6-2-3.4-3-5-3s-3.4 1-5 3c-2-2-6-3-11-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </Svg>
  );
}

/* ── 낙관 (한글 '수호부' 인장) ─────────────────────── */
export function SealLogo({
  size = 36,
  className = '',
  text = '수호부',
}: MotifProps & { text?: string }) {
  const chars = text.split('');
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="3" y="3" width="42" height="42" rx="6" fill="#A72B21" />
      <rect x="6.5" y="6.5" width="35" height="35" rx="4" fill="none" stroke="#F2E7CE" strokeWidth="1.4" opacity="0.9" />
      {chars.length === 3 ? (
        <>
          <text x="24" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#F2E7CE" fontFamily="var(--font-brush), serif">
            {chars[0]}{chars[1]}
          </text>
          <text x="24" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill="#F2E7CE" fontFamily="var(--font-brush), serif">
            {chars[2]}
          </text>
        </>
      ) : (
        <text x="24" y="30" textAnchor="middle" fontSize="15" fontWeight="700" fill="#F2E7CE" fontFamily="var(--font-brush), serif">
          {text}
        </text>
      )}
    </svg>
  );
}

/* ── 붓 자국 (갈필 가로획) ─────────────────────────── */
export function BrushStroke({ width = 120, className = '' }: { width?: number; className?: string }) {
  return (
    <svg width={width} height={width * 0.14} viewBox="0 0 120 17" fill="none" className={className} aria-hidden>
      <path
        d="M2 9c18-4 38-5 57-4 20 1 40 1 59-2-14 5-32 8-52 8-22 0-44-1-64-2z"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M96 5c8-.5 15-1.5 22-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      <path d="M99 11c7 0 13-.5 19-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

/* ── 붓 (미리보기 옆 장식) ─────────────────────────── */
export function BrushPen({ size = 110, className = '' }: MotifProps) {
  return (
    <svg
      width={size * 0.35}
      height={size}
      viewBox="0 0 42 120"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* 붓대 */}
      <rect x="17" y="4" width="8" height="70" rx="4" fill="#7A4A34" />
      <rect x="17" y="4" width="3.5" height="70" rx="1.75" fill="#93604A" />
      {/* 붓대 고리 끈 */}
      <circle cx="21" cy="6" r="2.4" fill="none" stroke="#A72B21" strokeWidth="1.4" />
      {/* 촉 연결부 */}
      <rect x="15.5" y="74" width="11" height="7" rx="2" fill="#DAA017" />
      {/* 붓털 */}
      <path
        d="M16 81c0 8 1.5 15 5 24 3.5-9 5-16 5-24h-10z"
        fill="#2E2E2E"
      />
      <path d="M21 96v9" stroke="#A72B21" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* ── 모서리 뇌문(回文) 장식 ────────────────────────── */
export function CornerMotif({
  size = 40,
  className = '',
  flip = false,
}: MotifProps & { flip?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden
    >
      <path
        d="M2 38V10h28M8 38V16h22M8 22h10v16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      <path d="M2 10V2h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

/* ══ 헤더·내비게이션용 선 아이콘 (전통풍 단순 선) ══ */

export function MenuIcon(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M8 14h32M8 24h24M8 34h32" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </Svg>
  );
}

export function BellIcon(props: MotifProps) {
  return (
    <Svg {...props}>
      {/* 풍경(風磬) 모양 */}
      <path d="M24 6v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 24c0-7 4-14 10-14s10 7 10 14v6H14v-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 30h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 30v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M24 36l4 5h-8l4-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}

export function BackIcon(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M30 8L14 24l16 16" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function GearIcon(props: MotifProps) {
  return (
    <Svg {...props}>
      {/* 꽃살문 창호 문양 */}
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" />
      <path
        d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4.5 4.5M32.5 32.5L37 37M37 11l-4.5 4.5M15.5 32.5L11 37"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ── 하단 탭 아이콘 ────────────────────────────────── */

export function HomeTabIcon(props: MotifProps) {
  return (
    <Svg {...props}>
      {/* 기와지붕 집 */}
      <path d="M6 22C12 14 18 10 24 10s12 4 18 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M11 21v17h26V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 38V28h8v10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </Svg>
  );
}

export function CalendarTabIcon(props: MotifProps) {
  return (
    <Svg {...props}>
      {/* 책력(달력) — 한지 두루마리 느낌 */}
      <rect x="9" y="12" width="30" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M9 20h30" stroke="currentColor" strokeWidth="1.8" />
      <path d="M17 8v7M31 8v7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="24" cy="30" r="4.5" stroke="currentColor" strokeWidth="1.8" />
    </Svg>
  );
}

export function BrushTabIcon(props: MotifProps) {
  return (
    <Svg {...props}>
      {/* 붓 */}
      <path d="M28 6l8 8-14 14-9 1 1-9L28 6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 29l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 40c4-2 8-2 12 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function BoxTabIcon(props: MotifProps) {
  return (
    <Svg {...props}>
      {/* 함(函) */}
      <rect x="8" y="16" width="32" height="22" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 24h32" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 16l3-6h18l3 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M21 24h6v4h-6v-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}

export function PersonTabIcon(props: MotifProps) {
  return (
    <Svg {...props}>
      {/* 갓 쓴 선비 */}
      <path d="M14 14h20M18 14c0-3 2.5-6 6-6s6 3 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="21" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M10 40c2-8 7-12 14-12s12 4 14 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/* ══ 기본 이모지 대체 문양 (전통풍 선 아이콘) ══ */

/** 두루마리 (받은 부적) */
export function ScrollMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M12 10c-3 0-5 2-5 5s2 5 5 5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 10h26c-3 2-3 8 0 10H12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M36 20c3 0 5 2 5 5s-2 5-5 5H14c3 2 3 8 0 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 30H14M36 40H14c-3 0-5-2-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 15h12M20 25h12M20 35h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

/** 고서 (도감) */
export function BookMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M24 12c-4-3-10-4-15-3v27c5-1 11 0 15 3 4-3 10-4 15-3V9c-5-1-11 0-15 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 12v27" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13 16c2.5-.4 5.5 0 8 1M13 22c2.5-.4 5.5 0 8 1M13 28c2.5-.4 5.5 0 8 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M35 16c-2.5-.4-5.5 0-8 1M35 22c-2.5-.4-5.5 0-8 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

/** 소각 (삭제 — 부적은 태워 보낸다) */
export function TrashMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M12 16h24M20 16v-3h8v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 16l2 24h14l2-24" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M21 22v12M27 22v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

/** 안내 (두루마리 인장) */
export function InfoMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="15.5" r="1.8" fill="currentColor" />
      <path d="M24 21v13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 34h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

/** 나눔 (공유) */
export function ShareMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M24 28V8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M17 14l7-7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 24h-4v16h28V24h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** 내려받기 */
export function DownloadMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M24 8v20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M17 22l7 7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 34v6h28v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** 전화 */
export function PhoneMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path
        d="M16 8c2 0 4 4 4 6 0 2-3 3-3 5s2 5 4 7 5 4 7 4 3-3 5-3 6 2 6 4-2 6-6 6C21 37 11 27 11 15c0-4 3-7 5-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 부적 걸기 (위젯에 담기 — 못에 걸린 한 장) */
export function PinTalismanMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M24 5v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="12.5" r="2.4" fill="currentColor" />
      <path d="M13 16h22v26H13z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 20h14v18H17z" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <path d="M24 25v9M20.5 28.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

/** 찾기 (돋보기) */
export function SearchMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <circle cx="21" cy="21" r="11" stroke="currentColor" strokeWidth="2.2" />
      <path d="M30 30l10 10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </Svg>
  );
}

/** 새싹 (오행 목) */
export function SproutMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M24 40V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 24c0-8-5-13-13-13 0 8 5 13 13 13z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 20c0-6 4-10 10-10 0 6-4 10-10 10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </Svg>
  );
}

/** 칼 (오행 금) */
export function SwordMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M30 8l8 8-16 18-8 2 2-8L30 8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 34l-4 4M18 38l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/** 물방울 (오행 수) */
export function WaterDropMotif(props: MotifProps) {
  return (
    <Svg {...props}>
      <path d="M24 7c6 8 12 14 12 21a12 12 0 11-24 0c0-7 6-13 12-21z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 28a6 6 0 006 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

/** 기운(motif kind) → 문양 컴포넌트 */
export const MOTIF_COMPONENTS = {
  knot: KnotMotif,
  cloud: CloudMotif,
  flame: FlameMotif,
  mountain: MountainMotif,
  jangseung: JangseungMotif,
  lotus: LotusMotif,
} as const;

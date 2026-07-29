'use client';

import React from 'react';

// ─── Props ───────────────────────────────────────────────────────────
export interface TalismanSVGProps {
  type: string;
  style: 'traditional' | 'modern';
  title: string;
  message: string;
  mantra: string;
  userName: string;
  animal: string;
  category: string;
  width?: number;
  height?: number;
}

// ─── 12 Zodiac Animal SVG Paths ──────────────────────────────────────
// Each path is designed to fit within a ~60x60 unit bounding box centered at (0,0)
const ANIMAL_PATHS: Record<string, { path: string; label: string }> = {
  쥐: {
    label: '쥐',
    path: `M-8,-18 C-14,-16 -18,-8 -18,0 C-18,10 -10,18 0,18 C10,18 18,10 18,0
           C18,-8 14,-16 8,-18 C6,-20 2,-22 0,-22 C-2,-22 -6,-20 -8,-18 Z
           M-6,-8 C-6,-6 -4,-4 -2,-4 C0,-4 2,-6 2,-8 C2,-10 0,-12 -2,-12 C-4,-12 -6,-10 -6,-8 Z
           M6,-8 C6,-6 8,-4 10,-4 C12,-4 14,-6 14,-8 C14,-10 12,-12 10,-12 C8,-12 6,-10 6,-8 Z
           M-12,-20 C-16,-26 -20,-24 -18,-18 M12,-20 C16,-26 20,-24 18,-18
           M0,4 C-2,4 -4,6 -4,8 C-4,10 -2,10 0,10 C2,10 4,10 4,8 C4,6 2,4 0,4 Z
           M18,6 C22,8 26,12 28,16 C28,18 26,18 24,14 C22,10 20,8 18,6 Z`,
  },
  소: {
    label: '소',
    path: `M-16,0 C-18,-4 -20,-12 -16,-18 C-14,-22 -10,-24 -6,-24
           L6,-24 C10,-24 14,-22 16,-18 C20,-12 18,-4 16,0
           C16,8 14,16 10,20 L-10,20 C-14,16 -16,8 -16,0 Z
           M-18,-18 C-22,-24 -26,-26 -24,-20 C-22,-16 -20,-16 -18,-18 Z
           M18,-18 C22,-24 26,-26 24,-20 C22,-16 20,-16 18,-18 Z
           M-8,-6 C-8,-4 -6,-2 -4,-2 C-2,-2 0,-4 0,-6 C0,-8 -2,-10 -4,-10 C-6,-10 -8,-8 -8,-6 Z
           M8,-6 C8,-4 10,-2 12,-2 C14,-2 16,-4 16,-6 C16,-8 14,-10 12,-10 C10,-10 8,-8 8,-6 Z
           M-4,8 C-2,12 2,12 4,8 M-6,10 L-6,14 M6,10 L6,14`,
  },
  호랑이: {
    label: '호랑이',
    path: `M-20,-10 C-22,-20 -16,-26 -10,-24 C-6,-22 -4,-18 -2,-16
           L2,-16 C4,-18 6,-22 10,-24 C16,-26 22,-20 20,-10
           C20,-4 16,2 12,6 C8,10 4,14 0,18 C-4,14 -8,10 -12,6
           C-16,2 -20,-4 -20,-10 Z
           M-10,-8 C-10,-6 -8,-4 -6,-4 C-4,-4 -2,-6 -2,-8 C-2,-10 -4,-12 -6,-12 C-8,-12 -10,-10 -10,-8 Z
           M10,-8 C10,-6 12,-4 14,-4 C16,-4 18,-6 18,-8 C18,-10 16,-12 14,-12 C12,-12 10,-10 10,-8 Z
           M-2,0 C-1,2 1,2 2,0 M0,-2 L0,2
           M-6,-16 L0,-12 L6,-16 M-3,-15 L0,-13 L3,-15
           M-14,-4 L-18,-2 M-14,0 L-18,2 M14,-4 L18,-2 M14,0 L18,2`,
  },
  토끼: {
    label: '토끼',
    path: `M-12,2 C-16,-2 -16,-10 -12,-14 C-8,-18 -2,-18 0,-14
           C2,-18 8,-18 12,-14 C16,-10 16,-2 12,2
           C12,8 8,16 4,20 L-4,20 C-8,16 -12,8 -12,2 Z
           M-6,-22 C-8,-34 -4,-38 -2,-30 C0,-24 -2,-20 -4,-18
           M6,-22 C8,-34 4,-38 2,-30 C0,-24 2,-20 4,-18
           M-6,-2 C-6,0 -4,2 -2,2 C0,2 2,0 2,-2 C2,-4 0,-6 -2,-6 C-4,-6 -6,-4 -6,-2 Z
           M8,-2 C8,0 10,2 12,2 C14,2 16,0 16,-2 C16,-4 14,-6 12,-6 C10,-6 8,-4 8,-2 Z
           M0,4 C-1,4 -2,5 -2,6 C-2,7 -1,8 0,8 C1,8 2,7 2,6 C2,5 1,4 0,4 Z`,
  },
  용: {
    label: '용',
    path: `M-20,-16 C-24,-20 -20,-26 -14,-24 C-10,-22 -8,-18 -6,-14
           C-2,-18 4,-20 10,-18 C16,-16 20,-10 18,-4
           C16,2 10,6 4,8 C0,10 -4,14 -8,18
           C-12,22 -16,20 -14,16 C-12,12 -8,10 -4,8
           M-6,-14 C-8,-10 -10,-6 -8,-2 C-6,2 -2,4 2,4
           M-16,-16 C-14,-14 -12,-16 -14,-18
           M-18,-12 C-20,-10 -18,-8 -16,-10
           M18,-8 L22,-12 M18,-4 L24,-6
           M-20,-4 C-24,-2 -26,2 -22,4
           M10,-18 C12,-22 16,-24 18,-20
           M4,8 C8,6 12,8 14,12 C14,14 12,14 10,12`,
  },
  뱀: {
    label: '뱀',
    path: `M-4,-24 C-8,-24 -12,-20 -12,-16 C-12,-10 -6,-6 0,-6
           C6,-6 12,-2 12,4 C12,10 6,14 0,14
           C-6,14 -12,10 -12,4 C-12,-2 -6,2 0,2
           C4,2 6,4 6,6 C6,8 4,10 2,10
           M-4,-24 C0,-26 4,-24 4,-20 C4,-18 2,-16 0,-16
           C-2,-16 -4,-18 -4,-20 Z
           M-2,-20 C-2,-19 -1,-18 0,-18 C1,-18 2,-19 2,-20
           M-6,-14 L-8,-12 M6,-14 L8,-12`,
  },
  말: {
    label: '말',
    path: `M-8,-24 C-10,-28 -8,-32 -4,-30 C0,-28 2,-24 2,-20
           C4,-22 8,-24 12,-22 C16,-20 18,-14 16,-8
           C14,-2 10,4 6,10 C4,14 2,18 0,22
           C-2,18 -4,14 -6,10 C-10,4 -14,-2 -16,-8
           C-18,-14 -16,-20 -12,-22 C-10,-24 -8,-24 -8,-24 Z
           M-8,-24 C-12,-26 -16,-24 -14,-20
           M-8,-10 C-8,-8 -6,-6 -4,-6 C-2,-6 0,-8 0,-10
           M6,-10 C6,-8 8,-6 10,-6 C12,-6 14,-8 14,-10
           M-2,0 L0,2 L2,0
           M2,-20 C6,-18 10,-20 12,-24 C14,-28 12,-30 10,-28`,
  },
  양: {
    label: '양',
    path: `M-16,-6 C-20,-10 -18,-18 -12,-20 C-8,-22 -4,-20 -2,-16
           C0,-20 4,-22 8,-20 C14,-18 16,-10 12,-6
           C14,-2 14,4 12,8 C10,14 6,18 2,20
           L-6,20 C-10,18 -14,14 -16,8 C-18,4 -18,-2 -16,-6 Z
           M-18,-14 C-22,-18 -24,-14 -22,-10 C-20,-8 -18,-10 -18,-14 Z
           M14,-14 C18,-18 20,-14 18,-10 C16,-8 14,-10 14,-14 Z
           M-6,-4 A2,2 0 1,1 -2,-4 A2,2 0 1,1 -6,-4 Z
           M6,-4 A2,2 0 1,1 10,-4 A2,2 0 1,1 6,-4 Z
           M0,2 C-1,4 1,4 2,2
           M-14,2 C-16,0 -18,2 -16,4 M-12,6 C-14,4 -16,6 -14,8
           M10,2 C12,0 14,2 12,4 M8,6 C10,4 12,6 10,8`,
  },
  원숭이: {
    label: '원숭이',
    path: `M-12,-10 C-14,-16 -10,-22 -4,-22 C0,-22 4,-22 8,-22
           C14,-22 18,-16 16,-10 C18,-8 20,-4 18,0
           C16,4 12,6 8,6 C6,8 4,12 2,16
           C0,20 -2,22 -4,20 C-6,18 -4,14 -2,10
           C-4,8 -8,6 -12,4 C-16,2 -18,-2 -18,-6
           C-18,-8 -16,-10 -12,-10 Z
           M-6,-10 C-6,-8 -4,-6 -2,-6 C0,-6 2,-8 2,-10 C2,-12 0,-14 -2,-14 C-4,-14 -6,-12 -6,-10 Z
           M8,-10 C8,-8 10,-6 12,-6 C14,-6 16,-8 16,-10 C16,-12 14,-14 12,-14 C10,-14 8,-12 8,-10 Z
           M0,-4 C-1,-2 1,-2 2,-4
           M-18,-10 C-22,-12 -24,-8 -20,-6
           M18,-10 C22,-12 24,-8 20,-6
           M2,16 C4,18 6,16 8,14 C10,12 12,14 10,16`,
  },
  닭: {
    label: '닭',
    path: `M-4,-26 C-2,-28 2,-28 4,-26 C6,-24 4,-22 2,-20
           C4,-18 8,-14 10,-10 C12,-6 12,0 10,6
           C8,12 4,18 0,22 C-4,18 -8,12 -10,6
           C-12,0 -12,-6 -10,-10 C-8,-14 -4,-18 -2,-20
           C-4,-22 -6,-24 -4,-26 Z
           M-4,-12 C-4,-10 -2,-8 0,-8 C2,-8 4,-10 4,-12 C4,-14 2,-16 0,-16 C-2,-16 -4,-14 -4,-12 Z
           M6,-12 C8,-12 10,-10 10,-8
           M-6,-12 C-8,-12 -10,-10 -10,-8
           M0,-4 C-2,-2 -2,0 0,2 C2,0 2,-2 0,-4 Z
           M-10,10 C-14,12 -16,10 -14,8 M10,10 C14,12 16,10 14,8
           M-6,18 L-8,22 L-4,22 M6,18 L8,22 L4,22
           M-2,-26 C-2,-30 0,-32 2,-30 C4,-28 2,-26 0,-26`,
  },
  개: {
    label: '개',
    path: `M-14,-8 C-16,-14 -12,-20 -6,-20 C-2,-20 2,-20 6,-20
           C12,-20 16,-14 14,-8 C16,-6 18,-2 16,2
           C14,6 10,8 6,8 C4,10 2,14 0,18
           L-4,18 C-6,14 -8,10 -10,8 C-14,6 -18,2 -18,-2
           C-20,-6 -18,-8 -14,-8 Z
           M-18,-14 C-22,-18 -24,-14 -22,-10 C-20,-8 -18,-10 -18,-12 Z
           M14,-14 C18,-18 20,-14 18,-10 C16,-8 14,-10 14,-12 Z
           M-6,-8 A2,2 0 1,1 -2,-8 A2,2 0 1,1 -6,-8 Z
           M6,-8 A2,2 0 1,1 10,-8 A2,2 0 1,1 6,-8 Z
           M-2,0 C-1,2 1,2 2,0
           M0,18 C2,20 4,22 6,20 C8,18 6,16 4,18`,
  },
  돼지: {
    label: '돼지',
    path: `M-16,-4 C-18,-12 -12,-20 -4,-20 C0,-20 4,-20 8,-20
           C16,-20 20,-12 18,-4 C20,0 20,6 18,10
           C14,16 8,20 0,20 C-8,20 -14,16 -18,10
           C-20,6 -20,0 -16,-4 Z
           M-8,-8 A2,2 0 1,1 -4,-8 A2,2 0 1,1 -8,-8 Z
           M8,-8 A2,2 0 1,1 12,-8 A2,2 0 1,1 8,-8 Z
           M-6,2 C-8,0 -10,2 -10,4 C-10,6 -8,8 -6,8 C-2,8 2,8 6,8
           C8,8 10,6 10,4 C10,2 8,0 6,2 Z
           M-4,4 A1,1 0 1,1 -2,4 A1,1 0 1,1 -4,4 Z
           M4,4 A1,1 0 1,1 6,4 A1,1 0 1,1 4,4 Z
           M-16,-14 C-18,-18 -20,-16 -18,-12 M16,-14 C18,-18 20,-16 18,-12`,
  },
};

// ─── Category Pattern Components ─────────────────────────────────────
function ProtectionPatterns() {
  return (
    <g opacity={0.3} stroke="#B22222" fill="none" strokeWidth={1}>
      {/* Lightning bolts */}
      <path d="M-100,-40 L-90,-20 L-96,-20 L-86,0" strokeWidth={1.5} />
      <path d="M100,-40 L90,-20 L96,-20 L86,0" strokeWidth={1.5} />
      {/* Shield */}
      <path d="M0,-60 L-20,-50 L-20,-30 C-20,-10 0,10 0,10 C0,10 20,-10 20,-30 L20,-50 Z" strokeWidth={0.8} />
      {/* 팔괘 trigrams (simplified) */}
      <g transform="translate(-80,-60)">
        <line x1={-6} y1={0} x2={6} y2={0} strokeWidth={1.5} />
        <line x1={-6} y1={4} x2={-1} y2={4} strokeWidth={1.5} />
        <line x1={1} y1={4} x2={6} y2={4} strokeWidth={1.5} />
        <line x1={-6} y1={8} x2={6} y2={8} strokeWidth={1.5} />
      </g>
      <g transform="translate(80,-60)">
        <line x1={-6} y1={0} x2={-1} y2={0} strokeWidth={1.5} />
        <line x1={1} y1={0} x2={6} y2={0} strokeWidth={1.5} />
        <line x1={-6} y1={4} x2={6} y2={4} strokeWidth={1.5} />
        <line x1={-6} y1={8} x2={-1} y2={8} strokeWidth={1.5} />
        <line x1={1} y1={8} x2={6} y2={8} strokeWidth={1.5} />
      </g>
      <g transform="translate(-80,50)">
        <line x1={-6} y1={0} x2={6} y2={0} strokeWidth={1.5} />
        <line x1={-6} y1={4} x2={6} y2={4} strokeWidth={1.5} />
        <line x1={-6} y1={8} x2={-1} y2={8} strokeWidth={1.5} />
        <line x1={1} y1={8} x2={6} y2={8} strokeWidth={1.5} />
      </g>
      <g transform="translate(80,50)">
        <line x1={-6} y1={0} x2={6} y2={0} strokeWidth={1.5} />
        <line x1={-6} y1={4} x2={-1} y2={4} strokeWidth={1.5} />
        <line x1={1} y1={4} x2={6} y2={4} strokeWidth={1.5} />
        <line x1={-6} y1={8} x2={6} y2={8} strokeWidth={1.5} />
      </g>
    </g>
  );
}

function WealthPatterns() {
  return (
    <g opacity={0.3} stroke="#B22222" fill="none" strokeWidth={1}>
      {/* Coins (circle with square hole) */}
      <g transform="translate(-80,-40)">
        <circle r={12} strokeWidth={1} />
        <rect x={-4} y={-4} width={8} height={8} strokeWidth={0.8} />
      </g>
      <g transform="translate(80,-40)">
        <circle r={12} strokeWidth={1} />
        <rect x={-4} y={-4} width={8} height={8} strokeWidth={0.8} />
      </g>
      {/* Auspicious clouds */}
      <path d="M-100,20 C-96,14 -88,14 -84,18 C-82,12 -74,12 -72,18 C-68,14 -60,16 -60,22 C-60,26 -64,28 -68,28 L-96,28 C-100,28 -104,26 -100,20 Z" strokeWidth={0.8} />
      <path d="M60,20 C64,14 72,14 76,18 C78,12 86,12 88,18 C92,14 100,16 100,22 C100,26 96,28 92,28 L64,28 C60,28 56,26 60,20 Z" strokeWidth={0.8} />
      {/* Fish */}
      <g transform="translate(0,70)">
        <path d="M-12,0 C-8,-8 8,-8 12,0 C8,8 -8,8 -12,0 Z" strokeWidth={0.8} />
        <path d="M12,0 L18,-4 L18,4 Z" strokeWidth={0.8} />
        <circle cx={-4} cy={-1} r={1.5} fill="#B22222" />
      </g>
    </g>
  );
}

function HealthPatterns() {
  return (
    <g opacity={0.3} stroke="#B22222" fill="none" strokeWidth={1}>
      {/* Lotus petals */}
      <g transform="translate(0,70)">
        <path d="M0,-12 C-4,-8 -4,0 0,4 C4,0 4,-8 0,-12 Z" strokeWidth={0.8} />
        <path d="M-10,-6 C-10,-2 -6,4 0,4 C-2,-2 -6,-6 -10,-6 Z" strokeWidth={0.8} />
        <path d="M10,-6 C10,-2 6,4 0,4 C2,-2 6,-6 10,-6 Z" strokeWidth={0.8} />
      </g>
      {/* Mountains */}
      <path d="M-110,60 L-90,30 L-80,40 L-64,20 L-48,50 L-110,50 Z" strokeWidth={0.8} />
      <path d="M48,60 L64,30 L74,40 L90,20 L110,50 L48,50 Z" strokeWidth={0.8} />
      {/* Sun */}
      <g transform="translate(-80,-50)">
        <circle r={8} strokeWidth={1} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1={Math.cos((angle * Math.PI) / 180) * 11}
            y1={Math.sin((angle * Math.PI) / 180) * 11}
            x2={Math.cos((angle * Math.PI) / 180) * 15}
            y2={Math.sin((angle * Math.PI) / 180) * 15}
            strokeWidth={1}
          />
        ))}
      </g>
      {/* Moon */}
      <g transform="translate(80,-50)">
        <path d="M4,-10 A10,10 0 1,0 4,10 A7,7 0 1,1 4,-10 Z" strokeWidth={1} />
      </g>
    </g>
  );
}

function FamilyPatterns() {
  return (
    <g opacity={0.3} stroke="#B22222" fill="none" strokeWidth={1}>
      {/* Intertwined hearts */}
      <g transform="translate(-80,-40)">
        <path d="M0,8 C-4,4 -10,-2 -10,-6 C-10,-10 -6,-12 -2,-10 C0,-8 0,-8 2,-10 C6,-12 10,-10 10,-6 C10,-2 4,4 0,8 Z" strokeWidth={1} />
      </g>
      <g transform="translate(80,-40)">
        <path d="M0,8 C-4,4 -10,-2 -10,-6 C-10,-10 -6,-12 -2,-10 C0,-8 0,-8 2,-10 C6,-12 10,-10 10,-6 C10,-2 4,4 0,8 Z" strokeWidth={1} />
      </g>
      {/* House roof */}
      <g transform="translate(0,70)">
        <path d="M-20,0 L0,-14 L20,0 Z" strokeWidth={1} />
        <rect x={-14} y={0} width={28} height={12} strokeWidth={0.8} />
        <rect x={-4} y={4} width={8} height={8} strokeWidth={0.8} />
      </g>
      {/* Double happiness 囍 simplified */}
      <g transform="translate(-80,50)">
        <rect x={-8} y={-8} width={16} height={16} strokeWidth={0.8} />
        <line x1={0} y1={-8} x2={0} y2={8} strokeWidth={0.6} />
        <line x1={-8} y1={0} x2={8} y2={0} strokeWidth={0.6} />
      </g>
      <g transform="translate(80,50)">
        <rect x={-8} y={-8} width={16} height={16} strokeWidth={0.8} />
        <line x1={0} y1={-8} x2={0} y2={8} strokeWidth={0.6} />
        <line x1={-8} y1={0} x2={8} y2={0} strokeWidth={0.6} />
      </g>
    </g>
  );
}

function StudyPatterns() {
  return (
    <g opacity={0.3} stroke="#B22222" fill="none" strokeWidth={1}>
      {/* 북두칠성 (Big Dipper) */}
      <g transform="translate(0,-60)">
        {[
          [-30, -5],
          [-18, -8],
          [-6, -4],
          [6, -6],
          [16, 0],
          [26, 4],
          [22, 12],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={2} fill="#B22222" opacity={0.4} />
            {i > 0 && (
              <line
                x1={[[-30, -5], [-18, -8], [-6, -4], [6, -6], [16, 0], [26, 4], [22, 12]][i - 1][0]}
                y1={[[-30, -5], [-18, -8], [-6, -4], [6, -6], [16, 0], [26, 4], [22, 12]][i - 1][1]}
                x2={cx}
                y2={cy}
                strokeWidth={0.6}
                strokeDasharray="2,2"
              />
            )}
          </g>
        ))}
      </g>
      {/* Books */}
      <g transform="translate(-80,40)">
        <rect x={-8} y={-12} width={4} height={24} strokeWidth={0.8} />
        <rect x={-3} y={-14} width={4} height={28} strokeWidth={0.8} />
        <rect x={2} y={-10} width={4} height={20} strokeWidth={0.8} />
      </g>
      {/* Carp jumping (잉어) */}
      <g transform="translate(80,40)">
        <path d="M0,-14 C6,-10 8,-4 6,0 C4,4 0,6 -4,4 C-8,2 -8,-4 -6,-8 C-4,-12 -2,-14 0,-14 Z" strokeWidth={0.8} />
        <path d="M6,0 L10,4 L10,-2 Z" strokeWidth={0.8} />
        <path d="M-4,-16 C-2,-20 2,-20 4,-16" strokeWidth={0.6} />
        <path d="M-6,-18 C-2,-24 2,-24 6,-18" strokeWidth={0.6} />
      </g>
    </g>
  );
}

function DefaultPatterns() {
  return (
    <g opacity={0.3} stroke="#B22222" fill="none" strokeWidth={1}>
      {/* Yin-Yang */}
      <g transform="translate(0,70)">
        <circle r={14} strokeWidth={1} />
        <path d="M0,-14 A7,7 0 0,1 0,0 A7,7 0 0,0 0,14 A14,14 0 0,1 0,-14 Z" fill="#B22222" opacity={0.3} />
        <circle cx={0} cy={-7} r={2} fill="#B22222" opacity={0.3} />
        <circle cx={0} cy={7} r={2} stroke="#B22222" strokeWidth={0.8} />
      </g>
      {/* Decorative swirls */}
      <path d="M-90,-40 C-86,-44 -80,-44 -76,-40 C-72,-36 -72,-30 -76,-26" strokeWidth={0.8} />
      <path d="M90,-40 C86,-44 80,-44 76,-40 C72,-36 72,-30 76,-26" strokeWidth={0.8} />
      <path d="M-90,40 C-86,44 -80,44 -76,40 C-72,36 -72,30 -76,26" strokeWidth={0.8} />
      <path d="M90,40 C86,44 80,44 76,40 C72,36 72,30 76,26" strokeWidth={0.8} />
    </g>
  );
}

function getCategoryPatterns(category: string) {
  switch (category) {
    case '수호':
    case 'protection':
      return <ProtectionPatterns />;
    case '재물':
    case 'wealth':
      return <WealthPatterns />;
    case '건강':
    case 'health':
      return <HealthPatterns />;
    case '가정':
    case 'family':
      return <FamilyPatterns />;
    case '학업':
    case 'study':
      return <StudyPatterns />;
    default:
      return <DefaultPatterns />;
  }
}

// ─── Modern style gradient by category ───────────────────────────────
function getModernGradient(category: string): [string, string] {
  switch (category) {
    case '수호':
    case 'protection':
      return ['#2D1B69', '#1E3A5F'];
    case '재물':
    case 'wealth':
      return ['#5C4033', '#B8860B'];
    case '건강':
    case 'health':
      return ['#1B5E20', '#00695C'];
    case '가정':
    case 'family':
      return ['#880E4F', '#AD1457'];
    case '학업':
    case 'study':
      return ['#1A237E', '#283593'];
    default:
      return ['#1A1A2E', '#4A148C'];
  }
}

// ─── Modern Category Patterns ────────────────────────────────────────
function ModernPatterns({ category }: { category: string }) {
  return (
    <g opacity={0.08} stroke="white" fill="none" strokeWidth={0.5}>
      {/* Concentric circles */}
      <circle cx={150} cy={250} r={80} />
      <circle cx={150} cy={250} r={100} />
      <circle cx={150} cy={250} r={120} />
      <circle cx={150} cy={250} r={140} />
      {/* Horizontal accent lines */}
      <line x1={30} y1={130} x2={120} y2={130} strokeWidth={0.3} />
      <line x1={180} y1={130} x2={270} y2={130} strokeWidth={0.3} />
      <line x1={30} y1={370} x2={120} y2={370} strokeWidth={0.3} />
      <line x1={180} y1={370} x2={270} y2={370} strokeWidth={0.3} />
      {/* Corner dots */}
      {[
        [30, 30],
        [270, 30],
        [30, 470],
        [270, 470],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2} fill="white" opacity={0.15} />
      ))}
      {/* Diamond pattern */}
      <rect
        x={110}
        y={210}
        width={80}
        height={80}
        transform="rotate(45 150 250)"
        strokeWidth={0.3}
      />
    </g>
  );
}

// ─── Wrap text into lines ────────────────────────────────────────────
function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      lines.push(remaining);
      break;
    }
    let breakPoint = remaining.lastIndexOf(' ', maxChars);
    if (breakPoint <= 0) breakPoint = maxChars;
    lines.push(remaining.substring(0, breakPoint));
    remaining = remaining.substring(breakPoint).trimStart();
  }
  return lines;
}

// ─── SVG Filters ─────────────────────────────────────────────────────
function TraditionalFilters() {
  return (
    <defs>
      {/* Paper texture */}
      <filter id="paperTexture" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.04"
          numOctaves={5}
          seed={2}
          result="noise"
        />
        <feDiffuseLighting
          in="noise"
          lightingColor="#F5E6B8"
          surfaceScale={1.5}
          result="light"
        >
          <feDistantLight azimuth={45} elevation={55} />
        </feDiffuseLighting>
        <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1={0.8} k2={0.3} k3={0.1} k4={0} />
      </filter>
      {/* Brush stroke roughness */}
      <filter id="brushStroke" x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves={3} seed={5} result="turbulence" />
        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale={1.5} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      {/* Ink bleed */}
      <filter id="inkBleed" x="-1%" y="-1%" width="102%" height="102%">
        <feMorphology operator="dilate" radius={0.3} />
        <feGaussianBlur stdDeviation={0.2} />
      </filter>
      {/* Subtle grain overlay */}
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={3} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feBlend in="SourceGraphic" mode="multiply" />
      </filter>
    </defs>
  );
}

function ModernFilters() {
  return (
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation={3} result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation={4} />
        <feOffset dx={0} dy={2} />
        <feComposite in="SourceGraphic" />
      </filter>
    </defs>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  TRADITIONAL STYLE TALISMAN
// ═══════════════════════════════════════════════════════════════════════
function TraditionalTalisman({
  title,
  message,
  mantra,
  userName,
  animal,
  category,
}: Omit<TalismanSVGProps, 'type' | 'style' | 'width' | 'height'>) {
  const animalData = ANIMAL_PATHS[animal] || ANIMAL_PATHS['용'];
  const messageLines = wrapText(message, 12);

  return (
    <g>
      <TraditionalFilters />

      {/* ── Background: yellow paper with texture ── */}
      <rect x={0} y={0} width={300} height={500} fill="#F5E6B8" />
      {/* Subtle grain overlay */}
      <rect x={0} y={0} width={300} height={500} fill="#F5E6B8" filter="url(#paperTexture)" opacity={0.5} />

      {/* ── Decorative Red Border ── */}
      {/* Outer border */}
      <rect
        x={8}
        y={8}
        width={284}
        height={484}
        fill="none"
        stroke="#B22222"
        strokeWidth={3}
        rx={2}
      />
      {/* Inner border */}
      <rect
        x={16}
        y={16}
        width={268}
        height={468}
        fill="none"
        stroke="#B22222"
        strokeWidth={1}
        rx={1}
      />
      {/* Decorative line between borders */}
      <rect
        x={12}
        y={12}
        width={276}
        height={476}
        fill="none"
        stroke="#B22222"
        strokeWidth={0.5}
        strokeDasharray="4,3"
        rx={1}
      />

      {/* ── Corner Ornaments ── */}
      {/* Top-left */}
      <g transform="translate(20,20)">
        <path d="M0,20 L0,0 L20,0" fill="none" stroke="#B22222" strokeWidth={2} />
        <path d="M4,16 C4,8 8,4 16,4" fill="none" stroke="#B22222" strokeWidth={1.2} />
        <circle cx={3} cy={3} r={2} fill="#B22222" />
      </g>
      {/* Top-right */}
      <g transform="translate(280,20) scale(-1,1)">
        <path d="M0,20 L0,0 L20,0" fill="none" stroke="#B22222" strokeWidth={2} />
        <path d="M4,16 C4,8 8,4 16,4" fill="none" stroke="#B22222" strokeWidth={1.2} />
        <circle cx={3} cy={3} r={2} fill="#B22222" />
      </g>
      {/* Bottom-left */}
      <g transform="translate(20,480) scale(1,-1)">
        <path d="M0,20 L0,0 L20,0" fill="none" stroke="#B22222" strokeWidth={2} />
        <path d="M4,16 C4,8 8,4 16,4" fill="none" stroke="#B22222" strokeWidth={1.2} />
        <circle cx={3} cy={3} r={2} fill="#B22222" />
      </g>
      {/* Bottom-right */}
      <g transform="translate(280,480) scale(-1,-1)">
        <path d="M0,20 L0,0 L20,0" fill="none" stroke="#B22222" strokeWidth={2} />
        <path d="M4,16 C4,8 8,4 16,4" fill="none" stroke="#B22222" strokeWidth={1.2} />
        <circle cx={3} cy={3} r={2} fill="#B22222" />
      </g>

      {/* ── 두전 (Top Section): Title ── */}
      <line x1={40} y1={78} x2={260} y2={78} stroke="#B22222" strokeWidth={1.5} />
      <text
        x={150}
        y={58}
        textAnchor="middle"
        fill="#B22222"
        fontSize={22}
        fontWeight="bold"
        fontFamily="serif, 'Noto Serif KR', '바탕', Batang"
        filter="url(#inkBleed)"
      >
        {title}
      </text>

      {/* ── Horizontal divider with decorative dots ── */}
      <circle cx={130} cy={85} r={2} fill="#B22222" />
      <circle cx={150} cy={85} r={2} fill="#B22222" />
      <circle cx={170} cy={85} r={2} fill="#B22222" />

      {/* ── 주신 (Middle Section) ── */}
      {/* Category patterns behind the animal */}
      <g transform="translate(150, 220)">
        {getCategoryPatterns(category)}
      </g>

      {/* Decorative circle around animal */}
      <circle
        cx={150}
        cy={215}
        r={55}
        fill="none"
        stroke="#B22222"
        strokeWidth={1}
        strokeDasharray="6,3"
        opacity={0.5}
      />
      <circle
        cx={150}
        cy={215}
        r={48}
        fill="none"
        stroke="#B22222"
        strokeWidth={0.5}
        opacity={0.3}
      />

      {/* Central animal symbol */}
      <g transform="translate(150, 215) scale(1.8)" filter="url(#brushStroke)">
        <path
          d={animalData.path}
          fill="#B22222"
          stroke="#8B0000"
          strokeWidth={0.5}
          opacity={0.85}
        />
      </g>

      {/* Animal label */}
      <text
        x={150}
        y={275}
        textAnchor="middle"
        fill="#8B0000"
        fontSize={11}
        fontFamily="serif, 'Noto Serif KR', '바탕', Batang"
        opacity={0.7}
      >
        {animalData.label}
      </text>

      {/* ── Message text ── */}
      <g>
        {messageLines.map((line, i) => (
          <text
            key={i}
            x={150}
            y={300 + i * 20}
            textAnchor="middle"
            fill="#4A2C2A"
            fontSize={13}
            fontFamily="serif, 'Noto Serif KR', '바탕', Batang"
          >
            {line}
          </text>
        ))}
      </g>

      {/* ── Divider before mantra ── */}
      <line
        x1={60}
        y1={300 + messageLines.length * 20 + 8}
        x2={240}
        y2={300 + messageLines.length * 20 + 8}
        stroke="#B22222"
        strokeWidth={0.8}
        opacity={0.5}
      />

      {/* ── 각획 (Bottom Section): Mantra ── */}
      <text
        x={150}
        y={390}
        textAnchor="middle"
        fill="#B22222"
        fontSize={12}
        fontWeight="bold"
        fontFamily="serif, 'Noto Serif KR', '바탕', Batang"
        filter="url(#inkBleed)"
      >
        {mantra.length > 16 ? mantra.substring(0, 16) : mantra}
      </text>
      {mantra.length > 16 && (
        <text
          x={150}
          y={408}
          textAnchor="middle"
          fill="#B22222"
          fontSize={12}
          fontWeight="bold"
          fontFamily="serif, 'Noto Serif KR', '바탕', Batang"
          filter="url(#inkBleed)"
        >
          {mantra.substring(16, 32)}
        </text>
      )}

      {/* ── Brush stroke decorative element ── */}
      <path
        d="M60,425 C80,420 120,430 150,422 C180,414 220,428 240,425"
        fill="none"
        stroke="#B22222"
        strokeWidth={1}
        opacity={0.3}
      />

      {/* ── 인장 (Seal): Red square seal with user name ── */}
      <g transform="translate(240, 440)">
        {/* Outer seal border */}
        <rect
          x={-20}
          y={-20}
          width={40}
          height={40}
          fill="#C41E3A"
          stroke="#8B0000"
          strokeWidth={1.5}
          rx={2}
          opacity={0.85}
        />
        {/* Inner border */}
        <rect
          x={-16}
          y={-16}
          width={32}
          height={32}
          fill="none"
          stroke="#F5E6B8"
          strokeWidth={0.8}
          rx={1}
        />
        {/* User name in seal */}
        <text
          x={0}
          y={userName.length <= 2 ? 6 : 2}
          textAnchor="middle"
          fill="#F5E6B8"
          fontSize={userName.length <= 2 ? 16 : userName.length <= 3 ? 13 : 10}
          fontWeight="bold"
          fontFamily="serif, 'Noto Serif KR', '바탕', Batang"
        >
          {userName.length <= 4 ? userName : userName.substring(0, 4)}
        </text>
        {userName.length > 4 && (
          <text
            x={0}
            y={14}
            textAnchor="middle"
            fill="#F5E6B8"
            fontSize={10}
            fontWeight="bold"
            fontFamily="serif, 'Noto Serif KR', '바탕', Batang"
          >
            {userName.substring(4, 8)}
          </text>
        )}
        {/* 印 character small */}
        <text
          x={14}
          y={18}
          textAnchor="middle"
          fill="#F5E6B8"
          fontSize={6}
          fontFamily="serif"
          opacity={0.7}
        >
          印
        </text>
      </g>

      {/* ── Date at bottom ── */}
      <text
        x={50}
        y={462}
        textAnchor="start"
        fill="#8B0000"
        fontSize={8}
        fontFamily="serif, 'Noto Serif KR', '바탕', Batang"
        opacity={0.5}
      >
        {new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </text>
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  MODERN STYLE TALISMAN
// ═══════════════════════════════════════════════════════════════════════
function ModernTalisman({
  title,
  message,
  mantra,
  userName,
  animal,
  category,
}: Omit<TalismanSVGProps, 'type' | 'style' | 'width' | 'height'>) {
  const animalData = ANIMAL_PATHS[animal] || ANIMAL_PATHS['용'];
  const [gradStart, gradEnd] = getModernGradient(category);
  const messageLines = wrapText(message, 14);

  return (
    <g>
      <ModernFilters />
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradStart} />
          <stop offset="100%" stopColor={gradEnd} />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
        <radialGradient id="glowGrad" cx="50%" cy="45%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity={0.08} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* ── Background ── */}
      <rect x={0} y={0} width={300} height={500} rx={16} fill="url(#bgGrad)" />

      {/* ── Glow circle behind animal ── */}
      <circle cx={150} cy={220} r={120} fill="url(#glowGrad)" />

      {/* ── Geometric patterns ── */}
      <ModernPatterns category={category} />

      {/* ── Top thin gold line ── */}
      <line x1={50} y1={38} x2={250} y2={38} stroke="url(#goldGrad)" strokeWidth={0.8} opacity={0.5} />

      {/* ── Title ── */}
      <text
        x={150}
        y={70}
        textAnchor="middle"
        fill="white"
        fontSize={20}
        fontWeight={300}
        fontFamily="'Pretendard', 'Apple SD Gothic Neo', sans-serif"
        letterSpacing={6}
        opacity={0.9}
      >
        {title}
      </text>

      {/* ── Subtitle / category ── */}
      <text
        x={150}
        y={92}
        textAnchor="middle"
        fill="url(#goldGrad)"
        fontSize={10}
        fontFamily="'Pretendard', 'Apple SD Gothic Neo', sans-serif"
        letterSpacing={3}
        opacity={0.7}
      >
        {category.toUpperCase()}
      </text>

      {/* ── Divider line ── */}
      <line x1={100} y1={105} x2={200} y2={105} stroke="white" strokeWidth={0.3} opacity={0.3} />

      {/* ── Central animal icon (white/gold line-art) ── */}
      <g transform="translate(150, 210) scale(2.2)" filter="url(#glow)">
        <path
          d={animalData.path}
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
      </g>

      {/* Animal label */}
      <text
        x={150}
        y={278}
        textAnchor="middle"
        fill="white"
        fontSize={10}
        fontFamily="'Pretendard', 'Apple SD Gothic Neo', sans-serif"
        opacity={0.4}
        letterSpacing={2}
      >
        {animalData.label}
      </text>

      {/* ── Message ── */}
      <g>
        {messageLines.map((line, i) => (
          <text
            key={i}
            x={150}
            y={310 + i * 22}
            textAnchor="middle"
            fill="white"
            fontSize={14}
            fontFamily="'Pretendard', 'Apple SD Gothic Neo', sans-serif"
            fontWeight={300}
            opacity={0.85}
          >
            {line}
          </text>
        ))}
      </g>

      {/* ── Mantra ── */}
      <text
        x={150}
        y={395}
        textAnchor="middle"
        fill="url(#goldGrad)"
        fontSize={11}
        fontFamily="'Pretendard', 'Apple SD Gothic Neo', sans-serif"
        letterSpacing={1}
        opacity={0.8}
      >
        {mantra.length > 20 ? mantra.substring(0, 20) + '…' : mantra}
      </text>

      {/* ── Bottom divider ── */}
      <line x1={100} y1={415} x2={200} y2={415} stroke="white" strokeWidth={0.3} opacity={0.3} />

      {/* ── Modern circular seal ── */}
      <g transform="translate(150, 450)">
        <circle
          r={20}
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={1.2}
          opacity={0.7}
        />
        <circle
          r={16}
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={0.4}
          opacity={0.5}
        />
        <text
          x={0}
          y={userName.length <= 2 ? 5 : 3}
          textAnchor="middle"
          fill="url(#goldGrad)"
          fontSize={userName.length <= 2 ? 14 : userName.length <= 3 ? 11 : 9}
          fontWeight={500}
          fontFamily="'Pretendard', 'Apple SD Gothic Neo', sans-serif"
          opacity={0.9}
        >
          {userName.length <= 4 ? userName : userName.substring(0, 4)}
        </text>
      </g>

      {/* ── Date ── */}
      <text
        x={150}
        y={488}
        textAnchor="middle"
        fill="white"
        fontSize={8}
        fontFamily="'Pretendard', 'Apple SD Gothic Neo', sans-serif"
        opacity={0.3}
      >
        {new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </text>
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
const TalismanSVG = React.forwardRef<SVGSVGElement, TalismanSVGProps>(
  function TalismanSVG(
    {
      type,
      style,
      title,
      message,
      mantra,
      userName,
      animal,
      category,
      width,
      height,
    },
    ref
  ) {
    const svgWidth = width ?? 300;
    const svgHeight = height ?? 500;

    const childProps = { title, message, mantra, userName, animal, category };

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 300 500"
        width={svgWidth}
        height={svgHeight}
        role="img"
        aria-label={`${title} 부적`}
        style={{ userSelect: 'none' }}
      >
        {style === 'traditional' ? (
          <TraditionalTalisman {...childProps} />
        ) : (
          <ModernTalisman {...childProps} />
        )}
      </svg>
    );
  }
);

export default TalismanSVG;

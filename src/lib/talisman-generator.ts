// ============================================================
// 부적 SVG 생성기
// 전통/현대 스타일 부적 SVG 마크업 생성
// ============================================================

/** 부적 생성 매개변수 */
export interface TalismanParams {
  type: string; // TalismanType.id
  style: 'traditional' | 'modern';
  bgColor?: string;
  animal?: string; // 띠 동물 이름
  title: string; // 두전(상단 제목)
  message: string; // 사용자 메시지
  mantra: string; // 주문(하단)
  userName?: string; // 인장 이름
  symbols?: string[]; // 사용할 심볼 목록
}

// ─── 색상 팔레트 ────────────────────────────────────────────

const TRADITIONAL = {
  bg: '#F5E6B8', // 황지(黃紙)
  ink: '#B22222', // 주사(朱砂)
  black: '#2B1810', // 먹(墨)
  gold: '#C8A000',
  border: '#8B4513',
};

const MODERN_PALETTES = [
  { bg1: '#E8D5F5', bg2: '#F5D5E8', ink: '#6B3FA0', accent: '#D46FA0' },
  { bg1: '#D5EEF5', bg2: '#D5F5E8', ink: '#2B7A8A', accent: '#3AAA7A' },
  { bg1: '#F5EAD5', bg2: '#F5D5D5', ink: '#AA6B3F', accent: '#D46F4F' },
  { bg1: '#D5D5F5', bg2: '#E8D5F5', ink: '#4F4FAA', accent: '#7A5FD4' },
  { bg1: '#F5F5D5', bg2: '#E8F5D5', ink: '#6B8A2B', accent: '#8AAA3F' },
];

// ─── SVG 헬퍼 ───────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    current += char;
    if (current.length >= maxCharsPerLine) {
      lines.push(current);
      current = '';
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ─── 동물 심볼 SVG 패스 ────────────────────────────────────

const ANIMAL_PATHS: Record<string, string> = {
  쥐: `<g transform="translate(-20,-20) scale(0.8)">
    <circle cx="25" cy="15" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="25" cy="35" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="15" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="35" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="25" y1="50" x2="30" y2="65" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="22" cy="13" r="1.5" fill="currentColor"/>
    <circle cx="28" cy="13" r="1.5" fill="currentColor"/>
  </g>`,
  소: `<g transform="translate(-20,-20) scale(0.8)">
    <ellipse cx="25" cy="35" rx="18" ry="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="25" cy="18" rx="12" ry="10" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M13 12 L8 4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M37 12 L42 4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="20" cy="16" r="2" fill="currentColor"/>
    <circle cx="30" cy="16" r="2" fill="currentColor"/>
    <ellipse cx="25" cy="23" rx="5" ry="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>`,
  호랑이: `<g transform="translate(-20,-20) scale(0.8)">
    <ellipse cx="25" cy="25" rx="18" ry="20" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M10 8 L14 18" stroke="currentColor" stroke-width="2"/>
    <path d="M40 8 L36 18" stroke="currentColor" stroke-width="2"/>
    <circle cx="18" cy="22" r="2.5" fill="currentColor"/>
    <circle cx="32" cy="22" r="2.5" fill="currentColor"/>
    <path d="M22 30 L25 33 L28 30" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M15 28 L8 30" stroke="currentColor" stroke-width="1.5"/>
    <path d="M35 28 L42 30" stroke="currentColor" stroke-width="1.5"/>
    <path d="M15 32 L8 34" stroke="currentColor" stroke-width="1.5"/>
    <path d="M35 32 L42 34" stroke="currentColor" stroke-width="1.5"/>
    <path d="M20 15 L17 12 L23 14" stroke="currentColor" stroke-width="1" fill="none"/>
    <path d="M30 15 L33 12 L27 14" stroke="currentColor" stroke-width="1" fill="none"/>
  </g>`,
  토끼: `<g transform="translate(-20,-20) scale(0.8)">
    <ellipse cx="25" cy="35" rx="14" ry="12" fill="none" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="25" cy="20" rx="10" ry="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="18" cy="6" rx="4" ry="12" fill="none" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="32" cy="6" rx="4" ry="12" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="21" cy="18" r="2" fill="currentColor"/>
    <circle cx="29" cy="18" r="2" fill="currentColor"/>
    <path d="M23 23 L25 25 L27 23" stroke="currentColor" stroke-width="1.5" fill="none"/>
  </g>`,
  용: `<g transform="translate(-20,-25) scale(0.8)">
    <path d="M25 10 C35 8 40 15 38 25 C36 35 28 40 20 38 C12 36 8 28 12 20" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <path d="M12 20 C8 15 12 8 20 10" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="22" cy="15" r="2" fill="currentColor"/>
    <circle cx="30" cy="14" r="2" fill="currentColor"/>
    <path d="M38 25 L44 22 L42 28 L48 26" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M18 12 L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M28 10 L30 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 20 L20 23 L24 22 L26 25" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M15 32 C12 36 14 42 20 38" stroke="currentColor" stroke-width="1" fill="none" stroke-dasharray="2,2"/>
  </g>`,
  뱀: `<g transform="translate(-20,-20) scale(0.8)">
    <path d="M10 40 C10 30 20 20 25 15 C30 10 35 15 30 22 C25 29 15 25 20 35 C25 45 40 40 40 30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="25" cy="13" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="23" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="27" cy="12" r="1.5" fill="currentColor"/>
    <path d="M24 16 L25 18 L26 16" stroke="currentColor" stroke-width="1" fill="none"/>
  </g>`,
  말: `<g transform="translate(-20,-22) scale(0.8)">
    <ellipse cx="25" cy="32" rx="15" ry="12" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M15 25 L12 10 C12 6 18 6 18 12 L20 22" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="15" cy="11" r="2" fill="currentColor"/>
    <path d="M10 8 L6 3" stroke="currentColor" stroke-width="1.5"/>
    <path d="M16 7 L14 2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M14 15 Q12 18 15 18" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <line x1="15" y1="44" x2="13" y2="55" stroke="currentColor" stroke-width="2"/>
    <line x1="35" y1="44" x2="37" y2="55" stroke="currentColor" stroke-width="2"/>
  </g>`,
  양: `<g transform="translate(-20,-20) scale(0.8)">
    <circle cx="25" cy="28" r="16" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="25" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M17 8 C14 2 10 4 12 8" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M33 8 C36 2 40 4 38 8" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="22" cy="11" r="1.5" fill="currentColor"/>
    <circle cx="28" cy="11" r="1.5" fill="currentColor"/>
    <path d="M12 30 Q8 28 10 32 Q12 36 8 34" stroke="currentColor" stroke-width="1" fill="none"/>
    <path d="M38 30 Q42 28 40 32 Q38 36 42 34" stroke="currentColor" stroke-width="1" fill="none"/>
    <line x1="18" y1="44" x2="16" y2="52" stroke="currentColor" stroke-width="2"/>
    <line x1="32" y1="44" x2="34" y2="52" stroke="currentColor" stroke-width="2"/>
  </g>`,
  원숭이: `<g transform="translate(-20,-20) scale(0.8)">
    <circle cx="25" cy="22" r="14" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="25" cy="24" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="12" cy="18" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="38" cy="18" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="21" cy="20" r="2" fill="currentColor"/>
    <circle cx="29" cy="20" r="2" fill="currentColor"/>
    <ellipse cx="25" cy="28" rx="3" ry="2" fill="none" stroke="currentColor" stroke-width="1"/>
    <path d="M25 36 C28 42 35 45 40 42" stroke="currentColor" stroke-width="2" fill="none"/>
  </g>`,
  닭: `<g transform="translate(-20,-20) scale(0.8)">
    <ellipse cx="25" cy="32" rx="13" ry="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="25" cy="14" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M25 6 L23 2 L25 4 L27 2 Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="22" cy="13" r="1.5" fill="currentColor"/>
    <circle cx="28" cy="13" r="1.5" fill="currentColor"/>
    <path d="M25 18 L28 20 L25 19" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M38 30 L44 28 L42 32 L48 30" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <line x1="20" y1="47" x2="17" y2="54" stroke="currentColor" stroke-width="2"/>
    <line x1="30" y1="47" x2="33" y2="54" stroke="currentColor" stroke-width="2"/>
  </g>`,
  개: `<g transform="translate(-20,-20) scale(0.8)">
    <ellipse cx="25" cy="32" rx="14" ry="13" fill="none" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="25" cy="16" rx="10" ry="9" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M15 12 L8 5 L12 15" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M35 12 L42 5 L38 15" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="21" cy="15" r="2" fill="currentColor"/>
    <circle cx="29" cy="15" r="2" fill="currentColor"/>
    <ellipse cx="25" cy="20" rx="4" ry="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path d="M38 38 C42 36 44 40 40 42" stroke="currentColor" stroke-width="2" fill="none"/>
  </g>`,
  돼지: `<g transform="translate(-20,-20) scale(0.8)">
    <ellipse cx="25" cy="28" rx="18" ry="16" fill="none" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="25" cy="30" rx="8" ry="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="22" cy="28" r="1.5" fill="currentColor"/>
    <circle cx="28" cy="28" r="1.5" fill="currentColor"/>
    <circle cx="18" cy="20" r="2.5" fill="currentColor"/>
    <circle cx="32" cy="20" r="2.5" fill="currentColor"/>
    <path d="M14 14 L10 8" stroke="currentColor" stroke-width="2"/>
    <path d="M36 14 L40 8" stroke="currentColor" stroke-width="2"/>
    <path d="M38 38 Q42 40 40 44 Q38 42 36 44" stroke="currentColor" stroke-width="2" fill="none"/>
  </g>`,
};

// ─── 패턴 심볼 SVG ──────────────────────────────────────────

function svgCloud(x: number, y: number, scale: number, color: string): string {
  return `<g transform="translate(${x},${y}) scale(${scale})" opacity="0.6">
    <circle cx="0" cy="0" r="8" fill="none" stroke="${color}" stroke-width="1.5"/>
    <circle cx="10" cy="-3" r="6" fill="none" stroke="${color}" stroke-width="1.5"/>
    <circle cx="-8" cy="2" r="5" fill="none" stroke="${color}" stroke-width="1.5"/>
    <circle cx="5" cy="4" r="7" fill="none" stroke="${color}" stroke-width="1.5"/>
  </g>`;
}

function svgWave(x: number, y: number, w: number, color: string): string {
  return `<path d="M${x} ${y} Q${x + w * 0.25} ${y - 8} ${x + w * 0.5} ${y} Q${x + w * 0.75} ${y + 8} ${x + w} ${y}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.5"/>`;
}

function svgLotus(x: number, y: number, scale: number, color: string): string {
  return `<g transform="translate(${x},${y}) scale(${scale})" opacity="0.7">
    <ellipse cx="0" cy="-5" rx="4" ry="10" fill="none" stroke="${color}" stroke-width="1.5"/>
    <ellipse cx="-7" cy="-3" rx="4" ry="9" fill="none" stroke="${color}" stroke-width="1.5" transform="rotate(-25,-7,-3)"/>
    <ellipse cx="7" cy="-3" rx="4" ry="9" fill="none" stroke="${color}" stroke-width="1.5" transform="rotate(25,7,-3)"/>
    <ellipse cx="-12" cy="0" rx="3" ry="7" fill="none" stroke="${color}" stroke-width="1.5" transform="rotate(-45,-12,0)"/>
    <ellipse cx="12" cy="0" rx="3" ry="7" fill="none" stroke="${color}" stroke-width="1.5" transform="rotate(45,12,0)"/>
  </g>`;
}

function svgLightning(x: number, y: number, scale: number, color: string): string {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <path d="M5 0 L0 15 L8 12 L3 28" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

function svgYinYang(x: number, y: number, r: number, color: string): string {
  return `<g transform="translate(${x},${y})">
    <circle cx="0" cy="0" r="${r}" fill="none" stroke="${color}" stroke-width="1.5"/>
    <path d="M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${r / 2} ${r / 2} 0 0 0 0 0 A${r / 2} ${r / 2} 0 0 1 0 ${-r}" fill="${color}" opacity="0.3"/>
    <circle cx="0" cy="${-r / 2}" r="${r / 5}" fill="${color}"/>
    <circle cx="0" cy="${r / 2}" r="${r / 5}" fill="none" stroke="${color}" stroke-width="1"/>
  </g>`;
}

function svgStar(x: number, y: number, r: number, color: string): string {
  const points: string[] = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (Math.PI / 2) + (i * 2 * Math.PI / 5);
    const innerAngle = outerAngle + Math.PI / 5;
    points.push(`${x + r * Math.cos(outerAngle)},${y - r * Math.sin(outerAngle)}`);
    points.push(`${x + (r * 0.4) * Math.cos(innerAngle)},${y - (r * 0.4) * Math.sin(innerAngle)}`);
  }
  return `<polygon points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.6"/>`;
}

// ─── 전통 테두리 ────────────────────────────────────────────

function traditionalBorder(w: number, h: number): string {
  const m = 12; // 여백
  const ink = TRADITIONAL.ink;
  return `
    <rect x="${m}" y="${m}" width="${w - m * 2}" height="${h - m * 2}" fill="none" stroke="${ink}" stroke-width="3"/>
    <rect x="${m + 6}" y="${m + 6}" width="${w - m * 2 - 12}" height="${h - m * 2 - 12}" fill="none" stroke="${ink}" stroke-width="1.5"/>
    <!-- 모서리 장식 -->
    <circle cx="${m + 6}" cy="${m + 6}" r="3" fill="${ink}"/>
    <circle cx="${w - m - 6}" cy="${m + 6}" r="3" fill="${ink}"/>
    <circle cx="${m + 6}" cy="${h - m - 6}" r="3" fill="${ink}"/>
    <circle cx="${w - m - 6}" cy="${h - m - 6}" r="3" fill="${ink}"/>
  `;
}

// ─── 현대 테두리 ────────────────────────────────────────────

function modernBorder(w: number, h: number, color: string): string {
  const m = 16;
  const r = 20;
  return `
    <rect x="${m}" y="${m}" width="${w - m * 2}" height="${h - m * 2}" rx="${r}" ry="${r}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
  `;
}

// ─── 인장 (도장) 생성 ───────────────────────────────────────

function sealStamp(x: number, y: number, name: string, color: string): string {
  const displayName = name.length > 3 ? name.slice(0, 3) : name;
  const size = 28;
  return `
    <g transform="translate(${x},${y})" opacity="0.85">
      <rect x="${-size / 2}" y="${-size / 2}" width="${size}" height="${size}" rx="3" fill="none" stroke="${color}" stroke-width="2"/>
      <text x="0" y="3" text-anchor="middle" font-size="12" font-weight="bold" fill="${color}" font-family="serif">${escapeXml(displayName)}</text>
    </g>
  `;
}

// ─── 메인 생성 함수 ─────────────────────────────────────────

/**
 * 부적 SVG 마크업 생성
 */
export function generateTalismanSVG(params: TalismanParams): string {
  const {
    style,
    bgColor,
    animal,
    title,
    message,
    mantra,
    userName,
    symbols,
  } = params;

  const W = 360;
  const H = 560;

  if (style === 'traditional') {
    return generateTraditional(W, H, bgColor, animal, title, message, mantra, userName, symbols);
  } else {
    return generateModern(W, H, bgColor, animal, title, message, mantra, userName, symbols);
  }
}

function generateTraditional(
  W: number, H: number,
  bgColor: string | undefined,
  animal: string | undefined,
  title: string,
  message: string,
  mantra: string,
  userName: string | undefined,
  symbols: string[] | undefined
): string {
  const bg = bgColor || TRADITIONAL.bg;
  const ink = TRADITIONAL.ink;
  const black = TRADITIONAL.black;

  // 패턴 장식 배치
  let decorations = '';

  // 구름 장식 (좌우 상단)
  decorations += svgCloud(50, 80, 0.8, ink);
  decorations += svgCloud(W - 50, 80, 0.8, ink);

  // 심볼에 따른 추가 장식
  if (symbols?.includes('물결') || symbols?.includes('파도')) {
    decorations += svgWave(40, H - 120, W - 80, ink);
  }
  if (symbols?.includes('연꽃')) {
    decorations += svgLotus(W / 2, H - 150, 1, ink);
  }
  if (symbols?.includes('뇌전') || symbols?.includes('번개')) {
    decorations += svgLightning(55, 130, 1, ink);
    decorations += svgLightning(W - 70, 130, 1, ink);
  }
  if (symbols?.includes('태극')) {
    decorations += svgYinYang(W / 2, H / 2 + 10, 20, ink);
  }
  if (symbols?.includes('별')) {
    decorations += svgStar(60, 150, 8, ink);
    decorations += svgStar(W - 60, 150, 8, ink);
  }

  // 동물 심볼
  let animalSvg = '';
  if (animal && ANIMAL_PATHS[animal]) {
    animalSvg = `<g transform="translate(${W / 2}, ${H / 2 - 20})" color="${ink}">${ANIMAL_PATHS[animal]}</g>`;
  }

  // 메시지 텍스트 (세로쓰기를 흉내내기 위해 한 글자씩 세로 배치)
  const messageLines = wrapText(message, 8);
  let messageText = '';
  const colCount = Math.min(messageLines.length, 3);
  for (let col = 0; col < colCount; col++) {
    const line = messageLines[col];
    const xPos = W / 2 + (colCount > 1 ? (colCount / 2 - col - 0.5) * 28 : 0);
    for (let i = 0; i < line.length; i++) {
      messageText += `<text x="${xPos}" y="${260 + i * 24}" text-anchor="middle" font-size="16" fill="${black}" font-family="serif">${escapeXml(line[i])}</text>`;
    }
  }

  // 인장
  const seal = userName
    ? sealStamp(W - 55, H - 65, userName, ink)
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <filter id="paper-texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="${bg}" surfaceScale="1.5" result="lit">
        <feDistantLight azimuth="45" elevation="55"/>
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
    </filter>
  </defs>

  <!-- 배경 (황지) -->
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect width="${W}" height="${H}" fill="${bg}" opacity="0.3" filter="url(#paper-texture)"/>

  <!-- 테두리 -->
  ${traditionalBorder(W, H)}

  <!-- 장식 패턴 -->
  ${decorations}

  <!-- 두전 (상단 제목) -->
  <text x="${W / 2}" y="58" text-anchor="middle" font-size="26" font-weight="bold" fill="${ink}" font-family="serif">${escapeXml(title)}</text>
  <line x1="60" y1="70" x2="${W - 60}" y2="70" stroke="${ink}" stroke-width="1.5" opacity="0.5"/>

  <!-- 주신 (본문) -->
  <!-- 동물 심볼 -->
  ${animalSvg}

  <!-- 메시지 -->
  ${messageText}

  <!-- 하단 구분선 -->
  <line x1="60" y1="${H - 105}" x2="${W - 60}" y2="${H - 105}" stroke="${ink}" stroke-width="1.5" opacity="0.5"/>

  <!-- 각획 (하단 주문) -->
  <text x="${W / 2}" y="${H - 80}" text-anchor="middle" font-size="14" fill="${ink}" font-family="serif" opacity="0.9">${escapeXml(mantra)}</text>

  <!-- 인장 -->
  ${seal}
</svg>`;
}

function generateModern(
  W: number, H: number,
  bgColor: string | undefined,
  animal: string | undefined,
  title: string,
  message: string,
  mantra: string,
  userName: string | undefined,
  symbols: string[] | undefined
): string {
  const paletteIdx = Math.abs(title.split('').reduce((s, c) => s + c.charCodeAt(0), 0)) % MODERN_PALETTES.length;
  const palette = MODERN_PALETTES[paletteIdx];
  const bg1 = bgColor || palette.bg1;
  const bg2 = palette.bg2;
  const ink = palette.ink;
  const accent = palette.accent;

  // 장식
  let decorations = '';
  decorations += svgCloud(55, 90, 0.7, accent);
  decorations += svgCloud(W - 55, 90, 0.7, accent);

  if (symbols?.includes('별')) {
    decorations += svgStar(50, 140, 6, accent);
    decorations += svgStar(W - 50, 140, 6, accent);
    decorations += svgStar(W / 2 - 60, H / 2, 5, accent);
    decorations += svgStar(W / 2 + 60, H / 2, 5, accent);
  }
  if (symbols?.includes('연꽃')) {
    decorations += svgLotus(W / 2, H - 160, 0.8, accent);
  }
  if (symbols?.includes('태극')) {
    decorations += svgYinYang(W / 2, H / 2 + 15, 16, ink);
  }

  // 동물
  let animalSvg = '';
  if (animal && ANIMAL_PATHS[animal]) {
    animalSvg = `<g transform="translate(${W / 2}, ${H / 2 - 30})" color="${ink}">${ANIMAL_PATHS[animal]}</g>`;
  }

  // 메시지 (가로 쓰기, 여러 줄)
  const msgLines = wrapText(message, 14);
  let messageText = '';
  for (let i = 0; i < Math.min(msgLines.length, 4); i++) {
    messageText += `<text x="${W / 2}" y="${280 + i * 28}" text-anchor="middle" font-size="16" fill="${ink}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif">${escapeXml(msgLines[i])}</text>`;
  }

  // 인장
  const seal = userName
    ? sealStamp(W - 55, H - 60, userName, accent)
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="modern-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <filter id="soft-shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
      <feOffset dx="0" dy="2"/>
      <feComposite in2="SourceAlpha" operator="arithmetic" k1="0" k2="0.1" k3="0.1" k4="0"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 배경 (그라데이션) -->
  <rect width="${W}" height="${H}" rx="24" ry="24" fill="url(#modern-bg)"/>

  <!-- 테두리 -->
  ${modernBorder(W, H, accent)}

  <!-- 장식 -->
  ${decorations}

  <!-- 상단 이모지 장식 -->
  <text x="${W / 2}" y="50" text-anchor="middle" font-size="28">✨</text>

  <!-- 두전 (상단 제목) -->
  <text x="${W / 2}" y="85" text-anchor="middle" font-size="24" font-weight="bold" fill="${ink}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" filter="url(#soft-shadow)">${escapeXml(title)}</text>

  <!-- 구분 장식 -->
  <line x1="${W / 2 - 40}" y1="98" x2="${W / 2 + 40}" y2="98" stroke="${accent}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>

  <!-- 동물 심볼 -->
  ${animalSvg}

  <!-- 메시지 -->
  ${messageText}

  <!-- 하단 구분 -->
  <line x1="${W / 2 - 60}" y1="${H - 120}" x2="${W / 2 + 60}" y2="${H - 120}" stroke="${accent}" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>

  <!-- 각획 (하단 주문) -->
  <text x="${W / 2}" y="${H - 90}" text-anchor="middle" font-size="13" fill="${ink}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" opacity="0.8">${escapeXml(mantra)}</text>

  <!-- 하단 이모지 -->
  <text x="${W / 2}" y="${H - 40}" text-anchor="middle" font-size="20">🙏</text>

  <!-- 인장 -->
  ${seal}
</svg>`;
}

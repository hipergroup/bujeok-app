// ============================================================
// 공유 카드 합성기
// 부적 SVG 문자열 → 인스타 스토리(9:16)/정사각(1:1)/원본 PNG
// ============================================================

export type ShareFormat = 'original' | 'story' | 'square';

const TALISMAN_W = 360;
const TALISMAN_H = 560;

const GOLD = '#E8C36A';
const GOLD_DIM = 'rgba(232, 195, 106, 0.55)';

/** svg 루트에 명시적 픽셀 크기를 주입 (래스터화 시 필요) */
function withSize(svg: string, w: number, h: number): string {
  return svg.replace(/<svg([^>]*?)>/, `<svg$1 width="${w}" height="${h}">`);
}

/**
 * SVG 안의 외부 이미지 참조를 data URI 로 바꾼다.
 * <img>로 불러온 SVG는 보안상 외부 리소스를 가져오지 못해,
 * 그림 부적을 캔버스로 합성하려면 그림을 SVG 안에 심어야 한다.
 */
async function inlineExternalImages(svg: string): Promise<string> {
  const refs = [...svg.matchAll(/href="((?:\/|https?:)[^"]+)"/g)].map((m) => m[1]);
  if (refs.length === 0) return svg;

  let result = svg;
  for (const url of new Set(refs)) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('이미지 인라인 실패'));
        res.blob().then((b) => reader.readAsDataURL(b), reject);
      });
      result = result.split(`href="${url}"`).join(`href="${dataUrl}"`);
    } catch {
      // 못 가져온 그림은 그대로 둔다 (해당 부분만 비어 보임)
    }
  }
  return result;
}

/** SVG 문자열을 이미지 엘리먼트로 로드 */
function svgToImage(svg: string, w: number, h: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([withSize(svg, w, h)], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('부적 이미지 로딩에 실패했습니다.'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('이미지 변환에 실패했습니다.'));
    }, 'image/png');
  });
}

/** 카드 배경: 어두운 보라·금 기운 그라데이션 + 별 장식 */
function paintCardBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, '#100D1C');
  base.addColorStop(0.5, '#171226');
  base.addColorStop(1, '#0D0B12');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h / 2);
  glow.addColorStop(0, 'rgba(232, 195, 106, 0.10)');
  glow.addColorStop(1, 'rgba(232, 195, 106, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // 결정적 의사난수로 별 배치 (매번 같은 카드가 나오도록)
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 40; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = rand() * 2.2 + 0.6;
    ctx.fillStyle = `rgba(232, 195, 106, ${0.12 + rand() * 0.25})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** 부적을 은은한 금빛 광 + 라운드 프레임과 함께 그리기 */
function paintTalisman(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.shadowColor = 'rgba(232, 195, 106, 0.45)';
  ctx.shadowBlur = 60;

  // 라운드 클리핑
  const r = 28;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  // 그림자를 위해 먼저 채움
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();

  // 테두리 선
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();
}

interface CardText {
  /** 부적 이름 (예: 잡귀퇴치부) */
  name: string;
  /** 한자 표기 (예: 雜鬼退治符) */
  hanja?: string;
}

/** 포맷별 카드 합성 → PNG Blob */
export async function composeShareImage(
  rawSvg: string,
  format: ShareFormat,
  text: CardText
): Promise<Blob> {
  const svg = await inlineExternalImages(rawSvg);
  // 원본: 장식 없이 부적만 고해상도로
  if (format === 'original') {
    const scale = 3;
    const img = await svgToImage(svg, TALISMAN_W * scale, TALISMAN_H * scale);
    const canvas = document.createElement('canvas');
    canvas.width = TALISMAN_W * scale;
    canvas.height = TALISMAN_H * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context를 생성할 수 없습니다.');
    ctx.drawImage(img, 0, 0);
    return canvasToBlob(canvas);
  }

  const W = 1080;
  const H = format === 'story' ? 1920 : 1080;

  // 카드 안 부적 크기
  const talH = format === 'story' ? 1150 : 760;
  const talW = Math.round((talH * TALISMAN_W) / TALISMAN_H);
  const talX = (W - talW) / 2;
  const talY = format === 'story' ? (H - talH) / 2 + 20 : (H - talH) / 2 - 30;

  const img = await svgToImage(svg, talW * 2, talH * 2);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context를 생성할 수 없습니다.');

  paintCardBackground(ctx, W, H);
  paintTalisman(ctx, img, talX, talY, talW, talH);

  ctx.textAlign = 'center';

  // 상단: 앱 이름
  ctx.fillStyle = GOLD_DIM;
  ctx.font = `500 ${format === 'story' ? 40 : 34}px 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`;
  ctx.fillText('✦ 수호부적 ✦', W / 2, format === 'story' ? 150 : 90);

  // 하단: 부적 이름 + 한자
  const bottomBase = format === 'story' ? H - 220 : H - 110;
  ctx.fillStyle = GOLD;
  ctx.font = `700 ${format === 'story' ? 58 : 48}px 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`;
  ctx.fillText(text.name, W / 2, bottomBase);
  if (text.hanja) {
    ctx.fillStyle = GOLD_DIM;
    ctx.font = `400 ${format === 'story' ? 36 : 30}px serif`;
    ctx.fillText(text.hanja, W / 2, bottomBase + (format === 'story' ? 56 : 46));
  }

  return canvasToBlob(canvas);
}

/**
 * 모바일이면 Web Share 시트, 아니면 파일 다운로드.
 * @returns 'shared' | 'downloaded' | 'cancelled'
 */
export async function shareOrDownload(
  blob: Blob,
  fileName: string,
  shareText: string
): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], `${fileName}.png`, { type: 'image/png' });

  if (
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], text: shareText });
      return 'shared';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return 'cancelled';
      }
      // 공유 실패 시 다운로드로 폴백
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
  return 'downloaded';
}

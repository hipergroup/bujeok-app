/**
 * download-talisman.ts
 *
 * Utility to convert an SVG talisman to PNG and download / share it.
 * Supports both direct download and the Web Share API for mobile devices.
 */

// ─── Options ─────────────────────────────────────────────────────────
export interface DownloadOptions {
  /** Filename without extension */
  fileName?: string;
  /** Scale factor for the output PNG (default: 2 for retina) */
  scale?: number;
  /** Image format */
  format?: 'image/png' | 'image/jpeg';
  /** JPEG quality 0-1 (only used if format is jpeg) */
  quality?: number;
  /** Background color to fill behind transparent areas (null = transparent) */
  backgroundColor?: string | null;
}

// ─── SVG → Canvas → Blob pipeline ───────────────────────────────────
function svgToBlob(
  svgElement: SVGSVGElement,
  options: DownloadOptions = {}
): Promise<Blob> {
  const {
    scale = 2,
    format = 'image/png',
    quality = 0.92,
    backgroundColor = null,
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Clone the SVG so we don't mutate the original
      const clone = svgElement.cloneNode(true) as SVGSVGElement;

      // Ensure xmlns is set for serialization
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      // Get the intrinsic size from viewBox
      const viewBox = svgElement.viewBox.baseVal;
      const vbWidth = viewBox.width || 300;
      const vbHeight = viewBox.height || 500;

      const canvasWidth = vbWidth * scale;
      const canvasHeight = vbHeight * scale;

      // Set explicit dimensions on clone for rasterization
      clone.setAttribute('width', String(canvasWidth));
      clone.setAttribute('height', String(canvasHeight));

      // Inline all computed styles to make the SVG self-contained
      inlineStyles(clone);

      // Serialize SVG to string
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clone);

      // Fix any potential issues with serialization
      if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(
          /^<svg/,
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }

      // Create a blob URL from the SVG string
      const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);

      // Draw to canvas
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D context를 생성할 수 없습니다.'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // Fill background if specified
        if (backgroundColor) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        URL.revokeObjectURL(url);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('이미지 변환에 실패했습니다.'));
            }
          },
          format,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('SVG 이미지 로딩에 실패했습니다.'));
      };

      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

// ─── Inline computed styles into SVG elements ────────────────────────
function inlineStyles(element: Element) {
  const children = element.querySelectorAll('*');
  const svgStyleProps = [
    'fill',
    'stroke',
    'stroke-width',
    'stroke-dasharray',
    'stroke-linecap',
    'stroke-linejoin',
    'opacity',
    'font-family',
    'font-size',
    'font-weight',
    'text-anchor',
    'letter-spacing',
    'filter',
  ];

  children.forEach((child) => {
    if (child instanceof SVGElement || child instanceof HTMLElement) {
      try {
        const computed = window.getComputedStyle(child);
        svgStyleProps.forEach((prop) => {
          const value = computed.getPropertyValue(prop);
          if (value && !child.getAttribute(prop)) {
            child.setAttribute(prop, value);
          }
        });
      } catch {
        // Skip elements that can't be styled
      }
    }
  });
}

// ─── Download as file ────────────────────────────────────────────────
export async function downloadTalisman(
  svgElement: SVGSVGElement,
  options: DownloadOptions = {}
): Promise<void> {
  const {
    fileName = '나의부적',
    format = 'image/png',
    backgroundColor,
  } = options;

  // For traditional style, use the paper yellow as background
  const finalBg =
    backgroundColor === undefined ? '#F5E6B8' : backgroundColor;

  const blob = await svgToBlob(svgElement, {
    ...options,
    backgroundColor: finalBg,
  });

  const extension = format === 'image/jpeg' ? 'jpg' : 'png';
  const fullFileName = `${fileName}.${extension}`;

  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fullFileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}

// ─── Share via Web Share API (mobile-friendly) ───────────────────────
export async function shareTalisman(
  svgElement: SVGSVGElement,
  options: DownloadOptions & {
    /** Share title */
    shareTitle?: string;
    /** Share text / description */
    shareText?: string;
  } = {}
): Promise<boolean> {
  const {
    fileName = '나의부적',
    shareTitle = '나만의 부적 🙏',
    shareText = '특별한 부적을 만들었어요! 함께 보세요 ✨',
    backgroundColor,
  } = options;

  const finalBg =
    backgroundColor === undefined ? '#F5E6B8' : backgroundColor;

  // Check if Web Share API is available
  if (!navigator.share || !navigator.canShare) {
    // Fallback: just download
    await downloadTalisman(svgElement, options);
    return false;
  }

  try {
    const blob = await svgToBlob(svgElement, {
      ...options,
      backgroundColor: finalBg,
    });

    const file = new File([blob], `${fileName}.png`, { type: 'image/png' });

    // Check if files can be shared
    const shareData: ShareData = {
      title: shareTitle,
      text: shareText,
      files: [file],
    };

    if (navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return true;
    } else {
      // Can't share files, try without
      await navigator.share({
        title: shareTitle,
        text: shareText,
      });
      return true;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // User cancelled sharing — not an error
      return false;
    }
    // Fallback to download
    await downloadTalisman(svgElement, options);
    return false;
  }
}

// ─── Get talisman as data URL (for preview / clipboard) ──────────────
export async function talismanToDataURL(
  svgElement: SVGSVGElement,
  options: DownloadOptions = {}
): Promise<string> {
  const blob = await svgToBlob(svgElement, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('DataURL 변환에 실패했습니다.'));
      }
    };
    reader.onerror = () => reject(new Error('DataURL 변환에 실패했습니다.'));
    reader.readAsDataURL(blob);
  });
}

// ─── Copy talisman to clipboard ──────────────────────────────────────
export async function copyTalismanToClipboard(
  svgElement: SVGSVGElement,
  options: DownloadOptions = {}
): Promise<boolean> {
  try {
    const blob = await svgToBlob(svgElement, {
      ...options,
      format: 'image/png',
    });

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}

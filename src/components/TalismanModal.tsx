'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedTalisman, TalismanInfo } from '@/lib/types';
import { getEnergyByCategory } from '@/data/energies';
import { hasWidgetBridge, pushTalismanToWidget } from '@/lib/widget-bridge';
import TalismanThumbnail from './TalismanThumbnail';
import PersonalTalismanView, { NameStamp } from './PersonalTalismanView';
import { buildPersonalSVG, markPlacedOnHome } from '@/lib/personal-talisman';
import { buildAnseoSVG, markAnseoArrived } from '@/lib/anseo';
import { composeShareImage, shareOrDownload } from '@/lib/share-card';
import { ShareMotif, DownloadMotif, TrashMotif, PinTalismanMotif } from './hanji/motifs';

interface TalismanModalProps {
  talisman: (SavedTalisman | TalismanInfo) | null;
  onClose: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  /** Extra CTA shown at the bottom (e.g. "이 부적 받기") */
  actionButton?: React.ReactNode;
}

function isSaved(t: SavedTalisman | TalismanInfo): t is SavedTalisman {
  return 'savedAt' in t;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-[var(--color-galsaek)]">
          <span className="mt-0.5 text-[var(--color-juhong)] opacity-70">·</span>
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: '1px solid rgba(122,74,52,0.2)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <span className="font-serif-kr text-sm font-bold text-[var(--color-galsaek)]">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-[var(--color-galsaek)] opacity-60"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TalismanModal({
  talisman,
  onClose,
  onShare,
  onDelete,
  actionButton,
}: TalismanModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  /** 연락기원부 — 방금 도착인을 찍었으면 화면을 새 모습으로 */
  const [arrivedNow, setArrivedNow] = useState<string | null>(null);
  /* 네이티브 앱에서만 true — 홈 화면 위젯으로 보내기 지원 여부 */
  const [canWidget, setCanWidget] = useState(false);
  const [widgetDone, setWidgetDone] = useState(false);

  useEffect(() => {
    setCanWidget(hasWidgetBridge());
  }, []);

  if (!talisman) return null;

  const color = getEnergyByCategory(talisman.category).color;
  const saved = isSaved(talisman);
  const dateStr = saved
    ? new Date(talisman.savedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${talisman.name} (${talisman.hanja})`,
          text: talisman.description,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(
        `${talisman.name} (${talisman.hanja})\n${talisman.description}`
      );
      alert('클립보드에 복사되었습니다.');
    }
    onShare?.();
  };

  const handleDownload = () => {
    // 개인 부적 — 인장까지 담긴 모습 그대로 PNG 합성
    if (saved && (talisman.personal || talisman.anseo)) {
      void (async () => {
        try {
          const blob = await composeShareImage(
            talisman.anseo ? buildAnseoSVG(talisman) : buildPersonalSVG(talisman),
            'original',
            {
              name: talisman.name,
              hanja: talisman.hanja,
            }
          );
          await shareOrDownload(blob, `수호부_${talisman.name}`, '');
        } catch {
          /* 합성 실패 — 다음 시도 가능 */
        }
      })();
      return;
    }
    const svgEl = document.querySelector('#talisman-modal-svg svg') as SVGSVGElement | null;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${talisman.name}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete?.();
    setConfirmDelete(false);
  };

  /* 이 부적을 홈 화면 위젯으로 보낸다 (네이티브 앱 전용)
     개인 부적은 저장된 이미지가 없으므로 원형 + 인장으로 그때 합성한다 */
  const handleWidget = async () => {
    if (!saved || widgetDone) return;
    const svg = talisman.anseo
      ? buildAnseoSVG(talisman)
      : talisman.personal
        ? buildPersonalSVG(talisman)
        : talisman.svg;
    if (!svg) return;
    if (talisman.personal) markPlacedOnHome(talisman.id);
    await pushTalismanToWidget(svg, {
      name: talisman.name,
      hanja: talisman.hanja,
      note: talisman.note,
      savedAt: talisman.savedAt,
    });
    setWidgetDone(true);
    setTimeout(() => setWidgetDone(false), 2400);
  };

  const actionBtnStyle: React.CSSProperties = {
    border: '1px solid rgba(122,74,52,0.4)',
    backgroundColor: 'rgba(246,237,217,0.7)',
  };

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="hanji-surface relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl pb-[max(2rem,env(safe-area-inset-bottom))]"
          style={{ borderTop: '1px solid rgba(122,74,52,0.4)' }}
        >
          {/* Drag handle */}
          <div className="hanji-surface sticky top-0 z-10 flex justify-center pb-2 pt-3">
            <div className="h-1 w-10 rounded-full bg-[var(--color-galsaek)] opacity-30" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-3 rounded-full p-1.5 text-[var(--color-galsaek)] transition hover:text-[var(--color-juhong)]"
            style={{ border: '1px solid rgba(122,74,52,0.3)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="flex flex-col items-center px-6 pt-2">
            {/* Talisman SVG */}
            <div id="talisman-modal-svg">
              {saved && talisman.anseo ? (
                <div
                  style={{ width: 200, aspectRatio: '360 / 560' }}
                  className="overflow-hidden rounded-xl"
                  dangerouslySetInnerHTML={{
                    __html: buildAnseoSVG(
                      arrivedNow
                        ? { ...talisman, anseo: { ...talisman.anseo, arrivedAt: arrivedNow } }
                        : talisman
                    ),
                  }}
                />
              ) : saved && talisman.personal ? (
                <PersonalTalismanView
                  talisman={talisman}
                  width={200}
                  className="rounded-xl"
                />
              ) : saved && talisman.svg ? (
                <div
                  style={{ width: 200, aspectRatio: '360 / 560' }}
                  className="overflow-hidden rounded-xl"
                  dangerouslySetInnerHTML={{ __html: talisman.svg }}
                />
              ) : (
                <TalismanThumbnail id={talisman.id} category={talisman.category} size={200} />
              )}
            </div>

            {/* Name + Hanja */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h2 className="font-serif-kr text-xl font-bold text-[var(--color-meok)]">
                {talisman.name}
              </h2>
            </div>
            <p className="mt-1 text-sm text-[var(--color-galsaek)]">{talisman.hanja}</p>

            {dateStr && (
              <p className="mt-2 text-xs text-[var(--color-galsaek)] opacity-70">
                {dateStr} 수령
              </p>
            )}

            {/* Description */}
            <p className="mt-4 text-center text-sm leading-relaxed text-[var(--color-meok)] opacity-90">
              {talisman.description}
            </p>

            {/* 내가 담은 문구 */}
            {saved && talisman.note && (
              <p
                className="mt-3 w-full rounded-xl px-4 py-2.5 text-center font-serif-kr text-sm text-[var(--color-juhong)]"
                style={{
                  border: '1px solid rgba(167,43,33,0.3)',
                  backgroundColor: 'rgba(167,43,33,0.06)',
                }}
              >
                &ldquo;{talisman.note}&rdquo;
              </p>
            )}

            {/* 연락기원부 — 봉인은 열지 않고, 도착만 기록한다 */}
            {saved && talisman.anseo && (
              <div
                className="mt-4 w-full rounded-xl px-4 py-3.5"
                style={{
                  border: '1px solid rgba(122,74,52,0.3)',
                  backgroundColor: 'rgba(255,251,240,0.75)',
                }}
              >
                <div className="flex items-start gap-3 py-1">
                  <span className="w-16 shrink-0 text-[11px] font-bold text-[var(--color-galsaek)]">
                    기다리는 이
                  </span>
                  <span className="font-serif-kr text-[12.5px] text-[var(--color-meok)]">
                    {talisman.anseo.recipientAlias || '—'}
                  </span>
                </div>
                <div className="flex items-start gap-3 py-1">
                  <span className="w-16 shrink-0 text-[11px] font-bold text-[var(--color-galsaek)]">
                    봉인한 한마디
                  </span>
                  <span className="text-[12px] leading-relaxed text-[var(--color-galsaek)]">
                    부적 속에 접혀 있어요 — 소식이 닿을 때까지 열어보지 않기로 했어요.
                  </span>
                </div>
                {(talisman.anseo.arrivedAt || arrivedNow) ? (
                  <div className="flex items-start gap-3 py-1">
                    <span className="w-16 shrink-0 text-[11px] font-bold text-[var(--color-galsaek)]">
                      소식 닿은 날
                    </span>
                    <span className="font-serif-kr text-[12.5px] font-bold text-[var(--color-juhong)]">
                      {new Date(
                        arrivedNow ?? talisman.anseo.arrivedAt!
                      ).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                      — 도착인이 찍혔어요
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const t = markAnseoArrived(talisman.id);
                      if (t?.anseo?.arrivedAt) setArrivedNow(t.anseo.arrivedAt);
                    }}
                    className="mt-2 w-full rounded-lg py-2.5 font-serif-kr text-[13px] font-bold text-[var(--color-juhong)] transition active:scale-[0.99]"
                    style={{
                      border: '1.5px solid var(--color-juhong)',
                      backgroundColor: 'rgba(167,43,33,0.05)',
                    }}
                  >
                    소식이 닿았어요
                  </button>
                )}
              </div>
            )}

            {/* 개인 부적 기록 — 원형 위에 담긴 한 사람의 기록 */}
            {saved && talisman.personal && (
              <div
                className="mt-4 w-full rounded-xl px-4 py-3.5"
                style={{
                  border: '1px solid rgba(122,74,52,0.3)',
                  backgroundColor: 'rgba(255,251,240,0.75)',
                }}
              >
                {talisman.personal.wishText && (
                  <div className="flex items-start gap-3 py-1">
                    <span className="w-14 shrink-0 text-[11px] font-bold text-[var(--color-galsaek)]">
                      담은 염원
                    </span>
                    <span className="min-w-0 flex-1 font-serif-kr text-[12.5px] leading-relaxed text-[var(--color-meok)]">
                      {talisman.personal.wishText}
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-3 py-1">
                  <span className="w-14 shrink-0 text-[11px] font-bold text-[var(--color-galsaek)]">
                    추천 이유
                  </span>
                  <span className="min-w-0 flex-1 text-[12px] leading-relaxed text-[var(--color-galsaek)]">
                    {talisman.personal.recommendationReason}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-1">
                  <span className="w-14 shrink-0 text-[11px] font-bold text-[var(--color-galsaek)]">
                    부적 번호
                  </span>
                  <span className="font-serif-kr text-[12.5px] text-[var(--color-meok)]">
                    {talisman.personal.serialNumber}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-1">
                  <span className="w-14 shrink-0 text-[11px] font-bold text-[var(--color-galsaek)]">
                    이름 인장
                  </span>
                  <span className="flex items-center gap-2">
                    <NameStamp
                      text={talisman.personal.stampText}
                      side={26}
                      rotation={talisman.personal.stampRotation}
                    />
                    <span className="font-serif-kr text-[12.5px] text-[var(--color-meok)]">
                      {talisman.personal.ownerName || '수호부'}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Expandable sections */}
            <div className="mt-6 w-full">
              <Section title="이 부적의 의미" defaultOpen>
                <BulletList items={talisman.meaning} />
              </Section>
              <Section title="사용 상황">
                <BulletList items={talisman.situations} />
              </Section>
              <Section title="문양 설명">
                <div className="flex flex-col gap-2 text-sm leading-relaxed text-[var(--color-galsaek)]">
                  <p>
                    중앙 글자&nbsp;
                    <span className="font-serif-kr font-bold text-[var(--color-juhong)]">
                      {talisman.design.centerText}
                    </span>
                  </p>
                  {talisman.design.patterns.length > 0 && (
                    <p>장식 문양 — {talisman.design.patterns.join(', ')}</p>
                  )}
                  {talisman.design.symbols.length > 0 && (
                    <p>상징 요소 — {talisman.design.symbols.join(', ')}</p>
                  )}
                </div>
              </Section>
              <Section title="사용법">
                <div className="flex flex-col gap-2">
                  <BulletList items={talisman.usage} />
                  <p className="text-sm leading-relaxed text-[var(--color-galsaek)]">
                    보관 — {talisman.placement}
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--color-galsaek)]">
                    교체 — {talisman.replacement}
                  </p>
                </div>
              </Section>
              <Section title="주문(眞言)">
                <p className="font-serif-kr text-sm leading-relaxed text-[var(--color-juhong)]">
                  {talisman.mantra}
                </p>
              </Section>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex w-full flex-col gap-3">
              {actionButton}

              {saved && canWidget && (talisman.svg || talisman.personal) && (
                <button
                  onClick={handleWidget}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition active:scale-95"
                  style={{
                    border: '1px solid rgba(167,43,33,0.45)',
                    backgroundColor: widgetDone
                      ? 'rgba(76,175,80,0.12)'
                      : 'rgba(167,43,33,0.07)',
                    color: widgetDone ? '#2E7D32' : 'var(--color-juhong)',
                  }}
                >
                  {widgetDone ? (
                    <>✓ 홈 화면에 모셨어요 — 위젯에서 확인해 보세요</>
                  ) : (
                    <><PinTalismanMotif size={17} /> 홈 화면에 모시기</>
                  )}
                </button>
              )}

              {saved && (
                <div className="flex w-full gap-3">
                  <button
                    onClick={handleShare}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[var(--color-galsaek)] transition active:scale-95"
                    style={actionBtnStyle}
                  >
                    <ShareMotif size={16} /> 공유
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[var(--color-galsaek)] transition active:scale-95"
                    style={actionBtnStyle}
                  >
                    <DownloadMotif size={16} /> 다운로드
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition ${
                      confirmDelete
                        ? 'border-red-500/60 bg-red-900/30 text-red-100'
                        : 'border-red-900/30 bg-red-900/5 text-red-800'
                    }`}
                  >
                    <TrashMotif size={16} /> {confirmDelete ? '정말 삭제?' : '삭제'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

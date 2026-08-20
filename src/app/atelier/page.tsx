'use client';

// ============================================================
// 부적 화첩 — /atelier (제작 작업용, 앱 내 링크 없음)
// ------------------------------------------------------------
// 43종 전체의 그림 현황을 한눈에 본다:
//  · 그림이 아직 없는 부적 — 지금 나가는 자동 생성 SVG + 제작 참고
//    정보(중앙 글자·문양·상징·배치 지침)를 함께 보여준다
//  · 그림이 들어간 부적 — 실제 PNG
// 이미지를 public/talismans 에 추가하고 배포하면 이 페이지도
// 자동으로 갱신된다 (TALISMAN_ASSETS 는 빌드 때 생성).
// ============================================================

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import { BackIcon } from '@/components/hanji/motifs';
import { TALISMANS, type TalismanType } from '@/data/talismans';
import { getTalismanAsset } from '@/data/talisman-assets';
import { generateTalismanSVG } from '@/lib/talisman-generator';

const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';
const JUHONG = '#A72B21';

/** 그림 없는 부적의 현재 모습 — 자동 생성 SVG */
function AutoSvg({ t }: { t: TalismanType }) {
  const svg = useMemo(
    () =>
      generateTalismanSVG({
        type: t.id,
        style: 'traditional',
        background: 'hwangji',
        accent: t.colors[2],
        title: t.name,
        hanja: t.hanja,
        message: t.description.slice(0, 20),
        mantra: t.mantra,
        symbols: [...t.design.patterns, ...t.design.symbols],
      }),
    [t]
  );
  return (
    <div
      className="w-full overflow-hidden rounded-md"
      style={{ aspectRatio: '360 / 560' }}
      /* svg 는 카탈로그 데이터로만 생성됨 */
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function Card({
  t,
  asset,
  forceOpen,
}: {
  t: TalismanType;
  asset?: string;
  /** '모두 펼치기'가 켜져 있으면 개별 접기보다 우선한다 */
  forceOpen?: boolean;
}) {
  const [openSelf, setOpenSelf] = useState(false);
  const open = forceOpen || openSelf;
  return (
    <div className="hanji-card rounded-xl p-3">
      {asset ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset}
          alt={t.name}
          className="w-full rounded-md"
          style={{ aspectRatio: '600 / 900', objectFit: 'cover' }}
          loading="lazy"
        />
      ) : (
        <AutoSvg t={t} />
      )}
      <p className="mt-2 font-serif-kr text-[13px] font-bold" style={{ color: MEOK }}>
        {t.name}
        <span className="ml-1 text-[10px] font-normal" style={{ color: `${GALSAEK}99` }}>
          {t.hanja}
        </span>
      </p>
      <p className="text-[10px]" style={{ color: `${GALSAEK}88` }}>
        {t.category} · {t.id}
      </p>

      {!asset && (
        <>
          <button
            onClick={() => setOpenSelf((v) => !v)}
            className="mt-1.5 text-[10.5px] underline"
            style={{ color: JUHONG }}
          >
            {open ? '제작 참고 접기' : '제작 참고 보기'}
          </button>
          {open && (
            <div
              className="mt-1.5 rounded-md px-2 py-1.5 text-[10.5px] leading-relaxed"
              style={{ background: 'rgba(122,74,52,0.06)', color: GALSAEK }}
            >
              <p>
                <b>중앙 글자</b> {t.design.centerText}
              </p>
              <p>
                <b>문양</b> {t.design.patterns.join(', ') || '—'}
              </p>
              <p>
                <b>상징</b> {t.design.symbols.join(', ') || '—'}
              </p>
              {t.design.notes && (
                <p>
                  <b>지침</b> {t.design.notes}
                </p>
              )}
              <p style={{ marginTop: 2, color: `${GALSAEK}99` }}>
                파일명: {t.name}-전통.png (600×900)
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AtelierPage() {
  const router = useRouter();
  const [allOpen, setAllOpen] = useState(false);

  const { missing, done } = useMemo(() => {
    const missing: TalismanType[] = [];
    const done: { t: TalismanType; asset: string }[] = [];
    for (const t of TALISMANS) {
      const asset = getTalismanAsset(t.name, 'traditional');
      if (asset) done.push({ t, asset });
      else missing.push(t);
    }
    return { missing, done };
  }, []);

  return (
    <HanjiBackground>
      <TraditionalHeader
        left={
          <button onClick={() => router.push('/')} aria-label="홈으로">
            <BackIcon size={20} />
          </button>
        }
        title="부적 화첩"
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-24">
        <p className="mb-5 text-center text-[11px]" style={{ color: `${GALSAEK}99` }}>
          제작 현황 — 그림 {done.length}종 · 미제작 {missing.length}종 (전체{' '}
          {TALISMANS.length}종)
        </p>

        {/* 그림 제작 공통 지침 — 모든 원형이 지켜야 하는 약속 */}
        <div
          className="mb-5 rounded-xl px-4 py-3.5 text-[11.5px] leading-[1.8]"
          style={{
            border: '1px solid rgba(122,74,52,0.3)',
            background: 'rgba(255,251,240,0.75)',
            color: GALSAEK,
          }}
        >
          <p className="mb-1 font-serif-kr font-bold" style={{ color: MEOK }}>
            그림 제작 공통 지침
          </p>
          <p>· 세로형 600×900 (비율 2:3), 파일명 「부적이름-전통.png」</p>
          <p>· 상단 勅令 · 하단 急急如律令 · 중앙 글자를 부적 문법대로 배치</p>
          <p>
            · <b style={{ color: JUHONG }}>오른쪽 아래(가로 79% · 세로 82% 언저리)는
            비워둘 것</b> — 완성 때 사용자의 이름 인장이 그 자리에 찍힌다
          </p>
          <p>· 아래쪽 15%는 여백으로 — 기원 문구 띠가 얹힐 수 있는 자리</p>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif-kr text-[15px] font-bold" style={{ color: JUHONG }}>
            🖌️ 아직 그림이 없는 부적 {missing.length}종
          </h2>
          <button
            onClick={() => setAllOpen((v) => !v)}
            className="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold"
            style={{
              border: '1px solid rgba(167,43,33,0.4)',
              color: JUHONG,
              background: 'rgba(246,237,217,0.7)',
            }}
          >
            {allOpen ? '참고 모두 접기' : '참고 모두 펼치기'}
          </button>
        </div>
        <h2 className="hidden">
          {'' /* 원래 제목 자리 — 위 줄로 옮겼다 */}
        </h2>
        <p className="-mt-2 mb-3 text-[10.5px]" style={{ color: `${GALSAEK}99` }}>
          지금은 자동 생성본으로 나가요 — 카드의 제작 참고대로 그려서 올리면 돼요
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {missing.map((t) => (
            <Card key={t.id} t={t} forceOpen={allOpen} />
          ))}
        </div>

        <h2
          className="mb-3 mt-8 font-serif-kr text-[15px] font-bold"
          style={{ color: MEOK }}
        >
          ✅ 그림이 들어간 부적 {done.length}종
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {done.map(({ t, asset }) => (
            <Card key={t.id} t={t} asset={asset} />
          ))}
        </div>
      </main>
    </HanjiBackground>
  );
}

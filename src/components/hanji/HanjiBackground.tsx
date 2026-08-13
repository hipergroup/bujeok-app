import hanjiPaper from '../../../public/brand/hanji-bg.jpg';

/**
 * 한지 배경 래퍼.
 *
 * 배경 그림(구름·낙관·바램이 그려진 한지)은 화면에 고정되어,
 * 내용이 스크롤돼도 종이는 제자리에 머문다 — 한 장의 종이 위에
 * 글을 얹은 느낌을 유지하기 위함이다.
 *
 * `decorated` 는 예전 SVG 장식용 옵션 — 지금은 종이 그림 자체가
 * 구름과 바램을 담고 있어 아무 일도 하지 않는다 (호출부 호환용).
 */
export default function HanjiBackground({
  children,
  decorated: _decorated = false,
  className = '',
}: {
  children: React.ReactNode;
  decorated?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`hanji-surface relative flex min-h-dvh flex-col text-[var(--color-meok)] ${className}`}
    >
      {/* 종이 — 화면에 고정된 배경 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          // 종이의 왼쪽 아래(무늬를 피한 평평한 결)를 190%로 키워 쓴다.
          // 앱 전체가 같은 종이로 보이도록 배경 지정은 이 한 군데에만 둔다 —
          // 화면마다 따로 깔면 크롭이 어긋나 다른 종이처럼 보인다.
          background: `#F2E7CE url(${hanjiPaper.src}) 22% 92% / 190% auto no-repeat`,
        }}
      />
      <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}

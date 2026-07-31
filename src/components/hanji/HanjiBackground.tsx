import { CloudMotif, FlameMotif } from './motifs';

/**
 * 한지 질감 배경 래퍼.
 * decorated: 모서리에 민화풍 구름·불꽃 장식(콘텐츠를 가리지 않게 저대비)
 */
export default function HanjiBackground({
  children,
  decorated = false,
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
      {decorated && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <CloudMotif
            size={120}
            className="absolute -right-6 top-[max(0.5rem,env(safe-area-inset-top))] text-[var(--color-galsaek)] opacity-[0.12]"
          />
          <FlameMotif
            size={130}
            className="absolute -bottom-4 -left-6 text-[var(--color-juhong)] opacity-[0.10]"
          />
          <FlameMotif
            size={70}
            className="absolute bottom-14 left-16 text-[var(--color-hwang)] opacity-[0.10]"
          />
        </div>
      )}
      <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}

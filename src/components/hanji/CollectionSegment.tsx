'use client';

/* 부적함 ↔ 도감 전환 세그먼트 — 두 화면 상단에 함께 놓인다 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SEGMENTS = [
  { href: '/collection', label: '내 부적함' },
  { href: '/encyclopedia', label: '부적 도감' },
];

export default function CollectionSegment() {
  const pathname = usePathname();

  return (
    <div className="mx-auto mb-3 w-full max-w-md px-5">
      <div
        className="flex rounded-full p-1"
        style={{
          border: '1px solid rgba(122,74,52,0.25)',
          background: 'rgba(122,74,52,0.06)',
        }}
      >
        {SEGMENTS.map((s) => {
          const active = pathname.startsWith(s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              className={`flex-1 rounded-full py-1.5 text-center text-[12.5px] transition-colors ${
                active
                  ? 'font-bold text-[#F6EDD9]'
                  : 'font-medium text-[var(--color-galsaek)]'
              }`}
              style={active ? { background: 'var(--color-juhong)' } : undefined}
            >
              {s.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

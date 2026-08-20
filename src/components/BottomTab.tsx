'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeTabIcon,
  BrushTabIcon,
  FortuneTabIcon,
  BoxTabIcon,
  PersonTabIcon,
} from './hanji/motifs';

const tabs = [
  { href: '/', label: '홈', Icon: HomeTabIcon, group: ['/'] },
  {
    href: '/talisman',
    label: '부적 짓기',
    Icon: BrushTabIcon,
    group: ['/talisman'],
  },
  {
    href: '/unse',
    label: '운세',
    Icon: FortuneTabIcon,
    // 운세 허브 아래 딸린 화면들에서도 탭이 켜져 있게
    group: ['/unse', '/saju', '/gunghap', '/days', '/glossary'],
  },
  {
    href: '/collection',
    label: '부적함',
    Icon: BoxTabIcon,
    group: ['/collection', '/encyclopedia'],
  },
  { href: '/mypage', label: '마이', Icon: PersonTabIcon, group: ['/mypage'] },
];

export default function BottomTab() {
  const pathname = usePathname();

  return (
    <nav
      className="hanji-surface fixed bottom-0 left-0 right-0 z-50"
      style={{ borderTop: '1px solid rgba(122, 74, 52, 0.35)' }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {tabs.map(({ href, label, Icon, group }) => {
          const isActive = group.some((g) =>
            g === '/' ? pathname === '/' : pathname.startsWith(g)
          );
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive
                  ? 'text-[var(--color-juhong)]'
                  : 'text-[var(--color-galsaek)] opacity-60 hover:opacity-90'
              }`}
            >
              <Icon size={24} />
              <span
                className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

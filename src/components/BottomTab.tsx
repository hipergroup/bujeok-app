'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeTabIcon,
  BrushTabIcon,
  BoxTabIcon,
  PersonTabIcon,
} from './hanji/motifs';

const tabs = [
  { href: '/', label: '홈', Icon: HomeTabIcon },
  { href: '/talisman', label: '부적 만들기', Icon: BrushTabIcon },
  { href: '/collection', label: '내 부적함', Icon: BoxTabIcon },
  { href: '/mypage', label: '마이페이지', Icon: PersonTabIcon },
];

export default function BottomTab() {
  const pathname = usePathname();

  return (
    <nav
      className="hanji-surface fixed bottom-0 left-0 right-0 z-50"
      style={{ borderTop: '1px solid rgba(122, 74, 52, 0.35)' }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {tabs.map(({ href, label, Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);
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

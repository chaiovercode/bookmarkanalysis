'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Bookmark,
  BarChart3,
  Settings,
  Upload,
} from 'lucide-react';
import { TwitterBird } from './TwitterBird';
import { useBookmarkStore } from '@/store/bookmarkStore';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { href: '/analysis', icon: BarChart3, label: 'Analysis' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/upload', icon: Upload, label: 'Upload' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const bookmarks = useBookmarkStore((state) => state.bookmarks);

  return (
    <aside className="fixed left-0 top-0 h-full w-[275px] bg-white border-r border-[var(--twitter-extra-light-gray)] px-3 py-2 flex flex-col">
      {/* Twitter Bird Logo */}
      <Link
        href="/"
        className="p-3 rounded-full hover:bg-[var(--twitter-blue-light)] transition-colors w-fit"
      >
        <TwitterBird className="w-8 h-8 text-[var(--twitter-blue)]" />
      </Link>

      {/* Navigation */}
      <nav className="mt-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-5 px-4 py-3 rounded-full text-xl transition-colors hover:bg-[var(--twitter-extra-light-gray)] ${
                isActive
                  ? 'font-bold text-[var(--twitter-black)]'
                  : 'text-[var(--twitter-black)]'
              }`}
            >
              <Icon
                className="w-7 h-7"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{item.label}</span>
              {item.label === 'Bookmarks' && bookmarks.length > 0 && (
                <span className="ml-auto text-sm text-[var(--twitter-dark-gray)]">
                  {bookmarks.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Tweet/Upload Button */}
      <Link
        href="/upload"
        className="btn-twitter btn-twitter-primary w-full mb-4 text-lg h-[52px]"
      >
        Upload Archive
      </Link>
    </aside>
  );
}

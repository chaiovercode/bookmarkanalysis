'use client';

import { ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TwitterBird } from './TwitterBird';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, showBack, showLogo, action }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[var(--twitter-extra-light-gray)]">
      <div className="flex items-center gap-4 px-4 h-[53px]">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-[var(--twitter-extra-light-gray)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--twitter-black)]" />
          </button>
        )}

        {showLogo && (
          <TwitterBird className="w-8 h-8 text-[var(--twitter-blue)]" />
        )}

        <div className="flex-1">
          <h1 className="text-xl font-bold text-[var(--twitter-black)]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] text-[var(--twitter-dark-gray)]">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>
    </header>
  );
}

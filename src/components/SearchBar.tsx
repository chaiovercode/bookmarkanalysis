'use client';

import { Search, X } from 'lucide-react';
import { useBookmarkStore } from '@/store/bookmarkStore';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useBookmarkStore();

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--twitter-dark-gray)]" />
      <input
        type="text"
        placeholder="Search bookmarks"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-12 pr-10 py-3 bg-[var(--twitter-extra-light-gray)] rounded-full text-[15px] text-[var(--twitter-black)] placeholder-[var(--twitter-dark-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--twitter-blue)] focus:bg-white transition-colors"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--twitter-light-gray)] transition-colors"
        >
          <X className="w-4 h-4 text-[var(--twitter-dark-gray)]" />
        </button>
      )}
    </div>
  );
}

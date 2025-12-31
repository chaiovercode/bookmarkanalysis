'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, Clock, User } from 'lucide-react';
import { Header } from '@/components/Header';
import { TweetCard } from '@/components/TweetCard';
import { useBookmarkStore } from '@/store/bookmarkStore';

export default function SearchPage() {
  const { bookmarks } = useBookmarkStore();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.tweet.full_text.toLowerCase().includes(searchTerm) ||
        b.tweet.user.name.toLowerCase().includes(searchTerm) ||
        b.tweet.user.screen_name.toLowerCase().includes(searchTerm)
    );
  }, [query, bookmarks]);

  // Get trending/common authors
  const topAuthors = useMemo(() => {
    const authorCounts: Record<string, { name: string; screen_name: string; count: number }> = {};

    for (const bookmark of bookmarks) {
      const { name, screen_name } = bookmark.tweet.user;
      if (!authorCounts[screen_name]) {
        authorCounts[screen_name] = { name, screen_name, count: 0 };
      }
      authorCounts[screen_name].count++;
    }

    return Object.values(authorCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [bookmarks]);

  // Save search to recent
  const saveSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearch(query.trim());
    }
  };

  return (
    <div>
      <Header title="Search" showBack />

      {/* Search input */}
      <form onSubmit={handleSearch} className="p-4 border-b border-[var(--twitter-extra-light-gray)]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--twitter-dark-gray)]" />
          <input
            type="text"
            placeholder="Search your bookmarks"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--twitter-extra-light-gray)] rounded-full text-[15px] text-[var(--twitter-black)] placeholder-[var(--twitter-dark-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--twitter-blue)] focus:bg-white transition-colors"
            autoFocus
          />
        </div>
      </form>

      {/* Search results or suggestions */}
      {query.trim() ? (
        <div>
          <div className="px-4 py-2 border-b border-[var(--twitter-extra-light-gray)]">
            <p className="text-sm text-[var(--twitter-dark-gray)]">
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </p>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[var(--twitter-dark-gray)]">
                No bookmarks match your search.
              </p>
            </div>
          ) : (
            results.slice(0, 20).map((bookmark) => (
              <TweetCard key={bookmark.tweet.id} tweet={bookmark.tweet} />
            ))
          )}
        </div>
      ) : (
        <div>
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="border-b border-[var(--twitter-extra-light-gray)]">
              <h3 className="px-4 py-3 font-bold text-[var(--twitter-black)] flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent searches
              </h3>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(term);
                    saveSearch(term);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[var(--twitter-bg-gray)] transition-colors flex items-center gap-3"
                >
                  <Search className="w-5 h-5 text-[var(--twitter-dark-gray)]" />
                  <span className="text-[var(--twitter-black)]">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Top authors */}
          {topAuthors.length > 0 && (
            <div>
              <h3 className="px-4 py-3 font-bold text-[var(--twitter-black)] flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Most bookmarked authors
              </h3>
              {topAuthors.map((author) => (
                <button
                  key={author.screen_name}
                  onClick={() => setQuery(`@${author.screen_name}`)}
                  className="w-full px-4 py-3 text-left hover:bg-[var(--twitter-bg-gray)] transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--twitter-blue)] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--twitter-black)]">
                      {author.name}
                    </p>
                    <p className="text-sm text-[var(--twitter-dark-gray)]">
                      @{author.screen_name} · {author.count} bookmarks
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {bookmarks.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-[var(--twitter-dark-gray)]">
                Upload your Twitter archive to start searching.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

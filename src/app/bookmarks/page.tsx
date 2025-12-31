'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { TweetCard } from '@/components/TweetCard';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const { bookmarks, categories, getFilteredBookmarks, selectedCategory, searchQuery } = useBookmarkStore();
  const [mounted, setMounted] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div>
        <Header title="Bookmarks" showBack />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[var(--twitter-blue)] animate-spin" />
        </div>
      </div>
    );
  }

  const filteredBookmarks = getFilteredBookmarks();

  // Get category color for filtered bookmarks
  const getCategoryColor = (tweetId: string) => {
    for (const category of categories) {
      if (category.bookmarkIds.includes(tweetId)) {
        return category.color;
      }
    }
    return undefined;
  };

  if (bookmarks.length === 0) {
    return (
      <div>
        <Header title="Bookmarks" showBack />
        <div className="p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-[var(--twitter-extra-light-gray)] mb-4">
            <Upload className="w-8 h-8 text-[var(--twitter-dark-gray)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--twitter-black)] mb-2">
            No Bookmarks Yet
          </h3>
          <p className="text-[var(--twitter-dark-gray)] mb-4">
            Upload your Twitter archive to view your bookmarks.
          </p>
          <Link href="/upload" className="btn-twitter btn-twitter-primary">
            Upload Archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Bookmarks"
        subtitle={`${bookmarks.length} saved tweets`}
        showBack
      />

      {/* Search */}
      <div className="p-4 border-b border-[var(--twitter-extra-light-gray)]">
        <SearchBar />
      </div>

      {/* Category Filter */}
      <CategoryFilter />

      {/* Results info */}
      {(searchQuery || selectedCategory) && (
        <div className="px-4 py-2 bg-[var(--twitter-bg-gray)] border-b border-[var(--twitter-extra-light-gray)]">
          <p className="text-sm text-[var(--twitter-dark-gray)]">
            Showing {filteredBookmarks.length} of {bookmarks.length} bookmarks
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Bookmarks list */}
      {filteredBookmarks.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-[var(--twitter-dark-gray)]">
            No bookmarks match your search.
          </p>
        </div>
      ) : (
        <>
          {filteredBookmarks.slice(0, displayCount).map((bookmark) => (
            <TweetCard
              key={bookmark.tweet.id}
              tweet={bookmark.tweet}
              categoryColor={getCategoryColor(bookmark.tweet.id)}
            />
          ))}

          {/* Load more button */}
          {displayCount < filteredBookmarks.length && (
            <button
              onClick={() => setDisplayCount((prev) => prev + 20)}
              className="w-full p-4 text-[var(--twitter-blue)] hover:bg-[var(--twitter-bg-gray)] transition-colors border-b border-[var(--twitter-extra-light-gray)]"
            >
              Show more ({filteredBookmarks.length - displayCount} remaining)
            </button>
          )}
        </>
      )}
    </div>
  );
}

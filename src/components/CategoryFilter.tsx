'use client';

import { useBookmarkStore } from '@/store/bookmarkStore';

export function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory } = useBookmarkStore();

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white border-b border-[var(--twitter-extra-light-gray)]">
      <button
        onClick={() => setSelectedCategory(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selectedCategory === null
            ? 'bg-[var(--twitter-blue)] text-white'
            : 'bg-[var(--twitter-extra-light-gray)] text-[var(--twitter-black)] hover:bg-[var(--twitter-light-gray)]'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
            selectedCategory === category.id
              ? 'text-white'
              : 'bg-[var(--twitter-extra-light-gray)] text-[var(--twitter-black)] hover:bg-[var(--twitter-light-gray)]'
          }`}
          style={
            selectedCategory === category.id
              ? { backgroundColor: category.color }
              : {}
          }
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          {category.name}
          <span className="opacity-70">
            ({category.bookmarkIds.length})
          </span>
        </button>
      ))}
    </div>
  );
}

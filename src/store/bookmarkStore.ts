import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bookmark, BookmarkCategory, AnalysisResult } from '@/types';

interface BookmarkStore {
  bookmarks: Bookmark[];
  categories: BookmarkCategory[];
  analysis: AnalysisResult | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  error: string | null;

  // Actions
  setBookmarks: (bookmarks: Bookmark[]) => void;
  addBookmarks: (bookmarks: Bookmark[]) => void;
  clearBookmarks: () => void;
  setCategories: (categories: BookmarkCategory[]) => void;
  setAnalysis: (analysis: AnalysisResult | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setError: (error: string | null) => void;

  // Computed helpers
  getFilteredBookmarks: () => Bookmark[];
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      categories: [],
      analysis: null,
      isLoading: false,
      isAnalyzing: false,
      searchQuery: '',
      selectedCategory: null,
      error: null,

      setBookmarks: (bookmarks) => set({ bookmarks }),
      addBookmarks: (newBookmarks) =>
        set((state) => ({
          bookmarks: [...state.bookmarks, ...newBookmarks],
        })),
      clearBookmarks: () =>
        set({
          bookmarks: [],
          categories: [],
          analysis: null,
          selectedCategory: null,
          searchQuery: '',
        }),
      setCategories: (categories) => set({ categories }),
      setAnalysis: (analysis) => set({ analysis }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setError: (error) => set({ error }),

      getFilteredBookmarks: () => {
        const { bookmarks, searchQuery, selectedCategory, categories } = get();

        let filtered = bookmarks;

        // Filter by search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (b) =>
              b.tweet.full_text.toLowerCase().includes(query) ||
              b.tweet.user.name.toLowerCase().includes(query) ||
              b.tweet.user.screen_name.toLowerCase().includes(query)
          );
        }

        // Filter by category
        if (selectedCategory) {
          const category = categories.find((c) => c.id === selectedCategory);
          if (category) {
            filtered = filtered.filter((b) =>
              category.bookmarkIds.includes(b.tweet.id)
            );
          }
        }

        return filtered;
      },
    }),
    {
      name: 'bookmark-storage',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        categories: state.categories,
        analysis: state.analysis,
      }),
    }
  )
);

'use client';

import { Header } from '@/components/Header';
import { FileUpload } from '@/components/FileUpload';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { Trash2 } from 'lucide-react';

export default function UploadPage() {
  const { bookmarks, clearBookmarks } = useBookmarkStore();

  return (
    <div>
      <Header
        title="Upload"
        subtitle="Import your Twitter bookmarks"
        showBack
      />

      <div className="p-4">
        <FileUpload />

        {bookmarks.length > 0 && (
          <div className="mt-6 p-4 bg-[var(--twitter-bg-gray)] rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[var(--twitter-black)]">
                  Current Data
                </h4>
                <p className="text-sm text-[var(--twitter-dark-gray)]">
                  {bookmarks.length} bookmarks loaded
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all bookmarks?')) {
                    clearBookmarks();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

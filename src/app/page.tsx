'use client';

import { Bookmark, Upload, BarChart3, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { TwitterBird } from '@/components/TwitterBird';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { TweetCard } from '@/components/TweetCard';

export default function HomePage() {
  const { bookmarks, analysis } = useBookmarkStore();

  return (
    <div>
      <Header title="Home" showLogo />

      {/* Hero Section */}
      <div className="p-6 border-b border-[var(--twitter-extra-light-gray)]">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-[var(--twitter-blue)] flex items-center justify-center">
            <TwitterBird className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--twitter-black)]">
              Bookmark Analysis
            </h2>
            <p className="text-[var(--twitter-dark-gray)]">
              Make your Twitter bookmarks meaningful
            </p>
          </div>
        </div>

        <p className="text-[var(--twitter-black)] leading-relaxed mb-6">
          You bookmark so much on Twitter, but finding anything later is impossible.
          Upload your Twitter data archive and let AI help you discover patterns,
          categorize tweets, and find what you&apos;re looking for.
        </p>

        {bookmarks.length === 0 ? (
          <Link
            href="/upload"
            className="btn-twitter btn-twitter-primary inline-flex items-center"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Your Archive
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        ) : (
          <div className="flex gap-3">
            <Link
              href="/bookmarks"
              className="btn-twitter btn-twitter-primary inline-flex items-center"
            >
              <Bookmark className="w-5 h-5 mr-2" />
              View Bookmarks ({bookmarks.length})
            </Link>
            <Link
              href="/analysis"
              className="btn-twitter btn-twitter-outline inline-flex items-center"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Analyze
            </Link>
          </div>
        )}
      </div>

      {/* Features */}
      {bookmarks.length === 0 && (
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-[var(--twitter-black)]">
            Features
          </h3>

          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-[var(--twitter-bg-gray)]">
              <div className="w-10 h-10 rounded-full bg-[var(--twitter-blue-light)] flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5 text-[var(--twitter-blue)]" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--twitter-black)]">
                  Easy Import
                </h4>
                <p className="text-[var(--twitter-dark-gray)] text-sm">
                  Simply upload your Twitter data archive - no API keys needed
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-[var(--twitter-bg-gray)]">
              <div className="w-10 h-10 rounded-full bg-[var(--twitter-blue-light)] flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-[var(--twitter-blue)]" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--twitter-black)]">
                  AI-Powered Analysis
                </h4>
                <p className="text-[var(--twitter-dark-gray)] text-sm">
                  Automatically categorize and find patterns in your bookmarks
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-[var(--twitter-bg-gray)]">
              <div className="w-10 h-10 rounded-full bg-[var(--twitter-blue-light)] flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-[var(--twitter-blue)]" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--twitter-black)]">
                  Smart Search
                </h4>
                <p className="text-[var(--twitter-dark-gray)] text-sm">
                  Find that tweet you bookmarked months ago with ease
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-[var(--twitter-bg-gray)]">
              <div className="w-10 h-10 rounded-full bg-[var(--twitter-blue-light)] flex items-center justify-center flex-shrink-0">
                <Bookmark className="w-5 h-5 text-[var(--twitter-blue)]" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--twitter-black)]">
                  Classic Twitter Feel
                </h4>
                <p className="text-[var(--twitter-dark-gray)] text-sm">
                  Browse your bookmarks in a beautiful, familiar interface
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookmarks Preview */}
      {bookmarks.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--twitter-extra-light-gray)]">
            <h3 className="text-lg font-bold text-[var(--twitter-black)]">
              Recent Bookmarks
            </h3>
            <Link
              href="/bookmarks"
              className="text-[var(--twitter-blue)] text-sm hover:underline"
            >
              See all
            </Link>
          </div>

          {bookmarks.slice(0, 3).map((bookmark) => (
            <TweetCard key={bookmark.tweet.id} tweet={bookmark.tweet} />
          ))}

          {bookmarks.length > 3 && (
            <Link
              href="/bookmarks"
              className="block p-4 text-center text-[var(--twitter-blue)] hover:bg-[var(--twitter-bg-gray)] transition-colors"
            >
              Show {bookmarks.length - 3} more bookmarks
            </Link>
          )}
        </div>
      )}

      {/* Analysis Preview */}
      {analysis && (
        <div className="border-t border-[var(--twitter-extra-light-gray)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--twitter-extra-light-gray)]">
            <h3 className="text-lg font-bold text-[var(--twitter-black)]">
              Your Insights
            </h3>
            <Link
              href="/analysis"
              className="text-[var(--twitter-blue)] text-sm hover:underline"
            >
              Full analysis
            </Link>
          </div>

          <div className="p-4">
            <p className="text-[var(--twitter-black)] mb-4">
              {analysis.summary}
            </p>

            <div className="flex flex-wrap gap-2">
              {analysis.themes.map((theme, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[var(--twitter-blue-light)] text-[var(--twitter-blue)] rounded-full text-sm font-medium"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

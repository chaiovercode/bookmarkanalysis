'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { Key, Trash2, Download, Info, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const { bookmarks, clearBookmarks } = useBookmarkStore();
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [saved, setSaved] = useState(false);

  // Load keys from localStorage
  useEffect(() => {
    const savedOpenaiKey = localStorage.getItem('openai-api-key');
    const savedClaudeKey = localStorage.getItem('claude-api-key');
    if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
    if (savedClaudeKey) setClaudeKey(savedClaudeKey);
  }, []);

  const saveKeys = () => {
    localStorage.setItem('openai-api-key', openaiKey);
    localStorage.setItem('claude-api-key', claudeKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = () => {
    const data = {
      bookmarks,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Header title="Settings" showBack />

      <div className="p-4 space-y-6">
        {/* API Keys */}
        <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-6">
          <h3 className="text-lg font-bold text-[var(--twitter-black)] mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-[var(--twitter-blue)]" />
            API Keys
          </h3>

          <p className="text-sm text-[var(--twitter-dark-gray)] mb-4">
            Add your API keys to enable AI-powered analysis. Keys are stored locally in your browser.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--twitter-black)] mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 rounded-lg border border-[var(--twitter-extra-light-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--twitter-blue)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--twitter-black)] mb-2">
                Anthropic API Key
              </label>
              <input
                type="password"
                value={claudeKey}
                onChange={(e) => setClaudeKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-2 rounded-lg border border-[var(--twitter-extra-light-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--twitter-blue)]"
              />
            </div>

            <button
              onClick={saveKeys}
              className="btn-twitter btn-twitter-primary"
            >
              {saved ? 'Saved!' : 'Save Keys'}
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-6">
          <h3 className="text-lg font-bold text-[var(--twitter-black)] mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-[var(--twitter-blue)]" />
            Data Management
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--twitter-bg-gray)] rounded-xl">
              <div>
                <h4 className="font-bold text-[var(--twitter-black)]">
                  Export Bookmarks
                </h4>
                <p className="text-sm text-[var(--twitter-dark-gray)]">
                  Download your bookmarks as JSON
                </p>
              </div>
              <button
                onClick={exportData}
                disabled={bookmarks.length === 0}
                className="btn-twitter btn-twitter-outline disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div>
                <h4 className="font-bold text-red-700">
                  Clear All Data
                </h4>
                <p className="text-sm text-red-600">
                  Remove all bookmarks and analysis
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure? This cannot be undone.')) {
                    clearBookmarks();
                  }
                }}
                disabled={bookmarks.length === 0}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-6">
          <h3 className="text-lg font-bold text-[var(--twitter-black)] mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-[var(--twitter-blue)]" />
            About
          </h3>

          <div className="space-y-3 text-sm text-[var(--twitter-dark-gray)]">
            <p>
              <strong className="text-[var(--twitter-black)]">Bookmark Analysis</strong> helps you make sense of your Twitter bookmarks.
            </p>
            <p>
              Upload your Twitter data archive to browse, search, and analyze your saved tweets.
              Use AI to categorize and discover patterns in what you save.
            </p>
            <p>
              Your data stays in your browser. Nothing is uploaded to any server.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--twitter-extra-light-gray)]">
            <h4 className="font-bold text-[var(--twitter-black)] mb-2">
              How to get your Twitter archive:
            </h4>
            <ol className="text-sm text-[var(--twitter-dark-gray)] space-y-1 list-decimal list-inside">
              <li>Go to Settings and Privacy on Twitter/X</li>
              <li>Click &quot;Your Account&quot; → &quot;Download an archive of your data&quot;</li>
              <li>Request your archive and wait for the email (can take 24h+)</li>
              <li>Download and upload the .zip file here</li>
            </ol>
            <a
              href="https://twitter.com/settings/download_your_data"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-[var(--twitter-blue)] hover:underline"
            >
              Go to Twitter Settings
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Stats */}
        {bookmarks.length > 0 && (
          <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-6">
            <h3 className="text-lg font-bold text-[var(--twitter-black)] mb-4">
              Your Stats
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--twitter-bg-gray)] rounded-xl text-center">
                <p className="text-3xl font-bold text-[var(--twitter-blue)]">
                  {bookmarks.length}
                </p>
                <p className="text-sm text-[var(--twitter-dark-gray)]">
                  Bookmarks
                </p>
              </div>
              <div className="p-4 bg-[var(--twitter-bg-gray)] rounded-xl text-center">
                <p className="text-3xl font-bold text-[var(--twitter-blue)]">
                  {new Set(bookmarks.map(b => b.tweet.user.screen_name)).size}
                </p>
                <p className="text-sm text-[var(--twitter-dark-gray)]">
                  Authors
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

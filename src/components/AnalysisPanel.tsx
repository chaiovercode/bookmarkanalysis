'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Lightbulb,
  Tags,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { analyzeBookmarks, analyzeWithClaude, analyzeLocally } from '@/lib/analyze';

type AnalysisProvider = 'local' | 'openai' | 'claude';

export function AnalysisPanel() {
  const {
    bookmarks,
    analysis,
    isAnalyzing,
    setAnalysis,
    setCategories,
    setIsAnalyzing,
    setError,
  } = useBookmarkStore();

  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<AnalysisProvider>('local');
  const [showApiInput, setShowApiInput] = useState(false);

  const handleAnalyze = async () => {
    if (bookmarks.length === 0) {
      setError('No bookmarks to analyze. Please upload your Twitter archive first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      let result;

      if (provider === 'local') {
        result = analyzeLocally(bookmarks);
      } else if (provider === 'openai') {
        if (!apiKey) {
          setShowApiInput(true);
          setIsAnalyzing(false);
          return;
        }
        result = await analyzeBookmarks(bookmarks, apiKey);
      } else if (provider === 'claude') {
        if (!apiKey) {
          setShowApiInput(true);
          setIsAnalyzing(false);
          return;
        }
        result = await analyzeWithClaude(bookmarks, apiKey);
      }

      if (result) {
        setAnalysis(result);
        setCategories(result.categories);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-[var(--twitter-extra-light-gray)] mb-4">
          <BarChart3 className="w-8 h-8 text-[var(--twitter-dark-gray)]" />
        </div>
        <h3 className="text-xl font-bold text-[var(--twitter-black)] mb-2">
          No Bookmarks Yet
        </h3>
        <p className="text-[var(--twitter-dark-gray)] mb-4">
          Upload your Twitter archive to analyze your bookmarks.
        </p>
        <a href="/upload" className="btn-twitter btn-twitter-primary">
          Upload Archive
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-6">
        <h3 className="text-lg font-bold text-[var(--twitter-black)] mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--twitter-blue)]" />
          Analyze Your Bookmarks
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--twitter-black)] mb-2">
              Analysis Method
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setProvider('local');
                  setShowApiInput(false);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  provider === 'local'
                    ? 'bg-[var(--twitter-blue)] text-white'
                    : 'bg-[var(--twitter-extra-light-gray)] text-[var(--twitter-black)]'
                }`}
              >
                Local (Fast)
              </button>
              <button
                onClick={() => {
                  setProvider('openai');
                  setShowApiInput(true);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  provider === 'openai'
                    ? 'bg-[var(--twitter-blue)] text-white'
                    : 'bg-[var(--twitter-extra-light-gray)] text-[var(--twitter-black)]'
                }`}
              >
                OpenAI
              </button>
              <button
                onClick={() => {
                  setProvider('claude');
                  setShowApiInput(true);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  provider === 'claude'
                    ? 'bg-[var(--twitter-blue)] text-white'
                    : 'bg-[var(--twitter-extra-light-gray)] text-[var(--twitter-black)]'
                }`}
              >
                Claude
              </button>
            </div>
          </div>

          {showApiInput && (provider === 'openai' || provider === 'claude') && (
            <div>
              <label className="block text-sm font-medium text-[var(--twitter-black)] mb-2">
                {provider === 'openai' ? 'OpenAI' : 'Anthropic'} API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key`}
                className="w-full px-4 py-2 rounded-lg border border-[var(--twitter-extra-light-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--twitter-blue)]"
              />
              <p className="mt-1 text-xs text-[var(--twitter-dark-gray)]">
                Your API key is used client-side and never stored.
              </p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn-twitter btn-twitter-primary w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5 mr-2" />
                Analyze {bookmarks.length} Bookmarks
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Summary */}
          <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-6">
            <h3 className="text-lg font-bold text-[var(--twitter-black)] mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--twitter-blue)]" />
              Summary
            </h3>
            <p className="text-[var(--twitter-black)] leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Themes */}
          <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-6">
            <h3 className="text-lg font-bold text-[var(--twitter-black)] mb-3 flex items-center gap-2">
              <Tags className="w-5 h-5 text-[var(--twitter-blue)]" />
              Themes
            </h3>
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

          {/* Top Topics */}
          <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-6">
            <h3 className="text-lg font-bold text-[var(--twitter-black)] mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--twitter-blue)]" />
              Top Topics
            </h3>
            <div className="space-y-3">
              {analysis.topTopics.map((topic, index) => {
                const maxCount = analysis.topTopics[0]?.count || 1;
                const percentage = (topic.count / maxCount) * 100;

                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-[var(--twitter-black)]">
                        {topic.topic}
                      </span>
                      <span className="text-[var(--twitter-dark-gray)]">
                        {topic.count}
                      </span>
                    </div>
                    <div className="w-full bg-[var(--twitter-extra-light-gray)] rounded-full h-2">
                      <div
                        className="bg-[var(--twitter-blue)] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-6">
            <h3 className="text-lg font-bold text-[var(--twitter-black)] mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[var(--twitter-blue)]" />
              Insights
            </h3>
            <ul className="space-y-3">
              {analysis.insights.map((insight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-[var(--twitter-black)]"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--twitter-blue-light)] text-[var(--twitter-blue)] flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-6">
            <h3 className="text-lg font-bold text-[var(--twitter-black)] mb-3">
              Categories
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {analysis.categories.map((category) => (
                <a
                  key={category.id}
                  href={`/bookmarks?category=${category.id}`}
                  className="p-4 rounded-xl border border-[var(--twitter-extra-light-gray)] hover:bg-[var(--twitter-bg-gray)] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-bold text-[var(--twitter-black)]">
                      {category.name}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--twitter-dark-gray)]">
                    {category.description}
                  </p>
                  <p className="text-sm text-[var(--twitter-blue)] mt-1">
                    {category.bookmarkIds.length} bookmarks
                  </p>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

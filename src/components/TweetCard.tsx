'use client';

import { format, parseISO } from 'date-fns';
import {
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  Bookmark,
  MoreHorizontal,
  BadgeCheck,
} from 'lucide-react';
import type { Tweet } from '@/types';

interface TweetCardProps {
  tweet: Tweet;
  showActions?: boolean;
  categoryColor?: string;
}

function formatNumber(num: number | undefined): string {
  if (!num) return '';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatDate(dateStr: string): string {
  try {
    // Try parsing as ISO date first
    let date: Date;
    try {
      date = parseISO(dateStr);
    } catch {
      // Twitter format: "Wed Oct 10 20:19:24 +0000 2018"
      date = new Date(dateStr);
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs}s`;
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    // If same year, show "Mon DD"
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'MMM d');
    }

    // Different year, show "Mon DD, YYYY"
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

// Parse tweet text and render with links, mentions, hashtags
function renderTweetText(text: string): React.ReactNode {
  // URL regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  // Mention regex
  const mentionRegex = /@(\w+)/g;
  // Hashtag regex
  const hashtagRegex = /#(\w+)/g;

  // Split by URLs first
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      // It's a URL - show shortened version
      const displayUrl = part.replace(/^https?:\/\//, '').slice(0, 30);
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--twitter-blue)] hover:underline"
        >
          {displayUrl}...
        </a>
      );
    }

    // Process mentions and hashtags
    let processed = part;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Combined regex for mentions and hashtags
    const combinedRegex = /(@\w+|#\w+)/g;
    let match;

    while ((match = combinedRegex.exec(part)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        elements.push(part.slice(lastIndex, match.index));
      }

      const matched = match[0];
      if (matched.startsWith('@')) {
        elements.push(
          <a
            key={`${i}-${match.index}`}
            href={`https://twitter.com/${matched.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--twitter-blue)] hover:underline"
          >
            {matched}
          </a>
        );
      } else if (matched.startsWith('#')) {
        elements.push(
          <a
            key={`${i}-${match.index}`}
            href={`https://twitter.com/hashtag/${matched.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--twitter-blue)] hover:underline"
          >
            {matched}
          </a>
        );
      }

      lastIndex = match.index + matched.length;
    }

    // Add remaining text
    if (lastIndex < part.length) {
      elements.push(part.slice(lastIndex));
    }

    return elements.length > 0 ? elements : part;
  });
}

function DefaultAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-12 h-12 rounded-full bg-[var(--twitter-blue)] flex items-center justify-center text-white font-bold text-lg">
      {initials || '?'}
    </div>
  );
}

export function TweetCard({ tweet, showActions = true, categoryColor }: TweetCardProps) {
  const profileImageUrl = tweet.user.profile_image_url?.replace(
    '_normal',
    '_bigger'
  );

  return (
    <article
      className="tweet-card animate-fade-in bg-white px-4 py-3 border-b border-[var(--twitter-extra-light-gray)] cursor-pointer relative"
      style={categoryColor ? { borderLeftColor: categoryColor, borderLeftWidth: '3px' } : {}}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={tweet.user.name}
              className="w-12 h-12 rounded-full"
              onError={(e) => {
                // Hide broken image and show fallback
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={profileImageUrl ? 'hidden' : ''}>
            <DefaultAvatar name={tweet.user.name} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 text-[15px]">
            <span className="font-bold text-[var(--twitter-black)] truncate hover:underline">
              {tweet.user.name}
            </span>
            {tweet.user.verified && (
              <BadgeCheck className="w-[18px] h-[18px] text-[var(--twitter-blue)] flex-shrink-0" />
            )}
            <span className="text-[var(--twitter-dark-gray)] truncate">
              @{tweet.user.screen_name}
            </span>
            <span className="text-[var(--twitter-dark-gray)]">·</span>
            <span className="text-[var(--twitter-dark-gray)] hover:underline flex-shrink-0">
              {formatDate(tweet.created_at)}
            </span>
            <button className="ml-auto p-2 -m-2 text-[var(--twitter-dark-gray)] hover:text-[var(--twitter-blue)] hover:bg-[var(--twitter-blue-light)] rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Reply indicator */}
          {tweet.in_reply_to_screen_name && (
            <div className="text-[var(--twitter-dark-gray)] text-[15px] mb-1">
              Replying to{' '}
              <a
                href={`https://twitter.com/${tweet.in_reply_to_screen_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--twitter-blue)] hover:underline"
              >
                @{tweet.in_reply_to_screen_name}
              </a>
            </div>
          )}

          {/* Tweet text */}
          <div className="text-[15px] text-[var(--twitter-black)] whitespace-pre-wrap break-words leading-5 mt-1">
            {renderTweetText(tweet.full_text)}
          </div>

          {/* Media */}
          {tweet.media && tweet.media.length > 0 && (
            <div
              className={`mt-3 rounded-2xl overflow-hidden border border-[var(--twitter-extra-light-gray)] ${
                tweet.media.length > 1 ? 'grid grid-cols-2 gap-0.5' : ''
              }`}
            >
              {tweet.media.slice(0, 4).map((media, index) => (
                <img
                  key={index}
                  src={media.url}
                  alt=""
                  className="w-full h-auto max-h-[300px] object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between mt-3 max-w-[425px] -ml-2">
              <button className="flex items-center gap-1 text-[var(--twitter-dark-gray)] hover:text-[var(--twitter-blue)] group">
                <div className="p-2 rounded-full group-hover:bg-[var(--twitter-blue-light)] transition-colors">
                  <MessageCircle className="w-[18px] h-[18px]" />
                </div>
                <span className="text-[13px]">
                  {formatNumber(tweet.reply_count)}
                </span>
              </button>

              <button className="flex items-center gap-1 text-[var(--twitter-dark-gray)] hover:text-green-500 group">
                <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                  <Repeat2 className="w-[18px] h-[18px]" />
                </div>
                <span className="text-[13px]">
                  {formatNumber(tweet.retweet_count)}
                </span>
              </button>

              <button className="flex items-center gap-1 text-[var(--twitter-dark-gray)] hover:text-pink-500 group">
                <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                  <Heart className="w-[18px] h-[18px]" />
                </div>
                <span className="text-[13px]">
                  {formatNumber(tweet.favorite_count)}
                </span>
              </button>

              <button className="flex items-center gap-1 text-[var(--twitter-blue)] group">
                <div className="p-2 rounded-full group-hover:bg-[var(--twitter-blue-light)] transition-colors">
                  <Bookmark className="w-[18px] h-[18px] fill-current" />
                </div>
              </button>

              <button className="flex items-center gap-1 text-[var(--twitter-dark-gray)] hover:text-[var(--twitter-blue)] group">
                <div className="p-2 rounded-full group-hover:bg-[var(--twitter-blue-light)] transition-colors">
                  <Share className="w-[18px] h-[18px]" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

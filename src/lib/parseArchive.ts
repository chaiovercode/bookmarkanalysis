import JSZip from 'jszip';
import type { Bookmark, Tweet, TwitterUser } from '@/types';

interface RawBookmark {
  tweet?: {
    id?: string;
    id_str?: string;
    full_text?: string;
    text?: string;
    created_at?: string;
    user?: {
      id_str?: string;
      name?: string;
      screen_name?: string;
      profile_image_url_https?: string;
      verified?: boolean;
    };
    favorite_count?: number;
    retweet_count?: number;
    reply_count?: number;
    extended_entities?: {
      media?: Array<{
        type: string;
        media_url_https: string;
      }>;
    };
    entities?: {
      urls?: Array<{
        url: string;
        expanded_url: string;
        display_url: string;
      }>;
    };
    in_reply_to_status_id_str?: string;
    in_reply_to_screen_name?: string;
    is_quote_status?: boolean;
  };
  tweetId?: string;
}

function parseUser(raw: RawBookmark['tweet']): TwitterUser {
  const user = raw?.user;
  return {
    id: user?.id_str || 'unknown',
    name: user?.name || 'Unknown User',
    screen_name: user?.screen_name || 'unknown',
    profile_image_url: user?.profile_image_url_https,
    verified: user?.verified,
  };
}

function parseTweet(raw: RawBookmark): Tweet | null {
  const tweet = raw.tweet;
  if (!tweet) return null;

  const id = tweet.id_str || tweet.id?.toString() || raw.tweetId;
  if (!id) return null;

  const media = tweet.extended_entities?.media?.map((m) => ({
    type: m.type as 'photo' | 'video' | 'animated_gif',
    url: m.media_url_https,
    preview_url: m.media_url_https,
  }));

  return {
    id,
    full_text: tweet.full_text || tweet.text || '',
    created_at: tweet.created_at || new Date().toISOString(),
    user: parseUser(tweet),
    favorite_count: tweet.favorite_count,
    retweet_count: tweet.retweet_count,
    reply_count: tweet.reply_count,
    media,
    urls: tweet.entities?.urls,
    in_reply_to_status_id: tweet.in_reply_to_status_id_str,
    in_reply_to_screen_name: tweet.in_reply_to_screen_name,
    is_quote_status: tweet.is_quote_status,
  };
}

export async function parseTwitterArchive(file: File): Promise<Bookmark[]> {
  const bookmarks: Bookmark[] = [];

  try {
    const zip = await JSZip.loadAsync(file);

    // Look for bookmark files in the archive
    // Twitter archives typically have data in /data/ folder
    const possiblePaths = [
      'data/bookmarks.js',
      'data/bookmark.js',
      'bookmarks.js',
      'bookmark.js',
      'data/like.js', // fallback to likes if no bookmarks
      'data/likes.js',
    ];

    let bookmarkData: string | null = null;
    let foundPath: string | null = null;

    for (const path of possiblePaths) {
      const zipFile = zip.file(path);
      if (zipFile) {
        bookmarkData = await zipFile.async('string');
        foundPath = path;
        break;
      }
    }

    // Also try to find any file containing "bookmark" in the name
    if (!bookmarkData) {
      const files = Object.keys(zip.files);
      for (const filePath of files) {
        if (
          filePath.toLowerCase().includes('bookmark') &&
          filePath.endsWith('.js')
        ) {
          const zipFile = zip.file(filePath);
          if (zipFile) {
            bookmarkData = await zipFile.async('string');
            foundPath = filePath;
            break;
          }
        }
      }
    }

    if (!bookmarkData) {
      // Try to find JSON files as well
      const files = Object.keys(zip.files);
      for (const filePath of files) {
        if (
          filePath.toLowerCase().includes('bookmark') &&
          filePath.endsWith('.json')
        ) {
          const zipFile = zip.file(filePath);
          if (zipFile) {
            bookmarkData = await zipFile.async('string');
            foundPath = filePath;
            break;
          }
        }
      }
    }

    if (!bookmarkData) {
      throw new Error(
        'Could not find bookmarks data in the archive. Please make sure you uploaded a valid Twitter data archive.'
      );
    }

    // Twitter archive JS files start with variable assignment like:
    // window.YTD.bookmark.part0 = [...]
    // We need to extract the JSON array
    let jsonData: RawBookmark[];

    if (foundPath?.endsWith('.js')) {
      // Remove the variable assignment to get pure JSON
      const jsonMatch = bookmarkData.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Could not parse Twitter archive format');
      }
    } else {
      jsonData = JSON.parse(bookmarkData);
    }

    // Parse each bookmark
    for (const raw of jsonData) {
      const tweet = parseTweet(raw);
      if (tweet) {
        bookmarks.push({
          tweet,
          bookmarked_at: tweet.created_at,
        });
      }
    }

    // Sort by date (newest first)
    bookmarks.sort((a, b) => {
      const dateA = new Date(a.tweet.created_at).getTime();
      const dateB = new Date(b.tweet.created_at).getTime();
      return dateB - dateA;
    });

    return bookmarks;
  } catch (error) {
    console.error('Error parsing archive:', error);
    throw error;
  }
}

// For parsing a JSON file directly (if user exports just bookmarks.json)
export async function parseBookmarksJson(file: File): Promise<Bookmark[]> {
  const text = await file.text();
  let jsonData: RawBookmark[];

  // Check if it's a JS file format
  if (file.name.endsWith('.js')) {
    const jsonMatch = text.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/);
    if (jsonMatch) {
      jsonData = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error('Could not parse file format');
    }
  } else {
    jsonData = JSON.parse(text);
  }

  const bookmarks: Bookmark[] = [];

  for (const raw of jsonData) {
    const tweet = parseTweet(raw);
    if (tweet) {
      bookmarks.push({
        tweet,
        bookmarked_at: tweet.created_at,
      });
    }
  }

  return bookmarks;
}

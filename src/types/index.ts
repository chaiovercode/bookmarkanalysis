export interface TwitterUser {
  id: string;
  name: string;
  screen_name: string;
  profile_image_url?: string;
  verified?: boolean;
}

export interface TweetMedia {
  type: 'photo' | 'video' | 'animated_gif';
  url: string;
  preview_url?: string;
}

export interface Tweet {
  id: string;
  full_text: string;
  created_at: string;
  user: TwitterUser;
  favorite_count?: number;
  retweet_count?: number;
  reply_count?: number;
  media?: TweetMedia[];
  urls?: { url: string; expanded_url: string; display_url: string }[];
  in_reply_to_status_id?: string;
  in_reply_to_screen_name?: string;
  is_quote_status?: boolean;
  quoted_tweet?: Tweet;
}

export interface Bookmark {
  tweet: Tweet;
  bookmarked_at?: string;
}

export interface BookmarkCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  bookmarkIds: string[];
}

export interface AnalysisResult {
  categories: BookmarkCategory[];
  themes: string[];
  summary: string;
  insights: string[];
  topTopics: { topic: string; count: number }[];
}

export interface AppState {
  bookmarks: Bookmark[];
  categories: BookmarkCategory[];
  analysis: AnalysisResult | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  error: string | null;
}

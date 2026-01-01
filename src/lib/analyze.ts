import type { Bookmark, AnalysisResult, BookmarkCategory } from '@/types';

const CATEGORY_COLORS = [
  '#1DA1F2', // Twitter blue
  '#17BF63', // Green
  '#FFAD1F', // Orange
  '#F45D22', // Red-orange
  '#E0245E', // Pink
  '#794BC4', // Purple
  '#1DA1F2', // Blue (repeat for more categories)
];

export async function analyzeBookmarks(
  bookmarks: Bookmark[],
  apiKey: string
): Promise<AnalysisResult> {
  // Prepare bookmark summaries for analysis
  const bookmarkSummaries = bookmarks.slice(0, 100).map((b) => ({
    id: b.tweet.id,
    text: b.tweet.full_text.slice(0, 500),
    author: b.tweet.user.screen_name,
  }));

  const prompt = `You are analyzing a user's Twitter bookmarks to help them understand and organize their saved content.

Here are the bookmarks (up to 100):

${JSON.stringify(bookmarkSummaries, null, 2)}

Please analyze these bookmarks and provide:

1. **Categories**: Create 4-7 meaningful categories that group these bookmarks by topic/theme. For each category, list the bookmark IDs that belong to it.

2. **Themes**: Identify 3-5 overarching themes or interests represented in the bookmarks.

3. **Summary**: Write a 2-3 sentence summary of what this person tends to bookmark.

4. **Insights**: Provide 3-4 interesting insights about the user's bookmarking habits or interests.

5. **Top Topics**: List the top 5 specific topics with approximate counts.

Respond in this exact JSON format:
{
  "categories": [
    {
      "id": "category-1",
      "name": "Category Name",
      "description": "Brief description",
      "bookmarkIds": ["id1", "id2"]
    }
  ],
  "themes": ["theme1", "theme2"],
  "summary": "Summary text here",
  "insights": ["insight1", "insight2"],
  "topTopics": [
    {"topic": "Topic Name", "count": 10}
  ]
}

Only respond with valid JSON, no other text.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  // Parse the JSON response
  const result = JSON.parse(content);

  // Add colors to categories
  const categoriesWithColors: BookmarkCategory[] = result.categories.map(
    (cat: BookmarkCategory, index: number) => ({
      ...cat,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    })
  );

  return {
    categories: categoriesWithColors,
    themes: result.themes,
    summary: result.summary,
    insights: result.insights,
    topTopics: result.topTopics,
  };
}

// Analyze with Claude API
export async function analyzeWithClaude(
  bookmarks: Bookmark[],
  apiKey: string
): Promise<AnalysisResult> {
  const bookmarkSummaries = bookmarks.slice(0, 100).map((b) => ({
    id: b.tweet.id,
    text: b.tweet.full_text.slice(0, 500),
    author: b.tweet.user.screen_name,
  }));

  const prompt = `You are analyzing a user's Twitter bookmarks to help them understand and organize their saved content.

Here are the bookmarks (up to 100):

${JSON.stringify(bookmarkSummaries, null, 2)}

Please analyze these bookmarks and provide:

1. **Categories**: Create 4-7 meaningful categories that group these bookmarks by topic/theme. For each category, list the bookmark IDs that belong to it.

2. **Themes**: Identify 3-5 overarching themes or interests represented in the bookmarks.

3. **Summary**: Write a 2-3 sentence summary of what this person tends to bookmark.

4. **Insights**: Provide 3-4 interesting insights about the user's bookmarking habits or interests.

5. **Top Topics**: List the top 5 specific topics with approximate counts.

Respond in this exact JSON format:
{
  "categories": [
    {
      "id": "category-1",
      "name": "Category Name",
      "description": "Brief description",
      "bookmarkIds": ["id1", "id2"]
    }
  ],
  "themes": ["theme1", "theme2"],
  "summary": "Summary text here",
  "insights": ["insight1", "insight2"],
  "topTopics": [
    {"topic": "Topic Name", "count": 10}
  ]
}

Only respond with valid JSON, no other text.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  if (!content) {
    throw new Error('No response from Claude');
  }

  const result = JSON.parse(content);

  const categoriesWithColors: BookmarkCategory[] = result.categories.map(
    (cat: BookmarkCategory, index: number) => ({
      ...cat,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    })
  );

  return {
    categories: categoriesWithColors,
    themes: result.themes,
    summary: result.summary,
    insights: result.insights,
    topTopics: result.topTopics,
  };
}

// Simple local analysis without API (basic keyword extraction)
export function analyzeLocally(bookmarks: Bookmark[]): AnalysisResult {
  const wordCounts: Record<string, number> = {};
  const authorCounts: Record<string, number> = {};

  // Common words to ignore
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'just', 'can', 'your',
    'my', 'his', 'her', 'its', 'our', 'their', 'if', 'then', 'else',
    'about', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'under', 'again', 'further', 'once', 'here',
    'there', 'any', 'out', 'up', 'down', 'off', 'over', 'under', 'https',
    'http', 'www', 'com', 't', 'co', 'rt', 'amp', 's', 're', 've', 'll',
    'don', 'doesn', 'didn', 'won', 'wouldn', 'couldn', 'shouldn', 'get',
    'got', 'getting', 'like', 'just', 'now', 'new', 'one', 'also', 'us',
    'im', 'ive', 'dont', 'youre', 'theyre', 'weve', 'thats', 'its', 'hes',
    'shes', 'cant', 'wont', 'didnt', 'doesnt', 'isnt', 'arent', 'wasnt',
    'werent', 'hasnt', 'havent', 'hadnt', 'being', 'really', 'going',
    'make', 'made', 'making', 'thing', 'things', 'way', 'want', 'see',
    'know', 'think', 'time', 'good', 'well', 'back', 'even', 'still',
  ]);

  for (const bookmark of bookmarks) {
    // Count words
    const words = bookmark.tweet.full_text
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    // Count authors
    const author = bookmark.tweet.user.screen_name;
    authorCounts[author] = (authorCounts[author] || 0) + 1;
  }

  // Get top topics
  const topTopics = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }));

  // Get top authors
  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Create simple categories based on top words
  const categoryKeywords = topTopics.slice(0, 6);
  const categories: BookmarkCategory[] = categoryKeywords.map(
    ({ topic }, index) => {
      const matchingBookmarks = bookmarks.filter((b) =>
        b.tweet.full_text.toLowerCase().includes(topic.toLowerCase())
      );

      return {
        id: `category-${index + 1}`,
        name: topic.charAt(0).toUpperCase() + topic.slice(1),
        description: `Tweets mentioning "${topic}"`,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        bookmarkIds: matchingBookmarks.map((b) => b.tweet.id),
      };
    }
  );

  return {
    categories,
    themes: topTopics.slice(0, 5).map((t) => t.topic),
    summary: `You have ${bookmarks.length} bookmarks from ${Object.keys(authorCounts).length} different authors. Your most bookmarked topics include ${topTopics
      .slice(0, 3)
      .map((t) => t.topic)
      .join(', ')}.`,
    insights: [
      `Your most bookmarked author is @${topAuthors[0]?.[0] || 'unknown'} with ${topAuthors[0]?.[1] || 0} bookmarks`,
      `Top topic "${topTopics[0]?.topic || 'unknown'}" appears in ${topTopics[0]?.count || 0} bookmarks`,
      `You have bookmarks from ${Object.keys(authorCounts).length} unique accounts`,
      `Average bookmark length: ${Math.round(bookmarks.reduce((sum, b) => sum + b.tweet.full_text.length, 0) / bookmarks.length)} characters`,
    ],
    topTopics: topTopics.slice(0, 5),
  };
}

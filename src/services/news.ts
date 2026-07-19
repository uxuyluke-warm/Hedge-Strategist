export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: "positive" | "negative" | "neutral";
}

let cached: NewsItem[] | null = null;
let lastFetch = 0;

export async function fetchNews(asset: string): Promise<NewsItem[]> {
  if (cached && Date.now() - lastFetch < 120_000) return cached;
  try {
    const res = await fetch(`/api/news?asset=${encodeURIComponent(asset)}`);
    const data = (await res.json()) as { news: NewsItem[] };
    cached = data.news;
    lastFetch = Date.now();
    return cached;
  } catch {
    return [];
  }
}

export function newsToPrompt(news: NewsItem[]): string {
  if (!news.length) return "";
  return (
    "Recent crypto news:\n" +
    news.map((n) => `- [${n.sentiment}] ${n.title} (${n.source})`).join("\n")
  );
}
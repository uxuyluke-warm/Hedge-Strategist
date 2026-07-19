import { useEffect, useState } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { fetchNews } from "@/services/news";
import { ExternalLink, Newspaper, Loader2 } from "lucide-react";
import type { NewsItem } from "@/services/news";

export function NewsFeed() {
  const { asset } = useDashboard();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchNews(asset).then((items) => {
      if (cancelled) return;
      setNews(items.slice(0, 4));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [asset]);

  if (loading && !news.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading news…
        </div>
      </div>
    );
  }

  if (!news.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-muted-foreground" />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Crypto News</span>
      </div>
      <div className="space-y-2">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 text-xs leading-relaxed text-muted-foreground hover:text-foreground transition-colors"
          >
            <SentimentDot sentiment={item.sentiment} />
            <span className="flex-1 line-clamp-2">{item.title}</span>
            <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );
}

function SentimentDot({ sentiment }: { sentiment: string }) {
  const color =
    sentiment === "positive"
      ? "bg-emerald-500"
      : sentiment === "negative"
        ? "bg-destructive"
        : "bg-muted-foreground";
  return <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${color}`} />;
}
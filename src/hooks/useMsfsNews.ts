import { useEffect, useState } from "react";

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  image: string | null;
  summary: string;
  published: string;
}

// Community-maintained mirror of the official flightsimulator.com blog
// (updated daily), since the official site has no RSS feed of its own.
const FEED_URL = "https://raw.githubusercontent.com/evroon/msfs-rss/main/feeds/msfs.xml";

const fetchMsfsNews = async (): Promise<NewsItem[]> => {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error("Couldn't load the news feed.");

  const xmlText = await res.text();
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("News feed returned invalid data.");

  const items = Array.from(doc.getElementsByTagName("entry")).map((entry) => {
    const links = Array.from(entry.getElementsByTagName("link")).map((el) => el.getAttribute("href") ?? "");
    const summary = entry.getElementsByTagName("summary")[0]?.textContent ?? "";

    return {
      id: entry.getElementsByTagName("id")[0]?.textContent ?? links[0] ?? crypto.randomUUID(),
      title: entry.getElementsByTagName("title")[0]?.textContent ?? "Untitled",
      link: links[0] ?? "https://www.flightsimulator.com",
      image: links[1] ?? null,
      summary: summary.replace(/…\s*Continued\s*$/i, "…").trim(),
      published: entry.getElementsByTagName("published")[0]?.textContent ?? "",
    };
  });

  // The feed occasionally lists the same post twice (e.g. after it's updated).
  const seen = new Set<string>();
  return items.filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)));
};

export const useMsfsNews = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMsfsNews()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
};

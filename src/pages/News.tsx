import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Loader2, ExternalLink, Plane } from "lucide-react";
import { useMsfsNews } from "@/hooks/useMsfsNews";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const News = () => {
  const { items, loading, error } = useMsfsNews();

  useEffect(() => {
    document.title = "News | Alpivion Network";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Sim Updates</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">News</h1>
            <p className="text-muted-foreground text-lg">
              The latest from Microsoft Flight Simulator 2020 and 2024 — sourced from the official{" "}
              <a
                href="https://www.flightsimulator.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                flightsimulator.com
              </a>{" "}
              blog.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-center text-muted-foreground py-12">
              Couldn't load the latest news right now — try again shortly.
            </p>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No news right now — check back soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card rounded-xl overflow-hidden hover-lift group flex flex-col"
                >
                  <div className="aspect-video bg-card/50 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Plane className="w-10 h-10 text-primary/40" />
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    {item.published && (
                      <span className="text-xs text-muted-foreground mb-2">{formatDate(item.published)}</span>
                    )}
                    <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                      {item.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{item.summary}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm text-primary mt-4">
                      Read more
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default News;

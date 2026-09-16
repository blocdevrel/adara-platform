import { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/client/Header";
import { Footer } from "@/components/client/Footer";
import { NewsCard } from "@/components/client/NewsCard";
import { NEWS_LABELS, NEWS_POSTS } from "@/data/news";
import { cn } from "@/lib/utils";

export default function News() {
  const [label, setLabel] = useState("All");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "News — Adara";
    return () => {
      document.title = "Adara — Data and tools that make AI understand Africa";
    };
  }, []);

  const posts = useMemo(
    () => (label === "All" ? NEWS_POSTS : NEWS_POSTS.filter((post) => post.label === label)),
    [label]
  );

  const featured = label === "All" ? posts[0] : null;
  const gridPosts = featured ? posts.slice(1) : posts;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="adara-ambient pt-[calc(4rem+env(safe-area-inset-top))] sm:pt-[4.25rem]">
        <section className="section-auto py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Adara
              </p>
              <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.08] tracking-[-0.035em] text-foreground">
                Latest news
                <span className="text-gray-out"> from the lab.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Models, corpus, APIs, and security — updates as we ship.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {NEWS_LABELS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLabel(item)}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full border px-3.5 text-sm transition-colors",
                    label === item
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            {featured ? (
              <div className="mt-12">
                <NewsCard post={featured} featured />
              </div>
            ) : null}

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-6">
              {gridPosts.map((post) => (
                <NewsCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

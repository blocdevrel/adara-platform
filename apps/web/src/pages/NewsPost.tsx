import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/client/Header";
import { Footer } from "@/components/client/Footer";
import { NewsCard } from "@/components/client/NewsCard";
import { getNewsPost, getRelatedNews } from "@/data/news";
import { cn } from "@/lib/utils";

export default function NewsPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getNewsPost(slug) : undefined;
  const related = slug ? getRelatedNews(slug) : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    document.title = post
      ? `${post.title} | Adara`
      : "News | Adara";
    return () => {
      document.title = "Adara, Data and tools that make AI understand Africa";
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-24 text-center">
          <h1 className="text-3xl font-medium tracking-[-0.03em] text-foreground">
            Story not found
          </h1>
          <p className="mt-3 text-muted-foreground">That post is not in the archive.</p>
          <Link
            to="/news"
            className="mt-8 inline-flex items-center gap-2 text-sm text-foreground hover:text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to news
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="adara-ambient pt-[calc(4rem+env(safe-area-inset-top))] sm:pt-[4.25rem]">
        <article className="section-auto py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All posts
            </Link>

            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {post.label}
            </p>
            <h1 className="mt-3 text-[clamp(1.875rem,4.2vw,2.75rem)] font-medium leading-[1.12] tracking-[-0.035em] text-foreground">
              {post.title}
            </h1>
            <time
              dateTime={post.isoDate}
              className="mt-4 block text-sm text-muted-foreground"
            >
              {post.date}
            </time>

            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl bg-muted/10">
              {post.image ? (
                <img
                  src={post.image}
                  alt={post.imageHasLabel ? post.label : ""}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: post.imagePosition ?? "center" }}
                />
              ) : null}
              {post.imageHasLabel ? null : (
                <>
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br",
                      post.gradient,
                      post.image && "opacity-80"
                    )}
                  />
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <span className="text-center text-2xl font-medium tracking-[-0.02em] text-white sm:text-3xl">
                      {post.label}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-10 space-y-6">
              {post.body.map((block, index) =>
                block.type === "h2" ? (
                  <h2
                    key={index}
                    className="pt-4 text-xl font-medium tracking-[-0.02em] text-foreground sm:text-2xl"
                  >
                    {block.text}
                  </h2>
                ) : (
                  <p
                    key={index}
                    className="text-base leading-relaxed text-foreground/85 sm:text-lg sm:leading-relaxed"
                  >
                    {block.text}
                  </p>
                )
              )}
            </div>
          </div>
        </article>

        {related.length > 0 ? (
          <section className="section-auto border-t border-border/60 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-medium tracking-[-0.02em] text-foreground sm:text-2xl">
                More from the lab
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <NewsCard key={item.slug} post={item} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

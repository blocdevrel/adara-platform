import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { NewsCard } from "@/components/client/NewsCard";
import { NEWS_POSTS } from "@/data/news";

const homepagePosts = NEWS_POSTS.slice(0, 4);

export function LatestNewsSection() {
  return (
    <section id="news" className="bg-white py-20 text-[#0B0F0D] sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4 sm:mb-12">
          <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-light tracking-[-0.03em]">
            Latest news
          </h2>
          <Link
            to="/news"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            All posts
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-4">
          {homepagePosts.map((post) => (
            <NewsCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

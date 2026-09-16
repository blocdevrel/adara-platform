import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const pillars = [
  {
    label: "Corpus",
    href: "/products",
    tag: "Data",
    description: "Community-first defaults for consent, attribution, and shared benefit from every dataset.",
  },
  {
    label: "Models",
    href: "/products",
    tag: "Speech & NLP",
    description: "Twi-7B, Yoruba-Speech, and Swahili-Context — tuned for African locales out of the box.",
  },
  {
    label: "Context API",
    href: "/documentation",
    tag: "Developers",
    description: "Send text or speech and get translation, localization, and culturally grounded responses.",
  },
  {
    label: "Products",
    href: "/products",
    tag: "Ship faster",
    description: "Pre-built flows for transcription, understanding, and voice — ready to integrate today.",
  },
];

function PillarCard({
  label,
  href,
  tag,
  description,
}: (typeof pillars)[number]) {
  return (
    <Link
      to={href}
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-border/70 bg-background p-6 transition-colors hover:border-primary/30 sm:p-7",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">{label}</p>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {tag}
        </span>
      </div>
      <p className="mt-5 flex-1 text-base leading-relaxed text-foreground/90 sm:text-[17px] sm:leading-[1.65]">
        {description}
      </p>
      <span className="mt-7 inline-flex items-center gap-1 border-t border-border/60 pt-5 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
        Explore
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-20 text-foreground sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">Platform</p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.15rem)] font-light leading-[1.08] tracking-[-0.035em]">
            One platform.
            <span className="text-muted-foreground"> Every modality.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Corpus, models, and APIs in one stack — built for African languages, code-switching, and local context.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <PillarCard key={pillar.label} {...pillar} />
          ))}
        </div>
      </div>
    </section>
  );
}

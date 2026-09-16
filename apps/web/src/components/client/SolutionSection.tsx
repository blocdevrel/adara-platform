import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const trustPoints = [
  {
    title: "Consent-first data",
    tag: "Privacy",
    description:
      "We use consent-first collection and never sell partner data. Your corpus stays yours — with clear attribution built in.",
    href: "/privacy",
    cta: "Privacy policy",
  },
  {
    title: "Production-ready API",
    tag: "Developers",
    description:
      "Documentation, SDKs, and examples to go from first request to production. No model training required to start.",
    href: "/documentation",
    cta: "Read the docs",
  },
];

function TrustCard({
  title,
  tag,
  description,
  href,
  cta,
}: (typeof trustPoints)[number]) {
  return (
    <Link
      to={href}
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-border/70 bg-background p-6 transition-colors hover:border-primary/30 sm:p-7",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">{title}</p>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {tag}
        </span>
      </div>
      <p className="mt-5 flex-1 text-base leading-relaxed text-foreground/90 sm:text-[17px] sm:leading-[1.65]">
        {description}
      </p>
      <span className="mt-7 inline-flex items-center gap-1 border-t border-border/60 pt-5 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
        {cta}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function SolutionSection() {
  return (
    <section id="solutions" className="border-t border-border/50 bg-background py-20 text-foreground sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">Fintech</p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.15rem)] font-light leading-[1.08] tracking-[-0.035em]">
            Local flows generic models miss
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            From Pidgin finance to USSD patterns — Adara handles context Western AI was never trained on.
          </p>
        </div>

        <article className="relative mt-12 overflow-hidden rounded-[1.75rem] border border-border/60 bg-[#0B0F0D] p-8 text-white sm:p-10 lg:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-adara-orange-light">
                Pidgin finance flows
              </p>
              <blockquote className="mt-5 max-w-2xl text-xl leading-relaxed sm:text-2xl sm:leading-[1.45]">
                &ldquo;Our Pidgin and local finance flows finally work. Generic models couldn&apos;t handle the
                context — Adara could from day one.&rdquo;
              </blockquote>
            </div>
            <footer className="relative flex items-center gap-3 lg:pb-1">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white ring-1 ring-white/20">
                AO
              </span>
              <div>
                <p className="text-sm font-medium">Amara Okonkwo</p>
                <p className="text-xs text-white/55">CTO · Fintech Startup</p>
              </div>
            </footer>
          </div>
        </article>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {trustPoints.map((point) => (
            <TrustCard key={point.title} {...point} />
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { MintButton } from "@/components/client/MintButton";

export function CtaSection() {
  return (
    <section id="cta" className="hero-geo relative overflow-hidden py-24 sm:py-32">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
        viewBox="0 0 1440 640"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <polygon points="900,0 1440,0 1440,420 760,180" fill="rgba(198,246,216,0.1)" />
        <polygon points="0,400 380,300 220,640 0,640" fill="rgba(198,246,216,0.06)" />
      </svg>
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-light leading-[1.08] tracking-[-0.04em] text-white">
          Build with Adara
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
          Free API access. Documentation in minutes. Start shipping AI that understands African languages today.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <MintButton to="/signup" size="lg">
            Get started
          </MintButton>
          <Link
            to="/documentation"
            className="inline-flex h-12 items-center justify-center rounded-full px-7 text-[15px] font-medium text-white ring-1 ring-white/25 transition-colors hover:bg-white/10"
          >
            Documentation
          </Link>
        </div>
      </div>
    </section>
  );
}

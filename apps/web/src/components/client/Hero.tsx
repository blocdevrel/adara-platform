import { MintButton } from "@/components/client/MintButton";
import { PartnerLogoMarquee } from "@/components/client/PartnerLogoMarquee";

export function Hero() {
  return (
    <section className="hero-geo relative isolate overflow-hidden text-white">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 1440 1100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <polygon points="980,0 1440,0 1440,420 860,180" fill="rgba(235,80,31,0.07)" />
        <polygon points="1100,80 1440,80 1440,560 980,300" fill="rgba(235,80,31,0.05)" />
        <polygon points="0,620 420,520 280,1100 0,1100" fill="rgba(235,80,31,0.05)" />
        <polygon points="720,0 980,0 640,260" fill="rgba(255,255,255,0.03)" />
      </svg>

      <div className="relative mx-auto flex min-h-[78vh] max-w-4xl flex-col items-center justify-center px-4 pb-16 pt-[calc(6.5rem+env(safe-area-inset-top))] text-center sm:min-h-[88vh] sm:px-6 sm:pb-20 sm:pt-32">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-adara-orange-light">
          Africa Context API, Now available
        </p>
        <h1 className="mt-6 max-w-3xl text-balance text-[clamp(2rem,5.5vw,3.75rem)] font-normal leading-[1.1] tracking-[-0.038em] text-white">
          Data and tools that make AI understand Africa.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          Translation, speech, and cultural context for developers building in African markets.
        </p>
        <div className="mt-9 flex w-full flex-wrap items-center justify-center gap-3">
          <MintButton to="/signup" size="lg">
            Try Adara
          </MintButton>
          <MintButton
            href="/#contact"
            size="lg"
            className="bg-transparent text-white ring-1 ring-white/30 hover:bg-white/10 hover:text-white active:bg-white/15"
          >
            Contact us
          </MintButton>
        </div>
      </div>

      <PartnerLogoMarquee className="relative z-10" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        <div>
          <h2 className="mt-4 w-full max-w-md text-[clamp(1.85rem,6vw,3.25rem)] font-light leading-[1.12] tracking-[-0.035em] text-white">
            One platform. Every modality.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
            Transcribe speech, understand meaning in context, and synthesize replies through one
            API built for African languages, code switching, and local references like momo,
            trotro, and NEPA.
          </p>
        </div>
        <img
          src="/assets/hero-platform.png"
          alt="Adara platform stack for translation, context, and data for African languages"
          className="mx-auto w-full max-w-[340px] object-contain sm:max-w-[400px] lg:max-w-[440px]"
          width={440}
          height={440}
          decoding="async"
          draggable={false}
        />
      </div>
    </section>
  );
}

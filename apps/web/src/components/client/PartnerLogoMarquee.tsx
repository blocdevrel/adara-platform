import { Marquee } from "@/components/client/Marquee";
import { cn } from "@/lib/utils";

const PARTNER_LOGOS = [
  { src: "/assets/partners/safaricom.svg", alt: "Safaricom", mono: true },
  { src: "/assets/partners/flutterwave.svg", alt: "Flutterwave", mono: true },
  { src: "/assets/partners/chipper.svg", alt: "Chipper", mono: false },
  { src: "/assets/partners/jumia.svg", alt: "Jumia", mono: false },
  { src: "/assets/partners/andela.svg", alt: "Andela", mono: false },
  { src: "/assets/partners/paystack.svg", alt: "Paystack", mono: true },
] as const;

function PartnerLogo({
  src,
  alt,
  mono,
}: {
  src: string;
  alt: string;
  mono: boolean;
}) {
  return (
    <div className="flex h-9 w-[8.5rem] shrink-0 items-center justify-center sm:h-10 sm:w-[9.5rem]">
      <img
        src={src}
        alt={alt}
        className={cn(
          "max-h-full w-auto max-w-full object-contain opacity-50",
          mono && "brightness-0 invert",
        )}
        draggable={false}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

type PartnerLogoMarqueeProps = {
  className?: string;
};

/** Infinite logo strip, logos only, no heading copy. */
export function PartnerLogoMarquee({ className }: PartnerLogoMarqueeProps) {
  return (
    <section className={cn("relative z-10 py-8 sm:py-9", className)} aria-label="Partner logos">
      <Marquee duration={55} gapClassName="gap-12 sm:gap-16 md:gap-20">
        {PARTNER_LOGOS.map((logo) => (
          <PartnerLogo key={logo.src} {...logo} />
        ))}
      </Marquee>
    </section>
  );
}

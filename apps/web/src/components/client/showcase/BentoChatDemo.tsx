import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useIsVisible } from "@/hooks/use-is-visible";

const slides = [
  {
    question: "What does this Twi idiom mean for users?",
    answer:
      "Adara maps proverb-level intent to product copy — not literal word-for-word translation.",
  },
  {
    question: "Why do mobile-money scams look different in Ghana?",
    answer:
      "Fraud patterns differ by language and USSD flows; global models miss local phrasing.",
  },
  {
    question: "Localize this for Kenyan smallholders",
    answer:
      "Swahili responses with regional crop terms, tuned for voice-first field advice.",
  },
];

export function BentoChatDemo() {
  const { ref, visible: onScreen } = useIsVisible<HTMLDivElement>();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!onScreen) return;

    let timeout: number | undefined;
    const interval = window.setInterval(() => {
      setVisible(false);
      timeout = window.setTimeout(() => {
        setIndex((i) => (i + 1) % slides.length);
        setVisible(true);
      }, 320);
    }, 4800);

    return () => {
      window.clearInterval(interval);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [onScreen]);

  const slide = slides[index];

  return (
    <div ref={ref} className="flex h-full min-h-0 flex-col p-5 sm:p-6">
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Chat
        </span>
        <span className="h-1 w-1 rounded-full bg-emerald-500/80" />
      </div>

      <div className="relative min-h-[172px] flex-1">
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-center gap-4 transition-opacity duration-300",
            visible ? "opacity-100" : "opacity-0"
          )}
        >
          <p className="text-sm leading-relaxed text-foreground">{slide.question}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{slide.answer}</p>
        </div>
      </div>

      <div className="mt-4 flex shrink-0 gap-1.5">
        {slides.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              i === index ? "w-5 bg-foreground/70" : "w-1.5 bg-foreground/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}

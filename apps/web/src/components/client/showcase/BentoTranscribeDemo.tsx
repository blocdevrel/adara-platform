import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useIsVisible } from "@/hooks/use-is-visible";
import { useOffscreenPause } from "@/hooks/use-offscreen-pause";
import { Waveform } from "@/components/client/showcase/Waveform";

const CLIP_MS = 5600;
const WORD_STEP_MS = 62;

const ALL_CLIPS = [
  {
    locale: "sw-KE",
    stamp: "00:12",
    speech: "Mvua imenyesha vizuri msimu huu, mahindi yamestawi.",
    gloss: "Rain has fallen well this season, the maize has thrived.",
  },
  {
    locale: "tw-GH",
    stamp: "00:41",
    speech: "Sika a ɛwɔ me mobile money akawnt no dɔɔso.",
    gloss: "There is enough money in my mobile money account.",
  },
  {
    locale: "yo-NG",
    stamp: "01:03",
    speech: "Ọjà náà wúwo lónìí, ṣùgbọ́n a ta gbogbo rẹ̀.",
    gloss: "The market was heavy today, but we sold all of it.",
  },
];

/** Twi only for now. Add a locale back here to put its clip in the rotation. */
const ACTIVE_LOCALES = ["tw-GH"];

const clips = ALL_CLIPS.filter((clip) => ACTIVE_LOCALES.includes(clip.locale));

export function BentoTranscribeDemo() {
  const { ref, visible: onScreen } = useIsVisible<HTMLDivElement>();
  const pauseRef = useOffscreenPause<HTMLDivElement>();
  // Counts replays rather than clips, so a single active clip still loops.
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!onScreen) return;

    const interval = window.setInterval(() => setCycle((c) => c + 1), CLIP_MS);

    return () => window.clearInterval(interval);
  }, [onScreen]);

  const clip = clips[cycle % clips.length];
  const words = clip.speech.split(" ");
  const glossDelay = words.length * WORD_STEP_MS + 420;

  return (
    <div ref={ref} className="flex h-full min-h-0 flex-col p-5 sm:p-6">
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Transcribe
        </span>
        <span className="tr-live h-1 w-1 rounded-full bg-emerald-500/80" />
      </div>

      <div ref={pauseRef} className="flex min-h-0 flex-1 flex-col justify-center gap-5">
        <div key={`wave-${cycle}`} className="relative h-14 shrink-0">
          <Waveform className="bg-foreground/15" />
          <div
            className="wave-fill absolute inset-0"
            style={{ animationDuration: `${CLIP_MS}ms` }}
          >
            <Waveform className="bg-emerald-500/80 dark:bg-emerald-400/80" />
          </div>
          <span
            className="wave-playhead absolute inset-y-0 w-px bg-foreground/45"
            style={{ animationDuration: `${CLIP_MS}ms` }}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span>{clip.stamp}</span>
          <span className="text-muted-foreground/40">|</span>
          <span className="text-foreground/70">{clip.locale}</span>
          <span className="text-muted-foreground/40">|</span>
          <span>auto-detected</span>
        </div>

        <div className="min-h-[8.5rem]">
          <p key={`speech-${cycle}`} className="text-sm leading-relaxed text-foreground">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="reveal-word inline-block"
                style={{ animationDelay: `${i * WORD_STEP_MS}ms` }}
              >
                {word}
                {i < words.length - 1 ? "\u00a0" : ""}
              </span>
            ))}
          </p>
          <p
            key={`gloss-${cycle}`}
            className="reveal-line mt-3 text-sm leading-relaxed text-muted-foreground"
            style={{ animationDelay: `${glossDelay}ms` }}
          >
            {clip.gloss}
          </p>
        </div>
      </div>

      {clips.length > 1 ? (
        <div className="mt-4 flex shrink-0 gap-1.5">
          {clips.map((item, i) => (
            <span
              key={item.locale}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                i === cycle % clips.length ? "w-5 bg-foreground/70" : "w-1.5 bg-foreground/20"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

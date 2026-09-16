import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { AudioLines, Boxes, Code2, Database, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsVisible } from "@/hooks/use-is-visible";
import { useOffscreenPause } from "@/hooks/use-offscreen-pause";
import { Waveform } from "@/components/client/showcase/Waveform";

const CYCLE_MS = 4200;

type VisualProps = { accent: string };

/* Corpus, annotation spans lighting up across lines of text */
const corpusRows = [
  [38, 22, 54, 30],
  [26, 46, 20, 40, 28],
  [44, 24, 36, 52],
  [30, 42, 26, 34, 20],
];

function CorpusVisual({ accent }: VisualProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5">
      {corpusRows.map((row, r) => (
        <div key={r} className="flex items-center gap-1.5">
          {row.map((width, c) => (
            <span
              key={c}
              className="px-token h-2 rounded-full"
              style={{ width, background: accent, animationDelay: `${(r * 3 + c) * 150}ms` }}
            />
          ))}
        </div>
      ))}
      <p
        className="px-rise mt-1 font-mono text-[10px] text-white/45"
        style={{ animationDelay: "420ms" }}
      >
        4 languages, 12.4k spans
      </p>
    </div>
  );
}

/* Models, eval scores filling in */
const modelScores = [
  { name: "Twi-7B", score: 92 },
  { name: "Yoruba-Speech", score: 88 },
  { name: "Swahili-Context", score: 95 },
];

function ModelsVisual({ accent }: VisualProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-3.5">
      {modelScores.map((model, i) => (
        <div key={model.name} className="px-rise" style={{ animationDelay: `${i * 110}ms` }}>
          <div className="flex items-baseline justify-between font-mono text-[10px]">
            <span className="text-white/70">{model.name}</span>
            <span style={{ color: accent }}>{model.score}</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
            <span
              className="px-grow-x block h-full rounded-full"
              style={{
                width: `${model.score}%`,
                background: accent,
                animationDelay: `${200 + i * 110}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Context API, a request typing out, then the response */
const requestLines = ["POST /v1/context", "{ locale: \"sw-KE\",", "  domain: \"agriculture\" }"];

function ContextVisual({ accent }: VisualProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="font-mono text-[10.5px] leading-[1.75] text-white/75">
        {requestLines.map((line, i) => (
          <div key={line} className="px-rise" style={{ animationDelay: `${i * 140}ms` }}>
            {line}
            {i === requestLines.length - 1 && (
              <span className="bento-cursor ml-1 inline-block h-[1em] w-[5px] translate-y-[1px] bg-white/60 align-middle" />
            )}
          </div>
        ))}
      </div>
      <span
        className="px-pop inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px]"
        style={{ borderColor: `${accent}59`, color: accent, animationDelay: "620ms" }}
      >
        <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
        200, 41ms
      </span>
    </div>
  );
}

/* Transcribe, waveform playback with the caption streaming out */
const caption = "Mvua imenyesha vizuri msimu huu.";

function TranscribeVisual({ accent }: VisualProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-3.5">
      <div className="relative h-10">
        <Waveform count={36} className="bg-white/15" />
        <div className="wave-fill absolute inset-0" style={{ animationDuration: `${CYCLE_MS}ms` }}>
          <Waveform count={36} barStyle={{ background: accent }} />
        </div>
        <span
          className="wave-playhead absolute inset-y-0 w-px bg-white/50"
          style={{ animationDuration: `${CYCLE_MS}ms` }}
        />
      </div>
      <p className="font-mono text-[10.5px] leading-relaxed text-white/70">
        {caption.split(" ").map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="reveal-word inline-block"
            style={{ animationDelay: `${260 + i * 90}ms` }}
          >
            {word}&nbsp;
          </span>
        ))}
      </p>
    </div>
  );
}

/* Agents, a pipeline with a pulse running down the rail */
const agentSteps = ["retrieve, corpus", "tool, translate", "eval, gate"];

function AgentsVisual({ accent }: VisualProps) {
  return (
    <div className="relative flex h-full flex-col justify-center gap-3 pl-6">
      <div className="absolute inset-y-3 left-[6px] w-px bg-white/12">
        <span className="px-grow-y absolute inset-0 block" style={{ background: accent }} />
        <span
          className="px-travel absolute -left-[3px] h-[7px] w-[7px] rounded-full"
          style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
        />
      </div>
      {agentSteps.map((step, i) => (
        <div
          key={step}
          className="px-rise relative flex items-center"
          style={{ animationDelay: `${i * 220}ms` }}
        >
          <span
            className="absolute left-[-22px] h-2 w-2 rounded-full border bg-[#06060a]"
            style={{ borderColor: accent }}
          />
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 font-mono text-[10px] text-white/75">
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}

type Product = {
  name: string;
  eyebrow: string;
  blurb: string;
  accent: string;
  icon: LucideIcon;
  Visual: ComponentType<VisualProps>;
};

const products: Product[] = [
  {
    name: "Corpus",
    eyebrow: "adara/corpus",
    blurb: "Annotated speech and text across West and East African languages.",
    accent: "#f59e0b",
    icon: Database,
    Visual: CorpusVisual,
  },
  {
    name: "Models",
    eyebrow: "adara/models",
    blurb: "Twi-7B, Yoruba-Speech and Swahili-Context, trained on local data.",
    accent: "#a78bfa",
    icon: Boxes,
    Visual: ModelsVisual,
  },
  {
    name: "Context API",
    eyebrow: "adara/context",
    blurb: "Locale-aware inference with dialect and register carried through.",
    accent: "#38bdf8",
    icon: Code2,
    Visual: ContextVisual,
  },
  {
    name: "Transcribe",
    eyebrow: "adara/transcribe",
    blurb: "Speech to text across African languages, with tone kept intact.",
    accent: "#34d399",
    icon: AudioLines,
    Visual: TranscribeVisual,
  },
  {
    name: "Agents",
    eyebrow: "adara/build",
    blurb: "Compose tools, retrieval and evals into production workflows.",
    accent: "#f472b6",
    icon: Workflow,
    Visual: AgentsVisual,
  },
];

export function ProductsVisual() {
  const { ref, visible: onScreen } = useIsVisible<HTMLDivElement>();
  const pauseRef = useOffscreenPause<HTMLDivElement>();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!onScreen) return;

    const interval = window.setInterval(
      () => setIndex((i) => (i + 1) % products.length),
      CYCLE_MS
    );

    return () => window.clearInterval(interval);
  }, [onScreen]);

  const product = products[index];
  const Icon = product.icon;
  const Visual = product.Visual;

  return (
    <div
      ref={ref}
      className="relative h-full min-h-0 w-full overflow-hidden rounded-xl bg-[#06060a]"
    >
      <div ref={pauseRef} className="absolute inset-0">
        {products.map((item, i) => (
          <div
            key={`${item.name}-glow`}
            aria-hidden
            className={cn(
              "absolute inset-0 transition-opacity duration-[900ms] ease-out",
              i === index ? "opacity-100" : "opacity-0"
            )}
            style={{
              background: `radial-gradient(ellipse 70% 90% at 20% 80%, ${item.accent}4d, transparent 68%), radial-gradient(ellipse 60% 70% at 90% 10%, ${item.accent}26, transparent 70%)`,
            }}
          />
        ))}

        <div aria-hidden className="pv-grid absolute inset-0 opacity-[0.07]" />
        <div aria-hidden className="pv-sweep pointer-events-none absolute inset-y-0 -inset-x-1/3" />

        <div
          key={index}
          className="relative flex h-full items-start gap-5 px-5 pt-5 pb-[4.25rem] sm:px-6 sm:pt-6 sm:pb-[4.75rem]"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="px-rise flex items-center gap-2">
              <Icon className="h-3.5 w-3.5" strokeWidth={1.6} style={{ color: product.accent }} />
              <span
                className="font-mono text-[10px] uppercase tracking-[0.16em]"
                style={{ color: product.accent }}
              >
                {product.eyebrow}
              </span>
            </div>

            <h3
              className="px-rise mt-2 text-2xl font-normal tracking-[-0.03em] text-white sm:text-[2rem] sm:leading-[1.1]"
              style={{ animationDelay: "80ms" }}
            >
              {product.name}
            </h3>

            <p
              className="px-rise mt-2 max-w-[20rem] text-[13px] leading-relaxed text-white/60"
              style={{ animationDelay: "160ms" }}
            >
              {product.blurb}
            </p>
          </div>

          <div className="hidden w-[15rem] shrink-0 self-stretch sm:block">
            <Visual accent={product.accent} />
          </div>
        </div>
      </div>
    </div>
  );
}

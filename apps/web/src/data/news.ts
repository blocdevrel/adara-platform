export type NewsBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string };

export type NewsPost = {
  slug: string;
  date: string;
  isoDate: string;
  title: string;
  excerpt: string;
  label: string;
  image?: string;
  imagePosition?: string;
  /** Set when the artwork already renders the label, so cards skip the text/gradient overlay. */
  imageHasLabel?: boolean;
  gradient: string;
  body: NewsBlock[];
};

export const NEWS_POSTS: NewsPost[] = [
  {
    slug: "v1-contract-before-the-service",
    date: "Aug 28, 2026",
    isoDate: "2026-08-28",
    title:
      "The /v1 contract is public before the service behind it",
    excerpt:
      "Every intelligence endpoint is specified and returning 501. Publishing the contract first is what lets the SDKs and the intelligence repos build against one surface.",
    label: "Context API",
    image: "/assets/news-context-api.svg",
    imagePosition: "center",
    imageHasLabel: true,
    gradient: "from-orange-500/70 via-rose-600/30 to-violet-950/80",
    body: [
      {
        type: "p",
        text: "The Adara HTTP contract is version 0.0.0 and says so in its own description: a development contract, with endpoints stubbed until the intelligence services ship. Language detection, translation, speech transcription, and both context endpoints all answer 501 Not Implemented today. Only liveness and the two catalog routes return anything.",
      },
      {
        type: "h2",
        text: "Why publish an API that isn't implemented",
      },
      {
        type: "p",
        text: "Client libraries in JavaScript, Python, and Go are being written now, and the intelligence repositories are being built to be called. All of them need one agreed surface. Fixing the contract first means none of them get rewritten when the service behind it lands.",
      },
      {
        type: "p",
        text: "The language catalog is the endpoint worth reading. It returns a per-language status, planned, experimental, research, beta, or production, instead of a flat supported boolean. A language appearing in the catalog is not a claim that it works, and the shape of the response is designed so nobody can read it that way.",
      },
      {
        type: "h2",
        text: "What is actually running",
      },
      {
        type: "p",
        text: "The platform is alpha: local stubs, no hosted endpoint, nothing to point production traffic at. The intelligence that will sit behind these routes lives in separate repositories and is being built and measured in the open. When a route starts returning real output, it will be in this feed.",
      },
    ],
  },
  {
    slug: "routing-beats-picking-a-model",
    date: "Aug 14, 2026",
    isoDate: "2026-08-14",
    title:
      "Why Adara routes between speech models instead of picking one",
    excerpt:
      "Whisper claims 9 of the 36 African languages we track. Meta's MMS claims 29. Neither covers everything, which makes the router the interesting part.",
    label: "Models",
    image: "/assets/news-models-twi.svg",
    imagePosition: "center",
    imageHasLabel: true,
    gradient: "from-sky-500/60 via-blue-900/50 to-indigo-950/90",
    body: [
      {
        type: "p",
        text: "Our coverage report answers one question: of the 36 African languages in the Adara registry, which can anything installed actually handle? The counts come from each backend's own language list, computed at runtime rather than written down by hand. Whisper claims 9 of 36, covering roughly 377 million speakers. Meta's MMS claims 29, covering roughly 786 million.",
      },
      {
        type: "p",
        text: "That spread is the whole argument. Whisper has no Twi; MMS does. Seven languages, Setswana, Sesotho, Swati, Dagbani, Ga, Venda, and Southern Ndebele, about 34 million speakers between them, are reached by neither general backend, and for some of them a Ghanaian community-released model is the only route that exists.",
      },
      {
        type: "h2",
        text: "The router, not the model",
      },
      {
        type: "p",
        text: "Transcription, language identification, and diarization all go through a model router rather than calling a model directly. It prefers whichever registered backend actually claims the language being spoken, so a developer calling Adara gets a working model without needing to know any of the above.",
      },
      {
        type: "p",
        text: "Nothing is auto-registered. With no backend registered the pipeline still runs its offline layers, audio validation, quality checks, normalization, code-switch detection, and reports that it ran interface-only rather than pretending otherwise. The library never quietly reaches for a model you did not choose.",
      },
      {
        type: "p",
        text: "Adara Speech is experimental and provider-agnostic. It is a set of interfaces that route to open or commercial engines; it is not a shipped production ASR, and it ships no weights.",
      },
    ],
  },
  {
    slug: "speechbench-measures-the-claims",
    date: "Jul 30, 2026",
    isoDate: "2026-07-30",
    title:
      "SpeechBench scores backends per language, and commits nothing",
    excerpt:
      "Real recordings, FLEURS where it has the language, Ghanaian community corpora where it does not, with every result carrying the corpus's exact commit SHA.",
    label: "Corpus",
    image: "/assets/news-corpus.svg",
    imagePosition: "center",
    imageHasLabel: true,
    gradient: "from-fuchsia-500/50 via-purple-900/40 to-black/80",
    body: [
      {
        type: "p",
        text: "SpeechBench streams genuine recordings and scores each backend independently, producing a language-by-backend matrix rather than a single verdict. One aggregate number for a model tells you nothing about whether it can hear Twi.",
      },
      {
        type: "p",
        text: "FLEURS has no Twi. Where it has no coverage for a language, the harness pulls community-released Ghanaian corpora instead, and every result carries the corpus's exact commit SHA, so any score can be traced back to the specific audio that produced it.",
      },
      {
        type: "h2",
        text: "Results are never checked in",
      },
      {
        type: "p",
        text: "Our evaluation policy forbids committed benchmark results, so the results store is always yours to supply. Runners record dataset version, model, methodology, config, timestamp, and limitations alongside any metric. There are no bare numbers, and there are no fabricated ones.",
      },
      {
        type: "p",
        text: "The recorded limitations carry as much weight as the score. These corpora are read or prompted speech, not spontaneous conversation, and not the noisy market, farm, and street conditions Adara is built for. A good word error rate here is not a promise about a trader's phone in a crowded market.",
      },
      {
        type: "h2",
        text: "What it has established so far",
      },
      {
        type: "p",
        text: "Of the 36 languages in the registry, the number verified by Adara measurement is zero. Every coverage figure we publish is a vendor's list entry, which is a claim and not a result. Early benchmark runs are small and stay internal until they are large enough to mean something, this feed will not report a claim as a measurement.",
      },
    ],
  },
  {
    slug: "audio-io-is-the-trust-boundary",
    date: "Jul 12, 2026",
    isoDate: "2026-07-12",
    title:
      "Audio decoding is the trust boundary, so that is where the checks live",
    excerpt:
      "Adara Speech has no listener of its own, but it is written against the hosted case, path confinement, container limits, and model-identifier allowlists exist before the service does.",
    label: "Security",
    image: "/assets/news-security.svg",
    imagePosition: "center",
    imageHasLabel: true,
    gradient: "from-amber-500/55 via-orange-950/60 to-black/85",
    body: [
      {
        type: "p",
        text: "Every decode in Adara Speech goes through a single load function, and every path through a single resolver. They resolve symlinks before checking the permitted roots, reject anything that is not a regular file, and enforce size, duration, and channel limits read from the container header, before any decoding starts.",
      },
      {
        type: "p",
        text: "The ordering is the point. Reading the declared limits from the header first means a crafted file cannot walk the decoder through an allocation the size of the box before anything checks how long the file claims to be.",
      },
      {
        type: "h2",
        text: "If you host it, confine the path",
      },
      {
        type: "p",
        text: "When the audio path comes from a request, pass the roots it is allowed to live under. A library cannot know your directory layout, so path traversal cannot be checked without it. This is the one control a host has to supply rather than inherit.",
      },
      {
        type: "h2",
        text: "Failures that do not leak",
      },
      {
        type: "p",
        text: "The pipeline validates input before invoking any backend, and returns stable error codes instead of exception text, so absolute server paths never cross an API boundary. It degrades rather than raising: a status field and an errors map say exactly what failed, so a null result is never ambiguous.",
      },
      {
        type: "p",
        text: "Both optional model backends allowlist their model identifier. Loading a checkpoint runs code from its source, and the identifier is settable from the environment, which makes it an input, and inputs get allowlisted.",
      },
    ],
  },
  {
    slug: "accents-are-not-languages",
    date: "Jun 18, 2026",
    isoDate: "2026-06-18",
    title:
      "Every backend supports English. None has been measured on Yoruba-accented English.",
    excerpt:
      "106 accents of English are attested in the AfriSpeech corpus. 25 have enough data to support a per-accent claim, and Adara has measured none of them.",
    label: "Corpus",
    image: "/assets/news-corpus-annotation.svg",
    imagePosition: "center",
    imageHasLabel: true,
    gradient: "from-emerald-500/50 via-teal-900/45 to-black/85",
    body: [
      {
        type: "p",
        text: "Language coverage and accent coverage are different questions, and the second one decides whether a Nigerian speaker gets a usable transcript. Every backend supports English. That fact says nothing about whether it can follow English spoken by a first-language Igbo or Yoruba speaker.",
      },
      {
        type: "p",
        text: "Our coverage report reads 106 attested accents of English from the AfriSpeech-200 corpus, released under CC-BY-NC-SA-4.0. Of those, 25 have enough hours behind them to support a per-accent claim. The number Adara has independently measured is zero.",
      },
      {
        type: "p",
        text: "Yoruba-accented English is the largest slice at roughly 45 hours across 683 speakers, with Igbo, Hausa, and Swahili accents behind it. Twi has 4 hours from 22 speakers, enough to establish that the accent is attested, nowhere near enough to publish a number about it.",
      },
      {
        type: "h2",
        text: "It also answers what to add next",
      },
      {
        type: "p",
        text: "82 of those accents have a first language the 36-language registry does not cover yet: Afemai, Afo, Agatu, Alago, Anaang, Ateso, and a long tail behind them. That list is a sourced answer to which language the registry should add next, rather than a guess made from a map.",
      },
    ],
  },
  {
    slug: "tts-lands-for-18-languages",
    date: "Jun 4, 2026",
    isoDate: "2026-06-04",
    title:
      "Speech synthesis lands for 18 African languages",
    excerpt:
      "A real TTS backend covering 18 of the 36 languages in the registry, Twi, Nigerian Pidgin, and Yoruba among them, registered the same explicit way as everything else.",
    label: "Models",
    image: "/assets/news-models-swahili.svg",
    imagePosition: "center",
    imageHasLabel: true,
    gradient: "from-indigo-500/55 via-violet-900/50 to-black/85",
    body: [
      {
        type: "p",
        text: "Text-to-speech now has a real backend behind the interface. It covers 18 of the registry's 36 languages, including Twi, Nigerian Pidgin, Yoruba, Hausa, Swahili, Amharic, Luganda, and Kinyarwanda, the languages where voice output is the difference between a usable product and an unusable one.",
      },
      {
        type: "p",
        text: "It plugs into the same router as transcription and language ID, and like every other backend it is opt-in: install the extra, register it explicitly, and it serves. Nothing is registered on your behalf, and the model identifiers it is allowed to load are allowlisted.",
      },
      {
        type: "h2",
        text: "The half that is not covered",
      },
      {
        type: "p",
        text: "18 of 36 means 18 are not. Voice output for the rest is not solved by this, and naming the gap is more useful than rounding it up, the languages with no synthesis are disproportionately the ones with no transcription either.",
      },
      {
        type: "p",
        text: "Adara Speech remains experimental. The interfaces are provider-agnostic deliberately: when a better backend appears for any of these languages, swapping to it should not touch a line of calling code.",
      },
    ],
  },
];

export const NEWS_LABELS = ["All", ...Array.from(new Set(NEWS_POSTS.map((post) => post.label)))];

export function getNewsPost(slug: string) {
  return NEWS_POSTS.find((post) => post.slug === slug);
}

export function getRelatedNews(slug: string, limit = 3) {
  const current = getNewsPost(slug);
  if (!current) return NEWS_POSTS.slice(0, limit);

  const sameLabel = NEWS_POSTS.filter(
    (post) => post.slug !== slug && post.label === current.label
  );
  const rest = NEWS_POSTS.filter(
    (post) => post.slug !== slug && post.label !== current.label
  );

  return [...sameLabel, ...rest].slice(0, limit);
}

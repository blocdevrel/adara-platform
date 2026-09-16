/**
 * Docs navigation configuration.
 *
 * Every entry here is a sidebar item. `id` matches the URL segment:
 *   /docs/<section>/<id>
 * `slug` can override this for top-level items.
 */

export type DocItem = {
  id: string;
  label: string;
  badge?: string;
  slug?: string; // if absent, uses id
};

export type DocSection = {
  title: string;
  items: DocItem[];
};

export const DOC_SECTIONS: DocSection[] = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "whats-new", label: "What's New", badge: "NEW" },
      { id: "quickstart", label: "Quickstart" },
      { id: "authentication", label: "Authentication & Keys" },
      { id: "errors", label: "Errors & Retries" },
    ],
  },
  {
    title: "Speech, Understand",
    items: [
      { id: "understand-overview", label: "Overview" },
      { id: "understand-text", label: "Understand Text" },
      { id: "understand-audio", label: "Understand Audio" },
      { id: "codeswitch", label: "Code-switching" },
      { id: "provisional", label: "Provisional & Warnings" },
    ],
  },
  {
    title: "STT, Speech to Text",
    items: [
      { id: "stt-overview", label: "Overview" },
      { id: "stt-languages", label: "Supported Languages" },
      { id: "stt-upload-sync", label: "Upload File (Sync)" },
      { id: "stt-upload-async", label: "Upload File (Async)" },
      { id: "stt-streaming", label: "Streaming STT", badge: "Soon" },
    ],
  },
  {
    title: "TTS, Text to Speech",
    items: [
      { id: "tts-overview", label: "Overview" },
      { id: "tts-languages", label: "Supported Languages & Accents" },
      { id: "tts-generate", label: "TTS Generate" },
      { id: "tts-streaming", label: "TTS Streaming", badge: "Soon" },
    ],
  },
  {
    title: "Language API",
    items: [
      { id: "language-detect", label: "Language Detection" },
      { id: "language-entities", label: "Named Entities (NER)" },
      { id: "language-codeswitch", label: "Code-switch Segments" },
    ],
  },
  {
    title: "Context API",
    items: [
      { id: "context-resolve", label: "Resolve a Reference" },
      { id: "context-coverage", label: "Coverage Map" },
    ],
  },
  {
    title: "Voice Agent API",
    items: [
      { id: "agent-overview", label: "Overview" },
      { id: "agent-sessions", label: "Sessions" },
      { id: "agent-turns", label: "Turns" },
      { id: "agent-events", label: "Live Events (SSE)" },
    ],
  },
  {
    title: "SDKs",
    items: [
      { id: "sdk-python", label: "Python SDK" },
      { id: "sdk-javascript", label: "JavaScript SDK" },
      { id: "sdk-local", label: "Offline mode" },
      { id: "sdk-testing", label: "Testing" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { id: "health", label: "Health Check" },
      { id: "languages-catalog", label: "Languages Catalog" },
      { id: "models-catalog", label: "Models Catalog" },
    ],
  },
];

export function firstDocPath(): string {
  return `/docs/${DOC_SECTIONS[0].items[0].id}`;
}

export function findItem(id: string): DocItem | undefined {
  for (const section of DOC_SECTIONS) {
    const found = section.items.find((i) => i.id === id);
    if (found) return found;
  }
  return undefined;
}

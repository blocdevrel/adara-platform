import { DocPage, Section, Callout, IC, Pill } from "../DocProse";

export default function SttStreaming() {
  return (
    <DocPage
      title="Streaming STT"
      description="Real-time transcription via WebSocket as audio chunks arrive from the microphone."
      prev={{ label: "Upload File (Async)", to: "/docs/stt-upload-async" }}
      next={{ label: "TTS Overview", to: "/docs/tts-overview" }}
    >
      <Section title="Overview">
        <div className="flex items-center gap-2 mb-4">
          <Pill variant="orange">Coming soon</Pill>
          <span className="text-sm text-zinc-500">Not available yet</span>
        </div>
        <p>
          Streaming STT sends words back to the caller as they are transcribed — not after the
          full recording is complete. This enables live captioning, real-time voice interfaces,
          and low-latency voice bots.
        </p>
      </Section>

      <Section title="Planned endpoint">
        <p>
          <IC>WS /v1/speech/stream</IC> — WebSocket connection. The client streams audio chunks;
          the server sends back partial and final transcript frames.
        </p>
      </Section>

      <Section title="Until then">
        <Callout variant="tip">
          Use <IC>POST /v1/speech/transcribe</IC> for clips you record first, then upload.
        </Callout>
      </Section>

      <Section title="Get notified">
        <p>
          Watch the Adara changelog (
          <a href="/news" className="underline hover:opacity-80">
            /news
          </a>
          ) or the{" "}
          <a
            href="https://github.com/AI-Factory-AI"
            target="_blank"
            rel="noreferrer"
            className="underline hover:opacity-80"
          >
            GitHub organisation
          </a>{" "}
          for the streaming release.
        </p>
      </Section>
    </DocPage>
  );
}

import { DocPage, Section, Callout, Pill, IC } from "../DocProse";

export default function TtsStreaming() {
  return (
    <DocPage
      title="TTS Streaming"
      description="Receive audio chunks as they are generated, lower latency for voice bot replies."
      prev={{ label: "TTS Generate", to: "/docs/tts-generate" }}
      next={{ label: "Language Detection", to: "/docs/language-detect" }}
    >
      <Section title="Overview">
        <div className="flex items-center gap-2 mb-4">
          <Pill variant="orange">Coming soon</Pill>
          <span className="text-sm text-zinc-500">Not available yet</span>
        </div>
        <p>
          TTS Streaming returns audio chunks as they are produced by the synthesis model, rather
          than buffering the full WAV before responding. For a voice bot replying in real time,
          the first audio chunk can start playing before the full sentence is synthesised.
        </p>
      </Section>

      <Section title="Planned endpoint">
        <p>
          <IC>POST /v1/speech/synthesize/stream</IC>, same request body as{" "}
          <IC>POST /v1/speech/synthesize</IC>; response is a chunked audio stream.
        </p>
        <Callout variant="tip">
          For now, use <IC>POST /v1/speech/synthesize</IC> which returns the full WAV as base64.
          For a phone reply, the latency difference between sync and streaming is typically under
          1 second on a warm model.
        </Callout>
      </Section>
    </DocPage>
  );
}

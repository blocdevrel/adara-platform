import { DocPage, Section, Callout, Table, DocCard, IC } from "../DocProse";

export default function SttOverview() {
  return (
    <DocPage
      title="Speech to Text, Overview"
      description="Convert African-language audio to text. Optimised for accents and code-switching."
      prev={{ label: "Provisional & Warnings", to: "/docs/provisional" }}
      next={{ label: "Supported Languages", to: "/docs/stt-languages" }}
    >
      <Section title="How it works">
        <p>
          Upload audio and get a transcript, detected language, and confidence. Short clips
          return immediately. Longer files use a job.
        </p>
        <Table
          headers={["Path", "Use case"]}
          rows={[
            [<IC key="sync">POST /v1/speech/transcribe</IC>, "Short clips ≤ 30 s, synchronous, responds immediately"],
            [<IC key="job">POST /v1/speech/jobs</IC>, "Long recordings up to 4 hours, async job with partial results"],
            [<><IC key="ws">WS /v1/speech/stream</IC> <span className="text-xs text-orange-500 ml-1">Soon</span></>, "Real-time streaming as audio chunks arrive"],
          ]}
        />
      </Section>

      <Section title="African accent support">
        <p>
          Transcription quality is measured per language and per accent. Adara specifically trains
          and evaluates on West African and East African speaker populations, not generic English
          benchmarks.
        </p>
        <Callout variant="info">
          Call <IC>GET /v1/languages?capability=transcribe</IC> for the live language list.
        </Callout>
      </Section>

      <Section title="Code-switching">
        <p>
          A single recording may contain multiple languages, e.g. a Ghanaian speaker alternating
          between Twi and English. Adara detects language boundaries within the audio and returns
          segment-level language labels alongside the transcript.
        </p>
      </Section>

      <Section title="Audio requirements">
        <Table
          headers={["Requirement", "Value"]}
          rows={[
            ["Formats accepted", "WAV (recommended), M4A, MP3, FLAC, OGG"],
            ["Sample rate", "16 kHz preferred; other rates are resampled automatically"],
            ["Max file size (sync)", "25 MiB"],
            ["Max duration (sync)", "~30 s"],
            ["Bit depth", "16-bit PCM recommended"],
            ["Channels", "Mono preferred; stereo is mixed down automatically"],
          ]}
        />
      </Section>

      <Section title="Next steps">
        <div className="grid gap-3 sm:grid-cols-2">
          <DocCard
            to="/docs/stt-languages"
            title="Supported Languages"
            description="Which languages are live and what their quality scores are."
          />
          <DocCard
            to="/docs/stt-upload-sync"
            title="Upload File (Sync)"
            description="Transcribe a short audio clip in a single HTTP round-trip."
          />
          <DocCard
            to="/docs/stt-upload-async"
            title="Upload File (Async)"
            description="Submit a long recording as a job and poll for results."
          />
          <DocCard
            to="/docs/stt-streaming"
            title="Streaming STT"
            description="Real-time transcription via WebSocket, coming soon."
          />
        </div>
      </Section>
    </DocPage>
  );
}

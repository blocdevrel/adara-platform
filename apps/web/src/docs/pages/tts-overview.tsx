import { DocPage, Section, Table, DocCard, IC } from "../DocProse";

export default function TtsOverview() {
  return (
    <DocPage
      title="Text to Speech, Overview"
      description="Convert text to natural-sounding speech in African languages."
      prev={{ label: "Streaming STT", to: "/docs/stt-streaming" }}
      next={{ label: "TTS Languages & Accents", to: "/docs/tts-languages" }}
    >
      <Section title="How it works">
        <p>
          Send text and a language code. You get WAV audio (base64) back. Play it in your app.
        </p>
        <Table
          headers={["Path", "Description"]}
          rows={[
            [<IC key="gen">POST /v1/speech/synthesize</IC>, "Synchronous, send text, get back WAV base64 in the response body"],
            [<><IC key="stream">POST /v1/speech/synthesize/stream</IC> <span className="text-xs text-orange-500 ml-1">Soon</span></>, "Streaming, audio chunks returned as they are generated"],
          ]}
        />
      </Section>

      <Section title="Audio output">
        <Table
          headers={["Property", "Value"]}
          rows={[
            ["Format", "WAV (PCM)"],
            ["Sample rate", "16 kHz"],
            ["Channels", "Mono"],
            ["Encoding", "base64 in JSON response (sync); raw bytes in streaming response"],
          ]}
        />
      </Section>

      <Section title="Playing the audio">
        <p>
          Decode <IC>audio_base64</IC> to a WAV file and play it with whatever audio API your
          platform uses. If synthesis is not enabled on your account, skip playback and keep the
          text.
        </p>
      </Section>

      <Section title="Next steps">
        <div className="grid gap-3 sm:grid-cols-2">
          <DocCard
            to="/docs/tts-languages"
            title="Languages & Accents"
            description="Which languages are supported for speech synthesis."
          />
          <DocCard
            to="/docs/tts-generate"
            title="TTS Generate"
            description="Full reference for POST /v1/speech/synthesize with examples."
          />
          <DocCard
            to="/docs/tts-streaming"
            title="TTS Streaming"
            description="Chunked audio as it is generated, coming soon."
          />
        </div>
      </Section>
    </DocPage>
  );
}

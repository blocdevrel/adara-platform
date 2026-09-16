import { DocPage, Section, Code, Callout, Table, IC } from "../DocProse";

export default function TtsGenerate() {
  return (
    <DocPage
      title="TTS Generate"
      description="Full reference for POST /v1/speech/synthesize."
      prev={{ label: "TTS Languages & Accents", to: "/docs/tts-languages" }}
      next={{ label: "TTS Streaming", to: "/docs/tts-streaming" }}
    >
      <Section title="Endpoint">
        <Code lang="text">{`POST /v1/speech/synthesize`}</Code>
        <Table
          headers={["Field", "Type", "Required", "Description"]}
          rows={[
            ["text", "string", "Yes", "The text to synthesise. Plain text, no SSML."],
            ["language", "string", "Yes", "ISO 639-3 code (e.g. tw, pcm, sw)."],
            ["locale", "string", "No", "Regional hint (e.g. GH, NG) to select accent when multiple accents exist for a language."],
          ]}
        />
      </Section>

      <Section title="curl example">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/speech/synthesize \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Mepa wo kyɛw, wo ho te sɛn?", "language": "tw"}' \\
  | python -c "
import sys, json, base64
d = json.load(sys.stdin)
open('reply.wav', 'wb').write(base64.b64decode(d['audio_base64']))
print('Saved reply.wav')
"`}
        </Code>
      </Section>

      <Section title="Response">
        <Code lang="json">
{`{
  "audio_base64": "UklGRiQAAABXQVZFZm10...",
  "format": "wav",
  "sample_rate": 16000,
  "language": "tw",
  "provisional": true
}`}
        </Code>
        <Table
          headers={["Field", "Meaning"]}
          rows={[
            ["audio_base64", "WAV file encoded as base64. Decode with base64.b64decode() or Buffer.from(..., 'base64')."],
            ["format", "WAV"],
            ["sample_rate", "Always 16000 Hz."],
            ["provisional", "true until the normalisation pack for this language is reviewed by a native speaker."],
          ]}
        />
        <Callout variant="info">
          When <IC>synthesize: false</IC> appears in <IC>GET /v1/health</IC>, this route returns{" "}
          <IC>501 not_implemented_error</IC>. Skip playback silently, the text is already shown.
        </Callout>
      </Section>

      <Section title="Python SDK">
        <Code lang="python">
{`audio = client.speech.synthesize("Mepa wo kyɛw", language="tw")
with open("reply.wav", "wb") as f:
    f.write(audio.bytes)  # already decoded`}
        </Code>
      </Section>

      <Section title="JavaScript SDK (Node)">
        <Code lang="javascript">
{`const audio = await client.speech.synthesize('Mepa wo kyɛw', { language: 'tw' });
fs.writeFileSync('reply.wav', Buffer.from(audio.audioBase64, 'base64'));`}
        </Code>
      </Section>

      <Section title="Playing the audio">
        <p>Decode the base64 WAV and play it with your platform audio API.</p>
      </Section>
    </DocPage>
  );
}

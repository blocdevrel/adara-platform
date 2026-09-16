import { DocPage, Section, Code, Callout, Table, IC } from "../DocProse";

export default function SttUploadSync() {
  return (
    <DocPage
      title="Upload File (Sync)"
      description="Transcribe a short audio clip in a single HTTP round-trip. Responds in under 30 s."
      prev={{ label: "Supported Languages", to: "/docs/stt-languages" }}
      next={{ label: "Upload File (Async)", to: "/docs/stt-upload-async" }}
    >
      <Section title="Endpoint">
        <Code lang="text">
{`POST /v1/speech/transcribe`}
        </Code>
        <Table
          headers={["Field", "Type", "Required", "Description"]}
          rows={[
            ["file", "multipart file", "Yes", "The audio file. WAV preferred, M4A/MP3/FLAC also accepted."],
            ["language", "string", "No", "ISO 639-3 code (e.g. tw, pcm). If absent, Adara detects it."],
            ["locale", "string", "No", "BCP-47 locale hint (e.g. GH, NG). Narrows language detection."],
          ]}
        />
      </Section>

      <Section title="curl example">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/speech/transcribe \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -F "file=@call.wav" \\
  -F "language=tw"`}
        </Code>
      </Section>

      <Section title="Response">
        <Code lang="json">
{`{
  "text": "Mepa wo kyɛw, sɛ wo ka",
  "language": "tw",
  "confidence": 0.87,
  "provisional": true,
  "status": "ok",
  "stages": {
    "transcribe": { "model": "mms", "language": "tw" }
  }
}`}
        </Code>
        <Table
          headers={["Field", "Meaning"]}
          rows={[
            ["text", "The transcript"],
            ["language", "Detected or confirmed language code"],
            ["confidence", "Model confidence (0-1). Never reaches 1.0, see honesty rules."],
            ["provisional", "true = knowledge pack not yet reviewed by a native speaker. Surface this."],
            ["status", "ok / interface_only / partial"],
            ["stages", "Which model backend ran and what it detected"],
          ]}
        />
        <Callout variant="info">
          <IC>provisional: true</IC> does not mean the transcript is wrong, it means the knowledge
          pack behind any context resolution was assembled from secondary sources. Always surface it.
        </Callout>
      </Section>

      <Section title="Python SDK">
        <Code lang="python">
{`with open("call.wav", "rb") as f:
    result = client.speech.transcribe(f, filename="call.wav", language="tw")

print(result.text)        # "Mepa wo kyɛw, sɛ wo ka"
print(result.language)    # "tw"
print(result.confidence)  # 0.87`}
        </Code>
      </Section>

      <Section title="JavaScript SDK (Node)">
        <Code lang="javascript">
{`import { readFileSync } from 'fs';

const audio = readFileSync('call.wav');
const result = await client.speech.transcribe(audio, {
  filename: 'call.wav',
  language: 'tw',
});
console.log(result.text, result.language);`}
        </Code>
      </Section>

      <Section title="When to use async instead">
        <p>
          If the audio is longer than ~30 seconds or you cannot afford to block the HTTP request
          for the full transcription time, use the{" "}
          <a href="/docs/stt-upload-async" className="underline hover:opacity-80">
            async job API
          </a>{" "}
          instead. Sync transcription may time out on long audio.
        </p>
      </Section>
    </DocPage>
  );
}

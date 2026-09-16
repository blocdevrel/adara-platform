import { DocPage, Section, Code, Callout, Table, IC, Pill } from "../DocProse";

export default function SttUploadAsync() {
  return (
    <DocPage
      title="Upload File (Async)"
      description="Submit a long recording as a background job and poll for partial results."
      prev={{ label: "Upload File (Sync)", to: "/docs/stt-upload-sync" }}
      next={{ label: "Streaming STT", to: "/docs/stt-streaming" }}
    >
      <Section title="When to use this">
        <p>
          Use the async job API when audio is longer than ~30 seconds, or when you want partial
          results returned as segments complete. The sync endpoint may time out on long audio.
        </p>
      </Section>

      <Section title="Create a job">
        <Code lang="text">
{`POST /v1/speech/jobs`}
        </Code>
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/speech/jobs \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -F "file=@long_recording.wav" \\
  -F "language=sw"`}
        </Code>
        <Code lang="json">
{`{
  "id": "job_01j9...",
  "status": "queued",
  "created_at": "2026-09-03T16:00:00Z"
}`}
        </Code>
      </Section>

      <Section title="Poll for status">
        <Code lang="text">
{`GET /v1/speech/jobs/{id}`}
        </Code>
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/speech/jobs/job_01j9... \\
  -H "Authorization: Bearer $ADARA_API_KEY"`}
        </Code>
        <Table
          headers={["status", "Meaning"]}
          rows={[
            ["queued", "Waiting in the queue"],
            ["processing", "Transcription is running"],
            ["done", "Complete, text is in the response"],
            ["failed", "Transcription failed, partial results may still be present"],
          ]}
        />
        <Code lang="json">
{`{
  "id": "job_01j9...",
  "status": "done",
  "text": "Habari, ninataka kujua bei ya unga...",
  "language": "sw",
  "confidence": 0.84,
  "partial_results": [],
  "provisional": true
}`}
        </Code>
        <Callout variant="info">
          On <IC>status: failed</IC>, <IC>partial_results</IC> contains whatever segments
          completed before the failure. These may still be useful.
        </Callout>
      </Section>

      <Section title="Python SDK">
        <Code lang="python">
{`job = client.speech.jobs.create(open("long_recording.wav", "rb"), language="sw")
result = job.wait()   # polls until done; yields partial results on failure
print(result.text)`}
        </Code>
      </Section>

      <Section title="Status, not yet wired">
        <Callout variant="warning">
          The async job API routes are defined in the OpenAPI spec and return <IC>501</IC> today.
          They are listed here so you can design your integration now and swap in the live
          implementation when it ships.
        </Callout>
      </Section>
    </DocPage>
  );
}

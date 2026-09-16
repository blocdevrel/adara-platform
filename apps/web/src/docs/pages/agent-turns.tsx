import { DocPage, Section, Code, Table, Callout, IC } from "../DocProse";

export default function AgentTurns() {
  return (
    <DocPage
      title="Turns"
      description="Submit a text or audio utterance and read the grounded reply."
      prev={{ label: "Sessions", to: "/docs/agent-sessions" }}
      next={{ label: "Live Events (SSE)", to: "/docs/agent-events" }}
    >
      <Section title="Submit a text turn">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/agent/sessions/ses_01j9.../turns \\
  -H "Content-Type: application/json" \\
  -d '{"text": "chale the momo no enter"}'`}
        </Code>
        <Code lang="json">
{`{
  "turn": {
    "id": "tur_01j9...",
    "role": "user",
    "status": "pending",
    "input_kind": "text",
    "text": "chale the momo no enter",
    "reply": null,
    "error": null
  }
}`}
        </Code>
        <p>
          The turn starts as <IC>pending</IC>. Subscribe to the SSE stream to receive status
          updates as the pipeline runs.
        </p>
      </Section>

      <Section title="Submit an audio turn">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/agent/sessions/ses_01j9.../turns \\
  -F "file=@turn.m4a;type=audio/m4a"`}
        </Code>
        <p>Upload the recording as multipart. You get the same turn lifecycle as text.</p>
      </Section>

      <Section title="Turn lifecycle">
        <Table
          headers={["status", "What it means"]}
          rows={[
            ["pending", "Turn created. Audio received, transcription not yet started."],
            ["understood", "Transcript and Meaning computed. Reply not yet assembled."],
            ["replied", "Grounded reply ready. Both text and speech fields populated."],
            ["failed", "Pipeline failed. error.recoverable tells you if a retry makes sense."],
          ]}
        />
      </Section>

      <Section title="The reply object">
        <Code lang="json">
{`{
  "reply": {
    "text": "I understood chale (Informal address between friends) and momo (Mobile money).",
    "source": "grounded_template",
    "act": "acknowledge",
    "grounded_on": ["familiar_address", "mobile_money"],
    "expects_answer": false,
    "warnings": ["provisional=true: knowledge packs are unreviewed."],
    "speech": { "available": true, "reason": null }
  }
}`}
        </Code>
        <Table
          headers={["Field", "Meaning"]}
          rows={[
            ["text", "The reply to show the user."],
            ["source", "Always grounded_template, assembled from resolved data, not generated."],
            ["act", "Dialogue act: acknowledge, clarify_sense, ask_unknown_term, ask_repeat, report_unavailable."],
            ["grounded_on", "Concept IDs the reply used. Auditable."],
            ["expects_answer", "If true, keep the mic open, the agent asked a question."],
            ["warnings", "Surface these to the user. Do not drop them."],
            ["speech.available", "Whether TTS playback can be triggered for this reply."],
          ]}
        />
        <Callout variant="tip">
          When <IC>expects_answer: true</IC>, your UI should re-open the microphone automatically
          without the user having to tap again.
        </Callout>
      </Section>
    </DocPage>
  );
}

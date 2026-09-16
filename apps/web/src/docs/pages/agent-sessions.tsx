import { DocPage, Section, Code, Table, IC } from "../DocProse";

export default function AgentSessions() {
  return (
    <DocPage
      title="Sessions"
      description="A session holds locale, language, and turn history for one conversation."
      prev={{ label: "Voice Agent Overview", to: "/docs/agent-overview" }}
      next={{ label: "Turns", to: "/docs/agent-turns" }}
    >
      <Section title="Create a session">
        <Code lang="text">{`POST /v1/agent/sessions`}</Code>
        <Table
          headers={["Field", "Type", "Required", "Description"]}
          rows={[
            ["locale", "string", "No", "BCP-47 locale code (e.g. GH, NG). Used to select context packs."],
            ["language", "string", "No", "ISO 639-3 language override. If absent, detected per turn."],
            ["client", "object", "No", "Metadata your app wants stored on the session (user ID, device, etc.)."],
          ]}
        />
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/agent/sessions \\
  -H "Content-Type: application/json" \\
  -d '{"locale": "GH"}'`}
        </Code>
        <Code lang="json">
{`{
  "session": {
    "id": "ses_01j9...",
    "locale": "GH",
    "language": null,
    "language_source": "pending",
    "turns": []
  },
  "capabilities": {
    "understand": true,
    "transcribe": true,
    "synthesize": true,
    "detect_language": true,
    "resolve_context": true,
    "extract_entities": true,
    "reasons": {}
  }
}`}
        </Code>
      </Section>

      <Section title="Language settling">
        <p>
          The session tracks a <em>settled language</em>. Once a language is detected with
          sufficient confidence, it is remembered for the rest of the session. Short utterances
          that the language detector abstains on still inherit the settled language, preventing
          short "yes / no" replies from resetting the session to Unknown.
        </p>
        <p>
          <IC>language_source</IC> tells you how the language was determined:
        </p>
        <Table
          headers={["value", "Meaning"]}
          rows={[
            ["client", "Passed explicitly by the caller on session creation"],
            ["detected", "Detected by the language model from a turn"],
            ["inherited", "Carried over from a previous turn because the current turn abstained"],
            ["pending", "Not yet determined, session was just created"],
          ]}
        />
      </Section>

      <Section title="Get a session">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/agent/sessions/ses_01j9... `}
        </Code>
      </Section>

      <Section title="End a session">
        <Code lang="bash">
{`curl -s -X DELETE https://api.adara.ai/v1/agent/sessions/ses_01j9...`}
        </Code>
        <p>
          Sessions expire automatically after 3600 s of inactivity. The voice-agent cleans them
          up during its next write cycle.
        </p>
      </Section>
    </DocPage>
  );
}

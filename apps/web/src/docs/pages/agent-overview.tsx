import { DocPage, Section, Code, Callout, Table, DocCard, IC } from "../DocProse";

export default function AgentOverview() {
  return (
    <DocPage
      title="Voice Agent API, Overview"
      description="Session-based voice conversations. Create a session, submit turns, stream live progress."
      prev={{ label: "Context Coverage", to: "/docs/context-coverage" }}
      next={{ label: "Sessions", to: "/docs/agent-sessions" }}
    >
      <Section title="What the Voice Agent API does">
        <p>
          The Voice Agent API is for in-app conversations: sessions, turns, and live updates.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Creates a session (locale, language, turn history).</li>
          <li>Accepts text or audio turns.</li>
          <li>Returns a grounded reply from what was understood, not a generative chat model.</li>
          <li>Streams turn progress over SSE.</li>
        </ul>
        <Callout variant="tip">
          Use the Voice Agent API from your product backend or mobile BFF. Call Understand / STT /
          TTS directly when you do not need a conversation session.
        </Callout>
      </Section>

      <Section title="Endpoints">
        <Table
          headers={["Method", "Path", "Description"]}
          rows={[
            ["POST", "/v1/agent/sessions", "Create a new conversation session"],
            ["GET", "/v1/agent/sessions/:id", "Fetch a session with its full turn history"],
            ["DELETE", "/v1/agent/sessions/:id", "End a session"],
            ["POST", "/v1/agent/sessions/:id/turns", "Submit a text or audio turn"],
            ["GET", "/v1/agent/sessions/:id/turns/:tid", "Fetch one turn (with full provenance)"],
            ["GET", "/v1/agent/sessions/:id/events", "SSE stream, live turn progress"],
          ]}
        />
      </Section>

      <Section title="A turn's lifecycle">
        <Code lang="text">
{`pending   → audio received, not yet transcribed
understood → transcript + meaning computed
replied    → grounded reply assembled
failed     → something went wrong; error carries recoverable flag`}
        </Code>
        <p>
          Each status transition fires an SSE event. The mobile app's <IC>useVoiceSession</IC>
          hook subscribes to these and updates the UI in real time.
        </p>
      </Section>

      <Section title="Grounded replies">
        <p>
          Replies are assembled from what was resolved, not generated. The reply text is
          constructed from the matched concepts and their glosses, using a template policy. This
          means:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Every sentence in the reply points at a resolved concept, no hallucination.</li>
          <li>The <IC>grounded_on</IC> field lists the concepts the reply used.</li>
          <li>When nothing was resolved, the agent says so honestly.</li>
        </ul>
      </Section>

      <Section title="Next steps">
        <div className="grid gap-3 sm:grid-cols-2">
          <DocCard to="/docs/agent-sessions" title="Sessions" description="Create and manage conversation sessions." />
          <DocCard to="/docs/agent-turns" title="Turns" description="Submit text or audio turns and read the reply." />
          <DocCard to="/docs/agent-events" title="Live Events (SSE)" description="Stream turn progress in real time." />
        </div>
      </Section>
    </DocPage>
  );
}

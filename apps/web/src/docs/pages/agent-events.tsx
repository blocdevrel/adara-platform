import { DocPage, Section, Code, Callout, Table, IC } from "../DocProse";

export default function AgentEvents() {
  return (
    <DocPage
      title="Live Events (SSE)"
      description="Stream turn progress in real time using Server-Sent Events."
      prev={{ label: "Turns", to: "/docs/agent-turns" }}
      next={{ label: "Python SDK", to: "/docs/sdk-python" }}
    >
      <Section title="Endpoint">
        <Code lang="text">{`GET /v1/agent/sessions/:id/events`}</Code>
        <p>
          Returns a persistent SSE stream. Each event fires when a turn's status changes. The
          stream stays open for the lifetime of the session.
        </p>
      </Section>

      <Section title="Event types">
        <Table
          headers={["Event name", "When it fires"]}
          rows={[
            ["turn.created", "A new turn was submitted"],
            ["turn.transcribed", "Audio transcription completed"],
            ["turn.understood", "Meaning computed from the transcript"],
            ["turn.replied", "Grounded reply assembled and ready"],
            ["turn.failed", "The pipeline failed for this turn"],
          ]}
        />
      </Section>

      <Section title="curl example">
        <Code lang="bash">
{`curl -N https://api.adara.ai/v1/agent/sessions/ses_01j9.../events

data: {"id":"tur_01j9...","status":"pending","role":"user",...}
event: turn.created

data: {"id":"tur_01j9...","status":"understood","language":"tw",...}
event: turn.understood

data: {"id":"tur_01j9...","status":"replied","reply":{"text":"..."},...}
event: turn.replied`}
        </Code>
      </Section>

      <Section title="React Native (polling fallback)">
        <p>
          React Native does not ship an <IC>EventSource</IC> implementation. The{" "}
          <IC>agent.subscribe()</IC> function in <IC>src/lib/api.ts</IC> detects this and
          falls back to 1200 ms polling automatically. Both paths deliver the same turn
          summaries, the only difference is latency.
        </p>
        <Code lang="typescript">
{`// From src/lib/api.ts
const unsubscribe = agent.subscribe(sessionId, (turn) => {
  // Called on every turn update, works on both web (SSE) and React Native (polling)
  setTurns((prev) => updateOrAppend(prev, turn));
  if (turn.status === 'replied' && turn.reply?.text) {
    speakReply(turn.reply.text, turn.meaning?.language);
  }
});

// Call this on unmount
return () => unsubscribe();`}
        </Code>
        <Callout variant="info">
          On Expo Web (browser), the real <IC>EventSource</IC> is used and updates arrive within
          milliseconds. On Expo Go (phone), polling fires every 1200 ms. Both are correct
          behaviour, design your UI to handle either latency.
        </Callout>
      </Section>
    </DocPage>
  );
}

import { DocPage, Section, Code, Table, IC } from "../DocProse";

export default function ContextCoverage() {
  return (
    <DocPage
      title="Coverage Map"
      description="Which languages and regions have context coverage."
      prev={{ label: "Resolve a Reference", to: "/docs/context-resolve" }}
      next={{ label: "Voice Agent Overview", to: "/docs/agent-overview" }}
    >
      <Section title="Endpoint">
        <Code lang="text">{`GET /v1/context/coverage`}</Code>
        <p>No request body. Returns what is actually installed, not what Adara targets globally.</p>
      </Section>

      <Section title="Current packs">
        <Table
          headers={["Language", "Code", "Region", "Status"]}
          rows={[
            ["Twi", "tw", "GH", "Live, provisional"],
            ["Nigerian Pidgin", "pcm", "NG", "Live, provisional"],
            ["Swahili", "sw", "KE / TZ", "Live, provisional"],
            ["Yoruba", "yo", "NG", "Live, provisional"],
          ]}
        />
        <p>
          All packs are <IC>provisional: true</IC>, not yet reviewed by a native speaker. More
          packs are in preparation; watch the changelog.
        </p>
      </Section>

      <Section title="Response shape">
        <Code lang="json">
{`{
  "coverage": {
    "tw": { "region": "GH", "provisional": true, "entries": 847 },
    "pcm": { "region": "NG", "provisional": true, "entries": 612 },
    "sw":  { "region": "KE", "provisional": true, "entries": 731 },
    "yo":  { "region": "NG", "provisional": true, "entries": 524 }
  }
}`}
        </Code>
      </Section>

      <Section title="Using coverage in your app">
        <p>
          The voice-agent fetches coverage at startup and uses it to decide which languages it
          actively suggests to the user. Your app can do the same, if <IC>tw</IC> is not in the
          coverage map, do not show Twi as an option in your language picker.
        </p>
      </Section>
    </DocPage>
  );
}

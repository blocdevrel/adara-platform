import { DocPage, Section, Code, Table, Callout, IC } from "../DocProse";

export default function UnderstandText() {
  return (
    <DocPage
      title="Understand Text"
      description="Send a text utterance and receive language, concepts, and local context."
      prev={{ label: "Understand Overview", to: "/docs/understand-overview" }}
      next={{ label: "Understand Audio", to: "/docs/understand-audio" }}
    >
      <Section title="Endpoint">
        <Code lang="text">{`POST /v1/understand`}</Code>
        <Table
          headers={["Field", "Type", "Required", "Description"]}
          rows={[
            ["text", "string", "Yes", "The utterance to understand."],
            ["locale", "string", "No", "BCP-47 locale (e.g. GH, NG, KE). Narrows context resolution to the right regional packs."],
            ["language", "string", "No", "ISO 639-3 override (e.g. tw, pcm). If absent, Adara detects it."],
          ]}
        />
      </Section>

      <Section title="Example, Nigerian Pidgin">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/understand \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "NEPA don take light, I go find POS agent", "locale": "NG"}'`}
        </Code>
        <Code lang="json">
{`{
  "language": "pcm",
  "concepts": ["electricity_utility", "agent_banking"],
  "provisional": true,
  "status": "ok",
  "context": {
    "matches": [
      {
        "term": "NEPA",
        "concept": "electricity_utility",
        "gloss": "Nigeria's national electricity utility (legacy name still in everyday use)",
        "confidence": 0.96,
        "region": "NG"
      },
      {
        "term": "POS agent",
        "concept": "agent_banking",
        "gloss": "Point-of-sale agent providing cash-in, cash-out banking services",
        "confidence": 0.91,
        "region": "NG"
      }
    ],
    "gaps": []
  }
}`}
        </Code>
      </Section>

      <Section title="Example, Twi (Ghana)">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/understand \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Mepa wo kyɛw, momo no anka mpo", "locale": "GH"}'`}
        </Code>
      </Section>

      <Section title="Python SDK">
        <Code lang="python">
{`meaning = client.understand("NEPA don take light", locale="NG")

print(meaning.language)    # "pcm"
print(meaning.concepts)    # ["electricity_utility", "agent_banking"]

for w in meaning.warnings():
    print("Adara:", w)     # log these, do not drop them

# Route on stable concept IDs, not gloss text
if "electricity_utility" in meaning.concepts:
    show_power_status_card()`}
        </Code>
      </Section>

      <Section title="JavaScript SDK">
        <Code lang="javascript">
{`import { warnings } from '@adara/sdk';

const meaning = await client.understand('NEPA don take light', { locale: 'NG' });
warnings(meaning).forEach((w) => console.warn('adara:', w));

if (meaning.concepts.includes('electricity_utility')) {
  showPowerStatusCard();
}`}
        </Code>
      </Section>

      <Section title="Handling interface_only">
        <Callout variant="info">
          If <IC>status</IC> is <IC>interface_only</IC>, only the heuristic language detector ran , 
          no backend was registered. You still get a <IC>language</IC> field but no resolved
          concepts. Show a badge to your users, not an error.
        </Callout>
      </Section>
    </DocPage>
  );
}

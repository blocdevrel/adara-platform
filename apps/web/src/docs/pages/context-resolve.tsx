import { DocPage, Section, Code, Table, Callout, IC } from "../DocProse";

export default function ContextResolve() {
  return (
    <DocPage
      title="Resolve a Reference"
      description="What does a local term mean? Momo, NEPA, trotro, okada, resolved with provenance."
      prev={{ label: "Code-switch Segments", to: "/docs/language-codeswitch" }}
      next={{ label: "Coverage Map", to: "/docs/context-coverage" }}
    >
      <Section title="Endpoints">
        <Code lang="text">
{`POST /v1/context/resolve
POST /v1/context/query   ← alias, accepts a natural-language question`}
        </Code>
        <Table
          headers={["Field", "Type", "Required", "Description"]}
          rows={[
            ["text", "string", "Yes", "The term or phrase to resolve."],
            ["locale", "string", "No", "Region code (e.g. GH, NG), selects the right regional pack."],
            ["language", "string", "No", "ISO 639-3 code override."],
          ]}
        />
      </Section>

      <Section title="Example, momo (Ghana)">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/context/resolve \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "momo", "locale": "GH"}'`}
        </Code>
        <Code lang="json">
{`{
  "term": "momo",
  "concept": "mobile_money",
  "category": "finance",
  "gloss": "Mobile money transfer service (MoMo, MTN brand name, widely used as a generic term in Ghana)",
  "confidence": 0.97,
  "region": "GH",
  "provisional": true,
  "surface_form": "momo"
}`}
        </Code>
      </Section>

      <Section title="Example, trotro (Ghana)">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/context/resolve \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "trotro", "locale": "GH"}'`}
        </Code>
        <Code lang="json">
{`{
  "term": "trotro",
  "concept": "shared_minibus",
  "category": "transport",
  "gloss": "Shared minibus taxi, the dominant informal public transport in Ghana",
  "confidence": 0.99,
  "region": "GH",
  "provisional": true
}`}
        </Code>
      </Section>

      <Section title="Python SDK">
        <Code lang="python">
{`match = client.context.resolve("trotro", locale="GH")
print(match.concept)      # "shared_minibus"
print(match.gloss)        # "Shared minibus taxi..."
print(match.provisional)  # True`}
        </Code>
      </Section>

      <Section title="Query alias">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/context/query \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "what is a keke?", "locale": "NG"}'`}
        </Code>
        <Callout variant="info">
          <IC>/v1/context/query</IC> is an alias for <IC>/v1/context/resolve</IC> that accepts
          natural-language questions. The same resolution logic runs.
        </Callout>
      </Section>
    </DocPage>
  );
}

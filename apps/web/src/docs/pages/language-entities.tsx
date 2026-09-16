import { DocPage, Section, Code, Table, IC } from "../DocProse";

export default function LanguageEntities() {
  return (
    <DocPage
      title="Named Entities (NER)"
      description="Extract typed spans from text, people, places, organisations, monetary amounts, phone numbers."
      prev={{ label: "Language Detection", to: "/docs/language-detect" }}
      next={{ label: "Code-switch Segments", to: "/docs/language-codeswitch" }}
    >
      <Section title="Endpoint">
        <Code lang="text">{`POST /v1/language/entities`}</Code>
        <Table
          headers={["Field", "Type", "Required", "Description"]}
          rows={[
            ["text", "string", "Yes", "Text to extract entities from."],
            ["language", "string", "No", "ISO 639-3 code. If absent, detected automatically."],
          ]}
        />
      </Section>

      <Section title="Entity types">
        <Table
          headers={["Type", "Examples"]}
          rows={[
            ["PERSON", "Ama, Emeka, Kofi"],
            ["ORG", "MTN, GTBank, NEPA, NNPC"],
            ["GPE", "Lagos, Accra, Nairobi"],
            ["MONEY", "GH₵50, ₦2000, KSh 100"],
            ["PHONE", "+233241234567"],
            ["PRODUCT", "MoMo, Mpesa, OPay"],
          ]}
        />
      </Section>

      <Section title="Example">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/language/entities \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Kofi sent GH₵50 via MoMo to Ama in Accra"}'`}
        </Code>
        <Code lang="json">
{`{
  "entities": [
    { "text": "Kofi",  "type": "PERSON", "start": 0,  "end": 4  },
    { "text": "GH₵50", "type": "MONEY",  "start": 10, "end": 15 },
    { "text": "MoMo",  "type": "PRODUCT","start": 20, "end": 24 },
    { "text": "Ama",   "type": "PERSON", "start": 28, "end": 31 },
    { "text": "Accra", "type": "GPE",    "start": 35, "end": 40 }
  ],
  "language": "en"
}`}
        </Code>
      </Section>
    </DocPage>
  );
}

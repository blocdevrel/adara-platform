import { DocPage, Section, Code, Table, Callout, IC } from "../DocProse";

export default function LanguageDetect() {
  return (
    <DocPage
      title="Language Detection"
      description="Identify which language (or mix) a text is written in."
      prev={{ label: "TTS Streaming", to: "/docs/tts-streaming" }}
      next={{ label: "Named Entities (NER)", to: "/docs/language-entities" }}
    >
      <Section title="Endpoint">
        <Code lang="text">{`POST /v1/language/detect`}</Code>
        <Table
          headers={["Field", "Type", "Required", "Description"]}
          rows={[
            ["text", "string", "Yes", "The text to identify."],
            ["locale", "string", "No", "Region hint to bias detection (e.g. GH, NG)."],
          ]}
        />
      </Section>

      <Section title="Example">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/language/detect \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Wahala dey but e no serious", "locale": "NG"}'`}
        </Code>
        <Code lang="json">
{`{
  "code": "pcm",
  "confidence": 0.91,
  "abstained": false,
  "candidates": [
    { "code": "pcm", "confidence": 0.91 },
    { "code": "en",  "confidence": 0.23 }
  ]
}`}
        </Code>
        <Callout variant="info">
          When <IC>abstained: true</IC>, no language scored above the confidence threshold. This
          is an honest answer, do not treat it as an error. The session language (if settled) is
          a better signal.
        </Callout>
      </Section>

      <Section title="Python SDK">
        <Code lang="python">
{`result = client.language.detect("Wahala dey but e no serious")
print(result.code)          # "pcm"
print(result.confidence)    # 0.91
print(result.abstained)     # False`}
        </Code>
      </Section>
    </DocPage>
  );
}

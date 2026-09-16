import { DocPage, Section, Code, Table, IC } from "../DocProse";

export default function LanguagesCatalog() {
  return (
    <DocPage
      title="Languages Catalog"
      description="GET /v1/languages — what Adara targets and what is actually installed."
      prev={{ label: "Health Check", to: "/docs/health" }}
      next={{ label: "Models Catalog", to: "/docs/models-catalog" }}
    >
      <Section title="Endpoint">
        <Code lang="text">{`GET /v1/languages?capability=transcribe`}</Code>
        <Table
          headers={["Query param", "Description"]}
          rows={[
            ["capability", "Filter by capability: transcribe, synthesize, detect_language, extract_entities, resolve_context"],
          ]}
        />
      </Section>

      <Section title="Response">
        <Code lang="json">
{`{
  "data": [
    {
      "code": "tw",
      "name": "Twi",
      "endonym": "Twi",
      "status": "beta",
      "asr_quality": 0.78,
      "tts_quality": 0.71,
      "capabilities": {
        "transcribe": true,
        "synthesize": true,
        "detect_language": true,
        "resolve_context": true,
        "extract_entities": false
      }
    }
  ],
  "caveat": "Language ID cannot name a language it was never trained on..."
}`}
        </Code>
      </Section>

      <Section title="Quality fields">
        <Table
          headers={["Field", "Meaning"]}
          rows={[
            ["asr_quality", "Word Error Rate (WER) on held-out community audio. Lower is better. Null = not yet measured."],
            ["tts_quality", "UTMOS automated MOS score. Higher is better. Null = not yet measured."],
            ["status", "planned / experimental / research / beta / production"],
          ]}
        />
        <p>
          A language with <IC>status: beta</IC> and a measured quality score is usable in
          production for lower-stakes applications. Verify quality on your own sample audio before
          committing to it.
        </p>
      </Section>
    </DocPage>
  );
}

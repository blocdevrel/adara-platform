import { DocPage, Section, Code, Callout, Table, DocCard, IC } from "../DocProse";

export default function UnderstandOverview() {
  return (
    <DocPage
      title="Understand — Overview"
      description="One call that composes speech, language detection, NER, and local context into a single Meaning object."
      prev={{ label: "Errors & Retries", to: "/docs/errors" }}
      next={{ label: "Understand Text", to: "/docs/understand-text" }}
    >
      <Section title="What Understand does">
        <p>
          <IC>POST /v1/understand</IC> is Adara's primary endpoint. It accepts text or audio and
          returns a composed <em>Meaning</em> object — language, entities, concepts, and local
          context — in a single round-trip.
        </p>
        <p>
          This is the endpoint that differentiates Adara from a plain transcription service. You
          do not need to call language detection, then NER, then context separately. One call
          handles the pipeline.
        </p>
      </Section>

      <Section title="What is in a Meaning">
        <Table
          headers={["Field", "What it tells you"]}
          rows={[
            ["language", "Detected language code — tw, pcm, sw, en, etc."],
            ["concepts", "Stable IDs for what was referred to: mobile_money, electricity_utility, shared_minibus. Route on these, not on raw text."],
            ["entities", "Typed spans: people, places, organisations, monetary amounts, phone numbers."],
            ["context.matches", "Local references resolved with gloss, category, confidence, and provenance."],
            ["context.gaps", "Terms the context engine saw but could not resolve — useful for coverage analysis."],
            ["provisional", "true = knowledge was assembled from secondary sources; surface this to users."],
            ["status", "ok / interface_only / partial — tells you exactly what ran."],
            ["warnings", "Caveats: detector disagreement, region mismatch, sensitive terms. Never drop these."],
          ]}
        />
      </Section>

      <Section title="Quick example">
        <Code lang="bash">
{`curl -s https://api.adara.ai/v1/understand \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "chale the momo no enter since yesterday", "locale": "GH"}'`}
        </Code>
        <Code lang="json">
{`{
  "language": "tw",
  "concepts": ["familiar_address", "mobile_money"],
  "provisional": true,
  "status": "ok",
  "context": {
    "matches": [
      {
        "term": "chale",
        "concept": "familiar_address",
        "gloss": "Informal address between friends (Ghanaian English / Twi slang)",
        "confidence": 0.93
      },
      {
        "term": "momo",
        "concept": "mobile_money",
        "gloss": "Mobile money transfer (MoMo — MTN brand name in Ghana)",
        "confidence": 0.97
      }
    ],
    "gaps": []
  }
}`}
        </Code>
        <Callout variant="info">
          Route on <IC>concepts</IC> (stable IDs), not on the gloss text. Glosses are for display
          and may change as knowledge packs are reviewed.
        </Callout>
      </Section>

      <Section title="Next steps">
        <div className="grid gap-3 sm:grid-cols-2">
          <DocCard
            to="/docs/understand-text"
            title="Understand Text"
            description="Full reference for understanding a text utterance."
          />
          <DocCard
            to="/docs/understand-audio"
            title="Understand Audio"
            description="Transcribe + understand in one call — sends audio, gets Meaning."
          />
          <DocCard
            to="/docs/provisional"
            title="Provisional & Warnings"
            description="What provisional means and how to surface it to users."
          />
        </div>
      </Section>
    </DocPage>
  );
}
